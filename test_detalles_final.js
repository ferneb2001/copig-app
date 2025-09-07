const fetch = require('node-fetch');

async function testDetallesFinal() {
    console.log('=== PRUEBA FINAL - DETALLES DE PROFESIONAL ===\n');
    
    try {
        // Login como Fernando
        const loginData = {
            dni: '40101718',
            password: 'ansiktet2025'
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
        
        // Obtener primer profesional
        const profResponse = await fetch('http://localhost:3030/api/admin/profesionales?limit=1', {
            headers: { 'Cookie': cookies }
        });
        
        const profData = await profResponse.json();
        const primerProf = profData.profesionales[0];
        
        console.log(`🧪 Probando detalles de: ${primerProf.nombre} (ID: ${primerProf.id})`);
        
        // Probar endpoint de detalles
        const detallesResponse = await fetch(`http://localhost:3030/api/admin/profesional/${primerProf.id}`, {
            headers: { 'Cookie': cookies }
        });
        
        console.log(`📊 Status detalles: ${detallesResponse.status}`);
        
        if (detallesResponse.ok) {
            const detalles = await detallesResponse.json();
            console.log('\n✅ DETALLES OBTENIDOS EXITOSAMENTE:');
            console.log(`👤 Nombre: ${detalles.profesional?.nombre}`);
            console.log(`📋 DNI: ${detalles.profesional?.dni}`);
            console.log(`🎫 Matrícula: ${detalles.profesional?.numero_matricula}`);
            console.log(`💰 Total pagos: ${detalles.profesional?.total_pagos}`);
            console.log(`💵 Total pagado: $${detalles.profesional?.total_pagado}`);
            console.log(`📅 Último pago: ${detalles.profesional?.ultimo_pago}`);
            console.log(`📋 Pagos recientes: ${detalles.pagos_recientes?.length || 0} registros`);
            
            if (detalles.pagos_recientes && detalles.pagos_recientes.length > 0) {
                console.log('\n💳 ÚLTIMOS 3 PAGOS:');
                detalles.pagos_recientes.slice(0, 3).forEach((pago, index) => {
                    console.log(`${index + 1}. ${pago.fecha_pago} - $${pago.importe} (${pago.concepto || pago.detalle})`);
                });
            }
        } else {
            const error = await detallesResponse.text();
            console.log(`❌ Error: ${error}`);
        }
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
    }
    
    console.log('\n=== PRUEBA COMPLETADA ===');
}

testDetallesFinal();