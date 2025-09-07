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

async function cleanAndCreateTestData() {
  try {
    console.log('🧹 Limpiando datos anteriores y creando datos de prueba frescos...');
    
    // 1. LIMPIAR DATOS EXISTENTES DEL PROFESIONAL DE PRUEBA
    console.log('\n1️⃣ Limpiando datos anteriores...');
    
    await pool.query('DELETE FROM copig.pagos_chp WHERE factura_id IN (SELECT f.id FROM copig.facturas_chp f JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id WHERE s.profesional_id = 10752)');
    await pool.query('DELETE FROM copig.facturas_chp WHERE solicitud_id IN (SELECT id FROM copig.solicitudes_chp WHERE profesional_id = 10752)');
    await pool.query('DELETE FROM copig.notificaciones_profesional WHERE profesional_id = 10752');
    await pool.query('DELETE FROM copig.solicitudes_chp WHERE profesional_id = 10752');
    
    console.log('✅ Datos anteriores limpiados');
    
    // 2. CREAR SOLICITUD PENDIENTE DE PAGO
    console.log('\n2️⃣ Creando solicitud con factura pendiente...');
    
    const solicitud1 = await pool.query(`
      INSERT INTO copig.solicitudes_chp (
        profesional_id, numero_solicitud, comitente, proyecto, 
        descripcion, ubicacion_obra, estado, tipo_solicitud,
        importe_calculado, zona_obra, metros_cuadrados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      10752,
      `CHP-2025-${Date.now().toString().slice(-6)}`,
      'CONSTRUCTORA EJEMPLO S.A.',
      'Ampliación Local Comercial',
      'Certificado de habitabilidad para ampliación de local comercial de 120m² con instalaciones eléctricas y sanitarias nuevas',
      'Av. San Martín 1250, Ciudad, Mendoza',
      'FACTURADO',
      'CERTIFICADO',
      75000.00,
      'Centro',
      120.50
    ]);
    
    const factura1 = await pool.query(`
      INSERT INTO copig.facturas_chp (
        solicitud_id, numero_factura, monto, descripcion,
        fecha_vencimiento, estado
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      solicitud1.rows[0].id,
      `FAC-2025-${Date.now().toString().slice(-6)}`,
      75000.00,
      'Factura por Certificado de Habitabilidad - Ampliación Local Comercial',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      'PENDIENTE'
    ]);
    
    console.log('📋 Solicitud 1 creada:', solicitud1.rows[0].numero_solicitud);
    console.log('💳 Factura 1 creada:', factura1.rows[0].numero_factura);
    
    // Crear notificación
    await pool.query(`
      INSERT INTO copig.notificaciones_profesional (
        profesional_id, solicitud_id, factura_id, tipo, titulo, mensaje, url_accion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      10752,
      solicitud1.rows[0].id,
      factura1.rows[0].id,
      'FACTURA_GENERADA',
      '💳 Nueva Factura Generada',
      `Se ha generado la factura ${factura1.rows[0].numero_factura} por $75.000,00 para su solicitud ${solicitud1.rows[0].numero_solicitud}. Vence el ${factura1.rows[0].fecha_vencimiento.toLocaleDateString('es-AR')}.`,
      `/factura/${factura1.rows[0].id}`
    ]);
    
    // 3. CREAR SOLICITUD COMPLETADA
    console.log('\n3️⃣ Creando solicitud completada...');
    
    const solicitud2 = await pool.query(`
      INSERT INTO copig.solicitudes_chp (
        profesional_id, numero_solicitud, comitente, proyecto, 
        descripcion, ubicacion_obra, estado, tipo_solicitud,
        importe_calculado, zona_obra, metros_cuadrados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      10752,
      `CHP-2025-${(Date.now() + 1000).toString().slice(-6)}`,
      'VIVIENDAS DEL OESTE S.R.L.',
      'Casa Unifamiliar',
      'Certificado final de obra para casa unifamiliar de 85m² con piscina',
      'Barrio Los Olivos, Luján de Cuyo, Mendoza',
      'COMPLETADO',
      'CHP',
      45000.00,
      'Periferia',
      85.00
    ]);
    
    const factura2 = await pool.query(`
      INSERT INTO copig.facturas_chp (
        solicitud_id, numero_factura, monto, descripcion,
        fecha_vencimiento, estado
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      solicitud2.rows[0].id,
      `FAC-2025-${(Date.now() + 1000).toString().slice(-6)}`,
      45000.00,
      'Factura por Certificado Final de Obra - Casa Unifamiliar',
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      'PAGADA'
    ]);
    
    // Crear pago para la segunda factura
    await pool.query(`
      INSERT INTO copig.pagos_chp (
        factura_id, monto, metodo_pago, numero_transaccion,
        estado, fecha_pago
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      factura2.rows[0].id,
      45000.00,
      'transferencia_bancaria',
      `TRX-2025-${Date.now().toString().slice(-6)}`,
      'VERIFICADO',
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    ]);
    
    console.log('📋 Solicitud 2 creada:', solicitud2.rows[0].numero_solicitud);
    console.log('💳 Factura 2 creada:', factura2.rows[0].numero_factura);
    
    // 4. VERIFICAR DATOS CREADOS
    console.log('\n4️⃣ Verificando datos creados...');
    
    const verificacion = await pool.query(`
      SELECT 
        s.numero_solicitud,
        s.estado as solicitud_estado,
        s.comitente,
        s.importe_calculado,
        f.numero_factura,
        f.estado as factura_estado,
        f.monto as factura_monto,
        (SELECT COUNT(*) FROM copig.pagos_chp p WHERE p.factura_id = f.id) as pagos_count
      FROM copig.solicitudes_chp s
      LEFT JOIN copig.facturas_chp f ON s.id = f.solicitud_id
      WHERE s.profesional_id = 10752
      ORDER BY s.created_at DESC
    `);
    
    const notificaciones = await pool.query(`
      SELECT COUNT(*) as total FROM copig.notificaciones_profesional 
      WHERE profesional_id = 10752 AND leida = FALSE
    `);
    
    console.log('\n📊 DATOS DE PRUEBA CREADOS EXITOSAMENTE:');
    console.log('=========================================');
    verificacion.rows.forEach((registro, index) => {
      console.log(`${index + 1}. ${registro.numero_solicitud}`);
      console.log(`   📋 Estado: ${registro.solicitud_estado}`);
      console.log(`   🏢 Cliente: ${registro.comitente}`);
      console.log(`   💰 Importe: $${Number(registro.importe_calculado).toLocaleString('es-AR')}`);
      console.log(`   📄 Factura: ${registro.numero_factura} (${registro.factura_estado})`);
      console.log(`   💳 Pagos: ${registro.pagos_count}`);
      console.log('   ---');
    });
    
    console.log(`🔔 Notificaciones pendientes: ${notificaciones.rows[0].total}`);
    
    console.log('\n🎉 SISTEMA LISTO PARA PROBAR:');
    console.log('============================');
    console.log('👤 Usuario: DNI 99999999 / password: prueba123');
    console.log('🌐 Portal: http://localhost:3030/');
    console.log('📋 El profesional verá:');
    console.log('   - 1 factura PENDIENTE de pago');
    console.log('   - 1 factura PAGADA (completada)');  
    console.log('   - 1+ notificaciones');
    console.log('');
    console.log('🚀 PRÓXIMO PASO: Actualizar portal-profesional.html');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Detalles:', error);
  } finally {
    pool.end();
  }
}

cleanAndCreateTestData();