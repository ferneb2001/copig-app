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

async function debugDeleteButtonIssue() {
  console.log('🔍 DEBUGGEANDO PROBLEMA DEL BOTÓN ELIMINAR');
  console.log('='.repeat(50));
  
  try {
    // 1. Login
    console.log('\n🔐 Login como profesional...');
    const loginResult = await makeRequest('POST', '/api/unified-login', {
      dni: '99999999',
      password: 'prueba123'
    });
    
    if (loginResult.statusCode === 200 && loginResult.data.success) {
      console.log('✅ Login exitoso');
    } else {
      console.log('❌ Error en login');
      return;
    }
    
    // 2. Obtener solicitudes y analizar estructura de datos
    console.log('\n📋 Obteniendo solicitudes para debuggear...');
    const solicitudesResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
    
    if (solicitudesResult.statusCode === 200 && solicitudesResult.data.success) {
      const solicitudes = solicitudesResult.data.solicitudes;
      console.log(`✅ ${solicitudes.length} solicitudes encontradas`);
      
      if (solicitudes.length > 0) {
        const solicitud = solicitudes[0];
        console.log('\n📊 ANÁLISIS DETALLADO DE LA SOLICITUD:');
        console.log('Raw object:', JSON.stringify(solicitud, null, 2));
        
        console.log('\n🔍 CAMPOS CRÍTICOS PARA EL BOTÓN:');
        console.log('solicitud.estado (raw):', `"${solicitud.estado}"`);
        console.log('typeof solicitud.estado:', typeof solicitud.estado);
        console.log('solicitud.estado === "PENDIENTE":', solicitud.estado === 'PENDIENTE');
        console.log('solicitud.estado.toLowerCase():', solicitud.estado?.toLowerCase());
        console.log('solicitud.estado.trim():', `"${solicitud.estado?.trim()}"`);
        
        console.log('\n🧪 PRUEBAS DE CONDICIÓN:');
        console.log('Condición original (solicitud.estado === "PENDIENTE"):', solicitud.estado === 'PENDIENTE');
        console.log('Condición alternativa (.toUpperCase() === "PENDIENTE"):', solicitud.estado?.toUpperCase() === 'PENDIENTE');
        console.log('Condición alternativa (.toLowerCase() === "pendiente"):', solicitud.estado?.toLowerCase() === 'pendiente');
        
        console.log('\n💡 SIMULACIÓN DE BOTÓN:');
        if (solicitud.estado === 'PENDIENTE') {
          console.log('✅ BOTÓN ELIMINAR debería aparecer');
        } else {
          console.log('❌ BOTÓN NO aparece - Estado:', `"${solicitud.estado}"`);
          console.log('🔧 NECESITA CORRECCIÓN EN CONDICIÓN');
        }
      } else {
        console.log('⚠️ No hay solicitudes para analizar');
      }
    } else {
      console.log('❌ Error obteniendo solicitudes');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDeleteButtonIssue();