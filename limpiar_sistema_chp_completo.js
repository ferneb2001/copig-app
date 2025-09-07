const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function limpiarSistemaCHPCompleto() {
    try {
        console.log('🧹 LIMPIEZA SISTEMA CHP COMPLETO - TODAS LAS TABLAS\n');
        
        // 1. Identificar profesional de prueba
        const profesional = await pool.query(`
            SELECT id FROM copig.profesionales WHERE numero_documento = 99999999
        `);
        
        if (profesional.rows.length === 0) {
            console.log('❌ Profesional de prueba no encontrado');
            return;
        }
        
        const profId = profesional.rows[0].id;
        console.log(`✅ Profesional ID: ${profId}`);
        
        // 2. Identificar solicitudes a eliminar
        const solicitudes = await pool.query(`
            SELECT id FROM copig.solicitudes_chp WHERE profesional_id = $1
        `, [profId]);
        
        const solicitudIds = solicitudes.rows.map(s => s.id);
        console.log(`Solicitudes a eliminar: ${solicitudIds.length}`);
        
        if (solicitudIds.length === 0) {
            console.log('✅ No hay solicitudes para eliminar');
            return;
        }
        
        // 3. Eliminar en cascada todas las tablas relacionadas
        console.log('\n=== ELIMINAR TODAS LAS TABLAS CHP RELACIONADAS ===');
        
        // Facturas CHP
        const facturas = await pool.query(`
            DELETE FROM copig.facturas_chp WHERE solicitud_id = ANY($1::int[])
        `, [solicitudIds]);
        console.log(`✅ Facturas CHP eliminadas: ${facturas.rowCount}`);
        
        // Notificaciones CHP
        const notificaciones = await pool.query(`
            DELETE FROM copig.notificaciones_chp WHERE solicitud_id = ANY($1::int[])
        `, [solicitudIds]);
        console.log(`✅ Notificaciones CHP eliminadas: ${notificaciones.rowCount}`);
        
        // Documentos CHP
        const documentos = await pool.query(`
            DELETE FROM copig.documentos_chp WHERE solicitud_id = ANY($1::int[])
        `, [solicitudIds]);
        console.log(`✅ Documentos CHP eliminados: ${documentos.rowCount}`);
        
        // Pagos CHP (si existe)
        try {
            const pagos = await pool.query(`
                DELETE FROM copig.pagos_chp WHERE solicitud_id = ANY($1::int[])
            `, [solicitudIds]);
            console.log(`✅ Pagos CHP eliminados: ${pagos.rowCount}`);
        } catch (error) {
            console.log('ℹ️ Tabla pagos_chp no existe o sin registros');
        }
        
        // Historial CHP (si existe)
        try {
            const historial = await pool.query(`
                DELETE FROM copig.historial_chp WHERE solicitud_id = ANY($1::int[])
            `, [solicitudIds]);
            console.log(`✅ Historial CHP eliminado: ${historial.rowCount}`);
        } catch (error) {
            console.log('ℹ️ Tabla historial_chp no existe o sin registros');
        }
        
        // 4. Finalmente eliminar solicitudes
        console.log('\n=== ELIMINAR SOLICITUDES CHP ===');
        const solicitudesEliminadas = await pool.query(`
            DELETE FROM copig.solicitudes_chp WHERE profesional_id = $1
        `, [profId]);
        console.log(`✅ Solicitudes CHP eliminadas: ${solicitudesEliminadas.rowCount}`);
        
        // 5. Verificar limpieza completa
        console.log('\n=== VERIFICAR LIMPIEZA COMPLETA ===');
        const verificacion = await pool.query(`
            SELECT COUNT(*) as total FROM copig.solicitudes_chp WHERE profesional_id = $1
        `, [profId]);
        console.log(`Solicitudes restantes: ${verificacion.rows[0].total}`);
        
        // 6. Reiniciar secuencia
        await pool.query(`SELECT setval('copig.chp_numero_seq', 1000, false)`);
        console.log('✅ Secuencia reiniciada - próximo: CHP-2025-1001');
        
        // 7. VERIFICAR PROBLEMA REPLICACIÓN - Revisar endpoints
        console.log('\n=== DIAGNÓSTICO REPLICACIÓN ADMIN ===');
        
        // Buscar endpoint admin en server.js
        const fs = require('fs');
        const serverContent = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
        
        // Buscar líneas específicas del endpoint admin
        const lineasAdmin = serverContent.split('\n');
        let endpointAdminEncontrado = false;
        let lineaNumero = 0;
        
        lineasAdmin.forEach((linea, i) => {
            if (linea.includes('GET') && linea.includes('/api/admin/solicitudes-chp')) {
                console.log(`✅ Endpoint admin encontrado en línea ${i + 1}:`);
                console.log(`   ${linea.trim()}`);
                endpointAdminEncontrado = true;
                lineaNumero = i + 1;
            }
        });
        
        if (!endpointAdminEncontrado) {
            console.log('❌ PROBLEMA: Endpoint /api/admin/solicitudes-chp NO ENCONTRADO');
            console.log('   Esto explica por qué no se ven en panel admin');
        }
        
        // Buscar endpoint profesional
        let endpointProfEncontrado = false;
        lineasAdmin.forEach((linea, i) => {
            if (linea.includes('GET') && linea.includes('/api/profesional/solicitudes-chp')) {
                console.log(`✅ Endpoint profesional encontrado en línea ${i + 1}`);
                endpointProfEncontrado = true;
            }
        });
        
        if (!endpointProfEncontrado) {
            console.log('❌ Endpoint /api/profesional/solicitudes-chp NO ENCONTRADO');
        }
        
        console.log('\n✅ LIMPIEZA SISTEMA CHP COMPLETADA');
        console.log('\n🎯 ESTADO ACTUAL:');
        console.log('   - Profesional de prueba SIN solicitudes CHP');
        console.log('   - Secuencia reiniciada en 1001');
        console.log('   - Sistema listo para nueva prueba');
        console.log('\n📝 PARA FERNANDO:');
        console.log('   1. Crear solicitud como profesional');
        console.log('   2. Si no aparece en admin, confirmar que hay problema de endpoint');
        console.log('   3. Claude corregirá el problema de replicación');
        
    } catch (error) {
        console.error('❌ Error en limpieza:', error);
    } finally {
        await pool.end();
    }
}

limpiarSistemaCHPCompleto().catch(console.error);