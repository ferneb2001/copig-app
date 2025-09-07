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

async function checkCHPSchema() {
  try {
    console.log('🔍 Verificando estructura de tablas CHP...');
    
    // Verificar estructura de solicitudes_chp
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'copig' 
      AND table_name = 'solicitudes_chp'
      ORDER BY ordinal_position;
    `;
    
    const schema = await pool.query(schemaQuery);
    console.log('\n📋 Estructura de copig.solicitudes_chp:');
    console.log('==========================================');
    schema.rows.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- NOT NULL' : ''}`);
    });
    
    // Ver contenido actual
    const count = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
    console.log(`\n📊 Total registros: ${count.rows[0].total}`);
    
    if (count.rows[0].total > 0) {
      const ejemplos = await pool.query('SELECT * FROM copig.solicitudes_chp LIMIT 2');
      console.log('\n📋 Ejemplos de registros:');
      ejemplos.rows.forEach((row, index) => {
        console.log(`\n  Registro ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`    ${key}: ${row[key]}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkCHPSchema();