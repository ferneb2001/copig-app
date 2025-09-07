const fetch = require('node-fetch');

async function debugCHPSolicitudes() {
    console.log('🔍 Debugeando problema solicitudes CHP no visibles...');
    
    try {
        // 1. Hacer login como profesional de prueba
        console.log('\n1. Intentando login como profesional de prueba...');
        
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: '99999999',
                password: 'prueba123'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Error en login:', await loginResponse.text());
            return;
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login exitoso:', loginData);
        
        // Obtener cookies de sesión
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('🍪 Cookies obtenidas:', cookies);

        // 2. Verificar sesión actual
        console.log('\n2. Verificando información de sesión...');
        
        const sessionResponse = await fetch('http://localhost:3030/api/session-info', {
            headers: {
                'Cookie': cookies
            }
        });

        if (sessionResponse.ok) {
            const sessionInfo = await sessionResponse.json();
            console.log('📋 Información de sesión:', JSON.stringify(sessionInfo, null, 2));
        }

        // 3. Crear una nueva solicitud CHP
        console.log('\n3. Creando nueva solicitud CHP...');
        
        const createResponse = await fetch('http://localhost:3030/api/chp/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            },
            body: JSON.stringify({
                cliente: 'EMPRESA DEBUG TEST',
                proyecto: 'Proyecto de debug para testing',
                descripcion: 'Descripción de prueba para verificar funcionamiento',
                ubicacion_obra: 'Mendoza, Argentina'
            })
        });

        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ Solicitud CHP creada:', createData);
        } else {
            console.error('❌ Error creando solicitud:', await createResponse.text());
        }

        // 4. Intentar obtener solicitudes del profesional
        console.log('\n4. Obteniendo solicitudes del profesional...');
        
        const getSolicitudesResponse = await fetch('http://localhost:3030/api/profesional/solicitudes-chp', {
            headers: {
                'Cookie': cookies
            }
        });

        if (getSolicitudesResponse.ok) {
            const solicitudesData = await getSolicitudesResponse.json();
            console.log('📋 Solicitudes obtenidas:', JSON.stringify(solicitudesData, null, 2));
            
            if (solicitudesData.success && solicitudesData.solicitudes && solicitudesData.solicitudes.length > 0) {
                console.log('✅ PROBLEMA RESUELTO: Solicitudes visibles');
            } else {
                console.log('❌ PROBLEMA PERSISTE: Sin solicitudes visibles');
            }
        } else {
            console.error('❌ Error obteniendo solicitudes:', await getSolicitudesResponse.text());
        }

        // 5. Verificar directamente en base de datos
        console.log('\n5. Verificando directamente en base de datos...');
        
        const { Pool } = require('pg');
        const config = require('./config.json');
        
        const pool = new Pool(config.database);
        
        const dbResult = await pool.query('SELECT * FROM copig.solicitudes_chp ORDER BY fecha_solicitud DESC LIMIT 5');
        console.log('📊 Últimas 5 solicitudes en BD:', dbResult.rows);
        
        // Verificar si hay solicitudes para el profesional de prueba (ID 10752)
        const profesionalResult = await pool.query('SELECT * FROM copig.solicitudes_chp WHERE profesional_id = $1', [10752]);
        console.log('👤 Solicitudes del profesional de prueba (ID 10752):', profesionalResult.rows);
        
        await pool.end();

    } catch (error) {
        console.error('💥 Error durante debug:', error);
    }
}

debugCHPSolicitudes();