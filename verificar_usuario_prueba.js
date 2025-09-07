const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function verificarUsuarioPrueba() {
    console.log('🔍 Verificando usuario de prueba...\n');
    
    try {
        // 1. Verificar el profesional
        const profesionalQuery = `
            SELECT p.id, p.nombre, p.numero_documento
            FROM copig.profesionales p
            WHERE p.numero_documento = '99999999'
        `;
        
        const profesionalResult = await pool.query(profesionalQuery);
        
        if (profesionalResult.rows.length === 0) {
            console.log('❌ No se encontró el profesional con DNI 99999999');
            return;
        }
        
        const profesional = profesionalResult.rows[0];
        console.log('✅ Profesional encontrado:');
        console.log(`   ID: ${profesional.id}`);
        console.log(`   Nombre: ${profesional.nombre}`);
        console.log(`   DNI: ${profesional.numero_documento}`);
        
        // 2. Verificar registro de autenticación
        const authQuery = `
            SELECT * FROM copig.profesionales_auth
            WHERE profesional_id = $1
        `;
        
        const authResult = await pool.query(authQuery, [profesional.id]);
        
        if (authResult.rows.length === 0) {
            console.log('\n❌ NO EXISTE registro en profesionales_auth');
            console.log('⚠️  Este es el problema - necesitamos crear el registro\n');
            
            // Crear el registro faltante
            console.log('🔧 Creando registro de autenticación...');
            
            const bcrypt = require('bcrypt');
            const passwordHash = await bcrypt.hash('prueba123', 12);
            
            const insertQuery = `
                INSERT INTO copig.profesionales_auth 
                (profesional_id, username, password_hash, first_login, created_at, updated_at)
                VALUES ($1, $2, $3, true, NOW(), NOW())
                RETURNING *
            `;
            
            const insertResult = await pool.query(insertQuery, [
                profesional.id,
                '99999999', // DNI como username
                passwordHash
            ]);
            
            console.log('✅ Registro de autenticación creado exitosamente');
            console.log('   Username: 99999999');
            console.log('   Password: prueba123');
            console.log('   First login: true (deberá cambiar contraseña)');
            
        } else {
            const auth = authResult.rows[0];
            console.log('\n✅ Registro de autenticación encontrado:');
            console.log(`   ID: ${auth.id}`);
            console.log(`   Username: ${auth.username}`);
            console.log(`   First login: ${auth.first_login}`);
            console.log(`   Password hash existe: ${auth.password_hash ? 'Sí' : 'No'}`);
            
            if (!auth.password_hash) {
                console.log('\n⚠️  No tiene password hash - actualizando...');
                const bcrypt = require('bcrypt');
                const passwordHash = await bcrypt.hash('prueba123', 12);
                
                await pool.query(
                    'UPDATE copig.profesionales_auth SET password_hash = $1 WHERE profesional_id = $2',
                    [passwordHash, profesional.id]
                );
                console.log('✅ Password hash actualizado');
            }
        }
        
        console.log('\n📋 Resumen:');
        console.log('===========');
        console.log('Usuario: 99999999');
        console.log('Contraseña: prueba123');
        console.log('Portal: http://localhost:3030/');
        console.log('\n✅ El usuario de prueba debería poder ingresar ahora');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

verificarUsuarioPrueba();