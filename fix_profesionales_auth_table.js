const { Pool } = require('pg');
const config = require('./config.json');
const crypto = require('crypto');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

// Función simple para hashear contraseña (temporal, sin bcrypt)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function fixProfesionalesAuth() {
    console.log('🔧 Corrigiendo tabla profesionales_auth...\n');
    
    try {
        // 1. Ver estructura actual de la tabla
        console.log('📋 Verificando estructura actual de la tabla...');
        const columnsQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales_auth'
            ORDER BY ordinal_position
        `;
        
        const columnsResult = await pool.query(columnsQuery);
        
        console.log('Columnas actuales:');
        columnsResult.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        
        // 2. Verificar si existe la columna first_login
        const hasFirstLogin = columnsResult.rows.some(col => col.column_name === 'first_login');
        
        if (!hasFirstLogin) {
            console.log('\n⚠️  La columna first_login NO existe - agregándola...');
            
            await pool.query(`
                ALTER TABLE copig.profesionales_auth 
                ADD COLUMN first_login BOOLEAN DEFAULT true
            `);
            
            console.log('✅ Columna first_login agregada');
        } else {
            console.log('✅ La columna first_login ya existe');
        }
        
        // 3. Verificar si existe updated_at
        const hasUpdatedAt = columnsResult.rows.some(col => col.column_name === 'updated_at');
        
        if (!hasUpdatedAt) {
            console.log('\n⚠️  La columna updated_at NO existe - agregándola...');
            
            await pool.query(`
                ALTER TABLE copig.profesionales_auth 
                ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()
            `);
            
            console.log('✅ Columna updated_at agregada');
        }
        
        // 4. Verificar el usuario de prueba
        console.log('\n🔍 Verificando usuario de prueba (DNI: 99999999)...');
        
        const profesionalQuery = `
            SELECT p.id, p.nombre
            FROM copig.profesionales p
            WHERE p.numero_documento = '99999999'
        `;
        
        const profesionalResult = await pool.query(profesionalQuery);
        
        if (profesionalResult.rows.length === 0) {
            console.log('❌ No se encontró el profesional de prueba');
            return;
        }
        
        const profesional = profesionalResult.rows[0];
        console.log(`✅ Profesional encontrado: ${profesional.nombre} (ID: ${profesional.id})`);
        
        // 5. Verificar/crear registro de autenticación
        const authQuery = `
            SELECT * FROM copig.profesionales_auth
            WHERE profesional_id = $1
        `;
        
        const authResult = await pool.query(authQuery, [profesional.id]);
        
        if (authResult.rows.length === 0) {
            console.log('\n⚠️  No existe registro de autenticación - creándolo...');
            
            const passwordHash = hashPassword('prueba123');
            
            const insertQuery = `
                INSERT INTO copig.profesionales_auth 
                (profesional_id, username, password_hash, first_login, created_at, updated_at)
                VALUES ($1, $2, $3, true, NOW(), NOW())
                RETURNING *
            `;
            
            await pool.query(insertQuery, [
                profesional.id,
                '99999999',
                passwordHash
            ]);
            
            console.log('✅ Registro de autenticación creado');
        } else {
            console.log('✅ Registro de autenticación ya existe');
            
            // Asegurar que tenga password y first_login
            const auth = authResult.rows[0];
            
            if (!auth.password_hash) {
                console.log('   ⚠️ Actualizando password...');
                const passwordHash = hashPassword('prueba123');
                
                await pool.query(
                    'UPDATE copig.profesionales_auth SET password_hash = $1, first_login = true WHERE profesional_id = $2',
                    [passwordHash, profesional.id]
                );
            }
        }
        
        console.log('\n✅ CORRECCIÓN COMPLETADA');
        console.log('================================');
        console.log('Usuario de prueba listo para usar:');
        console.log('   Portal: http://localhost:3030/');
        console.log('   DNI: 99999999');
        console.log('   Contraseña: prueba123');
        console.log('   (Deberá cambiar contraseña en primer login)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixProfesionalesAuth();