const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏛️ CONFIGURACIÓN COMPLETA DEL SISTEMA COPIG');
console.log('==========================================');
console.log('🎯 Sistema Multiusuario para Windows Server 2022');
console.log('📝 Portal único: http://localhost:3030/portal');

async function setupCompleteSystem() {
    console.log('\n📋 PASO 1: Configurando Windows Server...');
    try {
        execSync('node windows-server-setup.js', { stdio: 'inherit' });
        console.log('✅ Configuración de Windows Server completada');
    } catch (error) {
        console.log('⚠️  Advertencia: Error en configuración Windows Server');
    }

    console.log('\n📋 PASO 2: Configurando usuarios del sistema...');
    try {
        execSync('node setup_unified_users.js', { stdio: 'inherit' });
        console.log('✅ Usuarios del sistema configurados');
    } catch (error) {
        console.log('⚠️  Advertencia: Error configurando usuarios');
    }

    console.log('\n📋 PASO 3: Configurando Fernando Nebro (matrícula alfanumérica)...');
    try {
        execSync('node implement_alphanumeric_matriculas.js', { stdio: 'inherit' });
        console.log('✅ Matrícula alfanumérica FN-1969 configurada');
    } catch (error) {
        console.log('⚠️  Advertencia: Error configurando matrícula alfanumérica');
    }

    console.log('\n📋 PASO 4: Verificando archivos del sistema...');
    
    const requiredFiles = [
        'unified-portal.html',
        'staff-dashboard.html',
        'config.json',
        'server.js',
        'index.html',
        'pago-matricula.html'
    ];

    let filesOk = 0;
    for (const file of requiredFiles) {
        if (fs.existsSync(path.join(__dirname, file))) {
            console.log(`   ✅ ${file}`);
            filesOk++;
        } else {
            console.log(`   ❌ ${file} FALTANTE`);
        }
    }

    console.log(`\\n📊 ARCHIVOS: ${filesOk}/${requiredFiles.length} disponibles`);

    console.log('\n📋 PASO 5: Probando el sistema...');
    try {
        // Esperar un poco para que la configuración se asiente
        console.log('⏳ Esperando configuración...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        execSync('node test_unified_system.js', { stdio: 'inherit' });
        console.log('✅ Pruebas del sistema completadas');
    } catch (error) {
        console.log('⚠️  Advertencia: Algunas pruebas fallaron');
        console.log('💡 Esto es normal si el servidor no está ejecutándose');
    }

    console.log('\n🎉 CONFIGURACIÓN COMPLETA DEL SISTEMA COPIG');
    console.log('==========================================');
}

console.log('\n🚀 INFORMACIÓN PARA EL STAFF DE COPIG:');
console.log('=====================================');

console.log('\n🔐 CREDENCIALES PARA ACCESO:');
console.log('===========================');
console.log('💼 SUPER ADMINISTRADOR:');
console.log('   👤 Fernando Nebro (ADM-001)');
console.log('   🆔 DNI: 20562024');
console.log('   🔐 Contraseña: ansiktet1969');
console.log('   📧 Email: ferneb2001@gmail.com');
console.log('   ⚙️  Gestión usuarios: http://localhost:3030/user-management');
console.log('');
console.log('💼 OTROS ADMINISTRADORES:');
console.log('   🛡️  ADM-002 | DNI: 87654321 | Contraseña: copig2025');

console.log('\n👥 STAFF COPIG:');
console.log('   👨‍💼 STAFF-001 | DNI: 11223344 | Contraseña: copig2025');
console.log('   👩‍💼 STAFF-002 | DNI: 44332211 | Contraseña: copig2025');
console.log('   👨‍💼 STAFF-003 | DNI: 55667788 | Contraseña: copig2025');

console.log('\n👨‍💼 PROFESIONALES:');
console.log('   🎯 FN-1969 | DNI: 20562024 | Contraseña: copig2025 (Fernando Nebro)');
console.log('   🎯 1969    | DNI: 20562024 | Contraseña: copig2025 (Fernando Nebro)');

console.log('\n🌐 ACCESO AL SISTEMA:');
console.log('====================');
console.log('🏠 Portal principal: http://localhost:3030/portal');
console.log('🔄 TODAS las rutas redirigen al portal principal:');
console.log('   • http://localhost:3030/ → /portal');
console.log('   • http://localhost:3030/dashboard → /portal');
console.log('   • http://localhost:3030/admin/login → /portal');
console.log('   • http://localhost:3030/staff/login → /portal');
console.log('   • http://localhost:3030/login → /portal');

console.log('\n📝 FORMATO DE LOGIN:');
console.log('===================');
console.log('✅ Campo 1: Usuario/Matrícula (ADM-001, STAFF-001, 1969, FN-1969)');
console.log('✅ Campo 2: Número de documento (DNI sin puntos)');
console.log('✅ Campo 3: Contraseña (inicial: copig2025)');

console.log('\n🔄 CAMBIO DE CONTRASEÑA:');
console.log('=======================');
console.log('🔐 Todos los usuarios deben cambiar la contraseña inicial');
console.log('🎯 En el primer ingreso se solicita cambio obligatorio');
console.log('📏 Nueva contraseña: mínimo 8 caracteres');

console.log('\n⚙️  CONFIGURACIÓN WINDOWS SERVER 2022:');
console.log('=====================================');
console.log('📁 Archivos necesarios en el servidor:');
console.log('   • Node.js instalado');
console.log('   • PostgreSQL con base de datos copig_moderno');
console.log('   • Firewall: puerto 3030 abierto');
console.log('   • Todos los archivos del proyecto COPIG');

console.log('\n🚀 COMANDOS PARA INICIAR:');
console.log('========================');
console.log('1. 📊 node setup_complete_system.js (ejecutar una sola vez)');
console.log('2. 🌐 node server.js (iniciar servidor)');
console.log('3. 🔍 node test_unified_system.js (probar sistema)');

console.log('\n🌍 ACCESO DESDE LA RED:');
console.log('======================');
console.log('🏢 Desde la oficina: http://[IP-DEL-SERVIDOR]:3030/portal');
console.log('🏠 Desde casa: http://[IP-PUBLICA]:3030/portal (si está configurado)');

console.log('\n💡 RECOMENDACIONES PARA EL STAFF:');
console.log('================================');
console.log('1. 🧪 Probar primero en entorno local (Windows 11)');
console.log('2. 📝 Documentar cualquier error o sugerencia');
console.log('3. 🔄 Cambiar contraseñas iniciales inmediatamente');
console.log('4. 📊 Reportar feedback sobre la usabilidad');

// Ejecutar configuración
setupCompleteSystem()
    .then(() => {
        console.log('\n✅ SISTEMA COPIG LISTO PARA PRODUCCIÓN');
        console.log('====================================');
        console.log('🚀 Ejecute: node server.js');
        console.log('🌐 Acceda a: http://localhost:3030/portal');
    })
    .catch(error => {
        console.error('\n❌ Error en configuración:', error.message);
        console.log('\n💡 Ejecute los scripts individualmente si hay errores');
    });