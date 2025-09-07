const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigateStatusDiscrepancy() {
    console.log('🔍 INVESTIGANDO DISCREPANCIAS EN CÁLCULO DE ESTADOS');
    console.log('='.repeat(65));
    
    try {
        // 1. Verificar función de cálculo de estado
        console.log('📊 FASE 1: VERIFICAR FUNCIÓN calcular_estado_profesional');
        console.log('-'.repeat(55));
        
        const functionExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM pg_proc 
                WHERE proname = 'calcular_estado_profesional'
            )
        `);
        
        console.log(`Función existe: ${functionExists.rows[0].exists}`);
        
        if (functionExists.rows[0].exists) {
            // Mostrar definición de la función
            const functionDef = await pool.query(`
                SELECT pg_get_functiondef(oid) as definition
                FROM pg_proc 
                WHERE proname = 'calcular_estado_profesional'
            `);
            
            console.log('\nDefinición actual de la función:');
            console.log(functionDef.rows[0].definition);
        }
        
        // 2. Buscar profesionales con discrepancias
        console.log('\n🎯 FASE 2: BUSCAR PROFESIONALES CON DISCREPANCIAS');
        console.log('-'.repeat(50));
        
        // Obtener algunos profesionales para comparar estados
        const professionals = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_funcion,
                (
                    SELECT COUNT(*) 
                    FROM copig.pagos_historicos ph 
                    WHERE ph.matricula = m.numero_matricula::TEXT 
                    AND EXTRACT(YEAR FROM ph.fecha_pago) = 2025
                ) as pagos_2025,
                (
                    SELECT MAX(ph.fecha_pago)
                    FROM copig.pagos_historicos ph 
                    WHERE ph.matricula = m.numero_matricula::TEXT
                ) as ultimo_pago,
                (
                    SELECT SUM(ph.importe)
                    FROM copig.pagos_historicos ph 
                    WHERE ph.matricula = m.numero_matricula::TEXT
                    AND EXTRACT(YEAR FROM ph.fecha_pago) = 2025
                ) as total_pagado_2025
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            AND p.provincia = 'Mendoza'
            ORDER BY p.nombre
            LIMIT 10
        `);
        
        console.log('Muestra de profesionales y sus estados calculados:');
        console.log('=' .repeat(80));
        professionals.rows.forEach(prof => {
            console.log(`${prof.nombre} (Mat: ${prof.numero_matricula})`);
            console.log(`  Estado función: ${prof.estado_funcion}`);
            console.log(`  Pagos 2025: ${prof.pagos_2025} | Total 2025: $${prof.total_pagado_2025 || 0}`);
            console.log(`  Último pago: ${prof.ultimo_pago ? prof.ultimo_pago.toISOString().split('T')[0] : 'Nunca'}`);
            console.log('');
        });
        
        // 3. Verificar lógica de la función manualmente
        console.log('\n🧮 FASE 3: VERIFICAR LÓGICA MANUAL VS FUNCIÓN');
        console.log('-'.repeat(45));
        
        // Tomar el primer profesional y verificar manualmente
        const testProf = professionals.rows[0];
        
        console.log(`Verificando manualmente: ${testProf.nombre} (Mat: ${testProf.numero_matricula})`);
        
        // Verificar pagos detallados
        const detailedPayments = await pool.query(`
            SELECT 
                fecha_pago,
                importe,
                concepto,
                EXTRACT(YEAR FROM fecha_pago) as año,
                EXTRACT(MONTH FROM fecha_pago) as mes
            FROM copig.pagos_historicos 
            WHERE matricula = $1::TEXT
            ORDER BY fecha_pago DESC
        `, [testProf.numero_matricula]);
        
        console.log('\nPagos detallados:');
        detailedPayments.rows.forEach(pago => {
            console.log(`  ${pago.fecha_pago.toISOString().split('T')[0]} - $${pago.importe} - ${pago.concepto || 'Sin concepto'}`);
        });
        
        // 4. Verificar diferentes endpoints/consultas que calculan el estado
        console.log('\n🔄 FASE 4: COMPARAR DIFERENTES CONSULTAS DE ESTADO');
        console.log('-'.repeat(55));
        
        // Consulta como en el listado general (admin.html)
        const listingQuery = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                (
                    SELECT MAX(ph.fecha_pago)
                    FROM copig.pagos_historicos ph 
                    WHERE ph.matricula = m.numero_matricula::TEXT
                ) as ultimo_pago
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        `, [testProf.id]);
        
        // Consulta como en vista detallada
        const detailQuery = await pool.query(`
            SELECT 
                p.*,
                m.numero_matricula,
                COALESCE(
                    (SELECT SUM(importe) FROM copig.pagos_historicos 
                     WHERE matricula = m.numero_matricula::TEXT 
                     AND EXTRACT(YEAR FROM fecha_pago) = 2025), 0
                ) as total_pagado_2025,
                (SELECT COUNT(*) FROM copig.pagos_historicos 
                 WHERE matricula = m.numero_matricula::TEXT 
                 AND EXTRACT(YEAR FROM fecha_pago) = 2025) as cantidad_pagos_2025
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        `, [testProf.id]);
        
        console.log('Estado en listado general:', listingQuery.rows[0].estado);
        console.log('Último pago listado:', listingQuery.rows[0].ultimo_pago);
        
        const detailData = detailQuery.rows[0];
        console.log('Total pagado 2025 (detalle):', detailData.total_pagado_2025);
        console.log('Cantidad pagos 2025 (detalle):', detailData.cantidad_pagos_2025);
        
        // Cálculo manual del estado
        let estadoManual = 'MOROSO';
        if (detailData.total_pagado_2025 >= 144200) {
            estadoManual = 'AL_DIA';
        } else if (detailData.cantidad_pagos_2025 > 0) {
            estadoManual = 'EN_PROCESO';
        }
        
        console.log('Estado calculado manualmente:', estadoManual);
        console.log('Estado función:', listingQuery.rows[0].estado);
        
        // 5. Buscar casos específicos de discrepancia
        console.log('\n🚨 FASE 5: BUSCAR CASOS DE DISCREPANCIA ESPECÍFICOS');
        console.log('-'.repeat(55));
        
        const discrepancies = await pool.query(`
            WITH estados_calculados AS (
                SELECT 
                    p.id,
                    p.nombre,
                    m.numero_matricula,
                    calcular_estado_profesional(m.numero_matricula::TEXT) as estado_funcion,
                    CASE 
                        WHEN COALESCE(
                            (SELECT SUM(importe) FROM copig.pagos_historicos 
                             WHERE matricula = m.numero_matricula::TEXT 
                             AND EXTRACT(YEAR FROM fecha_pago) = 2025), 0
                        ) >= 144200 THEN 'AL_DIA'
                        WHEN COALESCE(
                            (SELECT COUNT(*) FROM copig.pagos_historicos 
                             WHERE matricula = m.numero_matricula::TEXT 
                             AND EXTRACT(YEAR FROM fecha_pago) = 2025), 0
                        ) > 0 THEN 'EN_PROCESO'
                        ELSE 'MOROSO'
                    END as estado_manual
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.activo = true 
                AND p.provincia = 'Mendoza'
                AND m.numero_matricula IS NOT NULL
            )
            SELECT *
            FROM estados_calculados
            WHERE estado_funcion != estado_manual
            LIMIT 10
        `);
        
        if (discrepancies.rows.length > 0) {
            console.log(`Encontradas ${discrepancies.rows.length} discrepancias:`);
            discrepancies.rows.forEach(disc => {
                console.log(`  ${disc.nombre} (${disc.numero_matricula})`);
                console.log(`    Función: ${disc.estado_funcion} vs Manual: ${disc.estado_manual}`);
            });
        } else {
            console.log('✅ No se encontraron discrepancias entre función y cálculo manual');
        }
        
        // 6. Verificar endpoints del servidor
        console.log('\n🌐 FASE 6: VERIFICAR ENDPOINTS DEL SERVIDOR');
        console.log('-'.repeat(40));
        
        console.log('Endpoints que podrían estar calculando estados:');
        console.log('  - GET /api/admin/profesionales (listado general)');
        console.log('  - GET /api/admin/profesional/:id (vista detallada)');
        console.log('  - La función calcular_estado_profesional() en PostgreSQL');
        
        console.log('\n🔧 RECOMENDACIONES PARA SOLUCIÓN:');
        console.log('  1. Verificar que ambos endpoints usen la misma función');
        console.log('  2. Revisar si hay cache o estados guardados en BD');
        console.log('  3. Asegurar que la función esté actualizada');
        console.log('  4. Comprobar si hay diferencias en zona horaria/fechas');
        
    } catch (error) {
        console.error('❌ Error en investigación:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

investigateStatusDiscrepancy()
    .then(() => {
        console.log('\n✅ Investigación completada');
        console.log('Revisar los resultados para identificar la causa de la discrepancia');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });