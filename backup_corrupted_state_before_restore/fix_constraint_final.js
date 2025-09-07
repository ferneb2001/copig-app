const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

async function fixFinal() {
    try {
        console.log('Actualizando datos existentes...');
        
        // Actualizar todos los registros existentes a un valor válido
        await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET tipo_solicitud = 'CERTIFICADO'
            WHERE tipo_solicitud = 'PRIMERA_VEZ'
        `);
        console.log('✅ Registros actualizados');
        
        // Ahora agregar la restricción
        console.log('\nAgregando restricción flexible...');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_tipo_solicitud_check 
            CHECK (tipo_solicitud IN ('CERTIFICADO', 'CHP', 'HABILITACION', 'RENOVACION', 'DUPLICADO', 'PRIMERA_VEZ') OR tipo_solicitud IS NULL)
        `);
        console.log('✅ Restricción agregada exitosamente');
        
        // También corregir la restricción de estado
        console.log('\nActualizando restricción de estado...');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
        `);
        
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'APROBADO', 'APROBADA', 'RECHAZADO', 'RECHAZADA', 'ENTREGADA', 'ENTREGADO') OR estado IS NULL)
        `);
        console.log('✅ Restricción de estado actualizada');
        
        console.log('\n✅ TODAS LAS RESTRICCIONES CORREGIDAS');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixFinal();