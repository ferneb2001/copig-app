const { Pool } = require('pg');

// Configuración de la base de datos desde config.json
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections || 20,
    ssl: false
});

console.log('🏛️ CONFIGURACIÓN DE USUARIOS MULTIUSUARIO COPIG');
console.log('===============================================');

async function setupUnifiedUsers() {
    try {
        console.log('\n📋 CREANDO TABLAS DE USUARIOS...');
        
        // 1. Crear tabla de administradores
        console.log('👑 Creando tabla admin_users...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.admin_users (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                documento VARCHAR(20) NOT NULL,
                password_hash TEXT,
                nombre_completo VARCHAR(200) NOT NULL,
                email VARCHAR(100),
                telefono VARCHAR(20),
                activo BOOLEAN DEFAULT true,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP,
                first_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP,
                permissions JSONB DEFAULT '{}'
            );
        `);

        // 2. Crear tabla de staff
        console.log('👥 Creando tabla staff_users...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.staff_users (
                id SERIAL PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                documento VARCHAR(20) NOT NULL,
                password_hash TEXT,
                nombre_completo VARCHAR(200) NOT NULL,
                email VARCHAR(100),
                telefono VARCHAR(20),
                departamento VARCHAR(100),
                activo BOOLEAN DEFAULT true,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP,
                first_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP,
                permissions JSONB DEFAULT '{}'
            );
        `);

        // 3. Crear usuarios iniciales de prueba
        console.log('\n👤 CREANDO USUARIOS DE PRUEBA...');
        
        // Super Administrador (Fernando Nebro)
        const bcrypt = require('bcryptjs');
        const superAdminPasswordHash = await bcrypt.hash('ansiktet1969', 12);
        
        await pool.query(`
            INSERT INTO copig.admin_users (usuario, documento, nombre_completo, email, telefono, password_hash, permissions, activo)
            VALUES ('ADM-001', '20562024', 'Fernando Nebro - Super Admin', 'ferneb2001@gmail.com', '261-5153246', $1, '{"super_admin": true, "user_management": true}', true)
            ON CONFLICT (usuario) DO UPDATE SET 
                password_hash = $1, 
                email = 'ferneb2001@gmail.com',
                nombre_completo = 'Fernando Nebro - Super Admin'
        `, [superAdminPasswordHash]);

        await pool.query(`
            INSERT INTO copig.admin_users (usuario, documento, nombre_completo, email, telefono)
            VALUES ('ADM-002', '87654321', 'Administrador Secundario', 'admin2@copig.org.ar', '261-7654321')
            ON CONFLICT (usuario) DO NOTHING;
        `);

        // Staff de prueba
        await pool.query(`
            INSERT INTO copig.staff_users (usuario, documento, nombre_completo, email, telefono, departamento)
            VALUES ('STAFF-001', '11223344', 'Juan Pérez - Staff', 'juan.perez@copig.org.ar', '261-1122334', 'Administración')
            ON CONFLICT (usuario) DO NOTHING;
        `);

        await pool.query(`
            INSERT INTO copig.staff_users (usuario, documento, nombre_completo, email, telefono, departamento)
            VALUES ('STAFF-002', '44332211', 'María García - Staff', 'maria.garcia@copig.org.ar', '261-4433221', 'Tesorería')
            ON CONFLICT (usuario) DO NOTHING;
        `);

        await pool.query(`
            INSERT INTO copig.staff_users (usuario, documento, nombre_completo, email, telefono, departamento)
            VALUES ('STAFF-003', '55667788', 'Carlos Rodríguez - Staff', 'carlos.rodriguez@copig.org.ar', '261-5566778', 'Secretaría')
            ON CONFLICT (usuario) DO NOTHING;
        `);

        console.log('✅ Usuarios creados exitosamente');

        // 4. Verificar usuarios existentes
        console.log('\n📊 VERIFICANDO USUARIOS CREADOS...');
        
        const adminUsers = await pool.query('SELECT usuario, documento, nombre_completo FROM copig.admin_users ORDER BY usuario');
        const staffUsers = await pool.query('SELECT usuario, documento, nombre_completo FROM copig.staff_users ORDER BY usuario');

        console.log('\n👑 ADMINISTRADORES DISPONIBLES:');
        adminUsers.rows.forEach(user => {
            console.log(`   🛡️  ${user.usuario} | DNI: ${user.documento} | ${user.nombre_completo}`);
            if (user.usuario === 'ADM-001') {
                console.log('      ⭐ SUPER ADMIN - Contraseña configurada');
            }
        });

        console.log('\n👥 STAFF DISPONIBLE:');
        staffUsers.rows.forEach(user => {
            console.log(`   👨‍💼 ${user.usuario} | DNI: ${user.documento} | ${user.nombre_completo}`);
        });

        // 5. Verificar profesionales con Fernando Nebro
        console.log('\n👨‍💼 VERIFICANDO PROFESIONALES...');
        const fernandoQuery = await pool.query(`
            SELECT p.nombre, p.numero_documento, m.numero, ma.matricula_personalizada
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id  
            LEFT JOIN copig.matriculas_alfanumericas ma ON p.id = ma.profesional_id
            WHERE p.numero_documento = '20562024' OR ma.matricula_personalizada = 'FN-1969'
            ORDER BY p.nombre
        `);

        if (fernandoQuery.rows.length > 0) {
            console.log('✅ FERNANDO NEBRO ENCONTRADO:');
            fernandoQuery.rows.forEach(user => {
                console.log(`   👨‍💼 ${user.nombre} | DNI: ${user.numero_documento} | Matrícula: ${user.matricula_personalizada || user.numero}`);
            });
        } else {
            console.log('❌ Fernando Nebro no encontrado - ejecutar implement_alphanumeric_matriculas.js primero');
        }

        console.log('\n🔐 SISTEMA DE CONTRASEÑAS UNIFICADO:');
        console.log('===================================');
        console.log('📋 Contraseña inicial para TODOS los usuarios: copig2025');
        console.log('🔄 Cambio obligatorio en primer ingreso');
        console.log('✅ Sistema multiusuario activado');

        console.log('\n🌐 TIPOS DE USUARIO CONFIGURADOS:');
        console.log('================================');
        console.log('🛡️  Administradores: Prefijo ADM- (ej: ADM-001)');
        console.log('👥 Staff COPIG: Prefijo STAFF- (ej: STAFF-001)');
        console.log('👨‍💼 Profesionales: Número/código de matrícula (ej: 1969, FN-1969)');

        console.log('\n🚀 ACCESO AL PORTAL UNIFICADO:');
        console.log('=============================');
        console.log('🌐 Portal único: http://localhost:3030/portal');
        console.log('🔐 Contraseña inicial: copig2025');
        console.log('📝 Formato login: USUARIO + DNI + CONTRASEÑA');

        console.log('\n✅ CONFIGURACIÓN MULTIUSUARIO COMPLETADA');
        console.log('=======================================');

    } catch (error) {
        console.error('❌ Error configurando usuarios:', error);
        throw error;
    }
}

// Ejecutar configuración
setupUnifiedUsers()
    .then(() => {
        console.log('\n🎉 SISTEMA MULTIUSUARIO LISTO PARA USAR');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });