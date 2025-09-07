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

async function checkSolicitudes() {
  try {
    const result = await pool.query(`
      SELECT * FROM copig.solicitudes_chp 
      WHERE profesional_id = 10752 
      ORDER BY fecha_solicitud DESC
    `);
    
    console.log('📋 SOLICITUDES CHP PARA PROFESIONAL 10752:');
    console.log('==============================================');
    
    if (result.rows.length === 0) {
      console.log('❌ No hay solicitudes para el profesional 10752');
    } else {
      result.rows.forEach((sol, i) => {
        console.log(`${i+1}. ID: ${sol.id}`);
        console.log(`   Número: ${sol.numero_solicitud}`);
        console.log(`   Cliente: ${sol.cliente || 'Sin cliente'}`);
        console.log(`   Estado: ${sol.estado}`);
        console.log(`   Fecha: ${sol.fecha_solicitud}`);
        console.log(`   ---`);
      });
    }
    
    console.log(`Total: ${result.rows.length} solicitudes`);
    
    // También verificar todas las solicitudes sin filtrar
    const allResult = await pool.query('SELECT id, profesional_id, numero_solicitud, cliente, estado, fecha_solicitud FROM copig.solicitudes_chp ORDER BY id DESC LIMIT 10');
    console.log('\n🔍 ÚLTIMAS 10 SOLICITUDES EN LA TABLA:');
    console.log('=====================================');
    allResult.rows.forEach((sol, i) => {
      console.log(`${i+1}. ID: ${sol.id} | Prof: ${sol.profesional_id} | ${sol.numero_solicitud} | ${sol.cliente || 'Sin cliente'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkSolicitudes();