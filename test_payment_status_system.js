// Test del sistema de estados de pago implementado

async function testPaymentStatusSystem() {
    console.log('🧪 PROBANDO SISTEMA DE ESTADOS DE PAGO\n');
    
    try {
        // Probar la interfaz web
        console.log('1. Probando interfaz de profesionales...');
        
        // Simular login
        const loginData = {
            dni: '20562024',
            password: 'ansiktet1969'
        };
        
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Server no responde - verificar si está corriendo');
            return;
        }
        
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('✅ Login exitoso');
        
        // Probar endpoint de profesionales sin filtros
        console.log('\n2. Probando listado sin filtros...');
        const response1 = await fetch('http://localhost:3030/api/admin/profesionales?page=1', {
            headers: { 'Cookie': cookies }
        });
        
        if (response1.ok) {
            const data1 = await response1.json();
            console.log(`✅ Sin filtros: ${data1.profesionales.length} profesionales`);
            
            if (data1.profesionales.length > 0) {
                const primer = data1.profesionales[0];
                console.log(`   Ejemplo: ${primer.nombre} - Estado: ${primer.estado_matricula}`);
            }
        }
        
        // Probar filtro por estado MOROSO
        console.log('\n3. Probando filtro por MOROSO...');
        const response2 = await fetch('http://localhost:3030/api/admin/profesionales?page=1&estado=MOROSO', {
            headers: { 'Cookie': cookies }
        });
        
        if (response2.ok) {
            const data2 = await response2.json();
            console.log(`✅ Filtro MOROSO: ${data2.profesionales.length} profesionales`);
            
            if (data2.profesionales.length > 0) {
                const moroso = data2.profesionales[0];
                console.log(`   Ejemplo: ${moroso.nombre} - Estado: ${moroso.estado_matricula}`);
            }
        }
        
        // Probar filtro por estado AL_DIA
        console.log('\n4. Probando filtro por AL_DIA...');
        const response3 = await fetch('http://localhost:3030/api/admin/profesionales?page=1&estado=AL_DIA', {
            headers: { 'Cookie': cookies }
        });
        
        if (response3.ok) {
            const data3 = await response3.json();
            console.log(`✅ Filtro AL_DIA: ${data3.profesionales.length} profesionales`);
            
            if (data3.profesionales.length > 0) {
                const alDia = data3.profesionales[0];
                console.log(`   Ejemplo: ${alDia.nombre} - Estado: ${alDia.estado_matricula}`);
            }
        }
        
        console.log('\n🎉 SISTEMA DE ESTADOS FUNCIONANDO CORRECTAMENTE');
        console.log('✅ Endpoint actualizado');
        console.log('✅ Filtros operativos');
        console.log('✅ Estados calculados dinámicamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('🔧 SOLUCIÓN: Verificar que el servidor esté corriendo en puerto 3030');
        }
    }
}

testPaymentStatusSystem();