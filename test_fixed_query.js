const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testFixedQuery() {
    try {
        // Test the fixed query with proper JOINs
        const query = `
            SELECT 
                ph.id,
                ph.matricula,
                p.nombre as profesional_nombre,
                ph.concepto,
                ph.importe,
                ph.fecha_pago,
                ph.estado,
                ph.numero_recibo,
                ph.detalle,
                ph.categoria,
                ph.ano_habilitacion
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            ORDER BY ph.fecha_pago DESC
            LIMIT 5
        `;
        
        const result = await pool.query(query);
        console.log('=== TESTING FIXED QUERY ===');
        console.log('Results:');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. Matrícula: ${row.matricula}, Nombre: '${row.profesional_nombre || 'Sin nombre'}', Fecha: ${row.fecha_pago.toISOString().split('T')[0]}, Estado: ${row.estado}`);
        });
        
        // Count how many have names vs 'Sin nombre'
        const withNames = result.rows.filter(row => row.profesional_nombre).length;
        const withoutNames = result.rows.length - withNames;
        console.log(`\nResultado: ${withNames} con nombre, ${withoutNames} sin nombre`);
        
        // Test a specific matricula that should have a name
        const testMatricula = result.rows[0].matricula;
        console.log(`\nTesting matrícula ${testMatricula} relationships:`);
        
        const debugQuery = `
            SELECT 
                ph.matricula as pago_matricula,
                m.numero as matricula_numero,
                m.profesional_id as matricula_prof_id,
                p.id as profesional_id,
                p.nombre as profesional_nombre
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE ph.matricula = $1
            LIMIT 1
        `;
        
        const debugResult = await pool.query(debugQuery, [testMatricula]);
        if (debugResult.rows.length > 0) {
            const debug = debugResult.rows[0];
            console.log(`- Pago matrícula: ${debug.pago_matricula}`);
            console.log(`- Matrícula número: ${debug.matricula_numero}`);
            console.log(`- Matrícula profesional_id: ${debug.matricula_prof_id}`);
            console.log(`- Profesional id: ${debug.profesional_id}`);
            console.log(`- Profesional nombre: ${debug.profesional_nombre}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testFixedQuery();