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

async function deleteTestCHP() {
  try {
    console.log('🗑️ Eliminando solicitud de prueba CHP-2025-1003...');
    
    // Eliminar por número de solicitud
    const result = await pool.query('DELETE FROM copig.solicitudes_chp WHERE numero_solicitud = $1', ['CHP-2025-1003']);
    
    if (result.rowCount > 0) {
      console.log(`✅ Solicitud CHP-2025-1003 eliminada exitosamente`);
      console.log(`📊 Filas eliminadas: ${result.rowCount}`);
    } else {
      console.log('ℹ️ No se encontró la solicitud CHP-2025-1003');
    }
    
    // Verificar total restante
    const count = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
    console.log(`📊 Total solicitudes CHP restantes: ${count.rows[0].total}`);
    
    // Si quedan solicitudes, mostrarlas
    if (count.rows[0].total > 0) {
      const remaining = await pool.query('SELECT numero_solicitud, estado, comitente FROM copig.solicitudes_chp ORDER BY fecha_solicitud DESC');
      console.log('\n📋 Solicitudes restantes:');
      remaining.rows.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.numero_solicitud} - ${s.estado} - ${s.comitente || 'Sin cliente'}`);
      });
    } else {
      console.log('✅ Base de datos CHP completamente limpia');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

deleteTestCHP();