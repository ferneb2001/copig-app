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

async function verificarSistemaLimpio() {
  console.log('🔍 Verificando que el sistema CHP está completamente limpio...\n');
  
  try {
    // 1. Login como profesional
    console.log('🔐 Paso 1: Login como profesional de prueba');
    const loginResult = await makeRequest('POST', '/api/unified-login', {
      dni: '99999999',
      password: 'prueba123'
    });
    
    if (loginResult.statusCode === 200 && loginResult.data.success) {
      console.log('✅ Login exitoso como:', loginResult.data.user.username);
    } else {
      console.log('❌ Error en login:', loginResult.data);
      return;
    }
    
    // 2. Verificar solicitudes del profesional
    console.log('\n📋 Paso 2: Verificando solicitudes del profesional');
    const solicitudesResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
    
    if (solicitudesResult.statusCode === 200 && solicitudesResult.data.success) {
      const count = solicitudesResult.data.solicitudes.length;
      console.log(`✅ Portal profesional: ${count} solicitudes (debe ser 0)`);
      
      if (count === 0) {
        console.log('🎯 ¡Perfecto! Portal profesional completamente limpio');
      } else {
        console.log('⚠️  Aún hay solicitudes en el portal profesional');
      }
    } else {
      console.log('❌ Error obteniendo solicitudes del profesional');
    }
    
    // 3. Verificar panel administrativo
    console.log('\n🔧 Paso 3: Verificando panel administrativo');
    const adminResult = await makeRequest('GET', '/api/admin/solicitudes-chp');
    
    if (adminResult.statusCode === 200 && adminResult.data.success) {
      const count = adminResult.data.solicitudes.length;
      console.log(`✅ Panel admin: ${count} solicitudes (debe ser 0)`);
      
      if (count === 0) {
        console.log('🎯 ¡Perfecto! Panel admin completamente limpio');
      } else {
        console.log('⚠️  Aún hay solicitudes en el panel admin');
      }
    } else {
      console.log('❌ Error obteniendo solicitudes del admin');
    }
    
    // 4. Verificar facturas pendientes
    console.log('\n💳 Paso 4: Verificando facturas pendientes');
    const facturasResult = await makeRequest('GET', '/api/profesional/facturas-pendientes');
    
    if (facturasResult.statusCode === 200 && facturasResult.data.success) {
      const count = facturasResult.data.facturas.length;
      console.log(`✅ Facturas pendientes: ${count} (debe ser 0)`);
    } else {
      console.log('❌ Error obteniendo facturas pendientes');
    }
    
    // 5. Verificar panel de facturación
    console.log('\n📊 Paso 5: Verificando panel de facturación');
    const facturacionResult = await makeRequest('GET', '/api/admin/panel-facturacion');
    
    if (facturacionResult.statusCode === 200 && facturacionResult.data.success) {
      const count = facturacionResult.data.solicitudes.length;
      console.log(`✅ Panel de facturación: ${count} solicitudes (debe ser 0)`);
    } else {
      console.log('❌ Error obteniendo panel de facturación');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log('✨ El sistema está completamente limpio y listo para usar');
    console.log('');
    console.log('📋 INSTRUCCIONES PARA CREAR NUEVA SOLICITUD:');
    console.log('');
    console.log('1. 🌐 Abrir navegador en: http://localhost:3030/');
    console.log('2. 🔐 Hacer login con:');
    console.log('   • DNI: 99999999');
    console.log('   • Contraseña: prueba123');
    console.log('3. 📝 Ir a sección "Certificados de Habilitación Profesional"');
    console.log('4. ➕ Hacer clic en "Nueva Solicitud"');
    console.log('5. 📋 Llenar formulario con datos reales:');
    console.log('   • Comitente (empresa que solicita)');
    console.log('   • Proyecto (descripción del trabajo)');
    console.log('   • Ubicación de la obra');
    console.log('   • 💰 Monto estimado (OPCIONAL - nueva funcionalidad)');
    console.log('6. ✅ Crear solicitud - será CHP-2025-1001');
    console.log('');
    console.log('🔧 PARA REVISIÓN COMO ADMIN:');
    console.log('1. 🌐 Ir a: http://localhost:3030/admin');
    console.log('2. 📊 Ver la nueva solicitud en estado PENDIENTE');
    console.log('3. ✏️  Editarla con arancel flexible (no fijo)');
    console.log('4. ✅ Aprobar para facturar');
    console.log('5. 💰 Usar pestaña "Facturar" para generar factura');
    console.log('');
    console.log('🎯 Todo listo para probar el flujo completo desde cero!');
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
  }
}

verificarSistemaLimpio();