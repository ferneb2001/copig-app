const axios = require('axios');

const BASE_URL = 'http://localhost:3030';

// Configurar axios para mantener cookies de sesión
const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true
});

async function testEndpoints() {
    console.log('🧪 PRUEBA DE ENDPOINTS ADMIN');
    console.log('============================\n');

    try {
        // Test 1: Login como superadmin
        console.log('1. Probando login superadmin...');
        const loginData = {
            username: '99999999', // Superadmin Fernando
            password: 'ansiktet2025'
        };

        const loginResponse = await client.post('/api/unified-login', loginData);
        
        if (loginResponse.data.success) {
            console.log('✅ Login exitoso');
            console.log(`   Usuario: ${loginResponse.data.user.nombre || loginResponse.data.user.username}`);
            console.log(`   Tipo: ${loginResponse.data.userType}`);
        } else {
            console.log('❌ Login falló:', loginResponse.data.message);
        }

        // Test 2: Verificar sesión
        console.log('\n2. Verificando sesión...');
        try {
            const sessionResponse = await client.get('/api/session-info');
            console.log('✅ Sesión activa:', {
                userType: sessionResponse.data.userType,
                isAuthenticated: sessionResponse.data.isAuthenticated
            });
        } catch (error) {
            console.log('❌ Error de sesión:', error.response?.data || error.message);
        }

        // Test 3: Obtener profesionales
        console.log('\n3. Probando endpoint /api/admin/profesionales...');
        try {
            const profesionalesResponse = await client.get('/api/admin/profesionales?page=1&limit=5');
            
            if (profesionalesResponse.data && profesionalesResponse.data.profesionales) {
                console.log(`✅ Profesionales obtenidos: ${profesionalesResponse.data.profesionales.length} de ${profesionalesResponse.data.total}`);
                console.log(`   Primera entrada: ${profesionalesResponse.data.profesionales[0]?.nombre || 'Sin nombre'}`);
            } else {
                console.log('❌ Respuesta inesperada:', JSON.stringify(profesionalesResponse.data).substring(0, 200));
            }
        } catch (error) {
            console.log('❌ Error en profesionales:', error.response?.status, error.response?.data || error.message);
        }

        // Test 4: Obtener empresas
        console.log('\n4. Probando endpoint /api/admin/empresas...');
        try {
            const empresasResponse = await client.get('/api/admin/empresas?page=1&limit=5');
            
            if (empresasResponse.data && empresasResponse.data.empresas) {
                console.log(`✅ Empresas obtenidas: ${empresasResponse.data.empresas.length} de ${empresasResponse.data.total}`);
                console.log(`   Primera entrada: ${empresasResponse.data.empresas[0]?.razon_social || 'Sin razón social'}`);
            } else {
                console.log('❌ Respuesta inesperada:', JSON.stringify(empresasResponse.data).substring(0, 200));
            }
        } catch (error) {
            console.log('❌ Error en empresas:', error.response?.status, error.response?.data || error.message);
        }

        // Test 5: Página admin HTML
        console.log('\n5. Probando página admin HTML...');
        try {
            const htmlResponse = await client.get('/admin');
            if (htmlResponse.status === 200) {
                console.log('✅ Página admin carga correctamente');
                
                // Verificar si contiene elementos clave
                const html = htmlResponse.data;
                if (html.includes('Profesionales') && html.includes('Empresas')) {
                    console.log('✅ Página contiene elementos de navegación');
                } else {
                    console.log('⚠️  Página carga pero faltan elementos clave');
                }
            }
        } catch (error) {
            console.log('❌ Error en página admin:', error.response?.status, error.message);
        }

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
        console.error('Stack:', error.stack);
    }
}

testEndpoints();