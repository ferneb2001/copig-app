const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testCurrentStatsQuery() {
    try {
        console.log('=== TESTING CURRENT STATISTICS QUERY ===');
        
        // Test current query
        const query = `
            SELECT 
                COUNT(DISTINCT ph.matricula::text) as total_matriculas,
                COUNT(*) as total_pagos,
                COALESCE(SUM(ph.importe), 0) as total_recaudado,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'pagado') as pagos_completados,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'pendiente') as pagos_pendientes,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'vencido') as pagos_vencidos
            FROM copig.pagos_historicos ph
        `;
        
        const result = await pool.query(query);
        const stats = result.rows[0];
        
        console.log('Current query results:');
        console.log('- Total matrículas:', stats.total_matriculas);
        console.log('- Total pagos:', stats.total_pagos);
        console.log('- Total recaudado:', parseFloat(stats.total_recaudado));
        console.log('- Pagos completados:', stats.pagos_completados);
        console.log('- Pagos pendientes:', stats.pagos_pendientes);
        console.log('- Pagos vencidos:', stats.pagos_vencidos);
        
        // Check what estados exist
        const estadosQuery = `
            SELECT estado, COUNT(*) as count, SUM(importe) as total_importe
            FROM copig.pagos_historicos 
            GROUP BY estado 
            ORDER BY count DESC
        `;
        
        const estadosResult = await pool.query(estadosQuery);
        console.log('\nEstados found in database:');
        estadosResult.rows.forEach(row => {
            console.log(`- '${row.estado}': ${row.count} records, $${parseFloat(row.total_importe || 0).toLocaleString()}`);
        });
        
        // Test with correct estado values
        const correctedQuery = `
            SELECT 
                COUNT(DISTINCT ph.matricula::text) as total_matriculas,
                COUNT(*) as total_pagos,
                COALESCE(SUM(ph.importe), 0) as total_recaudado,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'pagado') as pagos_completados,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'pendiente') as pagos_pendientes,
                COUNT(*) FILTER (WHERE LOWER(ph.estado) = 'vencido') as pagos_vencidos,
                COUNT(*) FILTER (WHERE LOWER(ph.detalle) = 'pagado') as detalle_pagados
            FROM copig.pagos_historicos ph
        `;
        
        const correctedResult = await pool.query(correctedQuery);
        const correctedStats = correctedResult.rows[0];
        
        console.log('\nCorrected query with detalle check:');
        console.log('- Detalle pagados:', correctedStats.detalle_pagados);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testCurrentStatsQuery();