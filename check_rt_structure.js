const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function checkStructure() {
  try {
    console.log('🔍 VERIFICANDO ESTRUCTURA REPRESENTANTES TÉCNICOS...\n');
    
    // Ver estructura de la tabla
    const estructura = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'representantes_tecnicos' 
      AND table_schema = 'copig'
      ORDER BY ordinal_position
    `);
    
    console.log('🗂️ ESTRUCTURA TABLA REPRESENTANTES_TECNICOS:');
    estructura.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Contar total
    const total = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
    console.log('\n📊 TOTAL REPRESENTANTES TÉCNICOS:', total.rows[0].count);
    
    // Ver ejemplos reales
    const ejemplos = await pool.query(`
      SELECT rt.*, e.razon_social, p.nombre
      FROM copig.representantes_tecnicos rt
      LEFT JOIN copig.empresas e ON rt.empresa_id = e.id
      LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
      LIMIT 5
    `);
    
    console.log('\n📋 EJEMPLOS REALES:');
    ejemplos.rows.forEach((rt, i) => {
      console.log(`${i+1}. RT ID ${rt.id}:`);
      console.log(`   - Empresa: ${rt.razon_social || 'SIN EMPRESA'} (ID: ${rt.empresa_id})`);
      console.log(`   - Profesional: ${rt.nombre || 'SIN NOMBRE'} (ID: ${rt.profesional_id})`);
      console.log(`   - Fecha inicio: ${rt.fecha_inicio || 'N/A'}`);
      console.log('');
    });
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkStructure();