const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function checkCHPSolicitudes() {
  try {
    console.log('📝 SOLICITUDES CHP EXISTENTES:\n');
    
    const result = await pool.query(`
      SELECT id, numero_solicitud, profesional_id, comitente, proyecto, estado, fecha_solicitud
      FROM copig.solicitudes_chp 
      ORDER BY fecha_solicitud DESC 
      LIMIT 10
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No hay solicitudes CHP');
    } else {
      result.rows.forEach((sol, i) => {
        console.log(`${i+1}. ${sol.numero_solicitud}:`);
        console.log(`   - Comitente: ${sol.comitente || 'SIN COMITENTE'}`);
        console.log(`   - Proyecto: ${sol.proyecto || 'SIN PROYECTO'}`);
        console.log(`   - Estado: ${sol.estado}`);
        console.log(`   - Profesional ID: ${sol.profesional_id}`);
        console.log(`   - Fecha: ${sol.fecha_solicitud}`);
        console.log('');
      });
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkCHPSolicitudes();