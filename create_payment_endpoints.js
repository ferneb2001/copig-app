const fs = require('fs');

// Payment endpoints to add to server.js
const paymentEndpoints = `
// ==================== SISTEMA COMPLETO DE PAGOS CHP ====================

// 📋 Obtener facturas pendientes del profesional
app.get('/api/profesional/facturas-pendientes', async (req, res) => {
  try {
    if (!req.session.profesionalId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const result = await pool.query(\`
      SELECT s.id, s.numero_solicitud, s.comitente, s.proyecto, 
             s.arancel_final, s.fecha_solicitud, s.ubicacion_obra,
             'CHP' as tipo_servicio
      FROM copig.solicitudes_chp s
      WHERE s.profesional_id = $1 
        AND s.estado = 'APROBADO_PARA_FACTURAR'
        AND (s.estado_facturacion IS NULL OR s.estado_facturacion = 'PENDIENTE')
      ORDER BY s.fecha_solicitud DESC
    \`, [req.session.profesionalId]);

    res.json({ success: true, facturas: result.rows });
    
  } catch (error) {
    console.error('❌ Error obteniendo facturas pendientes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 💰 Generar factura oficial desde admin
app.post('/api/admin/chp/:id/generar-factura', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero_factura, observaciones_factura } = req.body;

    const numeroFactura = numero_factura || \`FAC-CHP-\${new Date().getFullYear()}-\${String(Date.now()).slice(-6)}\`;
    
    await pool.query(\`
      UPDATE copig.solicitudes_chp 
      SET estado = 'FACTURADO',
          estado_facturacion = 'FACTURADA',
          numero_factura = $2,
          fecha_facturacion = NOW(),
          observaciones_factura = $3,
          fecha_actualizacion = NOW()
      WHERE id = $1
    \`, [id, numeroFactura, observaciones_factura]);

    res.json({ 
      success: true, 
      message: 'Factura generada exitosamente',
      numero_factura: numeroFactura 
    });
    
  } catch (error) {
    console.error('❌ Error generando factura:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 📤 Subir comprobante de pago
app.post('/api/profesional/subir-comprobante', upload.single('comprobante'), async (req, res) => {
  try {
    if (!req.session.profesionalId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const { solicitud_id, metodo_pago, monto_pagado, fecha_pago, banco, numero_operacion, observaciones } = req.body;
    const archivo_comprobante = req.file ? req.file.filename : null;

    // Crear registro de comprobante
    await pool.query(\`
      INSERT INTO copig.comprobantes_pago 
      (profesional_id, solicitud_id, metodo_pago, monto_pagado, fecha_pago, 
       banco, numero_operacion, archivo_comprobante, observaciones, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDIENTE_REVISION')
    \`, [req.session.profesionalId, solicitud_id, metodo_pago, monto_pagado, 
        fecha_pago, banco, numero_operacion, archivo_comprobante, observaciones]);

    // Actualizar estado de la solicitud
    await pool.query(\`
      UPDATE copig.solicitudes_chp 
      SET estado_pago = 'COMPROBANTE_SUBIDO',
          fecha_actualizacion = NOW()
      WHERE id = $1
    \`, [solicitud_id]);

    res.json({ 
      success: true, 
      message: 'Comprobante subido exitosamente. Será revisado por el staff.',
      archivo: archivo_comprobante
    });
    
  } catch (error) {
    console.error('❌ Error subiendo comprobante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 📄 Historial de pagos del profesional
app.get('/api/profesional/historial-pagos', async (req, res) => {
  try {
    if (!req.session.profesionalId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const result = await pool.query(\`
      SELECT s.numero_solicitud, s.comitente, s.proyecto, s.arancel_final,
             c.metodo_pago, c.monto_pagado, c.fecha_pago, c.banco, 
             c.numero_operacion, c.estado as estado_comprobante, c.fecha_carga,
             c.observaciones_staff, s.estado, s.estado_pago
      FROM copig.solicitudes_chp s
      LEFT JOIN copig.comprobantes_pago c ON s.id = c.solicitud_id
      WHERE s.profesional_id = $1 
        AND (s.estado_pago IS NOT NULL OR c.id IS NOT NULL)
      ORDER BY c.fecha_carga DESC, s.fecha_solicitud DESC
    \`, [req.session.profesionalId]);

    res.json({ success: true, pagos: result.rows });
    
  } catch (error) {
    console.error('❌ Error obteniendo historial de pagos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 🔍 Admin - Revisar comprobantes pendientes
app.get('/api/admin/comprobantes-pendientes', async (req, res) => {
  try {
    const result = await pool.query(\`
      SELECT c.id, c.solicitud_id, c.metodo_pago, c.monto_pagado, c.fecha_pago,
             c.banco, c.numero_operacion, c.archivo_comprobante, c.observaciones,
             c.fecha_carga, s.numero_solicitud, s.comitente, s.proyecto,
             s.arancel_final, p.nombre as profesional_nombre
      FROM copig.comprobantes_pago c
      JOIN copig.solicitudes_chp s ON c.solicitud_id = s.id
      JOIN copig.profesionales p ON c.profesional_id = p.id
      WHERE c.estado = 'PENDIENTE_REVISION'
      ORDER BY c.fecha_carga ASC
    \`);

    res.json({ success: true, comprobantes: result.rows });
    
  } catch (error) {
    console.error('❌ Error obteniendo comprobantes pendientes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ✅ Admin - Aprobar comprobante de pago
app.put('/api/admin/comprobante/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones_staff } = req.body;

    // Obtener información del comprobante
    const comprobante = await pool.query(\`
      SELECT solicitud_id FROM copig.comprobantes_pago WHERE id = $1
    \`, [id]);

    if (comprobante.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Comprobante no encontrado' });
    }

    const solicitud_id = comprobante.rows[0].solicitud_id;

    // Actualizar comprobante
    await pool.query(\`
      UPDATE copig.comprobantes_pago 
      SET estado = 'APROBADO', 
          observaciones_staff = $2,
          fecha_aprobacion = NOW(),
          aprobado_por = $3
      WHERE id = $1
    \`, [id, observaciones_staff, req.session.user?.id]);

    // Actualizar solicitud CHP
    await pool.query(\`
      UPDATE copig.solicitudes_chp 
      SET estado = 'COMPLETADO',
          estado_pago = 'PAGADO',
          fecha_actualizacion = NOW()
      WHERE id = $1
    \`, [solicitud_id]);

    res.json({ success: true, message: 'Comprobante aprobado y CHP completado' });
    
  } catch (error) {
    console.error('❌ Error aprobando comprobante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ❌ Admin - Rechazar comprobante de pago
app.put('/api/admin/comprobante/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_rechazo } = req.body;

    await pool.query(\`
      UPDATE copig.comprobantes_pago 
      SET estado = 'RECHAZADO', 
          observaciones_staff = $2,
          fecha_revision = NOW(),
          revisado_por = $3
      WHERE id = $1
    \`, [id, motivo_rechazo, req.session.user?.id]);

    res.json({ success: true, message: 'Comprobante rechazado' });
    
  } catch (error) {
    console.error('❌ Error rechazando comprobante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// 📊 Admin - Panel de facturación CHP
app.get('/api/admin/panel-facturacion', async (req, res) => {
  try {
    const { filtro_estado } = req.query;
    
    let whereClause = '';
    const queryParams = [];
    
    if (filtro_estado && filtro_estado !== 'TODOS') {
      whereClause = 'WHERE s.estado = $1';
      queryParams.push(filtro_estado);
    } else {
      whereClause = "WHERE s.estado IN ('APROBADO_PARA_FACTURAR', 'FACTURADO', 'COMPLETADO')";
    }

    const query = \`
      SELECT s.id, s.numero_solicitud, s.comitente, s.proyecto, s.ubicacion_obra,
             s.arancel_final, s.estado, s.estado_facturacion, s.estado_pago,
             s.numero_factura, s.fecha_facturacion, s.fecha_solicitud,
             p.nombre as profesional_nombre, p.numero_documento,
             COUNT(c.id) as comprobantes_subidos
      FROM copig.solicitudes_chp s
      JOIN copig.profesionales p ON s.profesional_id = p.id
      LEFT JOIN copig.comprobantes_pago c ON s.id = c.solicitud_id
      \${whereClause}
      GROUP BY s.id, p.nombre, p.numero_documento
      ORDER BY s.fecha_solicitud DESC
    \`;
    
    const result = await pool.query(query, queryParams);

    res.json({ success: true, solicitudes: result.rows });
    
  } catch (error) {
    console.error('❌ Error en panel de facturación:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

`;

