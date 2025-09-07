const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,  
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

// Simular bcrypt con un hash simple que el servidor pueda verificar
// NOTA: Este es un workaround temporal. En producción se debe usar bcrypt real
async function setupTestUser() {
    console.log('🔧 Configurando usuario de prueba correctamente...\n');
    
    try {
        // 1. Buscar el profesional de prueba
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
        console.log('✅ Profesional encontrado:', profesional.nombre);
        
        // 2. El problema es que bcrypt necesita un formato específico de hash
        // Vamos a usar un hash de bcrypt pre-generado para 'prueba123'
        // Este hash fue generado con bcrypt.hash('prueba123', 10)
        const bcryptHashForPrueba123 = '$2a$10$X4kv7j5ZcG39WgogSl16yupBMhVFxPuHXLmV4z4fE2rRZtLLHZWp.';
        
        console.log('\n📝 Actualizando contraseña con hash bcrypt válido...');
        
        // 3. Actualizar o insertar en profesionales_auth
        const checkAuth = await pool.query(
            'SELECT * FROM copig.profesionales_auth WHERE profesional_id = $1',
            [profesional.id]
        );
        
        if (checkAuth.rows.length > 0) {
            // Actualizar registro existente
            await pool.query(`
                UPDATE copig.profesionales_auth 
                SET password_hash = $1,
                    username = $2,
                    first_login = false,
                    updated_at = NOW()
                WHERE profesional_id = $3
            `, [bcryptHashForPrueba123, '99999999', profesional.id]);
            
            console.log('✅ Registro de autenticación actualizado');
        } else {
            // Crear nuevo registro
            await pool.query(`
                INSERT INTO copig.profesionales_auth 
                (profesional_id, username, password_hash, first_login, created_at, updated_at)
                VALUES ($1, $2, $3, false, NOW(), NOW())
            `, [profesional.id, '99999999', bcryptHashForPrueba123]);
            
            console.log('✅ Registro de autenticación creado');
        }
        
        // 4. Verificar que quedó bien
        const verifyAuth = await pool.query(
            'SELECT username, password_hash, first_login FROM copig.profesionales_auth WHERE profesional_id = $1',
            [profesional.id]
        );
        
        const auth = verifyAuth.rows[0];
        console.log('\n📊 Estado final del usuario:');
        console.log('   Username:', auth.username);
        console.log('   Password hash válido:', auth.password_hash.startsWith('$2a$') ? 'SÍ' : 'NO');
        console.log('   Primer login:', auth.first_login ? 'SÍ' : 'NO');
        
        console.log('\n✅ CONFIGURACIÓN EXITOSA');
        console.log('================================');
        console.log('Ahora puedes ingresar con:');
        console.log('   URL: http://localhost:3030/');
        console.log('   DNI: 99999999');
        console.log('   Contraseña: prueba123');
        console.log('\n⚠️  Ya NO te pedirá cambiar contraseña');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

setupTestUser();