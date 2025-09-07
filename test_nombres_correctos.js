const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function testNombresCorrectos() {
  try {
    console.log('🔍 PROBANDO CORRECCIÓN DE NOMBRES...\n');
    
    // Simular el query corregido
    const representantesResult = await pool.query(`
        SELECT rt.id, rt.profesional_id, rt.es_profesional_externo,
               rt.documento_externo, rt.nombre_externo, rt.titulo_externo,
               rt.categoria_representacion, rt.fecha_inicio, rt.fecha_fin, rt.activo,
               COALESCE(p.nombre, rt.nombre_externo) as profesional_nombre,
               m.numero_matricula
        FROM copig.representantes_tecnicos rt
        LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
        LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
        WHERE rt.empresa_id = $1
        ORDER BY rt.fecha_inicio DESC
    `, [1]); // IMPSA
    
    console.log('📊 REPRESENTANTES TÉCNICOS DE IMPSA:');
    console.log(`Total encontrados: ${representantesResult.rows.length}\n`);
    
    representantesResult.rows.forEach((rep, i) => {
      console.log(`${i+1}. ${rep.profesional_nombre} (${rep.profesional_nombre ? '✅' : '❌'})`);
      console.log(`   - Matrícula: ${rep.numero_matricula || 'N/A'}`);
      console.log(`   - Categoría: ${rep.categoria_representacion}`);
      console.log(`   - Activo: ${rep.activo}`);
      console.log(`   - Fecha inicio: ${rep.fecha_inicio}`);
      console.log('');
    });
    
    // Verificar si resuelve el "undefined"
    const tieneNombres = representantesResult.rows.every(rep => rep.profesional_nombre);
    console.log(tieneNombres ? '✅ TODOS LOS NOMBRES DEFINIDOS' : '❌ AÚN HAY NOMBRES UNDEFINED');
    
    pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    pool.end();
  }
}

testNombresCorrectos();