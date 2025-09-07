const http = require('http');

// Primero hacer login
function login() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            dni: '99999999',
            password: 'prueba123'
        });
        
        const req = http.request({
            hostname: 'localhost',
            port: 3030,
            path: '/api/unified-login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let cookie = '';
            if (res.headers['set-cookie']) {
                cookie = res.headers['set-cookie'][0].split(';')[0];
            }
            
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('✅ Login exitoso');
                resolve(cookie);
            });
        });
        
        req.write(data);
        req.end();
    });
}

// Crear solicitud
function createSolicitud(cookie) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            cliente: 'Cliente de Prueba Fernando',
            proyecto: 'Proyecto de Test',
            descripcion: 'Descripción de prueba para verificar el sistema'
        });
        
        const req = http.request({
            hostname: 'localhost',
            port: 3030,
            path: '/api/profesional/solicitud-chp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Cookie': cookie
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('\n📍 Response status:', res.statusCode);
                console.log('📍 Response body:', body);
                
                try {
                    const parsed = JSON.parse(body);
                    if (parsed.success) {
                        console.log('\n✅ SOLICITUD CREADA EXITOSAMENTE');
                        console.log('   Número:', parsed.numeroSolicitud);
                        console.log('   ID:', parsed.solicitud?.id);
                    } else {
                        console.log('\n❌ ERROR:', parsed.message);
                    }
                } catch (e) {
                    console.log('❌ Error parseando respuesta:', e.message);
                }
            });
        });
        
        req.on('error', (e) => {
            console.error('❌ Error en request:', e);
        });
        
        req.write(data);
        req.end();
    });
}

// Ejecutar
async function test() {
    console.log('🧪 Probando creación de solicitud CHP...\n');
    const cookie = await login();
    await createSolicitud(cookie);
}

test();