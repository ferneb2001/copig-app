const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function limpiarSolicitudesPrueba() {
    try {
        console.log('🧹 LIMPIAR SOLICITUDES DEL PROFESIONAL DE PRUEBA\n');
        
        // 1. Verificar profesional de prueba
        console.log('=== 1. VERIFICAR PROFESIONAL DE PRUEBA ===');
        const profesional = await pool.query(`
            SELECT id, nombre, numero_documento FROM copig.profesionales 
            WHERE numero_documento = 99999999
        `);
        
        if (profesional.rows.length === 0) {
            console.log('❌ Profesional de prueba no encontrado');
            return;
        }
        
        const profId = profesional.rows[0].id;
        console.log(`✅ Profesional: ${profesional.rows[0].nombre}`);
        console.log(`   ID: ${profId}`);
        
        // 2. Ver solicitudes actuales
        console.log('\n=== 2. SOLICITUDES ACTUALES DEL PROFESIONAL ===');
        const solicitudesActuales = await pool.query(`
            SELECT id, numero_solicitud, estado, cliente, fecha_solicitud
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
            ORDER BY fecha_solicitud DESC
        `, [profId]);
        
        console.log(`Total solicitudes a eliminar: ${solicitudesActuales.rows.length}`);
        solicitudesActuales.rows.forEach((sol, i) => {
            console.log(`  ${i+1}. ${sol.numero_solicitud} - ${sol.estado} - ${sol.cliente}`);
        });
        
        // 3. Eliminar documentos CHP relacionados (si existen)
        console.log('\n=== 3. ELIMINAR DOCUMENTOS RELACIONADOS ===');
        const documentosEliminados = await pool.query(`
            DELETE FROM copig.documentos_chp 
            WHERE solicitud_id IN (
                SELECT id FROM copig.solicitudes_chp WHERE profesional_id = $1
            )
        `, [profId]);
        
        console.log(`✅ Documentos eliminados: ${documentosEliminados.rowCount}`);
        
        // 4. Eliminar solicitudes CHP
        console.log('\n=== 4. ELIMINAR SOLICITUDES CHP ===');
        const solicitudesEliminadas = await pool.query(`
            DELETE FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
        `, [profId]);
        
        console.log(`✅ Solicitudes eliminadas: ${solicitudesEliminadas.rowCount}`);
        
        // 5. Verificar limpieza
        console.log('\n=== 5. VERIFICAR LIMPIEZA COMPLETA ===');
        const verificacion = await pool.query(`
            SELECT COUNT(*) as total FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
        `, [profId]);
        
        const totalRestante = verificacion.rows[0].total;
        console.log(`Solicitudes restantes para el profesional: ${totalRestante}`);
        
        if (totalRestante === '0') {
            console.log('✅ LIMPIEZA EXITOSA - Sin solicitudes restantes');
        } else {
            console.log('⚠️ VERIFICAR - Aún hay solicitudes restantes');
        }
        
        // 6. Estadísticas generales del sistema
        console.log('\n=== 6. ESTADÍSTICAS SISTEMA CHP ===');
        const statsGenerales = await pool.query(`
            SELECT 
                COUNT(*) as total_solicitudes,
                COUNT(DISTINCT profesional_id) as profesionales_con_solicitudes
            FROM copig.solicitudes_chp
        `);
        
        const stats = statsGenerales.rows[0];
        console.log(`Total solicitudes en sistema: ${stats.total_solicitudes}`);
        console.log(`Profesionales con solicitudes: ${stats.profesionales_con_solicitudes}`);
        
        // 7. Verificar endpoints admin
        console.log('\n=== 7. VERIFICAR ACCESO ADMIN PANEL ===');
        console.log('Endpoints para verificar:');
        console.log('  GET /api/admin/solicitudes-chp - Debe mostrar 0 solicitudes del prof. prueba');
        console.log('  GET /api/profesional/solicitudes-chp - Debe mostrar array vacío para prof. prueba');
        
        console.log('\n🎯 INSTRUCCIONES PARA FERNANDO:');
        console.log('1. Ingresar como profesional (DNI: 99999999, pass: prueba123)');
        console.log('2. Ir a "Gestión de Certificados" - debe mostrar lista vacía');
        console.log('3. Crear nueva solicitud CHP');
        console.log('4. Ingresar como admin y verificar que aparece en panel admin');
        console.log('5. Si no aparece, hay problema de replicación que debemos corregir');
        
        // 8. Reiniciar secuencia si es necesario
        console.log('\n=== 8. REINICIAR SECUENCIA NUMERACIÓN ===');
        await pool.query(`
            SELECT setval('copig.chp_numero_seq', 1000, false)
        `);
        console.log('✅ Secuencia reiniciada - próxima solicitud será CHP-2025-1001');
        
        console.log('\n✅ LIMPIEZA COMPLETA - SISTEMA LISTO PARA PRUEBA FRESCA');
        
    } catch (error) {
        console.error('❌ Error en limpieza:', error);
    } finally {
        await pool.end();
    }
}

limpiarSolicitudesPrueba().catch(console.error);