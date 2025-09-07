const http = require('http');
const querystring = require('querystring');

// Configuración de prueba
const BASE_URL = 'http://localhost:3030';
const TEST_USER = {
  dni: '99999999',
  password: 'prueba123'
};

let sessionCookie = '';

// Función helper para hacer requests HTTP
function makeRequest(method, path, data = null, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const postData = data ? (contentType === 'application/json' ? JSON.stringify(data) : querystring.stringify(data)) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3030,
      path: path,
      method: method,
      headers: {
        'Content-Type': contentType,
        ...(sessionCookie && { 'Cookie': sessionCookie }),
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      // Capturar cookie de sesión
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
      }
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testCompleteWorkflow() {
  console.log('🧪 INICIANDO PRUEBA COMPLETA DEL FLUJO CHP');
  console.log('=' .repeat(60));

  let testResults = {
    success: 0,
    failed: 0,
    errors: []
  };

  try {
    // 1. PRUEBA DE LOGIN PROFESIONAL
    console.log('\n🔐 Paso 1: Login del profesional');
    const loginResult = await makeRequest('POST', '/api/unified-login', TEST_USER);
    
    if (loginResult.statusCode === 200 && loginResult.data.success) {
      console.log('✅ Login exitoso:', loginResult.data.user.username);
      testResults.success++;
    } else {
      console.log('❌ Error en login:', loginResult.data);
      testResults.failed++;
      testResults.errors.push('Login profesional falló');
    }

    // 2. CREAR NUEVA SOLICITUD CHP
    console.log('\n📝 Paso 2: Creando nueva solicitud CHP');
    const nuevaSolicitud = {
      comitente: 'EMPRESA PRUEBA TEST S.A.',
      proyecto: 'Sistema de Gestión Integral - Prueba Completa',
      descripcion: 'Proyecto de prueba para validar el flujo completo del sistema CHP con facturación y pagos.',
      ubicacion_obra: 'Mendoza, Argentina - Ciudad',
      monto_obra_estimado: 2500000.50
    };

    const solicitudResult = await makeRequest('POST', '/api/chp/create', nuevaSolicitud);
    
    if (solicitudResult.statusCode === 200 && solicitudResult.data.success) {
      console.log('✅ Solicitud creada:', solicitudResult.data.solicitud.numero_solicitud);
      console.log('   💰 Monto estimado: $', solicitudResult.data.solicitud.monto_obra_estimado);
      testResults.success++;
    } else {
      console.log('❌ Error creando solicitud:', solicitudResult.data);
      testResults.failed++;
      testResults.errors.push('Creación de solicitud falló');
    }

    // 3. LISTAR SOLICITUDES DEL PROFESIONAL
    console.log('\n📋 Paso 3: Listando solicitudes del profesional');
    const listResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
    
    if (listResult.statusCode === 200 && listResult.data.success) {
      console.log(`✅ ${listResult.data.solicitudes.length} solicitudes encontradas`);
      
      if (listResult.data.solicitudes.length > 0) {
        const ultimaSolicitud = listResult.data.solicitudes[0];
        console.log('   📄 Última solicitud:', ultimaSolicitud.numero_solicitud);
        console.log('   📊 Estado:', ultimaSolicitud.estado);
        console.log('   🏢 Comitente:', ultimaSolicitud.comitente);
        console.log('   💡 Monto estimado:', ultimaSolicitud.monto_obra_estimado || 'No informado');
      }
      testResults.success++;
    } else {
      console.log('❌ Error listando solicitudes:', listResult.data);
      testResults.failed++;
      testResults.errors.push('Listado de solicitudes falló');
    }

    // 4. VERIFICAR FACTURAS PENDIENTES
    console.log('\n💳 Paso 4: Verificando facturas pendientes');
    const facturasResult = await makeRequest('GET', '/api/profesional/facturas-pendientes');
    
    if (facturasResult.statusCode === 200) {
      console.log(`✅ ${facturasResult.data.facturas?.length || 0} facturas pendientes`);
      testResults.success++;
    } else {
      console.log('❌ Error obteniendo facturas:', facturasResult.data);
      testResults.failed++;
      testResults.errors.push('Obtención de facturas falló');
    }

    // 5. VERIFICAR HISTORIAL DE PAGOS
    console.log('\n💰 Paso 5: Verificando historial de pagos');
    const historialResult = await makeRequest('GET', '/api/profesional/historial-pagos');
    
    if (historialResult.statusCode === 200) {
      console.log(`✅ ${historialResult.data.pagos?.length || 0} registros en historial de pagos`);
      testResults.success++;
    } else {
      console.log('❌ Error obteniendo historial:', historialResult.data);
      testResults.failed++;
      testResults.errors.push('Historial de pagos falló');
    }

    // 6. VERIFICAR PANEL ADMIN (endpoints disponibles)
    console.log('\n🔧 Paso 6: Verificando endpoints administrativos');
    const adminSolicitudesResult = await makeRequest('GET', '/api/admin/solicitudes-chp');
    
    if (adminSolicitudesResult.statusCode === 200) {
      console.log(`✅ Panel admin: ${adminSolicitudesResult.data.solicitudes?.length || 0} solicitudes visibles`);
      testResults.success++;
    } else {
      console.log('❌ Error en panel admin:', adminSolicitudesResult.data);
      testResults.failed++;
      testResults.errors.push('Panel administrativo falló');
    }

    // 7. VERIFICAR PANEL DE FACTURACIÓN ADMIN
    console.log('\n📊 Paso 7: Verificando panel de facturación');
    const facturacionResult = await makeRequest('GET', '/api/admin/panel-facturacion');
    
    if (facturacionResult.statusCode === 200) {
      console.log(`✅ Panel facturación: ${facturacionResult.data.solicitudes?.length || 0} solicitudes`);
      testResults.success++;
    } else {
      console.log('❌ Error en panel de facturación:', facturacionResult.data);
      testResults.failed++;
      testResults.errors.push('Panel de facturación falló');
    }

  } catch (error) {
    console.log('❌ Error durante las pruebas:', error.message);
    testResults.failed++;
    testResults.errors.push(`Error general: ${error.message}`);
  }

  // RESUMEN FINAL
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(60));
  console.log(`✅ Pruebas exitosas: ${testResults.success}`);
  console.log(`❌ Pruebas fallidas: ${testResults.failed}`);
  console.log(`🎯 Total ejecutadas: ${testResults.success + testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n⚠️  ERRORES DETECTADOS:');
    testResults.errors.forEach(error => console.log(`   • ${error}`));
  }

  const successRate = ((testResults.success / (testResults.success + testResults.failed)) * 100).toFixed(1);
  console.log(`\n📈 Tasa de éxito: ${successRate}%`);
  
  if (successRate == 100) {
    console.log('\n🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
    console.log('✨ El flujo CHP está listo para uso en producción');
  } else if (successRate >= 70) {
    console.log('\n🟡 SISTEMA MAYORMENTE FUNCIONAL');
    console.log('⚡ Requiere algunos ajustes menores');
  } else {
    console.log('\n🔴 SISTEMA REQUIERE ATENCIÓN');
    console.log('🔧 Necesita correcciones antes de uso en producción');
  }

  console.log('\n📋 FUNCIONALIDADES PROBADAS:');
  console.log('   🔐 Autenticación de profesionales');
  console.log('   📝 Creación de solicitudes CHP');
  console.log('   💰 Estimación opcional de montos');
  console.log('   📋 Listado de solicitudes');
  console.log('   💳 Sistema de facturas pendientes');
  console.log('   📊 Historial de pagos');
  console.log('   🔧 Panel administrativo');
  console.log('   📊 Panel de facturación');

  console.log('\n🔄 Para continuar las pruebas:');
  console.log('   1. Un administrador debe aprobar las solicitudes');
  console.log('   2. Generar facturas desde el panel admin');
  console.log('   3. El profesional puede subir comprobantes');
  console.log('   4. Staff revisa y aprueba pagos');
  
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Ejecutar las pruebas
testCompleteWorkflow().catch(console.error);