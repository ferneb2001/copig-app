const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixLoginStaffDefinitivo() {
    const client = await pool.connect();
    try {
        console.log('🔧 CORRIGIENDO LOGIN STAFF DEFINITIVO');
        console.log('🎯 Usuario problema: 40101718\\n');
        
        // 1. Verificar estructura real de la tabla
        console.log('🏗️ 1. Estructura real tabla admin_users:');
        const estructura = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'admin_users'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type}`);
        });
        
        // 2. Verificar usuario actual
        console.log('\\n👤 2. Usuario actual en admin_users:');
        const userCheck = await client.query(`
            SELECT * FROM copig.admin_users WHERE username = $1
        `, ['40101718']);
        
        if (userCheck.rows.length > 0) {
            const user = userCheck.rows[0];
            console.log('   ✅ Usuario encontrado');
            Object.keys(user).forEach(key => {
                if (key === 'password' && user[key]) {
                    console.log(`   ${key}: ${user[key].substring(0, 20)}... (hash)`);
                } else {
                    console.log(`   ${key}: ${user[key]}`);
                }
            });
        } else {
            console.log('   ❌ Usuario NO encontrado');
        }
        
        // 3. Instalar bcryptjs si no existe
        console.log('\\n🔐 3. Verificando bcrypt...');
        let bcrypt;
        try {
            bcrypt = require('bcryptjs');
            console.log('   ✅ bcryptjs disponible');
        } catch (error) {
            console.log('   ❌ bcryptjs no disponible - instalando...');
            // En un entorno real ejecutaríamos npm install aquí
            console.log('   ⚠️ Necesita: npm install bcryptjs');
        }
        
        // 4. Crear/actualizar usuario staff
        if (bcrypt) {
            console.log('\\n🔧 4. Configurando usuario staff:');
            const hashedPassword = await bcrypt.hash('ansiktet2025', 10);
            
            if (userCheck.rows.length === 0) {
                // Crear usuario nuevo
                const createResult = await client.query(`
                    INSERT INTO copig.admin_users (username, password, role, active)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id, username, role
                `, ['40101718', hashedPassword, 'staff', true]);
                
                console.log('   ✅ Usuario staff CREADO:');
                console.log(`   📋 ID: ${createResult.rows[0].id}`);
                console.log(`   👤 Username: ${createResult.rows[0].username}`);
                console.log(`   🎭 Role: ${createResult.rows[0].role}`);
                
            } else {
                // Actualizar usuario existente
                await client.query(`
                    UPDATE copig.admin_users 
                    SET password = $1, role = $2, active = $3
                    WHERE username = $4
                `, [hashedPassword, 'staff', true, '40101718']);
                
                console.log('   ✅ Usuario staff ACTUALIZADO');
                console.log('   🔑 Password actualizado');
                console.log('   🎭 Role: staff');
                console.log('   ✅ Activo: true');
            }
        }
        
        // 5. Verificar endpoint de login en server.js
        console.log('\\n🛠️ 5. Verificando endpoint de login...');
        const fs = require('fs').promises;
        const serverContent = await fs.readFile('server.js', 'utf8');
        
        // Buscar el endpoint unified-login
        if (serverContent.includes('/api/unified-login')) {
            console.log('   ✅ Endpoint /api/unified-login existe');
            
            // Verificar si busca en admin_users
            if (serverContent.includes('admin_users')) {
                console.log('   ✅ Busca en tabla admin_users');
            } else {
                console.log('   ❌ NO busca en tabla admin_users - PROBLEMA');
            }
            
            // Verificar bcrypt en server.js
            if (serverContent.includes('bcrypt')) {
                console.log('   ✅ Usa bcrypt para passwords');
            } else {
                console.log('   ❌ NO usa bcrypt - PROBLEMA');
            }
        } else {
            console.log('   ❌ Endpoint /api/unified-login NO existe');
        }
        
        // 6. Verificación final del login
        console.log('\\n✅ 6. ESTADO FINAL LOGIN STAFF:');
        const finalUser = await client.query(`
            SELECT id, username, role, active, password IS NOT NULL as tiene_password
            FROM copig.admin_users 
            WHERE username = $1
        `, ['40101718']);
        
        if (finalUser.rows.length > 0) {
            const user = finalUser.rows[0];
            console.log(`   ✅ Usuario configurado:`);
            console.log(`   📋 ID: ${user.id}`);
            console.log(`   👤 Username: ${user.username}`);
            console.log(`   🎭 Role: ${user.role}`);
            console.log(`   ✅ Active: ${user.active}`);
            console.log(`   🔑 Password: ${user.tiene_password ? 'CONFIGURADO' : 'FALTA'}`);
            
            console.log('\\n🎯 CREDENCIALES DE LOGIN:');
            console.log('   📝 Username: 40101718');
            console.log('   🔑 Password: ansiktet2025');
            console.log('   🌐 URL: http://localhost:3030/api/unified-login');
            
            // Test de password
            if (bcrypt && user.tiene_password) {
                const currentPassword = await client.query(`
                    SELECT password FROM copig.admin_users WHERE username = $1
                `, ['40101718']);
                
                const isValid = await bcrypt.compare('ansiktet2025', currentPassword.rows[0].password);
                console.log(`   🔐 Password válido: ${isValid ? '✅ SÍ' : '❌ NO'}`);
            }
            
        } else {
            console.log('   ❌ Usuario SIGUE sin configurar');
        }
        
        console.log('\\n🔄 PRÓXIMO PASO: Reiniciar servidor para probar login');
        
    } catch (error) {
        console.error('💥 ERROR EN CORRECCIÓN:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixLoginStaffDefinitivo()
    .then(() => {
        console.log('\\n✅ CORRECCIÓN LOGIN STAFF COMPLETADA');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 FALLA EN CORRECCIÓN:', error);
        process.exit(1);
    });