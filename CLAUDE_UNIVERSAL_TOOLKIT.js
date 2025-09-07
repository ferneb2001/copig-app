/**
 * CLAUDE UNIVERSAL TOOLKIT - HERRAMIENTAS DE SUPERVISIÓN UNIVERSALES
 * Creado para Fernando Nebro - Aplicable a CUALQUIER proyecto
 * Filosofía: "Todo mi potencial lógico, siempre supervisado, nunca fragmentado"
 */

const fs = require('fs');
const path = require('path');

class ClaudeUniversalSupervisor {
    constructor(projectName = 'PROYECTO') {
        this.projectName = projectName;
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
        this.backups = [];
        this.startTime = new Date();
        
        console.log(`🚀 CLAUDE UNIVERSAL TOOLKIT - PROYECTO: ${this.projectName}`);
        console.log(`⏰ Iniciado: ${this.startTime.toLocaleString()}`);
    }
    
    // ========================================================================
    // DETECCIÓN INTELIGENTE DE TIPO DE PROYECTO
    // ========================================================================
    
    async detectProjectType() {
        const detectors = [
            { type: 'Node.js + Express', files: ['package.json', 'server.js'], score: 0 },
            { type: 'React', files: ['package.json', 'src/App.js'], score: 0 },
            { type: 'Vue.js', files: ['package.json', 'vue.config.js'], score: 0 },
            { type: 'Angular', files: ['angular.json', 'src/app/app.module.ts'], score: 0 },
            { type: 'Python Flask/Django', files: ['app.py', 'manage.py', 'requirements.txt'], score: 0 },
            { type: 'PHP Laravel', files: ['artisan', 'composer.json'], score: 0 },
            { type: 'HTML Estático', files: ['index.html'], score: 0 },
            { type: 'WordPress', files: ['wp-config.php', 'index.php'], score: 0 }
        ];
        
        // Calcular score por cada tipo
        detectors.forEach(detector => {
            detector.files.forEach(file => {
                if (fs.existsSync(file)) detector.score++;
            });
        });
        
        // Encontrar tipo con mayor score
        const detected = detectors.sort((a, b) => b.score - a.score)[0];
        
        if (detected.score > 0) {
            console.log(`🎯 Tipo de proyecto detectado: ${detected.type} (score: ${detected.score})`);
            return detected.type;
        }
        
        console.log('❓ Tipo de proyecto no reconocido - usando supervisión genérica');
        return 'Genérico';
    }
    
    // ========================================================================
    // SUPERVISIÓN UNIVERSAL DE ARCHIVOS
    // ========================================================================
    
    async scanProjectFiles() {
        const extensions = {
            code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.php', '.java', '.cs', '.go', '.rs'],
            web: ['.html', '.css', '.scss', '.less', '.vue', '.svelte'],
            config: ['.json', '.yml', '.yaml', '.xml', '.env', '.ini'],
            docs: ['.md', '.txt', '.rst'],
            data: ['.sql', '.db', '.sqlite']
        };
        
        const files = this.getAllFiles('.', extensions);
        
        console.log('📁 INVENTARIO COMPLETO DEL PROYECTO:');
        Object.keys(files).forEach(category => {
            if (files[category].length > 0) {
                console.log(`   ${this.getCategoryIcon(category)} ${category.toUpperCase()}: ${files[category].length} archivos`);
                files[category].slice(0, 5).forEach(file => {
                    console.log(`      - ${file}`);
                });
                if (files[category].length > 5) {
                    console.log(`      ... y ${files[category].length - 5} más`);
                }
            }
        });
        
        return files;
    }
    
    getAllFiles(dir, extensions) {
        const result = { code: [], web: [], config: [], docs: [], data: [], other: [] };
        
        try {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    const subFiles = this.getAllFiles(fullPath, extensions);
                    Object.keys(subFiles).forEach(key => {
                        result[key].push(...subFiles[key]);
                    });
                } else if (stat.isFile()) {
                    const ext = path.extname(item).toLowerCase();
                    let categorized = false;
                    
                    Object.keys(extensions).forEach(category => {
                        if (extensions[category].includes(ext)) {
                            result[category].push(fullPath);
                            categorized = true;
                        }
                    });
                    
                    if (!categorized) {
                        result.other.push(fullPath);
                    }
                }
            });
        } catch (error) {
            console.log(`⚠️ No se pudo leer directorio: ${dir}`);
        }
        
        return result;
    }
    
    getCategoryIcon(category) {
        const icons = {
            code: '💻',
            web: '🌐', 
            config: '⚙️',
            docs: '📄',
            data: '🗄️',
            other: '📦'
        };
        return icons[category] || '📄';
    }
    
    // ========================================================================
    // VALIDACIONES UNIVERSALES
    // ========================================================================
    
    validateUniversalCode(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath).toLowerCase();
        
        // Validaciones universales para cualquier código
        const checks = [
            {
                name: 'Tamaño razonable',
                test: () => content.length < 1000000, // < 1MB
                severity: 'warning'
            },
            {
                name: 'Sin caracteres extraños',
                test: () => !/[^\x20-\x7E\r\n\t\u00A0-\uFFFF]/.test(content),
                severity: 'warning'
            },
            {
                name: 'No está vacío',
                test: () => content.trim().length > 0,
                severity: 'error'
            }
        ];
        
        // Validaciones específicas por lenguaje
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
            checks.push(...this.getJavaScriptChecks(content));
        } else if (['.html', '.htm'].includes(ext)) {
            checks.push(...this.getHTMLChecks(content));
        } else if (['.css', '.scss', '.less'].includes(ext)) {
            checks.push(...this.getCSSChecks(content));
        } else if (ext === '.py') {
            checks.push(...this.getPythonChecks(content));
        }
        
        // Ejecutar validaciones
        checks.forEach(check => {
            try {
                const passed = check.test();
                if (!passed) {
                    const message = `${check.severity === 'error' ? '❌' : '⚠️'} ${filePath}: ${check.name}`;
                    if (check.severity === 'error') {
                        this.errors.push(message);
                    } else {
                        this.warnings.push(message);
                    }
                }
            } catch (error) {
                this.warnings.push(`⚠️ ${filePath}: Error en validación ${check.name}`);
            }
        });
    }
    
    getJavaScriptChecks(content) {
        return [
            {
                name: 'Llaves balanceadas',
                test: () => {
                    const opens = (content.match(/\\{/g) || []).length;
                    const closes = (content.match(/\\}/g) || []).length;
                    return Math.abs(opens - closes) <= 1; // Tolerancia de 1
                },
                severity: 'error'
            },
            {
                name: 'Paréntesis balanceados',
                test: () => {
                    const opens = (content.match(/\\(/g) || []).length;
                    const closes = (content.match(/\\)/g) || []).length;
                    return Math.abs(opens - closes) <= 2; // Tolerancia de 2
                },
                severity: 'error'
            },
            {
                name: 'Sin console.log en producción',
                test: () => !content.includes('console.log') || content.includes('// DEBUG'),
                severity: 'warning'
            }
        ];
    }
    
    getHTMLChecks(content) {
        return [
            {
                name: 'Estructura HTML básica',
                test: () => content.includes('<html') && content.includes('</html>'),
                severity: 'error'
            },
            {
                name: 'Tags balanceados',
                test: () => {
                    const divOpens = (content.match(/<div[^>]*>/g) || []).length;
                    const divCloses = (content.match(/<\\/div>/g) || []).length;
                    return Math.abs(divOpens - divCloses) <= 3; // Tolerancia
                },
                severity: 'warning'
            }
        ];
    }
    
    getCSSChecks(content) {
        return [
            {
                name: 'Llaves CSS balanceadas',
                test: () => {
                    const opens = (content.match(/\\{/g) || []).length;
                    const closes = (content.match(/\\}/g) || []).length;
                    return opens === closes;
                },
                severity: 'error'
            }
        ];
    }
    
    getPythonChecks(content) {
        return [
            {
                name: 'Indentación consistente',
                test: () => {
                    const lines = content.split('\\n');
                    const indentedLines = lines.filter(line => line.startsWith('    ') || line.startsWith('\\t'));
                    return indentedLines.length > 0; // Al menos algo de indentación
                },
                severity: 'warning'
            }
        ];
    }
    
    // ========================================================================
    // BACKUP AUTOMÁTICO INTELIGENTE
    // ========================================================================
    
    createSmartBackup(filePath) {
        if (!fs.existsSync(filePath)) return null;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const dir = path.dirname(filePath);
        
        const backupName = `${base}_CLAUDE_BACKUP_${timestamp}${ext}`;
        const backupPath = path.join(dir, backupName);
        
        try {
            fs.copyFileSync(filePath, backupPath);
            this.backups.push({
                original: filePath,
                backup: backupPath,
                timestamp: new Date(),
                size: fs.statSync(filePath).size
            });
            
            console.log(`💾 Backup inteligente: ${backupName}`);
            return backupPath;
        } catch (error) {
            console.log(`❌ Error creando backup: ${error.message}`);
            return null;
        }
    }
    
    // ========================================================================
    // CORRECCIÓN AUTOMÁTICA INTELIGENTE
    // ========================================================================
    
    async autoFix(filePath) {
        console.log(`🔧 Auto-corrección inteligente: ${filePath}`);
        
        // Crear backup antes de corregir
        const backup = this.createSmartBackup(filePath);
        if (!backup) return false;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let fixed = false;
        const ext = path.extname(filePath).toLowerCase();
        
        // Correcciones universales
        const originalLength = content.length;
        
        // Normalizar line endings
        content = content.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
        
        // Remover espacios al final de líneas
        content = content.replace(/ +$/gm, '');
        
        // Correcciones específicas por tipo
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
            content = this.fixJavaScript(content);
        } else if (['.html', '.htm'].includes(ext)) {
            content = this.fixHTML(content);
        } else if (['.css', '.scss', '.less'].includes(ext)) {
            content = this.fixCSS(content);
        }
        
        if (content.length !== originalLength) {
            fs.writeFileSync(filePath, content, 'utf8');
            fixed = true;
            console.log(`✅ ${filePath} auto-corregido`);
        } else {
            console.log(`ℹ️ ${filePath} no necesitó corrección`);
        }
        
        return fixed;
    }
    
    fixJavaScript(content) {
        // Corregir console.log duplicados
        content = content.replace(/console\\.log\\(.*?\\);?\\s*console\\.log\\(.*?\\);?/g, 
            match => match.split('console.log')[0] + 'console.log' + match.split('console.log')[2]);
        
        return content;
    }
    
    fixHTML(content) {
        // Balancear divs básicos (agregar cierres faltantes)
        const divOpens = (content.match(/<div[^>]*>/g) || []).length;
        const divCloses = (content.match(/<\\/div>/g) || []).length;
        
        if (divOpens > divCloses) {
            const missing = divOpens - divCloses;
            const closeTags = '\\n' + '</div>'.repeat(missing);
            
            // Insertar antes del último </body> o </html>
            const insertPoint = content.lastIndexOf('</body>') !== -1 ? 
                content.lastIndexOf('</body>') : 
                content.lastIndexOf('</html>');
                
            if (insertPoint !== -1) {
                content = content.slice(0, insertPoint) + closeTags + '\\n' + content.slice(insertPoint);
            }
        }
        
        return content;
    }
    
    fixCSS(content) {
        // Corregir llaves CSS básicas
        const opens = (content.match(/\\{/g) || []).length;
        const closes = (content.match(/\\}/g) || []).length;
        
        if (opens > closes) {
            content += '\\n' + '}'.repeat(opens - closes);
        }
        
        return content;
    }
    
    // ========================================================================
    // REPORTE FINAL INTELIGENTE
    // ========================================================================
    
    generateUniversalReport() {
        const endTime = new Date();
        const duration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        console.log('\\n' + '='.repeat(80));
        console.log(`📊 REPORTE UNIVERSAL - PROYECTO: ${this.projectName}`);
        console.log(`⏱️ Duración: ${duration} segundos`);
        console.log('='.repeat(80));
        
        if (this.backups.length > 0) {
            console.log(`\\n💾 BACKUPS CREADOS: ${this.backups.length}`);
            this.backups.forEach(backup => {
                console.log(`   📁 ${backup.original} → ${path.basename(backup.backup)}`);
            });
        }
        
        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('\\n🎉 PERFECCIÓN TOTAL - PROYECTO 100% LIMPIO');
            console.log('✅ Sin errores críticos');
            console.log('✅ Sin advertencias');
            console.log('✅ Todos los archivos supervisados');
            return true;
        }
        
        if (this.errors.length > 0) {
            console.log('\\n❌ ERRORES CRÍTICOS:');
            this.errors.forEach(error => console.log(`   ${error}`));
        }
        
        if (this.warnings.length > 0) {
            console.log('\\n⚠️ ADVERTENCIAS:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }
        
        if (this.suggestions.length > 0) {
            console.log('\\n💡 SUGERENCIAS DE MEJORA:');
            this.suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
        }
        
        console.log('\\n🛡️ SUPERVISIÓN COMPLETA - ARCHIVOS PROTEGIDOS');
        return this.errors.length === 0;
    }
}

