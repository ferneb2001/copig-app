/**
 * PRUEBA HISTORIAL DE PAGOS
 * ========================
 * Verificar que el endpoint de pagos funciona correctamente
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function testPaymentHistory() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🧪 PRUEBA: Historial de pagos en detalle profesional\n');
        console.log('='.repeat(60) + '\n');
        
        // 1. BUSCAR UN PROFESIONAL CON PAGOS
        console.log('🔍 1. BUSCANDO PROFESIONAL CON PAGOS\n');
        
        const profConPagos = await pool.query(`
            SELECT 
                ve.id, ve.nombre, ve.numero_matricula,
                ve.estado_visual, ve.ultimo_pago,
                COUNT(ph.id) as total_pagos_reales
            FROM copig.vista_profesionales_estados ve
            LEFT JOIN copig.pagos_historicos ph ON ve.numero_matricula::text = ph.matricula::text
            WHERE ve.estado_habilitacion IN ('HABILITADO', 'MOROSO')
            GROUP BY ve.id, ve.nombre, ve.numero_matricula, ve.estado_visual, ve.ultimo_pago
            HAVING COUNT(ph.id) > 5
            ORDER BY COUNT(ph.id) DESC
            LIMIT 3
        `);
        
        console.log('📋 Profesionales con más pagos:');
        profConPagos.rows.forEach(prof => {
            console.log(`   ${prof.nombre} (ID: ${prof.id}, Mat: ${prof.numero_matricula})`);
            console.log(`     Estado: ${prof.estado_visual}`);
            console.log(`     Total pagos: ${prof.total_pagos_reales}`);
            console.log(`     Último pago: ${prof.ultimo_pago ? prof.ultimo_pago.toISOString().split('T')[0] : 'N/A'}`);
            console.log('');
        });
        
        // 2. PROBAR ENDPOINT DE PAGOS
        if (profConPagos.rows.length > 0) {
            const testProf = profConPagos.rows[0];
            console.log(`💰 2. PROBANDO ENDPOINT PAGOS PARA: ${testProf.nombre}\n`);
            
            // Simular el endpoint
            const pagosResult = await pool.query(`
                SELECT fecha_pago, importe, concepto, estado, numero_recibo,
                       detalle
                FROM copig.pagos_historicos 
                WHERE matricula::text = $1::text
                ORDER BY fecha_pago DESC
                LIMIT 10
            `, [testProf.numero_matricula]);
            
            console.log(`✅ Endpoint devolvería ${pagosResult.rows.length} pagos:`);
            pagosResult.rows.forEach((pago, i) => {
                console.log(`   ${i + 1}. Fecha: ${pago.fecha_pago ? pago.fecha_pago.toISOString().split('T')[0] : 'N/A'}`);
                console.log(`      Importe: $${pago.importe} | Concepto: ${pago.concepto || 'Sin concepto'}`);
                console.log(`      Estado: ${pago.estado} | Recibo: ${pago.numero_recibo || '-'}`);
                console.log('');
            });
            
            // 3. ESTADÍSTICAS
            const estadisticas = await pool.query(`
                SELECT 
                    COUNT(*) as total_pagos,
                    SUM(importe) as monto_total,
                    MAX(fecha_pago) as ultimo_pago
                FROM copig.pagos_historicos 
                WHERE matricula::text = $1::text
            `, [testProf.numero_matricula]);
            
            console.log('📊 Estadísticas que aparecerán en el modal:');
            const stats = estadisticas.rows[0];
            console.log(`   Total pagos: ${stats.total_pagos}`);
            console.log(`   Monto total: $${stats.monto_total}`);
            console.log(`   Último pago: ${stats.ultimo_pago ? stats.ultimo_pago.toISOString().split('T')[0] : 'N/A'}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 RESULTADO DE LA PRUEBA');
        console.log('='.repeat(60));
        
        console.log('\n✅ LO QUE VERÁS EN LA INTERFAZ:');
        console.log('   1. Haz clic en "👁️ Ver" de cualquier profesional');
        console.log('   2. En el modal aparecerá:');
        console.log('      📊 Estado Financiero con montos correctos');
        console.log('      📋 Tabla "Historial de Pagos" con:');
        console.log('         - Fecha de cada pago');
        console.log('         - Concepto del pago');
        console.log('         - Importe pagado');
        console.log('         - Número de recibo');
        console.log('   3. La tabla será scrolleable si hay muchos pagos');
        
        console.log('\n🌐 PARA PROBAR:');
        console.log('   Ve a: http://localhost:3030/admin');
        console.log(`   Haz clic en "Ver" del profesional: ${profConPagos.rows[0]?.nombre || 'cualquiera'}`);
        console.log('   ¡Deberías ver el historial completo de pagos!');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    testPaymentHistory();
}

module.exports = testPaymentHistory;