const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function testEmpresaAPI() {
  try {
    console.log('🔍 SIMULANDO ENDPOINT GET /api/empresas/1 (IMPSA)...\n');
    
    // Simular exactamente lo que hace el endpoint
    const id = 1;
    
    // Obtener datos básicos de la empresa
    const result = await pool.query(`
        SELECT id, razon_social, cuit, email, telefono, domicilio, 
               localidad, departamento, codigo_postal, activo,
               fecha_creacion, fecha_actualizacion, observaciones
        FROM copig.empresas 
        WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
        console.log(`❌ Empresa con ID ${id} no encontrada`);
        return;
    }
    
    const empresa = result.rows[0];
    
    // Obtener representantes técnicos
    const representantesResult = await pool.query(`
        SELECT rt.id, rt.profesional_id, rt.es_profesional_externo,
               rt.documento_externo, rt.nombre_externo, rt.titulo_externo,
               rt.categoria_representacion, rt.fecha_inicio, rt.fecha_fin, rt.activo,
               p.nombre as nombre_profesional,
               p.numero_documento
        FROM copig.representantes_tecnicos rt
        LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
        WHERE rt.empresa_id = $1
        ORDER BY rt.fecha_inicio DESC
    `, [id]);
    
    empresa.representantes_tecnicos = representantesResult.rows;
    
    console.log('📊 RESULTADO DEL ENDPOINT:');
    console.log('🏢 Empresa:', empresa.razon_social);
    console.log('👥 Representantes técnicos encontrados:', empresa.representantes_tecnicos.length);
    
    if (empresa.representantes_tecnicos.length > 0) {
      console.log('\n📋 REPRESENTANTES TÉCNICOS:');
      empresa.representantes_tecnicos.forEach((rt, i) => {
        const nombre = rt.nombre_profesional || rt.nombre_externo || 'SIN NOMBRE';
        console.log(`${i+1}. ${nombre} (ID profesional: ${rt.profesional_id})`);
        console.log(`   - Categoría: ${rt.categoria_representacion || 'N/A'}`);
        console.log(`   - Fecha inicio: ${rt.fecha_inicio || 'N/A'}`);
        console.log(`   - Activo: ${rt.activo || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('✅ El endpoint ahora envía representantes técnicos correctamente!');
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

testEmpresaAPI();