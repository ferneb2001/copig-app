const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeMatriculaRelationships() {
    try {
        console.log('=== ANÁLISIS DE RELACIONES MATRÍCULA-PROFESIONALES ===\n');
        
        // 1. Estadísticas generales de matrículas
        console.log('1. ESTADÍSTICAS GENERALES:');
        const generalStatsQuery = `
            SELECT 
                COUNT(DISTINCT ph.matricula) as matriculas_en_pagos,
                COUNT(DISTINCT m.numero) as matriculas_en_tabla_matriculas,
                COUNT(DISTINCT p.id) as profesionales_en_tabla,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as matriculas_con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as matriculas_sin_profesional
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
        `;
        
        const generalResult = await pool.query(generalStatsQuery);
        const stats = generalResult.rows[0];
        
        console.log(`Matrículas únicas en pagos_historicos: ${parseInt(stats.matriculas_en_pagos).toLocaleString()}`);
        console.log(`Matrículas en tabla matriculas: ${parseInt(stats.matriculas_en_tabla_matriculas).toLocaleString()}`);
        console.log(`Profesionales en tabla profesionales: ${parseInt(stats.profesionales_en_tabla).toLocaleString()}`);
        console.log(`Matrículas CON profesional: ${parseInt(stats.matriculas_con_profesional).toLocaleString()} (${((stats.matriculas_con_profesional / stats.matriculas_en_pagos) * 100).toFixed(1)}%)`);
        console.log(`Matrículas SIN profesional: ${parseInt(stats.matriculas_sin_profesional).toLocaleString()} (${((stats.matriculas_sin_profesional / stats.matriculas_en_pagos) * 100).toFixed(1)}%)`);
        
        // 2. Análisis del problema de JOIN actual
        console.log('\n2. ANÁLISIS DEL PROBLEMA DE JOIN:');
        const joinAnalysisQuery = `
            SELECT 
                'DIRECTO_NUMERO_DOCUMENTO' as tipo_join,
                COUNT(DISTINCT ph.matricula) as matriculas_totales,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as matriculas_encontradas,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as matriculas_perdidas
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.profesionales p ON ph.matricula::text = p.numero_documento::text
            
            UNION ALL
            
            SELECT 
                'VIA_TABLA_MATRICULAS' as tipo_join,
                COUNT(DISTINCT ph.matricula) as matriculas_totales,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as matriculas_encontradas,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as matriculas_perdidas
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            
            UNION ALL
            
            SELECT 
                'BIGINT_CONVERSION' as tipo_join,
                COUNT(DISTINCT ph.matricula) as matriculas_totales,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as matriculas_encontradas,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as matriculas_perdidas
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.profesionales p ON ph.matricula::bigint = p.numero_documento
        `;
        
        const joinResult = await pool.query(joinAnalysisQuery);
        console.log('Comparación de estrategias de JOIN:');
        joinResult.rows.forEach(row => {
            const effectiveness = ((row.matriculas_encontradas / row.matriculas_totales) * 100).toFixed(1);
            console.log(`${row.tipo_join}:`);
            console.log(`   Total: ${row.matriculas_totales} | Encontradas: ${row.matriculas_encontradas} | Perdidas: ${row.matriculas_perdidas}`);
            console.log(`   Efectividad: ${effectiveness}%`);
        });
        
        // 3. Identificar matrículas problemáticas
        console.log('\n3. ANÁLISIS DE MATRÍCULAS PROBLEMÁTICAS:');
        const problematicQuery = `
            WITH matriculas_problematicas AS (
                SELECT 
                    ph.matricula,
                    COUNT(*) as total_pagos,
                    SUM(ph.importe) as total_importe,
                    MIN(ph.fecha_pago) as fecha_primer_pago,
                    MAX(ph.fecha_pago) as fecha_ultimo_pago,
                    CASE 
                        WHEN m.numero IS NULL THEN 'NO_EN_TABLA_MATRICULAS'
                        WHEN m.profesional_id IS NULL THEN 'MATRICULA_SIN_PROFESIONAL_ID'
                        WHEN p.id IS NULL THEN 'PROFESIONAL_ID_INVALIDO'
                        ELSE 'RELACION_CORRECTA'
                    END as tipo_problema
                FROM copig.pagos_historicos ph
                LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
                LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
                GROUP BY ph.matricula, m.numero, m.profesional_id, p.id
            )
            SELECT 
                tipo_problema,
                COUNT(*) as cantidad_matriculas,
                SUM(total_pagos) as total_pagos_afectados,
                SUM(total_importe) as total_importe_afectado,
                AVG(total_pagos) as promedio_pagos_por_matricula,
                MIN(fecha_primer_pago) as fecha_mas_antigua,
                MAX(fecha_ultimo_pago) as fecha_mas_reciente
            FROM matriculas_problematicas
            GROUP BY tipo_problema
            ORDER BY cantidad_matriculas DESC
        `;
        
        const problematicResult = await pool.query(problematicQuery);
        console.log('Tipos de problemas encontrados:');
        problematicResult.rows.forEach(row => {
            console.log(`${row.tipo_problema}:`);
            console.log(`   Matrículas afectadas: ${row.cantidad_matriculas.toLocaleString()}`);
            console.log(`   Pagos afectados: ${row.total_pagos_afectados.toLocaleString()}`);
            console.log(`   Importe afectado: $${parseFloat(row.total_importe_afectado || 0).toLocaleString()}`);
            console.log(`   Promedio pagos por matrícula: ${parseFloat(row.promedio_pagos_por_matricula).toFixed(1)}`);
            console.log(`   Rango temporal: ${row.fecha_mas_antigua?.toISOString().split('T')[0]} - ${row.fecha_mas_reciente?.toISOString().split('T')[0]}`);
            console.log('');
        });
        
        // 4. Análisis de patrones de matrículas faltantes
        console.log('4. PATRONES DE MATRÍCULAS FALTANTES:');
        const patternsQuery = `
            SELECT 
                CASE 
                    WHEN ph.matricula::integer < 1000 THEN 'MATRICULAS_BAJAS_1-999'
                    WHEN ph.matricula::integer BETWEEN 1000 AND 4999 THEN 'MATRICULAS_MEDIAS_1000-4999'
                    WHEN ph.matricula::integer BETWEEN 5000 AND 9999 THEN 'MATRICULAS_ALTAS_5000-9999'
                    WHEN ph.matricula::integer >= 10000 THEN 'MATRICULAS_MUY_ALTAS_10000+'
                    ELSE 'MATRICULAS_INVALIDAS'
                END as rango_matricula,
                COUNT(DISTINCT ph.matricula) as total_matriculas,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional,
                ROUND(AVG(ph.matricula::integer), 0) as matricula_promedio
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            GROUP BY CASE 
                WHEN ph.matricula::integer < 1000 THEN 'MATRICULAS_BAJAS_1-999'
                WHEN ph.matricula::integer BETWEEN 1000 AND 4999 THEN 'MATRICULAS_MEDIAS_1000-4999'
                WHEN ph.matricula::integer BETWEEN 5000 AND 9999 THEN 'MATRICULAS_ALTAS_5000-9999'
                WHEN ph.matricula::integer >= 10000 THEN 'MATRICULAS_MUY_ALTAS_10000+'
                ELSE 'MATRICULAS_INVALIDAS'
            END
            ORDER BY matricula_promedio
        `;
        
        const patternsResult = await pool.query(patternsQuery);
        console.log('Patrones por rango de matrícula:');
        patternsResult.rows.forEach(row => {
            const porcentajeSinProfesional = ((row.sin_profesional / row.total_matriculas) * 100).toFixed(1);
            console.log(`${row.rango_matricula}:`);
            console.log(`   Total: ${row.total_matriculas} | Con prof: ${row.con_profesional} | Sin prof: ${row.sin_profesional} (${porcentajeSinProfesional}%)`);
            console.log(`   Matrícula promedio: ${row.matricula_promedio}`);
        });
        
        // 5. Ejemplos específicos de matrículas problemáticas
        console.log('\n5. EJEMPLOS DE MATRÍCULAS PROBLEMÁTICAS:');
        const examplesQuery = `
            SELECT 
                ph.matricula,
                COUNT(*) as pagos_count,
                SUM(ph.importe) as total_importe,
                MIN(ph.fecha_pago) as primer_pago,
                MAX(ph.fecha_pago) as ultimo_pago,
                m.numero as matricula_en_tabla,
                m.profesional_id,
                p.nombre as profesional_nombre,
                p.numero_documento,
                CASE 
                    WHEN m.numero IS NULL THEN 'NO_EXISTE_EN_MATRICULAS'
                    WHEN m.profesional_id IS NULL THEN 'SIN_PROFESIONAL_ID'
                    WHEN p.id IS NULL THEN 'PROFESIONAL_NO_EXISTE'
                    ELSE 'OK'
                END as diagnostico
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL
            GROUP BY ph.matricula, m.numero, m.profesional_id, p.nombre, p.numero_documento
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
        
        // 6. Verificación de integridad de datos
        console.log('\n6. VERIFICACIÓN DE INTEGRIDAD DE DATOS:');
        const integrityQuery = `
            -- Matrículas que tienen profesional pero con documento diferente
            SELECT 
                ph.matricula,
                p.nombre,
                p.numero_documento,
                COUNT(*) as pagos
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NOT NULL 
            AND ph.matricula::bigint != p.numero_documento
            GROUP BY ph.matricula, p.nombre, p.numero_documento
            ORDER BY pagos DESC
            LIMIT 10
        `;
        
        const integrityResult = await pool.query(integrityQuery);
        console.log('Inconsistencias: Matrículas que no coinciden con número_documento:');
        if (integrityResult.rows.length > 0) {
            integrityResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Matrícula en pagos: ${row.matricula} | Doc profesional: ${row.numero_documento}`);
                console.log(`   Nombre: ${row.nombre} | Pagos afectados: ${row.pagos}`);
            });
        } else {
            console.log('   ✅ No se encontraron inconsistencias documento-matrícula');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeMatriculaRelationships();