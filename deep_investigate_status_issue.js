const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function deepInvestigateStatusIssue() {
    console.log('🔍 INVESTIGACIÓN PROFUNDA - DISCREPANCIAS DE ESTADOS');
    console.log('='.repeat(70));
    
    try {
        // 1. Buscar un caso específico con discrepancia
        console.log('📊 FASE 1: IDENTIFICAR CASO ESPECÍFICO CON DISCREPANCIA');
        console.log('-'.repeat(55));
        
        // Buscar profesional que tenga discrepancia
        const discrepancyCase = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_funcion,
                (
                    SELECT COALESCE(SUM(importe), 0)
                    FROM copig.pagos_historicos 
                    WHERE matricula = m.numero_matricula::TEXT 
                    AND EXTRACT(YEAR FROM fecha_pago) = 2025
                ) as total_2025,
                (
                    SELECT COUNT(*)
                    FROM copig.pagos_historicos 
                    WHERE matricula = m.numero_matricula::TEXT 
                    AND EXTRACT(YEAR FROM fecha_pago) = 2025
                ) as pagos_2025
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true 
            AND p.provincia = 'Mendoza'
            AND calcular_estado_profesional(m.numero_matricula::TEXT) = 'MOROSO'
            AND (
                SELECT COALESCE(SUM(importe), 0)
                FROM copig.pagos_historicos 
                WHERE matricula = m.numero_matricula::TEXT 
                AND EXTRACT(YEAR FROM fecha_pago) = 2025
            ) >= 144200
            LIMIT 5
        `);
        
        if (discrepancyCase.rows.length > 0) {
            console.log('🚨 CASOS CON DISCREPANCIA ENCONTRADOS:');
            discrepancyCase.rows.forEach(caso => {
                console.log(`  ${caso.nombre} (${caso.numero_matricula})`);
                console.log(`    Estado función: ${caso.estado_funcion}`);
                console.log(`    Total 2025: $${caso.total_2025}`);
                console.log(`    Pagos 2025: ${caso.pagos_2025}`);
                console.log(`    DEBERÍA SER: AL_DIA (porque pagó $${caso.total_2025} >= $144200)`);
                console.log('');
            });
        } else {
            console.log('✅ No se encontraron casos con discrepancia directa');
        }
        
        // 2. Verificar qué están usando los endpoints del servidor
        console.log('🌐 FASE 2: VERIFICAR ENDPOINTS DEL SERVIDOR');
        console.log('-'.repeat(45));
        
        // Simular consulta del listado general (admin.html)
        const listingQuery = `
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                (
                    SELECT MAX(ph.fecha_pago)::TEXT
                    FROM copig.pagos_historicos ph 
                    WHERE ph.matricula = m.numero_matricula::TEXT
                ) as ultimo_pago
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true 
            AND p.provincia = 'Mendoza'
            ORDER BY p.nombre
            LIMIT 10
        `;
        
        const listingResult = await pool.query(listingQuery);
        console.log('QUERY DEL LISTADO GENERAL:');
        console.log('Estados desde función calcular_estado_profesional():');
        listingResult.rows.forEach(row => {
            console.log(`  ${row.nombre}: ${row.estado} | Mat: ${row.numero_matricula} | Último: ${row.ultimo_pago}`);
        });
        
        // 3. Simular consulta de vista detallada
        console.log('\n📋 FASE 3: SIMULAR VISTA DETALLADA');
        console.log('-'.repeat(35));
        
        const testProfId = listingResult.rows[0].id;
        const testMatricula = listingResult.rows[0].numero_matricula;
        
        console.log(`Analizando: ${listingResult.rows[0].nombre} (ID: ${testProfId}, Mat: ${testMatricula})`);
        
        // Consulta como la que haría la vista detallada
        const detailQuery = await pool.query(`
            SELECT 
                p.*,
                m.numero_matricula,
                (
                    SELECT COALESCE(SUM(importe), 0)
                    FROM copig.pagos_historicos 
                    WHERE matricula = m.numero_matricula::TEXT 
                    AND EXTRACT(YEAR FROM fecha_pago) = 2025
                ) as total_pagado_2025,
                (
                    SELECT COUNT(*)
                    FROM copig.pagos_historicos 
                    WHERE matricula = m.numero_matricula::TEXT 
                    AND EXTRACT(YEAR FROM fecha_pago) = 2025
                ) as cantidad_pagos_2025,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_funcion
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        `, [testProfId]);
        
        const detailData = detailQuery.rows[0];
        
        console.log('DATOS VISTA DETALLADA:');
        console.log(`  Estado función: ${detailData.estado_funcion}`);
        console.log(`  Total pagado 2025: $${detailData.total_pagado_2025}`);
        console.log(`  Cantidad pagos 2025: ${detailData.cantidad_pagos_2025}`);
        
        // Calcular estado manualmente como lo haría el frontend
        let estadoFrontend = 'MOROSO';
        if (detailData.total_pagado_2025 >= 144200) {
            estadoFrontend = 'AL_DIA';
        } else if (detailData.cantidad_pagos_2025 > 0) {
            estadoFrontend = 'EN_PROCESO';
        }
        
        console.log(`  Estado calculado por frontend: ${estadoFrontend}`);
        
        const coincide = detailData.estado_funcion === estadoFrontend ? '✅ COINCIDEN' : '❌ NO COINCIDEN';
        console.log(`  ${coincide}`);
        
        if (detailData.estado_funcion !== estadoFrontend) {
            console.log('\n🚨 DISCREPANCIA DETECTADA!');
            console.log('  La función PostgreSQL devuelve un estado');
            console.log('  Pero el frontend calcularía otro estado');
        }
        
        // 4. Verificar la función paso a paso
        console.log('\n🔧 FASE 4: EJECUTAR FUNCIÓN PASO A PASO');
        console.log('-'.repeat(40));
        
        const stepByStep = await pool.query(`
            WITH debug_data AS (
                SELECT 
                    $1::TEXT as matricula,
                    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER as current_year,
                    (
                        SELECT COUNT(*)
                        FROM copig.pagos_historicos 
                        WHERE matricula = $1::TEXT 
                        AND EXTRACT(YEAR FROM fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE)
                        AND fecha_pago IS NOT NULL
                    ) as payments_current_year,
                    (
                        SELECT COALESCE(SUM(importe), 0)
                        FROM copig.pagos_historicos 
                        WHERE matricula = $1::TEXT 
                        AND EXTRACT(YEAR FROM fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE)
                        AND fecha_pago IS NOT NULL
                    ) as total_amount_current_year
            )
            SELECT *,
                CASE 
                    WHEN total_amount_current_year >= 144200 THEN 'AL_DIA'
                    WHEN payments_current_year > 0 THEN 'EN_PROCESO'
                    ELSE 'MOROSO'
                END as estado_esperado
            FROM debug_data
        `, [testMatricula]);
        
        const debugData = stepByStep.rows[0];
        console.log('DEBUG PASO A PASO:');
        console.log(`  Matrícula: ${debugData.matricula}`);
        console.log(`  Año actual: ${debugData.current_year}`);
        console.log(`  Pagos año actual: ${debugData.payments_current_year}`);
        console.log(`  Total año actual: $${debugData.total_amount_current_year}`);
        console.log(`  Estado esperado: ${debugData.estado_esperado}`);
        console.log(`  Estado función: ${detailData.estado_funcion}`);
        
        // 5. Verificar si hay diferencia en los datos que ve la función vs las consultas directas
        console.log('\n🔍 FASE 5: COMPARAR DATOS DIRECTOS');
        console.log('-'.repeat(35));
        
        const directPayments = await pool.query(`
            SELECT 
                fecha_pago,
                importe,
                concepto,
                EXTRACT(YEAR FROM fecha_pago) as año
            FROM copig.pagos_historicos 
            WHERE matricula = $1::TEXT
            AND EXTRACT(YEAR FROM fecha_pago) = 2025
            ORDER BY fecha_pago DESC
        `, [testMatricula.toString()]);
        
        console.log(`Pagos directos para matrícula ${testMatricula} en 2025:`);
        let totalDirecto = 0;
        directPayments.rows.forEach(pago => {
            totalDirecto += parseFloat(pago.importe);
            console.log(`  ${pago.fecha_pago.toISOString().split('T')[0]}: $${pago.importe} (${pago.concepto || 'Sin concepto'})`);
        });
        console.log(`Total directo: $${totalDirecto}`);
        console.log(`Total desde función: $${debugData.total_amount_current_year}`);
        
        // 6. Recomendar solución
        console.log('\n💡 RECOMENDACIONES:');
        console.log('-'.repeat(20));
        
        if (detailData.estado_funcion !== estadoFrontend) {
            console.log('🔧 PROBLEMA DETECTADO: Frontend y función calculan diferente');
            console.log('SOLUCIONES POSIBLES:');
            console.log('1. Actualizar frontend para usar solo calcular_estado_profesional()');
            console.log('2. O actualizar función para que coincida con frontend');
            console.log('3. Verificar si hay cache o datos obsoletos');
        } else {
            console.log('✅ Estados coinciden para este caso');
            console.log('El problema puede ser:');
            console.log('1. Cache del navegador');
            console.log('2. Estados calculados en diferentes momentos');
            console.log('3. Datos diferentes entre endpoints');
        }
        
    } catch (error) {
        console.error('❌ Error en investigación profunda:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

deepInvestigateStatusIssue()
    .then(() => {
        console.log('\n✅ Investigación profunda completada');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });