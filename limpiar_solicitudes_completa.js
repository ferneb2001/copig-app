const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function limpiarSolicitudesCompleta() {
    try {
        console.log('🧹 LIMPIEZA COMPLETA SOLICITUDES CHP\n');
        
        // 1. Verificar profesional de prueba
        console.log('=== 1. VERIFICAR PROFESIONAL DE PRUEBA ===');
        const profesional = await pool.query(`
            SELECT id, nombre FROM copig.profesionales 
            WHERE numero_documento = 99999999
        `);
        
        if (profesional.rows.length === 0) {
            console.log('❌ Profesional de prueba no encontrado');
            return;
        }
        
        const profId = profesional.rows[0].id;
        console.log(`✅ Profesional: ${profesional.rows[0].nombre} (ID: ${profId})`);
        
        // 2. Identificar solicitudes a eliminar
        console.log('\n=== 2. IDENTIFICAR SOLICITUDES A ELIMINAR ===');
        const solicitudes = await pool.query(`
            SELECT id, numero_solicitud, estado FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
        `, [profId]);
        
        const solicitudIds = solicitudes.rows.map(s => s.id);
        console.log(`Solicitudes a eliminar: ${solicitudIds.length}`);
        solicitudes.rows.forEach(s => {
            console.log(`  - ${s.numero_solicitud} (ID: ${s.id}) - ${s.estado}`);
        });
        
        if (solicitudIds.length === 0) {
            console.log('✅ No hay solicitudes para eliminar');
            return;
        }
        
        // 3. Eliminar notificaciones CHP relacionadas
        console.log('\n=== 3. ELIMINAR NOTIFICACIONES CHP ===');
        const notificacionesEliminadas = await pool.query(`
            DELETE FROM copig.notificaciones_chp 
            WHERE solicitud_id = ANY($1::int[])
        `, [solicitudIds]);
        
        console.log(`✅ Notificaciones eliminadas: ${notificacionesEliminadas.rowCount}`);
        
        // 4. Eliminar documentos CHP relacionados
        console.log('\n=== 4. ELIMINAR DOCUMENTOS CHP ===');
        const documentosEliminados = await pool.query(`
            DELETE FROM copig.documentos_chp 
            WHERE solicitud_id = ANY($1::int[])
        `, [solicitudIds]);
        
        console.log(`✅ Documentos eliminados: ${documentosEliminados.rowCount}`);
        
        // 5. Eliminar solicitudes CHP
        console.log('\n=== 5. ELIMINAR SOLICITUDES CHP ===');
        const solicitudesEliminadas = await pool.query(`
            DELETE FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
        `, [profId]);
        
        console.log(`✅ Solicitudes eliminadas: ${solicitudesEliminadas.rowCount}`);
        
        // 6. Verificar limpieza
        console.log('\n=== 6. VERIFICAR LIMPIEZA COMPLETA ===');
        const verificacion = await pool.query(`
            SELECT COUNT(*) as total FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
        `, [profId]);
        
        console.log(`Solicitudes restantes: ${verificacion.rows[0].total}`);
        
        // 7. Reiniciar secuencia
        console.log('\n=== 7. REINICIAR SECUENCIA NUMERACIÓN ===');
        await pool.query(`SELECT setval('copig.chp_numero_seq', 1000, false)`);
        console.log('✅ Secuencia reiniciada - próximo número: CHP-2025-1001');
        
        // 8. Verificar problema de replicación admin
        console.log('\n=== 8. DIAGNÓSTICO PROBLEMA REPLICACIÓN ADMIN ===');
        console.log('Verificando endpoint admin...');
        
        // Verificar que el endpoint admin existe en server.js
        const fs = require('fs');
        const serverContent = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
        
        if (serverContent.includes('/api/admin/solicitudes-chp')) {
            console.log('✅ Endpoint GET /api/admin/solicitudes-chp existe en server.js');
        } else {
            console.log('❌ Endpoint GET /api/admin/solicitudes-chp NO EXISTE en server.js');
        }
        
        if (serverContent.includes('/api/profesional/solicitudes-chp')) {
            console.log('✅ Endpoint GET /api/profesional/solicitudes-chp existe en server.js');
        } else {
            console.log('❌ Endpoint GET /api/profesional/solicitudes-chp NO EXISTE en server.js');
        }
        
        // 9. Verificar admin-chp.html
        console.log('\n=== 9. VERIFICAR ADMIN-CHP.HTML ===');
        if (fs.existsSync('C:\\copig-app\\admin-chp.html')) {
            console.log('✅ admin-chp.html existe');
            const adminContent = fs.readFileSync('C:\\copig-app\\admin-chp.html', 'utf8');
            
            if (adminContent.includes('cargarSolicitudes')) {
                console.log('✅ Función cargarSolicitudes() existe en admin-chp.html');
            } else {
                console.log('❌ Función cargarSolicitudes() NO EXISTE en admin-chp.html');
            }
            
            if (adminContent.includes('/api/admin/solicitudes-chp')) {
                console.log('✅ admin-chp.html hace llamadas a /api/admin/solicitudes-chp');
            } else {
                console.log('❌ admin-chp.html NO hace llamadas a /api/admin/solicitudes-chp');
            }
        } else {
            console.log('❌ admin-chp.html NO EXISTE');
        }
        
        console.log('\n✅ LIMPIEZA COMPLETA - SISTEMA LISTO');
        console.log('\n🎯 PRÓXIMOS PASOS PARA FERNANDO:');
        console.log('1. Ingresar como profesional (DNI: 99999999, pass: prueba123)');
        console.log('2. Crear nueva solicitud CHP');
        console.log('3. Ingresar como admin al panel CHP');
        console.log('4. Si no aparece la solicitud, reportar que hay problema de replicación');
        console.log('5. Claude verificará y corregirá el endpoint admin');
        
    } catch (error) {
        console.error('❌ Error en limpieza completa:', error);
    } finally {
        await pool.end();
    }
}

limpiarSolicitudesCompleta().catch(console.error);