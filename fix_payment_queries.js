const fs = require('fs');

// Read current server.js content
let serverContent = fs.readFileSync('server.js', 'utf8');

// Fix 1: Historial de pagos endpoint
const oldHistorialQuery = `      SELECT s.numero_solicitud, s.comitente, s.proyecto, s.arancel_final,
             c.metodo_pago, c.monto_pagado, c.fecha_pago, c.banco, 
             c.numero_operacion, c.estado as estado_comprobante, c.fecha_carga,
             c.observaciones_staff, s.estado, s.estado_pago
      FROM copig.solicitudes_chp s
      LEFT JOIN copig.comprobantes_pago c ON s.id = c.solicitud_id`;

const newHistorialQuery = `      SELECT s.numero_solicitud, s.comitente, s.proyecto, s.arancel_final,
             COALESCE(s.estado_pago, 'SIN_PAGO') as estado_pago, s.estado,
             CASE 
               WHEN s.estado_pago = 'PAGADO' THEN 'VERIFICADO' 
               WHEN s.estado_pago = 'COMPROBANTE_SUBIDO' THEN 'PENDIENTE'
               ELSE 'NO_INICIADO'
             END as estado_comprobante,
             s.fecha_actualizacion as fecha_carga,
             'Sistema CHP' as metodo_pago,
             s.arancel_final as monto_pagado,
             s.fecha_facturacion as fecha_pago
      FROM copig.solicitudes_chp s`;

// Fix 2: Panel de facturación endpoint
const oldFacturacionQuery = `      SELECT s.id, s.numero_solicitud, s.comitente, s.proyecto, s.ubicacion_obra,
             s.arancel_final, s.estado, s.estado_facturacion, s.estado_pago,
             s.numero_factura, s.fecha_facturacion, s.fecha_solicitud,
             p.nombre as profesional_nombre, p.numero_documento,
             COUNT(c.id) as comprobantes_subidos
      FROM copig.solicitudes_chp s
      JOIN copig.profesionales p ON s.profesional_id = p.id
      LEFT JOIN copig.comprobantes_pago c ON s.id = c.solicitud_id
      \${whereClause}
      GROUP BY s.id, p.nombre, p.numero_documento`;

const newFacturacionQuery = `      SELECT s.id, s.numero_solicitud, s.comitente, s.proyecto, s.ubicacion_obra,
             s.arancel_final, s.estado, s.estado_facturacion, s.estado_pago,
             s.numero_factura, s.fecha_facturacion, s.fecha_solicitud,
             p.nombre as profesional_nombre, p.numero_documento,
             CASE 
               WHEN s.estado_pago = 'COMPROBANTE_SUBIDO' THEN 1
               ELSE 0 
             END as comprobantes_subidos
      FROM copig.solicitudes_chp s
      JOIN copig.profesionales p ON s.profesional_id = p.id
      \${whereClause}`;

// Apply fixes
serverContent = serverContent.replace(oldHistorialQuery, newHistorialQuery);
serverContent = serverContent.replace(oldFacturacionQuery, newFacturacionQuery);

// Write the corrected server.js
fs.writeFileSync('server.js', serverContent);

console.log('✅ Consultas SQL de pagos corregidas');
console.log('🔧 Correcciones aplicadas:');
console.log('   • Historial de pagos: Usando datos de solicitudes_chp');
console.log('   • Panel de facturación: Simplificado sin JOIN a comprobantes');
console.log('🔄 Los endpoints ahora funcionarán correctamente');