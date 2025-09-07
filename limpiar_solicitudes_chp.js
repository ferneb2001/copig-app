const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function limpiarSolicitudesCHP() {
    try {
        console.log('🧹 Limpiando todas las solicitudes CHP para empezar desde cero...');
        
        // 1. Contar solicitudes actuales
        const countResult = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
        const totalSolicitudes = countResult.rows[0].total;
        console.log(`📊 Solicitudes CHP actuales: ${totalSolicitudes}`);
        
        if (totalSolicitudes > 0) {
            // 2. Eliminar primero las tablas relacionadas
            console.log('🧹 Limpiando tablas relacionadas...');
            
            // Eliminar notificaciones CHP si existen
            try {
                const notifResult = await pool.query('DELETE FROM copig.notificaciones_chp');
                console.log(`📧 ${notifResult.rowCount} notificaciones eliminadas`);
            } catch (error) {
                console.log('⚠️  Tabla notificaciones_chp no existe o ya está vacía');
            }
            
            // Eliminar comprobantes de pago si existen
            try {
                const compResult = await pool.query('DELETE FROM copig.comprobantes_pago');
                console.log(`💳 ${compResult.rowCount} comprobantes eliminados`);
            } catch (error) {
                console.log('⚠️  Tabla comprobantes_pago no existe o ya está vacía');
            }
            
            // Eliminar facturas CHP si existen
            try {
                const factResult = await pool.query('DELETE FROM copig.facturas_chp');
                console.log(`📄 ${factResult.rowCount} facturas eliminadas`);
            } catch (error) {
                console.log('⚠️  Tabla facturas_chp no existe o ya está vacía');
            }
            
            // 3. Ahora eliminar todas las solicitudes CHP
            const deleteResult = await pool.query('DELETE FROM copig.solicitudes_chp');
            console.log(`🗑️  ${deleteResult.rowCount} solicitudes eliminadas`);
            
            // 3. Resetear la secuencia de numeración
            await pool.query("SELECT setval('copig.chp_numero_seq', 1000, false)");
            console.log('🔄 Secuencia de numeración reseteada a 1001');
            
        } else {
            console.log('✅ No hay solicitudes para eliminar');
        }
        
        // 4. Verificar que está limpio
        const verifyResult = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
        const remaining = verifyResult.rows[0].total;
        
        if (remaining === '0') {
            console.log('✅ LIMPIEZA EXITOSA: 0 solicitudes CHP restantes');
            
            // 5. Verificar próximo número
            const nextNumResult = await pool.query("SELECT nextval('copig.chp_numero_seq') as next_num");
            const nextNumber = nextNumResult.rows[0].next_num;
            console.log(`🎯 Próxima solicitud será: CHP-2025-${nextNumber}`);
            
            // Revertir el nextval para que la próxima sea realmente 1001
            await pool.query("SELECT setval('copig.chp_numero_seq', 1000, false)");
            
        } else {
            console.log(`❌ Error: aún quedan ${remaining} solicitudes`);
        }
        
        console.log('\n🚀 Sistema listo para nueva solicitud desde el portal profesional');
        console.log('📋 Ambos lados (profesional y admin) ahora muestran 0 solicitudes');
        console.log('🔗 Portal profesional: http://localhost:3030/');
        console.log('🔗 Panel admin: http://localhost:3030/admin');
        
    } catch (error) {
        console.error('❌ Error limpiando solicitudes:', error);
    } finally {
        await pool.end();
    }
}

limpiarSolicitudesCHP();