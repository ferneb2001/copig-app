/**
 * Verificar estructura de la tabla empresas
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkEmpresasStructure() {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'empresas'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 ESTRUCTURA DE copig.empresas:');
        result.rows.forEach(column => {
            console.log(`   ${column.column_name}: ${column.data_type}${column.character_maximum_length ? `(${column.character_maximum_length})` : ''} ${column.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkEmpresasStructure();