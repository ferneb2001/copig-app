const fetch = require('node-fetch');

async function testProfesionalesPagos() {
    console.log('=== PROBANDO ENDPOINT CORREGIDO DE PROFESIONALES ===\n');
    
    try {
        // Simular una sesión admin (esto normalmente requeriría login)
        const response = await fetch('http://localhost:3030/api/admin/profesionales', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // En un escenario real necesitaríamos cookies de sesión
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            console.log('❌ Acceso denegado - Se requiere autenticación');
            console.log('💡 Necesitas estar logueado como admin para ver los datos');
            return;
        }
        
        const data = await response.json();
        
        console.log('✅ Respuesta del endpoint:', {
            status: response.status,
            success: data.success,
            total_profesionales: data.profesionales?.length || 0
        });
        
        if (data.profesionales && data.profesionales.length > 0) {
            console.log('\n📋 PRIMEROS 3 PROFESIONALES CON DATOS DE PAGOS:');
            data.profesionales.slice(0, 3).forEach((prof, index) => {
                console.log(`\n${index + 1}. ${prof.nombre}`);
                console.log(`   DNI: ${prof.dni}`);
                console.log(`   Matrícula: ${prof.matricula}`);
                console.log(`   Último pago: ${prof.ultimo_pago || 'Sin pagos'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testProfesionalesPagos();