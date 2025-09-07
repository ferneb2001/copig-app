const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function checkPrueba1() {
  try {
    console.log('🔍 BUSCANDO EMPRESA prueba1 (CUIT: 23205620249)...\n');
    
    const result = await pool.query(`
      SELECT id, razon_social, cuit, activo 
      FROM copig.empresas 
      WHERE cuit = '23205620249' OR razon_social ILIKE '%prueba1%'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontró ninguna empresa con ese CUIT o nombre');
      console.log('✅ El CUIT está disponible para usar');
    } else {
      console.log('⚠️ ENCONTRADAS EMPRESAS:');
      result.rows.forEach(emp => {
        console.log(`- ID: ${emp.id}`);
        console.log(`  Nombre: ${emp.razon_social}`);
        console.log(`  CUIT: ${emp.cuit}`);
        console.log(`  Activo: ${emp.activo}`);
        console.log('---');
      });
    }
    
    // También verificar en log de operaciones peligrosas
    console.log('\n🔍 VERIFICANDO LOG DE ELIMINACIONES...');
    
    const logResult = await pool.query(`
      SELECT * FROM copig.dangerous_operations_log 
      WHERE table_affected = 'empresas' 
      AND operation_type = 'DELETE'
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (logResult.rows.length > 0) {
      console.log('📋 ÚLTIMAS ELIMINACIONES DE EMPRESAS:');
      logResult.rows.forEach(log => {
        console.log(`- ${log.created_at}: Usuario ${log.user_responsible}`);
      });
    } else {
      console.log('❌ No se encontraron logs de eliminación');
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkPrueba1();