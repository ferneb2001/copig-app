const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

async function fixColumns() {
    try {
        console.log('Agregando columnas faltantes...');
        
        // Agregar fecha_actualizacion si no existe
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT NOW()
        `);
        console.log('✅ Columna fecha_actualizacion agregada');
        
        // Agregar aprobado_por si no existe  
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD COLUMN IF NOT EXISTS aprobado_por INTEGER REFERENCES copig.admin_users(id)
        `);
        console.log('✅ Columna aprobado_por agregada');
        
        // Verificar todas las columnas
        const result = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position
        `);
        
        console.log('\n✅ Columnas actuales en la tabla:');
        result.rows.forEach(col => {
            console.log(`  - ${col.column_name}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixColumns();