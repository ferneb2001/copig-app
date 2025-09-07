const fs = require('fs');

console.log('🔧 Agregando funcionalidad de eliminación para profesionales...');

// 1. AGREGAR ENDPOINT DE ELIMINACIÓN EN SERVER.JS
let serverContent = fs.readFileSync('server.js', 'utf8');

const deleteEndpoint = `
// 🗑️ Eliminar solicitud CHP (solo profesional y solo si está PENDIENTE)
app.delete('/api/profesional/solicitud-chp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    console.log(\`🗑️ Profesional \${profesional_id} intentando eliminar solicitud \${id}\`);
    
    // Verificar que la solicitud pertenece al profesional y está PENDIENTE
    const solicitudCheck = await pool.query(\`
      SELECT id, numero_solicitud, estado, comitente 
      FROM copig.solicitudes_chp 
      WHERE id = $1 AND profesional_id = $2
    \`, [id, profesional_id]);
    
    if (solicitudCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no tienes permisos para eliminarla'
      });
    }
    
    const solicitud = solicitudCheck.rows[0];
    
    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(403).json({
        success: false,
        message: \`No se puede eliminar la solicitud. Estado actual: \${solicitud.estado}. Solo se pueden eliminar solicitudes PENDIENTES.\`
      });
    }
    
    // Eliminar la solicitud (CASCADE eliminará registros relacionados)
    await pool.query('DELETE FROM copig.solicitudes_chp WHERE id = $1', [id]);
    
    console.log(\`✅ Solicitud \${solicitud.numero_solicitud} eliminada por el profesional\`);
    
    res.json({
      success: true,
      message: \`Solicitud \${solicitud.numero_solicitud} eliminada exitosamente\`,
      solicitud_eliminada: {
        numero: solicitud.numero_solicitud,
        comitente: solicitud.comitente
      }
    });
    
  } catch (error) {
    console.error('❌ Error eliminando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar la solicitud'
    });
  }
});
`;

// Insertar el endpoint antes de los endpoints administrativos
const insertPosition = serverContent.indexOf('// Listar todas las solicitudes (admin)');
if (insertPosition === -1) {
  console.log('❌ No se encontró el punto de inserción en server.js');
  process.exit(1);
}

const beforeInsert = serverContent.substring(0, insertPosition);
const afterInsert = serverContent.substring(insertPosition);
serverContent = beforeInsert + deleteEndpoint + '\n' + afterInsert;

fs.writeFileSync('server.js', serverContent);
console.log('✅ Endpoint de eliminación agregado a server.js');

// 2. ACTUALIZAR PORTAL-PROFESIONAL.HTML
let portalContent = fs.readFileSync('portal-profesional.html', 'utf8');

// Buscar la función loadSolicitudes y actualizar la generación de HTML
const oldSolicitudHTML = `                            <tr>
                                <td>\${solicitud.numero_solicitud}</td>
                                <td>\${solicitud.comitente || 'Sin especificar'}</td>
                                <td>\${solicitud.proyecto || 'Sin especificar'}</td>
                                <td>\${solicitud.ubicacion_obra || 'Sin especificar'}</td>
                                <td><span class="estado estado-\${solicitud.estado.toLowerCase()}">\${solicitud.estado}</span></td>
                                <td>\${formatDate(solicitud.fecha_solicitud)}</td>
                                <td>
                                    <button class="btn-small" onclick="verDetalleSolicitud(\${solicitud.id})">Ver Detalles</button>
                                </td>
                            </tr>`;

const newSolicitudHTML = `                            <tr>
                                <td>\${solicitud.numero_solicitud}</td>
                                <td>\${solicitud.comitente || 'Sin especificar'}</td>
                                <td>\${solicitud.proyecto || 'Sin especificar'}</td>
                                <td>\${solicitud.ubicacion_obra || 'Sin especificar'}</td>
                                <td><span class="estado estado-\${solicitud.estado.toLowerCase()}">\${solicitud.estado}</span></td>
                                <td>\${formatDate(solicitud.fecha_solicitud)}</td>
                                <td>
                                    <button class="btn-small" onclick="verDetalleSolicitud(\${solicitud.id})">Ver Detalles</button>
                                    \${solicitud.estado === 'PENDIENTE' ? 
                                        \`<button class="btn-small btn-danger" onclick="eliminarSolicitud(\${solicitud.id}, '\${solicitud.numero_solicitud}', '\${solicitud.comitente}')" style="margin-left: 5px;">🗑️ Eliminar</button>\` 
                                        : ''}
                                </td>
                            </tr>`;

if (portalContent.includes(oldSolicitudHTML)) {
  portalContent = portalContent.replace(oldSolicitudHTML, newSolicitudHTML);
  console.log('✅ HTML de solicitudes actualizado con botón eliminar');
} else {
  console.log('⚠️ No se encontró el HTML exacto de solicitudes, agregando función eliminar al final');
}

// Agregar función JavaScript para eliminar solicitud
const eliminarFunction = `
        // 🗑️ Función para eliminar solicitud CHP
        async function eliminarSolicitud(id, numeroSolicitud, comitente) {
            if (!confirm(\`¿Está seguro que desea eliminar la solicitud \${numeroSolicitud}?\\n\\nComitente: \${comitente}\\n\\nEsta acción NO se puede deshacer.\`)) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/profesional/solicitud-chp/\${id}\`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`✅ \${result.message}\`);
                    // Recargar la lista de solicitudes
                    loadSolicitudes();
                } else {
                    alert(\`❌ Error: \${result.message}\`);
                }
            } catch (error) {
                console.error('Error eliminando solicitud:', error);
                alert('❌ Error eliminando la solicitud. Intente nuevamente.');
            }
        }
`;

// Insertar la función antes del cierre del script
const scriptCloseIndex = portalContent.lastIndexOf('    </script>');
if (scriptCloseIndex !== -1) {
  const beforeScript = portalContent.substring(0, scriptCloseIndex);
  const afterScript = portalContent.substring(scriptCloseIndex);
  portalContent = beforeScript + eliminarFunction + afterScript;
  console.log('✅ Función eliminarSolicitud agregada al portal profesional');
} else {
  console.log('⚠️ No se encontró el cierre del script en portal-profesional.html');
}

// Agregar estilos CSS para el botón de eliminar
const deleteButtonCSS = `
        .btn-danger {
            background-color: #e74c3c !important;
            color: white !important;
            border: 1px solid #c0392b !important;
        }
        
        .btn-danger:hover {
            background-color: #c0392b !important;
            transform: translateY(-1px);
        }
`;

const styleCloseIndex = portalContent.lastIndexOf('    </style>');
if (styleCloseIndex !== -1) {
  const beforeStyle = portalContent.substring(0, styleCloseIndex);
  const afterStyle = portalContent.substring(styleCloseIndex);
  portalContent = beforeStyle + deleteButtonCSS + afterStyle;
  console.log('✅ Estilos CSS para botón eliminar agregados');
}

fs.writeFileSync('portal-profesional.html', portalContent);
console.log('✅ Portal profesional actualizado con funcionalidad de eliminación');

console.log('');
console.log('🎯 FUNCIONALIDAD DE ELIMINACIÓN IMPLEMENTADA:');
console.log('   • Solo para solicitudes en estado PENDIENTE');
console.log('   • Solo el profesional propietario puede eliminar');
console.log('   • Confirmación antes de eliminar');
console.log('   • Recarga automática de la lista tras eliminación');
console.log('');
console.log('🔄 Reiniciar servidor para activar el endpoint de eliminación');