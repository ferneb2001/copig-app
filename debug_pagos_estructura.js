const { Pool } = require('pg');

// Configuración de base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugPaymentStructure() {
    try {
        console.log('=== VERIFICANDO ESTRUCTURA TABLA PAGOS_HISTORICOS ===\n');

        // Ver estructura de pagos_historicos
        const structure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `);
        
        console.log('Columnas en pagos_historicos:');
        structure.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type}`);
        });

        // Ver primeros registros con columnas reales
        console.log('\n=== PRIMEROS 3 REGISTROS ===');
        const sample = await pool.query('SELECT * FROM copig.pagos_historicos LIMIT 3');
        console.log('Registros de ejemplo:');
        sample.rows.forEach((row, index) => {
            console.log(`\nRegistro ${index + 1}:`);
            Object.keys(row).forEach(key => {
                console.log(`  ${key}: ${row[key]}`);
            });
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugPaymentStructure();