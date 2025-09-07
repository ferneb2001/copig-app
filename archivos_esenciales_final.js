/**
 * Lista SOLO los archivos esenciales que deberían ir a GitHub
 */

const fs = require('fs');
const path = require('path');

// Archivos ESENCIALES específicos (whitelist)
const essentialFiles = [
    'server.js',
    'config.json',
    'package.json',
    'package-lock.json',
    '.env.example',
    '.gitignore',
    
    // Documentación principal
    'CLAUDE.md',
    'maximas.md',
    'README.md', // si existe
    
    // Interfaces web principales (solo las activas)
    'admin.html',
    'portal-profesional.html',
    'empresas.html',
    'login.html',
    'index.html',
    'dashboard.html',
    'admin-chp.html',
    
    // Assets esenciales
    'logo-copig.png',
    'assets/',
    
    // Archivos de configuración del sistema
    'email.js',
    'logger.js',
    'security.js',
    'rate-limiter.js',
    'performance.js',
    'cache.js',
    'payment_config.js',
    'payment_gateway.js'
];

// Patrones de archivos NO esenciales
const ignorePatterns = [
    /backup/i,
    /test/i,
    /_20\d{2}-/,
    /corrupto/i,
    /temporal/i,
    /debug/i,
    /\.(log|txt|sql|py|bat|exe|dbf|cdx|idx)$/i,
    /^(fix|debug|test|check|verify|analyze|import|create|execute)_/i
];

function isEssential(filename) {
    // Verificar whitelist específica
    if (essentialFiles.includes(filename)) return true;
    
    // Verificar directorio assets
    if (filename.startsWith('assets/')) return true;
    
    // Verificar si está en patrones ignorados
    if (ignorePatterns.some(pattern => pattern.test(filename))) return false;
    
    // Solo archivos HTML principales sin sufijos de backup
    if (filename.endsWith('.html')) {
        return !filename.includes('backup') && 
               !filename.includes('ANTES') && 
               !filename.includes('CORRUPTO') &&
               !filename.includes('-old') &&
               !filename.includes('-broken') &&
               !filename.includes('_20') &&
               !filename.match(/\d{4}-\d{2}-\d{2}/);
    }
    
    // Solo archivos JS del core system (no scripts de desarrollo)
    if (filename.endsWith('.js') && filename !== 'server.js') {
        // Solo algunos JS específicos esenciales
        const essentialJS = [
            'email.js', 'logger.js', 'security.js', 'rate-limiter.js',
            'performance.js', 'cache.js', 'payment_config.js', 'payment_gateway.js',
            'toast-notifications.js', 'cache-manager.js'
        ];
        return essentialJS.includes(filename);
    }
    
    return false;
}

function scanDirectory(dir = '.') {
    const files = fs.readdirSync(dir);
    const essential = [];
    
    for (const file of files) {
        if (file.startsWith('.git') || file.startsWith('.claude')) continue;
        
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (['assets', 'uploads'].includes(file)) {
                essential.push(`📁 ${file}/`);
                // Incluir algunos archivos de estas carpetas
                try {
                    const subFiles = fs.readdirSync(fullPath).slice(0, 3);
                    subFiles.forEach(sub => essential.push(`  📄 ${file}/${sub}`));
                    if (subFiles.length > 3) essential.push(`  ... y más archivos`);
                } catch(e) {}
            }
        } else {
            if (isEssential(file)) {
                essential.push(`📄 ${file}`);
            }
        }
    }
    
    return essential;
}

console.log('🎯 ARCHIVOS REALMENTE ESENCIALES PARA GITHUB:');
console.log('===========================================\n');

const files = scanDirectory();

console.log('📦 CÓDIGO CORE:');
files.filter(f => f.includes('server.js') || f.includes('config.json') || f.includes('package')).forEach(f => console.log(f));

console.log('\n🌐 INTERFACES WEB:');
files.filter(f => f.endsWith('.html') && !f.includes('/')).forEach(f => console.log(f));

console.log('\n📚 DOCUMENTACIÓN:');
files.filter(f => f.endsWith('.md')).forEach(f => console.log(f));

console.log('\n🎨 ASSETS:');
files.filter(f => f.includes('assets') || f.includes('logo')).forEach(f => console.log(f));

console.log('\n🔧 UTILIDADES:');
files.filter(f => f.includes('.js') && !f.includes('server.js') && !f.includes('/')).forEach(f => console.log(f));

console.log('\n📊 RESUMEN:');
console.log(`Total archivos esenciales: ${files.length}`);
console.log(`Tamaño estimado: ~50-100 archivos vs ${fs.readdirSync('.').length} actuales`);
console.log('\n✅ ESTE es el tamaño ideal para GitHub!');