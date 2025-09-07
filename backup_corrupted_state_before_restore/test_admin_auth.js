const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function createAdminTables() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Creando tablas de autenticación administrativa...');
        
        // Crear tabla de usuarios administrativos
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.admin_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin' NOT NULL,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP
            )
        `);
        
        // Crear tabla para sesiones
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.admin_sessions (
                sid VARCHAR(255) NOT NULL PRIMARY KEY,
                sess JSON NOT NULL,
                expire TIMESTAMP(6) NOT NULL
            )
        `);
        
        // Crear índices
        await client.query('CREATE INDEX IF NOT EXISTS idx_admin_sessions_expire ON copig.admin_sessions(expire)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_admin_users_username ON copig.admin_users(username)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_admin_users_email ON copig.admin_users(email)');
        
        console.log('✅ Tablas creadas exitosamente');
        
        // Crear usuarios por defecto
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        // Usuario administrador principal
        try {
            await client.query(`
                INSERT INTO copig.admin_users (username, email, password_hash, full_name, role) 
                VALUES ($1, $2, $3, $4, $5)
            `, ['admin', 'admin@copig.gov.ar', passwordHash, 'Administrador COPIG', 'super_admin']);
            console.log('✅ Usuario admin creado');
        } catch (error) {
            if (error.code === '23505') {
                console.log('ℹ️  Usuario admin ya existe');
            } else {
                throw error;
            }
        }
        
        // Usuario demo
        try {
            await client.query(`
                INSERT INTO copig.admin_users (username, email, password_hash, full_name, role) 
                VALUES ($1, $2, $3, $4, $5)
            `, ['demo', 'demo@copig.gov.ar', passwordHash, 'Usuario Demo', 'admin']);
            console.log('✅ Usuario demo creado');
        } catch (error) {
            if (error.code === '23505') {
                console.log('ℹ️  Usuario demo ya existe');
            } else {
                throw error;
            }
        }
        
        console.log('\n🎉 Sistema de autenticación administrativa configurado exitosamente!');
        console.log('\n📋 Credenciales de acceso:');
        console.log('   🔑 Usuario: admin    | Contraseña: admin123');
        console.log('   🔑 Usuario: demo     | Contraseña: admin123');
        console.log('\n🌐 Acceso: http://localhost:3030/admin/login');
        
    } catch (error) {
        console.error('❌ Error al crear tablas:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar setup
createAdminTables();