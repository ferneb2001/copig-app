const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verifyMigrationResults() {
    try {
        console.log('📊 VERIFICANDO RESULTADOS DE MIGRACIÓN COMPLETA\n');
        
        // 1. Estadísticas básicas
        console.log('1. ESTADÍSTICAS BÁSICAS:');
        
        const profQuery = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        const matQuery = await pool.query('SELECT COUNT(*) as total FROM copig.matriculas');
        const pagosQuery = await pool.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        
        console.log(`   👥 Total profesionales: ${parseInt(profQuery.rows[0].total).toLocaleString()}`);
        console.log(`   🎫 Total matrículas: ${parseInt(matQuery.rows[0].total).toLocaleString()}`);
        console.log(`   💰 Total pagos históricos: ${parseInt(pagosQuery.rows[0].total).toLocaleString()}`);
        
        // 2. Análisis de vinculación de matrículas
        console.log('\n2. ANÁLISIS DE VINCULACIÓN DE MATRÍCULAS:');
        
        const vinculacionQuery = await pool.query(`
            SELECT 
                COUNT(*) as total_matriculas,
                COUNT(CASE WHEN profesional_id IS NOT NULL THEN 1 END) as con_profesional,
                COUNT(CASE WHEN profesional_id IS NULL THEN 1 END) as sin_profesional
            FROM copig.matriculas
        `);
        
        const vinc = vinculacionQuery.rows[0];
        const porcentajeVinc = (parseInt(vinc.con_profesional) / parseInt(vinc.total_matriculas)) * 100;
        
        console.log(`   Total matrículas: ${parseInt(vinc.total_matriculas).toLocaleString()}`);
        console.log(`   Con profesional: ${parseInt(vinc.con_profesional).toLocaleString()} (${porcentajeVinc.toFixed(1)}%)`);
        console.log(`   Sin profesional: ${parseInt(vinc.sin_profesional).toLocaleString()} (${(100 - porcentajeVinc).toFixed(1)}%)`);
        
        // 3. Análisis de pagos por matrícula
        console.log('\n3. ANÁLISIS DE PAGOS POR MATRÍCULA:');
        
        const pagosAnalysisQuery = await pool.query(`
            SELECT 
                COUNT(DISTINCT ph.matricula) as matriculas_con_pagos,
                COUNT(*) as total_pagos,
                COUNT(DISTINCT CASE 
                    WHEN ph.matricula ~ '^[0-9]+$' 
                         AND EXISTS (
                             SELECT 1 FROM copig.matriculas m 
                             WHERE m.numero_matricula = ph.matricula::integer
                             AND m.profesional_id IS NOT NULL
                         )
                    THEN ph.matricula END) as matriculas_con_pagos_y_profesional,
                AVG(ph.importe) as importe_promedio,
                SUM(ph.importe) as importe_total
            FROM copig.pagos_historicos ph
            WHERE ph.matricula IS NOT NULL 
              AND ph.matricula != ''
        `);
        
        const pagosAnalysis = pagosAnalysisQuery.rows[0];
        const porcentajePagosVinc = (parseInt(pagosAnalysis.matriculas_con_pagos_y_profesional) / parseInt(pagosAnalysis.matriculas_con_pagos)) * 100;
        
        console.log(`   Matrículas únicas con pagos: ${parseInt(pagosAnalysis.matriculas_con_pagos).toLocaleString()}`);
        console.log(`   Con profesional vinculado: ${parseInt(pagosAnalysis.matriculas_con_pagos_y_profesional).toLocaleString()} (${porcentajePagosVinc.toFixed(1)}%)`);
        console.log(`   Total de pagos: ${parseInt(pagosAnalysis.total_pagos).toLocaleString()}`);
        console.log(`   Importe total: $${parseFloat(pagosAnalysis.importe_total).toLocaleString()}`);
        console.log(`   Importe promedio: $${parseFloat(pagosAnalysis.importe_promedio).toFixed(2)}`);
        
        // 4. Top 10 profesionales con más pagos
        console.log('\n4. TOP 10 PROFESIONALES CON MÁS PAGOS:');
        
        const topProfQuery = await pool.query(`
            SELECT 
                p.nombre,
                COUNT(*) as cantidad_pagos,
                SUM(ph.importe) as total_pagado,
                COUNT(DISTINCT ph.matricula) as matriculas_diferentes
            FROM copig.pagos_historicos ph
            JOIN copig.matriculas m ON ph.matricula ~ '^[0-9]+$' 
                                    AND m.numero_matricula = ph.matricula::integer
            JOIN copig.profesionales p ON m.profesional_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY cantidad_pagos DESC
            LIMIT 10
        `);
        
        topProfQuery.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.nombre}`);
            console.log(`      Pagos: ${row.cantidad_pagos} | Total: $${parseFloat(row.total_pagado).toLocaleString()} | Matrículas: ${row.matriculas_diferentes}`);
        });
        
        // 5. Problemas potenciales
        console.log('\n5. ANÁLISIS DE PROBLEMAS POTENCIALES:');
        
        const problemasQuery = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE matricula IS NULL OR matricula = '') as pagos_sin_matricula,
                COUNT(*) FILTER (WHERE matricula !~ '^[0-9]+$') as pagos_matricula_invalida,
                COUNT(*) FILTER (WHERE importe = 0) as pagos_importe_cero,
                COUNT(*) FILTER (WHERE concepto IS NULL) as pagos_sin_concepto
            FROM copig.pagos_historicos
        `);
        
        const problemas = problemasQuery.rows[0];
        
        console.log(`   Pagos sin matrícula: ${parseInt(problemas.pagos_sin_matricula).toLocaleString()}`);
        console.log(`   Pagos con matrícula inválida: ${parseInt(problemas.pagos_matricula_invalida).toLocaleString()}`);
        console.log(`   Pagos con importe = 0: ${parseInt(problemas.pagos_importe_cero).toLocaleString()}`);
        console.log(`   Pagos sin concepto: ${parseInt(problemas.pagos_sin_concepto).toLocaleString()}`);
        
        // 6. Resumen final
        console.log('\n🎯 RESUMEN FINAL DE MIGRACIÓN:');
        console.log(`   ✅ Profesionales migrados: ${parseInt(profQuery.rows[0].total).toLocaleString()}`);
        console.log(`   ✅ Matrículas migradas: ${parseInt(matQuery.rows[0].total).toLocaleString()}`);
        console.log(`   ✅ Pagos históricos migrados: ${parseInt(pagosQuery.rows[0].total).toLocaleString()}`);
        console.log(`   🔗 Matrículas vinculadas: ${porcentajeVinc.toFixed(1)}%`);
        console.log(`   💰 Pagos con profesional identificado: ${porcentajePagosVinc.toFixed(1)}%`);
        
        const estado = porcentajeVinc > 90 ? '✅ MIGRACIÓN EXCELENTE' :
                      porcentajeVinc > 75 ? '✅ MIGRACIÓN EXITOSA' :
                      porcentajeVinc > 50 ? '⚠️ MIGRACIÓN PARCIAL' :
                                           '❌ MIGRACIÓN CON PROBLEMAS';
        
        console.log(`   Estado: ${estado}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyMigrationResults();