const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function checkCHPTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'solicitudes_chp' 
      AND table_schema = 'copig'
      ORDER BY ordinal_position
    `);
    
    console.log('ESTRUCTURA ACTUAL TABLA solicitudes_chp:');
    console.table(result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCHPTable();