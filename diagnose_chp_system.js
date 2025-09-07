const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function diagnoseCHPSystem() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA CHP...\n');
    
    // 1. Verificar tablas CHP
    console.log('📋 1. VERIFICANDO TABLAS CHP:');
    
    const tables = ['solicitudes_chp', 'documentos_chp'];
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM copig.${table}`);
        console.log(`✅ Tabla ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`❌ Tabla ${table}: NO EXISTE`);
      }
    }
    
    // 2. Verificar estructura de solicitudes_chp
    console.log('\n📊 2. ESTRUCTURA TABLA SOLICITUDES_CHP:');
    try {
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'solicitudes_chp' 
        AND table_schema = 'copig'
        ORDER BY ordinal_position
      `);
      
      structure.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (error) {
      console.log('❌ No se pudo obtener estructura');
    }
    
    // 3. Verificar solicitudes existentes
    console.log('\n📝 3. SOLICITUDES CHP EXISTENTES:');
    try {
      const solicitudes = await pool.query(`
        SELECT id, numero_solicitud, profesional_id, cliente, proyecto, estado, fecha_solicitud
        FROM copig.solicitudes_chp 
        ORDER BY fecha_solicitud DESC 
        LIMIT 5
      `);
      
      if (solicitudes.rows.length === 0) {
        console.log('❌ No hay solicitudes CHP');
      } else {
        solicitudes.rows.forEach(sol => {
          console.log(`- ${sol.numero_solicitud}: ${sol.cliente} - ${sol.proyecto} (Estado: ${sol.estado})`);
        });
      }
    } catch (error) {
      console.log(`❌ Error consultando solicitudes: ${error.message}`);
    }
    
    // 4. Verificar secuencia
    console.log('\n🔢 4. VERIFICANDO SECUENCIA NUMERACIÓN:');
    try {
      const seq = await pool.query(`SELECT last_value FROM copig.chp_numero_seq`);
      console.log(`✅ Última secuencia: ${seq.rows[0].last_value}`);
    } catch (error) {
      console.log('❌ Secuencia no existe');
    }
    
    // 5. Verificar endpoints en servidor (simulado)
    console.log('\n🌐 5. ENDPOINTS CHP ESPERADOS:');
    console.log('- POST /api/chp/create');
    console.log('- GET /api/profesional/solicitudes-chp');
    console.log('- GET /api/admin/solicitudes-chp');
    console.log('- PUT /api/admin/solicitud-chp/:id');
    console.log('- GET /api/session-info');
    
    // 6. Verificar archivos HTML
    console.log('\n📄 6. ARCHIVOS HTML CHP:');
    const fs = require('fs');
    const files = ['portal-profesional.html', 'admin-chp.html', 'solicitudes-chp-mejorado.html'];
    
    for (const file of files) {
      if (fs.existsSync(`C:\\copig-app\\${file}`)) {
        console.log(`✅ ${file}: EXISTE`);
      } else {
        console.log(`❌ ${file}: NO EXISTE`);
      }
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
    pool.end();
  }
}

diagnoseCHPSystem();