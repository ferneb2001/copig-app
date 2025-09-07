const fs = require('fs');

// Función JavaScript actualizada para el frontend
const funcionesActualizadas = `
        // Manejar subida de archivos - VERSIÓN ACTUALIZADA CON API REAL
        async function handleFileUpload(event, categoria) {
            const files = Array.from(event.target.files);
            const pdfFiles = files.filter(file => file.type === 'application/pdf');
            
            if (pdfFiles.length === 0) {
                mostrarNotificacion('⚠️ Solo se permiten archivos PDF', 'error');
                return;
            }
            
            if (!solicitudSeleccionada) {
                mostrarNotificacion('⚠️ Debe seleccionar una solicitud primero', 'error');
                return;
            }
            
            // Mostrar progreso de subida
            const progressDiv = document.createElement('div');
            progressDiv.innerHTML = \`
                <div class="upload-progress">
                    <div class="upload-progress-bar" id="progress-\${categoria}" style="width: 0%"></div>
                </div>
                <p>Subiendo \${pdfFiles.length} archivo(s)...</p>
            \`;
            
            const containerId = categoria === 'caja_matricula' ? 'cajaMatriculaList' : 
                               categoria === 'memoria_tecnica' ? 'memoriaList' :
                               categoria + 'List';
            
            const container = document.getElementById(containerId);
            container.appendChild(progressDiv);
            
            try {
                // Crear FormData para la subida
                const formData = new FormData();
                pdfFiles.forEach(file => {
                    formData.append('documentos', file);
                });
                
                // Subir archivos al servidor
                const response = await fetch(\`/api/chp/documentos/\${solicitudSeleccionada.id}/\${categoria}\`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                // Remover indicador de progreso
                container.removeChild(progressDiv);
                
                if (result.success) {
                    mostrarNotificacion(\`✅ \${result.message}\`, 'success');
                    // Recargar lista de archivos desde el servidor
                    await loadDocumentosFromServer(categoria);
                } else {
                    mostrarNotificacion(\`❌ Error: \${result.message}\`, 'error');
                }
                
            } catch (error) {
                container.removeChild(progressDiv);
                console.error('Error subiendo archivos:', error);
                mostrarNotificacion('❌ Error de conexión al subir archivos', 'error');
            }
        }

        // Cargar documentos desde el servidor
        async function loadDocumentosFromServer(categoria) {
            if (!solicitudSeleccionada) return;
            
            try {
                const response = await fetch(\`/api/chp/documentos/\${solicitudSeleccionada.id}/\${categoria}\`);
                const result = await response.json();
                
                if (result.success) {
                    // Actualizar la estructura de documentos local
                    documentosSubidos[categoria] = result.documentos.map(doc => ({
                        id: doc.id,
                        name: doc.archivo_nombre,
                        size: formatFileSize(doc.archivo_size || 0),
                        estado: doc.estado,
                        fecha_carga: doc.fecha_carga,
                        observaciones: doc.observaciones,
                        downloadUrl: \`/api/chp/documento/\${doc.id}/download\`
                    }));
                    
                    renderFileList(categoria);
                }
            } catch (error) {
                console.error('Error cargando documentos:', error);
            }
        }

        // Renderizar lista de archivos - VERSIÓN ACTUALIZADA
        function renderFileList(categoria) {
            const containerId = categoria === 'caja_matricula' ? 'cajaMatriculaList' : 
                               categoria === 'memoria_tecnica' ? 'memoriaList' :
                               categoria + 'List';
            
            const container = document.getElementById(containerId);
            const files = documentosSubidos[categoria] || [];
            
            if (files.length === 0) {
                container.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">No hay documentos subidos</p>';
                return;
            }
            
            let html = '';
            files.forEach((file, index) => {
                const estadoClass = file.estado === 'APROBADO' ? 'success' : 
                                   file.estado === 'RECHAZADO' ? 'error' : 'info';
                
                html += \`
                    <div class="file-item">
                        <div class="file-info">
                            <span class="file-icon">📄</span>
                            <div>
                                <div class="file-name">\${file.name}</div>
                                <div class="file-size">\${file.size} • \${formatearFecha(file.fecha_carga)}</div>
                                <div class="alert alert-\${estadoClass}" style="margin: 5px 0; padding: 5px 10px; font-size: 0.8rem;">
                                    Estado: \${file.estado}
                                    \${file.observaciones ? '<br>Obs: ' + file.observaciones : ''}
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            <button class="btn-view" onclick="viewFileFromServer('\${file.downloadUrl}')">Ver</button>
                            <button class="btn-delete" onclick="deleteFileFromServer('\${file.id}', '\${categoria}', \${index})">Eliminar</button>
                        </div>
                    </div>
                \`;
            });
            
            container.innerHTML = html;
        }

        // Ver archivo desde servidor
        function viewFileFromServer(downloadUrl) {
            window.open(downloadUrl, '_blank');
        }

        // Eliminar archivo desde servidor
        async function deleteFileFromServer(documentoId, categoria, index) {
            if (!confirm('¿Está seguro de eliminar este archivo?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/chp/documento/\${documentoId}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    mostrarNotificacion('✅ Archivo eliminado correctamente', 'success');
                    // Recargar lista desde servidor
                    await loadDocumentosFromServer(categoria);
                } else {
                    mostrarNotificacion(\`❌ Error: \${result.message}\`, 'error');
                }
            } catch (error) {
                console.error('Error eliminando archivo:', error);
                mostrarNotificacion('❌ Error de conexión', 'error');
            }
        }

        // Cargar documentos al seleccionar solicitud - FUNCIÓN AGREGADA
        async function cargarDocumentosExistentes() {
            if (!solicitudSeleccionada) return;
            
            const categorias = ['caja_matricula', 'rotulo', 'memoria_tecnica', 'planos', 'documentacion'];
            
            for (const categoria of categorias) {
                await loadDocumentosFromServer(categoria);
            }
        }

        // Función para aprobar/rechazar documento individualmente
        async function cambiarEstadoDocumento(documentoId, estado, observaciones = '') {
            try {
                const response = await fetch(\`/api/chp/documento/\${documentoId}/revision\`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estado: estado,
                        observaciones: observaciones
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    mostrarNotificacion(\`✅ Documento \${estado.toLowerCase()} correctamente\`, 'success');
                    // Recargar todos los documentos
                    await cargarDocumentosExistentes();
                } else {
                    mostrarNotificacion(\`❌ Error: \${result.message}\`, 'error');
                }
            } catch (error) {
                console.error('Error cambiando estado:', error);
                mostrarNotificacion('❌ Error de conexión', 'error');
            }
        }
`;

