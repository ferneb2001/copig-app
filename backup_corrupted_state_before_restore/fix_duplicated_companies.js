/**
 * CORRECCIÓN DE EMPRESAS DUPLICADAS
 * Eliminar empresas duplicadas importadas, manteniendo las originales con representantes
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixDuplicatedCompanies() {
    try {
        console.log('🔧 CORRECCIÓN DE EMPRESAS DUPLICADAS');
        console.log('🎯 Eliminar duplicados manteniendo originales con representantes');
        console.log('='.repeat(70));

        // Primero, analizar todas las empresas duplicadas
        console.log('\n1️⃣ IDENTIFICANDO EMPRESAS DUPLICADAS...');
        
        const duplicados = await pool.query(`
            SELECT 
                razon_social,
                array_agg(id ORDER BY id) as ids,
                array_agg(fecha_creacion ORDER BY id) as fechas
            FROM copig.empresas 
            GROUP BY razon_social 
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC
        `);

        console.log(`   Empresas con duplicados: ${duplicados.rows.length}`);

        let empresasEliminadas = 0;
        let representantesTransferidos = 0;

        console.log('\n2️⃣ PROCESANDO DUPLICADOS...');

        for (let dup of duplicados.rows) {
            const ids = dup.ids;
            const nombreEmpresa = dup.razon_social;
            
            console.log(`\n   📋 ${nombreEmpresa}`);
            console.log(`      IDs: ${ids.join(', ')}`);

            // Verificar cuál tiene representantes técnicos
            const conRepresentantes = await pool.query(`
                SELECT empresa_id, COUNT(*) as total_rep
                FROM copig.representantes_tecnicos 
                WHERE empresa_id = ANY($1)
                GROUP BY empresa_id
                ORDER BY COUNT(*) DESC
            `, [ids]);

            let idAMantener;
            let idsAEliminar;

            if (conRepresentantes.rows.length > 0) {
                // Mantener la que tiene más representantes
                idAMantener = conRepresentantes.rows[0].empresa_id;
                idsAEliminar = ids.filter(id => id !== idAMantener);
                console.log(`      ✅ Mantener ID ${idAMantener} (${conRepresentantes.rows[0].total_rep} representantes)`);
            } else {
                // Si ninguna tiene representantes, mantener la más antigua (ID menor)
                idAMantener = Math.min(...ids);
                idsAEliminar = ids.filter(id => id !== idAMantener);
                console.log(`      ✅ Mantener ID ${idAMantener} (más antigua)`);
            }

            // Transferir representantes de las que se van a eliminar (si los hay)
            for (let idAEliminar of idsAEliminar) {
                const repResult = await pool.query(`
                    SELECT COUNT(*) as total 
                    FROM copig.representantes_tecnicos 
                    WHERE empresa_id = $1
                `, [idAEliminar]);

                if (repResult.rows[0].total > 0) {
                    console.log(`      🔄 Transfiriendo ${repResult.rows[0].total} representantes de ID ${idAEliminar} → ID ${idAMantener}`);
                    
                    await pool.query(`
                        UPDATE copig.representantes_tecnicos 
                        SET empresa_id = $1 
                        WHERE empresa_id = $2
                    `, [idAMantener, idAEliminar]);
                    
                    representantesTransferidos += parseInt(repResult.rows[0].total);
                }

                // Eliminar empresa duplicada
                await pool.query('DELETE FROM copig.empresas WHERE id = $1', [idAEliminar]);
                empresasEliminadas++;
                console.log(`      ❌ Eliminada empresa ID ${idAEliminar}`);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('📊 RESUMEN DE LIMPIEZA:');
        console.log(`   🗑️  Empresas eliminadas: ${empresasEliminadas}`);
        console.log(`   🔄 Representantes transferidos: ${representantesTransferidos}`);

        // Verificar estado final de IMPSA
        console.log('\n🔍 VERIFICACIÓN FINAL DE IMPSA:');
        const impsa = await pool.query(`
            SELECT 
                e.id,
                e.razon_social,
                COUNT(rt.id) as representantes
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            WHERE e.razon_social ILIKE '%IMPSA%'
            GROUP BY e.id, e.razon_social
        `);

        impsa.rows.forEach(emp => {
            console.log(`   ✅ ID ${emp.id}: ${emp.representantes} representantes`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixDuplicatedCompanies().then(() => {
    console.log('\n🎉 LIMPIEZA COMPLETADA!');
    console.log('💡 Reinicia el servidor y verifica que IMPSA tenga sus representantes');
}).catch(error => {
    console.error('💥 Error en limpieza:', error.message);
});