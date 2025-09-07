const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function detailedMatriculaAnalysis() {
    try {
        console.log('=== ANÁLISIS DETALLADO DE MATRÍCULAS SIN CORRESPONDENCIA ===\n');
        
        // 1. Ejemplos específicos corregidos
        console.log('1. EJEMPLOS DE MATRÍCULAS PROBLEMÁTICAS:');
        const examplesQuery = `
            SELECT 
                ph.matricula,
                COUNT(*) as pagos_count,
                SUM(ph.importe) as total_importe,
                MIN(ph.fecha_pago) as primer_pago,
                MAX(ph.fecha_pago) as ultimo_pago,
                m.numero as matricula_en_tabla,
                m.profesional_id,
                CASE 
                    WHEN m.numero IS NULL THEN 'NO_EXISTE_EN_MATRICULAS'
                    WHEN m.profesional_id IS NULL THEN 'SIN_PROFESIONAL_ID'
                    ELSE 'PROFESIONAL_NO_ENCONTRADO'
                END as diagnostico
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL
            GROUP BY ph.matricula, m.numero, m.profesional_id
            ORDER BY pagos_count DESC, total_importe DESC
            LIMIT 15
        `;
        
        const examplesResult = await pool.query(examplesQuery);
        console.log('Top 15 matrículas problemáticas con más pagos:');
        examplesResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. Matrícula: ${row.matricula} | Diagnóstico: ${row.diagnostico}`);
            console.log(`   Pagos: ${row.pagos_count} | Importe: $${parseFloat(row.total_importe || 0).toLocaleString()}`);
            console.log(`   Período: ${row.primer_pago.toISOString().split('T')[0]} - ${row.ultimo_pago.toISOString().split('T')[0]}`);
            console.log(`   En tabla matrículas: ${row.matricula_en_tabla || 'NO'} | Profesional ID: ${row.profesional_id || 'NULL'}`);
        });
        
        // 2. Análisis temporal de matrículas faltantes
        console.log('\n2. ANÁLISIS TEMPORAL DE MATRÍCULAS FALTANTES:');
        const temporalQuery = `
            SELECT 
                EXTRACT(YEAR FROM 
                    CASE 
                        WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                            DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                        WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                            DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                        WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
                            DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                        ELSE ph.fecha_pago 
                    END
                ) as año_corregido,
                COUNT(DISTINCT ph.matricula) as matriculas_sin_profesional,
                COUNT(*) as pagos_sin_profesional,
                SUM(ph.importe) as importe_sin_profesional
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL
            GROUP BY EXTRACT(YEAR FROM 
                CASE 
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    ELSE ph.fecha_pago 
                END
            )
            ORDER BY año_corregido DESC
            LIMIT 20
        `;
        
        const temporalResult = await pool.query(temporalQuery);
        console.log('Distribución temporal de matrículas sin profesional:');
        temporalResult.rows.forEach(row => {
            console.log(`${row.año_corregido}: ${row.matriculas_sin_profesional} matrículas | ${row.pagos_sin_profesional} pagos | $${parseFloat(row.importe_sin_profesional || 0).toLocaleString()}`);
        });
        
        // 3. Verificar si las matrículas existen en tabla matriculas pero sin profesional
        console.log('\n3. MATRÍCULAS EXISTENTES PERO SIN PROFESIONAL:');
        const orphanQuery = `
            SELECT 
                m.numero as matricula,
                m.profesional_id,
                m.categoria,
                m.activo,
                m.fecha_inscripcion,
                COUNT(ph.id) as pagos_asociados,
                SUM(ph.importe) as total_importe
            FROM copig.matriculas m
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            LEFT JOIN copig.pagos_historicos ph ON m.numero = ph.matricula::integer
            WHERE p.id IS NULL AND ph.id IS NOT NULL
            GROUP BY m.numero, m.profesional_id, m.categoria, m.activo, m.fecha_inscripcion
            ORDER BY pagos_asociados DESC
            LIMIT 15
        `;
        
        const orphanResult = await pool.query(orphanQuery);
        console.log('Matrículas en tabla matriculas sin profesional asociado:');
        if (orphanResult.rows.length > 0) {
            orphanResult.rows.forEach((row, index) => {
                const activo = row.activo ? 'ACTIVA' : 'INACTIVA';
                const fechaInsc = row.fecha_inscripcion ? row.fecha_inscripcion.toISOString().split('T')[0] : 'NULL';
                console.log(`${index + 1}. Matrícula: ${row.matricula} | Estado: ${activo} | Categoría: ${row.categoria}`);
                console.log(`   Profesional ID: ${row.profesional_id || 'NULL'} | Fecha inscripción: ${fechaInsc}`);
                console.log(`   Pagos: ${row.pagos_asociados} | Importe: $${parseFloat(row.total_importe || 0).toLocaleString()}`);
            });
        } else {
            console.log('   ✅ Todas las matrículas en tabla matriculas tienen profesional asociado válido');
        }
        
        // 4. Identificar el verdadero problema: IDs de profesionales inválidos
        console.log('\n4. ANÁLISIS DE IDs DE PROFESIONALES INVÁLIDOS:');
        const invalidIdQuery = `
            SELECT 
                m.profesional_id,
                COUNT(DISTINCT m.numero) as matriculas_afectadas,
                COUNT(ph.id) as pagos_afectados,
                SUM(ph.importe) as importe_afectado,
                ARRAY_AGG(DISTINCT m.numero ORDER BY m.numero LIMIT 5) as ejemplos_matriculas
            FROM copig.matriculas m
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            LEFT JOIN copig.pagos_historicos ph ON m.numero = ph.matricula::integer
            WHERE m.profesional_id IS NOT NULL AND p.id IS NULL
            GROUP BY m.profesional_id
            ORDER BY matriculas_afectadas DESC
            LIMIT 10
        `;
        
        const invalidIdResult = await pool.query(invalidIdQuery);
        console.log('IDs de profesionales inexistentes en tabla profesionales:');
        if (invalidIdResult.rows.length > 0) {
            invalidIdResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Profesional ID inválido: ${row.profesional_id}`);
                console.log(`   Matrículas afectadas: ${row.matriculas_afectadas}`);
                console.log(`   Pagos afectados: ${row.pagos_afectados}`);
                console.log(`   Importe afectado: $${parseFloat(row.importe_afectado || 0).toLocaleString()}`);
                console.log(`   Ejemplos de matrículas: ${row.ejemplos_matriculas.join(', ')}`);
            });
        } else {
            console.log('   ✅ Todos los IDs de profesionales en tabla matriculas son válidos');
        }
        
        // 5. Buscar profesionales existentes que podrían corresponder
        console.log('\n5. POSIBLES CORRESPONDENCIAS PERDIDAS:');
        const possibleMatchesQuery = `
            WITH matriculas_sin_prof AS (
                SELECT DISTINCT ph.matricula
                FROM copig.pagos_historicos ph
                LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
                LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE p.id IS NULL
                LIMIT 20
            )
            SELECT 
                msf.matricula as matricula_huerfana,
                p.id as profesional_id,
                p.numero_documento,
                p.nombre,
                ABS(msf.matricula::integer - p.numero_documento) as diferencia_numerica,
                CASE 
                    WHEN msf.matricula::text = p.numero_documento::text THEN 'COINCIDENCIA_EXACTA'
                    WHEN ABS(msf.matricula::integer - p.numero_documento) <= 10 THEN 'COINCIDENCIA_CERCANA'
                    WHEN msf.matricula::text = LPAD(p.numero_documento::text, LENGTH(msf.matricula), '0') THEN 'PADDING_ZEROS'
                    ELSE 'NO_RELACIONADO'
                END as tipo_coincidencia
            FROM matriculas_sin_prof msf
            JOIN copig.profesionales p ON (
                msf.matricula::text = p.numero_documento::text 
                OR ABS(msf.matricula::integer - p.numero_documento) <= 50
            )
            WHERE ABS(msf.matricula::integer - p.numero_documento) <= 50
            ORDER BY msf.matricula, diferencia_numerica
        `;
        
        const matchesResult = await pool.query(possibleMatchesQuery);
        console.log('Posibles correspondencias encontradas:');
        if (matchesResult.rows.length > 0) {
            matchesResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Matrícula: ${row.matricula_huerfana} ↔ Documento: ${row.numero_documento}`);
                console.log(`   Profesional: ${row.nombre} (ID: ${row.profesional_id})`);
                console.log(`   Diferencia numérica: ${row.diferencia_numerica} | Tipo: ${row.tipo_coincidencia}`);
            });
        } else {
            console.log('   ⚠️ No se encontraron correspondencias obvias entre matrículas huérfanas y profesionales');
        }
        
        // 6. Resumen del impacto
        console.log('\n6. RESUMEN DEL IMPACTO:');
        const impactQuery = `
            SELECT 
                COUNT(DISTINCT ph.matricula) as total_matriculas_huerfanas,
                COUNT(*) as total_pagos_huerfanos,
                SUM(ph.importe) as total_importe_huerfano,
                AVG(ph.importe) as importe_promedio_huerfano,
                MIN(ph.fecha_pago) as fecha_mas_antigua,
                MAX(ph.fecha_pago) as fecha_mas_reciente
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL
        `;
        
        const impactResult = await pool.query(impactQuery);
        const impact = impactResult.rows[0];
        
        console.log('IMPACTO DE LAS MATRÍCULAS SIN CORRESPONDENCIA:');
        console.log(`📊 Matrículas huérfanas: ${parseInt(impact.total_matriculas_huerfanas).toLocaleString()}`);
        console.log(`💰 Pagos afectados: ${parseInt(impact.total_pagos_huerfanos).toLocaleString()}`);
        console.log(`💵 Importe total afectado: $${parseFloat(impact.total_importe_huerfano || 0).toLocaleString()}`);
        console.log(`📈 Importe promedio: $${parseFloat(impact.importe_promedio_huerfano || 0).toLocaleString()}`);
        console.log(`📅 Rango temporal: ${impact.fecha_mas_antigua.toISOString().split('T')[0]} - ${impact.fecha_mas_reciente.toISOString().split('T')[0]}`);
        
        const totalImporteQuery = 'SELECT SUM(importe) as total FROM copig.pagos_historicos';
        const totalResult = await pool.query(totalImporteQuery);
        const porcentajeImpacto = ((impact.total_importe_huerfano / totalResult.rows[0].total) * 100).toFixed(1);
        console.log(`📊 Porcentaje del total: ${porcentajeImpacto}% del valor total de pagos`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

detailedMatriculaAnalysis();