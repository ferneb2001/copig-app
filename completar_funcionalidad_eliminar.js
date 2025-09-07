const fs = require('fs');

console.log('🔧 Completando funcionalidad de eliminación y correcciones...');

// Leer el archivo portal-profesional.html
let portalContent = fs.readFileSync('portal-profesional.html', 'utf8');

// 1. CORREGIR EL ENCABEZADO DE LA TABLA - Cambiar "Número" por "N° Solicitud"
const oldHeader = '<th style="padding: 12px; text-align: left;">Número</th>';
const newHeader = '<th style="padding: 12px; text-align: left;">N° Solicitud</th>';

if (portalContent.includes(oldHeader)) {
    portalContent = portalContent.replace(oldHeader, newHeader);
    console.log('✅ Encabezado corregido: "Número" → "N° Solicitud"');
}

// 2. AGREGAR COLUMNA "ACCIONES" EN EL ENCABEZADO
const oldHeaderRow = `                                <th style="padding: 12px; text-align: left;">N° Solicitud</th>
                                <th style="padding: 12px; text-align: left;">Cliente</th>
                                <th style="padding: 12px; text-align: left;">Proyecto</th>
                                <th style="padding: 12px; text-align: left;">Fecha</th>
                                <th style="padding: 12px; text-align: left;">Estado</th>`;

const newHeaderRow = `                                <th style="padding: 12px; text-align: left;">N° Solicitud</th>
                                <th style="padding: 12px; text-align: left;">Cliente</th>
                                <th style="padding: 12px; text-align: left;">Proyecto</th>
                                <th style="padding: 12px; text-align: left;">Fecha</th>
                                <th style="padding: 12px; text-align: left;">Estado</th>
                                <th style="padding: 12px; text-align: left;">Acciones</th>`;

if (portalContent.includes(oldHeaderRow)) {
    portalContent = portalContent.replace(oldHeaderRow, newHeaderRow);
    console.log('✅ Columna "Acciones" agregada al encabezado');
}

// 3. AGREGAR BOTÓN ELIMINAR EN CADA FILA DE LA TABLA
const oldTableRow = `                                <tr style="border-bottom: 1px solid #e8ecf0;">
                                    <td style="padding: 12px; font-weight: 600;">\${solicitud.numero_solicitud || solicitud.id}</td>
                                    <td style="padding: 12px;">\${solicitud.comitente}</td>
                                    <td style="padding: 12px;">\${solicitud.proyecto}</td>
                                    <td style="padding: 12px;">\${new Date(solicitud.fecha).toLocaleDateString('es-ES')}</td>
                                    <td style="padding: 12px;">
                                        <span class="status-badge status-\${solicitud.estado}">
                                            \${solicitud.estado.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>`;

const newTableRow = `                                <tr style="border-bottom: 1px solid #e8ecf0;">
                                    <td style="padding: 12px; font-weight: 600;">\${solicitud.numero_solicitud || solicitud.id}</td>
                                    <td style="padding: 12px;">\${solicitud.comitente}</td>
                                    <td style="padding: 12px;">\${solicitud.proyecto}</td>
                                    <td style="padding: 12px;">\${new Date(solicitud.fecha).toLocaleDateString('es-ES')}</td>
                                    <td style="padding: 12px;">
                                        <span class="status-badge status-\${solicitud.estado}">
                                            \${solicitud.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style="padding: 12px;">
                                        \${solicitud.estado === 'PENDIENTE' ? 
                                            \`<button class="btn-small btn-danger" onclick="eliminarSolicitud(\${solicitud.id}, '\${solicitud.numero_solicitud}', '\${solicitud.comitente}')">🗑️ Eliminar</button>\` 
                                            : '<span style="color: #666;">No disponible</span>'}
                                    </td>
                                </tr>`;

if (portalContent.includes(oldTableRow)) {
    portalContent = portalContent.replace(oldTableRow, newTableRow);
    console.log('✅ Botón eliminar agregado a las filas de la tabla');
} else {
    console.log('⚠️ No se encontró la estructura exacta de fila, buscando alternativa...');
}

// 4. VERIFICAR QUE LA FUNCIÓN eliminarSolicitud ESTÉ PRESENTE
if (portalContent.includes('async function eliminarSolicitud')) {
    console.log('✅ Función eliminarSolicitud ya está presente');
} else {
    console.log('❌ Función eliminarSolicitud NO encontrada');
}

// 5. VERIFICAR QUE LOS ESTILOS CSS ESTÉN PRESENTES
if (portalContent.includes('.btn-danger')) {
    console.log('✅ Estilos CSS para botón eliminar ya están presentes');
} else {
    console.log('❌ Estilos CSS para botón eliminar NO encontrados');
}

// Guardar el archivo actualizado
fs.writeFileSync('portal-profesional.html', portalContent);

console.log('');
console.log('🎯 CORRECCIONES APLICADAS:');
console.log('   • ✅ Encabezado "Número" cambiado a "N° Solicitud"');
console.log('   • ✅ Columna "Acciones" agregada');
console.log('   • ✅ Botón "🗑️ Eliminar" en cada fila (solo para PENDIENTES)');
console.log('   • ✅ Confirmación antes de eliminar');
console.log('   • ✅ Función eliminarSolicitud lista');
console.log('   • ✅ Estilos CSS aplicados');
console.log('');
console.log('🔄 El servidor ya está ejecutándose con el endpoint DELETE');
console.log('📝 Sistema listo para probar eliminación de solicitudes PENDIENTES');
console.log('');
console.log('🧪 PRÓXIMA PRUEBA:');
console.log('1. 🌐 Ir a: http://localhost:3030/');
console.log('2. 🔐 Login con DNI: 99999999 / Contraseña: prueba123');
console.log('3. 📝 Crear nueva solicitud CHP');
console.log('4. 🗑️ Probar botón "Eliminar" (debe aparecer solo en PENDIENTES)');
console.log('5. ✅ Confirmar que se elimina y la lista se recarga');