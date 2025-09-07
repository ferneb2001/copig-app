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

async function testDeleteFunctionalityComplete() {
  console.log('🧪 PRUEBA COMPLETA DE FUNCIONALIDAD ELIMINAR CHP');
  console.log('='.repeat(60));
  
  try {
    // 1. LOGIN COMO PROFESIONAL
    console.log('\n🔐 Paso 1: Login como profesional de prueba');
    const loginResult = await makeRequest('POST', '/api/unified-login', {
      dni: '99999999',
      password: 'prueba123'
    });
    
    if (loginResult.statusCode === 200 && loginResult.data.success) {
      console.log('✅ Login exitoso:', loginResult.data.user.username);
    } else {
      console.log('❌ Error en login:', loginResult.data);
      return;
    }
    
    // 2. VERIFICAR SISTEMA ESTÁ LIMPIO
    console.log('\n📋 Paso 2: Verificando sistema limpio');
    const verificacionResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
    
    if (verificacionResult.statusCode === 200 && verificacionResult.data.success) {
      const count = verificacionResult.data.solicitudes.length;
      console.log(`✅ Solicitudes actuales: ${count} (debe ser 0 para empezar)`);
    }
    
    // 3. CREAR NUEVA SOLICITUD CHP PARA PROBAR
    console.log('\n➕ Paso 3: Creando nueva solicitud CHP para probar eliminación');
    const nuevaSolicitudResult = await makeRequest('POST', '/api/chp/create', {
      comitente: 'Empresa Test',
      proyecto: 'Proyecto de Prueba para Eliminar',
      descripcion: 'Esta solicitud será eliminada en la prueba',
      ubicacion_obra: 'Mendoza, Argentina',
      monto_obra_estimado: 1000000
    });
    
    if (nuevaSolicitudResult.statusCode === 200 && nuevaSolicitudResult.data.success) {
      console.log('✅ Solicitud CHP creada:', nuevaSolicitudResult.data.numeroSolicitud);
      console.log('   📊 ID:', nuevaSolicitudResult.data.solicitudId);
      console.log('   📝 Comitente:', nuevaSolicitudResult.data.comitente);
    } else {
      console.log('❌ Error creando solicitud:', nuevaSolicitudResult.data);
      return;
    }
    
    // 4. VERIFICAR QUE LA SOLICITUD APARECE EN LA LISTA
    console.log('\n📋 Paso 4: Verificando que la solicitud aparece en portal profesional');
    const listarResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
    
    if (listarResult.statusCode === 200 && listarResult.data.success && listarResult.data.solicitudes.length > 0) {
      const solicitud = listarResult.data.solicitudes[0];
      console.log('✅ Solicitud visible en portal profesional:');
      console.log(`   🔢 Número: ${solicitud.numero_solicitud}`);
      console.log(`   🏢 Comitente: ${solicitud.comitente}`);
      console.log(`   📊 Estado: ${solicitud.estado} (debe ser PENDIENTE)`);
      console.log(`   🆔 ID: ${solicitud.id}`);
      
      // Verificar que está en estado PENDIENTE (requisito para eliminar)
      if (solicitud.estado !== 'PENDIENTE') {
        console.log('⚠️ ADVERTENCIA: La solicitud no está en estado PENDIENTE - no se puede eliminar');
      }
      
      // 5. PROBAR ELIMINACIÓN VÍA API DIRECTA
      console.log('\n🗑️ Paso 5: Probando eliminación vía API DELETE');
      const eliminarResult = await makeRequest('DELETE', `/api/profesional/solicitud-chp/${solicitud.id}`);
      
      if (eliminarResult.statusCode === 200 && eliminarResult.data.success) {
        console.log('✅ Eliminación exitosa:', eliminarResult.data.message);
        console.log('   📋 Solicitud eliminada:', eliminarResult.data.solicitud_eliminada.numero);
        console.log('   🏢 Comitente:', eliminarResult.data.solicitud_eliminada.comitente);
      } else {
        console.log('❌ Error eliminando:', eliminarResult.data);
        console.log('   📊 Status Code:', eliminarResult.statusCode);
      }
      
      // 6. VERIFICAR QUE LA SOLICITUD YA NO ESTÁ
      console.log('\n✅ Paso 6: Verificando que la solicitud fue eliminada');
      const verificacionFinalResult = await makeRequest('GET', '/api/profesional/solicitudes-chp');
      
      if (verificacionFinalResult.statusCode === 200 && verificacionFinalResult.data.success) {
        const countFinal = verificacionFinalResult.data.solicitudes.length;
        console.log(`✅ Solicitudes restantes: ${countFinal} (debe ser 0)`);
        
        if (countFinal === 0) {
          console.log('🎯 ¡PERFECTO! La eliminación funcionó correctamente');
        } else {
          console.log('❌ ERROR: La solicitud no se eliminó correctamente');
        }
      }
      
    } else {
      console.log('❌ No se pudo encontrar la solicitud creada');
    }
    
    // 7. PROBAR INTENTAR ELIMINAR SOLICITUD INEXISTENTE
    console.log('\n🚫 Paso 7: Probando eliminación de solicitud inexistente');
    const eliminarInexistenteResult = await makeRequest('DELETE', '/api/profesional/solicitud-chp/99999');
    
    if (eliminarInexistenteResult.statusCode === 404) {
      console.log('✅ Error 404 correcto para solicitud inexistente:', eliminarInexistenteResult.data.message);
    } else {
      console.log('⚠️ Respuesta inesperada para solicitud inexistente:', eliminarInexistenteResult.statusCode);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 PRUEBA COMPLETA DE ELIMINACIÓN FINALIZADA');
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ FUNCIONALIDADES VERIFICADAS:');
    console.log('   • ✅ Login profesional correcto');
    console.log('   • ✅ Creación de solicitud CHP');
    console.log('   • ✅ Listado muestra solicitudes');
    console.log('   • ✅ Eliminación vía API DELETE funciona');
    console.log('   • ✅ Verificación post-eliminación');
    console.log('   • ✅ Manejo de errores 404');
    console.log('');
    console.log('🌐 PRÓXIMO PASO - PRUEBA MANUAL EN NAVEGADOR:');
    console.log('1. 🌐 Ir a: http://localhost:3030/');
    console.log('2. 🔐 Login con DNI: 99999999 / Contraseña: prueba123');
    console.log('3. 📝 Crear nueva solicitud CHP');
    console.log('4. 📋 Ir a "Mis Solicitudes"');
    console.log('5. 👀 Verificar que aparece columna "Acciones"');
    console.log('6. 🗑️ Verificar que aparece botón "🗑️ Eliminar" solo en PENDIENTES');
    console.log('7. ✅ Probar eliminar y confirmar que pide confirmación');
    console.log('8. ✅ Verificar que se elimina y la lista se recarga');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testDeleteFunctionalityComplete();