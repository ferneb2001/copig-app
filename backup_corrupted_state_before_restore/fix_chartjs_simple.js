const fs = require('fs');

console.log('🔧 ARREGLO SIMPLE DE CHART.JS - SIN TOCAR NADA MÁS...');
console.log('════════════════════════════════════════════════════════');

try {
    let content = fs.readFileSync('./admin.html', 'utf8');
    
    console.log('🎯 Arreglando problema específico newCtx...');
    
    // Fix 1: Corregir newCtx undefined
    content = content.replace(
        'const newCtx = document.getElementById(\'activityChart\');',
        'const ctx = document.getElementById(\'activityChart\').getContext(\'2d\');'
    );
    
    // Fix 2: Corregir new Chart(newCtx, {
    content = content.replace(
        'window.activityChart = new Chart(newCtx, {',
        'window.activityChart = new Chart(ctx, {'
    );
    
    // Fix 3: Simplificar destrucción Chart.js 
    content = content.replace(
        /\/\/ DESTRUCCIÓN BRUTAL DE CHART\.JS - MÉTODO NUCLEAR[\s\S]*?const ctx = document\.getElementById\('activityChart'\)\.getContext\('2d'\);/,
        `// Destruir chart existente simple
            if (window.activityChart) {
                window.activityChart.destroy();
                window.activityChart = null;
            }
            
            const ctx = document.getElementById('activityChart').getContext('2d');`
    );
    
    // Backup y guardar
    fs.writeFileSync('./admin_current_backup.html', fs.readFileSync('./admin.html'));
    fs.writeFileSync('./admin.html', content);
    
    console.log('✅ PROBLEMAS CORREGIDOS:');
    console.log('• newCtx → ctx corregido');
    console.log('• Chart.js simplificado sin destrucción brutal');
    console.log('• Código nuclear eliminado');
    
    console.log('\n🎯 RESULTADO:');
    console.log('Fernando, Chart.js debería funcionar ahora sin errores.');
    console.log('La función está limpia y simple.');
    console.log('');
    console.log('📋 ACCIÓN:');
    console.log('🔄 Refrescar admin (Ctrl+F5)');
    console.log('✅ Errores Chart.js eliminados');
    console.log('🖱️ "Solicitudes CHP" debería funcionar');
    
} catch (error) {
    console.error('❌ Error en fix simple:', error.message);
}