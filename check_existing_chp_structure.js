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

async function checkExistingCHPStructure() {
  try {
    console.log('🔍 Analizando estructura existente del sistema CHP...');
    
    const tables = ['solicitudes_chp', 'aranceles_chp', 'facturas_chp', 'pagos_chp', 'certificados_chp', 'notificaciones_chp'];
    
    for (const tableName of tables) {
      console.log(`\n📋 Estructura de ${tableName}:`);
      console.log('='.repeat(50));
      
      try {
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'copig' AND table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);
        
        if (columns.rows.length > 0) {
          columns.rows.forEach((col, index) => {
            const nullable = col.is_nullable === 'YES' ? '' : ' NOT NULL';
            const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`  ${index + 1}. ${col.column_name} (${col.data_type})${nullable}${defaultVal}`);
          });
          
          // Ver contenido si hay datos
          const count = await pool.query(`SELECT COUNT(*) as total FROM copig.${tableName}`);
          console.log(`📊 Total registros: ${count.rows[0].total}`);
          
        } else {
          console.log('❌ Tabla no existe');
        }
        
      } catch (error) {
        console.log(`❌ Error accediendo a ${tableName}:`, error.message);
      }
    }
    
    // Verificar contenido de aranceles existente
    console.log('\n💰 CONTENIDO ACTUAL DE ARANCELES:');
    console.log('='.repeat(40));
    try {
      const aranceles = await pool.query('SELECT * FROM copig.aranceles_chp LIMIT 5');
      if (aranceles.rows.length > 0) {
        aranceles.rows.forEach((arancel, index) => {
          console.log(`${index + 1}. ${JSON.stringify(arancel)}`);
        });
      } else {
        console.log('📄 Tabla aranceles vacía');
      }
    } catch (error) {
      console.log('❌ Error leyendo aranceles:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    pool.end();
  }
}

checkExistingCHPStructure();