const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeDatePatterns() {
    try {
        // Analyze the date patterns to understand the correction needed
        const query = `
            SELECT 
                ph.matricula,
                ph.fecha_pago,
                EXTRACT(YEAR FROM ph.fecha_pago) as year_num,
                EXTRACT(MONTH FROM ph.fecha_pago) as month_num,
                EXTRACT(DAY FROM ph.fecha_pago) as day_num
            FROM copig.pagos_historicos ph
            WHERE EXTRACT(YEAR FROM ph.fecha_pago) > 2030
            ORDER BY ph.fecha_pago DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        console.log('=== ANALYZING DATE PATTERNS ===');
        console.log('Dates that need correction:');
        result.rows.forEach((row, index) => {
            const year = row.year_num;
            let correctedYear = year;
            
            if (year > 5000) {
                correctedYear = year - 3000; // 5202 -> 2202
            } else if (year > 4000) {
                correctedYear = year - 2000; // 4202 -> 2202  
            } else if (year > 3000) {
                correctedYear = year - 1000; // 3202 -> 2202
            } else if (year > 2200) {
                correctedYear = year - 200;  // 2221 -> 2021
            }
            
            console.log(`${index + 1}. Original: ${year}-${String(row.month_num).padStart(2, '0')}-${String(row.day_num).padStart(2, '0')} -> Corrected: ${correctedYear}-${String(row.month_num).padStart(2, '0')}-${String(row.day_num).padStart(2, '0')}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeDatePatterns();