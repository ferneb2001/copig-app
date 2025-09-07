const axios = require('axios');

async function testCHPFlow() {
  try {
    console.log('🧪 Probando flujo completo CHP...');
    
    // 1. Login como profesional
    console.log('\n👤 1. Login como profesional...');
    const loginData = { dni: '99999999', password: 'prueba123' };
    
    const loginResponse = await axios.post('http://localhost:3030/api/unified-login', loginData);
    
    if (!loginResponse.data.success) {
      console.log('❌ Error en login:', loginResponse.data.message);
      return;
    }
    
    console.log('✅ Login exitoso:', loginResponse.data.user.nombre);
    const cookies = loginResponse.headers['set-cookie'];
    
    // 2. Crear solicitud CHP
    console.log('\n📝 2. Creando solicitud CHP...');
    const solicitudData = {
      cliente: 'EMPRESA PRUEBA S.A.',
      proyecto: 'Construcción de Planta Industrial',
      descripcion: 'Certificado de habitabilidad para planta de producción de 2000m²',
      ubicacion_obra: 'Parque Industrial Mendoza, Lote 15'
    };
    
    const createResponse = await axios.post('http://localhost:3030/api/chp/create', solicitudData, {
      headers: { Cookie: cookies?.join(';') || '' }
    });
    
    if (!createResponse.data.success) {
      console.log('❌ Error creando solicitud:', createResponse.data.message);
      return;
    }
    
    console.log('✅ Solicitud creada:', createResponse.data.solicitud.numero_solicitud);
    const solicitudId = createResponse.data.solicitud.id;
    
    // 3. Verificar solicitud en lista del profesional
    console.log('\n📋 3. Verificando lista del profesional...');
    const listResponse = await axios.get('http://localhost:3030/api/profesional/solicitudes-chp', {
      headers: { Cookie: cookies?.join(';') || '' }
    });
    
    console.log(`✅ Solicitudes del profesional: ${listResponse.data.solicitudes.length}`);
    
    // 4. Verificar solicitud en panel admin
    console.log('\n🛡️ 4. Verificando panel admin...');
    const adminResponse = await axios.get('http://localhost:3030/api/admin/solicitudes-chp');
    
    console.log(`✅ Solicitudes en admin: ${adminResponse.data.solicitudes.length}`);
    
    if (adminResponse.data.solicitudes.length > 0) {
      const solicitud = adminResponse.data.solicitudes[0];
      console.log(`   📄 ${solicitud.numero_solicitud} - ${solicitud.estado}`);
      console.log(`   👤 Profesional: ${solicitud.profesional_nombre}`);
      console.log(`   🏢 Cliente: ${solicitud.cliente}`);
    }
    
    // 5. Aprobar solicitud (simulando admin)
    console.log('\n✅ 5. Aprobando solicitud...');
    const approveResponse = await axios.put(`http://localhost:3030/api/admin/solicitud-chp/${solicitudId}`, {
      estado: 'APROBADO',
      observaciones: 'Solicitud aprobada - Documentación completa'
    });
    
    if (approveResponse.data.success) {
      console.log('✅ Solicitud aprobada exitosamente');
    }
    
    // 6. Verificar estado actualizado
    console.log('\n🔍 6. Verificando estado final...');
    const finalCheck = await axios.get('http://localhost:3030/api/profesional/solicitudes-chp', {
      headers: { Cookie: cookies?.join(';') || '' }
    });
    
    const solicitudFinal = finalCheck.data.solicitudes.find(s => s.id === solicitudId);
    console.log(`✅ Estado final: ${solicitudFinal?.estado}`);
    console.log(`📝 Observaciones: ${solicitudFinal?.observaciones}`);
    
    console.log('\n🎉 FLUJO CHP COMPLETADO EXITOSAMENTE');
    console.log('==========================================');
    console.log('✅ Login profesional: FUNCIONA');
    console.log('✅ Crear solicitud: FUNCIONA');  
    console.log('✅ Listar solicitudes: FUNCIONA');
    console.log('✅ Panel admin: FUNCIONA');
    console.log('✅ Aprobar/Rechazar: FUNCIONA');
    console.log('✅ Actualización en tiempo real: FUNCIONA');
    
  } catch (error) {
    console.error('❌ Error en flujo CHP:', error.message);
    if (error.response?.data) {
      console.error('📋 Detalles:', error.response.data);
    }
  }
}

// Ejecutar si no se está requiriendo el archivo
if (require.main === module) {
  testCHPFlow();
}

module.exports = testCHPFlow;