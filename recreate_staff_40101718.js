const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');

console.log('🔧 RECREANDO USUARIO STAFF DNI 40101718...');
console.log('═══════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function recreateStaffUser() {
    try {
        console.log('\n📋 DATOS DEL USUARIO A CREAR:');
        const userData = {
            username: '40101718',
            email: 'staff@copig.gov.ar',
            full_name: 'Personal Staff COPIG',
            role: 'staff',
            documento: '40101718',
            password: 'ansiktet2025'
        };
        
        console.log('   Username:', userData.username);
        console.log('   Email:', userData.email);
        console.log('   Nombre:', userData.full_name);
        console.log('   Rol:', userData.role);
        console.log('   DNI:', userData.documento);
        console.log('   Password: [CONFIGURADO]');
        
        // Hash de la contraseña
        console.log('\n🔐 GENERANDO HASH DE CONTRASEÑA...');
        const passwordHash = await bcrypt.hash(userData.password, 12);
        console.log('   ✅ Hash generado correctamente');
        
        // Verificar si ya existe
        console.log('\n🔍 VERIFICANDO SI YA EXISTE...');
        const existingUser = await pool.query(`
            SELECT id, username FROM copig.admin_users 
            WHERE username = $1 OR documento = $2
        `, [userData.username, userData.documento]);
        
        if (existingUser.rows.length > 0) {
            console.log('⚠️  USUARIO YA EXISTE:');
            existingUser.rows.forEach(user => {
                console.log(`   ID: ${user.id}, Username: ${user.username}`);
            });
            
            // Actualizar el usuario existente
            console.log('\n🔄 ACTUALIZANDO USUARIO EXISTENTE...');
            const updateResult = await pool.query(`
                UPDATE copig.admin_users 
                SET 
                    password_hash = $1,
                    password = $1,
                    active = true,
                    updated_at = NOW(),
                    email = $2,
                    full_name = $3,
                    role = $4,
                    documento = $5
                WHERE username = $6 OR documento = $7
                RETURNING id, username, role
            `, [passwordHash, userData.email, userData.full_name, userData.role, 
                userData.documento, userData.username, userData.documento]);
                
            console.log('   ✅ USUARIO ACTUALIZADO:');
            updateResult.rows.forEach(user => {
                console.log(`      ID: ${user.id}, Username: ${user.username}, Rol: ${user.role}`);
            });
            
        } else {
            // Crear nuevo usuario
            console.log('\n➕ CREANDO NUEVO USUARIO...');
            const insertResult = await pool.query(`
                INSERT INTO copig.admin_users (
                    username, email, password_hash, password, full_name, role, 
                    documento, active, created_at, email_verified
                ) VALUES ($1, $2, $3, $3, $4, $5, $6, true, NOW(), true)
                RETURNING id, username, role, documento
            `, [userData.username, userData.email, passwordHash, userData.full_name, 
                userData.role, userData.documento]);
                
            console.log('   ✅ USUARIO CREADO EXITOSAMENTE:');
            insertResult.rows.forEach(user => {
                console.log(`      ID: ${user.id}`);
                console.log(`      Username: ${user.username}`);
                console.log(`      Rol: ${user.role}`);
                console.log(`      DNI: ${user.documento}`);
            });
        }
        
        // Verificar creación
        console.log('\n✅ VERIFICACIÓN FINAL:');
        const finalCheck = await pool.query(`
            SELECT id, username, email, full_name, role, documento, active 
            FROM copig.admin_users 
            WHERE documento = '40101718' OR username = '40101718'
        `);
        
        if (finalCheck.rows.length > 0) {
            console.log('🎉 USUARIO STAFF 40101718 CONFIGURADO CORRECTAMENTE:');
            finalCheck.rows.forEach(user => {
                console.log(`   • ID: ${user.id}`);
                console.log(`   • Username: ${user.username}`);
                console.log(`   • Email: ${user.email}`);
                console.log(`   • Nombre: ${user.full_name}`);
                console.log(`   • Rol: ${user.role}`);
                console.log(`   • DNI: ${user.documento}`);
                console.log(`   • Activo: ${user.active}`);
            });
            
            console.log('\n🔑 CREDENCIALES DE ACCESO:');
            console.log(`   • Portal: http://localhost:3030/`);
            console.log(`   • Usuario (DNI): 40101718`);
            console.log(`   • Contraseña: ansiktet2025`);
            
        } else {
            console.log('❌ ERROR: No se pudo verificar la creación del usuario');
        }
        
    } catch (error) {
        console.error('❌ Error recreando usuario:', error.message);
    }
}

async function main() {
    await recreateStaffUser();
    
    console.log('\n📋 INSTRUCCIONES PARA FERNANDO:');
    console.log('1. Usuario staff 40101718 recreado/actualizado');
    console.log('2. Ahora puede ingresar con DNI: 40101718 y password: ansiktet2025');
    console.log('3. El sistema lo reconocerá como staff automáticamente');
    console.log('4. Tendrá acceso al panel administrativo');
    
    await pool.end();
}

main().catch(console.error);