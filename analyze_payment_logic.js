/**
 * ANÁLISIS LÓGICA DE PAGOS Y HABILITACIÓN
 * =====================================
 * Analizar situación real de pagos para definir reglas de habilitación
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function analyzePaymentLogic() {
    const pool = new Pool(config.database);
    
    try {
        console.log('📊 ANÁLISIS: Lógica de pagos y habilitación profesional\n');
        console.log('='.repeat(70) + '\n');
        
        // 1. ANÁLISIS GENERAL DE PAGOS
        console.log('💰 1. SITUACIÓN GENERAL DE PAGOS\n');
        
        const generalStats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.profesionales WHERE activo = true) as total_profesionales,
                (SELECT COUNT(DISTINCT ph.matricula) FROM copig.pagos_historicos ph) as profesionales_con_pagos,
                (SELECT MAX(fecha_pago) FROM copig.pagos_historicos) as ultimo_pago_sistema,
                (SELECT MIN(fecha_pago) FROM copig.pagos_historicos) as primer_pago_sistema,
                (SELECT COUNT(*) FROM copig.pagos_historicos WHERE fecha_pago >= '2024-01-01') as pagos_2024,
                (SELECT COUNT(*) FROM copig.pagos_historicos WHERE fecha_pago >= '2025-01-01') as pagos_2025
        `);
        
        const stats = generalStats.rows[0];
        console.log('📋 Estadísticas generales:');
        console.log(`   Total profesionales activos: ${stats.total_profesionales}`);
        console.log(`   Profesionales con historial pagos: ${stats.profesionales_con_pagos}`);
        console.log(`   Sin historial pagos: ${stats.total_profesionales - stats.profesionales_con_pagos}`);
        console.log(`   Último pago en sistema: ${stats.ultimo_pago_sistema ? stats.ultimo_pago_sistema.toISOString().split('T')[0] : 'No hay'}`);
        console.log(`   Primer pago en sistema: ${stats.primer_pago_sistema ? stats.primer_pago_sistema.toISOString().split('T')[0] : 'No hay'}`);
        console.log(`   Pagos en 2024: ${stats.pagos_2024}`);
        console.log(`   Pagos en 2025: ${stats.pagos_2025}`);
        
        // 2. ANÁLISIS POR PERÍODOS
        console.log('\n⏰ 2. ANÁLISIS POR PERÍODOS DE PAGO\n');
        
        const paymentPeriods = await pool.query(`
            SELECT 
                CASE 
                    WHEN MAX(ph.fecha_pago) >= '2025-01-01' THEN '2025 - Al día'
                    WHEN MAX(ph.fecha_pago) >= '2024-01-01' THEN '2024 - Moroso 1 año'
                    WHEN MAX(ph.fecha_pago) >= '2023-01-01' THEN '2023 - Moroso 2 años'
                    WHEN MAX(ph.fecha_pago) >= '2020-01-01' THEN '2020-2022 - Moroso 3-5 años'
                    WHEN MAX(ph.fecha_pago) IS NOT NULL THEN 'Antes 2020 - Moroso +5 años'
                    ELSE 'Sin pagos registrados'
                END as categoria_pago,
                COUNT(DISTINCT p.id) as cantidad_profesionales
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true
            GROUP BY categoria_pago
            ORDER BY cantidad_profesionales DESC
        `);
        
        console.log('📊 Distribución por estado de pagos:');
        paymentPeriods.rows.forEach(period => {
            const percentage = Math.round((period.cantidad_profesionales / stats.total_profesionales) * 100);
            console.log(`   ${period.categoria_pago}: ${period.cantidad_profesionales} profesionales (${percentage}%)`);
        });
        
        // 3. CASOS ESPECÍFICOS PROBLEMÁTICOS
        console.log('\n⚠️  3. CASOS PROBLEMÁTICOS\n');
        
        // Profesionales sin pagos nunca
        const sinPagos = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true AND ph.id IS NULL
        `);
        
        // Profesionales con pagos muy antiguos
        const pagosAntiguos = await pool.query(`
            SELECT p.nombre, m.numero_matricula, MAX(ph.fecha_pago) as ultimo_pago
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true 
            HAVING MAX(ph.fecha_pago) < '2020-01-01'
            ORDER BY ultimo_pago DESC
            LIMIT 10
        `);
        
        console.log(`❌ Profesionales sin pagos registrados: ${sinPagos.rows[0].cantidad}`);
        console.log(`🕰️  Profesionales con último pago antes de 2020: ${pagosAntiguos.rows.length > 0 ? 'Varios' : 'Ninguno'}`);
        
        if (pagosAntiguos.rows.length > 0) {
            console.log('\n   Ejemplos de pagos muy antiguos:');
            pagosAntiguos.rows.slice(0, 5).forEach(prof => {
                console.log(`   - ${prof.nombre} (Mat ${prof.numero_matricula}): ${prof.ultimo_pago.toISOString().split('T')[0]}`);
            });
        }
        
        // 4. ANÁLISIS DE CONCEPTOS DE PAGO
        console.log('\n📝 4. TIPOS DE PAGOS EN SISTEMA\n');
        
        const conceptos = await pool.query(`
            SELECT concepto, COUNT(*) as cantidad, 
                   MIN(fecha_pago) as primer_pago, MAX(fecha_pago) as ultimo_pago
            FROM copig.pagos_historicos 
            WHERE concepto IS NOT NULL
            GROUP BY concepto
            ORDER BY cantidad DESC
            LIMIT 10
        `);
        
        console.log('📋 Conceptos de pago más frecuentes:');
        conceptos.rows.forEach(concepto => {
            console.log(`   ${concepto.concepto || 'Sin concepto'}: ${concepto.cantidad} pagos`);
            if (concepto.primer_pago && concepto.ultimo_pago) {
                console.log(`     Período: ${concepto.primer_pago.toISOString().split('T')[0]} a ${concepto.ultimo_pago.toISOString().split('T')[0]}`);
            }
        });
        
        // 5. PROPUESTA DE REGLAS DE NEGOCIO
        console.log('\n' + '='.repeat(70));
        console.log('💡 PROPUESTA: REGLAS DE HABILITACIÓN');
        console.log('='.repeat(70));
        
        const currentYear = new Date().getFullYear();
        console.log('\n🎯 REGLAS SUGERIDAS (basadas en análisis):');
        console.log('\n✅ HABILITADO:');
        console.log(`   - Pagos en ${currentYear} (al día)`);
        console.log(`   - Pagos en ${currentYear - 1} (moroso tolerable)`);
        
        console.log('\n⚠️  INHABILITADO POR MOROSIDAD:');
        console.log(`   - Sin pagos desde ${currentYear - 2} o antes`);
        console.log('   - Sin pagos registrados nunca');
        
        console.log('\n🔧 IMPLEMENTACIÓN TÉCNICA:');
        console.log('   1. Crear campo "estado_habilitacion" calculado dinámicamente');
        console.log('   2. Actualizar interfaz para mostrar estado real');
        console.log('   3. Agregar indicadores visuales (🟢 Al día, 🟡 Moroso, 🔴 Inhabilitado)');
        console.log('   4. Crear alertas para profesionales próximos a inhabilitación');
        
        console.log('\n❓ PREGUNTAS PARA FERNANDO:');
        console.log('   1. ¿Cuántos años sin pagar = inhabilitado?');
        console.log('   2. ¿Hay pagos anuales obligatorios?');
        console.log('   3. ¿Existe período de gracia para morosos?');
        console.log('   4. ¿Los pagos antiguos mantienen habilitación?');
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    analyzePaymentLogic();
}

module.exports = analyzePaymentLogic;