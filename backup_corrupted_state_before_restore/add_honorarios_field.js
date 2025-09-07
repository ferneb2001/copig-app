const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function addHonorariosField() {
  try {
    // Agregar campo monto_honorarios
    await pool.query(`
      ALTER TABLE copig.solicitudes_chp 
      ADD COLUMN IF NOT EXISTS monto_honorarios DECIMAL(15,2)
    `);
    
    console.log('✅ Campo monto_honorarios agregado exitosamente');
    
    // Verificar la adición
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'solicitudes_chp' 
      AND table_schema = 'copig'
      AND column_name = 'monto_honorarios'
    `);
    
    console.log('Verificación:', result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addHonorariosField();