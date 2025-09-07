const fetch = require('node-fetch');

async function testDetallesMejorados() {
    console.log('=== PROBANDO ENDPOINT MEJORADO CON TÍTULOS ===\n');
    
    try {
        // Login como Fernando
        const loginData = {
            dni: '20562024',
            password: 'ansiktet1969'
        };
        
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Error en login');
            return;
        }
        
        const cookies = loginResponse.headers.get('set-cookie');
        
        // Probar con ABAD, CARLOS ADRIAN (debería mostrar "No especificado" para título)
        console.log('1. PROBANDO ABAD, CARLOS ADRIAN (sin título):');
        const detallesResponse1 = await fetch(`http://localhost:3030/api/admin/profesional/7354`, {
            headers: { 'Cookie': cookies }
        });
        
        if (detallesResponse1.ok) {
            const detalles1 = await detallesResponse1.json();
            const prof1 = detalles1.profesional;
            
            console.log(`   ✅ Nombre: ${prof1.nombre}`);
            console.log(`   📋 Estado Civil: ${prof1.estado_civil || 'NULL'}`);
            console.log(`   🌍 Nacionalidad: ${prof1.nacionalidad}`);
            console.log(`   📍 Provincia: ${prof1.provincia}`);
            console.log(`   🎓 Título: ${prof1.titulo_profesional || 'NULL'}`);
            console.log(`   💰 Total pagos: ${prof1.total_pagos}`);
        } else {
            console.log('   ❌ Error obteniendo detalles de ABAD, CARLOS');
        }

        // Buscar un profesional que SÍ tenga título
        console.log('\n2. BUSCANDO PROFESIONAL CON TÍTULO:');
        const profConTituloResponse = await fetch('http://localhost:3030/api/admin/profesionales?buscar=BITTAR&limit=5', {
            headers: { 'Cookie': cookies }
        });
        
        if (profConTituloResponse.ok) {
            const profData = await profConTituloResponse.json();
            
            if (profData.profesionales && profData.profesionales.length > 0) {
                const profConTitulo = profData.profesionales[0];
                console.log(`   Encontrado: ${profConTitulo.nombre} (ID: ${profConTitulo.id})`);
                
                // Probar detalles de este profesional
                const detallesResponse2 = await fetch(`http://localhost:3030/api/admin/profesional/${profConTitulo.id}`, {
                    headers: { 'Cookie': cookies }
                });
                
                if (detallesResponse2.ok) {
                    const detalles2 = await detallesResponse2.json();
                    const prof2 = detalles2.profesional;
                    
                    console.log(`\n3. DETALLES DE ${prof2.nombre}:`);
                    console.log(`   📋 Estado Civil: ${prof2.estado_civil || 'No especificado'}`);
                    console.log(`   🌍 Nacionalidad: ${prof2.nacionalidad || 'No especificado'}`);
                    console.log(`   📍 Provincia: ${prof2.provincia || 'No especificado'}`);
                    console.log(`   🎓 Título: ${prof2.titulo_profesional || 'No especificado'}`);
                    console.log(`   💰 Total pagos: ${prof2.total_pagos}`);
                    console.log(`   💵 Total pagado: $${prof2.total_pagado}`);
                } else {
                    console.log('   ❌ Error obteniendo detalles del profesional con título');
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
    }
    
    console.log('\n=== PRUEBA COMPLETADA ===');
}

testDetallesMejorados();