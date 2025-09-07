/**
 * LIMPIEZA COMPLETA DE TODOS LOS DUPLICADOS RESTANTES
 * Procesar TODOS los duplicados por CUIT sin límite
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixAllRemainingDuplicates() {
    try {
        console.log('🧹 LIMPIEZA COMPLETA - TODOS LOS DUPLICADOS RESTANTES');
        console.log('🎯 Procesar TODOS los duplicados por CUIT');
        console.log('='.repeat(60));

        // Obtener TODOS los duplicados por CUIT sin límite
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
        `);

        console.log(`📊 Total duplicados por CUIT: ${duplicadosCUIT.rows.length}`);

        if (duplicadosCUIT.rows.length === 0) {
            console.log('✅ No hay duplicados por CUIT restantes');
            await pool.end();
            return;
        }

        let empresasEliminadas = 0;
        let representantesTransferidos = 0;
        
        for (let dup of duplicadosCUIT.rows) {
            // Mostrar progreso cada 10 procesados
            if (empresasEliminadas > 0 && empresasEliminadas % 10 === 0) {
                console.log(`📈 Progreso: ${empresasEliminadas} empresas procesadas...`);
            }

            // Determinar cuál mantener: menos caracteres corruptos
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

            // Transferir representantes antes de eliminar
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

                // Eliminar empresa duplicada
                await pool.query('DELETE FROM copig.empresas WHERE id = $1', [idEliminar]);
                empresasEliminadas++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 LIMPIEZA COMPLETA FINALIZADA:');
        console.log(`   🗑️ Total empresas eliminadas: ${empresasEliminadas}`);
        console.log(`   🔄 Representantes transferidos: ${representantesTransferidos}`);

        // Verificación final
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

        const totalEmpresas = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
        
        console.log(`   📊 Empresas finales: ${totalEmpresas.rows[0].total}`);
        console.log(`   ✅ Duplicados CUIT restantes: ${dupFinales.rows[0].total}`);
        
        if (dupFinales.rows[0].total == 0) {
            console.log('   🎉 ¡TODOS LOS DUPLICADOS POR CUIT ELIMINADOS!');
        }
        
        console.log('='.repeat(60));

        return {
            empresasEliminadas,
            representantesTransferidos,
            duplicadosRestantes: dupFinales.rows[0].total
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixAllRemainingDuplicates();