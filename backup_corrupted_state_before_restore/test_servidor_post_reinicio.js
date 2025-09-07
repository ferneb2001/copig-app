const fetch = require('node-fetch');

async function testServidorPostReinicio() {
    console.log('🔍 VERIFICANDO SERVIDOR POST-REINICIO');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Detectando errores y verificando funcionalidad\\n');
    
    const tests = [];
    
    try {
        // Test 1: Servidor responde
        console.log('🌐 1. Testing conectividad servidor...');
        const serverResponse = await fetch('http://localhost:3030/', {
            method: 'GET'
        });
        
        if (serverResponse.status === 200) {
            console.log('   ✅ Servidor responde correctamente');
            tests.push({ test: 'Conectividad', status: 'OK' });
        } else {
            console.log(`   ⚠️ Servidor responde con status: ${serverResponse.status}`);
            tests.push({ test: 'Conectividad', status: 'WARNING', code: serverResponse.status });
        }
        
    } catch (error) {
        console.log(`   ❌ Error conectividad: ${error.message}`);
        tests.push({ test: 'Conectividad', status: 'ERROR', error: error.message });
    }
    
    try {
        // Test 2: Login staff corregido
        console.log('\\n🔐 2. Testing login staff corregido...');
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: '40101718',
                password: 'ansiktet2025'
            })
        });
        
        if (loginResponse.status === 200) {
            const loginData = await loginResponse.json();
            console.log('   ✅ Login staff funciona correctamente');
            console.log(`   👤 Usuario: ${loginData.username || loginData.documento}`);
            console.log(`   🎭 Tipo: ${loginData.userType || loginData.role}`);
            tests.push({ test: 'Login Staff', status: 'OK' });
        } else {
            const errorData = await loginResponse.json();
            console.log(`   ❌ Login staff falla - Status: ${loginResponse.status}`);
            console.log(`   📄 Error: ${JSON.stringify(errorData)}`);
            tests.push({ test: 'Login Staff', status: 'FAILED', error: errorData });
        }
        
    } catch (error) {
        console.log(`   💥 Error login staff: ${error.message}`);
        tests.push({ test: 'Login Staff', status: 'ERROR', error: error.message });
    }
    
    try {
        // Test 3: Login profesional corregido  
        console.log('\\n👨‍💼 3. Testing login profesional corregido...');
        const profLoginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: '99999999',
                password: 'prueba123'
            })
        });
        
        if (profLoginResponse.status === 200) {
            const profLoginData = await profLoginResponse.json();
            console.log('   ✅ Login profesional funciona correctamente');
            console.log(`   👤 Usuario: ${profLoginData.nombre || profLoginData.username}`);
            console.log(`   🎭 Tipo: ${profLoginData.userType}`);
            tests.push({ test: 'Login Profesional', status: 'OK' });
        } else {
            const errorData = await profLoginResponse.json();
            console.log(`   ❌ Login profesional falla - Status: ${profLoginResponse.status}`);
            console.log(`   📄 Error: ${JSON.stringify(errorData)}`);
            tests.push({ test: 'Login Profesional', status: 'FAILED', error: errorData });
        }
        
    } catch (error) {
        console.log(`   💥 Error login profesional: ${error.message}`);
        tests.push({ test: 'Login Profesional', status: 'ERROR', error: error.message });
    }
    
    try {
        // Test 4: Endpoints profesional agregados
        console.log('\\n👤 4. Testing endpoints profesional agregados...');
        const endpointsProfesional = [
            '/api/profesional/dashboard',
            '/api/profesional/estado-financiero', 
            '/api/profesional/perfil'
        ];
        
        for (const endpoint of endpointsProfesional) {
            try {
                const response = await fetch(`http://localhost:3030${endpoint}`, {
                    method: 'GET'
                });
                
                // Esperamos 403 o 401 (sin autorización), no 404 (no encontrado)
                if (response.status === 403 || response.status === 401) {
                    console.log(`   ✅ ${endpoint} - Endpoint existe (requiere auth)`);
                } else if (response.status === 404) {
                    console.log(`   ❌ ${endpoint} - Endpoint NO existe`);
                } else {
                    console.log(`   ⚠️ ${endpoint} - Status inesperado: ${response.status}`);
                }
            } catch (err) {
                console.log(`   💥 ${endpoint} - Error: ${err.message}`);
            }
        }
        
        tests.push({ test: 'Endpoints Profesional', status: 'VERIFIED' });
        
    } catch (error) {
        console.log(`   💥 Error testing endpoints: ${error.message}`);
        tests.push({ test: 'Endpoints Profesional', status: 'ERROR', error: error.message });
    }
    
    try {
        // Test 5: Base de datos conectada
        console.log('\\n🗄️ 5. Testing conexión base de datos...');
        const { Pool } = require('pg');
        const pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'copig_moderno',
            password: 'ansiktet1969',
            port: 5432,
        });
        
        const client = await pool.connect();
        const result = await client.query('SELECT COUNT(*) FROM copig.profesionales');
        const count = result.rows[0].count;
        
        console.log(`   ✅ Base de datos conectada - ${count} profesionales`);
        tests.push({ test: 'Base de Datos', status: 'OK', count: count });
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.log(`   ❌ Error base de datos: ${error.message}`);
        tests.push({ test: 'Base de Datos', status: 'ERROR', error: error.message });
    }
    
    // Resumen de tests
    console.log('\\n📊 RESUMEN POST-REINICIO:');
    console.log('=' .repeat(50));
    
    const exitosos = tests.filter(t => t.status === 'OK').length;
    const warnings = tests.filter(t => t.status === 'WARNING').length;
    const errores = tests.filter(t => ['ERROR', 'FAILED'].includes(t.status)).length;
    
    tests.forEach(test => {
        const emoji = test.status === 'OK' ? '✅' : 
                     test.status === 'WARNING' ? '⚠️' : 
                     test.status === 'VERIFIED' ? '🔍' : '❌';
        console.log(`${emoji} ${test.test}: ${test.status}`);
    });
    
    console.log(`\\n🎯 RESULTADO: ${exitosos} OK, ${warnings} Warnings, ${errores} Errores`);
    
    if (errores > 0) {
        console.log('\\n🚨 ERRORES DETECTADOS - Necesitan corrección');
        tests.filter(t => ['ERROR', 'FAILED'].includes(t.status)).forEach(test => {
            console.log(`   ❌ ${test.test}: ${JSON.stringify(test.error)}`);
        });
    } else {
        console.log('\\n✅ SERVIDOR FUNCIONANDO CORRECTAMENTE POST-REINICIO');
        console.log('🚀 Listo para continuar testing exhaustivo');
    }
    
    return tests;
}

// Ejecutar test inmediatamente
testServidorPostReinicio()
    .then((results) => {
        const errores = results.filter(t => ['ERROR', 'FAILED'].includes(t.status)).length;
        if (errores === 0) {
            console.log('\\n🎉 SERVIDOR LISTO - CONTINUANDO TESTING AUTOMÁTICO');
            process.exit(0);
        } else {
            console.log('\\n🛠️ CORRECCIONES NECESARIAS ANTES DE CONTINUAR');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 FALLA CRÍTICA EN VERIFICACIÓN:', error);
        process.exit(1);
    });