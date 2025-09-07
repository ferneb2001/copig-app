const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function testDeletion() {
  try {
    console.log('🧪 PROBANDO ELIMINACIÓN DE EMPRESA...\n');
    
    // Crear una empresa de prueba
    const createResult = await pool.query(`
      INSERT INTO copig.empresas 
      (razon_social, cuit, email, telefono, domicilio, activo)
      VALUES ('EMPRESA PRUEBA ELIMINACION', '99999999999', 'test@delete.com', '999999', 'TEST ADDRESS', true)
      RETURNING *
    `);
    
    const empresaTest = createResult.rows[0];
    console.log(`✅ Empresa de prueba creada con ID: ${empresaTest.id}`);
    
    // Agregar un representante técnico
    await pool.query(`
      INSERT INTO copig.representantes_tecnicos 
      (empresa_id, es_profesional_externo, nombre_externo, categoria_representacion, fecha_inicio, activo)
      VALUES ($1, true, 'REPRESENTANTE PRUEBA', 'A', NOW(), true)
    `, [empresaTest.id]);
    
    console.log('✅ Representante técnico agregado');
    
    // Ahora intentar eliminar
    console.log('🗑️ Intentando eliminar empresa con representante técnico...');
    
    // Primero eliminar representantes
    const rtResult = await pool.query(`
      DELETE FROM copig.representantes_tecnicos 
      WHERE empresa_id = $1
      RETURNING id
    `, [empresaTest.id]);
    
    console.log(`✅ Eliminados ${rtResult.rows.length} representantes técnicos`);
    
    // Luego eliminar empresa
    const deleteResult = await pool.query(`
      DELETE FROM copig.empresas 
      WHERE id = $1
      RETURNING razon_social
    `, [empresaTest.id]);
    
    if (deleteResult.rows.length > 0) {
      console.log(`✅ Empresa eliminada exitosamente: ${deleteResult.rows[0].razon_social}`);
    } else {
      console.log('❌ No se eliminó ninguna empresa');
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error en prueba de eliminación:', error.message);
    pool.end();
  }
}

testDeletion();