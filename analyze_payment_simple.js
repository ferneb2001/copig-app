/**
 * ANÁLISIS SIMPLE DE PAGOS Y HABILITACIÓN
 * ======================================
 * Análisis simplificado para entender la situación de pagos
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function analyzePaymentSimple() {
    const pool = new Pool(config.database);
    
    try {
        console.log('📊 ANÁLISIS SIMPLE: Situación de pagos profesionales\n');
        console.log('='.repeat(60) + '\n');
        
        // 1. ESTADÍSTICAS BÁSICAS
        console.log('💰 1. ESTADÍSTICAS BÁSICAS\n');
        
        const basicStats = await pool.query(`
            SELECT 
                COUNT(*) as total_profesionales
            FROM copig.profesionales 
            WHERE activo = true
        `);
        
        const paymentsStats = await pool.query(`
            SELECT 
                COUNT(DISTINCT matricula) as profesionales_con_pagos,
                COUNT(*) as total_pagos,
                MAX(fecha_pago) as ultimo_pago_global,
                MIN(fecha_pago) as primer_pago_global
            FROM copig.pagos_historicos
        `);
        
        const withoutPayments = await pool.query(`
            SELECT COUNT(*) as sin_pagos
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true AND ph.id IS NULL
        `);
        
        console.log(`   Total profesionales activos: ${basicStats.rows[0].total_profesionales}`);
        console.log(`   Profesionales con pagos: ${paymentsStats.rows[0].profesionales_con_pagos}`);
        console.log(`   Profesionales sin pagos: ${withoutPayments.rows[0].sin_pagos}`);
        console.log(`   Total pagos históricos: ${paymentsStats.rows[0].total_pagos}`);
        console.log(`   Período pagos: ${paymentsStats.rows[0].primer_pago_global?.toISOString().split('T')[0]} a ${paymentsStats.rows[0].ultimo_pago_global?.toISOString().split('T')[0]}`);
        
        // 2. PAGOS POR AÑO RECIENTE
        console.log('\n📅 2. PAGOS POR AÑOS RECIENTES\n');
        
        const recentPayments = await pool.query(`
            SELECT 
                EXTRACT(YEAR FROM fecha_pago) as año,
                COUNT(DISTINCT matricula) as profesionales_pagaron,
                COUNT(*) as total_pagos
            FROM copig.pagos_historicos 
            WHERE fecha_pago >= '2020-01-01'
            GROUP BY EXTRACT(YEAR FROM fecha_pago)
            ORDER BY año DESC
        `);
        
        recentPayments.rows.forEach(year => {
            console.log(`   ${year.año}: ${year.profesionales_pagaron} profesionales (${year.total_pagos} pagos)`);
        });
        
        // 3. PROFESIONALES CON ÚLTIMOS PAGOS
        console.log('\n⏰ 3. PROFESIONALES POR ÚLTIMO PAGO\n');
        
        // Al día (2025)
        const alDia2025 = await pool.query(`
            SELECT COUNT(DISTINCT p.id) as cantidad
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true AND ph.fecha_pago >= '2025-01-01'
        `);
        
        // Moroso 1 año (2024)
        const moroso1Año = await pool.query(`
            SELECT COUNT(DISTINCT p.id) as cantidad
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true 
            AND ph.fecha_pago >= '2024-01-01' 
            AND ph.fecha_pago < '2025-01-01'
            AND p.id NOT IN (
                SELECT DISTINCT p2.id FROM copig.profesionales p2
                JOIN copig.matriculas m2 ON p2.id = m2.profesional_id
                JOIN copig.pagos_historicos ph2 ON m2.numero_matricula::text = ph2.matricula::text
                WHERE ph2.fecha_pago >= '2025-01-01'
            )
        `);
        
        // Moroso 2+ años (antes 2024)
        const morosoViejo = await pool.query(`
            SELECT COUNT(DISTINCT p.id) as cantidad
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true 
            AND ph.fecha_pago < '2024-01-01'
            AND p.id NOT IN (
                SELECT DISTINCT p2.id FROM copig.profesionales p2
                JOIN copig.matriculas m2 ON p2.id = m2.profesional_id
                JOIN copig.pagos_historicos ph2 ON m2.numero_matricula::text = ph2.matricula::text
                WHERE ph2.fecha_pago >= '2024-01-01'
            )
        `);
        
        const totalConPagos = alDia2025.rows[0].cantidad + moroso1Año.rows[0].cantidad + morosoViejo.rows[0].cantidad;
        const sinPagos = basicStats.rows[0].total_profesionales - totalConPagos;
        
        console.log(`   🟢 Al día (pagos 2025): ${alDia2025.rows[0].cantidad}`);
        console.log(`   🟡 Moroso 1 año (último pago 2024): ${moroso1Año.rows[0].cantidad}`);
        console.log(`   🔴 Moroso 2+ años (último pago antes 2024): ${morosoViejo.rows[0].cantidad}`);
        console.log(`   ⚫ Sin pagos registrados: ${sinPagos}`);
        
        // 4. EJEMPLOS ESPECÍFICOS
        console.log('\n📋 4. EJEMPLOS DE CADA CATEGORÍA\n');
        
        // Ejemplos al día
        const ejemplosAlDia = await pool.query(`
            SELECT p.nombre, m.numero_matricula, MAX(ph.fecha_pago) as ultimo_pago
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true AND ph.fecha_pago >= '2025-01-01'
            GROUP BY p.nombre, m.numero_matricula
            ORDER BY ultimo_pago DESC
            LIMIT 5
        `);
        
        console.log('🟢 Ejemplos AL DÍA:');
        ejemplosAlDia.rows.forEach(prof => {
            console.log(`   ${prof.nombre} (Mat ${prof.numero_matricula}): ${prof.ultimo_pago.toISOString().split('T')[0]}`);
        });
        
        // Ejemplos morosos
        const ejemplosMorosos = await pool.query(`
            SELECT p.nombre, m.numero_matricula, MAX(ph.fecha_pago) as ultimo_pago
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true AND ph.fecha_pago < '2024-01-01'
            AND p.id NOT IN (
                SELECT DISTINCT p2.id FROM copig.profesionales p2
                JOIN copig.matriculas m2 ON p2.id = m2.profesional_id
                JOIN copig.pagos_historicos ph2 ON m2.numero_matricula::text = ph2.matricula::text
                WHERE ph2.fecha_pago >= '2024-01-01'
            )
            GROUP BY p.nombre, m.numero_matricula
            ORDER BY ultimo_pago DESC
            LIMIT 5
        `);
        
        console.log('\n🔴 Ejemplos MOROSOS ANTIGUOS:');
        ejemplosMorosos.rows.forEach(prof => {
            console.log(`   ${prof.nombre} (Mat ${prof.numero_matricula}): ${prof.ultimo_pago.toISOString().split('T')[0]}`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 CONCLUSIONES');
        console.log('='.repeat(60));
        
        console.log('\n❗ PROBLEMA IDENTIFICADO:');
        console.log(`   El sistema muestra TODOS como "Activo" pero en realidad:`);
        console.log(`   - Solo ${alDia2025.rows[0].cantidad} están realmente AL DÍA`);
        console.log(`   - ${moroso1Año.rows[0].cantidad + morosoViejo.rows[0].cantidad + sinPagos} están en situación irregular`);
        
        console.log('\n💡 SOLUCIÓN REQUERIDA:');
        console.log('   1. Implementar estado dinámico basado en último pago');
        console.log('   2. Actualizar interfaz para mostrar estado real');
        console.log('   3. Agregar alertas para morosos');
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    analyzePaymentSimple();
}

module.exports = analyzePaymentSimple;