const fetch = require('node-fetch');

async function testFechasCorregidas() {
    console.log('=== PROBANDO FECHAS CORREGIDAS ===\n');
    
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
        
        // Probar ABAURRE,HUGO ANIBAL que tenía fechas inválidas
        console.log('PROBANDO DETALLES DE ABAURRE,HUGO ANIBAL:');
        
        // Primero buscar por nombre para obtener su ID
        const searchResponse = await fetch('http://localhost:3030/api/admin/profesionales?buscar=ABAURRE,HUGO', {
            headers: { 'Cookie': cookies }
        });
        
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            
            if (searchData.profesionales && searchData.profesionales.length > 0) {
                const prof = searchData.profesionales[0];
                console.log(`✅ Encontrado: ${prof.nombre} (ID: ${prof.id})`);
                
                // Obtener detalles
                const detallesResponse = await fetch(`http://localhost:3030/api/admin/profesional/${prof.id}`, {
                    headers: { 'Cookie': cookies }
                });
                
                if (detallesResponse.ok) {
                    const detalles = await detallesResponse.json();
                    
                    console.log('\n📋 DATOS DEL PROFESIONAL:');
                    console.log(`   Nombre: ${detalles.profesional.nombre}`);
                    console.log(`   Total pagos: ${detalles.profesional.total_pagos}`);
                    console.log(`   Total pagado: $${detalles.profesional.total_pagado}`);
                    console.log(`   Último pago: ${detalles.profesional.ultimo_pago}`);
                    
                    console.log('\n💳 PAGOS RECIENTES:');
                    if (detalles.pagos_recientes && detalles.pagos_recientes.length > 0) {
                        detalles.pagos_recientes.forEach((pago, index) => {
                            console.log(`   ${index + 1}. Fecha: ${pago.fecha_pago} | Monto: $${pago.importe} | Concepto: ${pago.concepto || pago.detalle || 'Sin concepto'}`);
                        });
                    } else {
                        console.log('   No hay pagos recientes');
                    }
                    
                    // Verificar si hay fechas "Invalid Date" 
                    const hasInvalidDates = detalles.pagos_recientes.some(pago => 
                        pago.fecha_pago.includes('Invalid') || pago.fecha_pago === 'NaN'
                    );
                    
                    if (hasInvalidDates) {
                        console.log('\n❌ TODAVÍA HAY FECHAS INVÁLIDAS');
                    } else {
                        console.log('\n✅ TODAS LAS FECHAS SON VÁLIDAS');
                    }
                    
                } else {
                    console.log('❌ Error obteniendo detalles');
                }
            } else {
                console.log('❌ Profesional no encontrado');
            }
        } else {
            console.log('❌ Error en búsqueda');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFechasCorregidas();