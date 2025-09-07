#!/usr/bin/env node

const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function simpleTest() {
    try {
        // Ver estructura admin_users
        console.log('🔍 Verificando estructura admin_users...');
        const estructura = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'admin_users'
            ORDER BY ordinal_position
        `);
        
        console.log('Columnas en admin_users:');
        estructura.rows.forEach(col => {
            console.log(`  • ${col.column_name} (${col.data_type})`);
        });
        
        // Ver si hay algún admin_user
        const admins = await pool.query(`SELECT * FROM copig.admin_users LIMIT 1`);
        console.log(`\n📊 Admin users existentes: ${admins.rows.length}`);
        
        if (admins.rows.length > 0) {
            console.log('Primer admin encontrado:', admins.rows[0]);
            
            // Usar el ID del primer admin para la prueba
            const adminId = admins.rows[0].id;
            console.log(`✅ Usaré admin ID: ${adminId} para la prueba`);
            
            // Ejecutar prueba simple del flujo
            console.log('\n🧪 Ejecutando prueba simple...');
            
            const solicitud = await pool.query(`
                SELECT * FROM copig.solicitudes_chp WHERE estado = 'PENDIENTE' LIMIT 1
            `);
            
            if (solicitud.rows.length > 0) {
                const sol = solicitud.rows[0];
                console.log(`📝 Probando con solicitud: ${sol.numero_solicitud}`);
                
                // Cambiar a EN_REVISION
                await pool.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = 'EN_REVISION', revisado_por = $1, fecha_revision = NOW()
                    WHERE id = $2
                `, [adminId, sol.id]);
                
                console.log('✅ Estado cambiado a EN_REVISION');
                
                // Revertir para siguiente prueba
                await pool.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = 'PENDIENTE', revisado_por = NULL, fecha_revision = NULL
                    WHERE id = $1
                `, [sol.id]);
                
                console.log('✅ Estado revertido para próximas pruebas');
            }
        } else {
            console.log('⚠️ No hay usuarios admin. Necesita crear uno primero.');
        }
        
        console.log('\n🎉 Prueba simple completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

simpleTest();