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

async function checkValidValues() {
  try {
    console.log('🔍 Verificando restricciones de la tabla solicitudes_chp...');
    
    // Verificar restricciones CHECK
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name, 
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'copig' 
      AND tc.table_name = 'solicitudes_chp'
      AND tc.constraint_type = 'CHECK'
    `);
    
    console.log('\n📋 Restricciones CHECK encontradas:');
    console.log('==================================');
    constraints.rows.forEach(constraint => {
      console.log(`${constraint.constraint_name}:`);
      console.log(`  ${constraint.check_clause}`);
      console.log('');
    });
    
    // Verificar valores únicos existentes para tipo_solicitud
    const tiposSolicitud = await pool.query(`
      SELECT DISTINCT tipo_solicitud, COUNT(*) as cantidad
      FROM copig.solicitudes_chp 
      WHERE tipo_solicitud IS NOT NULL
      GROUP BY tipo_solicitud
      ORDER BY cantidad DESC
    `);
    
    console.log('📊 Valores existentes para tipo_solicitud:');
    console.log('==========================================');
    if (tiposSolicitud.rows.length > 0) {
      tiposSolicitud.rows.forEach(tipo => {
        console.log(`  - "${tipo.tipo_solicitud}" (${tipo.cantidad} registros)`);
      });
    } else {
      console.log('  (No hay registros existentes)');
    }
    
    // Verificar valores únicos existentes para estado
    const estados = await pool.query(`
      SELECT DISTINCT estado, COUNT(*) as cantidad
      FROM copig.solicitudes_chp 
      WHERE estado IS NOT NULL
      GROUP BY estado
      ORDER BY cantidad DESC
    `);
    
    console.log('\n📊 Valores existentes para estado:');
    console.log('==================================');
    if (estados.rows.length > 0) {
      estados.rows.forEach(estado => {
        console.log(`  - "${estado.estado}" (${estado.cantidad} registros)`);
      });
    } else {
      console.log('  (No hay registros existentes)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

checkValidValues();