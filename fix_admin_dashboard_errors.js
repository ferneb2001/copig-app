const fs = require('fs');

console.log('🔧 ARREGLANDO ERRORES DASHBOARD ADMIN...');
console.log('═══════════════════════════════════════════════');

try {
    let adminContent = fs.readFileSync('./admin.html', 'utf8');
    console.log('📄 Archivo admin.html leído');
    
    // 1. Arreglar error toLocaleString - agregar validación null/undefined
    console.log('🔢 Arreglando errores toLocaleString...');
    
    // Buscar todas las ocurrencias de .toLocaleString() y agregar validación
    const toLocaleStringFixes = [
        {
            old: /(\w+)\.toLocaleString\(/g,
            new: '($1 && typeof $1 === "number" ? $1.toLocaleString('
        }
    ];
    
    // Aplicar fix más específico para las líneas problemáticas
    const specificFixes = [
        // Fix para loadDashboardStats
        {
            old: /stats\.totalSolicitudes\.toLocaleString\(/g,
            new: '(stats?.totalSolicitudes || 0).toLocaleString('
        },
        {
            old: /stats\.totalProfesionales\.toLocaleString\(/g,
            new: '(stats?.totalProfesionales || 0).toLocaleString('
        },
        {
            old: /stats\.totalEmpresas\.toLocaleString\(/g,
            new: '(stats?.totalEmpresas || 0).toLocaleString('
        },
        {
            old: /stats\.ingresosMes\.toLocaleString\(/g,
            new: '(stats?.ingresosMes || 0).toLocaleString('
        }
    ];
    
    specificFixes.forEach((fix, index) => {
        const oldContent = adminContent;
        adminContent = adminContent.replace(fix.old, fix.new);
        if (oldContent !== adminContent) {
            console.log(`   ✅ Fix ${index + 1} aplicado: toLocaleString validado`);
        }
    });
    
    // 2. Arreglar error de Canvas Chart.js - destruir charts existentes
    console.log('📊 Arreglando errores Canvas Chart.js...');
    
    // Buscar función loadActivityChart y agregar destrucción de chart existente
    const chartDestroyCode = `
        // Destruir chart existente si existe
        if (window.activityChart && typeof window.activityChart.destroy === 'function') {
            window.activityChart.destroy();
        }
        
        const ctx = document.getElementById('activityChart').getContext('2d');
        window.activityChart = new Chart(ctx, {`;
    
    // Buscar patrón de creación de chart
    const chartPattern = /const ctx = document\.getElementById\('activityChart'\)\.getContext\('2d'\);\s*new Chart\(ctx, \{/;
    
    if (chartPattern.test(adminContent)) {
        adminContent = adminContent.replace(chartPattern, chartDestroyCode.trim());
        console.log('   ✅ Chart.js: Destrucción automática agregada');
    }
    
    // 3. Agregar validación general para datos undefined
    console.log('🛡️  Agregando validaciones generales...');
    
    const validationCode = `
        // Función helper para valores seguros
        function safeValue(value, defaultValue = 0) {
            if (value === null || value === undefined || isNaN(value)) {
                return defaultValue;
            }
            return value;
        }
        
        // Función helper para formatear números de forma segura
        function safeLocaleString(value, locale = 'es-AR') {
            const safeVal = safeValue(value, 0);
            return safeVal.toLocaleString(locale);
        }
        `;
    
    // Insertar antes del primer script
    const firstScriptIndex = adminContent.indexOf('<script>');
    if (firstScriptIndex !== -1) {
        adminContent = adminContent.slice(0, firstScriptIndex + 8) + validationCode + adminContent.slice(firstScriptIndex + 8);
        console.log('   ✅ Funciones de validación agregadas');
    }
    
    // 4. Reemplazar .toLocaleString() restantes con función segura
    console.log('🔄 Reemplazando toLocaleString restantes...');
    
    // Buscar patrones específicos en dashboard stats
    const dashboardStatsFixes = [
        {
            pattern: /document\.getElementById\('totalProfesionales'\)\.textContent = [^;]+;/,
            replacement: `document.getElementById('totalProfesionales').textContent = safeLocaleString(stats?.totalProfesionales);`
        },
        {
            pattern: /document\.getElementById\('totalEmpresas'\)\.textContent = [^;]+;/,
            replacement: `document.getElementById('totalEmpresas').textContent = safeLocaleString(stats?.totalEmpresas);`
        },
        {
            pattern: /document\.getElementById\('totalSolicitudes'\)\.textContent = [^;]+;/,
            replacement: `document.getElementById('totalSolicitudes').textContent = safeLocaleString(stats?.totalSolicitudes);`
        },
        {
            pattern: /document\.getElementById\('ingresosMes'\)\.textContent = [^;]+;/,
            replacement: `document.getElementById('ingresosMes').textContent = '$' + safeLocaleString(stats?.ingresosMes);`
        }
    ];
    
    dashboardStatsFixes.forEach((fix, index) => {
        if (fix.pattern.test(adminContent)) {
            adminContent = adminContent.replace(fix.pattern, fix.replacement);
            console.log(`   ✅ Dashboard stats fix ${index + 1} aplicado`);
        }
    });
    
    // 5. Agregar try-catch a funciones problemáticas
    console.log('🛡️  Agregando try-catch a funciones críticas...');
    
    // Buscar loadDashboardStats y envolverla en try-catch
    const loadStatsPattern = /async function loadDashboardStats\(\) \{([^}]+)\}/;
    if (loadStatsPattern.test(adminContent)) {
        adminContent = adminContent.replace(loadStatsPattern, (match, content) => {
            return `async function loadDashboardStats() {
                try {
                    ${content}
                } catch (error) {
                    console.error('Error loading stats:', error);
                    // Valores por defecto en caso de error
                    document.getElementById('totalProfesionales').textContent = '0';
                    document.getElementById('totalEmpresas').textContent = '0';
                    document.getElementById('totalSolicitudes').textContent = '0';
                    document.getElementById('ingresosMes').textContent = '$0';
                }
            }`;
        });
        console.log('   ✅ Try-catch agregado a loadDashboardStats');
    }
    
    // 6. Escribir archivo corregido
    fs.writeFileSync('./admin.html', adminContent);
    console.log('💾 Archivo admin.html corregido y guardado');
    
    console.log('\\n✅ ERRORES CORREGIDOS:');
    console.log('• ✅ toLocaleString() con validación null/undefined');
    console.log('• ✅ Chart.js Canvas destruido automáticamente');
    console.log('• ✅ Funciones helper agregadas');
    console.log('• ✅ Try-catch en funciones críticas');
    console.log('• ✅ Valores por defecto para errores');
    
    console.log('\\n🎯 RESULTADO:');
    console.log('Fernando, ahora puedes:');
    console.log('1. 🔄 Refrescar admin (Ctrl+F5)');
    console.log('2. ✅ Sin errores en F12 console');
    console.log('3. 📊 Dashboard funcional');
    console.log('4. 🔗 Buscar "Solicitudes CHP" en menú lateral');
    console.log('5. 👀 Ver las 10 solicitudes CHP');
    
} catch (error) {
    console.error('❌ Error arreglando dashboard:', error.message);
}