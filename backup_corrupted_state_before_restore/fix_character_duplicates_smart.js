/**
 * LIMPIEZA INTELIGENTE DE DUPLICADOS POR CARACTERES ESPECIALES
 * Resolver duplicados como "DISEÑO" vs "DISE�O" manteniendo el mejor registro
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixCharacterDuplicates() {
    try {
        console.log('🧹 LIMPIEZA INTELIGENTE DE DUPLICADOS POR CARACTERES');
        console.log('🎯 Resolver ñ→�, á→�, é→�, etc. manteniendo el mejor registro');
        console.log('='.repeat(70));

        // 1. Encontrar duplicados por CUIT (más confiable que nombre)
        console.log('\n1️⃣ IDENTIFICANDO DUPLICADOS POR CUIT:');
        const duplicadosCUIT = await pool.query(`
            SELECT 
                cuit,
                COUNT(*) as cantidad,
                array_agg(id ORDER BY id) as ids,
                array_agg(razon_social ORDER BY id) as nombres,
                array_agg(LENGTH(razon_social) - LENGTH(REPLACE(razon_social, '�', ''))) as chars_corruptos
            FROM copig.empresas 
            WHERE cuit IS NOT NULL AND cuit != ''
            GROUP BY cuit 
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC
            LIMIT 20
        `);

        console.log(`   📊 Empresas con CUIT duplicado: ${duplicadosCUIT.rows.length}`);

        if (duplicadosCUIT.rows.length === 0) {
            console.log('   ✅ No se encontraron duplicados por CUIT');
            return;
        }

        let empresasEliminadas = 0;
        let representantesTransferidos = 0;

        console.log('\n2️⃣ PROCESANDO DUPLICADOS POR CUIT:');
        
        for (let dup of duplicadosCUIT.rows) {
            console.log(`\n   📋 CUIT: ${dup.cuit} (${dup.cantidad} registros)`);
            
            // Mostrar los nombres duplicados
            for (let i = 0; i < dup.ids.length; i++) {
                const charsCorruptos = dup.chars_corruptos[i] || 0;
                console.log(`      ID ${dup.ids[i]}: "${dup.nombres[i]}" (${charsCorruptos} chars �)`);
            }

            // Determinar cuál mantener: el que tiene MENOS caracteres corruptos
            let mejorIndice = 0;
            let menorCorrupcion = dup.chars_corruptos[0] || 0;

            for (let i = 1; i < dup.chars_corruptos.length; i++) {
                const corrupcion = dup.chars_corruptos[i] || 0;
                if (corrupcion < menorCorrupcion) {
                    menorCorrupcion = corrupcion;
                    mejorIndice = i;
                }
            }

            const idMantener = dup.ids[mejorIndice];
            const idsEliminar = dup.ids.filter((id, index) => index !== mejorIndice);

            console.log(`      ✅ MANTENER: ID ${idMantener} "${dup.nombres[mejorIndice]}"`);
            console.log(`      ❌ ELIMINAR: IDs ${idsEliminar.join(', ')}`);

            // Transferir representantes técnicos antes de eliminar
            for (let idEliminar of idsEliminar) {
                const repCount = await pool.query(`
                    SELECT COUNT(*) as total 
                    FROM copig.representantes_tecnicos 
                    WHERE empresa_id = $1
                `, [idEliminar]);

                if (repCount.rows[0].total > 0) {
                    console.log(`      🔄 Transfiriendo ${repCount.rows[0].total} representantes de ID ${idEliminar} → ID ${idMantener}`);
                    
                    await pool.query(`
                        UPDATE copig.representantes_tecnicos 
                        SET empresa_id = $1 
                        WHERE empresa_id = $2
                    `, [idMantener, idEliminar]);
                    
                    representantesTransferidos += parseInt(repCount.rows[0].total);
                }

                // Eliminar empresa duplicada
                await pool.query('DELETE FROM copig.empresas WHERE id = $1', [idEliminar]);
                empresasEliminadas++;
                console.log(`      🗑️ Eliminada empresa ID ${idEliminar}`);
            }
        }

        // 3. Buscar duplicados por nombre similar (normalizado)
        console.log('\n3️⃣ BUSCANDO DUPLICADOS POR NOMBRE NORMALIZADO:');
        const duplicadosNombre = await pool.query(`
            WITH empresa_normalizada AS (
                SELECT 
                    id,
                    razon_social,
                    cuit,
                    -- Normalizar: quitar caracteres especiales, espacios extra, mayúsculas
                    UPPER(TRIM(REGEXP_REPLACE(
                        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                            razon_social, '�', 'A'), '�', 'E'), '�', 'I'), '�', 'O'), '�', 'U'), 
                        '[^A-Z0-9\\s]', '', 'g'
                    ))) as nombre_normalizado,
                    -- Contar caracteres corruptos
                    LENGTH(razon_social) - LENGTH(REPLACE(razon_social, '�', '')) as chars_corruptos
                FROM copig.empresas
                WHERE cuit IS NULL OR cuit = ''  -- Solo empresas sin CUIT (ya procesamos las con CUIT)
            )
            SELECT 
                nombre_normalizado,
                COUNT(*) as cantidad,
                array_agg(id ORDER BY chars_corruptos, id) as ids,
                array_agg(razon_social ORDER BY chars_corruptos, id) as nombres,
                array_agg(chars_corruptos ORDER BY chars_corruptos, id) as corrupciones
            FROM empresa_normalizada
            GROUP BY nombre_normalizado
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC
            LIMIT 15
        `);

        console.log(`   📊 Grupos de nombres duplicados: ${duplicadosNombre.rows.length}`);

        for (let dup of duplicadosNombre.rows) {
            console.log(`\n   📋 "${dup.nombre_normalizado}" (${dup.cantidad} registros)`);
            
            // Mostrar variantes
            for (let i = 0; i < dup.ids.length; i++) {
                console.log(`      ID ${dup.ids[i]}: "${dup.nombres[i]}" (${dup.corrupciones[i]} chars �)`);
            }

            // Mantener el primero (menos corrupción por ORDER BY)
            const idMantener = dup.ids[0];
            const idsEliminar = dup.ids.slice(1);

            console.log(`      ✅ MANTENER: ID ${idMantener}`);
            console.log(`      ❌ ELIMINAR: IDs ${idsEliminar.join(', ')}`);

            // Transferir representantes y eliminar
            for (let idEliminar of idsEliminar) {
                const repCount = await pool.query(`
                    SELECT COUNT(*) as total 
                    FROM copig.representantes_tecnicos 
                    WHERE empresa_id = $1
                `, [idEliminar]);

                if (repCount.rows[0].total > 0) {
                    await pool.query(`
                        UPDATE copig.representantes_tecnicos 
                        SET empresa_id = $1 
                        WHERE empresa_id = $2
                    `, [idMantener, idEliminar]);
                    
                    representantesTransferidos += parseInt(repCount.rows[0].total);
                }

                await pool.query('DELETE FROM copig.empresas WHERE id = $1', [idEliminar]);
                empresasEliminadas++;
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 RESUMEN DE LIMPIEZA INTELIGENTE:');
        console.log(`   🗑️ Empresas duplicadas eliminadas: ${empresasEliminadas}`);
        console.log(`   🔄 Representantes transferidos: ${representantesTransferidos}`);
        console.log(`   ✅ Empresas finales: ${await getTotalEmpresas()}`);

        // 4. Verificación final
        console.log('\n4️⃣ VERIFICACIÓN POST-LIMPIEZA:');
        const dupFinales = await pool.query(`
            SELECT COUNT(*) as total
            FROM (
                SELECT cuit, COUNT(*) 
                FROM copig.empresas 
                WHERE cuit IS NOT NULL AND cuit != ''
                GROUP BY cuit 
                HAVING COUNT(*) > 1
            ) as dups
        `);
        
        console.log(`   📊 Duplicados por CUIT restantes: ${dupFinales.rows[0].total}`);
        console.log('='.repeat(70));

        return {
            empresasEliminadas,
            representantesTransferidos
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

async function getTotalEmpresas() {
    const result = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
    return result.rows[0].total;
}

fixCharacterDuplicates();