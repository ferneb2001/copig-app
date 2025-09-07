const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function testIMPSA() {
  try {
    const result = await pool.query(`
      SELECT e.razon_social, 
             COUNT(rt.empresa_id) as total_representantes,
             STRING_AGG(p.nombre, ', ' ORDER BY p.nombre) as nombres_rt
      FROM copig.empresas e
      LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
      LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
      WHERE e.id = 1
      GROUP BY e.id, e.razon_social
    `);
    
    console.log('🏢 EMPRESA IMPSA (ID: 1):');
    console.log('Empresa:', result.rows[0].razon_social);
    console.log('Total Representantes:', result.rows[0].total_representantes);
    console.log('Nombres RT:', result.rows[0].nombres_rt);
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

testIMPSA();