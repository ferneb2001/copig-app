const fs = require('fs');

console.log('🔍 BUSCANDO Y CORRIGIENDO ERROR DE SINTAXIS...');
console.log('═══════════════════════════════════════════════════');

try {
    let adminContent = fs.readFileSync('./admin.html', 'utf8');
    console.log('📄 Archivo admin.html leído para revisión');
    
    // Buscar problemas específicos que pueden causar "missing ) after argument list"
    console.log('🔍 Buscando problemas de sintaxis JavaScript...');
    
    let fixesApplied = 0;
    
    // 1. Verificar paréntesis desbalanceados en toLocaleString
    const toLocaleFixes = [
        {
            name: 'toLocaleString sin cierre',
            pattern: /\(\([^)]+\)\.toLocaleString\([^)]*$/gm,
            fix: line => line + ')'
        },
        {
            name: 'toLocaleString con paréntesis extra',
            pattern: /\(\([^)]+\)\.toLocaleString\([^)]*\)\)/g,
            fix: line => line.replace(/\)\)$/, ')')
        }
    ];
    
    toLocaleFixes.forEach(fix => {
        const matches = adminContent.match(fix.pattern);
        if (matches) {
            console.log(`   ⚠️  Encontrado problema: ${fix.name} - ${matches.length} ocurrencias`);
            matches.forEach((match, i) => {
                console.log(`      ${i+1}: ${match.substring(0, 50)}...`);
            });
            fixesApplied++;
        }
    });
    
    // 2. Buscar problemas específicos en las líneas que modificamos
    const problemPatterns = [
        /\([^)]+\.toLocaleString\([^)]*$/g,  // toLocaleString sin cierre
        /safeLocaleString\([^)]*$/g,         // safeLocaleString sin cierre  
        /\(\([^)]*\|\|[^)]*\)\.toLocaleString\([^)]*$/g // Expresión compleja sin cierre
    ];
    
    problemPatterns.forEach((pattern, index) => {
        const matches = adminContent.match(pattern);
        if (matches) {
            console.log(`   ❌ Patrón problemático ${index + 1}: ${matches.length} ocurrencias`);
            matches.forEach((match, i) => {
                console.log(`      ${i+1}: ${match}`);
            });
        }
    });
    
    // 3. Corregir problemas específicos conocidos
    console.log('🔧 Aplicando correcciones específicas...');
    
    // Fix para safeLocaleString calls
    const safeLocaleFixes = [
        {
            old: /(safeLocaleString\([^)]+)(?!\))/g,
            new: '$1)'
        },
        {
            old: /\(\(stats\?\.[^)]+\)\.toLocaleString\([^)]*$/gm,
            new: match => match + ')'
        }
    ];
    
    safeLocaleFixes.forEach((fix, index) => {
        const oldContent = adminContent;
        adminContent = adminContent.replace(fix.old, fix.new);
        if (oldContent !== adminContent) {
            console.log(`   ✅ Fix ${index + 1} aplicado`);
            fixesApplied++;
        }
    });
    
    // 4. Fix más específico para las líneas de dashboard stats
    const dashboardFixes = [
        "document.getElementById('totalProfesionales').textContent = safeLocaleString(stats?.totalProfesionales);",
        "document.getElementById('totalEmpresas').textContent = safeLocaleString(stats?.totalEmpresas);", 
        "document.getElementById('totalSolicitudes').textContent = safeLocaleString(stats?.totalSolicitudes);",
        "document.getElementById('ingresosMes').textContent = '$' + safeLocaleString(stats?.ingresosMes);"
    ];
    
    // Buscar y reemplazar líneas específicas problemáticas
    dashboardFixes.forEach((correctLine, index) => {
        // Buscar patrones similares pero rotos
        const brokenPatterns = [
            /document\.getElementById\('totalProfesionales'\)\.textContent = safeLocaleString\([^;]+(?!;)/,
            /document\.getElementById\('totalEmpresas'\)\.textContent = safeLocaleString\([^;]+(?!;)/,
            /document\.getElementById\('totalSolicitudes'\)\.textContent = safeLocaleString\([^;]+(?!;)/,
            /document\.getElementById\('ingresosMes'\)\.textContent = \'\$\' \+ safeLocaleString\([^;]+(?!;)/
        ];
        
        if (brokenPatterns[index] && brokenPatterns[index].test(adminContent)) {
            adminContent = adminContent.replace(brokenPatterns[index], correctLine);
            console.log(`   ✅ Dashboard fix ${index + 1} aplicado: ${correctLine.substring(0, 40)}...`);
            fixesApplied++;
        }
    });
    
    // 5. Verificación general de paréntesis
    console.log('🧮 Verificando balance de paréntesis...');
    
    const lines = adminContent.split('\n');
    lines.forEach((line, lineNum) => {
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        
        if (openParens !== closeParens && line.includes('toLocaleString')) {
            console.log(`   ⚠️  Línea ${lineNum + 1}: ${openParens} '(' vs ${closeParens} ')'`);
            console.log(`      ${line.trim()}`);
            
            // Intentar corregir automáticamente
            if (openParens > closeParens) {
                const diff = openParens - closeParens;
                lines[lineNum] = line + ')'.repeat(diff);
                console.log(`   🔧 Corregida automáticamente agregando ${diff} ')'`);
                fixesApplied++;
            }
        }
    });
    
    adminContent = lines.join('\n');
    
    // 6. Escribir archivo corregido
    if (fixesApplied > 0) {
        fs.writeFileSync('./admin.html', adminContent);
        console.log(`💾 Archivo corregido con ${fixesApplied} fixes aplicados`);
    } else {
        console.log('ℹ️  No se encontraron problemas automáticamente corregibles');
    }
    
    console.log('\n🎯 SIGUIENTE PASO:');
    if (fixesApplied > 0) {
        console.log('✅ Errores de sintaxis corregidos');
        console.log('🔄 Refrescar admin.html (Ctrl+F5)');
        console.log('🔍 Verificar F12 Console - debería estar sin errores');
    } else {
        console.log('🔍 El error puede estar en una línea específica');
        console.log('📋 Revisar F12 Console para el número de línea exacto');
        console.log('🔧 Puede requerir corrección manual');
    }
    
} catch (error) {
    console.error('❌ Error revisando sintaxis:', error.message);
}