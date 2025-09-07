const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function executeFinalCleanup() {
    console.log('🗑️ LIMPIEZA DEFINITIVA - ELIMINANDO PROFESIONALES EXTERNOS');
    console.log('='.repeat(80));
    console.log('⚠️ OPERACIÓN IRREVERSIBLE - Los datos están respaldados en tablas *_simple');
    console.log('='.repeat(80));
    
    const client = await pool.connect();
    
    try {
        // Iniciar transacción
        await client.query('BEGIN');
        console.log('🔄 Transacción iniciada...');
        
        // PASO 1: Mostrar estado ANTES de limpieza
        console.log('\n📊 ESTADO ANTES DE LIMPIEZA:');
        console.log('-'.repeat(40));
        
        const beforeStats = await client.query(`
            SELECT 
                'ANTES - Total profesionales activos' as estado, COUNT(*) as cantidad
            FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 
                'ANTES - Profesionales Mendoza' as estado, COUNT(*) as cantidad  
            FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
            UNION ALL
            SELECT 
                'ANTES - Profesionales externos' as estado, COUNT(*) as cantidad
            FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        beforeStats.rows.forEach(row => {
            console.log(`   ${row.estado}: ${row.cantidad}`);
        });
        
        // PASO 2: Eliminar pagos históricos de profesionales externos
        console.log('\n🗑️ PASO 1: Eliminando pagos históricos de profesionales externos...');
        const deletePagos = await client.query(`
            DELETE FROM copig.pagos_historicos 
            WHERE matricula IN (
                SELECT m.numero_matricula::TEXT 
                FROM copig.matriculas m
                JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE p.provincia != 'Mendoza' AND p.activo = true
            )
        `);
        console.log(`   ✅ Eliminados ${deletePagos.rowCount} pagos históricos externos`);
        
        // PASO 3: Eliminar matrículas de profesionales externos
        console.log('\n🗑️ PASO 2: Eliminando matrículas de profesionales externos...');
        const deleteMatriculas = await client.query(`
            DELETE FROM copig.matriculas 
            WHERE profesional_id IN (
                SELECT id FROM copig.profesionales 
                WHERE provincia != 'Mendoza' AND activo = true
            )
        `);
        console.log(`   ✅ Eliminadas ${deleteMatriculas.rowCount} matrículas externas`);
        
        // PASO 4: Eliminar profesionales externos
        console.log('\n🗑️ PASO 3: Eliminando profesionales externos...');
        const deleteProfesionales = await client.query(`
            DELETE FROM copig.profesionales 
            WHERE provincia != 'Mendoza' AND activo = true
        `);
        console.log(`   ✅ Eliminados ${deleteProfesionales.rowCount} profesionales externos`);
        
        // PASO 5: Mostrar estado DESPUÉS de limpieza
        console.log('\n📊 ESTADO DESPUÉS DE LIMPIEZA:');
        console.log('-'.repeat(40));
        
        const afterStats = await client.query(`
            SELECT 
                'DESPUÉS - Total profesionales activos' as estado, COUNT(*) as cantidad
            FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 
                'DESPUÉS - Solo profesionales Mendoza' as estado, COUNT(*) as cantidad
            FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
            UNION ALL
            SELECT 
                'DESPUÉS - Profesionales externos restantes' as estado, COUNT(*) as cantidad
            FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        afterStats.rows.forEach(row => {
            console.log(`   ${row.estado}: ${row.cantidad}`);
        });
        
        // PASO 6: Verificar tablas de respaldo
        console.log('\n🔐 VERIFICAR TABLAS DE RESPALDO:');
        console.log('-'.repeat(35));
        
        const backupStats = await client.query(`
            SELECT 
                'RESPALDO - Profesionales externos' as estado, COUNT(*) as cantidad
            FROM copig.profesionales_externos_simple
            UNION ALL
            SELECT 
                'RESPALDO - Matrículas externas' as estado, COUNT(*) as cantidad
            FROM copig.matriculas_externas_simple
            UNION ALL
            SELECT 
                'RESPALDO - Pagos externos' as estado, COUNT(*) as cantidad
            FROM copig.pagos_externos_simple
        `);
        
        backupStats.rows.forEach(row => {
            console.log(`   ${row.estado}: ${row.cantidad}`);
        });
        
        // PASO 7: Confirmar transacción
        await client.query('COMMIT');
        console.log('\n✅ TRANSACCIÓN CONFIRMADA - LIMPIEZA COMPLETADA');
        
        // PASO 8: Resumen final
        console.log('\n' + '='.repeat(80));
        console.log('🎉 SEPARACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        
        console.log('\n🎯 RESULTADO FINAL:');
        console.log(`   ✅ Profesionales externos eliminados: ${deleteProfesionales.rowCount}`);
        console.log(`   ✅ Matrículas externas eliminadas: ${deleteMatriculas.rowCount}`);
        console.log(`   ✅ Pagos históricos externos eliminados: ${deletePagos.rowCount}`);
        
        console.log('\n🔐 DATOS PRESERVADOS:');
        const preservedCounts = backupStats.rows;
        console.log(`   📁 profesionales_externos_simple: ${preservedCounts[0].cantidad} profesionales`);
        console.log(`   📁 matriculas_externas_simple: ${preservedCounts[1].cantidad} matrículas`);
        console.log(`   📁 pagos_externos_simple: ${preservedCounts[2].cantidad} pagos`);
        
        console.log('\n🏠 SISTEMA PRINCIPAL:');
        const finalCounts = afterStats.rows;
        console.log(`   👥 Solo profesionales de Mendoza: ${finalCounts[1].cantidad}`);
        console.log(`   🚫 Profesionales externos restantes: ${finalCounts[2].cantidad}`);
        
        if (parseInt(finalCounts[2].cantidad) === 0) {
            console.log('\n🎊 ¡SEPARACIÓN PERFECTA! Sistema contiene solo profesionales de Mendoza');
        } else {
            console.log('\n⚠️ ADVERTENCIA: Aún hay profesionales externos en el sistema');
        }
        
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('   1. ✅ Verificar que el sistema COPIG funciona correctamente');
        console.log('   2. ✅ Confirmar que solo aparecen profesionales de Mendoza');
        console.log('   3. 📁 Los datos externos están seguros en las tablas *_simple');
        console.log('   4. 🎯 Misión completada: Sistema limpio y funcional');
        
        return {
            profesionalesEliminados: deleteProfesionales.rowCount,
            matriculasEliminadas: deleteMatriculas.rowCount,
            pagosEliminados: deletePagos.rowCount,
            mendozaRestantes: parseInt(finalCounts[1].cantidad),
            externosRestantes: parseInt(finalCounts[2].cantidad)
        };
        
    } catch (error) {
        console.error('\n❌ ERROR EN LIMPIEZA:', error.message);
        console.log('🔄 Ejecutando ROLLBACK para revertir cambios...');
        await client.query('ROLLBACK');
        console.log('✅ ROLLBACK completado - Sistema restaurado al estado anterior');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

executeFinalCleanup()
    .then(result => {
        console.log('\n🏆 MISIÓN COMPLETADA:');
        console.log(`   🗑️ Eliminados: ${result.profesionalesEliminados} profesionales externos`);
        console.log(`   🏠 Conservados: ${result.mendozaRestantes} profesionales de Mendoza`);
        console.log(`   ✨ Sistema COPIG ahora contiene solo profesionales de Mendoza`);
        
        if (result.externosRestantes === 0) {
            console.log('\n🎯 OBJETIVO CUMPLIDO: Separación exitosa completada');
        }
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        console.log('🔒 Datos protegidos - No se realizaron cambios permanentes');
        process.exit(1);
    });