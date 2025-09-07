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

async function checkRemainingCHP() {
  try {
    console.log('🔍 Verificando solicitudes CHP restantes...');
    
    const result = await pool.query(`
      SELECT id, numero_solicitud, comitente, estado, fecha_solicitud
      FROM copig.solicitudes_chp 
      ORDER BY fecha_solicitud DESC
    `);
    
    console.log(`\n📊 Total solicitudes: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Solicitudes encontradas:');
      console.log('==========================================');
      result.rows.forEach((solicitud, index) => {
        console.log(`${index + 1}. ${solicitud.numero_solicitud || 'Sin número'} - ${solicitud.estado} - ${solicitud.comitente || 'Sin cliente'}`);
        console.log(`   ID: ${solicitud.id} | Fecha: ${solicitud.fecha_solicitud}`);
      });
      
      console.log('\n🗑️ ¿Eliminar todas las solicitudes de prueba? (eliminando...)');
      
      // Eliminar todas
      const deleteResult = await pool.query('DELETE FROM copig.solicitudes_chp');
      console.log(`✅ ${deleteResult.rowCount} solicitudes eliminadas`);
      
      // Verificar
      const verify = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
      console.log(`📊 Total restante: ${verify.rows[0].total}`);
      
    } else {
      console.log('✅ No hay solicitudes CHP en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkRemainingCHP();