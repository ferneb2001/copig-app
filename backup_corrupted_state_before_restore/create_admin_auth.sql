-- Crear tabla de usuarios administrativos para COPIG
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
);

-- Crear tabla para sesiones
CREATE TABLE IF NOT EXISTS copig.admin_sessions (
    sid VARCHAR(255) NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expire ON copig.admin_sessions(expire);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON copig.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON copig.admin_users(email);

-- Insertar usuario administrador por defecto (usuario: admin, contraseña: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO copig.admin_users (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@copig.gov.ar', '$2a$10$8K1p/a/Rht0BQWxH6lbPW.WtaJ8Qz0KVNJyNhLcVjhZm9rA.gNS1m', 'Administrador COPIG', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Insertar usuario demo adicional
INSERT INTO copig.admin_users (username, email, password_hash, full_name, role) 
VALUES ('demo', 'demo@copig.gov.ar', '$2a$10$8K1p/a/Rht0BQWxH6lbPW.WtaJ8Qz0KVNJyNhLcVjhZm9rA.gNS1m', 'Usuario Demo', 'admin')
ON CONFLICT (username) DO NOTHING;

COMMENT ON TABLE copig.admin_users IS 'Usuarios administrativos del sistema COPIG';
COMMENT ON TABLE copig.admin_sessions IS 'Sesiones de usuarios administrativos';