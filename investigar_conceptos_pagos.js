const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarConceptos() {
    try {
        console.log('🔍 INVESTIGANDO CONCEPTOS DE PAGOS\n');
        
        // 1. Verificar estructura de pagos_historicos
        console.log('=== ESTRUCTURA TABLA PAGOS_HISTORICOS ===');
        const estructura = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}`);
        });
        
        // 2. Ver ejemplos específicos de ABAD, CARLOS ADRIAN
        console.log('\n=== PAGOS DE ABAD, CARLOS ADRIAN ===');
        const pagosAbad = await pool.query(`
            SELECT 
                fecha_pago,
                concepto,
                detalle,
                importe,
                numero_recibo,
                CASE 
                    WHEN concepto IS NOT NULL AND concepto != '' THEN concepto
                    WHEN detalle IS NOT NULL AND detalle != '' THEN detalle
                    ELSE 'Sin información'
                END as concepto_real
            FROM copig.pagos_historicos 
            WHERE matricula = '10030'
            ORDER BY fecha_pago DESC
            LIMIT 10
        `);
        
        console.log('Pagos encontrados:');
        pagosAbad.rows.forEach(pago => {
            console.log(`${pago.fecha_pago?.toISOString().split('T')[0]} | Concepto: "${pago.concepto}" | Detalle: "${pago.detalle}" | Concepto Real: "${pago.concepto_real}" | $${pago.importe} | Recibo: ${pago.numero_recibo || 'N/A'}`);
        });
        
        // 3. Estadísticas generales de conceptos vs detalles
        console.log('\n=== ESTADÍSTICAS CONCEPTOS vs DETALLES ===');
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_pagos,
                COUNT(concepto) as con_concepto_no_null,
                COUNT(CASE WHEN concepto IS NOT NULL AND concepto != '' THEN 1 END) as con_concepto_texto,
                COUNT(detalle) as con_detalle_no_null,
                COUNT(CASE WHEN detalle IS NOT NULL AND detalle != '' THEN 1 END) as con_detalle_texto
            FROM copig.pagos_historicos
        `);
        
        const stat = stats.rows[0];
        console.log(`Total pagos: ${stat.total_pagos}`);
        console.log(`Con concepto NOT NULL: ${stat.con_concepto_no_null}`);
        console.log(`Con concepto con texto: ${stat.con_concepto_texto}`);
        console.log(`Con detalle NOT NULL: ${stat.con_detalle_no_null}`);
        console.log(`Con detalle con texto: ${stat.con_detalle_texto}`);
        
        // 4. Ver ejemplos de detalles
        console.log('\n=== EJEMPLOS DE DETALLES DISPONIBLES ===');
        const ejemplosDetalle = await pool.query(`
            SELECT DISTINCT detalle, COUNT(*) as cantidad
            FROM copig.pagos_historicos 
            WHERE detalle IS NOT NULL AND detalle != ''
            GROUP BY detalle
            ORDER BY cantidad DESC
            LIMIT 15
        `);
        
        console.log('Detalles más comunes:');
        ejemplosDetalle.rows.forEach(det => {
            console.log(`"${det.detalle}": ${det.cantidad} pagos`);
        });
        
        // 5. Ver ejemplos de conceptos (si los hay)
        console.log('\n=== EJEMPLOS DE CONCEPTOS DISPONIBLES ===');
        const ejemplosConcepto = await pool.query(`
            SELECT DISTINCT concepto, COUNT(*) as cantidad
            FROM copig.pagos_historicos 
            WHERE concepto IS NOT NULL AND concepto != ''
            GROUP BY concepto
            ORDER BY cantidad DESC
            LIMIT 10
        `);
        
        if (ejemplosConcepto.rows.length > 0) {
            console.log('Conceptos disponibles:');
            ejemplosConcepto.rows.forEach(con => {
                console.log(`"${con.concepto}": ${con.cantidad} pagos`);
            });
        } else {
            console.log('❌ NO hay conceptos con texto - solo campo detalle tiene información');
        }
        
        // 6. Verificar endpoints que usan estos datos
        console.log('\n=== ANÁLISIS DEL PROBLEMA ===');
        console.log('El problema parece ser que:');
        console.log('1. Los datos reales están en el campo "detalle"');
        console.log('2. El campo "concepto" está vacío/null');
        console.log('3. El frontend/backend está consultando "concepto" en lugar de "detalle"');
        console.log('\nSOLUCIÓN: Modificar queries para usar "detalle" o crear un campo combinado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

investigarConceptos().catch(console.error);