const fs = require('fs');
const path = require('path');

async function createBackupAndFixBcrypt() {
    console.log('🔧 CORRECCIÓN DE REFERENCIAS BCRYPT - SIGUIENDO MÁXIMAS');
    console.log('====================================================');
    
    try {
        // 1. CREAR BACKUP ANTES DE CUALQUIER CAMBIO
        console.log('\n1. Creando backup del server.js...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `./server.js.backup.${timestamp}`;
        
        const originalContent = fs.readFileSync('./server.js', 'utf8');
        fs.writeFileSync(backupPath, originalContent);
        console.log(`✅ Backup creado: ${backupPath}`);
        
        // 2. ANALIZAR PROBLEMA
        console.log('\n2. Analizando problema de referencias bcrypt...');
        
        // Encontrar todas las referencias incorrectas
        const incorrectImports = [
            /const bcrypt_\d+ = require\('bcryptjs'\);/g,
            /const bcrypt_\w+ = require\('bcryptjs'\);/g
        ];
        
        const incorrectUsages = [
            /bcrypt\.compare/g,
            /bcrypt\.hash/g,
            /bcrypt\.genSalt/g
        ];
        
        let fixed = 0;
        let content = originalContent;
        
        // 3. VERIFICAR QUE HAY UN IMPORT CORRECTO AL INICIO
        console.log('\n3. Verificando import de bcrypt al inicio...');
        
        const hasCorrectImport = content.includes("const bcrypt = require('bcryptjs');");
        
        if (!hasCorrectImport) {
            console.log('⚠️  No hay import correcto de bcrypt, agregándolo...');
            // Agregar import correcto después de las otras importaciones
            const importPosition = content.indexOf("const session = require('express-session');");
            if (importPosition > -1) {
                const beforeImport = content.substring(0, importPosition);
                const afterImport = content.substring(importPosition);
                content = beforeImport + "const bcrypt = require('bcryptjs');\n" + afterImport;
                console.log('✅ Import correcto agregado');
                fixed++;
            }
        } else {
            console.log('✅ Import correcto ya existe');
        }
        
        // 4. REMOVER IMPORTS INCORRECTOS
        console.log('\n4. Removiendo imports incorrectos...');
        
        const incorrectImportLines = content.match(/const bcrypt_\w+ = require\('bcryptjs'\);/g) || [];
        console.log(`Encontrados ${incorrectImportLines.length} imports incorrectos`);
        
        incorrectImportLines.forEach((line, index) => {
            console.log(`   Removiendo: ${line}`);
            content = content.replace(line, `// [CORREGIDO] Import duplicado removido`);
            fixed++;
        });
        
        // 5. VERIFICAR QUE NO QUEDAN REFERENCIAS PROBLEMÁTICAS
        console.log('\n5. Verificando referencias bcrypt...');
        
        const remainingBcryptRefs = content.match(/bcrypt\./g) || [];
        console.log(`Referencias bcrypt encontradas: ${remainingBcryptRefs.length}`);
        
        // Buscar líneas específicas problemáticas
        const lines = content.split('\\n');
        let problemLines = [];
        
        lines.forEach((line, index) => {
            if (line.includes('bcrypt.') && !line.includes('const bcrypt = require')) {
                const lineNum = index + 1;
                console.log(`   Línea ${lineNum}: ${line.trim()}`);
                
                // Si la línea contiene una referencia bcrypt sin el import correcto en scope
                if (!line.includes('// [CORREGIDO]')) {
                    problemLines.push({ lineNum, line: line.trim() });
                }
            }
        });
        
        if (problemLines.length > 0) {
            console.log(`\\n⚠️  ${problemLines.length} líneas requieren el import correcto de bcrypt`);
        }
        
        // 6. ESCRIBIR ARCHIVO CORREGIDO
        console.log('\n6. Aplicando correcciones...');
        
        if (fixed > 0) {
            fs.writeFileSync('./server.js', content);
            console.log(`✅ ${fixed} correcciones aplicadas al server.js`);
        } else {
            console.log('ℹ️  No se requirieron correcciones');
        }
        
        // 7. VALIDAR SINTAXIS
        console.log('\n7. Validando sintaxis del archivo corregido...');
        
        try {
            require('./server.js');
            console.log('✅ Sintaxis válida - Sin errores de require');
        } catch (error) {
            console.error('❌ Error de sintaxis detectado:', error.message);
            
            // Restaurar backup si hay error
            console.log('🔄 Restaurando backup...');
            fs.writeFileSync('./server.js', originalContent);
            console.log('✅ Backup restaurado');
            
            return false;
        }
        
        console.log('\n✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
        console.log(`📁 Backup disponible en: ${backupPath}`);
        console.log('🔄 RECOMENDACIÓN: Reiniciar servidor para aplicar cambios');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO:', error.message);
        console.error('Stack:', error.stack);
        return false;
    }
}

// Ejecutar corrección
createBackupAndFixBcrypt()
    .then(success => {
        if (success) {
            console.log('\\n🎉 Proceso completado exitosamente');
            process.exit(0);
        } else {
            console.log('\\n💥 Proceso falló');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 Error ejecutando corrección:', error);
        process.exit(1);
    });