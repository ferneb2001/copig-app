const fs = require('fs');

console.log('🚀 LIMPIEZA DEFINITIVA DE DUPLICADOS - YO LO HAGO');

// Leer archivo
let content = fs.readFileSync('server.js', 'utf8');
let lines = content.split('\n');

// Tracking de lo que ya encontramos
let found = {
    multer: false,
    path: false, 
    storage: false,
    fileFilter: false,
    upload: false
};

let cleanLines = [];
let removed = 0;

console.log('🔍 Procesando línea por línea...');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    let keep = true;
    
    // Detectar y eliminar duplicados
    if (trimmed.startsWith('const multer = require')) {
        if (found.multer) {
            console.log(`❌ Línea ${i+1}: Eliminando multer duplicado`);
            keep = false;
            removed++;
        } else {
            found.multer = true;
            console.log(`✅ Línea ${i+1}: Manteniendo primera declaración multer`);
        }
    }
    else if (trimmed.startsWith('const path = require')) {
        if (found.path) {
            console.log(`❌ Línea ${i+1}: Eliminando path duplicado`);
            keep = false;
            removed++;
        } else {
            found.path = true;
            console.log(`✅ Línea ${i+1}: Manteniendo primera declaración path`);
        }
    }
    else if (trimmed.startsWith('const storage = multer.diskStorage')) {
        if (found.storage) {
            console.log(`❌ Línea ${i+1}: Eliminando storage duplicado`);
            keep = false;
            removed++;
            // También eliminar las líneas siguientes del objeto storage
            let j = i + 1;
            while (j < lines.length && !lines[j].trim().startsWith('});')) {
                j++;
                removed++;
            }
            if (j < lines.length && lines[j].trim().startsWith('});')) {
                j++; // Eliminar también la línea de cierre
                removed++;
            }
            i = j - 1; // Continuar después del bloque eliminado
        } else {
            found.storage = true;
            console.log(`✅ Línea ${i+1}: Manteniendo primera declaración storage`);
        }
    }
    else if (trimmed.startsWith('const fileFilter =')) {
        if (found.fileFilter) {
            console.log(`❌ Línea ${i+1}: Eliminando fileFilter duplicado`);
            keep = false;
            removed++;
        } else {
            found.fileFilter = true;
            console.log(`✅ Línea ${i+1}: Manteniendo primera declaración fileFilter`);
        }
    }
    else if (trimmed.startsWith('const upload = multer')) {
        if (found.upload) {
            console.log(`❌ Línea ${i+1}: Eliminando upload duplicado`);
            keep = false;
            removed++;
        } else {
            found.upload = true;
            console.log(`✅ Línea ${i+1}: Manteniendo primera declaración upload`);
        }
    }
    
    if (keep) {
        cleanLines.push(line);
    }
}

// Escribir archivo limpio
const cleanContent = cleanLines.join('\n');

// Backup del archivo corrupto
fs.writeFileSync('server-corrupto-backup.js', content, 'utf8');

// Escribir archivo limpio
fs.writeFileSync('server.js', cleanContent, 'utf8');

console.log(`\n✅ LIMPIEZA COMPLETADA:`);
console.log(`   📋 Líneas eliminadas: ${removed}`);
console.log(`   💾 Backup: server-corrupto-backup.js`);
console.log(`   ✅ Server.js limpio y listo`);

console.log(`\n📊 DECLARACIONES ÚNICAS MANTENIDAS:`);
console.log(`   ${found.multer ? '✅' : '❌'} multer`);
console.log(`   ${found.path ? '✅' : '❌'} path`);
console.log(`   ${found.storage ? '✅' : '❌'} storage`);
console.log(`   ${found.fileFilter ? '✅' : '❌'} fileFilter`);
console.log(`   ${found.upload ? '✅' : '❌'} upload`);

console.log(`\n🚀 ARCHIVO LIMPIO - LISTO PARA REINICIAR SERVIDOR`);