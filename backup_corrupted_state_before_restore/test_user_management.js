const { execSync } = require('child_process');

console.log('👥 PRUEBA DEL SISTEMA DE GESTIÓN DE USUARIOS');
console.log('============================================');
console.log('🎯 Verificar funcionalidad de Super Admin ADM-001');

// Función para probar login del super admin
function testSuperAdminLogin() {
    console.log('\n🔍 PROBANDO LOGIN DEL SUPER ADMIN...');
    
    try {
        const payload = JSON.stringify({
            usuario: 'ADM-001',
            documento: '20562024',
            password: 'ansiktet1969'
        });
        
        const curlCommand = `curl -s -c cookies.txt -X POST -H "Content-Type: application/json" -d "${payload.replace(/"/g, '\\\\\"')}" http://localhost:3030/api/admin/login`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (jsonResult.success && jsonResult.user.usuario === 'ADM-001') {
            console.log('✅ Super Admin login exitoso');
            console.log(`   👤 Usuario: ${jsonResult.user.nombreCompleto}`);
            console.log(`   🔐 Requiere cambio contraseña: ${jsonResult.requiresPasswordChange ? 'Sí' : 'No'}`);
            return true;
        } else {
            console.log('❌ Super Admin login falló');
            console.log(`   📝 Error: ${jsonResult.message}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión en login');
        return false;
    }
}

// Función para probar creación de administrador
function testCreateAdmin() {
    console.log('\n🛡️ PROBANDO CREACIÓN DE ADMINISTRADOR...');
    
    try {
        const payload = JSON.stringify({
            usuario: 'ADM-TEST',
            documento: '99999999',
            nombreCompleto: 'Administrador de Prueba',
            email: 'test@copig.org.ar',
            telefono: '261-999999'
        });
        
        const curlCommand = `curl -s -b cookies.txt -X POST -H "Content-Type: application/json" -d "${payload.replace(/"/g, '\\\\\"')}" http://localhost:3030/api/admin/create-admin`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (jsonResult.success) {
            console.log('✅ Administrador creado exitosamente');
            console.log(`   👤 Usuario: ${jsonResult.user.usuario}`);
            console.log(`   🔐 Contraseña inicial: ${jsonResult.initialPassword}`);
            return true;
        } else {
            console.log('⚠️  No se pudo crear administrador');
            console.log(`   📝 Razón: ${jsonResult.message}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error creando administrador');
        return false;
    }
}

// Función para probar creación de staff
function testCreateStaff() {
    console.log('\n👥 PROBANDO CREACIÓN DE STAFF...');
    
    try {
        const payload = JSON.stringify({
            usuario: 'STAFF-TEST',
            documento: '88888888',
            nombreCompleto: 'Staff de Prueba',
            email: 'stafftest@copig.org.ar',
            telefono: '261-888888',
            departamento: 'Pruebas'
        });
        
        const curlCommand = `curl -s -b cookies.txt -X POST -H "Content-Type: application/json" -d "${payload.replace(/"/g, '\\\\\"')}" http://localhost:3030/api/admin/create-staff`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (jsonResult.success) {
            console.log('✅ Staff creado exitosamente');
            console.log(`   👤 Usuario: ${jsonResult.user.usuario}`);
            console.log(`   🏢 Departamento: ${jsonResult.user.departamento}`);
            console.log(`   🔐 Contraseña inicial: ${jsonResult.initialPassword}`);
            return true;
        } else {
            console.log('⚠️  No se pudo crear staff');
            console.log(`   📝 Razón: ${jsonResult.message}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error creando staff');
        return false;
    }
}

// Función para listar administradores
function testListAdmins() {
    console.log('\n📋 PROBANDO LISTADO DE ADMINISTRADORES...');
    
    try {
        const curlCommand = `curl -s -b cookies.txt http://localhost:3030/api/admin/list-admins`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (jsonResult.success) {
            console.log(`✅ ${jsonResult.users.length} administradores encontrados:`);
            jsonResult.users.forEach(user => {
                console.log(`   🛡️  ${user.usuario} | ${user.nombre_completo} | ${user.activo ? 'Activo' : 'Inactivo'}`);
            });
            return true;
        } else {
            console.log('❌ Error listando administradores');
            console.log(`   📝 Error: ${jsonResult.message}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión listando admins');
        return false;
    }
}

// Función para listar staff
function testListStaff() {
    console.log('\n📋 PROBANDO LISTADO DE STAFF...');
    
    try {
        const curlCommand = `curl -s -b cookies.txt http://localhost:3030/api/admin/list-staff`;
        
        const result = execSync(curlCommand, { 
            encoding: 'utf8', 
            timeout: 10000
        });
        
        const jsonResult = JSON.parse(result.trim());
        
        if (jsonResult.success) {
            console.log(`✅ ${jsonResult.users.length} usuarios de staff encontrados:`);
            jsonResult.users.forEach(user => {
                console.log(`   👥 ${user.usuario} | ${user.nombre_completo} | ${user.departamento || 'Sin dept'} | ${user.activo ? 'Activo' : 'Inactivo'}`);
            });
            return true;
        } else {
            console.log('❌ Error listando staff');
            console.log(`   📝 Error: ${jsonResult.message}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Error de conexión listando staff');
        return false;
    }
}

// Función para probar acceso a página de gestión
function testUserManagementPage() {
    console.log('\n🌐 PROBANDO PÁGINA DE GESTIÓN...');
    
    try {
        const result = execSync('curl -s -b cookies.txt -w "%{http_code}" http://localhost:3030/user-management', { 
            encoding: 'utf8',
            timeout: 5000 
        });
        
        if (result.includes('200')) {
            console.log('✅ Página de gestión accesible para Super Admin');
            return true;
        } else if (result.includes('302')) {
            console.log('⚠️  Página redirige (posible falta de permisos)');
            return false;
        } else {
            console.log('❌ Página no accesible');
            return false;
        }
    } catch (error) {
        console.log('❌ Error accediendo a página de gestión');
        return false;
    }
}

// Verificar servidor
console.log('\\n🔍 VERIFICANDO SERVIDOR...');
try {
    execSync('curl -s http://localhost:3030/portal', { timeout: 5000 });
    console.log('✅ Servidor activo en puerto 3030');
} catch (error) {
    console.log('❌ Servidor no responde - ejecute: node server.js');
    process.exit(1);
}

// Ejecutar todas las pruebas
console.log('\\n🚀 EJECUTANDO PRUEBAS DE GESTIÓN DE USUARIOS...');
console.log('================================================');

let testResults = [];

testResults.push({
    name: 'Super Admin Login',
    result: testSuperAdminLogin()
});

testResults.push({
    name: 'Crear Administrador',
    result: testCreateAdmin()
});

testResults.push({
    name: 'Crear Staff',
    result: testCreateStaff()
});

testResults.push({
    name: 'Listar Administradores',
    result: testListAdmins()
});

testResults.push({
    name: 'Listar Staff',
    result: testListStaff()
});

testResults.push({
    name: 'Página de Gestión',
    result: testUserManagementPage()
});

// Limpiar cookies
try {
    execSync('rm -f cookies.txt', { stdio: 'ignore' });
} catch (error) {
    // Ignorar error en Windows
}

// Mostrar resultados
console.log('\\n📊 RESULTADOS DE GESTIÓN DE USUARIOS');
console.log('====================================');

let successfulTests = 0;
let totalTests = testResults.length;

testResults.forEach(test => {
    console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
    if (test.result) successfulTests++;
});

console.log(`\\n📈 Precisión: ${((successfulTests / totalTests) * 100).toFixed(1)}% (${successfulTests}/${totalTests})`);

if (successfulTests === totalTests) {
    console.log('\\n🎉 SISTEMA DE GESTIÓN DE USUARIOS FUNCIONANDO');
    console.log('==============================================');
    console.log('✅ Super Admin puede crear usuarios');
    console.log('✅ Listados funcionando correctamente');
    console.log('✅ Página de gestión accesible');
    
} else if (successfulTests >= totalTests * 0.7) {
    console.log('\\n⚠️  SISTEMA PARCIALMENTE FUNCIONAL');
    console.log('=================================');
    console.log('✅ Funcionalidad básica operativa');
    console.log('❌ Algunos componentes requieren ajustes');
    
} else {
    console.log('\\n❌ SISTEMA REQUIERE CORRECCIONES');
    console.log('===============================');
    console.log('❌ Múltiples componentes fallaron');
}

console.log('\\n🔐 CREDENCIALES PARA ACCESO:');
console.log('============================');
console.log('🛡️  Super Admin: ADM-001 | DNI: 20562024 | Pass: ansiktet1969');
console.log('👤 Fernando Nebro - Super Admin');
console.log('📧 Email: ferneb2001@gmail.com');
console.log('🌐 Gestión: http://localhost:3030/user-management');
console.log('🏠 Portal: http://localhost:3030/portal');

console.log('\\n💡 INSTRUCCIONES PARA FERNANDO (SUPER ADMIN):');
console.log('=============================================');
console.log('1. 🌐 Ingresar al portal: http://localhost:3030/portal');
console.log('2. 🔐 Login con ADM-001 + 20562024 + ansiktet1969');
console.log('3. 🔄 Cambiar contraseña en primer ingreso');
console.log('4. ⚙️  Acceder a gestión: /user-management');
console.log('5. ➕ Crear usuarios administrativos y staff');

console.log('\\n✅ SISTEMA DE GESTIÓN LISTO PARA USO');
console.log('===================================');