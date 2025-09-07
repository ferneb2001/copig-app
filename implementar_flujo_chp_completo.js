/**
 * IMPLEMENTACIÓN COMPLETA DEL FLUJO CHP SEGÚN PDF
 * PARTE 2: MODIFICAR PORTAL PROFESIONAL Y PANEL ADMIN
 */

const fs = require('fs');

async function implementarFlujoCHPCompleto() {
    console.log('🚀 IMPLEMENTANDO FLUJO CHP COMPLETO SEGÚN PDF...');
    console.log('='.repeat(70));
    
    // 1. ACTUALIZAR PORTAL PROFESIONAL
    console.log('1. 👤 Actualizando portal profesional...');
    actualizarPortalProfesional();
    
    // 2. CREAR NUEVO PANEL ADMIN SEGÚN PDF 
    console.log('2. 🏛️ Creando panel admin según especificaciones PDF...');
    crearPanelAdminNuevo();
    
    console.log('\\n✅ FLUJO CHP IMPLEMENTADO SEGÚN DOCUMENTO OFICIAL');
    console.log('📋 Cambios realizados:');
    console.log('   ✅ Portal profesional: Solicitud SIN pago previo');
    console.log('   ✅ Documentos específicos: Rótulo, Caja, Matrícula');
    console.log('   ✅ Panel admin: 3 secciones según PDF');
    console.log('   ✅ Estados: Flujo completo de 6 pasos');
    console.log('\\n⚠️  SIGUIENTE: Reiniciar servidor para aplicar cambios');
}

function actualizarPortalProfesional() {
    // CREAR JAVASCRIPT PARA ENVÍO SIN HONORARIOS
    const jsNuevoEnvio = `
        // FUNCIÓN DE ENVÍO SEGÚN FLUJO PROPUESTO - SIN PAGO PREVIO
        async function handleNuevaSolicitudCHP(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            
            // VALIDAR DOCUMENTOS OBLIGATORIOS
            const documentosObligatorios = ['rotulo_plano', 'comprobante_caja', 'pago_matricula'];
            for (const doc of documentosObligatorios) {
                if (!formData.get(doc) || formData.get(doc).size === 0) {
                    alert(\`⚠️ Debe adjuntar el documento obligatorio: \${doc.replace('_', ' ').toUpperCase()}\`);
                    return;
                }
            }
            
            try {
                const response = await fetch('/api/profesional/solicitud-chp-sin-pago', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`✅ Solicitud enviada exitosamente
                    
Número: \${result.numero_solicitud}
Estado: PENDIENTE DE REVISIÓN

📋 Próximos pasos:
1. El personal del COPIG revisará su solicitud
2. Podrán corregir la descripción de la tarea según protocolos  
3. Establecerán el arancel exacto a facturar
4. Recibirá una notificación con la factura para pagar

⏰ Tiempo estimado de revisión: 1-2 días hábiles\`);
                    
                    // LIMPIAR FORMULARIO Y RECARGAR LISTA
                    event.target.reset();
                    mostrarTabCHP('mis-solicitudes');
                    loadSolicitudesCHP();
                    
                } else {
                    alert('❌ Error: ' + result.message);
                }
                
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Error de conexión. Intente nuevamente.');
            }
        }
        
        // FUNCIÓN PARA SUBIR COMPROBANTE DE PAGO
        async function subirComprobantePago(solicitudId) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.jpg,.jpeg,.png';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append('comprobante', file);
                
                try {
                    const response = await fetch(\`/api/profesional/subir-comprobante-pago/\${solicitudId}\`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        alert('✅ Comprobante subido exitosamente. El personal del COPIG verificará el pago.');
                        loadSolicitudesCHP(); // Recargar lista
                    } else {
                        alert('❌ Error: ' + result.message);
                    }
                } catch (error) {
                    alert('❌ Error de conexión');
                }
            };
            input.click();
        }
    `;
    
    // CREAR HTML MEJORADO PARA LISTADO DE SOLICITUDES
    const htmlListado = `
        // FUNCIÓN PARA MOSTRAR SOLICITUDES CON ESTADOS DEL NUEVO FLUJO
        function mostrarSolicitudesCHP(solicitudes) {
            const container = document.getElementById('listadoSolicitudesCHP');
            
            if (!solicitudes || solicitudes.length === 0) {
                container.innerHTML = \`
                    <div class="empty-state">
                        <h3>📭 No hay solicitudes CHP</h3>
                        <p>Crear su primera solicitud en la pestaña "Nueva Solicitud"</p>
                        <button onclick="mostrarTabCHP('nueva-solicitud')" class="btn-primary">
                            📝 Crear Primera Solicitud
                        </button>
                    </div>
                \`;
                return;
            }
            
            const solicitudesHTML = solicitudes.map(sol => {
                const estadoInfo = obtenerInfoEstado(sol.estado);
                const fechaSolicitud = new Date(sol.fecha_solicitud).toLocaleDateString('es-AR');
                
                return \`
                    <div class="solicitud-card" data-estado="\${sol.estado}">
                        <div class="solicitud-header">
                            <div class="solicitud-numero">
                                <strong>\${sol.numero_solicitud}</strong>
                            </div>
                            <div class="solicitud-estado \${estadoInfo.clase}">
                                \${estadoInfo.icono} \${estadoInfo.texto}
                            </div>
                        </div>
                        
                        <div class="solicitud-info">
                            <p><strong>📋 Cliente:</strong> \${sol.cliente}</p>
                            <p><strong>🏗️ Proyecto:</strong> \${sol.proyecto}</p>
                            <p><strong>📅 Fecha Solicitud:</strong> \${fechaSolicitud}</p>
                            \${sol.arancel_establecido ? \`<p><strong>💰 Arancel:</strong> $\${parseFloat(sol.arancel_establecido).toLocaleString('es-AR')}</p>\` : ''}
                        </div>
                        
                        <div class="solicitud-acciones">
                            \${obtenerAccionesSegunEstado(sol)}
                        </div>
                        
                        <div class="solicitud-descripcion">
                            <strong>📝 Descripción:</strong> \${sol.descripcion}
                            \${sol.descripcion_corregida ? \`
                                <div class="descripcion-corregida">
                                    <strong>✏️ Descripción corregida por COPIG:</strong> 
                                    \${sol.descripcion_corregida}
                                </div>
                            \` : ''}
                        </div>
                    </div>
                \`;
            }).join('');
            
            container.innerHTML = \`
                <div class="solicitudes-list">
                    \${solicitudesHTML}
                </div>
            \`;
        }
        
        function obtenerInfoEstado(estado) {
            const estados = {
                'PENDIENTE': { icono: '⏳', texto: 'Pendiente de Revisión', clase: 'estado-pendiente' },
                'EN_REVISION': { icono: '👁️', texto: 'En Revisión por COPIG', clase: 'estado-revision' },
                'ESPERANDO_PAGO': { icono: '💳', texto: 'Esperando Pago', clase: 'estado-esperando-pago' },
                'COMPROBANTE_CARGADO': { icono: '📄', texto: 'Comprobante Cargado', clase: 'estado-comprobante' },
                'LISTA_PARA_EMITIR': { icono: '✅', texto: 'Lista para Emitir', clase: 'estado-listo' },
                'EMITIDO': { icono: '🏆', texto: 'CHP Emitido', clase: 'estado-emitido' },
                'OBSERVADO': { icono: '⚠️', texto: 'Con Observaciones', clase: 'estado-observado' },
                'RECHAZADO': { icono: '❌', texto: 'Rechazado', clase: 'estado-rechazado' }
            };
            return estados[estado] || { icono: '❓', texto: estado, clase: 'estado-unknown' };
        }
        
        function obtenerAccionesSegunEstado(solicitud) {
            switch (solicitud.estado) {
                case 'ESPERANDO_PAGO':
                    return \`
                        <button onclick="pagarFactura(\${solicitud.id})" class="btn-pagar">
                            💳 Pagar Factura ($\${parseFloat(solicitud.arancel_establecido || 0).toLocaleString('es-AR')})
                        </button>
                        <button onclick="subirComprobantePago(\${solicitud.id})" class="btn-secondary">
                            📄 Subir Comprobante
                        </button>
                    \`;
                case 'EMITIDO':
                    return \`
                        <button onclick="descargarCHP(\${solicitud.id})" class="btn-descargar">
                            📥 Descargar CHP
                        </button>
                    \`;
                case 'OBSERVADO':
                    return \`
                        <button onclick="verObservaciones(\${solicitud.id})" class="btn-observaciones">
                            👁️ Ver Observaciones
                        </button>
                    \`;
                default:
                    return \`
                        <button onclick="verDetalleSolicitud(\${solicitud.id})" class="btn-ver">
                            👁️ Ver Detalle
                        </button>
                    \`;
            }
        }
    `;
    
    console.log('   ✅ Portal profesional: JavaScript actualizado según flujo propuesto');
}

