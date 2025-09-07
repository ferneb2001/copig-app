const { Pool } = require('pg');
const config = require('./config.json');

console.log('🔍 VERIFICANDO USUARIO DNI 40101718...');
console.log('═══════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function checkUser40101718() {
    try {
        console.log('\n📊 BUSCANDO EN TABLA admin_users:');
        const adminUsers = await pool.query(`
            SELECT id, username, dni, nombre, email, rol, activo, password, created_at
            FROM copig.admin_users 
            WHERE dni = '40101718' OR username LIKE '%40101718%'
            ORDER BY id DESC
        `);
        
        if (adminUsers.rows.length > 0) {
            console.log(`✅ ENCONTRADO EN admin_users: ${adminUsers.rows.length} registros`);
            adminUsers.rows.forEach((user, index) => {
                console.log(`\n   ${index + 1}. ID: ${user.id}`);
                console.log(`      Username: ${user.username}`);
                console.log(`      DNI: ${user.dni}`);
                console.log(`      Nombre: ${user.nombre}`);
                console.log(`      Email: ${user.email}`);
                console.log(`      Rol: ${user.rol}`);
                console.log(`      Activo: ${user.activo}`);
                console.log(`      Password: ${user.password ? 'CONFIGURADO' : 'NULL'}`);
                console.log(`      Creado: ${user.created_at}`);
            });
        } else {
            console.log('❌ NO ENCONTRADO EN admin_users');
        }
        
        console.log('\n📊 BUSCANDO EN TABLA profesionales:');
        const profesionales = await pool.query(`
            SELECT id, nombre, apellido, numero_documento, email, activo, created_at
            FROM copig.profesionales 
            WHERE numero_documento = '40101718'
            ORDER BY id DESC
        `);
        
        if (profesionales.rows.length > 0) {
            console.log(`✅ ENCONTRADO EN profesionales: ${profesionales.rows.length} registros`);
            profesionales.rows.forEach((prof, index) => {
                console.log(`\n   ${index + 1}. ID: ${prof.id}`);
                console.log(`      Nombre: ${prof.nombre} ${prof.apellido}`);
                console.log(`      DNI: ${prof.numero_documento}`);
                console.log(`      Email: ${prof.email}`);
                console.log(`      Activo: ${prof.activo}`);
                console.log(`      Creado: ${prof.created_at}`);
            });
            
            // Verificar credenciales de autenticación
            const profId = profesionales.rows[0].id;
            const authCheck = await pool.query(`
                SELECT * FROM copig.profesionales_auth 
                WHERE profesional_id = $1
            `, [profId]);
            
            if (authCheck.rows.length > 0) {
                console.log(`      ✅ CREDENCIALES AUTH: Configuradas`);
                console.log(`      Password hash: ${authCheck.rows[0].password_hash ? 'EXISTE' : 'NULL'}`);
                console.log(`      Username: ${authCheck.rows[0].username}`);
                console.log(`      Activo: ${authCheck.rows[0].activo}`);
            } else {
                console.log(`      ❌ CREDENCIALES AUTH: NO configuradas`);
            }
        } else {
            console.log('❌ NO ENCONTRADO EN profesionales');
        }
        
        console.log('\n📊 BÚSQUEDA GENERAL EN TODAS LAS TABLAS:');
        
        // Buscar en todas las tablas que podrían tener este DNI
        const tableChecks = [
            { table: 'copig.admin_users', field: 'dni' },
            { table: 'copig.profesionales', field: 'numero_documento' }
        ];
        
        for (const check of tableChecks) {
            try {
                const result = await pool.query(`
                    SELECT COUNT(*) as count FROM ${check.table} 
                    WHERE ${check.field} = '40101718'
                `);
                console.log(`   ${check.table}: ${result.rows[0].count} registros`);
            } catch (error) {
                console.log(`   ${check.table}: ERROR - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error verificando usuario:', error.message);
    }
}

async function checkRecentChanges() {
    try {
        console.log('\n🔍 VERIFICANDO CAMBIOS RECIENTES:');
        
        // Usuarios creados/modificados recientemente
        const recentAdmins = await pool.query(`
            SELECT username, dni, created_at, updated_at 
            FROM copig.admin_users 
            WHERE created_at > NOW() - INTERVAL '7 days' 
               OR updated_at > NOW() - INTERVAL '7 days'
            ORDER BY COALESCE(updated_at, created_at) DESC
            LIMIT 10
        `);
        
        if (recentAdmins.rows.length > 0) {
            console.log('📋 USUARIOS ADMIN RECIENTES:');
            recentAdmins.rows.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (DNI: ${user.dni}) - ${user.created_at}`);
            });
        } else {
            console.log('   No hay cambios recientes en admin_users');
        }
        
    } catch (error) {
        console.error('❌ Error verificando cambios recientes:', error.message);
    }
}

async function main() {
    await checkUser40101718();
    await checkRecentChanges();
    
    console.log('\n🎯 POSIBLES CAUSAS:');
    console.log('1. ❓ Usuario eliminado accidentalmente');
    console.log('2. ❓ Cambio en el campo DNI o username');
    console.log('3. ❓ Usuario desactivado');
    console.log('4. ❓ Problema con el login unificado');
    console.log('5. ❓ Usuario migrado a otra tabla');
    
    await pool.end();
}

main().catch(console.error);