const axios = require('axios');

async function testRealLogin() {
    try {
        console.log('🔍 Probando login real al servidor en puerto 3030...');
        
        const response = await axios.post('http://localhost:3030/api/unified-login', {
            dni: '20562024',
            password: 'ansiktet1969'
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        console.log('✅ Respuesta del servidor:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error en petición:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testRealLogin();