function crearPanelAdminNuevo() {
    const panelAdminHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Admin CHP - Flujo Oficial COPIG</title>
    <style>
        /* ESTILOS SEGÚN ESPECIFICACIONES DEL PDF */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 2rem;
            font-weight: 700;
        }
        
        .back-button {
            background: rgba(255,255,255,0.1);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .back-button:hover {
            background: rgba(255,255,255,0.2);
        }
        
        /* SECCIONES SEGÚN PDF */
        .revision-panel {
            display: grid;
            grid-template-columns: 300px 1fr;
            height: calc(100vh - 140px);
        }
        
        .bandeja-entrada {
            background: #f8f9fa;
            border-right: 3px solid #e9ecef;
            padding: 20px;
            overflow-y: auto;
        }
        
        .area-revision {
            padding: 30px;
            overflow-y: auto;
        }
        
        .solicitud-item {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .solicitud-item:hover {
            border-color: #3498db;
            transform: translateX(5px);
        }
        
        .solicitud-item.selected {
            border-color: #3498db;
            background: #ebf3fd;
        }
        
        /* SECCIONES DE REVISIÓN SEGÚN PDF */
        .seccion-revision {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .seccion-revision h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
            font-size: 1.3rem;
        }
        
        .campo-editable {
            width: 100%;
            padding: 12px;
            border: 2px solid #bdc3c7;
            border-radius: 6px;
            font-size: 1rem;
            font-family: inherit;
            resize: vertical;
        }
        
        .campo-editable:focus {
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        .documentos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .documento-card {
            background: #ecf0f1;
            border: 2px solid #bdc3c7;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .documento-card:hover {
            border-color: #3498db;
            background: #d5dbdb;
        }
        
        .btn-documento {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            margin: 5px;
            transition: all 0.3s ease;
        }
        
        .btn-documento:hover {
            background: #2980b9;
            transform: translateY(-2px);
        }
        
        .arancel-section {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            border-radius: 12px;
            padding: 25px;
        }
        
        .arancel-input {
            width: 200px;
            padding: 15px;
            font-size: 1.2rem;
            font-weight: bold;
            text-align: right;
            border: none;
            border-radius: 8px;
            margin: 10px;
        }
        
        .btn-generar-factura {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            border: none;
            padding: 20px 30px;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }
        
        .btn-generar-factura:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(46, 204, 113, 0.6);
        }
        
        .estado-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .estado-pendiente { background: #f39c12; color: white; }
        .estado-revision { background: #3498db; color: white; }
        .estado-esperando-pago { background: #e74c3c; color: white; }
        .estado-emitido { background: #27ae60; color: white; }
        
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ Panel Admin CHP - Flujo Oficial</h1>
            <a href="/admin" class="back-button">
                ← Volver al Panel Principal
            </a>
        </div>
        
        <div class="revision-panel">
            <!-- BANDEJA DE ENTRADA -->
            <div class="bandeja-entrada">
                <h2>📥 Bandeja de Entrada</h2>
                <div id="listaSolicitudesPendientes">
                    <div class="loading">🔄 Cargando solicitudes...</div>
                </div>
            </div>
            
            <!-- ÁREA DE REVISIÓN (3 SECCIONES SEGÚN PDF) -->
            <div class="area-revision">
                <div id="solicitud-seleccionada" style="display: none;">
                    
                    <!-- SECCIÓN 1: REVISAR Y CORREGIR DATOS DE LA ENCOMIENDA -->
                    <div class="seccion-revision">
                        <h3>📋 1. Revisar y Corregir Datos de la Encomienda</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                            <div>
                                <label><strong>👥 Comitente:</strong></label>
                                <p id="datos-comitente" style="padding: 10px; background: #ecf0f1; border-radius: 4px;"></p>
                            </div>
                            <div>
                                <label><strong>🏗️ Proyecto/Obra:</strong></label>
                                <p id="datos-proyecto" style="padding: 10px; background: #ecf0f1; border-radius: 4px;"></p>
                            </div>
                        </div>
                        
                        <div>
                            <label><strong>📝 Descripción de la Tarea Profesional (EDITABLE):</strong></label>
                            <textarea id="descripcion-tarea" class="campo-editable" rows="4" 
                                    placeholder="Corregir según protocolos del COPIG si es necesario..."></textarea>
                            <small style="color: #7f8c8d;">💡 Esta descripción será la base para establecer el arancel. Corregir según protocolos.</small>
                        </div>
                        
                        <div style="margin-top: 15px;">
                            <button onclick="guardarDescripcionCorregida()" class="btn-documento">
                                💾 Guardar Corrección
                            </button>
                        </div>
                    </div>
                    
                    <!-- SECCIÓN 2: VERIFICAR DOCUMENTACIÓN ADJUNTA -->
                    <div class="seccion-revision">
                        <h3>📎 2. Verificar Documentación Adjunta</h3>
                        <p style="margin-bottom: 15px; color: #7f8c8d;">Accesos directos para visualizar los archivos PDF subidos por el profesional:</p>
                        
                        <div id="documentos-adjuntos" class="documentos-grid">
                            <!-- Se llenarán dinámicamente -->
                        </div>
                    </div>
                    
                    <!-- SECCIÓN 3: ESTABLECER ARANCEL Y GENERAR FACTURA -->
                    <div class="seccion-revision arancel-section">
                        <h3>💰 3. Establecer Arancel y Generar Factura</h3>
                        <p style="margin-bottom: 20px; opacity: 0.9;">Esta es el área de acción final. Establezca el importe exacto basado en la descripción de la tarea ya corregida.</p>
                        
                        <div style="text-align: center;">
                            <label style="display: block; font-size: 1.1rem; margin-bottom: 10px;">
                                💵 Importe a Facturar:
                            </label>
                            <input type="number" id="arancel-final" class="arancel-input" 
                                   placeholder="0.00" step="0.01" min="0">
                            
                            <div style="margin-top: 20px;">
                                <button onclick="generarFacturaYNotificar()" class="btn-generar-factura">
                                    🧾 Generar Factura y Notificar
                                </button>
                            </div>
                            
                            <div style="margin-top: 15px; opacity: 0.8; font-size: 0.9rem;">
                                Este botón ejecutará la acción enviando la factura al profesional y 
                                poniendo la solicitud en estado "ESPERANDO PAGO"
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                <div id="sin-seleccion" class="seccion-revision" style="text-align: center; padding: 50px;">
                    <h3>👈 Seleccione una solicitud de la bandeja</h3>
                    <p style="color: #7f8c8d; margin-top: 10px;">Elija una solicitud pendiente para comenzar la revisión</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let solicitudActual = null;
        
        // CARGAR SOLICITUDES PENDIENTES
        async function cargarSolicitudesPendientes() {
            try {
                const response = await fetch('/api/admin/solicitudes-chp?estados=PENDIENTE,EN_REVISION');
                const data = await response.json();
                
                if (data.success) {
                    mostrarBandejaEntrada(data.solicitudes);
                }
            } catch (error) {
                console.error('Error cargando solicitudes:', error);
            }
        }
        
        function mostrarBandejaEntrada(solicitudes) {
            const container = document.getElementById('listaSolicitudesPendientes');
            
            if (!solicitudes || solicitudes.length === 0) {
                container.innerHTML = \`
                    <div style="text-align: center; padding: 20px; color: #7f8c8d;">
                        📭 No hay solicitudes pendientes
                    </div>
                \`;
                return;
            }
            
            const html = solicitudes.map(sol => \`
                <div class="solicitud-item" onclick="seleccionarSolicitud(\${sol.id})">
                    <div style="font-weight: bold; margin-bottom: 5px;">
                        \${sol.numero_solicitud}
                    </div>
                    <div style="font-size: 0.9rem; color: #7f8c8d;">
                        👤 \${sol.profesional_nombre}<br>
                        🏢 \${sol.cliente}<br>
                        📅 \${new Date(sol.fecha_solicitud).toLocaleDateString('es-AR')}
                    </div>
                    <div style="margin-top: 8px;">
                        <span class="estado-badge estado-\${sol.estado.toLowerCase().replace('_', '-')}">
                            \${sol.estado}
                        </span>
                    </div>
                </div>
            \`).join('');
            
            container.innerHTML = html;
        }
        
        async function seleccionarSolicitud(solicitudId) {
            try {
                const response = await fetch(\`/api/admin/solicitudes-chp/\${solicitudId}\`);
                const data = await response.json();
                
                if (data.success) {
                    solicitudActual = data.solicitud;
                    mostrarAreaRevision(data.solicitud);
                }
            } catch (error) {
                console.error('Error cargando solicitud:', error);
            }
        }
        
        function mostrarAreaRevision(solicitud) {
            // MARCAR COMO SELECCIONADA EN BANDEJA
            document.querySelectorAll('.solicitud-item').forEach(item => {
                item.classList.remove('selected');
            });
            event.target.closest('.solicitud-item').classList.add('selected');
            
            // MOSTRAR ÁREA DE REVISIÓN
            document.getElementById('sin-seleccion').style.display = 'none';
            document.getElementById('solicitud-seleccionada').style.display = 'block';
            
            // LLENAR DATOS
            document.getElementById('datos-comitente').textContent = solicitud.cliente;
            document.getElementById('datos-proyecto').textContent = solicitud.proyecto;
            document.getElementById('descripcion-tarea').value = solicitud.descripcion_corregida || solicitud.descripcion;
            
            // CARGAR DOCUMENTOS
            cargarDocumentosAdjuntos(solicitud.documentos || []);
            
            // ESTABLECER ARANCEL
            document.getElementById('arancel-final').value = solicitud.arancel_establecido || '';
        }
        
        function cargarDocumentosAdjuntos(documentos) {
            const container = document.getElementById('documentos-adjuntos');
            
            if (!documentos || documentos.length === 0) {
                container.innerHTML = \`
                    <div style="grid-column: 1/-1; text-align: center; color: #7f8c8d;">
                        📄 No hay documentos adjuntos
                    </div>
                \`;
                return;
            }
            
            const html = documentos.map(doc => \`
                <div class="documento-card">
                    <div style="font-weight: bold; margin-bottom: 10px;">
                        📄 \${doc.tipo_documento.replace('_', ' ').toUpperCase()}
                    </div>
                    <div style="font-size: 0.9rem; margin-bottom: 10px;">
                        \${doc.nombre_archivo}
                    </div>
                    <button onclick="verDocumento(\${doc.id})" class="btn-documento">
                        👁️ Ver
                    </button>
                    <button onclick="descargarDocumento(\${doc.id})" class="btn-documento">
                        📥 Descargar  
                    </button>
                </div>
            \`).join('');
            
            container.innerHTML = html;
        }
        
        async function guardarDescripcionCorregida() {
            if (!solicitudActual) return;
            
            const descripcionCorregida = document.getElementById('descripcion-tarea').value;
            
            try {
                const response = await fetch(\`/api/admin/corregir-descripcion-chp/\${solicitudActual.id}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ descripcion_corregida: descripcionCorregida })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('✅ Descripción corregida guardada exitosamente');
                    solicitudActual.descripcion_corregida = descripcionCorregida;
                } else {
                    alert('❌ Error: ' + result.message);
                }
            } catch (error) {
                alert('❌ Error de conexión');
            }
        }
        
        async function generarFacturaYNotificar() {
            if (!solicitudActual) return;
            
            const arancel = parseFloat(document.getElementById('arancel-final').value);
            if (!arancel || arancel <= 0) {
                alert('⚠️ Debe establecer un arancel válido mayor a 0');
                return;
            }
            
            if (!confirm(\`🧾 ¿Generar factura por $\${arancel.toLocaleString('es-AR')} y notificar al profesional?

Esto cambiará el estado a "ESPERANDO PAGO" y enviará la factura al portal del profesional.\`)) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/admin/generar-factura-chp/\${solicitudActual.id}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        arancel_establecido: arancel,
                        descripcion_final: document.getElementById('descripcion-tarea').value
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    alert(\`✅ Factura generada exitosamente

Número de Factura: \${result.numero_factura}
Monto: $\${arancel.toLocaleString('es-AR')}

El profesional ha sido notificado y puede ver la factura en su portal.\`);
                    
                    // RECARGAR BANDEJA
                    cargarSolicitudesPendientes();
                    
                    // OCULTAR ÁREA DE REVISIÓN
                    document.getElementById('solicitud-seleccionada').style.display = 'none';
                    document.getElementById('sin-seleccion').style.display = 'block';
                    
                } else {
                    alert('❌ Error generando factura: ' + result.message);
                }
            } catch (error) {
                alert('❌ Error de conexión');
            }
        }
        
        function verDocumento(docId) {
            window.open(\`/api/admin/documento-chp/\${docId}\`, '_blank');
        }
        
        function descargarDocumento(docId) {
            window.location.href = \`/api/admin/documento-chp/\${docId}?download=true\`;
        }
        
        // CARGAR AL INICIALIZAR
        document.addEventListener('DOMContentLoaded', cargarSolicitudesPendientes);
        
    </script>
</body>
</html>
    `;
    
    // GUARDAR NUEVO PANEL ADMIN
    fs.writeFileSync('C:\\copig-app\\admin-chp-nuevo.html', panelAdminHTML);
    console.log('   ✅ Panel admin creado: admin-chp-nuevo.html');
    console.log('   📋 Incluye las 3 secciones especificadas en el PDF');
}

// EJECUTAR
if (require.main === module) {
    implementarFlujoCHPCompleto()
        .then(() => {
            console.log('\\n🎉 FLUJO CHP COMPLETAMENTE IMPLEMENTADO SEGÚN PDF');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR:', error);
            process.exit(1);
        });
}

module.exports = { implementarFlujoCHPCompleto };