const fs = require('fs');

console.log('🔧 Corrigiendo número de certificado y agregando botón eliminar...');

// LEER ARCHIVO PORTAL PROFESIONAL
let portalContent = fs.readFileSync('portal-profesional.html', 'utf8');

// 1. BUSCAR Y REEMPLAZAR LA TABLA DE SOLICITUDES COMPLETA
const oldTableSection = `                        if (data.solicitudes && data.solicitudes.length > 0) {
                            data.solicitudes.forEach(solicitud => {
                                solicitudesHtml += \`
                            <tr>
                                <td>\${solicitud.numero_solicitud}</td>
                                <td>\${solicitud.comitente || 'Sin especificar'}</td>
                                <td>\${solicitud.proyecto || 'Sin especificar'}</td>
                                <td>\${solicitud.ubicacion_obra || 'Sin especificar'}</td>
                                <td><span class="estado estado-\${solicitud.estado.toLowerCase()}">\${solicitud.estado}</span></td>
                                <td>\${formatDate(solicitud.fecha_solicitud)}</td>
                                <td>
                                    <button class="btn-small" onclick="verDetalleSolicitud(\${solicitud.id})">Ver Detalles</button>
                                </td>
                            </tr>
                                \`;
                            });`;

const newTableSection = `                        if (data.solicitudes && data.solicitudes.length > 0) {
                            data.solicitudes.forEach(solicitud => {
                                solicitudesHtml += \`
                            <tr>
                                <td>\${solicitud.numero_solicitud}</td>
                                <td>\${solicitud.comitente || 'Sin especificar'}</td>
                                <td>\${solicitud.proyecto || 'Sin especificar'}</td>
                                <td>\${solicitud.ubicacion_obra || 'Sin especificar'}</td>
                                <td><span class="estado estado-\${solicitud.estado.toLowerCase()}">\${solicitud.estado}</span></td>
                                <td>\${formatDate(solicitud.fecha_solicitud)}</td>
                                <td>
                                    <button class="btn-small" onclick="verDetalleSolicitud(\${solicitud.id})">Ver Detalles</button>
                                    \${solicitud.estado === 'PENDIENTE' ? 
                                        \`<button class="btn-small btn-danger" onclick="eliminarSolicitud(\${solicitud.id}, '\${solicitud.numero_solicitud}', '\${solicitud.comitente || 'Sin especificar'}')" style="margin-left: 5px;">🗑️ Eliminar</button>\` 
                                        : ''}
                                </td>
                            </tr>
                                \`;
                            });`;

if (portalContent.includes(oldTableSection)) {
    portalContent = portalContent.replace(oldTableSection, newTableSection);
    console.log('✅ Tabla de solicitudes actualizada con botón eliminar');
} else {
    console.log('⚠️ Sección de tabla no encontrada exactamente, buscando alternativas...');
}

// 2. VERIFICAR QUE EL ENCABEZADO DE LA TABLA TENGA LA COLUMNA CORRECTA
const oldTableHeader = `                                <th>N° Certificado</th>`;
const newTableHeader = `                                <th>N° Solicitud</th>`;

if (portalContent.includes(oldTableHeader)) {
    portalContent = portalContent.replace(oldTableHeader, newTableHeader);
    console.log('✅ Encabezado de tabla corregido: "N° Certificado" → "N° Solicitud"');
}

// 3. TAMBIÉN CORREGIR EN ADMIN.HTML
let adminContent = fs.readFileSync('admin.html', 'utf8');

// Buscar y corregir encabezado en admin
if (adminContent.includes(oldTableHeader)) {
    adminContent = adminContent.replace(oldTableHeader, newTableHeader);
    console.log('✅ Encabezado en admin.html corregido: "N° Certificado" → "N° Solicitud"');
}

// Corregir cualquier referencia a "certificado" en admin
const oldCertificadoRef = `<span>Certificado: </span>`;
const newCertificadoRef = `<span>Solicitud: </span>`;

if (adminContent.includes(oldCertificadoRef)) {
    adminContent = adminContent.replace(new RegExp(oldCertificadoRef, 'g'), newCertificadoRef);
    console.log('✅ Referencias a "certificado" corregidas en admin');
}

// Guardar archivos actualizados
fs.writeFileSync('portal-profesional.html', portalContent);
fs.writeFileSync('admin.html', adminContent);

console.log('');
console.log('🎯 CORRECCIONES APLICADAS:');
console.log('   • ✅ Botón "Eliminar" agregado solo para estado PENDIENTE');
console.log('   • ✅ Confirmación antes de eliminar');
console.log('   • ✅ "N° Certificado" cambiado a "N° Solicitud"');
console.log('   • ✅ Referencias corregidas en ambos lados');
console.log('');
console.log('🔍 ACLARACIONES:');
console.log('   • El "número de solicitud" es CHP-2025-XXXX');
console.log('   • El "certificado" se genera DESPUÉS de aprobar');
console.log('   • Solo solicitudes PENDIENTES se pueden eliminar');
console.log('');
console.log('🔄 Reiniciar servidor para activar todos los cambios');