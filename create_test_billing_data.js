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

async function createTestBillingData() {
  try {
    console.log('🧪 Creando datos de prueba para sistema de facturación...');
    
    // 1. CREAR SOLICITUD DE PRUEBA
    console.log('\n1️⃣ Creando solicitud de prueba...');
    
    const nuevaSolicitud = await pool.query(`
      INSERT INTO copig.solicitudes_chp (
        profesional_id, numero_solicitud, comitente, proyecto, 
        descripcion, ubicacion_obra, estado, tipo_solicitud,
        importe_calculado, zona_obra, metros_cuadrados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      10752, // ID profesional prueba
      'CHP-2025-TEST-001',
      'CONSTRUCTORA EJEMPLO S.A.',
      'Ampliación de Local Comercial',
      'Certificado de habitabilidad para ampliación de local comercial de 120m² con instalaciones eléctricas y sanitarias nuevas',
      'Av. San Martín 1250, Ciudad, Mendoza',
      'FACTURADO',
      'CERTIFICADO',
      75000.00,
      'Centro',
      120.50
    ]);
    
    console.log('📋 Solicitud creada:', nuevaSolicitud.rows[0].numero_solicitud);
    
    // 2. CREAR FACTURA ASOCIADA
    console.log('\n2️⃣ Creando factura asociada...');
    
    const nuevaFactura = await pool.query(`
      INSERT INTO copig.facturas_chp (
        solicitud_id, numero_factura, monto, descripcion,
        fecha_vencimiento, estado, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      nuevaSolicitud.rows[0].id,
      'FAC-2025-001',
      75000.00,
      'Factura por Certificado de Habitabilidad - Ampliación Local Comercial',
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
      'PENDIENTE',
      1 // ID staff
    ]);
    
    console.log('💳 Factura creada:', nuevaFactura.rows[0].numero_factura);
    
    // 3. CREAR NOTIFICACIÓN PARA EL PROFESIONAL
    console.log('\n3️⃣ Creando notificación...');
    
    await pool.query(`
      INSERT INTO copig.notificaciones_profesional (
        profesional_id, solicitud_id, factura_id, tipo, titulo, mensaje, url_accion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      10752,
      nuevaSolicitud.rows[0].id,
      nuevaFactura.rows[0].id,
      'FACTURA_GENERADA',
      '💳 Nueva Factura Generada - FAC-2025-001',
      'Se ha generado la factura FAC-2025-001 por $75.000,00 para su solicitud CHP-2025-TEST-001 (Ampliación Local Comercial). La factura vence el ' + nuevaFactura.rows[0].fecha_vencimiento.toLocaleDateString('es-AR') + '. Haga clic para ver opciones de pago.',
      '/factura/' + nuevaFactura.rows[0].id
    ]);
    
    console.log('🔔 Notificación creada para profesional');
    
    // 4. CREAR SEGUNDA SOLICITUD COMPLETADA PARA MOSTRAR VARIEDAD
    console.log('\n4️⃣ Creando segunda solicitud (completada)...');
    
    const segundaSolicitud = await pool.query(`
      INSERT INTO copig.solicitudes_chp (
        profesional_id, numero_solicitud, comitente, proyecto, 
        descripcion, ubicacion_obra, estado, tipo_solicitud,
        importe_calculado, zona_obra, metros_cuadrados
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      10752,
      'CHP-2025-TEST-002',
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
    
    const segundaFactura = await pool.query(`
      INSERT INTO copig.facturas_chp (
        solicitud_id, numero_factura, monto, descripcion,
        fecha_vencimiento, estado, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      segundaSolicitud.rows[0].id,
      'FAC-2025-002',
      45000.00,
      'Factura por Certificado Final de Obra - Casa Unifamiliar',
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Vencía hace 10 días
      'PAGADA',
      1
    ]);
    
    // Crear pago para la segunda factura
    await pool.query(`
      INSERT INTO copig.pagos_chp (
        factura_id, monto, metodo_pago, numero_transaccion,
        estado, fecha_pago, verificado_por, fecha_verificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      segundaFactura.rows[0].id,
      45000.00,
      'transferencia_bancaria',
      'TRX-2025-789456123',
      'VERIFICADO',
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Pagó hace 5 días
      1,
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // Verificado hace 4 días
    ]);
    
    console.log('📋 Segunda solicitud completada creada');
    
    // 5. VERIFICAR DATOS CREADOS
    console.log('\n5️⃣ Verificando datos creados...');
    
    const solicitudes = await pool.query(`
      SELECT * FROM copig.solicitudes_chp 
      WHERE profesional_id = 10752 
      ORDER BY created_at DESC
    `);
    
    const facturas = await pool.query(`
      SELECT f.*, s.numero_solicitud 
      FROM copig.facturas_chp f
      JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
      WHERE s.profesional_id = 10752
      ORDER BY f.fecha_emision DESC
    `);
    
    const notificaciones = await pool.query(`
      SELECT * FROM copig.notificaciones_profesional
      WHERE profesional_id = 10752
      ORDER BY created_at DESC
    `);
    
    console.log('\n📊 RESUMEN DE DATOS DE PRUEBA:');
    console.log('==============================');
    console.log(`✅ Solicitudes creadas: ${solicitudes.rows.length}`);
    solicitudes.rows.forEach((sol, i) => {
      console.log(`  ${i+1}. ${sol.numero_solicitud} - ${sol.estado} - ${sol.comitente}`);
    });
    
    console.log(`\n✅ Facturas creadas: ${facturas.rows.length}`);
    facturas.rows.forEach((fac, i) => {
      console.log(`  ${i+1}. ${fac.numero_factura} - $${Number(fac.monto).toLocaleString('es-AR')} - ${fac.estado}`);
    });
    
    console.log(`\n✅ Notificaciones creadas: ${notificaciones.rows.length}`);
    notificaciones.rows.forEach((not, i) => {
      console.log(`  ${i+1}. ${not.tipo} - ${not.titulo}`);
    });
    
    console.log('\n🎉 DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('=====================================');
    console.log('👤 Profesional: PRUEBA TEST, JUAN CARLOS (ID: 10752)');
    console.log('🔑 Login: DNI 99999999 / password: prueba123');
    console.log('📋 2 solicitudes CHP con estados diferentes');
    console.log('💳 2 facturas: 1 pendiente + 1 pagada');
    console.log('🔔 Notificaciones activas');
    console.log('');
    console.log('🌐 PRÓXIMO PASO: Actualizar portal-profesional.html');
    console.log('   para mostrar facturas y notificaciones');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Detalles:', error);
  } finally {
    pool.end();
  }
}

createTestBillingData();