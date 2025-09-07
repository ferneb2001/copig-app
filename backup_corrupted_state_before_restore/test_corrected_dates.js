const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testCorrectedDates() {
    try {
        // Test the corrected date query
        const query = `
            SELECT 
                ph.id,
                ph.matricula,
                p.nombre as profesional_nombre,
                ph.concepto,
                ph.importe,
                ph.fecha_pago as original_fecha,
                CASE 
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2100 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2050 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 2000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    ELSE ph.fecha_pago 
                END as fecha_corregida,
                ph.estado
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE EXTRACT(YEAR FROM ph.fecha_pago) > 2030
            ORDER BY ph.fecha_pago DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        console.log('=== TESTING DATE CORRECTION ===');
        console.log('Results with corrected dates:');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. Matrícula: ${row.matricula}`);
            console.log(`   Nombre: ${row.profesional_nombre || 'Sin nombre'}`);
            console.log(`   Fecha original: ${row.original_fecha.toISOString().split('T')[0]}`);
            console.log(`   Fecha corregida: ${row.fecha_corregida.toISOString().split('T')[0]}`);
            console.log(`   Estado: ${row.estado}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testCorrectedDates();