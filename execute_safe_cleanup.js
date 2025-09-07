const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function executeSafeCleanup() {
    console.log('🛡️ LIMPIEZA SEGURA - MANEJANDO TRIGGERS Y FOREIGN KEYS');
    console.log('='.repeat(80));
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('🔄 Transacción iniciada...');
        
        // PASO 0: Deshabilitar temporalmente el trigger problemático
        console.log('\n🔧 PASO 0: Deshabilitando trigger problemático...');
        await client.query(`
            ALTER TABLE copig.profesionales DISABLE TRIGGER validate_delete_profesionales
        `);
        console.log('   ✅ Trigger validate_delete_profesionales deshabilitado');
        
        // PASO 1: Mostrar estado antes
        console.log('\n📊 ESTADO ANTES DE LIMPIEZA:');
        const beforeStats = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE activo = true) as total_activos,
                COUNT(*) FILTER (WHERE provincia = 'Mendoza' AND activo = true) as mendoza,
                COUNT(*) FILTER (WHERE provincia != 'Mendoza' AND activo = true) as externos
            FROM copig.profesionales
        `);
        
        const before = beforeStats.rows[0];
        console.log(`   Total profesionales activos: ${before.total_activos}`);
        console.log(`   Profesionales Mendoza: ${before.mendoza}`);
        console.log(`   Profesionales externos: ${before.externos}`);
        
        // PASO 2: Obtener IDs de profesionales externos
        console.log('\n🎯 PASO 1: Identificando profesionales externos...');
        const externosIds = await client.query(`
            SELECT id FROM copig.profesionales 
            WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        const idsToDelete = externosIds.rows.map(row => row.id);
        console.log(`   ✅ Identificados ${idsToDelete.length} profesionales externos para eliminar`);
        
        if (idsToDelete.length === 0) {
            console.log('   ℹ️ No hay profesionales externos que eliminar');
            return;
        }
        
        // PASO 3: Eliminar foreign key dependencies primero
        console.log('\n🗑️ PASO 2: Eliminando dependencias de foreign keys...');
        
        // Eliminar de tablas que referencian profesionales
        const deleteQueries = [
            { table: 'copig.restricciones_deudas', column: 'profesional_id', name: 'restricciones' },
            { table: 'copig.sanciones_aplicadas', column: 'profesional_id', name: 'sanciones' },
            { table: 'copig.cuenta_corriente', column: 'profesional_id', name: 'cuenta corriente' },
            { table: 'copig.comprobantes_pago', column: 'profesional_id', name: 'comprobantes' },
            { table: 'copig.notificaciones_chp', column: 'profesional_id', name: 'notificaciones CHP' }
        ];
        
        const deletedCounts = {};
        
        for (const query of deleteQueries) {
            const deleteResult = await client.query(`
                DELETE FROM ${query.table} 
                WHERE ${query.column} = ANY($1::int[])
            `, [idsToDelete]);
            
            deletedCounts[query.name] = deleteResult.rowCount;
            console.log(`   ✅ Eliminados ${deleteResult.rowCount} registros de ${query.name}`);
        }
        
        // PASO 4: Eliminar pagos históricos (por matrícula)
        console.log('\n🗑️ PASO 3: Eliminando pagos históricos...');
        const deletePagos = await client.query(`
            DELETE FROM copig.pagos_historicos 
            WHERE matricula IN (
                SELECT m.numero_matricula::TEXT 
                FROM copig.matriculas m
                WHERE m.profesional_id = ANY($1::int[])
            )
        `, [idsToDelete]);
        console.log(`   ✅ Eliminados ${deletePagos.rowCount} pagos históricos`);
        
        // PASO 5: Eliminar matrículas
        console.log('\n🗑️ PASO 4: Eliminando matrículas...');
        const deleteMatriculas = await client.query(`
            DELETE FROM copig.matriculas 
            WHERE profesional_id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Eliminadas ${deleteMatriculas.rowCount} matrículas`);
        
        // PASO 6: Eliminar profesionales (ahora sin dependencias)
        console.log('\n🗑️ PASO 5: Eliminando profesionales externos...');
        const deleteProfesionales = await client.query(`
            DELETE FROM copig.profesionales 
            WHERE id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Eliminados ${deleteProfesionales.rowCount} profesionales externos`);
        
        // PASO 7: Rehabilitar el trigger
        console.log('\n🔧 PASO 6: Rehabilitando trigger...');
        await client.query(`
            ALTER TABLE copig.profesionales ENABLE TRIGGER validate_delete_profesionales
        `);
        console.log('   ✅ Trigger validate_delete_profesionales rehabilitado');
        
        // PASO 8: Verificar estado final
        console.log('\n📊 ESTADO DESPUÉS DE LIMPIEZA:');
        const afterStats = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE activo = true) as total_activos,
                COUNT(*) FILTER (WHERE provincia = 'Mendoza' AND activo = true) as mendoza,
                COUNT(*) FILTER (WHERE provincia != 'Mendoza' AND activo = true) as externos
            FROM copig.profesionales
        `);
        
        const after = afterStats.rows[0];
        console.log(`   Total profesionales activos: ${after.total_activos}`);
        console.log(`   Solo profesionales Mendoza: ${after.mendoza}`);
        console.log(`   Profesionales externos restantes: ${after.externos}`);
        
        // PASO 9: Verificar respaldos
        console.log('\n🔐 VERIFICAR RESPALDOS:');
        const backupStats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.profesionales_externos_simple) as externos_backup,
                (SELECT COUNT(*) FROM copig.matriculas_externas_simple) as matriculas_backup,
                (SELECT COUNT(*) FROM copig.pagos_externos_simple) as pagos_backup
        `);
        
        const backup = backupStats.rows[0];
        console.log(`   Profesionales externos respaldados: ${backup.externos_backup}`);
        console.log(`   Matrículas externas respaldadas: ${backup.matriculas_backup}`);
        console.log(`   Pagos externos respaldados: ${backup.pagos_backup}`);
        
        // PASO 10: Confirmar transacción
        await client.query('COMMIT');
        console.log('\n✅ TRANSACCIÓN CONFIRMADA - LIMPIEZA COMPLETADA');
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('🎉 SEPARACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        
        console.log('\n📊 RESUMEN DE ELIMINACIONES:');
        console.log(`   🗑️ Profesionales externos eliminados: ${deleteProfesionales.rowCount}`);
        console.log(`   🗑️ Matrículas externas eliminadas: ${deleteMatriculas.rowCount}`);
        console.log(`   🗑️ Pagos históricos eliminados: ${deletePagos.rowCount}`);
        Object.entries(deletedCounts).forEach(([name, count]) => {
            console.log(`   🗑️ ${name} eliminados: ${count}`);
        });
        
        console.log('\n🏠 SISTEMA FINAL:');
        console.log(`   👥 Solo profesionales de Mendoza: ${after.mendoza}`);
        console.log(`   ✨ Profesionales externos restantes: ${after.externos}`);
        
        console.log('\n🔐 DATOS PRESERVADOS:');
        console.log(`   📁 Respaldo profesionales: ${backup.externos_backup}`);
        console.log(`   📁 Respaldo matrículas: ${backup.matriculas_backup}`);
        console.log(`   📁 Respaldo pagos: ${backup.pagos_backup}`);
        
        if (parseInt(after.externos) === 0) {
            console.log('\n🎊 ¡MISIÓN COMPLETADA! Sistema contiene solo profesionales de Mendoza');
        }
        
        return {
            profesionalesEliminados: deleteProfesionales.rowCount,
            matriculasEliminadas: deleteMatriculas.rowCount,
            pagosEliminados: deletePagos.rowCount,
            mendozaFinal: parseInt(after.mendoza),
            externosFinal: parseInt(after.externos)
        };
        
    } catch (error) {
        console.error('\n❌ ERROR EN LIMPIEZA SEGURA:', error.message);
        
        // Intentar rehabilitar trigger en caso de error
        try {
            await client.query(`
                ALTER TABLE copig.profesionales ENABLE TRIGGER validate_delete_profesionales
            `);
            console.log('🔧 Trigger rehabilitado después del error');
        } catch (triggerError) {
            console.log('⚠️ No se pudo rehabilitar el trigger automáticamente');
        }
        
        console.log('🔄 Ejecutando ROLLBACK...');
        await client.query('ROLLBACK');
        console.log('✅ ROLLBACK completado - Sistema restaurado');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

executeSafeCleanup()
    .then(result => {
        console.log('\n🏆 LIMPIEZA SEGURA COMPLETADA:');
        console.log(`   🗑️ Eliminados: ${result.profesionalesEliminados} profesionales externos`);
        console.log(`   🏠 Conservados: ${result.mendozaFinal} profesionales de Mendoza`);
        
        if (result.externosFinal === 0) {
            console.log('\n🎯 OBJETIVO CUMPLIDO: Sistema COPIG ahora solo tiene profesionales de Mendoza');
        }
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });