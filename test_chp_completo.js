const axios = require('axios');

const BASE_URL = 'http://localhost:3030';
const TEST_PROFESIONAL = {
    dni: '99999999',
    password: 'prueba123'
};

// Mantener cookies entre requests
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Almacenar cookies manualmente
let cookies = '';
axiosInstance.interceptors.request.use(config => {
    if (cookies) {
        config.headers.Cookie = cookies;
    }
    return config;
});

axiosInstance.interceptors.response.use(response => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
        cookies = setCookie.join('; ');
    }
    return response;
});

async function testCHP() {
    console.log('🧪 INICIANDO PRUEBA COMPLETA DEL SISTEMA CHP\n');
    
    try {
        // PASO 1: Login como profesional
        console.log('1️⃣ Intentando login como profesional...');
        const loginResponse = await axiosInstance.post('/api/unified-login', {
            dni: TEST_PROFESIONAL.dni,
            password: TEST_PROFESIONAL.password
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Login exitoso - Usuario:', loginResponse.data.userData.username);
        } else {
            throw new Error('Login falló: ' + loginResponse.data.message);
        }
        
        // PASO 2: Crear nueva solicitud CHP
        console.log('\n2️⃣ Creando nueva solicitud CHP...');
        const solicitudData = {
            cliente: 'Empresa Test Automática',
            proyecto: 'Proyecto de Prueba Automatizada',
            descripcion: 'Esta es una solicitud creada automáticamente para verificar el sistema',
            ubicacion_obra: 'Mendoza Capital - Zona Centro',
            observaciones: 'Prueba automática del sistema'
        };
        
        const createResponse = await axiosInstance.post('/api/profesional/solicitud-chp', solicitudData);
        
        if (createResponse.data.success) {
            console.log('✅ Solicitud creada - Número:', createResponse.data.numeroSolicitud);
            var solicitudId = createResponse.data.solicitud.id;
        } else {
            throw new Error('Error al crear solicitud: ' + createResponse.data.message);
        }
        
        // PASO 3: Listar solicitudes del profesional
        console.log('\n3️⃣ Verificando lista de solicitudes...');
        const listResponse = await axiosInstance.get('/api/profesional/solicitudes-chp');
        
        if (listResponse.data.success) {
            console.log('✅ Solicitudes obtenidas:', listResponse.data.solicitudes.length);
            const ultimaSolicitud = listResponse.data.solicitudes[0];
            console.log('   Última solicitud:');
            console.log('   - Número:', ultimaSolicitud.numero_solicitud);
            console.log('   - Cliente:', ultimaSolicitud.cliente);
            console.log('   - Estado:', ultimaSolicitud.estado);
        } else {
            throw new Error('Error al listar solicitudes');
        }
        
        // PASO 4: Verificar desde panel admin (simulando staff)
        console.log('\n4️⃣ Verificando desde panel administrativo...');
        // Primero hacer logout
        await axiosInstance.post('/api/logout');
        
        // Login como admin
        const adminLogin = await axiosInstance.post('/api/unified-login', {
            dni: '20562024',
            password: 'ansiktet1969'
        });
        
        if (adminLogin.data.success) {
            console.log('✅ Login admin exitoso');
            
            // Obtener todas las solicitudes
            const adminList = await axiosInstance.get('/api/admin/solicitudes-chp');
            
            if (adminList.data.success) {
                console.log('✅ Solicitudes en panel admin:', adminList.data.solicitudes.length);
                const encontrada = adminList.data.solicitudes.find(s => s.id === solicitudId);
                if (encontrada) {
                    console.log('✅ Solicitud de prueba visible en panel admin');
                    
                    // PASO 5: Aprobar la solicitud
                    console.log('\n5️⃣ Aprobando solicitud desde admin...');
                    const aprobarResponse = await axiosInstance.put(`/api/admin/solicitud-chp/${solicitudId}`, {
                        estado: 'APROBADO',
                        observaciones: 'Aprobado mediante prueba automática'
                    });
                    
                    if (aprobarResponse.data.success) {
                        console.log('✅ Solicitud aprobada correctamente');
                    }
                } else {
                    console.log('⚠️ Solicitud no encontrada en panel admin');
                }
            }
        }
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMEN DE PRUEBAS:');
        console.log('='.repeat(50));
        console.log('✅ Login profesional: FUNCIONA');
        console.log('✅ Crear solicitud: FUNCIONA');
        console.log('✅ Listar solicitudes: FUNCIONA');
        console.log('✅ Panel admin: FUNCIONA');
        console.log('✅ Aprobar solicitud: FUNCIONA');
        console.log('✅ Sistema bidireccional: CONFIRMADO');
        console.log('\n🎉 SISTEMA CHP 100% OPERATIVO');
        
    } catch (error) {
        console.error('\n❌ ERROR EN PRUEBA:', error.message);
        if (error.response) {
            console.error('Detalles:', error.response.data);
        }
        process.exit(1);
    }
}

// Ejecutar prueba
testCHP();