const fetch = require('node-fetch'); // Si no tienes node-fetch, usar otro método

async function testLiveEndpoint() {
    console.log('🔍 PROBANDO ENDPOINT EN VIVO');
    console.log('='.repeat(50));
    
    try {
        // Probar endpoint del servidor en vivo
        console.log('📡 Llamando: http://localhost:3030/api/admin/profesional/7354');
        
        const response = await fetch('http://localhost:3030/api/admin/profesional/7354', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'connect.sid=your-session-id' // Esto necesitaría la cookie real
            }
        });
        
        console.log('📊 Status:', response.status);
        
        if (response.status === 401) {
            console.log('🔒 Endpoint requiere autenticación');
            console.log('💡 Esto es normal - el endpoint está protegido');
            return;
        }
        
        const data = await response.json();
        console.log('📋 RESPUESTA DEL SERVIDOR:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.success && data.profesional) {
            console.log('\n🎯 ANÁLISIS DE LA RESPUESTA:');
            console.log(`   Nombre: ${data.profesional.nombre}`);
            console.log(`   estado_matricula: "${data.profesional.estado_matricula}"`);
            console.log(`   titulo_profesional: "${data.profesional.titulo_profesional}"`);
            console.log(`   total_pagado: $${data.profesional.total_pagado}`);
            
            if (data.profesional.estado_matricula === 'MOROSO') {
                console.log('✅ Estado correcto: MOROSO');
            } else {
                console.log(`❌ Estado incorrecto: ${data.profesional.estado_matricula} (debería ser MOROSO)`);
            }
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('💡 Esto es normal si no tienes node-fetch instalado');
        console.log('💡 O si el endpoint requiere autenticación');
    }
}

testLiveEndpoint();