// Leer el archivo admin-chp.html
console.log('📖 Leyendo admin-chp.html actual...');
let adminContent = fs.readFileSync('admin-chp.html', 'utf8');

// Buscar y reemplazar las funciones de manejo de archivos
const startMarker = '// Manejar subida de archivos';
const endMarker = '// Eliminar archivo';

const startIndex = adminContent.indexOf(startMarker);
const endIndex = adminContent.indexOf('// Inicializar manejadores de eventos', startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error('❌ No se encontraron las funciones a reemplazar');
    process.exit(1);
}

// Reemplazar las funciones
const beforeFunctions = adminContent.slice(0, startIndex);
const afterFunctions = adminContent.slice(endIndex);

adminContent = beforeFunctions + funcionesActualizadas + '\n\n        ' + afterFunctions;

// También actualizar la función seleccionarSolicitud para cargar documentos
adminContent = adminContent.replace(
    'renderizarPanelGestion();',
    `renderizarPanelGestion();
            
            // Cargar documentos existentes después de renderizar
            setTimeout(() => cargarDocumentosExistentes(), 100);`
);

// Guardar el archivo actualizado
fs.writeFileSync('admin-chp.html', adminContent, 'utf8');

console.log('✅ Frontend actualizado exitosamente');
console.log('📋 Funcionalidades agregadas:');
console.log('   ✅ Subida real de archivos al servidor');
console.log('   ✅ Listado de documentos desde base de datos');
console.log('   ✅ Visualización de estado por documento');
console.log('   ✅ Descarga/visualización de archivos');
console.log('   ✅ Eliminación de archivos del servidor');
console.log('   ✅ Carga automática de documentos existentes');