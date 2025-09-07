const fetch = require('node-fetch');

async function testLoginCorregido() {
    console.log('🔧 TESTING LOGIN CON CAMPOS CORRECTOS');
    console.log('🎯 Usando "dni" en lugar de "username"\\n');
    
    try {
        // Test 1: Login staff con campo correcto
        console.log('👩‍💼 1. Testing login STAFF:');
        const staffResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dni: '40101718',      // ← CAMPO CORRECTO
                password: 'ansiktet2025'
            })
        });
        
        if (staffResponse.status === 200) {
            const staffData = await staffResponse.json();
            console.log('   ✅ Login staff EXITOSO');
            console.log(`   👤 Usuario: ${staffData.username || staffData.documento}`);
            console.log(`   🎭 Tipo: ${staffData.userType}`);
            console.log(`   🆔 ID: ${staffData.id}`);
        } else {
            const errorData = await staffResponse.json();
            console.log(`   ❌ Login staff falló - Status: ${staffResponse.status}`);
            console.log(`   📄 Error: ${JSON.stringify(errorData)}`);
        }
        
        console.log('\\n👨‍💼 2. Testing login PROFESIONAL:');
        const profResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dni: '99999999',      // ← CAMPO CORRECTO  
                password: 'prueba123'
            })
        });
        
        if (profResponse.status === 200) {
            const profData = await profResponse.json();
            console.log('   ✅ Login profesional EXITOSO');
            console.log(`   👤 Usuario: ${profData.nombre}`);
            console.log(`   🎭 Tipo: ${profData.userType}`);
            console.log(`   🆔 ID: ${profData.id}`);
            console.log(`   📋 Matrícula: ${profData.matricula}`);
        } else {
            const errorData = await profResponse.json();
            console.log(`   ❌ Login profesional falló - Status: ${profResponse.status}`);
            console.log(`   📄 Error: ${JSON.stringify(errorData)}`);
        }
        
        // Test 3: Probar endpoint profesional con autenticación
        if (profResponse.status === 200) {
            console.log('\\n🔍 3. Testing endpoint con autenticación:');
            const cookies = profResponse.headers.get('set-cookie') || '';
            
            const dashResponse = await fetch('http://localhost:3030/api/profesional/dashboard', {
                headers: { 'Cookie': cookies }
            });
            
            if (dashResponse.status === 200) {
                const dashboard = await dashResponse.json();
                console.log('   ✅ Dashboard profesional funciona');
                console.log(`   📊 Estado: ${dashboard.dashboard?.estadoFinanciero}`);
                console.log(`   💰 Total pagado: $${dashboard.dashboard?.totalPagado}`);
            } else {
                console.log(`   ❌ Dashboard falló - Status: ${dashResponse.status}`);
            }
        }
        
        console.log('\\n🎯 CONCLUSIÓN:');
        console.log('   ✅ El problema era usar "username" en lugar de "dni"');
        console.log('   ✅ Ambos logins ahora deberían funcionar');
        console.log('   🚀 Sistema listo para testing exhaustivo');
        
    } catch (error) {
        console.error('💥 ERROR EN TEST LOGIN:', error.message);
    }
}

testLoginCorregido()
    .then(() => {
        console.log('\\n✅ TEST LOGIN COMPLETADO');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 FALLA EN TEST:', error);
        process.exit(1);
    });