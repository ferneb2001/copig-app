// Script para agregar un formulario de corrección de títulos al admin panel
const fs = require('fs');
const path = require('path');

function agregarFormularioCorrecion() {
    try {
        console.log('🔧 Agregando formulario de corrección de títulos al panel admin...');
        
        const adminHtml = fs.readFileSync('admin.html', 'utf8');
        
        // Buscar dónde insertar el nuevo formulario
        const insertPoint = adminHtml.indexOf('<div class="nav-buttons">');
        
        if (insertPoint === -1) {
            console.log('❌ No se encontró el punto de inserción en admin.html');
            return;
        }
        
        const formularioHTML = `
        <!-- FORMULARIO CORRECCIÓN TÍTULOS -->
        <div class="section" id="correccion-titulos" style="display: none;">
            <h2>🔧 Corrección de Títulos Profesionales</h2>
            
            <div class="form-container" style="max-width: 800px; margin: 20px auto;">
                
                <!-- Buscar profesional -->
                <div class="form-group">
                    <label>Buscar Profesional:</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="buscar-profesional" placeholder="Nombre o matrícula..." style="flex: 1;">
                        <button onclick="buscarProfesionalParaCorreccion()" class="btn">🔍 Buscar</button>
                    </div>
                </div>
                
                <!-- Resultados de búsqueda -->
                <div id="resultados-busqueda" style="margin: 20px 0;"></div>
                
                <!-- Formulario de corrección -->
                <div id="formulario-correccion" style="display: none; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3>Corregir Título:</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                        <div>
                            <h4>Datos Actuales:</h4>
                            <div id="datos-actuales"></div>
                        </div>
                        <div>
                            <h4>Nueva Corrección:</h4>
                            <div class="form-group">
                                <label>Nuevo Título:</label>
                                <select id="nuevo-titulo" style="width: 100%; padding: 8px;">
                                    <option value="">Seleccionar título...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Observaciones:</label>
                                <textarea id="observaciones-correccion" placeholder="Fuente de la corrección (ej: PDF oficial COPIG, consulta directa, etc.)" style="width: 100%; height: 60px;"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="aplicarCorreccionTitulo()" class="btn" style="background: #10b981; margin-right: 10px;">✅ Aplicar Corrección</button>
                        <button onclick="cancelarCorreccion()" class="btn" style="background: #6b7280;">❌ Cancelar</button>
                    </div>
                </div>
                
                <!-- Historial de correcciones -->
                <div style="margin-top: 30px;">
                    <h3>📋 Últimas Correcciones Aplicadas:</h3>
                    <div id="historial-correcciones"></div>
                </div>
            </div>
        </div>
        
        `;
        
        // Insertar el formulario antes de los nav-buttons
        const adminModificado = adminHtml.substring(0, insertPoint) + 
                               formularioHTML + 
                               adminHtml.substring(insertPoint);
        
        // Backup del archivo original
        fs.writeFileSync('admin_backup_before_titulo_form.html', adminHtml);
        
        // Escribir el archivo modificado
        fs.writeFileSync('admin.html', adminModificado);
        
        console.log('✅ Formulario agregado exitosamente');
        console.log('📁 Backup guardado en: admin_backup_before_titulo_form.html');
        console.log('🔄 **REINICIA EL SERVIDOR** para ver los cambios');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

function agregarJavaScriptFormulario() {
    try {
        console.log('📝 Agregando JavaScript del formulario...');
        
        const jsCode = `
        // FUNCIONES PARA CORRECCIÓN DE TÍTULOS
        let profesionalSeleccionado = null;
        let titulosDisponibles = [];
        
        async function buscarProfesionalParaCorreccion() {
            const busqueda = document.getElementById('buscar-profesional').value;
            if (!busqueda) return;
            
            try {
                const response = await fetch(\`/api/admin/profesionales?buscar=\${encodeURIComponent(busqueda)}\`, {
                    credentials: 'include'
                });
                const data = await response.json();
                
                mostrarResultadosBusqueda(data.profesionales || []);
            } catch (error) {
                console.error('Error buscando profesional:', error);
                alert('Error en la búsqueda');
            }
        }
        
        function mostrarResultadosBusqueda(profesionales) {
            const container = document.getElementById('resultados-busqueda');
            
            if (profesionales.length === 0) {
                container.innerHTML = '<div class="alert">No se encontraron profesionales</div>';
                return;
            }
            
            const html = profesionales.map(prof => \`
                <div class="result-item" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0; border-radius: 5px; cursor: pointer;" 
                     onclick="seleccionarProfesionalParaCorreccion(\${prof.id}, '\${prof.nombre}', '\${prof.numero_matricula}', '\${prof.titulo || 'Sin título'}')">
                    <strong>Mat. \${prof.numero_matricula}:</strong> \${prof.nombre}
                    <br><small>Título actual: \${prof.titulo || 'Sin título asignado'}</small>
                </div>
            \`).join('');
            
            container.innerHTML = html;
        }
        
        async function seleccionarProfesionalParaCorreccion(id, nombre, matricula, tituloActual) {
            profesionalSeleccionado = { id, nombre, matricula, tituloActual };
            
            // Mostrar datos actuales
            document.getElementById('datos-actuales').innerHTML = \`
                <p><strong>Matrícula:</strong> \${matricula}</p>
                <p><strong>Nombre:</strong> \${nombre}</p>
                <p><strong>Título actual:</strong> \${tituloActual}</p>
            \`;
            
            // Cargar títulos disponibles si no están cargados
            if (titulosDisponibles.length === 0) {
                await cargarTitulosDisponibles();
            }
            
            // Mostrar formulario
            document.getElementById('formulario-correccion').style.display = 'block';
        }
        
        async function cargarTitulosDisponibles() {
            try {
                const response = await fetch('/api/admin/titulos-disponibles', { credentials: 'include' });
                const data = await response.json();
                titulosDisponibles = data.titulos || [];
                
                const select = document.getElementById('nuevo-titulo');
                select.innerHTML = '<option value="">Seleccionar título...</option>' + 
                    titulosDisponibles.map(t => \`<option value="\${t.id}">\${t.descripcion}</option>\`).join('');
                    
            } catch (error) {
                console.error('Error cargando títulos:', error);
            }
        }
        
        async function aplicarCorreccionTitulo() {
            if (!profesionalSeleccionado) return;
            
            const nuevoTituloId = document.getElementById('nuevo-titulo').value;
            const observaciones = document.getElementById('observaciones-correccion').value;
            
            if (!nuevoTituloId) {
                alert('Selecciona un nuevo título');
                return;
            }
            
            try {
                const response = await fetch('/api/admin/corregir-titulo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        profesional_id: profesionalSeleccionado.id,
                        nuevo_titulo_id: nuevoTituloId,
                        observaciones: observaciones
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`✅ Título corregido exitosamente para \${profesionalSeleccionado.nombre}\`);
                    cancelarCorreccion();
                    cargarHistorialCorrecciones();
                } else {
                    alert('Error: ' + result.error);
                }
                
            } catch (error) {
                console.error('Error aplicando corrección:', error);
                alert('Error aplicando corrección');
            }
        }
        
        function cancelarCorreccion() {
            profesionalSeleccionado = null;
            document.getElementById('formulario-correccion').style.display = 'none';
            document.getElementById('buscar-profesional').value = '';
            document.getElementById('resultados-busqueda').innerHTML = '';
            document.getElementById('observaciones-correccion').value = '';
            document.getElementById('nuevo-titulo').value = '';
        }
        
        async function cargarHistorialCorrecciones() {
            try {
                const response = await fetch('/api/admin/historial-correcciones', { credentials: 'include' });
                const data = await response.json();
                
                const container = document.getElementById('historial-correcciones');
                if (data.correcciones && data.correcciones.length > 0) {
                    container.innerHTML = data.correcciones.map(corr => \`
                        <div style="border: 1px solid #e5e7eb; padding: 10px; margin: 5px 0; border-radius: 5px; font-size: 14px;">
                            <strong>Mat. \${corr.matricula}:</strong> \${corr.nombre_profesional}<br>
                            <small>\${corr.titulo_anterior} → \${corr.titulo_nuevo}</small><br>
                            <small style="color: #6b7280;">Fecha: \${corr.fecha_correccion} | Por: \${corr.usuario_correccion}</small>
                        </div>
                    \`).join('');
                } else {
                    container.innerHTML = '<div style="color: #6b7280; font-style: italic;">No hay correcciones recientes</div>';
                }
            } catch (error) {
                console.error('Error cargando historial:', error);
            }
        }
        
        // Cargar historial al mostrar la sección
        document.addEventListener('DOMContentLoaded', function() {
            // Agregar botón de navegación
            const navButtons = document.querySelector('.nav-buttons');
            if (navButtons) {
                const botonCorreccion = document.createElement('button');
                botonCorreccion.className = 'nav-btn';
                botonCorreccion.onclick = () => showSection('correccion-titulos');
                botonCorreccion.innerHTML = '🔧 Corrección Títulos';
                navButtons.appendChild(botonCorreccion);
            }
        });
        `;
        
        // Agregar el JavaScript al final del archivo admin.html
        let adminHtml = fs.readFileSync('admin.html', 'utf8');
        const scriptInsertPoint = adminHtml.lastIndexOf('</script>');
        
        if (scriptInsertPoint !== -1) {
            adminHtml = adminHtml.substring(0, scriptInsertPoint) + jsCode + adminHtml.substring(scriptInsertPoint);
            fs.writeFileSync('admin.html', adminHtml);
            console.log('✅ JavaScript agregado exitosamente');
        }
        
    } catch (error) {
        console.error('❌ Error agregando JavaScript:', error);
    }
}

// Ejecutar
agregarFormularioCorrecion();
agregarJavaScriptFormulario();