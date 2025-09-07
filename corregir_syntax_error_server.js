/**
 * CORREGIR ERROR DE SINTAXIS EN SERVER.JS
 * Problema: caracteres \n\n literales en lugar de saltos de línea reales
 */

const fs = require('fs');

async function corregirSyntaxError() {
    console.log('🔧 CORRIGIENDO ERROR DE SINTAXIS EN SERVER.JS...');
    
    try {
        // LEER ARCHIVO ACTUAL
        let content = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
        
        // CORREGIR CARACTERES \n\n LITERALES
        content = content.replace(/\\n\\n/g, '\n\n');
        content = content.replace(/\\n/g, '\n');
        
        // LIMPIAR CUALQUIER PROBLEMA DE CODIFICACIÓN
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // ASEGURAR QUE NO HAY CARACTERES RAROS ANTES DE const PORT
        const indexPORT = content.indexOf('const PORT = process.env.PORT || 3030;');
        if (indexPORT !== -1) {
            // BUSCAR HACIA ATRÁS PARA LIMPIAR
            let beforePORT = content.substring(0, indexPORT);
            let afterPORT = content.substring(indexPORT);
            
            // LIMPIAR POSIBLES CARACTERES EXTRAÑOS ANTES DE const PORT
            beforePORT = beforePORT.replace(/[^\w\s\n\r\t\{\}\[\]\(\)\;\:\.\,\=\+\-\*\/\\\'\"\`\!\@\#\$\%\^\&]/g, '');
            
            content = beforePORT + afterPORT;
        }
        
        // GUARDAR ARCHIVO CORREGIDO
        fs.writeFileSync('C:\\copig-app\\server.js', content);
        
        console.log('✅ ARCHIVO CORREGIDO EXITOSAMENTE');
        console.log('🚀 Ahora puedes ejecutar: node server.js');
        
    } catch (error) {
        console.error('❌ Error corrigiendo archivo:', error);
        throw error;
    }
}

// EJECUTAR
if (require.main === module) {
    corregirSyntaxError()
        .then(() => {
            console.log('\\n🎉 SERVER.JS CORREGIDO - LISTO PARA USAR');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { corregirSyntaxError };