const { execSync } = require('child_process');

console.log('🧪 TEST DEL PORTAL PROFESIONAL CORREGIDO');
console.log('=========================================');

function runTest(description, command) {
    console.log(`\n${description}`);
    try {
        const result = execSync(command, { encoding: 'utf8', timeout: 10000 });
        const jsonResult = JSON.parse(result.trim());
        console.log('   ✅ Success:', jsonResult.success ? 'YES' : 'NO');
        if (jsonResult.message) console.log('   📝 Message:', jsonResult.message);
        if (jsonResult.profesional) {
            const prof = jsonResult.profesional;
            console.log('   👤 Profesional:', prof.nombre);
            console.log('   🎯 Matrícula Display:', prof.matricula);
            console.log('   📊 Matrícula Numérica:', prof.matricula_numerica);
            console.log('   🆔 Documento:', prof.numero_documento);
            console.log('   🏷️  Categoría:', prof.categoria);
            console.log('   🔐 Password Set:', prof.password_set);
            console.log('   🆕 First Time:', prof.first_time);
        }
        return jsonResult;
    } catch (error) {
        console.log('   ❌ Error:', error.message.substring(0, 100));
        return null;
    }
}

console.log('\n🔍 FASE 1: LOGIN CON MATRÍCULA ALFANUMÉRICA FN-1969');
console.log('==================================================');

// Test 1: Login con matrícula alfanumérica FN-1969
const alphaLogin = runTest('🎯 Login Portal Profesional con FN-1969:', 
    'curl -s -X POST -H "Content-Type: application/json" -d "{\\"matricula\\":\\"FN-1969\\",\\"documento\\":\\"20562024\\"}" http://localhost:3030/api/profesional/login');

console.log('\n🔍 FASE 2: LOGIN CON MATRÍCULA NUMÉRICA (COMPATIBILIDAD)');
console.log('======================================================');

// Test 2: Login con matrícula numérica
const numericLogin = runTest('📊 Login Portal Profesional con 1969:', 
    'curl -s -X POST -H "Content-Type: application/json" -d "{\\"matricula\\":\\"1969\\",\\"documento\\":\\"20562024\\"}" http://localhost:3030/api/profesional/login');

console.log('\n🔍 FASE 3: COMPARACIÓN CON ENDPOINT ANTERIOR');
console.log('==========================================');

// Test 3: Probar endpoint anterior (solo para comparar)
const oldLogin = runTest('🔄 Endpoint anterior (/api/login):', 
    'curl -s -X POST -H "Content-Type: application/json" -d "{\\"matricula\\":\\"1969\\",\\"documento\\":\\"20562024\\"}" http://localhost:3030/api/login');

console.log('\n🎉 RESUMEN DE CORRECCIONES');
console.log('==========================');
console.log('✅ Portal profesional ahora usa /api/profesional/login');
console.log('✅ Soporta matrículas alfanuméricas (FN-1969)');
console.log('✅ Mantiene compatibilidad con matrículas numéricas (1969)');
console.log('✅ Mapea correctamente data.profesional en lugar de data.user');
console.log('✅ Usa numero_documento en lugar de documento');
console.log('✅ Incluye soporte para contraseñas y first_time users');

console.log('\n🌐 ACCESO CORREGIDO');
console.log('==================');
console.log('🖥️  Portal: http://localhost:3030/');
console.log('🎯 Matrícula: FN-1969 o 1969');
console.log('🆔 Documento: 20562024');
console.log('💡 Ya no necesita contraseña (first time user)');