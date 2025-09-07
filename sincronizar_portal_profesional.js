const fs = require('fs');

// Leer el archivo portal-profesional.html
console.log('📖 Leyendo portal-profesional.html...');
let portalContent = fs.readFileSync('portal-profesional.html', 'utf8');

// Categorías actuales (desactualizadas)
const categoriasViejas = `                    <!-- Selector de categoría -->
                    <h4 style="margin-bottom: 1rem;">Seleccione la categoría del documento:</h4>
                    <div class="category-selector">
                        <div class="category-option" data-category="comprobante_pago">
                            <div>💳</div>
                            <strong>Comprobante de Pago</strong>
                            <p>Recibos, facturas, transferencias</p>
                        </div>
                        <div class="category-option" data-category="planos">
                            <div>📐</div>
                            <strong>Planos</strong>
                            <p>Planos técnicos, esquemas</p>
                        </div>
                        <div class="category-option" data-category="documentacion_tecnica">
                            <div>📋</div>
                            <strong>Documentación Técnica</strong>
                            <p>Informes, especificaciones</p>
                        </div>
                        <div class="category-option" data-category="otros">
                            <div>📄</div>
                            <strong>Otros</strong>
                            <p>Documentos varios</p>
                        </div>`;

// Nuevas categorías sincronizadas con admin CHP
const categoriasNuevas = `                    <!-- Selector de categoría - SINCRONIZADO CON ADMIN CHP -->
                    <h4 style="margin-bottom: 1rem;">Seleccione la categoría del documento CHP:</h4>
                    <div class="category-selector">
                        <div class="category-option" data-category="caja_matricula">
                            <div>💳</div>
                            <strong>Comprobante Caja de Previsión y Matrícula</strong>
                            <p>Estar al día con Caja de Previsión Técnica y cuotas de matrícula</p>
                        </div>
                        <div class="category-option" data-category="rotulo">
                            <div>📐</div>
                            <strong>Rótulo Profesional</strong>
                            <p>Rótulo firmado y sellado del profesional responsable</p>
                        </div>
                        <div class="category-option" data-category="memoria_tecnica">
                            <div>📄</div>
                            <strong>Memoria Técnica</strong>
                            <p>Documentación técnica, cálculos, especificaciones</p>
                        </div>
                        <div class="category-option" data-category="planos">
                            <div>🗺️</div>
                            <strong>Planos de Ubicación</strong>
                            <p>Planos de ubicación, planta, elevación y técnicos</p>
                        </div>
                        <div class="category-option" data-category="documentacion">
                            <div>📋</div>
                            <strong>Documentación del Proyecto</strong>
                            <p>Permisos, autorizaciones, estudios de impacto</p>
                        </div>`;

// Reemplazar las categorías
if (portalContent.includes('Seleccione la categoría del documento:')) {
    portalContent = portalContent.replace(categoriasViejas, categoriasNuevas);
    console.log('✅ Categorías actualizadas');
} else {
    console.log('⚠️ No se encontró la sección de categorías exacta, buscando alternativa...');
    
    // Buscar patrón alternativo
    const startMarker = '<h4 style="margin-bottom: 1rem;">Seleccione la categoría del documento:</h4>';
    const endMarker = '</div>\n                    </div>';
    
    const startIndex = portalContent.indexOf(startMarker);
    if (startIndex !== -1) {
        const endIndex = portalContent.indexOf(endMarker, startIndex) + endMarker.length;
        
        const beforeSection = portalContent.slice(0, startIndex);
        const afterSection = portalContent.slice(endIndex);
        
        const newSection = `<h4 style="margin-bottom: 1rem;">Seleccione la categoría del documento CHP:</h4>
                    <div class="category-selector">
                        <div class="category-option" data-category="caja_matricula">
                            <div>💳</div>
                            <strong>Comprobante Caja de Previsión y Matrícula</strong>
                            <p>Estar al día con Caja de Previsión Técnica y cuotas de matrícula</p>
                        </div>
                        <div class="category-option" data-category="rotulo">
                            <div>📐</div>
                            <strong>Rótulo Profesional</strong>
                            <p>Rótulo firmado y sellado del profesional responsable</p>
                        </div>
                        <div class="category-option" data-category="memoria_tecnica">
                            <div>📄</div>
                            <strong>Memoria Técnica</strong>
                            <p>Documentación técnica, cálculos, especificaciones</p>
                        </div>
                        <div class="category-option" data-category="planos">
                            <div>🗺️</div>
                            <strong>Planos de Ubicación</strong>
                            <p>Planos de ubicación, planta, elevación y técnicos</p>
                        </div>
                        <div class="category-option" data-category="documentacion">
                            <div>📋</div>
                            <strong>Documentación del Proyecto</strong>
                            <p>Permisos, autorizaciones, estudios de impacto</p>
                        </div>
                    </div>`;
        
        portalContent = beforeSection + newSection + afterSection;
        console.log('✅ Categorías actualizadas con método alternativo');
    } else {
        console.log('❌ No se pudo encontrar la sección de categorías');
        process.exit(1);
    }
}

// También actualizar cualquier JavaScript que maneje las categorías
if (portalContent.includes('comprobante_pago')) {
    portalContent = portalContent.replace(/comprobante_pago/g, 'caja_matricula');
    console.log('✅ Referencias JavaScript actualizadas: comprobante_pago → caja_matricula');
}

if (portalContent.includes('documentacion_tecnica')) {
    portalContent = portalContent.replace(/documentacion_tecnica/g, 'memoria_tecnica');
    console.log('✅ Referencias JavaScript actualizadas: documentacion_tecnica → memoria_tecnica');
}

if (portalContent.includes('otros')) {
    portalContent = portalContent.replace(/"otros"/g, '"documentacion"');
    console.log('✅ Referencias JavaScript actualizadas: otros → documentacion');
}

// Guardar el archivo actualizado
fs.writeFileSync('portal-profesional.html', portalContent, 'utf8');

console.log('✅ Portal profesional sincronizado exitosamente');
console.log('📋 Categorías actualizadas para coincidir con admin CHP:');
console.log('   💳 Comprobante Caja de Previsión y Matrícula');
console.log('   📐 Rótulo Profesional');
console.log('   📄 Memoria Técnica');
console.log('   🗺️ Planos de Ubicación');
console.log('   📋 Documentación del Proyecto');

console.log('\n🔄 FLUJO SINCRONIZADO:');
console.log('   Profesional sube documentos → Mismas categorías → Admin revisa');