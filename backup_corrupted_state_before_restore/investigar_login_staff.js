const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarLoginStaff() {
    const client = await pool.connect();
    try {
        console.log('🔍 INVESTIGANDO PROBLEMA LOGIN STAFF COPIG');
        console.log('🎯 Usuario problema: 40101718\\n');
        
        // 1. Verificar usuario en tabla admin_users
        console.log('👤 1. Verificando usuario en admin_users:');
        const adminUser = await client.query(`
            SELECT id, username, role, activo, password
            FROM copig.admin_users 
            WHERE username = $1
        `, ['40101718']);
        
        if (adminUser.rows.length > 0) {
            const user = adminUser.rows[0];
            console.log('   ✅ Usuario encontrado en admin_users');
            console.log(`   📋 ID: ${user.id}`);
            console.log(`   👤 Username: ${user.username}`);
            console.log(`   🎭 Role: ${user.role}`);
            console.log(`   ✅ Activo: ${user.activo}`);
            console.log(`   🔑 Tiene password: ${user.password ? 'SÍ' : 'NO'}`);
            
            if (user.password) {
                console.log(`   🔐 Password hash: ${user.password.substring(0, 20)}...`);
            }
        } else {
            console.log('   ❌ Usuario NO encontrado en admin_users');
        }
        
        // 2. Verificar todos los usuarios staff
        console.log('\\n👥 2. Listando todos los usuarios admin/staff:');
        const allAdminUsers = await client.query(`
            SELECT id, username, role, activo, password IS NOT NULL as tiene_password
            FROM copig.admin_users 
            ORDER BY id
        `);
        
        console.log(`   📊 Total usuarios admin: ${allAdminUsers.rows.length}`);
        allAdminUsers.rows.forEach(user => {
            const status = user.activo ? '✅' : '❌';
            const pwd = user.tiene_password ? '🔑' : '❌';
            console.log(`   ${status} ${user.username} (${user.role}) - Password: ${pwd}`);
        });
        
        // 3. Verificar estructura tabla admin_users
        console.log('\\n🏗️ 3. Estructura tabla admin_users:');
        const estructura = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'admin_users'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // 4. Testear hash de contraseña
        console.log('\\n🔐 4. Testing hash de contraseñas:');
        const bcrypt = require('bcryptjs');
        
        const testPassword = 'ansiktet2025';
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        console.log(`   📝 Password test: ${testPassword}`);
        console.log(`   🔐 Hash generado: ${hashedPassword.substring(0, 30)}...`);
        
        if (adminUser.rows.length > 0 && adminUser.rows[0].password) {
            const isValid = await bcrypt.compare(testPassword, adminUser.rows[0].password);
            console.log(`   ✅ Verificación: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        }
        
        // 5. Verificar endpoint de login
        console.log('\\n🛠️ 5. Analizando endpoint unified-login:');
        console.log('   📋 Request esperado: { username: "40101718", password: "ansiktet2025" }');
        console.log('   🔍 Búsqueda en: 1) Super admin, 2) admin_users, 3) profesionales');
        
        // 6. Crear usuario staff si no existe
        if (adminUser.rows.length === 0) {
            console.log('\\n🔧 6. CREANDO USUARIO STAFF FALTANTE:');
            
            const hashedPwd = await bcrypt.hash('ansiktet2025', 10);
            const createResult = await client.query(`
                INSERT INTO copig.admin_users (username, password, role, activo)
                VALUES ($1, $2, $3, $4)
                RETURNING id, username, role
            `, ['40101718', hashedPwd, 'staff', true]);
            
            console.log('   ✅ Usuario staff creado:');
            console.log(`   📋 ID: ${createResult.rows[0].id}`);
            console.log(`   👤 Username: ${createResult.rows[0].username}`);
            console.log(`   🎭 Role: ${createResult.rows[0].role}`);
            
        } else if (!adminUser.rows[0].password) {
            console.log('\\n🔧 6. AGREGANDO PASSWORD A USUARIO EXISTENTE:');
            
            const hashedPwd = await bcrypt.hash('ansiktet2025', 10);
            await client.query(`
                UPDATE copig.admin_users 
                SET password = $1 
                WHERE username = $2
            `, [hashedPwd, '40101718']);
            
            console.log('   ✅ Password agregado al usuario existente');
        }
        
        // 7. Verificación final
        console.log('\\n✅ 7. VERIFICACIÓN FINAL:');
        const finalCheck = await client.query(`
            SELECT id, username, role, activo, password IS NOT NULL as tiene_password
            FROM copig.admin_users 
            WHERE username = $1
        `, ['40101718']);
        
        if (finalCheck.rows.length > 0) {
            const user = finalCheck.rows[0];
            console.log(`   ✅ Usuario 40101718 listo para login`);
            console.log(`   🎭 Role: ${user.role}`);
            console.log(`   ✅ Activo: ${user.activo}`);
            console.log(`   🔑 Password: ${user.tiene_password ? 'CONFIGURADO' : 'FALTA'}`);
            
            if (user.tiene_password) {
                console.log('\\n🎯 LOGIN DEBERÍA FUNCIONAR AHORA');
                console.log('   📝 Username: 40101718');
                console.log('   🔑 Password: ansiktet2025');
            }
        }
        
    } catch (error) {
        console.error('💥 ERROR EN INVESTIGACIÓN:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

investigarLoginStaff()
    .then(() => {
        console.log('\\n✅ INVESTIGACIÓN COMPLETADA');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 FALLA EN INVESTIGACIÓN:', error);
        process.exit(1);
    });