const fetch = require('node-fetch');

async function testLoginYSolicitudes() {
    console.log('🧪 Probando login del profesional y visualización de solicitudes...');
    
    try {
        // 1. Login como profesional de prueba
        console.log('\n1. Haciendo login...');
        
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dni: '99999999',
                password: 'prueba123'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Error en login:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login exitoso:', loginData);
        
        // Obtener cookies
        const cookies = loginResponse.headers.raw()['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';
        console.log('🍪 Cookies:', cookieString);

        // 2. Verificar sesión
        console.log('\n2. Verificando sesión...');
        
        const sessionResponse = await fetch('http://localhost:3030/api/session-info', {
            headers: {
                'Cookie': cookieString
            }
        });

        if (sessionResponse.ok) {
            const sessionInfo = await sessionResponse.json();
            console.log('📋 Información de sesión:', JSON.stringify(sessionInfo, null, 2));
        } else {
            console.error('❌ Error obteniendo sesión:', await sessionResponse.text());
        }

        // 3. Obtener solicitudes del profesional
        console.log('\n3. Obteniendo solicitudes...');
        
        const solicitudesResponse = await fetch('http://localhost:3030/api/profesional/solicitudes-chp', {
            headers: {
                'Cookie': cookieString
            }
        });

        if (solicitudesResponse.ok) {
            const solicitudesData = await solicitudesResponse.json();
            console.log('📋 Respuesta del servidor:', JSON.stringify(solicitudesData, null, 2));
            
            if (solicitudesData.success && solicitudesData.solicitudes) {
                console.log(`✅ SE ENCONTRARON ${solicitudesData.solicitudes.length} SOLICITUDES`);
                
                // Mostrar cada solicitud
                solicitudesData.solicitudes.forEach((sol, index) => {
                    console.log(`\n📄 Solicitud ${index + 1}:`);
                    console.log(`  - ID: ${sol.id}`);
                    console.log(`  - Número: ${sol.numero_solicitud}`);
                    console.log(`  - Comitente: ${sol.comitente || 'NO ESPECIFICADO'}`);
                    console.log(`  - Proyecto: ${sol.proyecto || 'NO ESPECIFICADO'}`);
                    console.log(`  - Estado: ${sol.estado}`);
                    console.log(`  - Fecha: ${sol.fecha_solicitud}`);
                });
                
            } else {
                console.log('❌ No se encontraron solicitudes o respuesta inválida');
            }
        } else {
            console.error('❌ Error obteniendo solicitudes:', await solicitudesResponse.text());
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testLoginYSolicitudes();