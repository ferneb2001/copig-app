const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeProblematicRecords() {
    try {
        console.log('=== ANÁLISIS DE REGISTROS PROBLEMÁTICOS ===\n');
        
        // 1. Estadísticas generales de registros problemáticos
        console.log('1. ESTADÍSTICAS GENERALES:');
        const generalStatsQuery = `
            SELECT 
                COUNT(*) as total_records,
                COUNT(*) FILTER (WHERE importe = 0) as importe_zero,
                COUNT(*) FILTER (WHERE concepto IS NULL) as concepto_null,
                COUNT(*) FILTER (WHERE importe = 0 AND concepto IS NULL) as both_problematic,
                COUNT(*) FILTER (WHERE importe = 0 OR concepto IS NULL) as any_problematic,
                ROUND((COUNT(*) FILTER (WHERE importe = 0 OR concepto IS NULL)::numeric / COUNT(*)::numeric) * 100, 2) as porcentaje_problematico
            FROM copig.pagos_historicos
        `;
        
        const generalResult = await pool.query(generalStatsQuery);
        const general = generalResult.rows[0];
        
        console.log(`Total de registros: ${parseInt(general.total_records).toLocaleString()}`);
        console.log(`Registros con importe = 0: ${parseInt(general.importe_zero).toLocaleString()} (${((general.importe_zero / general.total_records) * 100).toFixed(2)}%)`);
        console.log(`Registros con concepto = null: ${parseInt(general.concepto_null).toLocaleString()} (${((general.concepto_null / general.total_records) * 100).toFixed(2)}%)`);
        console.log(`Registros con AMBOS problemas: ${parseInt(general.both_problematic).toLocaleString()}`);
        console.log(`Registros con CUALQUIER problema: ${parseInt(general.any_problematic).toLocaleString()} (${general.porcentaje_problematico}%)`);
        
        // 2. Análisis de registros con importe = 0
        console.log('\n2. ANÁLISIS DE REGISTROS CON IMPORTE = 0:');
        const zeroAmountQuery = `
            SELECT 
                ph.concepto,
                ph.detalle,
                COUNT(*) as cantidad,
                COUNT(DISTINCT ph.matricula) as matriculas_afectadas,
                MIN(ph.fecha_pago) as fecha_mas_antigua,
                MAX(ph.fecha_pago) as fecha_mas_reciente
            FROM copig.pagos_historicos ph
            WHERE ph.importe = 0
            GROUP BY ph.concepto, ph.detalle
            ORDER BY cantidad DESC
            LIMIT 10
        `;
        
        const zeroResult = await pool.query(zeroAmountQuery);
        console.log('Top 10 patrones de registros con importe = 0:');
        zeroResult.rows.forEach((row, index) => {
            const concepto = row.concepto || 'NULL';
            const detalle = row.detalle || 'NULL';
            console.log(`${index + 1}. Concepto: '${concepto}' | Detalle: '${detalle}'`);
            console.log(`   Cantidad: ${row.cantidad} | Matrículas: ${row.matriculas_afectadas}`);
            console.log(`   Período: ${row.fecha_mas_antigua.toISOString().split('T')[0]} - ${row.fecha_mas_reciente.toISOString().split('T')[0]}`);
        });
        
        // 3. Análisis de registros con concepto = null
        console.log('\n3. ANÁLISIS DE REGISTROS CON CONCEPTO = NULL:');
        const nullConceptQuery = `
            SELECT 
                ph.importe,
                ph.detalle,
                ph.estado,
                COUNT(*) as cantidad,
                COUNT(DISTINCT ph.matricula) as matriculas_afectadas,
                SUM(ph.importe) as total_importe
            FROM copig.pagos_historicos ph
            WHERE ph.concepto IS NULL
            GROUP BY ph.importe, ph.detalle, ph.estado
            ORDER BY cantidad DESC
            LIMIT 10
        `;
        
        const nullResult = await pool.query(nullConceptQuery);
        console.log('Top 10 patrones de registros con concepto = NULL:');
        nullResult.rows.forEach((row, index) => {
            const detalle = row.detalle || 'NULL';
            console.log(`${index + 1}. Importe: $${parseFloat(row.importe || 0).toLocaleString()} | Estado: '${row.estado}'`);
            console.log(`   Detalle: '${detalle}' | Cantidad: ${row.cantidad} | Matrículas: ${row.matriculas_afectadas}`);
            console.log(`   Total importe: $${parseFloat(row.total_importe || 0).toLocaleString()}`);
        });
        
        // 4. Análisis de matrículas más afectadas
        console.log('\n4. MATRÍCULAS MÁS AFECTADAS POR REGISTROS PROBLEMÁTICOS:');
        const affectedMatriculasQuery = `
            SELECT 
                ph.matricula,
                p.nombre as profesional_nombre,
                COUNT(*) as registros_problematicos,
                COUNT(*) FILTER (WHERE ph.importe = 0) as registros_importe_zero,
                COUNT(*) FILTER (WHERE ph.concepto IS NULL) as registros_concepto_null,
                COUNT(*) FILTER (WHERE ph.importe = 0 AND ph.concepto IS NULL) as registros_ambos_problemas
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE ph.importe = 0 OR ph.concepto IS NULL
            GROUP BY ph.matricula, p.nombre
            ORDER BY registros_problematicos DESC
            LIMIT 15
        `;
        
        const affectedResult = await pool.query(affectedMatriculasQuery);
        console.log('Matrículas con más registros problemáticos:');
        affectedResult.rows.forEach((row, index) => {
            const nombre = row.profesional_nombre || 'Sin nombre';
            console.log(`${index + 1}. Matrícula: ${row.matricula} | ${nombre}`);
            console.log(`   Total problemáticos: ${row.registros_problematicos}`);
            console.log(`   - Importe = 0: ${row.registros_importe_zero}`);
            console.log(`   - Concepto = NULL: ${row.registros_concepto_null}`);
            console.log(`   - Ambos problemas: ${row.registros_ambos_problemas}`);
        });
        
        // 5. Análisis temporal de registros problemáticos
        console.log('\n5. DISTRIBUCIÓN TEMPORAL DE REGISTROS PROBLEMÁTICOS:');
        const temporalQuery = `
            SELECT 
                EXTRACT(YEAR FROM 
                    CASE 
                        WHEN EXTRACT(YEAR FROM fecha_pago) > 5000 THEN 
                            DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 3000, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
                        WHEN EXTRACT(YEAR FROM fecha_pago) > 2200 THEN 
                            DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 200, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
                        WHEN EXTRACT(YEAR FROM fecha_pago) > 2030 THEN 
                            DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 30, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
                        ELSE fecha_pago 
                    END
                ) as año_corregido,
                COUNT(*) as total_registros,
                COUNT(*) FILTER (WHERE importe = 0) as importe_zero,
                COUNT(*) FILTER (WHERE concepto IS NULL) as concepto_null,
                COUNT(*) FILTER (WHERE importe = 0 AND concepto IS NULL) as ambos_problemas
            FROM copig.pagos_historicos
            WHERE importe = 0 OR concepto IS NULL
            GROUP BY EXTRACT(YEAR FROM 
                CASE 
                    WHEN EXTRACT(YEAR FROM fecha_pago) > 5000 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 3000, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
                    WHEN EXTRACT(YEAR FROM fecha_pago) > 2200 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 200, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
                    WHEN EXTRACT(YEAR FROM fecha_pago) > 2030 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 30, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
                    ELSE fecha_pago 
                END
            )
            ORDER BY año_corregido DESC
            LIMIT 10
        `;
        
        const temporalResult = await pool.query(temporalQuery);
        console.log('Distribución por año (corregido):');
        temporalResult.rows.forEach((row, index) => {
            console.log(`${row.año_corregido}: ${row.total_registros} problemas | Importe=0: ${row.importe_zero} | Concepto=NULL: ${row.concepto_null} | Ambos: ${row.ambos_problemas}`);
        });
        
        // 6. Análisis de patrones de detalle/estado
        console.log('\n6. PATRONES EN CAMPO DETALLE PARA REGISTROS PROBLEMÁTICOS:');
        const detalleQuery = `
            SELECT 
                ph.detalle,
                ph.estado,
                COUNT(*) as cantidad,
                COUNT(*) FILTER (WHERE ph.importe = 0) as con_importe_zero,
                COUNT(*) FILTER (WHERE ph.concepto IS NULL) as con_concepto_null,
                AVG(ph.importe) as importe_promedio
            FROM copig.pagos_historicos ph
            WHERE ph.importe = 0 OR ph.concepto IS NULL
            GROUP BY ph.detalle, ph.estado
            ORDER BY cantidad DESC
            LIMIT 10
        `;
        
        const detalleResult = await pool.query(detalleQuery);
        console.log('Patrones más comunes en campo detalle:');
        detalleResult.rows.forEach((row, index) => {
            const detalle = row.detalle || 'NULL';
            console.log(`${index + 1}. Detalle: '${detalle}' | Estado: '${row.estado}'`);
            console.log(`   Cantidad: ${row.cantidad} | Importe=0: ${row.con_importe_zero} | Concepto=NULL: ${row.con_concepto_null}`);
            console.log(`   Importe promedio: $${parseFloat(row.importe_promedio || 0).toFixed(2)}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeProblematicRecords();