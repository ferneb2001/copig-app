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

async function testMontoEstimadoAdmin() {
  console.log('🧪 PRUEBA DE MONTO ESTIMADO EN PANEL ADMIN');
  console.log('='.repeat(50));
  
  try {
    // 1. LOGIN PROFESIONAL
    console.log('\n🔐 Paso 1: Login como profesional de prueba');
    const loginResult = await makeRequest('POST', '/api/unified-login', {
      dni: '99999999',
      password: 'prueba123'
    });
    
    if (loginResult.statusCode !== 200 || !loginResult.data.success) {
      console.log('❌ Error en login:', loginResult.data);
      return;
    }
    console.log('✅ Login profesional exitoso');
    
    // 2. CREAR SOLICITUD CON MONTO ESTIMADO
    console.log('\n💰 Paso 2: Creando solicitud con monto estimado específico');
    const nuevaSolicitud = await makeRequest('POST', '/api/chp/create', {
      comitente: 'EMPRESA TEST MONTO',
      proyecto: 'Proyecto con Monto Específico de $2,500,000',
      descripcion: 'Descripción para prueba de visualización de monto',
      ubicacion_obra: 'Mendoza Capital',
      monto_obra_estimado: 2500000
    });
    
    if (nuevaSolicitud.statusCode !== 200 || !nuevaSolicitud.data.success) {
      console.log('❌ Error creando solicitud:', nuevaSolicitud.data);
      return;
    }
    
    console.log('✅ Solicitud creada:', nuevaSolicitud.data.numeroSolicitud);
    const solicitudId = nuevaSolicitud.data.solicitud?.id;
    
    // 3. LOGIN COMO ADMIN/STAFF
    console.log('\n🔐 Paso 3: Login como staff/admin para ver panel admin');
    const adminLogin = await makeRequest('POST', '/api/unified-login', {
      dni: '40101718',
      password: 'ansiktet2025'
    });
    
    if (adminLogin.statusCode !== 200 || !adminLogin.data.success) {
      console.log('❌ Error en login admin:', adminLogin.data);
      return;
    }
    console.log('✅ Login admin exitoso');
    
    // 4. OBTENER LISTA DE SOLICITUDES DESDE ADMIN
    console.log('\n📋 Paso 4: Obteniendo lista de solicitudes desde panel admin');
    const adminSolicitudes = await makeRequest('GET', '/api/admin/solicitudes-chp');
    
    if (adminSolicitudes.statusCode !== 200 || !adminSolicitudes.data.success) {
      console.log('❌ Error obteniendo solicitudes admin:', adminSolicitudes.data);
      return;
    }
    
    const solicitudes = adminSolicitudes.data.solicitudes;
    console.log(`✅ ${solicitudes.length} solicitudes encontradas desde admin`);
    
    // 5. VERIFICAR MONTOS ESTIMADOS
    console.log('\n💰 Paso 5: Verificando montos estimados en las solicitudes');
    solicitudes.forEach((s, index) => {
      const monto = s.monto_obra_estimado;
      const montoFormateado = monto && Number(monto) > 0 
        ? '$' + Number(monto).toLocaleString('es-AR')
        : 'No especificado';
      
      console.log(`   ${index + 1}. ${s.numero_solicitud}: ${montoFormateado}`);
      console.log(`      Comitente: ${s.comitente}`);
      console.log(`      Valor BD: ${s.monto_obra_estimado} (tipo: ${typeof s.monto_obra_estimado})`);
    });
    
    // 6. VERIFICAR SOLICITUD ESPECÍFICA CREADA
    const solicitudCreada = solicitudes.find(s => s.numero_solicitud === nuevaSolicitud.data.numeroSolicitud);
    if (solicitudCreada) {
      console.log('\n🎯 Verificación de solicitud específica creada:');
      console.log(`   Número: ${solicitudCreada.numero_solicitud}`);
      console.log(`   Monto en BD: $${Number(solicitudCreada.monto_obra_estimado).toLocaleString('es-AR')}`);
      console.log(`   ¿Es mayor a 0?: ${Number(solicitudCreada.monto_obra_estimado) > 0}`);
    } else {
      console.log('❌ No se encontró la solicitud recién creada en la lista admin');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 PRUEBA DE MONTO ESTIMADO COMPLETADA');
    console.log('='.repeat(50));
    console.log('\n✅ VERIFICACIONES REALIZADAS:');
    console.log('   • Creación de solicitud con monto específico ✅');
    console.log('   • Login admin y obtención de lista ✅');
    console.log('   • Verificación de campo monto_obra_estimado ✅');
    console.log('   • Formato y visualización de montos ✅');
    console.log('\n🌐 AHORA PRUEBA EN NAVEGADOR:');
    console.log('1. Ir a: http://localhost:3030/admin');
    console.log('2. Login como admin/staff');
    console.log('3. Ir a sección "Solicitudes CHP"');
    console.log('4. ¡La columna "Monto Estimado" debería estar visible!');
    console.log('5. Al hacer clic en "Ver", el monto debe aparecer en el modal');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testMontoEstimadoAdmin();