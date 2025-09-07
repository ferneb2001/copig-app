const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

async function checkTable() {
    try {
        // Verificar si la tabla existe
        const tableCheck = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position
        `);
        
        if (tableCheck.rows.length === 0) {
            console.log('❌ La tabla solicitudes_chp no existe');
            
            // Crear la tabla
            console.log('Creando tabla solicitudes_chp...');
            await pool.query(`
                CREATE TABLE copig.solicitudes_chp (
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
            console.log('✅ Tabla creada');
            
            // Crear secuencia
            await pool.query(`
                CREATE SEQUENCE IF NOT EXISTS copig.chp_numero_seq
                START WITH 1000
                INCREMENT BY 1
            `);
            console.log('✅ Secuencia creada');
            
        } else {
            console.log('✅ Tabla solicitudes_chp existe con las siguientes columnas:');
            tableCheck.rows.forEach(col => {
                console.log(`   - ${col.column_name} (${col.data_type})`);
            });
            
            // Verificar si falta la columna cliente
            const hasCliente = tableCheck.rows.some(col => col.column_name === 'cliente');
            if (!hasCliente) {
                console.log('\n⚠️ Falta la columna "cliente", agregándola...');
                await pool.query(`
                    ALTER TABLE copig.solicitudes_chp 
                    ADD COLUMN IF NOT EXISTS cliente VARCHAR(200),
                    ADD COLUMN IF NOT EXISTS proyecto VARCHAR(300),
                    ADD COLUMN IF NOT EXISTS descripcion TEXT,
                    ADD COLUMN IF NOT EXISTS ubicacion_obra VARCHAR(500)
                `);
                console.log('✅ Columnas agregadas');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkTable();