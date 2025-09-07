const fetch = require('node-fetch');

async function testSearchWorking() {
    console.log('=== PROBANDO BÚSQUEDA CON DATOS REALES ===\n');
    
    try {
        // Login como Fernando
        const loginData = {
            dni: '20562024',
            password: 'ansiktet1969'
        };
        
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const cookies = loginResponse.headers.get('set-cookie');
        
        const tests = [
            { tipo: 'Nombre', buscar: 'ABAD' },
            { tipo: 'DNI', buscar: '17086342' }, 
            { tipo: 'Matrícula EXISTENTE', buscar: '10030' },
            { tipo: 'Matrícula INEXISTENTE', buscar: '11747' },
            { tipo: 'Matrícula más alta', buscar: '11673' }
        ];
        
        for (const test of tests) {
            console.log(`🔍 PROBANDO ${test.tipo}: "${test.buscar}"`);
            
            const response = await fetch(`http://localhost:3030/api/admin/profesionales?buscar=${encodeURIComponent(test.buscar)}&limit=5`, {
                headers: { 'Cookie': cookies }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Resultados: ${data.profesionales?.length || 0}`);
                
                if (data.profesionales && data.profesionales.length > 0) {
                    data.profesionales.forEach((prof, index) => {
                        console.log(`   ${index + 1}. ${prof.nombre} (DNI: ${prof.dni}, Mat: ${prof.matricula})`);
                    });
                } else {
                    console.log(`   💡 Sin resultados para "${test.buscar}"`);
                }
            } else {
                console.log(`   ❌ Error ${response.status}`);
            }
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSearchWorking();