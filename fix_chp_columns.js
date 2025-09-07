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
        console.log('Corrigiendo columnas de tabla solicitudes_chp...');
        
        // 1. Hacer tipo_solicitud nullable o darle un valor por defecto
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ALTER COLUMN tipo_solicitud SET DEFAULT 'CERTIFICADO',
            ALTER COLUMN tipo_solicitud DROP NOT NULL
        `);
        console.log('✅ Columna tipo_solicitud ahora tiene valor por defecto');
        
        // 2. Agregar columna tipo_obra si se está usando en algún query
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD COLUMN IF NOT EXISTS tipo_obra VARCHAR(200)
        `);
        console.log('✅ Columna tipo_obra agregada');
        
        // 3. Verificar estructura final
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            AND column_name IN ('tipo_solicitud', 'tipo_obra', 'cliente', 'proyecto')
            ORDER BY ordinal_position
        `);
        
        console.log('\nColumnas actualizadas:');
        result.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

fixColumns();