// Read current server.js content
let serverContent = fs.readFileSync('server.js', 'utf8');

// Find the position before static routes (before line 1413)
const staticRoutesIndex = serverContent.indexOf('// ==================== RUTAS DE ARCHIVOS ESTÁTICOS ====================');

if (staticRoutesIndex === -1) {
  console.error('❌ No se encontró el marcador de rutas estáticas');
  process.exit(1);
}

// Insert payment endpoints before static routes
const beforeStaticRoutes = serverContent.substring(0, staticRoutesIndex);
const afterStaticRoutes = serverContent.substring(staticRoutesIndex);

const newServerContent = beforeStaticRoutes + paymentEndpoints + afterStaticRoutes;

// Write the updated server.js
fs.writeFileSync('server.js', newServerContent);

console.log('✅ Payment endpoints agregados a server.js exitosamente');
console.log('📋 Endpoints agregados:');
console.log('  - GET /api/profesional/facturas-pendientes');
console.log('  - POST /api/admin/chp/:id/generar-factura');
console.log('  - POST /api/profesional/subir-comprobante');
console.log('  - GET /api/profesional/historial-pagos');
console.log('  - GET /api/admin/comprobantes-pendientes');
console.log('  - PUT /api/admin/comprobante/:id/aprobar');
console.log('  - PUT /api/admin/comprobante/:id/rechazar');
console.log('  - GET /api/admin/panel-facturacion');
console.log('🔄 Reiniciar servidor para aplicar cambios');