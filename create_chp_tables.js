const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

async function createCHPTables() {
    try {
        console.log('Creando tablas para sistema CHP...');
        
        // Crear tabla de solicitudes CHP
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.solicitudes_chp (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                numero_solicitud VARCHAR(20) UNIQUE,
                cliente VARCHAR(200) NOT NULL,
                proyecto VARCHAR(300) NOT NULL,
                descripcion TEXT,
                ubicacion_obra VARCHAR(500),
                observaciones TEXT,
                estado VARCHAR(20) DEFAULT 'PENDIENTE',
                fecha_solicitud TIMESTAMP DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP DEFAULT NOW(),
                aprobado_por INTEGER REFERENCES copig.admin_users(id),
                fecha_aprobacion TIMESTAMP,
                motivo_rechazo TEXT,
                certificado_url VARCHAR(500)
            )
        `);
        console.log('✅ Tabla solicitudes_chp creada');

        // Crear tabla de documentos adjuntos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.documentos_chp (
                id SERIAL PRIMARY KEY,
                solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id) ON DELETE CASCADE,
                tipo_documento VARCHAR(100),
                nombre_archivo VARCHAR(255),
                ruta_archivo VARCHAR(500),
                fecha_carga TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla documentos_chp creada');

        // Crear índices
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_solicitudes_chp_profesional 
            ON copig.solicitudes_chp(profesional_id);
            
            CREATE INDEX IF NOT EXISTS idx_solicitudes_chp_estado 
            ON copig.solicitudes_chp(estado);
            
            CREATE INDEX IF NOT EXISTS idx_solicitudes_chp_fecha 
            ON copig.solicitudes_chp(fecha_solicitud);
        `);
        console.log('✅ Índices creados');

        // Crear secuencia para número de solicitud
        await pool.query(`
            CREATE SEQUENCE IF NOT EXISTS copig.chp_numero_seq
            START WITH 1000
            INCREMENT BY 1;
        `);
        console.log('✅ Secuencia de numeración creada');

        console.log('\n✅ Sistema CHP configurado correctamente en la base de datos');
        
    } catch (error) {
        console.error('Error creando tablas CHP:', error);
    } finally {
        await pool.end();
    }
}

createCHPTables();