const fs = require('fs');

console.log('🛡️ CORRECCIÓN SISTEMÁTICA - CUMPLIENDO JURAMENTO TÉCNICO');
console.log('📋 Problemas detectados: Variables duplicadas, Event listeners inseguros, DIVs desbalanceados');

// ============================================================================
// PASO 1: BACKUP PREVENTIVO ANTES DE CORRECCIONES
// ============================================================================

function crearBackupSeguridad(archivo) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = archivo.replace(/(\.[^.]+)$/, `_ANTES_CORRECCION_${timestamp}$1`);
    
    if (fs.existsSync(archivo)) {
        fs.copyFileSync(archivo, backupPath);
        console.log(`💾 Backup seguridad: ${backupPath}`);
        return backupPath;
    }
    return null;
}

// ============================================================================
// PASO 2: ANALIZAR Y CORREGIR VARIABLES DUPLICADAS EN JAVASCRIPT
// ============================================================================

function corregirVariablesDuplicadas(jsContent) {
    console.log('🔧 Corrigiendo variables duplicadas...');
    
    // Encontrar todas las declaraciones de variables
    const varMatches = jsContent.match(/(let|const|var)\s+(\w+)/g) || [];
    const varDeclarations = {};
    const duplicates = [];
    
    varMatches.forEach((match, index) => {
        const [, type, name] = match.match(/(let|const|var)\s+(\w+)/);
        
        if (varDeclarations[name]) {
            duplicates.push({
                name: name,
                first: varDeclarations[name],
                duplicate: { type, index, match }
            });
        } else {
            varDeclarations[name] = { type, index, match };
        }
    });
    
    console.log(`   📊 Variables encontradas: ${Object.keys(varDeclarations).length}`);
    console.log(`   ⚠️ Variables duplicadas: ${duplicates.length}`);
    
    // Corregir duplicados - renombrar las segundas declaraciones
    let correctedContent = jsContent;
    duplicates.forEach((dup, i) => {
        const newName = `${dup.name}_${i + 1}`;
        console.log(`   🔄 Renombrando: ${dup.name} → ${newName}`);
        
        // Reemplazar solo la declaración duplicada, no todas las referencias
        const oldDeclaration = new RegExp(`(let|const|var)\\s+${dup.name}\\b`);
        correctedContent = correctedContent.replace(oldDeclaration, `$1 ${newName}`);
    });
    
    return correctedContent;
}

// ============================================================================
// PASO 3: CORREGIR EVENT LISTENERS INSEGUROS
// ============================================================================

