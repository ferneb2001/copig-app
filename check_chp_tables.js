const { Pool } = require('pg');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const pool = new Pool({
  user: config.database.user,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
});

async function checkCHPTables() {
  try {
    console.log('🔍 Verificando tablas CHP...');
    
    // Verificar si existen las tablas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'copig' 
      AND table_name LIKE '%chp%';
    `;
    
    const tables = await pool.query(tablesQuery);
    console.log('\n📋 Tablas CHP encontradas:', tables.rows.length);
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Si no existen, las creamos
    if (tables.rows.length === 0) {
      console.log('\n🛠️ Creando tablas CHP...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS copig.solicitudes_chp (
          id SERIAL PRIMARY KEY,
          profesional_id INTEGER,
          numero_solicitud VARCHAR(20) UNIQUE,
          cliente VARCHAR(200),
          proyecto VARCHAR(300),
          descripcion TEXT,
          ubicacion_obra VARCHAR(300),
          estado VARCHAR(20) DEFAULT 'PENDIENTE',
          tipo_solicitud VARCHAR(50) DEFAULT 'CERTIFICADO',
          fecha_solicitud TIMESTAMP DEFAULT NOW(),
          fecha_actualizacion TIMESTAMP,
          observaciones TEXT,
          aprobado_por INTEGER,
          motivo_rechazo TEXT
        );
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS copig.documentos_chp (
          id SERIAL PRIMARY KEY,
          solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id),
          tipo_documento VARCHAR(100),
          archivo VARCHAR(255),
          fecha_carga TIMESTAMP DEFAULT NOW()
        );
      `);
      
      await pool.query(`
        CREATE SEQUENCE IF NOT EXISTS copig.chp_numero_seq START 1001;
      `);
      
      console.log('✅ Tablas CHP creadas exitosamente');
    }
    
    // Verificar contenido
    const solicitudes = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
    console.log(`\n📊 Total solicitudes CHP: ${solicitudes.rows[0].total}`);
    
    if (solicitudes.rows[0].total > 0) {
      const ejemplos = await pool.query('SELECT * FROM copig.solicitudes_chp LIMIT 3');
      console.log('\n📋 Ejemplos de solicitudes:');
      ejemplos.rows.forEach((solicitud, index) => {
        console.log(`  ${index + 1}. ${solicitud.numero_solicitud} - ${solicitud.estado} - ${solicitud.cliente}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkCHPTables();