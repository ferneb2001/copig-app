const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarEstructura() {
    try {
        console.log('🔍 VERIFICANDO ESTRUCTURA TABLA pagos_historicos');
        
        const estructura = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `);
        
        console.log('\n=== COLUMNAS DISPONIBLES ===');
        estructura.rows.forEach(col => {
            console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        console.log('\n=== EJEMPLO DE DATOS ===');
        const ejemplo = await pool.query(`
            SELECT * FROM copig.pagos_historicos 
            LIMIT 3
        `);
        
        ejemplo.rows.forEach((row, i) => {
            console.log(`\nRegistro ${i + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

verificarEstructura();