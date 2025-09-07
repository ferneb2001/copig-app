const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function checkTriggers() {
  try {
    console.log('🔍 VERIFICANDO TRIGGERS EN TABLA EMPRESAS...\n');
    
    const result = await pool.query(`
      SELECT 
        tgname as trigger_name, 
        tgenabled,
        pg_get_triggerdef(oid) as definition
      FROM pg_trigger 
      WHERE tgrelid = 'copig.empresas'::regclass
      AND tgisinternal = false
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontraron triggers en tabla empresas');
    } else {
      result.rows.forEach(trigger => {
        console.log(`Trigger: ${trigger.trigger_name}`);
        console.log(`Habilitado: ${trigger.tgenabled}`);
        console.log(`Definición: ${trigger.definition}`);
        console.log('---');
      });
    }
    
    // También verificar funciones relacionadas
    console.log('\n🔍 VERIFICANDO FUNCIÓN validate_delete_operation...');
    
    const funcResult = await pool.query(`
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname LIKE '%validate_delete%'
    `);
    
    if (funcResult.rows.length > 0) {
      console.log('\n📝 FUNCIÓN ENCONTRADA:');
      funcResult.rows.forEach(func => {
        console.log(`Función: ${func.proname}`);
        console.log(`Código: ${func.prosrc}`);
      });
    } else {
      console.log('❌ No se encontró la función validate_delete_operation');
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

checkTriggers();