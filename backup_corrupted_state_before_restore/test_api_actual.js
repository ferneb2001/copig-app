const fetch = require('node-fetch');

async function testAPIActual() {
    try {
        console.log('🔍 PROBANDO API ACTUAL SIN REINICIAR SERVIDOR\n');
        
        // Hacer petición directa al endpoint
        console.log('📡 Haciendo petición a: http://localhost:3030/api/admin/profesionales?page=1');
        
        const response = await fetch('http://localhost:3030/api/admin/profesionales?page=1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            console.log('❌ Error 401: No autorizado - Necesita login de admin');
            console.log('   💡 Esto es normal, la API requiere autenticación');
            return;
        }
        
        const data = await response.json();
        console.log(`📊 Status: ${response.status}`);
        
        if (data.profesionales && data.profesionales.length > 0) {
            console.log(`✅ Encontrados: ${data.profesionales.length} profesionales`);
            
            // Verificar si tiene fecha_inscripcion
            const primer = data.profesionales[0];
            console.log('\n🔍 Estructura del primer profesional:');
            Object.keys(primer).forEach(key => {
                console.log(`   ${key}: ${primer[key]}`);
            });
            
            const tienenFecha = data.profesionales.filter(p => p.fecha_inscripcion).length;
            console.log(`\n📅 Profesionales CON fecha_inscripcion: ${tienenFecha}/${data.profesionales.length}`);
            
            if (tienenFecha > 0) {
                console.log('✅ La API YA está devolviendo fechas - El problema debe ser en el frontend');
            } else {
                console.log('❌ La API NO está devolviendo fechas - Necesita reiniciar servidor');
            }
        } else {
            console.log('❌ No se encontraron profesionales en la respuesta');
            console.log('Respuesta completa:', data);
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ No se pudo conectar al servidor en puerto 3030');
            console.log('   💡 ¿Está corriendo el servidor?');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testAPIActual().catch(console.error);