const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testPagosAPI() {
    try {
        console.log('=== PRUEBA DE CONSULTAS SQL CORREGIDAS ===\n');

        // Test 1: Estadísticas generales
        console.log('1. Probando estadísticas generales...');
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT ph.matricula::text) as total_matriculas,
                COUNT(*) as total_pagos,
                COALESCE(SUM(ph.importe), 0) as total_recaudado,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'pagado') as pagos_completados,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'pendiente') as pagos_pendientes,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'vencido') as pagos_vencidos
            FROM copig.pagos_historicos ph
        `;
        
        const statsResult = await pool.query(statsQuery);
        console.log('✅ Estadísticas generales:', statsResult.rows[0]);

        // Test 2: Consulta con JOIN
        console.log('\n2. Probando JOIN con profesionales...');
        const joinQuery = `
            SELECT 
                ph.id,
                ph.matricula,
                p.nombre as profesional_nombre,
                ph.concepto,
                ph.importe,
                ph.fecha_pago,
                ph.estado
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.profesionales p ON ph.matricula::bigint = p.numero_documento
            LIMIT 3
        `;
        
        const joinResult = await pool.query(joinQuery);
        console.log('✅ JOIN con profesionales:');
        joinResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. Matrícula: ${row.matricula}, Nombre: ${row.profesional_nombre || 'No encontrado'}, Importe: $${row.importe}`);
        });

        // Test 3: Filtro por matrícula específica
        console.log('\n3. Probando filtro por matrícula...');
        const matriculaTest = 334;
        const filtroQuery = `
            SELECT 
                ph.id,
                ph.matricula,
                p.nombre as profesional_nombre,
                ph.importe,
                ph.estado
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.profesionales p ON ph.matricula::bigint = p.numero_documento
            WHERE ph.matricula::bigint = $1
            LIMIT 3
        `;
        
        const filtroResult = await pool.query(filtroQuery, [matriculaTest]);
        console.log(`✅ Filtro por matrícula ${matriculaTest}:`, filtroResult.rows.length, 'resultados');
        filtroResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Nombre: ${row.profesional_nombre || 'No encontrado'}, Estado: ${row.estado}`);
        });

        // Test 4: Búsqueda LIKE con texto
        console.log('\n4. Probando búsqueda LIKE...');
        const likeQuery = `
            SELECT 
                ph.matricula,
                COUNT(*) as cantidad
            FROM copig.pagos_historicos ph
            WHERE ph.matricula::text ILIKE $1
            GROUP BY ph.matricula
            LIMIT 5
        `;
        
        const likeResult = await pool.query(likeQuery, ['%34%']);
        console.log('✅ Búsqueda LIKE con "34":', likeResult.rows.length, 'resultados');
        likeResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. Matrícula: ${row.matricula}, Cantidad pagos: ${row.cantidad}`);
        });

        console.log('\n🎉 Todas las consultas SQL funcionan correctamente!');

    } catch (error) {
        console.error('❌ Error en las consultas:', error.message);
        console.error('Detalles:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar pruebas
testPagosAPI();