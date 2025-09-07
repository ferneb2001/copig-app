const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigatePaymentSystem() {
    try {
        console.log('=== INVESTIGANDO SISTEMA DE CUOTAS EN DBF ===\n');

        // 1. Buscar profesionales con múltiples pagos en el mismo año
        console.log('1. PROFESIONALES CON MÚLTIPLES PAGOS EN EL MISMO AÑO:');
        const multiplePaymentsQuery = await pool.query(`
            SELECT 
                ph.matricula,
                EXTRACT(YEAR FROM ph.fecha_pago) as año,
                COUNT(*) as cantidad_pagos,
                ARRAY_AGG(EXTRACT(MONTH FROM ph.fecha_pago) ORDER BY ph.fecha_pago) as meses,
                ARRAY_AGG(ph.importe ORDER BY ph.fecha_pago) as montos,
                ARRAY_AGG(TO_CHAR(ph.fecha_pago, 'DD/MM/YYYY') ORDER BY ph.fecha_pago) as fechas,
                ARRAY_AGG(ph.detalle ORDER BY ph.fecha_pago) as detalles
            FROM copig.pagos_historicos ph
            WHERE ph.fecha_pago IS NOT NULL 
            AND EXTRACT(YEAR FROM ph.fecha_pago) >= 2020
            GROUP BY ph.matricula, EXTRACT(YEAR FROM ph.fecha_pago)
            HAVING COUNT(*) > 1
            ORDER BY cantidad_pagos DESC, año DESC
            LIMIT 10
        `);
        
        multiplePaymentsQuery.rows.forEach((pago, index) => {
            console.log(`\n   ${index + 1}. Matrícula: ${pago.matricula} - Año: ${pago.año}`);
            console.log(`      Cantidad pagos: ${pago.cantidad_pagos}`);
            console.log(`      Meses: ${pago.meses.join(', ')}`);
            console.log(`      Montos: $${pago.montos.map(m => parseFloat(m)).join(', $')}`);
            console.log(`      Fechas: ${pago.fechas.join(' | ')}`);
            console.log(`      Detalles: ${pago.detalles.join(' | ')}`);
        });

        // 2. Analizar patrones en el campo "detalle" para entender las cuotas
        console.log('\n2. ANÁLISIS DE DETALLES/CONCEPTOS MÁS COMUNES:');
        const conceptsQuery = await pool.query(`
            SELECT 
                COALESCE(detalle, concepto, 'SIN_CONCEPTO') as concepto_detalle,
                COUNT(*) as cantidad,
                ROUND(AVG(importe::numeric), 2) as monto_promedio,
                MIN(fecha_pago) as fecha_minima,
                MAX(fecha_pago) as fecha_maxima
            FROM copig.pagos_historicos ph
            WHERE ph.fecha_pago IS NOT NULL
            GROUP BY COALESCE(detalle, concepto, 'SIN_CONCEPTO')
            ORDER BY cantidad DESC
            LIMIT 15
        `);
        
        conceptsQuery.rows.forEach((concepto, index) => {
            console.log(`   ${index + 1}. "${concepto.concepto_detalle}"`);
            console.log(`      Cantidad: ${concepto.cantidad} pagos`);
            console.log(`      Monto promedio: $${concepto.monto_promedio}`);
            console.log(`      Período: ${concepto.fecha_minima?.toLocaleDateString('es-AR')} - ${concepto.fecha_maxima?.toLocaleDateString('es-AR')}`);
            console.log('');
        });

        // 3. Buscar específicamente patrones de cuotas (1/3, 2/3, 3/3)
        console.log('3. BUSCANDO PATRONES DE CUOTAS (1/3, 2/3, 3/3):');
        const cuotasQuery = await pool.query(`
            SELECT 
                detalle,
                concepto,
                COUNT(*) as cantidad
            FROM copig.pagos_historicos ph
            WHERE (detalle ILIKE '%cuota%' OR detalle ILIKE '%1/%' OR detalle ILIKE '%2/%' OR detalle ILIKE '%3/%'
                   OR concepto ILIKE '%cuota%' OR concepto ILIKE '%1/%' OR concepto ILIKE '%2/%' OR concepto ILIKE '%3/%')
            GROUP BY detalle, concepto
            ORDER BY cantidad DESC
            LIMIT 20
        `);
        
        if (cuotasQuery.rows.length > 0) {
            cuotasQuery.rows.forEach((cuota, index) => {
                console.log(`   ${index + 1}. Detalle: "${cuota.detalle || 'NULL'}" | Concepto: "${cuota.concepto || 'NULL'}" | Cantidad: ${cuota.cantidad}`);
            });
        } else {
            console.log('   No se encontraron patrones explícitos de cuotas en detalle/concepto');
        }

        // 4. Analizar restricciones para entender estados
        console.log('\n4. ANALIZANDO RESTRICCIONES PARA ENTENDER ESTADOS:');
        const restrictionsQuery = await pool.query(`
            SELECT 
                COUNT(*) as total_restricciones,
                COUNT(CASE WHEN descripcion ILIKE '%moroso%' THEN 1 END) as morosos,
                COUNT(CASE WHEN descripcion ILIKE '%suspendid%' THEN 1 END) as suspendidos,
                COUNT(CASE WHEN descripcion ILIKE '%deuda%' THEN 1 END) as con_deuda
            FROM copig.restricciones_deudas
        `);
        
        if (restrictionsQuery.rows.length > 0) {
            const stats = restrictionsQuery.rows[0];
            console.log(`   Total restricciones: ${stats.total_restricciones}`);
            console.log(`   Morosos: ${stats.morosos}`);
            console.log(`   Suspendidos: ${stats.suspendidos}`);
            console.log(`   Con deuda: ${stats.con_deuda}`);
        }

        // 5. Examinar algunos casos específicos de restricciones
        console.log('\n5. EJEMPLOS DE RESTRICCIONES:');
        const exampleRestrictions = await pool.query(`
            SELECT matricula, descripcion, fecha_inicio, fecha_fin
            FROM copig.restricciones_deudas
            LIMIT 5
        `);
        
        exampleRestrictions.rows.forEach((rest, index) => {
            console.log(`   ${index + 1}. Mat: ${rest.matricula} - "${rest.descripcion}"`);
            console.log(`      Desde: ${rest.fecha_inicio || 'N/A'} | Hasta: ${rest.fecha_fin || 'N/A'}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

investigatePaymentSystem();