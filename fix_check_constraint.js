const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

async function fixConstraint() {
    try {
        console.log('Investigando restricciones de la tabla...');
        
        // Ver todas las restricciones
        const constraints = await pool.query(`
            SELECT conname, contype, pg_get_constraintdef(oid) as definition
            FROM pg_constraint
            WHERE conrelid = 'copig.solicitudes_chp'::regclass
            AND contype = 'c'
        `);
        
        console.log('\nRestricciones CHECK encontradas:');
        constraints.rows.forEach(c => {
            console.log(`  ${c.conname}: ${c.definition}`);
        });
        
        // Eliminar la restricción problemática
        console.log('\nEliminando restricción problemática...');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_tipo_solicitud_check
        `);
        console.log('✅ Restricción eliminada');
        
        // Verificar valores permitidos
        const valores = await pool.query(`
            SELECT DISTINCT tipo_solicitud 
            FROM copig.solicitudes_chp 
            WHERE tipo_solicitud IS NOT NULL
        `);
        
        console.log('\nValores actuales en tipo_solicitud:');
        valores.rows.forEach(v => {
            console.log(`  - ${v.tipo_solicitud}`);
        });
        
        // Agregar una nueva restricción más flexible si es necesario
        console.log('\nAgregando restricción más flexible...');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_tipo_solicitud_check 
            CHECK (tipo_solicitud IN ('CERTIFICADO', 'CHP', 'HABILITACION', 'RENOVACION', 'DUPLICADO') OR tipo_solicitud IS NULL)
        `);
        console.log('✅ Nueva restricción agregada con valores permitidos');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

fixConstraint();