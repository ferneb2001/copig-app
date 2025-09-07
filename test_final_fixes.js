const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testFinalFixes() {
    try {
        // Test the final corrected query that matches what's in server.js
        const query = `
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
                    ELSE ph.fecha_pago 
                END as fecha_pago,
                ph.estado,
                ph.numero_recibo,
                ph.detalle,
                ph.categoria,
                ph.ano_habilitacion
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            ORDER BY 
                CASE 
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                        DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
                    ELSE ph.fecha_pago 
                END DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        console.log('=== FINAL TEST - BOTH FIXES ===');
        console.log('Results with corrected dates AND professional names:');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. Matrícula: ${row.matricula}`);
            console.log(`   Nombre: ${row.profesional_nombre || 'Sin nombre'}`);
            console.log(`   Fecha: ${row.fecha_pago.toISOString().split('T')[0]}`);
            console.log(`   Concepto: ${row.concepto}`);
            console.log(`   Estado: ${row.estado}`);
            console.log(`   Importe: $${row.importe}`);
            console.log('');
        });
        
        // Summary
        const withNames = result.rows.filter(row => row.profesional_nombre && row.profesional_nombre !== 'Sin nombre').length;
        const withoutNames = result.rows.length - withNames;
        const futureDates = result.rows.filter(row => row.fecha_pago.getFullYear() > 2030).length;
        const validDates = result.rows.length - futureDates;
        
        console.log(`RESUMEN:`);
        console.log(`- Nombres: ${withNames} con nombre, ${withoutNames} sin nombre`);
        console.log(`- Fechas: ${validDates} fechas válidas, ${futureDates} fechas futuras`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testFinalFixes();