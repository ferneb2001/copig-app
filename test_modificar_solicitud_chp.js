/**
 * 🔧 SCRIPT DE PRUEBA - Modificar Solicitud CHP
 * 
 * Prueba el endpoint PUT /api/profesional/solicitud-chp/:id
 * para diagnosticar el error "Error de conexión al modificar la solicitud"
 */

const axios = require('axios');

async function testModificarSolicitud() {
    console.log('🔧 === PRUEBA MODIFICAR SOLICITUD CHP ===');
    console.log('');

    const baseURL = 'http://localhost:3030';
    
    // Crear un cliente simple que mantenga cookies manualmente
    let sessionCookies = '';
    
    const client = axios.create({
        baseURL: baseURL,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'COPIG-Test-Client'
        }
    });
    
    // Interceptor para agregar cookies a todas las peticiones
    client.interceptors.request.use((config) => {
        if (sessionCookies) {
            config.headers['Cookie'] = sessionCookies;
        }
        return config;
    });
    
    // Interceptor para capturar cookies de todas las respuestas
    client.interceptors.response.use((response) => {
        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader && setCookieHeader.length > 0) {
            sessionCookies = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
            console.log('🍪 Cookies actualizadas:', sessionCookies);
        }
        return response;
    });

    try {
        // 1. Login como profesional de prueba
        console.log('🔐 1. Realizando login...');
        const loginResponse = await client.post('/api/unified-login', {
            dni: '99999999',
            password: 'prueba123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Login exitoso');
            console.log('🎯 Usuario:', loginResponse.data.user?.username || 'Sin nombre');
            console.log('📋 Rol:', loginResponse.data.user?.role || 'Sin rol');
        } else {
            console.log('❌ Login fallido:', loginResponse.data.message || loginResponse.data.error);
            return;
        }

        // 2. Obtener solicitudes existentes
        console.log('');
        console.log('📋 2. Obteniendo solicitudes del profesional...');
        const solicitudesResponse = await client.get('/api/profesional/solicitudes-chp');
        
        if (!solicitudesResponse.data.success) {
            console.log('❌ Error obteniendo solicitudes:', solicitudesResponse.data.message);
            return;
        }

        const solicitudes = solicitudesResponse.data.solicitudes;
        console.log(`✅ Encontradas ${solicitudes.length} solicitudes`);
        
        if (solicitudes.length === 0) {
            console.log('⚠️ No hay solicitudes para modificar. Creando una nueva...');
            
            // Crear una solicitud de prueba
            const nuevaSolicitud = await client.post('/api/chp/create', {
                comitente: 'CLIENTE PRUEBA MODIFICACIÓN',
                proyecto: 'PROYECTO PARA MODIFICAR',
                descripcion: 'Descripción inicial para luego modificar',
                ubicacion_obra: 'Mendoza Capital',
                monto_obra_estimado: 50000
            });
            
            if (nuevaSolicitud.data.success) {
                console.log('✅ Solicitud creada:', nuevaSolicitud.data.numero_solicitud);
                // Recargar solicitudes
                const solicitudesActualizadas = await client.get('/api/profesional/solicitudes-chp');
                solicitudes.push(...solicitudesActualizadas.data.solicitudes);
            } else {
                console.log('❌ Error creando solicitud:', nuevaSolicitud.data.message);
                return;
            }
        }

        // 3. Intentar modificar la primera solicitud PENDIENTE
        const solicitudPendiente = solicitudes.find(s => s.estado === 'PENDIENTE');
        
        if (!solicitudPendiente) {
            console.log('⚠️ No se encontraron solicitudes PENDIENTES para modificar');
            console.log('Estados disponibles:', solicitudes.map(s => `${s.numero_solicitud}: ${s.estado}`));
            return;
        }

        console.log('');
        console.log('✏️ 3. Modificando solicitud:', solicitudPendiente.numero_solicitud);
        console.log('   ID:', solicitudPendiente.id);
        console.log('   Estado actual:', solicitudPendiente.estado);
        console.log('   Comitente actual:', solicitudPendiente.comitente);

        const datosModificados = {
            comitente: 'CLIENTE MODIFICADO POR PRUEBA',
            proyecto: 'PROYECTO ACTUALIZADO',
            descripcion: 'Descripción completamente modificada',
            ubicacion_obra: 'Godoy Cruz, Mendoza',
            monto_obra_estimado: 75000
        };

        console.log('📝 Datos a modificar:', datosModificados);

        // 4. Realizar la modificación
        console.log('');
        console.log('🔄 4. Enviando petición PUT...');
        const modificarResponse = await client.put(
            `/api/profesional/solicitud-chp/${solicitudPendiente.id}`, 
            datosModificados
        );

        console.log('📊 Respuesta recibida:');
        console.log('   Status:', modificarResponse.status);
        console.log('   Success:', modificarResponse.data.success);
        console.log('   Message:', modificarResponse.data.message);

        if (modificarResponse.data.success) {
            console.log('');
            console.log('✅ ¡MODIFICACIÓN EXITOSA!');
            console.log('🎉 La solicitud se modificó correctamente');
            
            // Verificar los cambios
            console.log('');
            console.log('🔍 5. Verificando cambios...');
            const verificacionResponse = await client.get('/api/profesional/solicitudes-chp');
            const solicitudModificada = verificacionResponse.data.solicitudes.find(s => s.id === solicitudPendiente.id);
            
            if (solicitudModificada) {
                console.log('📋 Datos actualizados:');
                console.log('   Comitente:', solicitudModificada.comitente);
                console.log('   Proyecto:', solicitudModificada.proyecto);
                console.log('   Descripción:', solicitudModificada.descripcion);
                console.log('   Ubicación:', solicitudModificada.ubicacion_obra);
                console.log('   Monto:', solicitudModificada.monto_obra_estimado);
            }
            
        } else {
            console.log('');
            console.log('❌ ERROR AL MODIFICAR:');
            console.log('   Mensaje:', modificarResponse.data.message);
        }

    } catch (error) {
        console.log('');
        console.log('💥 ERROR EN LA PRUEBA:');
        console.log('   Tipo:', error.constructor.name);
        console.log('   Mensaje:', error.message);
        
        if (error.response) {
            console.log('   HTTP Status:', error.response.status);
            console.log('   Response Data:', error.response.data);
        } else if (error.request) {
            console.log('   Sin respuesta del servidor');
            console.log('   Request config:', {
                url: error.config?.url,
                method: error.config?.method
            });
        }
        
        console.log('');
        console.log('🔍 POSIBLES CAUSAS:');
        console.log('   • Servidor no está ejecutándose en puerto 3030');
        console.log('   • Endpoint PUT no existe o tiene error');
        console.log('   • Problema con la sesión/autenticación');
        console.log('   • Error de middleware o parsing');
    }
}

// Ejecutar la prueba
testModificarSolicitud();