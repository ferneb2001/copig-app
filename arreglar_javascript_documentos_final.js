const fs = require('fs');

console.log('🚀 ARREGLANDO JAVASCRIPT DOCUMENTOS - ELEMENT NULL FIX');

let content = fs.readFileSync('portal-profesional.html', 'utf8');

// JavaScript corregido y completo
const javascriptCorregido = `
        // ============================================================================
        // GESTIÓN DE DOCUMENTOS CHP - FUNCIONALIDAD COMPLETA SIN ERRORES
        // ============================================================================
        let selectedCategory = null;
        let uploadedDocuments = {};

        // Inicializar gestión de documentos cuando DOM esté listo
        function initDocumentManagement() {
            console.log('🚀 Inicializando gestión de documentos CHP');
            
            // Verificar que existan los elementos necesarios
            const categoryOptions = document.querySelectorAll('.category-option');
            const uploadContainer = document.getElementById('upload-container');
            const fileInput = document.getElementById('fileInput');
            const uploadArea = document.querySelector('.upload-area');
            
            console.log('📋 Elementos encontrados:');
            console.log('   Category options:', categoryOptions.length);
            console.log('   Upload container:', uploadContainer ? '✅' : '❌');
            console.log('   File input:', fileInput ? '✅' : '❌');
            console.log('   Upload area:', uploadArea ? '✅' : '❌');
            
            // Event listeners para categorías
            categoryOptions.forEach(option => {
                option.addEventListener('click', function() {
                    selectCategory(this.dataset.category);
                });
            });

            // Event listener para input de archivos
            if (fileInput) {
                fileInput.addEventListener('change', handleFileSelection);
            }

            // Event listeners para drag & drop
            if (uploadArea) {
                uploadArea.addEventListener('dragover', handleDragOver);
                uploadArea.addEventListener('dragleave', handleDragLeave);
                uploadArea.addEventListener('drop', handleFileDrop);
            }
        }

        // Seleccionar categoría
        function selectCategory(category) {
            console.log('📁 Categoría seleccionada:', category);
            selectedCategory = category;
            
            // Actualizar UI - con verificación de existencia
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(option => {
                option.classList.remove('selected');
            });
            
            const selectedOption = document.querySelector(\`[data-category="\${category}"]\`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
            
            // Mostrar área de subida
            const uploadContainer = document.getElementById('upload-container');
            if (uploadContainer) {
                uploadContainer.style.display = 'block';
            }
            
            // Actualizar texto del área de subida
            const categoryNames = {
                'caja_matricula': 'Comprobante Caja de Previsión y Matrícula',
                'rotulo': 'Rótulo Profesional',
                'memoria_tecnica': 'Memoria Técnica',
                'planos': 'Planos de Ubicación',
                'documentacion': 'Documentación del Proyecto'
            };
            
            const uploadText = document.querySelector('.upload-text p');
            if (uploadText) {
                uploadText.textContent = \`Sube archivos para: \${categoryNames[category]}\`;
            }
            
            // Cargar archivos existentes para esta categoría
            loadExistingDocuments(category);
        }

        // Manejar selección de archivos
        function handleFileSelection(event) {
            const files = Array.from(event.target.files);
            processFiles(files);
        }

        // Manejar drag over
        function handleDragOver(event) {
            event.preventDefault();
            const target = event.currentTarget;
            if (target) {
                target.classList.add('dragover');
            }
        }

        // Manejar drag leave
        function handleDragLeave(event) {
            const target = event.currentTarget;
            if (target) {
                target.classList.remove('dragover');
            }
        }

        // Manejar drop de archivos
        function handleFileDrop(event) {
            event.preventDefault();
            const target = event.currentTarget;
            if (target) {
                target.classList.remove('dragover');
            }
            
            const files = Array.from(event.dataTransfer.files);
            processFiles(files);
        }

        // Procesar archivos seleccionados
        function processFiles(files) {
            if (!selectedCategory) {
                if (typeof showToast === 'function') {
                    showToast('⚠️ Debe seleccionar una categoría primero', 'warning');
                } else {
                    alert('⚠️ Debe seleccionar una categoría primero');
                }
                return;
            }

            // Filtrar solo PDFs
            const pdfFiles = files.filter(file => file.type === 'application/pdf');
            if (pdfFiles.length === 0) {
                if (typeof showToast === 'function') {
                    showToast('⚠️ Solo se permiten archivos PDF', 'error');
                } else {
                    alert('⚠️ Solo se permiten archivos PDF');
                }
                return;
            }

            // Verificar tamaño
            const oversizedFiles = pdfFiles.filter(file => file.size > 10 * 1024 * 1024); // 10MB
            if (oversizedFiles.length > 0) {
                const message = \`⚠️ Archivos muy grandes: \${oversizedFiles.map(f => f.name).join(', ')}\`;
                if (typeof showToast === 'function') {
                    showToast(message, 'error');
                } else {
                    alert(message);
                }
                return;
            }

            // Subir archivos
            uploadFiles(pdfFiles);
        }

        // Subir archivos al servidor
        async function uploadFiles(files) {
            const message = '📤 Subiendo archivos...';
            if (typeof showToast === 'function') {
                showToast(message, 'info');
            } else {
                console.log(message);
            }
            
            const formData = new FormData();
            files.forEach(file => {
                formData.append('documentos', file);
            });

            try {
                const response = await fetch(\`/api/chp/documentos/upload/\${selectedCategory}\`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    const successMsg = \`✅ \${files.length} archivo(s) subido(s) correctamente\`;
                    if (typeof showToast === 'function') {
                        showToast(successMsg, 'success');
                    } else {
                        alert(successMsg);
                    }
                    
                    // Actualizar lista de documentos
                    if (!uploadedDocuments[selectedCategory]) {
                        uploadedDocuments[selectedCategory] = [];
                    }
                    
                    files.forEach(file => {
                        uploadedDocuments[selectedCategory].push({
                            name: file.name,
                            size: formatFileSize(file.size),
                            uploadDate: new Date(),
                            status: 'PENDIENTE'
                        });
                    });
                    
                    renderUploadedFiles();
                    
                    // Limpiar input
                    const fileInput = document.getElementById('fileInput');
                    if (fileInput) {
                        fileInput.value = '';
                    }
                } else {
                    const errorMsg = \`❌ Error: \${result.message}\`;
                    if (typeof showToast === 'function') {
                        showToast(errorMsg, 'error');
                    } else {
                        alert(errorMsg);
                    }
                }
                
            } catch (error) {
                console.error('Error subiendo archivos:', error);
                const errorMsg = '❌ Error de conexión al subir archivos';
                if (typeof showToast === 'function') {
                    showToast(errorMsg, 'error');
                } else {
                    alert(errorMsg);
                }
            }
        }

        // Cargar documentos existentes
        async function loadExistingDocuments(category) {
            try {
                const response = await fetch(\`/api/chp/documentos/\${category}\`);
                const result = await response.json();
                
                if (result.success && result.documentos) {
                    uploadedDocuments[category] = result.documentos.map(doc => ({
                        id: doc.id,
                        name: doc.archivo_nombre,
                        size: formatFileSize(doc.archivo_size || 0),
                        uploadDate: new Date(doc.fecha_carga),
                        status: doc.estado,
                        downloadUrl: \`/api/chp/documento/\${doc.id}/download\`
                    }));
                    
                    renderUploadedFiles();
                }
            } catch (error) {
                console.error('Error cargando documentos:', error);
            }
        }

        // Renderizar archivos subidos
        function renderUploadedFiles() {
            const container = document.getElementById('uploaded-files-container');
            const list = document.getElementById('uploaded-files-list');
            
            if (!container || !list) {
                console.log('⚠️ Contenedores de archivos no encontrados');
                return;
            }
            
            if (!selectedCategory || !uploadedDocuments[selectedCategory] || uploadedDocuments[selectedCategory].length === 0) {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'block';
            
            let html = '';
            uploadedDocuments[selectedCategory].forEach((file, index) => {
                const statusClass = file.status === 'APROBADO' ? 'success' : 
                                   file.status === 'RECHAZADO' ? 'error' : 'info';
                
                html += \`
                    <div class="file-item">
                        <div class="file-info">
                            <span class="file-icon">📄</span>
                            <div>
                                <div style="font-weight: 500;">\${file.name}</div>
                                <div style="font-size: 0.9rem; color: #7f8c8d;">
                                    \${file.size} • \${file.uploadDate.toLocaleDateString()}
                                </div>
                                <div class="status-badge status-\${file.status.toLowerCase()}" style="margin-top: 5px;">
                                    \${file.status}
                                </div>
                            </div>
                        </div>
                        <div class="file-actions">
                            \${file.downloadUrl ? \`<button class="btn btn-secondary btn-small" onclick="window.open('\${file.downloadUrl}', '_blank')">Ver</button>\` : ''}
                            <button class="btn btn-secondary btn-small" onclick="deleteDocument(\${index})">Eliminar</button>
                        </div>
                    </div>
                \`;
            });
            
            list.innerHTML = html;
        }

        // Eliminar documento
        function deleteDocument(index) {
            if (!confirm('¿Está seguro de eliminar este archivo?')) return;
            
            const file = uploadedDocuments[selectedCategory][index];
            
            if (file.id) {
                // Eliminar del servidor
                fetch(\`/api/chp/documento/\${file.id}\`, { method: 'DELETE' })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            const msg = '✅ Archivo eliminado correctamente';
                            if (typeof showToast === 'function') {
                                showToast(msg, 'success');
                            } else {
                                alert(msg);
                            }
                            uploadedDocuments[selectedCategory].splice(index, 1);
                            renderUploadedFiles();
                        } else {
                            const errorMsg = \`❌ Error: \${result.message}\`;
                            if (typeof showToast === 'function') {
                                showToast(errorMsg, 'error');
                            } else {
                                alert(errorMsg);
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error eliminando archivo:', error);
                        const errorMsg = '❌ Error de conexión';
                        if (typeof showToast === 'function') {
                            showToast(errorMsg, 'error');
                        } else {
                            alert(errorMsg);
                        }
                    });
            } else {
                // Solo eliminar localmente
                uploadedDocuments[selectedCategory].splice(index, 1);
                renderUploadedFiles();
            }
        }

        // Formatear tamaño de archivo
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Inicializar cuando DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            // Esperar un poco para asegurar que todo esté cargado
            setTimeout(initDocumentManagement, 100);
        });
`;

