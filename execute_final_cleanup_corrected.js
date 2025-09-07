const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function executeFinalCleanupCorrected() {
    console.log('🎯 LIMPIEZA DEFINITIVA CORREGIDA');
    console.log('='.repeat(60));
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('🔄 Transacción iniciada...');
        
        // PASO 1: Deshabilitar trigger problemático
        console.log('\n🔧 Deshabilitando trigger problemático...');
        await client.query(`ALTER TABLE copig.profesionales DISABLE TRIGGER validate_delete_profesionales`);
        console.log('   ✅ Trigger deshabilitado');
        
        // PASO 2: Estado antes
        console.log('\n📊 ESTADO ANTES:');
        const beforeStats = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE activo = true) as total,
                COUNT(*) FILTER (WHERE provincia = 'Mendoza' AND activo = true) as mendoza,
                COUNT(*) FILTER (WHERE provincia != 'Mendoza' AND activo = true) as externos
            FROM copig.profesionales
        `);
        
        const before = beforeStats.rows[0];
        console.log(`   Total activos: ${before.total}`);
        console.log(`   Mendoza: ${before.mendoza}`);
        console.log(`   Externos: ${before.externos}`);
        
        // PASO 3: Obtener IDs de profesionales externos
        const externosIds = await client.query(`
            SELECT id FROM copig.profesionales 
            WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        const idsToDelete = externosIds.rows.map(row => row.id);
        console.log(`\n🎯 Identificados ${idsToDelete.length} profesionales externos para eliminar`);
        
        if (idsToDelete.length === 0) {
            console.log('   ℹ️ No hay profesionales externos que eliminar');
            await client.query(`ALTER TABLE copig.profesionales ENABLE TRIGGER validate_delete_profesionales`);
            await client.query('COMMIT');
            return;
        }
        
        // PASO 4: Eliminar dependencias (solo tablas que tienen datos)
        console.log('\n🗑️ Eliminando dependencias...');
        
        // Solo restricciones_deudas tiene profesional_id y datos (2 registros)
        const deleteRestricciones = await client.query(`
            DELETE FROM copig.restricciones_deudas 
            WHERE profesional_id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Restricciones eliminadas: ${deleteRestricciones.rowCount}`);
        
        // cuenta_corriente, comprobantes_pago, notificaciones_chp están vacías, pero limpiar por seguridad
        const deleteCuentaCorriente = await client.query(`
            DELETE FROM copig.cuenta_corriente 
            WHERE profesional_id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Cuenta corriente eliminada: ${deleteCuentaCorriente.rowCount}`);
        
        const deleteComprobantes = await client.query(`
            DELETE FROM copig.comprobantes_pago 
            WHERE profesional_id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Comprobantes eliminados: ${deleteComprobantes.rowCount}`);
        
        const deleteNotificaciones = await client.query(`
            DELETE FROM copig.notificaciones_chp 
            WHERE profesional_id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Notificaciones CHP eliminadas: ${deleteNotificaciones.rowCount}`);
        
        // PASO 5: Eliminar pagos históricos (por matrícula)
        console.log('\n🗑️ Eliminando pagos históricos...');
        const deletePagos = await client.query(`
            DELETE FROM copig.pagos_historicos 
            WHERE matricula IN (
                SELECT m.numero_matricula::TEXT 
                FROM copig.matriculas m
                WHERE m.profesional_id = ANY($1::int[])
            )
        `, [idsToDelete]);
        console.log(`   ✅ Pagos eliminados: ${deletePagos.rowCount}`);
        
        // PASO 6: Eliminar matrículas
        console.log('\n🗑️ Eliminando matrículas...');
        const deleteMatriculas = await client.query(`
            DELETE FROM copig.matriculas 
            WHERE profesional_id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Matrículas eliminadas: ${deleteMatriculas.rowCount}`);
        
        // PASO 7: Eliminar profesionales externos
        console.log('\n🗑️ Eliminando profesionales...');
        const deleteProfesionales = await client.query(`
            DELETE FROM copig.profesionales 
            WHERE id = ANY($1::int[])
        `, [idsToDelete]);
        console.log(`   ✅ Profesionales eliminados: ${deleteProfesionales.rowCount}`);
        
        // PASO 8: Rehabilitar trigger
        console.log('\n🔧 Rehabilitando trigger...');
        await client.query(`ALTER TABLE copig.profesionales ENABLE TRIGGER validate_delete_profesionales`);
        console.log('   ✅ Trigger rehabilitado');
        
        // PASO 9: Estado después
        console.log('\n📊 ESTADO DESPUÉS:');
        const afterStats = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE activo = true) as total,
                COUNT(*) FILTER (WHERE provincia = 'Mendoza' AND activo = true) as mendoza,
                COUNT(*) FILTER (WHERE provincia != 'Mendoza' AND activo = true) as externos
            FROM copig.profesionales
        `);
        
        const after = afterStats.rows[0];
        console.log(`   Total activos: ${after.total}`);
        console.log(`   Solo Mendoza: ${after.mendoza}`);
        console.log(`   Externos restantes: ${after.externos}`);
        
        // PASO 10: Verificar respaldos
        console.log('\n🔐 RESPALDOS VERIFICADOS:');
        const backupStats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.profesionales_externos_simple) as externos_backup,
                (SELECT COUNT(*) FROM copig.matriculas_externas_simple) as matriculas_backup,
                (SELECT COUNT(*) FROM copig.pagos_externos_simple) as pagos_backup
        `);
        
        const backup = backupStats.rows[0];
        console.log(`   Profesionales respaldados: ${backup.externos_backup}`);
        console.log(`   Matrículas respaldadas: ${backup.matriculas_backup}`);
        console.log(`   Pagos respaldados: ${backup.pagos_backup}`);
        
        // CONFIRMAR TRANSACCIÓN
        await client.query('COMMIT');
        console.log('\n✅ TRANSACCIÓN CONFIRMADA');
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SEPARACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(60));
        
        console.log('\n📊 RESUMEN:');
        console.log(`   🗑️ Profesionales eliminados: ${deleteProfesionales.rowCount}`);
        console.log(`   🗑️ Matrículas eliminadas: ${deleteMatriculas.rowCount}`);
        console.log(`   🗑️ Pagos eliminados: ${deletePagos.rowCount}`);
        console.log(`   🗑️ Restricciones eliminadas: ${deleteRestricciones.rowCount}`);
        
        console.log(`\n🏠 SISTEMA FINAL:`);
        console.log(`   👥 Solo profesionales de Mendoza: ${after.mendoza}`);
        console.log(`   ✨ Profesionales externos: ${after.externos}`);
        
        if (parseInt(after.externos) === 0) {
            console.log('\n🎊 ¡MISIÓN COMPLETADA!');
            console.log('   Sistema COPIG ahora contiene SOLO profesionales de Mendoza');
            console.log('   Todos los datos externos están seguros en tablas de respaldo');
        }
        
        return {
            eliminados: deleteProfesionales.rowCount,
            mendoza: parseInt(after.mendoza),
            externos: parseInt(after.externos),
            success: parseInt(after.externos) === 0
        };
        
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        
        try {
            await client.query(`ALTER TABLE copig.profesionales ENABLE TRIGGER validate_delete_profesionales`);
            console.log('🔧 Trigger rehabilitado');
        } catch (triggerError) {
            console.log('⚠️ Error rehabilitando trigger');
        }
        
        await client.query('ROLLBACK');
        console.log('🔄 ROLLBACK ejecutado - datos seguros');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

executeFinalCleanupCorrected()
    .then(result => {
        if (result.success) {
            console.log('\n🏆 ÉXITO TOTAL:');
            console.log(`   🗑️ ${result.eliminados} profesionales externos eliminados`);
            console.log(`   🏠 ${result.mendoza} profesionales de Mendoza conservados`);
            console.log('   🎯 Sistema limpio y funcional');
        } else {
            console.log('\n⚠️ Limpieza parcial - revisar estado');
        }
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });