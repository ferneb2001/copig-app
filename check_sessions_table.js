const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function checkSessionsTable() {
    console.log('🔍 VERIFICACIÓN TABLA DE SESIONES');
    console.log('=================================\n');
    
    try {
        // 1. Verificar si existe la tabla admin_sessions
        console.log('1. Verificando tabla copig.admin_sessions...');
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'admin_sessions'
            )
        `);
        
        if (tableExists.rows[0].exists) {
            console.log('✅ Tabla admin_sessions existe');
            
            // Ver estructura
            const structure = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'copig' 
                AND table_name = 'admin_sessions'
                ORDER BY ordinal_position
            `);
            
            console.log('📋 Estructura de la tabla:');
            structure.rows.forEach(col => {
                console.log(`   ${col.column_name}: ${col.data_type}`);
            });
            
            // Ver contenido
            const sessions = await pool.query('SELECT COUNT(*) FROM copig.admin_sessions');
            console.log(`📊 Sesiones activas: ${sessions.rows[0].count}`);
            
        } else {
            console.log('❌ Tabla admin_sessions NO existe');
            console.log('📝 Creando tabla...');
            
            await pool.query(`
                CREATE TABLE IF NOT EXISTS copig.admin_sessions (
                    sid VARCHAR NOT NULL COLLATE "default",
                    sess JSON NOT NULL,
                    expire TIMESTAMP(6) NOT NULL
                )
                WITH (OIDS=FALSE)
            `);
            
            await pool.query(`
                ALTER TABLE copig.admin_sessions 
                ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS IDX_session_expire ON copig.admin_sessions(expire)
            `);
            
            console.log('✅ Tabla admin_sessions creada');
        }
        
        // 2. Probar inserción de sesión de prueba
        console.log('\n2. Probando sesión de prueba...');
        const testSid = 'test-session-' + Date.now();
        const testSession = {
            user: {
                id: 'test',
                role: 'super_admin'
            }
        };
        
        await pool.query(`
            INSERT INTO copig.admin_sessions (sid, sess, expire) 
            VALUES ($1, $2, NOW() + INTERVAL '1 hour')
            ON CONFLICT (sid) DO UPDATE SET sess = $2, expire = NOW() + INTERVAL '1 hour'
        `, [testSid, JSON.stringify(testSession)]);
        
        console.log('✅ Sesión de prueba insertada correctamente');
        
        // Limpiar sesión de prueba
        await pool.query('DELETE FROM copig.admin_sessions WHERE sid = $1', [testSid]);
        console.log('✅ Sesión de prueba eliminada');
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Detalle:', error.detail);
    } finally {
        await pool.end();
    }
}

checkSessionsTable();