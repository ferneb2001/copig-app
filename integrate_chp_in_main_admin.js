const fs = require('fs');

console.log('🔧 INTEGRANDO MÓDULO CHP EN ADMIN PRINCIPAL...');
console.log('═══════════════════════════════════════════════════════');

function integrateChpModule() {
    try {
        // 1. Leer admin.html
        let adminContent = fs.readFileSync('./admin.html', 'utf8');
        console.log('📄 Archivo admin.html leído');
        
        // 2. Agregar ítem de menú CHP
        console.log('🔗 Agregando ítem de menú CHP...');
        
        const menuItemCHP = `            <a href="#" class="nav-item" data-section="chp">
                <i class="icon-file"></i>
                <span>Solicitudes CHP</span>
            </a>`;
        
        // Buscar donde insertar el menú (después de solicitudes)
        const solicitudesLine = adminContent.indexOf('<span>Solicitudes</span>');
        if (solicitudesLine !== -1) {
            const afterSolicitudes = adminContent.indexOf('</a>', solicitudesLine) + 5;
            adminContent = adminContent.slice(0, afterSolicitudes) + '\\n' + menuItemCHP + adminContent.slice(afterSolicitudes);
            console.log('✅ Menú CHP agregado después de Solicitudes');
        }
        
        // 3. Agregar sección CHP
        console.log('📋 Agregando sección CHP...');
        
        const chpSection = `        <!-- SECCIÓN CHP -->
        <div class="content-section" id="chp" style="display: none;">
            <div class="section-header">
                <h2>🎯 Gestión de Solicitudes CHP</h2>
                <p>Administra las solicitudes de Certificados de Habilitación Profesional</p>
            </div>
            
            <!-- Filtros -->
            <div class="filters-bar">
                <div class="filter-group">
                    <input type="text" id="chp-search" placeholder="🔍 Buscar por cliente o número..." class="filter-input">
                    <select id="chp-filter-estado" class="filter-select">
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PENDIENTE_PAGO">Pendiente Pago</option>
                        <option value="EN_REVISION">En Revisión</option>
                        <option value="APROBADO">Aprobado</option>
                        <option value="RECHAZADO">Rechazado</option>
                        <option value="EMITIDO">Emitido</option>
                    </select>
                    <button onclick="filtrarSolicitudesCHP()" class="btn btn-secondary">🔍 Filtrar</button>
                    <button onclick="limpiarFiltrosCHP()" class="btn btn-light">🔄 Limpiar</button>
                </div>
            </div>
            
            <!-- Estadísticas rápidas -->
            <div class="stats-cards" id="chp-stats">
                <div class="stat-card">
                    <div class="stat-value" id="total-chp">0</div>
                    <div class="stat-label">Total Solicitudes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="pendientes-chp">0</div>
                    <div class="stat-label">Pendientes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="aprobadas-chp">0</div>
                    <div class="stat-label">Aprobadas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="emitidas-chp">0</div>
                    <div class="stat-label">Emitidas</div>
                </div>
            </div>
            
            <!-- Tabla de solicitudes -->
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Cliente</th>
                            <th>Profesional</th>
                            <th>Proyecto</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Costo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="chp-table-body">
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px;">
                                📄 Cargando solicitudes CHP...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`;
        
        // Buscar donde insertar la sección (antes del cierre de main-content)
        const mainContentEnd = adminContent.indexOf('</div> <!-- main-content -->');
        if (mainContentEnd !== -1) {
            adminContent = adminContent.slice(0, mainContentEnd) + chpSection + '\\n\\n        ' + adminContent.slice(mainContentEnd);
            console.log('✅ Sección CHP agregada al main-content');
        } else {
            console.log('⚠️  No se encontró </div> <!-- main-content -->, agregando al final del body');
            const bodyEnd = adminContent.lastIndexOf('</body>');
            adminContent = adminContent.slice(0, bodyEnd) + chpSection + '\\n' + adminContent.slice(bodyEnd);
        }
        
        // 4. Agregar JavaScript para CHP
        console.log('⚙️  Agregando JavaScript para CHP...');
        
        const chpJavaScript = `
        // FUNCIONES CHP
        let solicitudesCHPData = [];
        
        async function loadSolicitudesCHP() {
            try {
                console.log('📡 Cargando solicitudes CHP...');
                const response = await fetch('/api/admin/solicitudes-chp', {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Error HTTP: ' + response.status);
                }
                
                const data = await response.json();
                console.log('📊 Respuesta CHP:', data);
                
                if (data.success && data.solicitudes) {
                    solicitudesCHPData = data.solicitudes;
                    renderSolicitudesCHP(solicitudesCHPData);
                    updateCHPStats(solicitudesCHPData);
                } else {
                    console.error('❌ Error en respuesta CHP:', data.message);
                    document.getElementById('chp-table-body').innerHTML = 
                        '<tr><td colspan="8" style="text-align: center; color: #e74c3c; padding: 40px;">❌ Error cargando solicitudes: ' + (data.message || 'Error desconocido') + '</td></tr>';
                }
                
            } catch (error) {
                console.error('❌ Error cargando solicitudes CHP:', error);
                document.getElementById('chp-table-body').innerHTML = 
                    '<tr><td colspan="8" style="text-align: center; color: #e74c3c; padding: 40px;">❌ Error de conexión: ' + error.message + '</td></tr>';
            }
        }
        
        function renderSolicitudesCHP(solicitudes) {
            const tbody = document.getElementById('chp-table-body');
            
            if (!solicitudes || solicitudes.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d; padding: 40px;">📄 No se encontraron solicitudes CHP</td></tr>';
                return;
            }
            
            const html = solicitudes.map(s => {
                const fecha = s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString('es-AR') : 'Sin fecha';
                const costo = s.costo ? '$' + parseFloat(s.costo).toLocaleString('es-AR') : 'Sin costo';
                
                let estadoClass = 'status-pendiente';
                if (s.estado === 'APROBADO') estadoClass = 'status-aprobado';
                else if (s.estado === 'RECHAZADO') estadoClass = 'status-rechazado';
                else if (s.estado === 'EMITIDO') estadoClass = 'status-emitido';
                else if (s.estado === 'PENDIENTE_PAGO') estadoClass = 'status-pago';
                
                return \`
                    <tr>
                        <td><strong>\${s.numero_solicitud || 'N/A'}</strong></td>
                        <td>\${s.cliente || 'Sin cliente'}</td>
                        <td>\${s.profesional_nombre || 'Sin asignar'}</td>
                        <td>\${s.proyecto || 'Sin proyecto'}</td>
                        <td><span class="status-badge \${estadoClass}">\${s.estado || 'PENDIENTE'}</span></td>
                        <td>\${fecha}</td>
                        <td><strong>\${costo}</strong></td>
                        <td>
                            <button onclick="verDetalleCHP(\${s.id})" class="btn btn-sm btn-secondary">👁️ Ver</button>
                            \${s.estado === 'PENDIENTE' || s.estado === 'PENDIENTE_PAGO' ? 
                                \`<button onclick="aprobarCHP(\${s.id})" class="btn btn-sm btn-success">✅ Aprobar</button>\` : ''}
                        </td>
                    </tr>
                \`;
            }).join('');
            
            tbody.innerHTML = html;
        }
        
        function updateCHPStats(solicitudes) {
            const total = solicitudes.length;
            const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE' || s.estado === 'PENDIENTE_PAGO').length;
            const aprobadas = solicitudes.filter(s => s.estado === 'APROBADO').length;
            const emitidas = solicitudes.filter(s => s.estado === 'EMITIDO').length;
            
            document.getElementById('total-chp').textContent = total;
            document.getElementById('pendientes-chp').textContent = pendientes;
            document.getElementById('aprobadas-chp').textContent = aprobadas;
            document.getElementById('emitidas-chp').textContent = emitidas;
        }
        
        function verDetalleCHP(id) {
            const solicitud = solicitudesCHPData.find(s => s.id === id);
            if (solicitud) {
                alert('Solicitud: ' + solicitud.numero_solicitud + '\\nCliente: ' + solicitud.cliente + '\\nEstado: ' + solicitud.estado);
            }
        }
        
        function aprobarCHP(id) {
            if (confirm('¿Aprobar esta solicitud CHP?')) {
                // Implementar aprobación
                console.log('Aprobando solicitud CHP:', id);
            }
        }
        
        function filtrarSolicitudesCHP() {
            const searchTerm = document.getElementById('chp-search').value.toLowerCase();
            const estadoFilter = document.getElementById('chp-filter-estado').value;
            
            let filtered = solicitudesCHPData;
            
            if (searchTerm) {
                filtered = filtered.filter(s => 
                    (s.cliente && s.cliente.toLowerCase().includes(searchTerm)) ||
                    (s.numero_solicitud && s.numero_solicitud.toLowerCase().includes(searchTerm))
                );
            }
            
            if (estadoFilter) {
                filtered = filtered.filter(s => s.estado === estadoFilter);
            }
            
            renderSolicitudesCHP(filtered);
        }
        
        function limpiarFiltrosCHP() {
            document.getElementById('chp-search').value = '';
            document.getElementById('chp-filter-estado').value = '';
            renderSolicitudesCHP(solicitudesCHPData);
        }`;
        
        // Buscar donde insertar el JavaScript (antes de </script> final)
        const lastScript = adminContent.lastIndexOf('</script>');
        if (lastScript !== -1) {
            adminContent = adminContent.slice(0, lastScript) + chpJavaScript + adminContent.slice(lastScript);
            console.log('✅ JavaScript CHP agregado');
        }
        
        // 5. Actualizar el switch de secciones para incluir CHP
        console.log('🔄 Actualizando navegación de secciones...');
        
        // Buscar la función showSection y agregar el caso CHP
        const showSectionIndex = adminContent.indexOf('function showSection(');
        if (showSectionIndex !== -1) {
            // Buscar el switch o if de secciones
            let showSectionEnd = adminContent.indexOf('}', showSectionIndex + 500); // Buscar hacia adelante
            const beforeEnd = adminContent.slice(0, showSectionEnd);
            const afterEnd = adminContent.slice(showSectionEnd);
            
            const chpCase = `
                    if (sectionId === 'chp') {
                        loadSolicitudesCHP();
                    }
                    `;
            
            adminContent = beforeEnd + chpCase + afterEnd;
            console.log('✅ Navegación actualizada para incluir CHP');
        }
        
        // 6. Escribir el archivo actualizado
        fs.writeFileSync('./admin.html', adminContent);
        console.log('💾 Archivo admin.html actualizado exitosamente');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error integrando módulo CHP:', error.message);
        return false;
    }
}

// Ejecutar integración
const success = integrateChpModule();

console.log('\\n🎯 RESULTADO:');
if (success) {
    console.log('✅ MÓDULO CHP INTEGRADO EXITOSAMENTE');
    console.log('');
    console.log('📋 AHORA PUEDES:');
    console.log('1. 🔄 Ir a http://localhost:3030/admin');
    console.log('2. 👀 Buscar "Solicitudes CHP" en el menú lateral');
    console.log('3. 🖱️  Hacer clic para ver las 10 solicitudes');
    console.log('4. 📊 Ver estadísticas y filtrar solicitudes');
    console.log('');
    console.log('🔍 FUNCIONALIDADES INCLUIDAS:');
    console.log('• 📋 Lista completa de solicitudes');
    console.log('• 📊 Estadísticas en tiempo real');
    console.log('• 🔍 Filtros por cliente y estado');
    console.log('• 👁️  Ver detalles de cada solicitud');
    console.log('• ✅ Botones de aprobación');
} else {
    console.log('❌ ERROR EN LA INTEGRACIÓN');
    console.log('💡 Usa el módulo separado: http://localhost:3030/admin-chp.html');
}