const http = require('http');

let sessionCookie = '';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3030,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie && { 'Cookie': sessionCookie }),
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
      }
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testDeleteButtonFixed() {
  console.log('🧪 PROBANDO BOTÓN ELIMINAR CORREGIDO');
  console.log('='.repeat(50));
  
  try {
    // 1. Login
    console.log('\n🔐 Login como profesional...');
    const loginResult = await makeRequest('POST', '/api/unified-login', {
      dni: '99999999',
      password: 'prueba123'
    });
    
    if (loginResult.statusCode !== 200 || !loginResult.data.success) {
      console.log('❌ Error en login');
      return;
    }
    console.log('✅ Login exitoso');
    
    // 2. Obtener solicitudes
    const solicitudesResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
    
    if (solicitudesResult.statusCode === 200 && solicitudesResult.data.success) {
      const solicitudes = solicitudesResult.data.solicitudes;
      console.log(`✅ ${solicitudes.length} solicitudes encontradas`);
      
      if (solicitudes.length > 0) {
        const solicitud = solicitudes[0];
        console.log('\n📊 ANÁLISIS POST-CORRECCIÓN:');
        console.log('Número solicitud:', solicitud.numero_solicitud);
        console.log('Estado (raw):', `"${solicitud.estado}"`);
        
        // Simular transformación del frontend
        const estadoProcessed = solicitud.estado ? solicitud.estado.toLowerCase() : 'pendiente';
        console.log('Estado procesado (frontend):', `"${estadoProcessed}"`);
        console.log('Condición botón (estadoProcessed === "pendiente"):', estadoProcessed === 'pendiente');
        
        if (estadoProcessed === 'pendiente') {
          console.log('✅ ¡BOTÓN ELIMINAR DEBERÍA APARECER AHORA!');
        } else {
          console.log('❌ Botón aún no aparecería - Estado:', estadoProcessed);
        }
      }
    }
    
    console.log('\n🌐 INSTRUCCIONES PARA FERNANDO:');
    console.log('1. Refrescar la página: http://localhost:3030/');
    console.log('2. Login con DNI: 99999999 / Contraseña: prueba123');
    console.log('3. Ir a "📋 Mis Solicitudes"');
    console.log('4. ¡Ahora debería ver el botón "🗑️ Eliminar"!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDeleteButtonFixed();