const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testComprehensiveFixes() {
    try {
        console.log('=== TESTING COMPREHENSIVE FIXES ===\n');
        
        // Test 1: Date correction for ALL problematic records
        console.log('1. Testing date corrections:');
        const dateQuery = `
            SELECT 
                ph.matricula,
                ph.fecha_pago as original_date,
                CASE 
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    ELSE ph.fecha_pago 
                END as corrected_date
            FROM copig.pagos_historicos ph
            WHERE EXTRACT(YEAR FROM ph.fecha_pago) > 2030
            ORDER BY ph.fecha_pago DESC
            LIMIT 10
        `;
        
        const dateResult = await pool.query(dateQuery);
        dateResult.rows.forEach((row, index) => {
            const originalYear = row.original_date.getFullYear();
            const correctedYear = row.corrected_date.getFullYear();
            console.log(`   ${index + 1}. Mat: ${row.matricula} | ${originalYear} -> ${correctedYear} | ${row.corrected_date.toISOString().split('T')[0]}`);
        });
        
        // Test 2: Professional names with proper JOINs
        console.log('\n2. Testing professional names (JOIN fixes):');
        const nameQuery = `
            SELECT 
                ph.matricula,
                p.nombre as profesional_nombre,
                CASE 
                    WHEN p.nombre IS NOT NULL THEN 'HAS NAME'
                    ELSE 'NO NAME'
                END as name_status
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            ORDER BY ph.fecha_pago DESC
            LIMIT 10
        `;
        
        const nameResult = await pool.query(nameQuery);
        nameResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. Mat: ${row.matricula} | ${row.name_status} | ${row.profesional_nombre || 'Sin nombre'}`);
        });
        
        // Test 3: Pagination data simulation
        console.log('\n3. Testing pagination calculations:');
        const countQuery = 'SELECT COUNT(*) as total FROM copig.pagos_historicos';
        const countResult = await pool.query(countQuery);
        const totalRecords = parseInt(countResult.rows[0].total);
        const limit = 50;
        const totalPages = Math.ceil(totalRecords / limit);
        
        console.log(`   Total records: ${totalRecords.toLocaleString()}`);
        console.log(`   Records per page: ${limit}`);
        console.log(`   Total pages: ${totalPages.toLocaleString()}`);
        console.log(`   Page 1: records 1-${Math.min(limit, totalRecords)}`);
        console.log(`   Page 2: records ${limit + 1}-${Math.min(limit * 2, totalRecords)}`);
        console.log(`   Last page: records ${((totalPages - 1) * limit) + 1}-${totalRecords}`);
        
        // Test 4: Combined query (full API simulation)
        console.log('\n4. Testing full API query:');
        const fullQuery = `
            SELECT 
                ph.id,
                ph.matricula,
                p.nombre as profesional_nombre,
                ph.concepto,
                ph.importe,
                CASE 
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    ELSE ph.fecha_pago 
                END as fecha_pago,
                ph.estado
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            ORDER BY 
                CASE 
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    ELSE ph.fecha_pago 
                END DESC
            LIMIT 5
        `;
        
        const fullResult = await pool.query(fullQuery);
        console.log(`   API Response simulation (5 records):`);
        fullResult.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. Mat: ${row.matricula} | ${row.profesional_nombre || 'Sin nombre'} | ${row.fecha_pago.toISOString().split('T')[0]} | $${row.importe}`);
        });
        
        console.log('\n=== SUMMARY ===');
        const withNames = fullResult.rows.filter(row => row.profesional_nombre).length;
        const validYears = fullResult.rows.filter(row => row.fecha_pago.getFullYear() <= 2025).length;
        console.log(`✅ Names: ${withNames}/5 records have professional names`);
        console.log(`✅ Dates: ${validYears}/5 records have valid years (≤ 2025)`);
        console.log(`✅ Pagination: Ready for ${totalPages.toLocaleString()} pages`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testComprehensiveFixes();