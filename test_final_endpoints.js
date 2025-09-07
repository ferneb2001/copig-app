const axios = require('axios');

async function testFinalEndpoints() {
    console.log('🧪 PRUEBA FINAL DE ENDPOINTS POST-CORRECCIÓN');
    console.log('============================================\n');

    const client = axios.create({
        baseURL: 'http://localhost:3030',
        timeout: 10000,
        withCredentials: true
    });

    try {
        // 1. Login
        console.log('1. Login superadmin...');
        const loginResponse = await client.post('/api/unified-login', {
            dni: '20562024',
            password: 'ansiktet1969'
        });
        
        console.log('✅ Login exitoso:', loginResponse.data.success);
        console.log('   Role:', loginResponse.data.userData.role);

        // 2. Probar profesionales con detalles de error
        console.log('\n2. Probando /api/admin/profesionales...');
        try {
            const profResponse = await client.get('/api/admin/profesionales?page=1&limit=5');
            console.log('✅ Profesionales OK:', profResponse.data);
        } catch (error) {
            console.log('❌ Error profesionales:');
            console.log('   Status:', error.response?.status);
            console.log('   Headers:', error.response?.headers);
            console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
            console.log('   Request headers:', error.config?.headers);
        }

        // 3. Probar empresas
        console.log('\n3. Probando /api/empresas...');
        try {
            const empResponse = await client.get('/api/empresas?page=1&limit=5');
            console.log('✅ Empresas OK:', empResponse.data);
        } catch (error) {
            console.log('❌ Error empresas:');
            console.log('   Status:', error.response?.status);
            console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
        }

        // 4. Verificar sesión
        console.log('\n4. Verificando sesión...');
        try {
            const sessionResponse = await client.get('/api/session-info');
            console.log('✅ Sesión:', sessionResponse.data);
        } catch (error) {
            console.log('❌ Error sesión:', error.response?.data);
        }

    } catch (error) {
        console.error('❌ ERROR GENERAL:', error.message);
    }
}

testFinalEndpoints();