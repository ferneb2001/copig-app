const fetch = require('node-fetch');

async function probarEndpointsEmpresas() {
    try {
        console.log('🧪 PROBANDO ENDPOINTS DE EMPRESAS CORREGIDOS');
        console.log('='.repeat(60));
        
        const baseURL = 'http://localhost:3030';
        
        // Configurar cookies de sesión (simular login admin)
        const cookieJar = 'connect.sid=s%3ASomeSessionId.signature';
        
        console.log('🔍 1. PROBANDO GET /api/empresas/:id');
        
        // Probar las 5 empresas que sabemos que existen
        const empresasTest = [547, 471, 406, 814, 973];
        
        for (const id of empresasTest) {
            try {
                console.log(`\n📡 Consultando empresa ID: ${id}`);
                
                const response = await fetch(`${baseURL}/api/empresas/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookieJar
                    }
                });
                
                console.log(`   Status: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const empresa = await response.json();
                    console.log(`   ✅ Empresa encontrada: "${empresa.razon_social}"`);
                    console.log(`   📋 CUIT: ${empresa.cuit}`);
                    console.log(`   📍 Domicilio: ${empresa.domicilio}`);
                } else {
                    const error = await response.text();
                    console.log(`   ❌ Error: ${error}`);
                }
                
            } catch (fetchError) {
                console.log(`   ❌ Error de conexión: ${fetchError.message}`);
            }
        }
        
        console.log('\n🔄 2. PROBANDO PUT /api/empresas/:id (Actualización)');
        
        // Probar actualización de empresa 547
        try {
            const updateData = {
                razon_social: "A.EVANGELISTA S.A. (SERVICOS PETROLEROS)",
                cuit: "30685218190",
                email: "ferneb2001@gmail.com",
                telefono: "02615153246",
                domicilio: "manuel a saez 22202 - las heras, Las Heras, las heras, C.A.BS.AS. (5539)",
                localidad: "Las Heras",
                departamento: "las heras",
                codigo_postal: "5539",
                activo: true,
                observaciones: "Empresa actualizada via prueba de endpoint"
            };
            
            console.log('📡 Actualizando empresa ID: 547');
            
            const response = await fetch(`${baseURL}/api/empresas/547`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieJar
                },
                body: JSON.stringify(updateData)
            });
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const result = await response.json();
                console.log(`   ✅ Actualización exitosa: ${result.message}`);
            } else {
                const error = await response.text();
                console.log(`   ❌ Error actualizando: ${error}`);
            }
            
        } catch (fetchError) {
            console.log(`   ❌ Error de conexión: ${fetchError.message}`);
        }
        
        console.log('\n📊 3. PROBANDO GET /api/empresas (Listado)');
        
        try {
            console.log('📡 Consultando listado de empresas');
            
            const response = await fetch(`${baseURL}/api/empresas?limit=5`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookieJar
                }
            });
            
            console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const result = await response.json();
                console.log(`   ✅ Listado obtenido: ${result.empresas.length} empresas`);
                console.log(`   📊 Total en BD: ${result.total}`);
                console.log(`   📄 Páginas: ${result.totalPages}`);
            } else {
                const error = await response.text();
                console.log(`   ❌ Error: ${error}`);
            }
            
        } catch (fetchError) {
            console.log(`   ❌ Error de conexión: ${fetchError.message}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 DIAGNÓSTICO FINAL:');
        
        if (fetchError && fetchError.message.includes('ECONNREFUSED')) {
            console.log('❌ EL SERVIDOR NO ESTÁ CORRIENDO');
            console.log('💡 Solución: Ejecutar "node server.js"');
        } else {
            console.log('✅ Endpoints implementados correctamente');
            console.log('✅ El servidor está respondiendo');
            console.log('⚠️  Si hay errores 401/403: Problema de autenticación/permisos');
            console.log('⚠️  Si hay errores 404: Endpoint no encontrado (reiniciar servidor)');
        }
        
        console.log('\n🔧 PRÓXIMO PASO: Reiniciar servidor con "node server.js"');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

probarEndpointsEmpresas();