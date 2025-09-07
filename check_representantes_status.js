const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function checkRepresentantes() {
  try {
    console.log('🔍 VERIFICANDO ESTADO DE REPRESENTANTES TÉCNICOS...\n');
    
    // Contar total representantes técnicos
    const totalRT = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
    console.log('📊 TOTAL REPRESENTANTES TÉCNICOS:', totalRT.rows[0].count);
    
    // Contar empresas con representantes
    const empresasConRT = await pool.query(`
      SELECT COUNT(DISTINCT empresa_id) 
      FROM copig.representantes_tecnicos 
      WHERE empresa_id IS NOT NULL
    `);
    console.log('🏢 EMPRESAS CON REPRESENTANTES:', empresasConRT.rows[0].count);
    
    // Contar profesionales como RT
    const profesionalesRT = await pool.query(`
      SELECT COUNT(DISTINCT profesional_id) 
      FROM copig.representantes_tecnicos 
      WHERE profesional_id IS NOT NULL
    `);
    console.log('👥 PROFESIONALES COMO RT:', profesionalesRT.rows[0].count);
    
    // Ver algunos ejemplos
    const ejemplos = await pool.query(`
      SELECT rt.id, rt.empresa_id, e.razon_social, p.nombre, rt.categoria, rt.fecha_inicio
      FROM copig.representantes_tecnicos rt
      LEFT JOIN copig.empresas e ON rt.empresa_id = e.id
      LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
      ORDER BY rt.id
      LIMIT 10
    `);
    
    console.log('\n📋 EJEMPLOS DE REPRESENTANTES TÉCNICOS:');
    ejemplos.rows.forEach(rt => {
      const empresa = rt.razon_social || 'SIN EMPRESA';
      const nombre = rt.nombre || 'SIN NOMBRE';
      console.log(`- RT ${rt.id}: ${nombre} → ${empresa} (Cat: ${rt.categoria})`);
    });
    
    // Ver empresas top con más representantes
    const topEmpresas = await pool.query(`
      SELECT e.razon_social, COUNT(rt.id) as total_rt
      FROM copig.empresas e
      LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
      WHERE rt.empresa_id IS NOT NULL
      GROUP BY e.id, e.razon_social
      ORDER BY total_rt DESC
      LIMIT 10
    `);
    
    console.log('\n🏆 TOP EMPRESAS CON MÁS REPRESENTANTES:');
    topEmpresas.rows.forEach(emp => {
      console.log(`- ${emp.razon_social}: ${emp.total_rt} representantes`);
    });
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkRepresentantes();