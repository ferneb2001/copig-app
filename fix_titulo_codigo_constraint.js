const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function fixTituloCodigoConstraint() {
    try {
        console.log('🔧 ARREGLANDO RESTRICCIÓN DE COLUMNA CODIGO EN TÍTULOS');
        console.log('='.repeat(50));
        
        // Opción 1: Hacer la columna codigo opcional
        console.log('1️⃣ Haciendo columna codigo opcional...');
        await pool.query('ALTER TABLE copig.titulos ALTER COLUMN codigo DROP NOT NULL');
        
        console.log('✅ Restricción eliminada. Ahora se pueden crear títulos sin código');
        
        // Verificar títulos sin código
        const sinCodigo = await pool.query('SELECT COUNT(*) FROM copig.titulos WHERE codigo IS NULL');
        console.log(`📊 Títulos sin código: ${sinCodigo.rows[0].count}`);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

fixTituloCodigoConstraint();