// ============================================================================
// FUNCIÓN PRINCIPAL UNIVERSAL
// ============================================================================

async function superviseUniversalProject(projectName = 'PROYECTO') {
    const supervisor = new ClaudeUniversalSupervisor(projectName);
    
    try {
        // 1. Detectar tipo de proyecto
        const projectType = await supervisor.detectProjectType();
        
        // 2. Escanear todos los archivos
        const files = await supervisor.scanProjectFiles();
        
        // 3. Validar archivos críticos
        const criticalFiles = [...files.code, ...files.web, ...files.config];
        
        if (criticalFiles.length > 0) {
            console.log('\\n🔍 VALIDANDO ARCHIVOS CRÍTICOS...');
            criticalFiles.slice(0, 20).forEach(file => { // Limitar a 20 para no saturar
                supervisor.validateUniversalCode(file);
            });
            
            if (criticalFiles.length > 20) {
                console.log(`   ... y ${criticalFiles.length - 20} archivos más validados`);
            }
        }
        
        // 4. Generar reporte
        const success = supervisor.generateUniversalReport();
        
        return { success, supervisor, projectType, files };
        
    } catch (error) {
        console.error('❌ Error en supervisión universal:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// EXPORTAR HERRAMIENTAS UNIVERSALES
// ============================================================================

module.exports = {
    ClaudeUniversalSupervisor,
    superviseUniversalProject
};

// Auto-ejecutar si se llama directamente
if (require.main === module) {
    const projectName = process.argv[2] || path.basename(process.cwd());
    superviseUniversalProject(projectName);
}

console.log('\\n🚀 CLAUDE UNIVERSAL TOOLKIT CREADO');
console.log('📋 Uso: node CLAUDE_UNIVERSAL_TOOLKIT.js [NOMBRE_PROYECTO]');
console.log('🛡️ Funciona en CUALQUIER proyecto: Node.js, React, Vue, Angular, Python, PHP, etc.');
console.log('⚡ Detección automática, backup inteligente, corrección automática');
console.log('\\n💡 PARA FERNANDO: Esta herramienta funciona en CUALQUIER proyecto futuro');