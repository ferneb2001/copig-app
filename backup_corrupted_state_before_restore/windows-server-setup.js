const fs = require('fs');
const path = require('path');

console.log('🖥️ CONFIGURACIÓN PARA WINDOWS SERVER 2022');
console.log('=========================================');

// Configuración del sistema para Windows Server
const serverConfig = {
    // Configuración del servidor web
    web: {
        port: process.env.PORT || 3030,
        host: '0.0.0.0', // Permitir conexiones externas
        enableCors: true,
        enableSSL: false, // Se puede habilitar más tarde
    },
    
    // Configuración de seguridad
    security: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000, // 15 minutos
        requirePasswordChange: true,
        initialPassword: 'copig2025', // Contraseña inicial para todos
    },
    
    // Configuración de la base de datos
    database: {
        host: 'localhost',
        port: 5432,
        database: 'copig_moderno',
        user: 'postgres',
        password: 'ansiktet1969',
        maxConnections: 20,
    },
    
    // Configuración de usuarios
    users: {
        adminPrefix: 'ADM-', // Prefijo para usuarios administradores
        staffPrefix: 'STAFF-', // Prefijo para staff COPIG
        professionalPrefix: '', // Sin prefijo para profesionales (usan matrícula)
    },
    
    // Configuración del sistema
    system: {
        enableMultiUser: true,
        logLevel: 'info',
        enableFileLogging: true,
        backupEnabled: true,
    }
};

// Crear archivo de configuración
const configPath = path.join(__dirname, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(serverConfig, null, 4));

console.log('✅ Archivo de configuración creado: config.json');

// Mostrar información de configuración
console.log('\n📋 CONFIGURACIÓN DEL SERVIDOR:');
console.log('==============================');
console.log(`🌐 Puerto: ${serverConfig.web.port}`);
console.log(`🔒 Host: ${serverConfig.web.host} (permite conexiones externas)`);
console.log(`🔐 Contraseña inicial: ${serverConfig.security.initialPassword}`);
console.log(`👥 Máximo intentos de login: ${serverConfig.security.maxLoginAttempts}`);
console.log(`⏰ Timeout de sesión: ${serverConfig.security.sessionTimeout / (60 * 60 * 1000)} horas`);

console.log('\n🚀 INSTRUCCIONES PARA WINDOWS SERVER 2022:');
console.log('==========================================');
console.log('1. Instalar Node.js en el servidor');
console.log('2. Instalar PostgreSQL');
console.log('3. Configurar firewall para puerto 3030');
console.log('4. Ejecutar: npm install');
console.log('5. Ejecutar: node server.js');

console.log('\n🔥 CONFIGURACIÓN DE FIREWALL:');
console.log('=============================');
console.log('Ejecutar como Administrador:');
console.log('netsh advfirewall firewall add rule name="COPIG Portal" dir=in action=allow protocol=TCP localport=3030');

console.log('\n🌍 ACCESO DESDE EL EXTERIOR:');
console.log('============================');
console.log('• Desde la red local: http://[IP-DEL-SERVIDOR]:3030/portal');
console.log('• Ejemplo: http://192.168.1.100:3030/portal');
console.log('• Solo portal disponible: /portal');

console.log('\n👥 TIPOS DE USUARIO CONFIGURADOS:');
console.log('=================================');
console.log('• Administradores: Prefijo ADM-');
console.log('• Staff COPIG: Prefijo STAFF-'); 
console.log('• Profesionales: Número de matrícula');

console.log('\n🔄 CONTRASEÑA INICIAL UNIFICADA:');
console.log('===============================');
console.log(`• Contraseña inicial para todos: ${serverConfig.security.initialPassword}`);
console.log('• Cambio obligatorio en primer ingreso');
console.log('• Sistema multiusuario activado');

console.log('\n✅ CONFIGURACIÓN COMPLETADA');
console.log('===========================');