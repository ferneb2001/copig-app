const http = require('http');

function checkSession(cookie) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3030,
            path: '/api/session-info',
            method: 'GET',
            headers: {
                'Cookie': cookie
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('Session info:', body);
                resolve();
            });
        });
        
        req.end();
    });
}

// Login y verificar sesión
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
                const response = JSON.parse(body);
                console.log('Login response - profesionalId should be set');
                console.log('User data:', response.userData);
                resolve(cookie);
            });
        });
        
        req.write(data);
        req.end();
    });
}

async function test() {
    const cookie = await login();
    await checkSession(cookie);
}

test();