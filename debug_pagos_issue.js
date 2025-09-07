const { Pool } = require('pg');

// Configuración de base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugPaymentsIssue() {
    try {
        console.log('=== DIAGNÓSTICO PROBLEMA PAGOS ===\n');

        // 1. Verificar si existe la tabla pagos_historicos
        console.log('1. Verificando existencia tabla pagos_historicos...');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name LIKE '%pago%'
        `);
        console.log('Tablas relacionadas con pagos:', tablesResult.rows);

        // 2. Contar registros en pagos_historicos
        console.log('\n2. Contando registros en pagos_historicos...');
        const countResult = await pool.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        console.log('Total pagos históricos:', countResult.rows[0].total);

        // 3. Ver estructura de la tabla profesionales
        console.log('\n3. Verificando estructura tabla profesionales...');
        const profStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        console.log('Columnas en tabla profesionales:');
        profStructure.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type}`);
        });

        // 4. Ver algunos pagos de ejemplo
        console.log('\n4. Ejemplos de pagos históricos...');
        const samplePayments = await pool.query(`
            SELECT matricula, fecha_pago, monto, concepto 
            FROM copig.pagos_historicos 
            LIMIT 5
        `);
        console.log('Ejemplos de pagos:');
        samplePayments.rows.forEach(pago => {
            console.log(`- Matrícula: ${pago.matricula}, Fecha: ${pago.fecha_pago}, Monto: ${pago.monto}, Concepto: ${pago.concepto}`);
        });

        // 5. Verificar relación entre profesionales y pagos
        console.log('\n5. Verificando relación profesionales-pagos...');
        const relationCheck = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                COUNT(ph.id) as total_pagos
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula = ph.matricula
            WHERE p.id IN (1, 2, 3)
            GROUP BY p.id, p.nombre, m.numero_matricula
            ORDER BY p.id
        `);
        console.log('Relación profesionales-pagos (primeros 3):');
        relationCheck.rows.forEach(rel => {
            console.log(`- ${rel.nombre} (Mat: ${rel.numero_matricula}) - Pagos: ${rel.total_pagos}`);
        });

        // 6. Ver endpoint API usado para obtener pagos
        console.log('\n6. Verificando datos del profesional ABAD, CARLOS ADRIAN...');
        const abadCheck = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                m.numero_matricula,
                COUNT(ph.id) as pagos_count
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id  
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula = ph.matricula
            WHERE p.numero_documento = '17086342'
            GROUP BY p.id, p.nombre, p.numero_documento, m.numero_matricula
        `);
        console.log('Datos de ABAD, CARLOS:');
        console.log(abadCheck.rows);

    } catch (error) {
        console.error('Error en diagnóstico:', error.message);
    } finally {
        await pool.end();
    }
}

debugPaymentsIssue();