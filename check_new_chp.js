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

async function checkNewCHP() {
  try {
    console.log('🔍 Verificando solicitudes CHP recientes...');
    
    // Verificar solicitudes ordenadas por fecha
    const result = await pool.query(`
      SELECT s.*, p.nombre as profesional_nombre, m.numero_matricula
      FROM copig.solicitudes_chp s
      LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
      LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
      ORDER BY s.fecha_solicitud DESC NULLS LAST
      LIMIT 10
    `);
    
    console.log(`📊 Total solicitudes CHP: ${result.rows.length}`);
    
    if (result.rows.length > 0) {
      console.log('\n📋 Solicitudes encontradas:');
      console.log('============================================');
      result.rows.forEach((solicitud, index) => {
        console.log(`${index + 1}. ${solicitud.numero_solicitud || 'Sin número'}`);
        console.log(`   📍 Estado: ${solicitud.estado || 'Sin estado'}`);
        console.log(`   👤 Profesional: ${solicitud.profesional_nombre || 'Sin nombre'} (ID: ${solicitud.profesional_id})`);
        console.log(`   🏢 Comitente: ${solicitud.comitente || 'Sin comitente'}`);
        console.log(`   📅 Fecha: ${solicitud.fecha_solicitud || 'Sin fecha'}`);
        console.log(`   📋 Proyecto: ${solicitud.proyecto || 'Sin proyecto'}`);
        console.log('   ---');
      });
    } else {
      console.log('ℹ️  No hay solicitudes CHP en la base de datos');
    }
    
    // Verificar también qué devuelve la API
    console.log('\n🔗 Probando endpoint API...');
    const fetch = require('node-fetch');
    try {
      const apiResponse = await fetch('http://localhost:3030/api/admin/solicitudes-chp');
      const apiData = await apiResponse.json();
      
      console.log('📡 Respuesta API:', {
        success: apiData.success,
        total: apiData.solicitudes?.length || 0,
        status: apiResponse.status
      });
      
      if (apiData.solicitudes?.length > 0) {
        console.log('🔍 Primera solicitud de API:');
        console.log('  Número:', apiData.solicitudes[0].numero_solicitud);
        console.log('  Estado:', apiData.solicitudes[0].estado);
        console.log('  Comitente:', apiData.solicitudes[0].comitente);
      }
      
    } catch (apiError) {
      console.error('❌ Error probando API:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkNewCHP();