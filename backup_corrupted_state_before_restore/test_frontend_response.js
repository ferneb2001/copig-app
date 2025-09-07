const fetch = require('node-fetch');
const config = require('./config.json');

console.log('🧪 PROBANDO RESPUESTA DEL FRONTEND...');
console.log('═════════════════════════════════════════════');

async function testCHPCreation() {
    try {
        // Simular datos de la solicitud
        const testData = {
            cliente: 'TEST FRONTEND RESPONSE',
            proyecto: 'Proyecto de Prueba',
            descripcion: 'Descripción de prueba',
            ubicacion_obra: 'Ubicación de prueba',
            observaciones: 'Observaciones de prueba',
            monto_honorarios: 100000,
            porcentaje_chp: 5.0
        };
        
        console.log('📤 ENVIANDO SOLICITUD:');
        console.log(JSON.stringify(testData, null, 2));
        
        // Hacer request al endpoint
        const response = await fetch('http://localhost:3030/api/chp/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'connect.sid=s%3AW8t2vJ8uGg8Wj8m4kX9pL2nR3qY7eZ1sA0bC5dF6gH9iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4w.abcdefghijklmnopqrstuvwxyz1234567890'
        },
            body: JSON.stringify(testData)
        });
        
        console.log('\n📥 RESPUESTA DEL SERVIDOR:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('Body (raw):', responseText);
        
        try {
            const responseJson = JSON.parse(responseText);
            console.log('Body (JSON):');
            console.log(JSON.stringify(responseJson, null, 2));
            
            if (responseJson.success) {
                console.log('✅ RESPUESTA EXITOSA');
                console.log(`   Número: ${responseJson.numeroSolicitud}`);
                console.log(`   Costo: $${responseJson.costo?.toLocaleString('es-AR')}`);
                console.log(`   Estado: ${responseJson.estado}`);
            } else {
                console.log('❌ RESPUESTA CON ERROR:');
                console.log(`   Mensaje: ${responseJson.message}`);
            }
            
        } catch (parseError) {
            console.log('❌ ERROR PARSEANDO JSON:', parseError.message);
            console.log('   La respuesta no es JSON válido');
        }
        
    } catch (error) {
        console.error('❌ ERROR EN LA SOLICITUD:', error.message);
    }
}

async function checkSessionEndpoint() {
    try {
        console.log('\n🔍 VERIFICANDO ENDPOINT DE SESIÓN:');
        
        const response = await fetch('http://localhost:3030/api/session-info', {
            headers: {
                'Cookie': 'connect.sid=s%3AW8t2vJ8uGg8Wj8m4kX9pL2nR3qY7eZ1sA0bC5dF6gH9iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4w.abcdefghijklmnopqrstuvwxyz1234567890'
            }
        });
        
        const sessionInfo = await response.json();
        console.log('📋 Info de sesión:', sessionInfo);
        
    } catch (error) {
        console.error('❌ Error verificando sesión:', error.message);
    }
}

// Ejecutar pruebas
testCHPCreation();
setTimeout(checkSessionEndpoint, 2000);

console.log('\n🎯 POSIBLES CAUSAS DEL ERROR:');
console.log('1. ❓ Frontend no interpreta correctamente response.ok');
console.log('2. ❓ Problema de CORS o cookies');
console.log('3. ❓ Respuesta del servidor no tiene el formato esperado');
console.log('4. ❓ Error de parsing JSON en el frontend');
console.log('5. ❓ Problema con el status HTTP de la respuesta');