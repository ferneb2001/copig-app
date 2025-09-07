const fetch = require('node-fetch');

async function testSolicitudCorregida() {
    console.log('🧪 Probando creación de solicitud CHP con comitente corregido...');
    
    try {
        // 1. Login
        console.log('\n1. Haciendo login...');
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dni: '99999999',
                password: 'prueba123'
            })
        });

        if (!loginResponse.ok) {
            console.error('❌ Error en login:', await loginResponse.text());
            return;
        }

        const cookies = loginResponse.headers.raw()['set-cookie'];
        const cookieString = cookies ? cookies.join('; ') : '';
        console.log('✅ Login exitoso');

        // 2. Crear nueva solicitud CHP
        console.log('\n2. Creando nueva solicitud CHP...');
        
        const createResponse = await fetch('http://localhost:3030/api/chp/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString
            },
            body: JSON.stringify({
                comitente: 'EMPRESA DE PRUEBA S.A.',
                proyecto: 'Proyecto de prueba con comitente',
                descripcion: 'Esta es una prueba para verificar que el campo comitente se guarda correctamente',
                ubicacion_obra: 'Mendoza, Argentina - Prueba Técnica'
            })
        });

        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ Solicitud creada exitosamente:');
            console.log(`   - Número: ${createData.solicitud.numero_solicitud}`);
            console.log(`   - Comitente: ${createData.solicitud.comitente || 'NO ESPECIFICADO'}`);
            console.log(`   - Proyecto: ${createData.solicitud.proyecto}`);
            console.log(`   - Estado: ${createData.solicitud.estado}`);
        } else {
            console.error('❌ Error creando solicitud:', await createResponse.text());
            return;
        }

        // 3. Verificar que aparezca en la lista
        console.log('\n3. Verificando lista de solicitudes...');
        
        const listResponse = await fetch('http://localhost:3030/api/profesional/solicitudes-chp', {
            headers: {
                'Cookie': cookieString
            }
        });

        if (listResponse.ok) {
            const listData = await listResponse.json();
            console.log(`📋 Total de solicitudes: ${listData.solicitudes.length}`);
            
            // Mostrar las últimas 3 solicitudes
            const ultimasSolicitudes = listData.solicitudes.slice(0, 3);
            console.log('\n📄 Últimas 3 solicitudes:');
            ultimasSolicitudes.forEach((sol, index) => {
                console.log(`${index + 1}. ${sol.numero_solicitud}`);
                console.log(`   - Comitente: ${sol.comitente || 'NO ESPECIFICADO'}`);
                console.log(`   - Proyecto: ${sol.proyecto}`);
                console.log(`   - Estado: ${sol.estado}`);
                console.log('');
            });

            // Verificar si la nueva solicitud tiene comitente
            const solicitudNueva = ultimasSolicitudes[0];
            if (solicitudNueva && solicitudNueva.comitente && solicitudNueva.comitente !== null) {
                console.log('🎉 ¡PROBLEMA SOLUCIONADO! El campo comitente se guarda correctamente');
            } else {
                console.log('❌ El problema persiste - comitente sigue siendo null');
            }
            
        } else {
            console.error('❌ Error obteniendo lista:', await listResponse.text());
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

testSolicitudCorregida();