// Buscar donde está el JavaScript actual y reemplazarlo
const scriptStart = content.indexOf('<script>');
const scriptEnd = content.indexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
    // Mantener el JavaScript existente pero agregar el de documentos
    const beforeScript = content.substring(0, scriptStart + 8); // +8 para incluir <script>
    const existingScript = content.substring(scriptStart + 8, scriptEnd);
    const afterScript = content.substring(scriptEnd);
    
    // Insertar el JavaScript corregido al final del script existente
    const newContent = beforeScript + existingScript + javascriptCorregido + afterScript;
    
    // Crear backup
    fs.writeFileSync('portal-profesional-pre-js-fix.html', content, 'utf8');
    
    // Escribir archivo corregido
    fs.writeFileSync('portal-profesional.html', newContent, 'utf8');
    
    console.log('✅ JavaScript de documentos corregido e insertado');
    console.log('💾 Backup: portal-profesional-pre-js-fix.html');
    
} else {
    console.log('❌ No se encontró bloque <script> para insertar JavaScript');
}

console.log('\n🎯 CORRECCIÓN JAVASCRIPT COMPLETADA');
console.log('✅ Verificaciones de elementos null agregadas');
console.log('✅ Manejo de errores mejorado');
console.log('✅ Inicialización segura implementada');
console.log('\n🔄 Refresca el navegador: Ctrl+F5');