const axios = require('axios');

async function testDetailedLogin() {
    try {
        console.log('🔍 Test detallado del login...');
        
        // Probar diferentes variaciones
        const tests = [
            { dni: '20562024', password: 'ansiktet1969', name: 'Credenciales correctas' },
            { dni: 20562024, password: 'ansiktet1969', name: 'DNI como número' },
            { dni: '', password: 'ansiktet1969', name: 'DNI vacío' },
            { dni: '20562024', password: '', name: 'Password vacío' }
        ];
        
        for (const test of tests) {
            console.log(`\n🧪 Test: ${test.name}`);
            try {
                const response = await axios.post('http://localhost:3030/api/unified-login', test, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000
                });
                console.log('✅ Success:', response.data);
            } catch (error) {
                if (error.response) {
                    console.log('❌ Error response:');
                    console.log('  Status:', error.response.status);
                    console.log('  Data:', error.response.data);
                } else {
                    console.log('❌ Network error:', error.message);
                }
            }
        }
        
    } catch (error) {
        console.log('❌ Error general:', error.message);
    }
}

testDetailedLogin();