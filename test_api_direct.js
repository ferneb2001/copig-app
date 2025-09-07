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
                console.log('Login response:', JSON.parse(body));
                resolve(cookie);
            });
        });
        
        req.write(data);
        req.end();
    });
}

// Luego obtener solicitudes
function getSolicitudes(cookie) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3030,
            path: '/api/profesional/solicitudes-chp',
            method: 'GET',
            headers: {
                'Cookie': cookie
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('\nAPI Response status:', res.statusCode);
                console.log('API Response body:', body);
                try {
                    const parsed = JSON.parse(body);
                    console.log('\nParsed response:');
                    console.log('- success:', parsed.success);
                    console.log('- solicitudes count:', parsed.solicitudes ? parsed.solicitudes.length : 0);
                    if (parsed.solicitudes && parsed.solicitudes.length > 0) {
                        console.log('- First solicitud:', parsed.solicitudes[0]);
                    }
                } catch (e) {
                    console.log('Could not parse as JSON');
                }
            });
        });
        
        req.end();
    });
}

// Ejecutar
async function test() {
    console.log('Testing API directly...\n');
    const cookie = await login();
    console.log('Cookie obtained:', cookie);
    await getSolicitudes(cookie);
}

test();