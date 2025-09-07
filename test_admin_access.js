const fetch = require('node-fetch');

async function testAdminAccess() {
    console.log('=== PROBANDO ACCESO Y CORRECCIONES DEL PANEL ADMIN ===\n');
    
    try {
        // 1. Verificar que el servidor responde
        console.log('1. Verificando servidor...');
        const serverCheck = await fetch('http://localhost:3030/');
        console.log(`   ✅ Servidor responde: ${serverCheck.status}`);
        
        // 2. Verificar panel admin carga
        console.log('\n2. Verificando panel admin...');
        const adminCheck = await fetch('http://localhost:3030/admin');
        console.log(`   ✅ Panel admin responde: ${adminCheck.status}`);
        
        // 3. Intentar acceso a API (sin login - esperamos 401/403)
        console.log('\n3. Probando API profesionales (sin auth)...');
        const apiCheck = await fetch('http://localhost:3030/api/admin/profesionales');
        console.log(`   📋 API profesionales: ${apiCheck.status} (${apiCheck.status === 401 || apiCheck.status === 403 ? 'Correcto - requiere auth' : 'Revisar'})`);
        
        // 4. Simular login como superadmin Fernando
        console.log('\n4. Simulando login de Fernando (superadmin)...');
        const loginData = {
            dni: '40101718',
            password: 'ansiktet2025'
        };
        
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        console.log(`   🔑 Login response: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            console.log(`   ✅ Login exitoso: ${loginResult.success}`);
            console.log(`   👤 Usuario: ${loginResult.user?.nombre || 'Fernando Nebro'}`);
            console.log(`   🎭 Tipo: ${loginResult.userType}`);
            
            // Extraer cookies de sesión
            const cookies = loginResponse.headers.get('set-cookie');
            console.log(`   🍪 Cookies: ${cookies ? 'Obtenidas' : 'No obtenidas'}`);
            
            if (cookies) {
                // 5. Probar API con sesión
                console.log('\n5. Probando API con sesión activa...');
                const authApiResponse = await fetch('http://localhost:3030/api/admin/profesionales?limit=3', {
                    headers: { 
                        'Cookie': cookies,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`   📊 API con auth: ${authApiResponse.status}`);
                
                if (authApiResponse.ok) {
                    const data = await authApiResponse.json();
                    console.log(`   ✅ Profesionales obtenidos: ${data.profesionales?.length || 0}`);
                    
                    if (data.profesionales && data.profesionales.length > 0) {
                        console.log('\n📋 PRIMEROS 3 PROFESIONALES CON DATOS DE PAGOS:');
                        data.profesionales.forEach((prof, index) => {
                            console.log(`\n${index + 1}. ${prof.nombre}`);
                            console.log(`   DNI: ${prof.dni}`);
                            console.log(`   Matrícula: ${prof.matricula}`);
                            console.log(`   ⭐ Último pago: ${prof.ultimo_pago}`);
                            console.log(`   Estado: ${prof.activo ? 'Activo' : 'Inactivo'}`);
                        });
                        
                        // 6. Probar endpoint de detalles
                        const primerProfId = data.profesionales[0].id;
                        console.log(`\n6. Probando detalles del profesional ID ${primerProfId}...`);
                        
                        const detallesResponse = await fetch(`http://localhost:3030/api/admin/profesional/${primerProfId}`, {
                            headers: { 
                                'Cookie': cookies,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        console.log(`   🔍 Detalles response: ${detallesResponse.status}`);
                        
                        if (detallesResponse.ok) {
                            const detalles = await detallesResponse.json();
                            console.log(`   ✅ Detalles obtenidos para: ${detalles.profesional?.nombre}`);
                            console.log(`   💰 Total pagos: ${detalles.profesional?.total_pagos}`);
                            console.log(`   💵 Total pagado: $${detalles.profesional?.total_pagado}`);
                            console.log(`   📅 Último pago: ${detalles.profesional?.ultimo_pago}`);
                            console.log(`   📋 Pagos recientes: ${detalles.pagos_recientes?.length || 0} registros`);
                        } else {
                            const error = await detallesResponse.text();
                            console.log(`   ❌ Error en detalles: ${error}`);
                        }
                    }
                } else {
                    const error = await authApiResponse.text();
                    console.log(`   ❌ Error en API: ${error}`);
                }
            }
        } else {
            const error = await loginResponse.text();
            console.log(`   ❌ Error en login: ${error}`);
        }
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
    
    console.log('\n=== PRUEBAS COMPLETADAS ===');
}

testAdminAccess();