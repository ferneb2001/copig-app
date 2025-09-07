const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function determineRecordNature() {
    try {
        console.log('=== DETERMINACIÓN DE LA NATURALEZA DE LOS REGISTROS PROBLEMÁTICOS ===\n');
        
        // 1. Análisis de legitimidad basado en patrones de detalle
        console.log('1. ANÁLISIS DE LEGITIMIDAD POR CATEGORÍAS:');
        const categoryQuery = `
            SELECT 
                CASE 
                    WHEN detalle IN ('DER.INSC.', 'der.insc.') THEN 'DERECHO_INSCRIPCION'
                    WHEN detalle ILIKE '%inact%' THEN 'INACTIVACION'
                    WHEN detalle ILIKE '%renov%' THEN 'RENOVACION'  
                    WHEN detalle ILIKE '%baja%' THEN 'BAJA'
                    WHEN detalle ILIKE '%cert%' THEN 'CERTIFICACION'
                    WHEN detalle ILIKE '%morat%' THEN 'MORATORIA'
                    WHEN detalle IS NULL THEN 'SIN_DETALLE'
                    ELSE 'OTRO'
                END as categoria,
                COUNT(*) as total_registros,
                COUNT(DISTINCT matricula) as matriculas_afectadas,
                COUNT(*) FILTER (WHERE importe = 0) as con_importe_zero,
                COUNT(*) FILTER (WHERE concepto IS NULL) as con_concepto_null,
                SUM(importe) as total_importe,
                ROUND(AVG(importe), 2) as importe_promedio,
                CASE 
                    WHEN detalle ILIKE '%inact%' OR detalle ILIKE '%baja%' THEN 'LEGITIMO_ADMINISTRATIVO'
                    WHEN detalle ILIKE '%renov%' OR detalle ILIKE '%cert%' THEN 'LEGITIMO_PROCESO'
                    WHEN detalle ILIKE '%morat%' THEN 'LEGITIMO_MORATORIA'
                    WHEN detalle IN ('DER.INSC.', 'der.insc.') AND concepto IS NULL THEN 'POSIBLE_ERROR_MIGRACION'
                    WHEN detalle IS NULL THEN 'ERROR_MIGRACION'
                    ELSE 'INDETERMINADO'
                END as evaluacion_legitimidad
            FROM copig.pagos_historicos
            WHERE importe = 0 OR concepto IS NULL
            GROUP BY CASE 
                WHEN detalle IN ('DER.INSC.', 'der.insc.') THEN 'DERECHO_INSCRIPCION'
                WHEN detalle ILIKE '%inact%' THEN 'INACTIVACION'
                WHEN detalle ILIKE '%renov%' THEN 'RENOVACION'  
                WHEN detalle ILIKE '%baja%' THEN 'BAJA'
                WHEN detalle ILIKE '%cert%' THEN 'CERTIFICACION'
                WHEN detalle ILIKE '%morat%' THEN 'MORATORIA'
                WHEN detalle IS NULL THEN 'SIN_DETALLE'
                ELSE 'OTRO'
            END,
            CASE 
                WHEN detalle ILIKE '%inact%' OR detalle ILIKE '%baja%' THEN 'LEGITIMO_ADMINISTRATIVO'
                WHEN detalle ILIKE '%renov%' OR detalle ILIKE '%cert%' THEN 'LEGITIMO_PROCESO'
                WHEN detalle ILIKE '%morat%' THEN 'LEGITIMO_MORATORIA'
                WHEN detalle IN ('DER.INSC.', 'der.insc.') AND concepto IS NULL THEN 'POSIBLE_ERROR_MIGRACION'
                WHEN detalle IS NULL THEN 'ERROR_MIGRACION'
                ELSE 'INDETERMINADO'
            END
            ORDER BY total_registros DESC
        `;
        
        const categoryResult = await pool.query(categoryQuery);
        categoryResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. Categoría: ${row.categoria}`);
            console.log(`   Evaluación: ${row.evaluacion_legitimidad}`);
            console.log(`   Registros: ${row.total_registros} | Matrículas: ${row.matriculas_afectadas}`);
            console.log(`   Importe=0: ${row.con_importe_zero} | Concepto=NULL: ${row.con_concepto_null}`);
            console.log(`   Total importe: $${parseFloat(row.total_importe || 0).toLocaleString()}`);
            console.log('');
        });
        
        // 2. Análisis de consistencia temporal
        console.log('2. ANÁLISIS DE CONSISTENCIA TEMPORAL:');
        const temporalConsistencyQuery = `
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
                COUNT(*) as total_problemas,
                COUNT(*) FILTER (WHERE importe = 0) as importe_zero,
                COUNT(*) FILTER (WHERE concepto IS NULL) as concepto_null,
                CASE 
                    WHEN EXTRACT(YEAR FROM fecha_pago) < 1980 THEN 'DATOS_HISTORICOS_ANTIGUOS'
                    WHEN EXTRACT(YEAR FROM fecha_pago) BETWEEN 1980 AND 2000 THEN 'MIGRACION_SISTEMA_ANTERIOR'
                    WHEN EXTRACT(YEAR FROM fecha_pago) BETWEEN 2001 AND 2010 THEN 'DIGITALIZACION_INICIAL'
                    WHEN EXTRACT(YEAR FROM fecha_pago) BETWEEN 2011 AND 2020 THEN 'SISTEMA_MODERNO'
                    ELSE 'SISTEMA_ACTUAL'
                END as epoca_sistema
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
            ),
            CASE 
                WHEN EXTRACT(YEAR FROM fecha_pago) < 1980 THEN 'DATOS_HISTORICOS_ANTIGUOS'
                WHEN EXTRACT(YEAR FROM fecha_pago) BETWEEN 1980 AND 2000 THEN 'MIGRACION_SISTEMA_ANTERIOR'
                WHEN EXTRACT(YEAR FROM fecha_pago) BETWEEN 2001 AND 2010 THEN 'DIGITALIZACION_INICIAL'
                WHEN EXTRACT(YEAR FROM fecha_pago) BETWEEN 2011 AND 2020 THEN 'SISTEMA_MODERNO'
                ELSE 'SISTEMA_ACTUAL'
            END
            ORDER BY año_corregido DESC
            LIMIT 15
        `;
        
        const temporalResult = await pool.query(temporalConsistencyQuery);
        temporalResult.rows.forEach((row, index) => {
            console.log(`${row.año_corregido}: ${row.total_problemas} problemas | Época: ${row.epoca_sistema}`);
            console.log(`   Importe=0: ${row.importe_zero} | Concepto=NULL: ${row.concepto_null}`);
        });
        
        // 3. Análisis de patrones sospechosos
        console.log('\n3. DETECCIÓN DE PATRONES SOSPECHOSOS:');
        const suspiciousQuery = `
            SELECT 
                'CONCEPTO_NUMERICO' as patron,
                concepto,
                COUNT(*) as frecuencia,
                COUNT(DISTINCT matricula) as matriculas,
                CASE 
                    WHEN concepto IN ('1', '8') THEN 'CODIGO_INTERNO_POSIBLE'
                    WHEN concepto IS NULL THEN 'ERROR_MIGRACION'
                    WHEN concepto ~ '^[0-9]+$' THEN 'CODIGO_NUMERICO'
                    ELSE 'TEXTO_NORMAL'
                END as evaluacion
            FROM copig.pagos_historicos
            WHERE importe = 0 OR concepto IS NULL
            GROUP BY concepto
            ORDER BY frecuencia DESC
            LIMIT 10
        `;
        
        const suspiciousResult = await pool.query(suspiciousQuery);
        console.log('Patrones de concepto sospechosos:');
        suspiciousResult.rows.forEach((row, index) => {
            const concepto = row.concepto || 'NULL';
            console.log(`${index + 1}. Concepto: '${concepto}' | ${row.evaluacion}`);
            console.log(`   Frecuencia: ${row.frecuencia} | Matrículas: ${row.matriculas}`);
        });
        
        // 4. Resumen y recomendaciones
        console.log('\n4. RESUMEN Y EVALUACIÓN FINAL:');
        
        const summaryQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE 
                    detalle ILIKE '%inact%' OR 
                    detalle ILIKE '%baja%' OR 
                    detalle ILIKE '%renov%' OR 
                    detalle ILIKE '%morat%'
                ) as registros_legitimos_administrativos,
                
                COUNT(*) FILTER (WHERE 
                    concepto IS NULL AND detalle IS NOT NULL
                ) as posibles_errores_migracion_concepto,
                
                COUNT(*) FILTER (WHERE 
                    concepto IS NULL AND detalle IS NULL
                ) as errores_migracion_completos,
                
                COUNT(*) FILTER (WHERE 
                    importe = 0 AND detalle IN ('DER.INSC.', 'der.insc.') AND concepto IS NOT NULL
                ) as derechos_inscripcion_sin_costo,
                
                COUNT(*) as total_problematicos
            FROM copig.pagos_historicos
            WHERE importe = 0 OR concepto IS NULL
        `;
        
        const summaryResult = await pool.query(summaryQuery);
        const summary = summaryResult.rows[0];
        
        console.log('CLASIFICACIÓN FINAL:');
        console.log(`✅ Registros legítimos (administrativos): ${summary.registros_legitimos_administrativos} (${((summary.registros_legitimos_administrativos / summary.total_problematicos) * 100).toFixed(1)}%)`);
        console.log(`⚠️  Posibles errores migración (concepto): ${summary.posibles_errores_migracion_concepto} (${((summary.posibles_errores_migracion_concepto / summary.total_problematicos) * 100).toFixed(1)}%)`);
        console.log(`❌ Errores migración completos: ${summary.errores_migracion_completos} (${((summary.errores_migracion_completos / summary.total_problematicos) * 100).toFixed(1)}%)`);
        console.log(`🔍 Derechos inscripción sin costo: ${summary.derechos_inscripcion_sin_costo} (${((summary.derechos_inscripcion_sin_costo / summary.total_problematicos) * 100).toFixed(1)}%)`);
        console.log(`📊 Total registros problemáticos: ${summary.total_problematicos}`);
        
        console.log('\n=== RECOMENDACIONES ===');
        
        const legitimatePercentage = (summary.registros_legitimos_administrativos / summary.total_problematicos) * 100;
        const migrationErrorPercentage = ((parseInt(summary.posibles_errores_migracion_concepto) + parseInt(summary.errores_migracion_completos)) / summary.total_problematicos) * 100;
        
        if (legitimatePercentage > 50) {
            console.log('✅ MAYORÍA SON REGISTROS LEGÍTIMOS:');
            console.log('   - Trámites administrativos (inactivaciones, bajas, renovaciones)');
            console.log('   - Moratorias y procesos especiales');
            console.log('   - Certificaciones sin costo');
        }
        
        if (migrationErrorPercentage > 20) {
            console.log('⚠️  ERRORES DE MIGRACIÓN SIGNIFICATIVOS:');
            console.log('   - Revisar registros con concepto = NULL');
            console.log('   - Validar registros sin detalle');
            console.log('   - Considerar limpieza de datos');
        }
        
        console.log('\n📋 ACCIONES RECOMENDADAS:');
        console.log('1. MANTENER registros con detalle administrativo (inact, baja, renov, morat)');
        console.log('2. REVISAR registros con concepto = NULL pero detalle válido');
        console.log('3. INVESTIGAR registros completamente vacíos (concepto = NULL, detalle = NULL)');
        console.log('4. VALIDAR derechos de inscripción con importe = 0');
        console.log('5. Considerar migración de códigos numéricos de concepto a texto descriptivo');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

determineRecordNature();