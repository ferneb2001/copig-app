const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

(async () => {
    try {
        const result1 = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        
        console.log('Estructura de tabla copig.profesionales:');
        console.log('='.repeat(50));
        result1.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
        });
        
        const result2 = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'matriculas'
            ORDER BY ordinal_position
        `);
        
        console.log('\nEstructura de tabla copig.matriculas:');
        console.log('='.repeat(50));
        result2.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();