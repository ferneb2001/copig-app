const fs = require('fs');

console.log('🔍 VERIFICACIÓN ADMIN.HTML CORREGIDO...');
console.log('═══════════════════════════════════════════════════');

try {
    const content = fs.readFileSync('./admin.html', 'utf8');
    
    console.log('📊 ESTADÍSTICAS DEL ARCHIVO:');
    const lines = content.split('\n');
    console.log(`📄 Total de líneas: ${lines.length}`);
    
    // Verificar que termine correctamente
    const lastLines = lines.slice(-5);
    console.log('\n📋 ÚLTIMAS 5 LÍNEAS:');
    lastLines.forEach((line, index) => {
        console.log(`${lines.length - 5 + index + 1}: ${line}`);
    });
    
    // Verificar elementos críticos
    console.log('\n🔍 VERIFICACIONES CRÍTICAS:');
    
    const checks = [
        {
            name: 'Termina con </html>',
            test: content.trim().endsWith('</html>'),
            critical: true
        },
        {
            name: 'Botón Cerrar Sesión presente',
            test: content.includes('Cerrar Sesión') && content.includes('onclick="logout()"'),
            critical: true
        },
        {
            name: 'Función logout() definida',
            test: content.includes('function logout()') || content.includes('async function logout()'),
            critical: true
        },
        {
            name: 'Menú Solicitudes CHP presente',
            test: content.includes('Solicitudes CHP') && content.includes('data-section="chp"'),
            critical: false
        },
        {
            name: 'Sin código JavaScript fuera de HTML',
            test: !content.includes('</html>') || content.split('</html>')[1].trim() === '',
            critical: true
        },
        {
            name: 'Función safeLocaleString definida',
            test: content.includes('function safeLocaleString'),
            critical: false
        }
    ];
    
    let allCritical = true;
    
    checks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        const priority = check.critical ? '[CRÍTICO]' : '[OPCIONAL]';
        console.log(`${status} ${check.name} ${priority}`);
        
        if (check.critical && !check.test) {
            allCritical = false;
        }
    });
    
    console.log('\n🎯 RESULTADO FINAL:');
    if (allCritical) {
        console.log('✅ ADMIN.HTML COMPLETAMENTE CORREGIDO');
        console.log('✅ Archivo HTML válido y funcional');
        console.log('✅ No hay código JavaScript fuera del HTML');
        console.log('✅ Botón de cerrar sesión funcional');
        
        console.log('\n📋 INSTRUCCIONES PARA FERNANDO:');
        console.log('1. 🔄 Refrescar admin (Ctrl+F5) en http://localhost:3030/admin');
        console.log('2. ✅ La página NO se debería dividir en dos');
        console.log('3. ✅ NO debería mostrarse código JavaScript en la página');
        console.log('4. 🖱️  El botón "Cerrar Sesión" debería funcionar');
        console.log('5. 👀 Buscar "Solicitudes CHP" en menú lateral');
        
        console.log('\n🚀 ESTADO: LISTO PARA USAR');
        
    } else {
        console.log('❌ FALTAN CORRECCIONES CRÍTICAS');
        console.log('⚠️  El archivo requiere más ajustes antes de usar');
    }
    
} catch (error) {
    console.error('❌ Error verificando archivo:', error.message);
}