const fs = require('fs');

console.log('🚀 CREANDO HERRAMIENTA DE SUPERVISIÓN DE CÓDIGO - MODO POTENTE');

// ============================================================================
// HERRAMIENTA DE SUPERVISIÓN Y VALIDACIÓN DE CÓDIGO
// ============================================================================

class CodeSupervisor {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
    }
    
    // Verificar estructura HTML
    validateHTML(content) {
        console.log('🔍 Validando estructura HTML...');
        
        const checks = [
            { name: 'DOCTYPE', pattern: /<!DOCTYPE html>/i, required: true },
            { name: 'HTML tags', pattern: /<html[^>]*>.*<\/html>/s, required: true },
            { name: 'HEAD tags', pattern: /<head[^>]*>.*<\/head>/s, required: true },
            { name: 'BODY tags', pattern: /<body[^>]*>.*<\/body>/s, required: true },
            { name: 'Script tags balanced', test: (content) => {
                const opens = (content.match(/<script[^>]*>/g) || []).length;
                const closes = (content.match(/<\/script>/g) || []).length;
                return opens === closes;
            }},
            { name: 'Div tags balanced', test: (content) => {
                const opens = (content.match(/<div[^>]*>/g) || []).length;
                const closes = (content.match(/<\/div>/g) || []).length;
                return opens === closes;
            }}
        ];
        
        let htmlValid = true;
        checks.forEach(check => {
            let passed;
            if (check.pattern) {
                passed = check.pattern.test(content);
            } else if (check.test) {
                passed = check.test(content);
            }
            
            if (!passed) {
                if (check.required) {
                    this.errors.push(`❌ HTML: ${check.name} faltante o mal formado`);
                    htmlValid = false;
                } else {
                    this.warnings.push(`⚠️ HTML: ${check.name} posible problema`);
                }
            } else {
                console.log(`   ✅ ${check.name}`);
            }
        });
        
        return htmlValid;
    }
    
    // Verificar JavaScript
    validateJavaScript(content) {
        console.log('🔍 Validando JavaScript...');
        
        const jsChecks = [
            { 
                name: 'Funciones balanceadas', 
                test: (content) => {
                    const opens = (content.match(/function\s+\w+\s*\(/g) || []).length + 
                                  (content.match(/\w+\s*=\s*function/g) || []).length +
                                  (content.match(/\w+\s*=\s*\(/g) || []).length;
                    const braces = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length;
                    return braces === 0; // Llaves balanceadas
                }
            },
            {
                name: 'Variables duplicadas',
                test: (content) => {
                    const vars = content.match(/(?:let|const|var)\s+(\w+)/g) || [];
                    const varNames = vars.map(v => v.split(/\s+/)[1]);
                    return varNames.length === [...new Set(varNames)].length;
                }
            },
            {
                name: 'Event listeners seguros',
                test: (content) => {
                    const listeners = content.match(/addEventListener\([^)]+\)/g) || [];
                    return listeners.every(listener => listener.includes('function') || listener.includes('=>'));
                }
            }
        ];
        
        let jsValid = true;
        jsChecks.forEach(check => {
            if (!check.test(content)) {
                this.errors.push(`❌ JS: ${check.name} fallo`);
                jsValid = false;
            } else {
                console.log(`   ✅ ${check.name}`);
            }
        });
        
        return jsValid;
    }
    
    // Verificar integridad de archivos
    validateFileIntegrity(filePath) {
        console.log(`🔍 Validando integridad: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            this.errors.push(`❌ Archivo no existe: ${filePath}`);
            return false;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const size = content.length;
        
        // Verificar que no esté corrupto o vacío
        if (size < 100) {
            this.errors.push(`❌ Archivo muy pequeño (posible corrupción): ${filePath}`);
            return false;
        }
        
        // Verificar caracteres extraños
        const weirdChars = content.match(/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/g);
        if (weirdChars && weirdChars.length > 10) {
            this.warnings.push(`⚠️ Archivo con caracteres extraños: ${filePath}`);
        }
        
        console.log(`   ✅ Tamaño: ${size} caracteres`);
        console.log(`   ✅ Integridad verificada`);
        
        return true;
    }
    
    // Crear copia de seguridad automática
    createAutoBackup(filePath) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = filePath.replace(/(\.[^.]+)$/, `_backup_${timestamp}$1`);
        
        if (fs.existsSync(filePath)) {
            fs.copyFileSync(filePath, backupPath);
            console.log(`💾 Backup automático: ${backupPath}`);
            return backupPath;
        }
        return null;
    }
    
    // Reporte completo
    generateReport() {
        console.log('\n📊 REPORTE DE SUPERVISIÓN:');
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('🎉 TODO PERFECTO - SIN ERRORES NI ADVERTENCIAS');
            return true;
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORES CRÍTICOS:');
            this.errors.forEach(error => console.log(`   ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ ADVERTENCIAS:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }
        
        if (this.suggestions.length > 0) {
            console.log('\n💡 SUGERENCIAS:');
            this.suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
        }
        
        return this.errors.length === 0;
    }
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE SUPERVISIÓN
// ============================================================================

function supervisarArchivos() {
    const supervisor = new CodeSupervisor();
    const archivos = ['portal-profesional.html', 'server.js', 'admin-chp.html'];
    
    console.log('🚀 INICIANDO SUPERVISIÓN COMPLETA DE ARCHIVOS');
    console.log('════════════════════════════════════════════════════════');
    
    archivos.forEach(archivo => {
        if (fs.existsSync(archivo)) {
            console.log(`\n📁 SUPERVISANDO: ${archivo}`);
            console.log('─'.repeat(50));
            
            // Backup automático
            supervisor.createAutoBackup(archivo);
            
            // Validar integridad
            if (!supervisor.validateFileIntegrity(archivo)) {
                return; // Skip si archivo corrupto
            }
            
            const content = fs.readFileSync(archivo, 'utf8');
            
            // Validaciones específicas por tipo
            if (archivo.endsWith('.html')) {
                supervisor.validateHTML(content);
                
                // Extraer y validar JavaScript embedded
                const scriptMatches = content.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
                if (scriptMatches) {
                    scriptMatches.forEach(scriptBlock => {
                        const jsContent = scriptBlock.replace(/<\/?script[^>]*>/g, '');
                        supervisor.validateJavaScript(jsContent);
                    });
                }
            }
            
            if (archivo.endsWith('.js')) {
                supervisor.validateJavaScript(content);
            }
            
        } else {
            supervisor.errors.push(`❌ Archivo no encontrado: ${archivo}`);
        }
    });
    
    // Generar reporte final
    console.log('\n════════════════════════════════════════════════════════');
    const success = supervisor.generateReport();
    
    if (success) {
        console.log('\n🎯 SUPERVISIÓN COMPLETADA - ARCHIVOS SEGUROS PARA MODIFICAR');
    } else {
        console.log('\n🚨 SUPERVISIÓN DETECTÓ PROBLEMAS - REVISAR ANTES DE CONTINUAR');
    }
    
    return { success, supervisor };
}

// Ejecutar supervisión
const resultado = supervisarArchivos();

console.log('\n💡 HERRAMIENTA DE SUPERVISIÓN CREADA');
console.log('📋 Ejecuta: node crear_herramienta_supervision.js');
console.log('🔧 Para supervisar archivos antes de cualquier modificación');

module.exports = { CodeSupervisor, supervisarArchivos };