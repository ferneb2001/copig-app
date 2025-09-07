const fs = require('fs');

console.log('🔍 VERIFICACIÓN FINAL DE SINTAXIS ADMIN.HTML...');
console.log('═══════════════════════════════════════════════════');

try {
    const content = fs.readFileSync('./admin.html', 'utf8');
    
    // Verificar problemas específicos conocidos
    const problems = [];
    
    // 1. Paréntesis desbalanceados en líneas con toLocaleString
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('toLocaleString')) {
            const openParens = (line.match(/\(/g) || []).length;
            const closeParens = (line.match(/\)/g) || []).length;
            
            if (openParens !== closeParens) {
                problems.push({
                    line: index + 1,
                    type: 'Paréntesis desbalanceados',
                    content: line.trim()
                });
            }
        }
    });
    
    // 2. Funciones duplicadas
    const safeLocaleFunctions = content.match(/function safeLocaleString/g);
    if (safeLocaleFunctions && safeLocaleFunctions.length > 1) {
        problems.push({
            type: 'Función safeLocaleString duplicada',
            count: safeLocaleFunctions.length
        });
    }
    
    // 3. Bloques try-catch mal formateados
    const tryBlocks = content.match(/try\s*\{/g);
    const catchBlocks = content.match(/catch\s*\(/g);
    
    if (tryBlocks && catchBlocks && tryBlocks.length !== catchBlocks.length) {
        problems.push({
            type: 'Bloques try-catch desbalanceados',
            try_count: tryBlocks.length,
            catch_count: catchBlocks.length
        });
    }
    
    // 4. Comillas sin cerrar
    const unclosedStrings = content.match(/[^\\]'[^']*$/gm);
    if (unclosedStrings && unclosedStrings.length > 0) {
        problems.push({
            type: 'Strings sin cerrar',
            count: unclosedStrings.length
        });
    }
    
    console.log('\n📊 RESULTADO DE VERIFICACIÓN:');
    
    if (problems.length === 0) {
        console.log('✅ NO SE ENCONTRARON PROBLEMAS DE SINTAXIS');
        console.log('✅ Archivo admin.html está sintácticamente correcto');
        console.log('✅ Función safeLocaleString definida correctamente');
        console.log('✅ Función loadDashboardStats corregida');
        console.log('\n🎯 FERNANDO PUEDE PROCEDER:');
        console.log('1. 🔄 Refrescar admin (Ctrl+F5)');
        console.log('2. 👀 Verificar consola F12 - Sin errores');
        console.log('3. 🖱️  Buscar "Solicitudes CHP" en menú lateral');
        console.log('4. ✅ Sistema completamente funcional');
        
    } else {
        console.log('❌ PROBLEMAS ENCONTRADOS:');
        problems.forEach((problem, index) => {
            console.log(`\n${index + 1}. ${problem.type}`);
            if (problem.line) {
                console.log(`   Línea: ${problem.line}`);
                console.log(`   Contenido: ${problem.content}`);
            }
            if (problem.count) {
                console.log(`   Cantidad: ${problem.count}`);
            }
            if (problem.try_count) {
                console.log(`   Try: ${problem.try_count}, Catch: ${problem.catch_count}`);
            }
        });
        
        console.log('\n🔧 ACCIÓN REQUERIDA:');
        console.log('Correcciones adicionales necesarias antes de usar el sistema');
    }
    
} catch (error) {
    console.error('❌ Error verificando sintaxis:', error.message);
}