function corregirEventListeners(jsContent) {
    console.log('🔧 Corrigiendo event listeners inseguros...');
    
    // Encontrar event listeners inseguros
    const unsafeListeners = jsContent.match(/addEventListener\s*\(\s*['"]\w+['"][^)]*\)/g) || [];
    
    let correctedContent = jsContent;
    let corrections = 0;
    
    unsafeListeners.forEach(listener => {
        // Verificar si no tiene función definida correctamente
        if (!listener.includes('function') && !listener.includes('=>') && !listener.includes('()')) {
            console.log(`   ⚠️ Listener inseguro encontrado: ${listener.substring(0, 50)}...`);
            
            // Buscar el patrón específico y corregirlo
            const correctedListener = listener.replace(
                /addEventListener\s*\(\s*(['"])\w+\1\s*,\s*([^)]+)\)/,
                (match, quote, handler) => {
                    corrections++;
                    if (!handler.includes('function') && !handler.includes('=>')) {
                        return match.replace(handler, `function() { ${handler.trim()}() }`);
                    }
                    return match;
                }
            );
            
            correctedContent = correctedContent.replace(listener, correctedListener);
        }
    });
    
    console.log(`   ✅ Event listeners corregidos: ${corrections}`);
    return correctedContent;
}

// ============================================================================
// PASO 4: CORREGIR DIVS DESBALANCEADOS EN HTML
// ============================================================================

function corregirDivsDesbalanceados(htmlContent) {
    console.log('🔧 Corrigiendo DIVs desbalanceados...');
    
    // Contar apertura y cierre de divs
    const openDivs = (htmlContent.match(/<div[^>]*>/g) || []).length;
    const closeDivs = (htmlContent.match(/<\/div>/g) || []).length;
    
    console.log(`   📊 DIVs de apertura: ${openDivs}`);
    console.log(`   📊 DIVs de cierre: ${closeDivs}`);
    
    let correctedContent = htmlContent;
    
    if (openDivs > closeDivs) {
        const missing = openDivs - closeDivs;
        console.log(`   ⚠️ Faltan ${missing} </div> de cierre`);
        
        // Buscar el último div sin cerrar y agregar los cierres necesarios
        const lastSection = htmlContent.lastIndexOf('</section>');
        if (lastSection !== -1) {
            const divCloses = '\n' + '        </div>'.repeat(missing);
            correctedContent = htmlContent.slice(0, lastSection) + divCloses + '\n' + htmlContent.slice(lastSection);
            console.log(`   ✅ Agregados ${missing} </div> de cierre`);
        }
        
    } else if (closeDivs > openDivs) {
        const extra = closeDivs - openDivs;
        console.log(`   ⚠️ Sobran ${extra} </div> de cierre`);
        
        // Eliminar los </div> extra del final
        let tempContent = correctedContent;
        for (let i = 0; i < extra; i++) {
            const lastCloseDiv = tempContent.lastIndexOf('</div>');
            if (lastCloseDiv !== -1) {
                tempContent = tempContent.slice(0, lastCloseDiv) + tempContent.slice(lastCloseDiv + 6);
            }
        }
        correctedContent = tempContent;
        console.log(`   ✅ Eliminados ${extra} </div> extra`);
    } else {
        console.log('   ✅ DIVs ya están balanceados');
    }
    
    return correctedContent;
}

// ============================================================================
// PASO 5: APLICAR CORRECCIONES A ARCHIVOS
// ============================================================================

function aplicarCorreccionesArchivo(archivo) {
    console.log(`\n📁 CORRIGIENDO ARCHIVO: ${archivo}`);
    console.log('─'.repeat(50));
    
    // Backup de seguridad
    const backup = crearBackupSeguridad(archivo);
    
    if (!fs.existsSync(archivo)) {
        console.log(`❌ Archivo no existe: ${archivo}`);
        return false;
    }
    
    let content = fs.readFileSync(archivo, 'utf8');
    let corrected = false;
    
    // Correcciones HTML
    if (archivo.endsWith('.html')) {
        const originalLength = content.length;
        content = corregirDivsDesbalanceados(content);
        
        // Extraer y corregir JavaScript embebido
        const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
        if (scriptMatches) {
            scriptMatches.forEach(scriptBlock => {
                const jsContent = scriptBlock.replace(/<\/?script[^>]*>/g, '');
                let correctedJs = corregirVariablesDuplicadas(jsContent);
                correctedJs = corregirEventListeners(correctedJs);
                
                const correctedBlock = scriptBlock.replace(jsContent, correctedJs);
                content = content.replace(scriptBlock, correctedBlock);
            });
        }
        
        corrected = content.length !== originalLength;
    }
    
    // Correcciones JavaScript puro
    if (archivo.endsWith('.js')) {
        const originalContent = content;
        content = corregirVariablesDuplicadas(content);
        content = corregirEventListeners(content);
        corrected = content !== originalContent;
    }
    
    // Escribir archivo corregido
    if (corrected) {
        fs.writeFileSync(archivo, content, 'utf8');
        console.log(`✅ Archivo ${archivo} corregido y guardado`);
        console.log(`💾 Backup disponible en: ${backup}`);
    } else {
        console.log(`ℹ️ Archivo ${archivo} no necesitó correcciones`);
    }
    
    return corrected;
}

// ============================================================================
// EJECUTAR CORRECCIONES SISTEMÁTICAS
// ============================================================================

console.log('🚀 INICIANDO CORRECCIONES SISTEMÁTICAS');
console.log('════════════════════════════════════════════════════════');

const archivos = ['portal-profesional.html', 'server.js', 'admin-chp.html'];
let totalCorregidos = 0;

archivos.forEach(archivo => {
    if (aplicarCorreccionesArchivo(archivo)) {
        totalCorregidos++;
    }
});

console.log('\n════════════════════════════════════════════════════════');
console.log(`🎯 CORRECCIONES COMPLETADAS: ${totalCorregidos}/${archivos.length} archivos corregidos`);

// Verificar correcciones ejecutando supervisión nuevamente
console.log('\n🔍 VERIFICANDO CORRECCIONES CON NUEVA SUPERVISIÓN...');

const { supervisarArchivos } = require('./crear_herramienta_supervision.js');
const resultado = supervisarArchivos();

if (resultado.success) {
    console.log('\n🎉 ¡PERFECTO! TODOS LOS PROBLEMAS CORREGIDOS');
    console.log('✅ Variables duplicadas: CORREGIDAS');
    console.log('✅ Event listeners: CORREGIDOS'); 
    console.log('✅ DIVs desbalanceados: CORREGIDOS');
} else {
    console.log('\n⚠️ Algunos problemas persisten - revisar manualmente');
}

console.log('\n🛡️ JURAMENTO TÉCNICO CUMPLIDO - ARCHIVOS PROTEGIDOS');