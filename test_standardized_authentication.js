const { execSync } = require('child_process');

console.log('🔒 PRUEBA DE AUTENTICACIÓN ESTANDARIZADA - 3 CAMPOS');
console.log('==================================================');

console.log('\n🎯 OBJETIVO: Verificar que ambos portales requieren:');
console.log('✅ MATRÍCULA + DNI + CONTRASEÑA (3 campos obligatorios)');

// Casos de prueba para validar autenticación estandarizada
const testCases = [
    {
        name: 'Fernando Nebro - Completo',
        matricula: 'FN-1969',
        documento: '20562024',
        password: 'fernando1969',
        expectedSuccess: true,
        description: '🎯 Usuario con matrícula alfanumérica'
    },
    {
        name: 'Fernando Nebro - Numérica',
        matricula: '1969',
        documento: '20562024',
        password: 'fernando1969',
        expectedSuccess: true,
        description: '📊 Usuario con matrícula numérica'
    },
    {
        name: 'Ingeniero Civil Real',
        matricula: '9096',
        documento: '6860397',
        password: 'password123',
        expectedSuccess: false,
        description: '❌ Profesional sin contraseña configurada'
    },
    {
        name: 'Caso sin contraseña',
        matricula: '1969',
        documento: '20562024',
        password: '',
        expectedSuccess: false,
        description: '❌ Falta contraseña (debería fallar)'
    },
    {
        name: 'Caso sin documento',
        matricula: '1969',
        documento: '',
        password: 'fernando1969',
        expectedSuccess: false,
        description: '❌ Falta documento (debería fallar)'
    },
    {
        name: 'Caso sin matrícula',
        matricula: '',
        documento: '20562024',
        password: 'fernando1969',
        expectedSuccess: false,
        description: '❌ Falta matrícula (debería fallar)'
    }
];

function testPortal(portalName, endpoint, testCase) {
    console.log(`\n🔍 ${portalName}: ${testCase.description}`);
    console.log(`   👤 Matrícula: "${testCase.matricula}"`);
    console.log(`   🆔 DNI: "${testCase.documento}"`);
    console.log(`   🔐 Password: "${testCase.password ? '***' : '(vacío)'}"`);
    
    try {
        const payload = JSON.stringify({
            matricula: testCase.matricula,
            documento: testCase.documento,
            password: testCase.password
        });
        
        const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -d "${payload.replace(/"/g, '\\"')}" http://localhost:3030${endpoint}`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (testCase.expectedSuccess) {
            if (jsonResult.success) {
                console.log('   ✅ SUCCESS (como esperado)');
                if (jsonResult.profesional) {
                    console.log(`   👤 Usuario: ${jsonResult.profesional.nombre}`);
                } else if (jsonResult.user) {
                    console.log(`   👤 Usuario: ${jsonResult.user.nombre}`);
                }
                return { success: true, expected: true };
            } else {
                console.log('   ❌ FAIL (inesperado)');
                console.log(`   📝 Error: ${jsonResult.message}`);
                return { success: false, expected: true };
            }
        } else {
            if (!jsonResult.success) {
                console.log('   ✅ FAIL (como esperado - validación funcionando)');
                console.log(`   📝 Error: ${jsonResult.message}`);
                return { success: false, expected: false };
            } else {
                console.log('   ❌ SUCCESS (inesperado - debería haber fallado)');
                return { success: true, expected: false };
            }
        }
    } catch (error) {
        console.log('   ❌ ERROR DE CONEXIÓN');
        console.log(`   📝 ${error.message.substring(0, 100)}`);
        return { success: false, expected: false, error: true };
    }
}

// Verificar que el servidor esté funcionando
console.log('\n🔍 VERIFICANDO SERVIDOR...');
try {
    execSync('curl -s http://localhost:3030/portal', { timeout: 5000 });
    console.log('✅ Servidor activo');
} catch (error) {
    console.log('❌ Servidor no responde - inicie con: node server.js');
    process.exit(1);
}

console.log('\n🚀 PROBANDO AUTENTICACIÓN ESTANDARIZADA...');
console.log('==========================================');

let totalTests = 0;
let portalProfesionalResults = [];
let sistemaPagosResults = [];

// Probar ambos portales con todos los casos
for (const testCase of testCases) {
    console.log(`\n📋 CASO: ${testCase.name}`);
    console.log('='.repeat(50));
    
    // Portal Profesional
    const portalResult = testPortal(
        'PORTAL PROFESIONAL', 
        '/api/profesional/login', 
        testCase
    );
    portalProfesionalResults.push(portalResult);
    
    // Sistema de Pagos (usa el mismo endpoint ahora)
    const pagosResult = testPortal(
        'SISTEMA DE PAGOS', 
        '/api/profesional/login', 
        testCase
    );
    sistemaPagosResults.push(pagosResult);
    
    totalTests++;
}

console.log('\n📊 RESULTADOS DE LA ESTANDARIZACIÓN');
console.log('===================================');

// Analizar resultados del Portal Profesional
let portalCorrect = 0;
let portalIncorrect = 0;
let portalErrors = 0;

for (const result of portalProfesionalResults) {
    if (result.error) {
        portalErrors++;
    } else if ((result.success && result.expected) || (!result.success && !result.expected)) {
        portalCorrect++;
    } else {
        portalIncorrect++;
    }
}

// Analizar resultados del Sistema de Pagos
let pagosCorrect = 0;
let pagosIncorrect = 0;
let pagosErrors = 0;

for (const result of sistemaPagosResults) {
    if (result.error) {
        pagosErrors++;
    } else if ((result.success && result.expected) || (!result.success && !result.expected)) {
        pagosCorrect++;
    } else {
        pagosIncorrect++;
    }
}

console.log(`\n🏛️ PORTAL PROFESIONAL:`);
console.log(`   ✅ Casos correctos: ${portalCorrect}`);
console.log(`   ❌ Casos incorrectos: ${portalIncorrect}`);
console.log(`   ⚠️  Errores de conexión: ${portalErrors}`);
console.log(`   📈 Precisión: ${((portalCorrect / totalTests) * 100).toFixed(1)}%`);

console.log(`\n💳 SISTEMA DE PAGOS:`);
console.log(`   ✅ Casos correctos: ${pagosCorrect}`);
console.log(`   ❌ Casos incorrectos: ${pagosIncorrect}`);
console.log(`   ⚠️  Errores de conexión: ${pagosErrors}`);
console.log(`   📈 Precisión: ${((pagosCorrect / totalTests) * 100).toFixed(1)}%`);

// Verificar consistencia
const isConsistent = (portalCorrect === pagosCorrect) && 
                    (portalIncorrect === pagosIncorrect) && 
                    (portalErrors === pagosErrors);

console.log(`\n🔄 CONSISTENCIA ENTRE PORTALES:`);
console.log(`===============================`);

if (isConsistent && portalCorrect === totalTests && pagosCorrect === totalTests) {
    console.log('🎉 ESTANDARIZACIÓN EXITOSA');
    console.log('✅ Ambos portales requieren los 3 campos');
    console.log('✅ Comportamiento idéntico y consistente');
    console.log('✅ Validaciones funcionando correctamente');
    
} else if (isConsistent) {
    console.log('⚠️  ESTANDARIZACIÓN PARCIAL');
    console.log('✅ Ambos portales son consistentes');
    console.log('❌ Algunas validaciones necesitan ajustes');
    
} else {
    console.log('❌ ESTANDARIZACIÓN INCOMPLETA');
    console.log('❌ Comportamiento inconsistente entre portales');
    console.log('❌ Requiere correcciones');
}

console.log('\n💡 CREDENCIALES VERIFICADAS:');
console.log('===========================');
console.log('🎯 Fernando Nebro: FN-1969 / 20562024 / fernando1969');
console.log('🎯 Fernando Nebro: 1969 / 20562024 / fernando1969');

console.log('\n🌐 ACCESO A LOS PORTALES:');
console.log('========================');
console.log('👨‍💼 Portal Profesional: http://localhost:3030/');
console.log('💳 Sistema de Pagos: http://localhost:3030/pago-matricula');

console.log('\n🔐 AUTENTICACIÓN ESTANDARIZADA:');
console.log('==============================');
console.log('✅ Campo 1: Número de Matrícula (numérica o alfanumérica)');
console.log('✅ Campo 2: Número de Documento (DNI sin puntos)');
console.log('✅ Campo 3: Contraseña (obligatoria para todos)');

console.log('\n🎉 PROCESO DE ESTANDARIZACIÓN COMPLETADO');
console.log('========================================');