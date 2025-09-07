const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function limpiarCHPCascade() {
    try {
        console.log('🧹 Limpiando solicitudes CHP usando CASCADE...');
        
        // Contar solicitudes
        const countResult = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
        console.log(`📊 Solicitudes CHP actuales: ${countResult.rows[0].total}`);
        
        if (countResult.rows[0].total > 0) {
            // Método 1: Intentar TRUNCATE CASCADE (más rápido)
            try {
                await pool.query('TRUNCATE TABLE copig.solicitudes_chp CASCADE');
                console.log('✅ TRUNCATE CASCADE exitoso');
            } catch (error) {
                console.log('⚠️  TRUNCATE falló, usando DELETE manual...');
                
                // Método 2: Eliminar en orden específico las tablas problemáticas
                const tablesToClean = [
                    'notificaciones_profesional',
                    'certificados_chp_finales',
                    'documentos_chp',
                    'log_arca',
                    'facturas_chp',
                    'notificaciones_chp',
                    'certificados_chp',
                    'documentos_profesional'
                ];
                
                for (const table of tablesToClean) {
                    try {
                        const result = await pool.query(`DELETE FROM copig.${table} WHERE solicitud_id IS NOT NULL OR solicitud_chp_id IS NOT NULL`);
                        if (result.rowCount > 0) {
                            console.log(`🗑️  ${table}: ${result.rowCount} eliminados`);
                        }
                    } catch (err) {
                        console.log(`⚠️  ${table}: ${err.message.slice(0, 100)}...`);
                    }
                }
                
                // Ahora intentar eliminar solicitudes_chp
                const deleteResult = await pool.query('DELETE FROM copig.solicitudes_chp');
                console.log(`🗑️  solicitudes_chp: ${deleteResult.rowCount} eliminadas`);
            }
        }
        
        // Resetear secuencia
        await pool.query("SELECT setval('copig.chp_numero_seq', 1000, false)");
        console.log('🔄 Secuencia reseteada a 1001');
        
        // Verificación final
        const finalCount = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
        console.log(`✅ Verificación: ${finalCount.rows[0].total} solicitudes restantes`);
        
        if (finalCount.rows[0].total === '0') {
            console.log('\n🎉 ¡LIMPIEZA EXITOSA!');
            console.log('🌟 Sistema listo para crear nueva solicitud CHP');
            console.log('');
            console.log('📋 PRÓXIMOS PASOS:');
            console.log('1. 🔗 Ir a: http://localhost:3030/');
            console.log('2. 🔐 Login con DNI: 99999999 / Contraseña: prueba123');
            console.log('3. 📝 Crear nueva solicitud en sección Certificados');
            console.log('4. 💰 Probar campo opcional "Monto Estimado"');
            console.log('5. 🔧 Revisar en admin: http://localhost:3030/admin');
        } else {
            console.log('❌ Aún quedan solicitudes. Se necesita intervención manual.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

limpiarCHPCascade();