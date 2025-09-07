const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkPagosTable() {
    try {
        console.log('=== VERIFICACIÓN DE TABLA PAGOS_HISTORICOS ===\n');

        // Verificar estructura de la tabla
        const structureQuery = `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `;
        
        const structureResult = await pool.query(structureQuery);
        console.log('Estructura de la tabla pagos_historicos:');
        structureResult.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Verificar algunos registros
        const sampleQuery = 'SELECT * FROM copig.pagos_historicos LIMIT 3';
        const sampleResult = await pool.query(sampleQuery);
        
        console.log('\nRegistros de ejemplo:');
        sampleResult.rows.forEach((row, index) => {
            console.log(`\nRegistro ${index + 1}:`);
            Object.keys(row).forEach(key => {
                console.log(`  ${key}: ${row[key]}`);
            });
        });

    } catch (error) {
        console.error('Error al verificar la tabla:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar verificación
checkPagosTable();