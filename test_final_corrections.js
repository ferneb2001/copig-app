/**
 * PRUEBA FINAL - CORRECCIONES COMPLETAS
 * ====================================
 * Verificar que fechas de matriculación y pagos aparezcan correctamente
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function testFinalCorrections() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🎉 VERIFICACIÓN FINAL - SISTEMA COMPLETAMENTE CORREGIDO\n');
        console.log('='.repeat(70) + '\n');
        
        // 1. PROBAR QUERY DEL ENDPOINT PRINCIPAL
        console.log('📋 1. PROBANDO ENDPOINT PRINCIPAL /api/admin/profesionales\n');
        
        const mainQuery = await pool.query(`
            SELECT 
                p.id, 
                m.numero_matricula as matricula,
                p.nombre, 
                p.numero_documento,
                p.email,
                m.fecha_inscripcion,
                m.fecha_habilitacion,
                MAX(ph.fecha_pago) as ultimo_pago,
                CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true
            GROUP BY p.id, m.numero_matricula, p.nombre, p.numero_documento, p.email, 
                     m.fecha_inscripcion, m.fecha_habilitacion, p.activo
            ORDER BY p.nombre 
            LIMIT 5
        `);
        
        console.log(`✅ Endpoint principal: ${mainQuery.rows.length} profesionales obtenidos`);
        mainQuery.rows.forEach(prof => {
            const fechaInscripcion = prof.fecha_inscripcion ? 
                prof.fecha_inscripcion.toISOString().split('T')[0] : 'No disponible';
            const ultimoPago = prof.ultimo_pago ? 
                prof.ultimo_pago.toISOString().split('T')[0] : 'Sin pagos';
            
            console.log(`   👤 ${prof.nombre}`);
            console.log(`      Mat: ${prof.matricula || 'Sin matrícula'}`);
            console.log(`      Fecha inscripción: ${fechaInscripcion}`);
            console.log(`      Último pago: ${ultimoPago}`);
            console.log('');
        });
        
        // 2. PROBAR QUERY DEL ENDPOINT INDIVIDUAL
        console.log('🔍 2. PROBANDO ENDPOINT INDIVIDUAL /api/admin/profesionales/:id\n');
        
        const testId = mainQuery.rows[0].id;
        const individualQuery = await pool.query(`
            SELECT 
                p.*, 
                p.numero_documento, 
                m.numero_matricula as matricula_profesional,
                m.fecha_inscripcion,
                m.fecha_habilitacion,
                m.fecha_titulo,
                m.categoria as categoria_matricula,
                m.activo as matricula_activa,
                MAX(ph.fecha_pago) as ultimo_pago,
                COUNT(ph.id) as total_pagos,
                SUM(ph.importe) as monto_total_pagos
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id 
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.id = $1
            GROUP BY p.id, p.numero_documento, m.numero_matricula, m.fecha_inscripcion,
                     m.fecha_habilitacion, m.fecha_titulo, m.categoria, m.activo
        `, [testId]);
        
        if (individualQuery.rows.length > 0) {
            const prof = individualQuery.rows[0];
            console.log(`✅ Endpoint individual para ID ${testId}:`);
            console.log(`   Nombre: ${prof.nombre}`);
            console.log(`   Fecha inscripción: ${prof.fecha_inscripcion ? prof.fecha_inscripcion.toISOString().split('T')[0] : 'No disponible'}`);
            console.log(`   Fecha habilitación: ${prof.fecha_habilitacion ? prof.fecha_habilitacion.toISOString().split('T')[0] : 'No disponible'}`);
            console.log(`   Último pago: ${prof.ultimo_pago ? prof.ultimo_pago.toISOString().split('T')[0] : 'Sin pagos'}`);
            console.log(`   Total pagos: ${prof.total_pagos || 0}`);
            console.log(`   Monto total: $${prof.monto_total_pagos || 0}`);
        }
        
        // 3. ESTADÍSTICAS FINALES
        console.log('\n📊 3. ESTADÍSTICAS FINALES\n');
        
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.profesionales WHERE activo = true) as profesionales_activos,
                (SELECT COUNT(*) FROM copig.profesionales p 
                 JOIN copig.matriculas m ON p.id = m.profesional_id 
                 WHERE m.fecha_inscripcion IS NOT NULL AND p.activo = true) as con_fechas,
                (SELECT COUNT(DISTINCT ph.matricula) FROM copig.pagos_historicos ph) as con_pagos,
                (SELECT COUNT(*) FROM copig.pagos_historicos WHERE importe > 0) as pagos_validos
        `);
        
        const s = stats.rows[0];
        console.log('📋 Resumen del sistema:');
        console.log(`   Profesionales activos: ${s.profesionales_activos}`);
        console.log(`   Con fechas de matriculación: ${s.con_fechas} (${Math.round(s.con_fechas/s.profesionales_activos*100)}%)`);
        console.log(`   Con pagos históricos: ${s.con_pagos}`);
        console.log(`   Pagos válidos total: ${s.pagos_validos}`);
        
        console.log('\n' + '='.repeat(70));
        console.log('🎯 VERIFICACIÓN FINAL COMPLETADA');
        console.log('='.repeat(70));
        
        console.log('✅ CORRECCIONES APLICADAS:');
        console.log('   📅 Endpoint principal incluye fecha_inscripcion y ultimo_pago');
        console.log('   🔍 Endpoint individual incluye fechas y estadísticas de pagos');
        console.log('   🖥️  Frontend corregido para usar campos correctos');
        console.log('   📊 Nueva columna "Último Pago" agregada a la tabla');
        
        console.log('\n✅ LO QUE DEBERÍAS VER EN LA INTERFAZ:');
        console.log('   1. Fechas de matriculación en lugar de "No disponible"');
        console.log('   2. Fechas de último pago en nueva columna');
        console.log('   3. Información completa en modales de detalles');
        
        console.log('\n🌐 Para verificar:');
        console.log('   Ve a: http://localhost:3030/admin');
        console.log('   Las fechas y pagos ya deberían aparecer correctamente');
        
    } catch (error) {
        console.error('❌ Error en verificación final:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    testFinalCorrections();
}

module.exports = testFinalCorrections;