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

async function deleteCHPRequest() {
  try {
    console.log('🗑️ Eliminando solicitud CHP-2025-1002...');
    
    // Primero verificar que existe
    const check = await pool.query('SELECT * FROM copig.solicitudes_chp WHERE numero_solicitud = $1', ['CHP-2025-1002']);
    
    if (check.rows.length === 0) {
      console.log('ℹ️ La solicitud CHP-2025-1002 no existe');
      return;
    }
    
    console.log('📋 Solicitud encontrada:');
    console.log(`  ID: ${check.rows[0].id}`);
    console.log(`  Número: ${check.rows[0].numero_solicitud}`);
    console.log(`  Comitente: ${check.rows[0].comitente}`);
    console.log(`  Estado: ${check.rows[0].estado}`);
    
    // Eliminar la solicitud
    const result = await pool.query('DELETE FROM copig.solicitudes_chp WHERE numero_solicitud = $1', ['CHP-2025-1002']);
    
    console.log(`✅ Solicitud CHP-2025-1002 eliminada exitosamente`);
    console.log(`📊 Filas afectadas: ${result.rowCount}`);
    
    // Verificar que se eliminó
    const verify = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
    console.log(`📊 Total solicitudes restantes: ${verify.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

deleteCHPRequest();