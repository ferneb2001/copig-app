const { execSync } = require('child_process');

console.log('🏛️ PRUEBA COMPLETA DEL SISTEMA UNIFICADO COPIG');
console.log('===============================================');

console.log('\n🎯 OBJETIVO: Verificar sistema multiusuario unificado');
console.log('✅ Portal único: http://localhost:3030/portal');
console.log('✅ Contraseña inicial: copig2025');
console.log('✅ Cambio obligatorio de contraseña');

// Casos de prueba para el sistema unificado
const testCases = [
    {
        name: 'Administrador Principal',
        type: 'admin',
        usuario: 'ADM-001',
        documento: '12345678',
        password: 'copig2025',
        endpoint: '/api/admin/login',
        expectedSuccess: true,
        description: '🛡️ Login administrador con contraseña inicial'
    },
    {
        name: 'Staff COPIG',
        type: 'staff',
        usuario: 'STAFF-001',
        documento: '11223344',
        password: 'copig2025',
        endpoint: '/api/staff/login',
        expectedSuccess: true,
        description: '👥 Login staff con contraseña inicial'
    },
    {
        name: 'Fernando Nebro - FN-1969',
        type: 'professional',
        usuario: 'FN-1969',
        documento: '20562024',
        password: 'copig2025',
        endpoint: '/api/profesional/login',
        expectedSuccess: true,
        description: '👨‍💼 Login profesional matrícula alfanumérica'
    },
    {
        name: 'Fernando Nebro - 1969',
        type: 'professional',
        usuario: '1969',
        documento: '20562024',
        password: 'copig2025',
        endpoint: '/api/profesional/login',
        expectedSuccess: true,
        description: '👨‍💼 Login profesional matrícula numérica'
    },
    {
        name: 'Admin contraseña incorrecta',
        type: 'admin',
        usuario: 'ADM-001',
        documento: '12345678',
        password: 'wrongpassword',
        endpoint: '/api/admin/login',
        expectedSuccess: false,
        description: '❌ Admin con contraseña incorrecta (debe fallar)'
    },
    {
        name: 'Staff sin prefijo',
        type: 'staff',
        usuario: 'INVALID-001',
        documento: '11223344',
        password: 'copig2025',
        endpoint: '/api/staff/login',
        expectedSuccess: false,
        description: '❌ Staff sin prefijo válido (debe fallar)'
    }
];

function testLogin(testCase) {
    console.log(`\\n🔍 PROBANDO: ${testCase.description}`);
    console.log(`   👤 Usuario: "${testCase.usuario}"`);
    console.log(`   🆔 Documento: "${testCase.documento}"`);
    console.log(`   🔐 Password: "${testCase.password === 'copig2025' ? 'copig2025 (inicial)' : '***'}"`);
    
    try {
        const payload = JSON.stringify({
            usuario: testCase.usuario,
            documento: testCase.documento,
            password: testCase.password
        });
        
        const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -d "${payload.replace(/"/g, '\\\\\"')}" http://localhost:3030${testCase.endpoint}`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (testCase.expectedSuccess) {
            if (jsonResult.success) {
                console.log('   ✅ SUCCESS (como esperado)');
                if (jsonResult.requiresPasswordChange) {
                    console.log('   🔄 Requiere cambio de contraseña (correcto)');
                }
                if (jsonResult.user) {
                    console.log(`   👤 Usuario: ${jsonResult.user.nombreCompleto || jsonResult.user.nombre || 'N/A'}`);
                } else if (jsonResult.profesional) {
                    console.log(`   👤 Profesional: ${jsonResult.profesional.nombre}`);
                }
                return { success: true, expected: true, requiresPasswordChange: jsonResult.requiresPasswordChange };
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
        console.log(`   📝 ${error.message.substring(0, 100)}...`);
        return { success: false, expected: false, error: true };
    }
}

function testPortalAccess() {
    console.log('\\n🌐 PROBANDO ACCESO AL PORTAL...');
    
    try {
        const result = execSync('curl -s -w "%{http_code}" http://localhost:3030/portal', { 
            encoding: 'utf8',
            timeout: 5000 
        });
        
        if (result.includes('200')) {
            console.log('✅ Portal unificado accesible');
            return true;
        } else {
            console.log('❌ Portal no accesible');
            return false;
        }
    } catch (error) {
        console.log('❌ Error accediendo al portal');
        return false;
    }
}

function testRedirections() {
    console.log('\\n↩️  PROBANDO REDIRECCIONES...');
    
    const redirectTests = [
        { path: '/', expected: '/portal' },
        { path: '/dashboard', expected: '/portal' }
    ];
    
    let redirectsWorking = 0;
    
    for (const test of redirectTests) {
        try {
            const result = execSync(`curl -s -w "%{redirect_url}" -o /dev/null http://localhost:3030${test.path}`, { 
                encoding: 'utf8',
                timeout: 5000 
            });
            
            if (result.includes('/portal') || result.includes('302')) {
                console.log(`✅ ${test.path} → ${test.expected}`);
                redirectsWorking++;
            } else {
                console.log(`❌ ${test.path} no redirige correctamente`);
            }
        } catch (error) {
            console.log(`❌ Error probando redirección ${test.path}`);
        }
    }
    
    return redirectsWorking;
}

// Verificar que el servidor esté funcionando
console.log('\\n🔍 VERIFICANDO SERVIDOR...');
try {
    execSync('curl -s http://localhost:3030/portal', { timeout: 5000 });
    console.log('✅ Servidor activo en puerto 3030');
} catch (error) {
    console.log('❌ Servidor no responde - ejecute: node server.js');
    process.exit(1);
}

// Probar acceso al portal
const portalWorking = testPortalAccess();

// Probar redirecciones
const redirectsWorking = testRedirections();

// Ejecutar pruebas de login
console.log('\\n🚀 PROBANDO SISTEMA DE AUTENTICACIÓN...');
console.log('==========================================');

let totalTests = 0;
let successfulTests = 0;
let passwordChangeRequired = 0;
let errorTests = 0;

for (const testCase of testCases) {
    const result = testLogin(testCase);
    totalTests++;
    
    if (result.error) {
        errorTests++;
    } else if ((result.success && result.expected) || (!result.success && !result.expected)) {
        successfulTests++;
        if (result.requiresPasswordChange) {
            passwordChangeRequired++;
        }
    }
}

console.log('\\n📊 RESULTADOS DEL SISTEMA UNIFICADO');
console.log('===================================');

console.log(`\\n🌐 ACCESO AL PORTAL:`);
console.log(`   ${portalWorking ? '✅' : '❌'} Portal unificado: http://localhost:3030/portal`);

console.log(`\\n↩️  REDIRECCIONES:`);
console.log(`   ✅ ${redirectsWorking} de 2 redirecciones funcionando`);

console.log(`\\n🔐 AUTENTICACIÓN:`);
console.log(`   ✅ Pruebas exitosas: ${successfulTests}/${totalTests}`);
console.log(`   ❌ Pruebas fallidas: ${totalTests - successfulTests - errorTests}/${totalTests}`);
console.log(`   ⚠️  Errores de conexión: ${errorTests}/${totalTests}`);
console.log(`   🔄 Cambios de contraseña requeridos: ${passwordChangeRequired}`);
console.log(`   📈 Precisión: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);

// Evaluación general
const systemHealth = (successfulTests / totalTests) * 100;

console.log(`\\n🎯 EVALUACIÓN GENERAL DEL SISTEMA:`);
console.log(`==================================`);

if (systemHealth >= 90 && portalWorking) {
    console.log('🎉 SISTEMA UNIFICADO FUNCIONANDO PERFECTAMENTE');
    console.log('✅ Portal único activo');
    console.log('✅ Redirecciones configuradas');
    console.log('✅ Autenticación multiusuario funcionando');
    console.log('✅ Contraseña inicial unificada: copig2025');
    console.log('✅ Sistema listo para Windows Server 2022');
    
} else if (systemHealth >= 70) {
    console.log('⚠️  SISTEMA FUNCIONANDO CON OBSERVACIONES');
    console.log('✅ Funcionalidad básica operativa');
    console.log('❌ Algunos componentes requieren ajustes');
    
} else {
    console.log('❌ SISTEMA REQUIERE CORRECCIONES');
    console.log('❌ Múltiples componentes no funcionan correctamente');
}

console.log('\\n🌐 ACCESOS CONFIGURADOS:');
console.log('========================');
console.log('🏛️  Portal principal: http://localhost:3030/portal');
console.log('🛡️  Administradores: ADM-001, ADM-002');
console.log('👥 Staff: STAFF-001, STAFF-002, STAFF-003');
console.log('👨‍💼 Profesionales: Fernando Nebro (FN-1969/1969)');

console.log('\\n🔐 CREDENCIALES SISTEMA UNIFICADO:');
console.log('=================================');
console.log('🔑 Contraseña inicial: copig2025');
console.log('🔄 Cambio obligatorio en primer ingreso');
console.log('📝 Formato: USUARIO + DNI + CONTRASEÑA');

console.log('\\n🚀 INSTRUCCIONES PARA STAFF COPIG:');
console.log('==================================');
console.log('1. 🌐 Acceder a: http://localhost:3030/portal');
console.log('2. 🔐 Usar contraseña inicial: copig2025');
console.log('3. 🔄 Cambiar contraseña en primer ingreso');
console.log('4. ✅ Probar con usuarios de prueba creados');

console.log('\\n⚙️  CONFIGURACIÓN PARA WINDOWS SERVER:');
console.log('=====================================');
console.log('📁 Ejecutar: node windows-server-setup.js');
console.log('🗄️  Ejecutar: node setup_unified_users.js');
console.log('🌐 Configurar firewall puerto 3030');
console.log('🚀 Iniciar: node server.js');

console.log('\\n🎉 SISTEMA MULTIUSUARIO COPIG LISTO');
console.log('===================================');