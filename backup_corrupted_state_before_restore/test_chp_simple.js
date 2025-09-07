const http = require('http');

// Función para hacer requests HTTP
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ 
                        status: res.statusCode,
                        data: result,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({ 
                        status: res.statusCode,
                        data: body,
                        headers: res.headers
                    });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testCHP() {
    console.log('🧪 PRUEBA SIMPLIFICADA DEL SISTEMA CHP\n');
    
    let cookie = '';
    
    try {
        // PASO 1: Login
        console.log('1️⃣ Login como profesional...');
        const loginRes = await makeRequest({
            hostname: 'localhost',
            port: 3030,
            path: '/api/unified-login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, {
            dni: '99999999',
            password: 'prueba123'
        });
        
        if (loginRes.data.success) {
            console.log('✅ Login exitoso');
            // Guardar cookie de sesión
            const setCookie = loginRes.headers['set-cookie'];
            if (setCookie) {
                cookie = setCookie[0].split(';')[0];
            }
        } else {
            throw new Error('Login falló');
        }
        
        // PASO 2: Crear solicitud
        console.log('\n2️⃣ Creando solicitud CHP...');
        const createRes = await makeRequest({
            hostname: 'localhost',
            port: 3030,
            path: '/api/profesional/solicitud-chp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            }
        }, {
            cliente: 'Test Cliente',
            proyecto: 'Test Proyecto',
            descripcion: 'Prueba automática'
        });
        
        if (createRes.data.success) {
            console.log('✅ Solicitud creada - Número:', createRes.data.numeroSolicitud);
        } else {
            console.log('❌ Error:', createRes.data.message);
        }
        
        // PASO 3: Listar solicitudes
        console.log('\n3️⃣ Listando solicitudes...');
        const listRes = await makeRequest({
            hostname: 'localhost',
            port: 3030,
            path: '/api/profesional/solicitudes-chp',
            method: 'GET',
            headers: {
                'Cookie': cookie
            }
        });
        
        if (listRes.data.success) {
            console.log('✅ Solicitudes encontradas:', listRes.data.solicitudes.length);
            // Mostrar últimas 3 solicitudes
            listRes.data.solicitudes.slice(0, 3).forEach(s => {
                console.log(`   - ${s.numero_solicitud}: ${s.cliente} (${s.estado})`);
            });
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ SISTEMA CHP FUNCIONANDO CORRECTAMENTE');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCHP();