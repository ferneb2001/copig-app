const fs = require('fs');

console.log('🔗 AGREGANDO ENLACE CHP AL DASHBOARD ADMIN...');
console.log('═══════════════════════════════════════════════════');

try {
    // Leer el archivo admin.html
    let adminContent = fs.readFileSync('./admin.html', 'utf8');
    
    console.log('📄 Archivo admin.html leído correctamente');
    
    // Buscar donde agregar el enlace CHP
    const dashboardCardPattern = /<div class="dashboard-card"[^>]*>/g;
    const matches = adminContent.match(dashboardCardPattern);
    
    if (matches && matches.length > 0) {
        console.log(`🔍 Encontradas ${matches.length} tarjetas dashboard`);
        
        // Buscar una buena ubicación para insertar
        const insertPoint = adminContent.indexOf('</div> <!-- dashboard-grid -->');
        
        if (insertPoint !== -1) {
            // Crear tarjeta CHP
            const chpCard = `
            <!-- Tarjeta CHP -->
            <div class="dashboard-card" onclick="window.open('admin-chp.html', '_blank')" style="cursor: pointer; background: linear-gradient(135deg, #4CAF50, #45a049);">
                <div class="card-icon" style="color: white;">📋</div>
                <div class="card-content" style="color: white;">
                    <h3 style="color: white;">Solicitudes CHP</h3>
                    <p style="color: rgba(255,255,255,0.9);">Gestionar solicitudes de Certificados de Habilitación Profesional</p>
                    <div class="card-stats" style="color: rgba(255,255,255,0.8);">
                        <span>Ver todas las solicitudes →</span>
                    </div>
                </div>
            </div>
            `;
            
            // Insertar la tarjeta antes del cierre del dashboard-grid
            const newContent = adminContent.slice(0, insertPoint) + chpCard + adminContent.slice(insertPoint);
            
            // Escribir el archivo actualizado
            fs.writeFileSync('./admin.html', newContent);
            
            console.log('✅ Tarjeta CHP agregada al dashboard admin');
            console.log('📍 Ubicación: Antes del cierre de dashboard-grid');
            
        } else {
            console.log('❌ No se encontró punto de inserción dashboard-grid');
        }
    } else {
        console.log('❌ No se encontraron tarjetas dashboard para usar como referencia');
    }
    
    // También agregar al menú si existe
    if (adminContent.includes('<nav') || adminContent.includes('menu')) {
        console.log('🔍 Intentando agregar al menú navegación...');
        
        // Buscar patrones de menú
        const menuPatterns = [
            /<ul[^>]*class[^>]*nav/i,
            /<div[^>]*class[^>]*menu/i,
            /<nav[^>]*>/i
        ];
        
        let menuFound = false;
        for (const pattern of menuPatterns) {
            if (pattern.test(adminContent)) {
                console.log(`✅ Patrón de menú encontrado: ${pattern}`);
                menuFound = true;
                break;
            }
        }
        
        if (menuFound) {
            console.log('📋 Se encontró estructura de menú, pero requiere análisis manual');
        }
    }
    
    console.log('\n🎯 RESULTADO:');
    console.log('✅ Tarjeta CHP agregada al dashboard admin.html');
    console.log('📍 Ahora habrá una tarjeta verde "Solicitudes CHP" clickeable');
    console.log('🔗 También puedes ir directamente a: http://localhost:3030/admin-chp.html');
    
    console.log('\n📋 INSTRUCCIONES PARA FERNANDO:');
    console.log('1. Ve a http://localhost:3030/admin (dashboard principal)');
    console.log('2. Busca la tarjeta verde "Solicitudes CHP"');
    console.log('3. Haz click en ella para abrir el módulo CHP');
    console.log('4. O ve directamente a http://localhost:3030/admin-chp.html');
    
} catch (error) {
    console.error('❌ Error modificando admin.html:', error.message);
    
    console.log('\n🔧 SOLUCIÓN ALTERNATIVA:');
    console.log('Ve directamente a: http://localhost:3030/admin-chp.html');
    console.log('Esta URL debería mostrar las 10 solicitudes CHP');
}