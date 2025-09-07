/**
 * CONFIGURACIÓN DEFINITIVA FERNANDO COMO SUPERADMIN
 * FECHA: 2025-09-04
 * DNI: 20562024 / Contraseña: ansiktet1969
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');

async function configurarFernandoSuperadmin() {
    console.log('🔧 CONFIGURANDO FERNANDO COMO SUPERADMIN ÚNICO...');
    console.log('='.repeat(60));
    
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // CREDENCIALES DEFINITIVAS DE FERNANDO
        const DNI_FERNANDO = "20562024";
        const CONTRASEÑA_FERNANDO = "ansiktet1969";
        
        // HASHEAR LA CONTRASEÑA DE FERNANDO
        console.log('🔐 Hasheando contraseña de Fernando...');
        const hashedPassword = await bcrypt.hash(CONTRASEÑA_FERNANDO, 10);
        
        // VERIFICAR SI FERNANDO YA EXISTE
        const checkFernando = await client.query(
            'SELECT id, username, role FROM copig.admin_users WHERE username = $1 OR documento = $1',
            [DNI_FERNANDO]
        );
        
        if (checkFernando.rows.length > 0) {
            // ACTUALIZAR FERNANDO EXISTENTE
            console.log('👤 Actualizando Fernando existente...');
            await client.query(
                `UPDATE copig.admin_users 
                 SET username = $1, documento = $1, password = $2, password_hash = $2, 
                     full_name = 'FERNANDO NEBRO - DIRECTOR COPIG', 
                     role = 'superadmin', active = true, protected = true,
                     departamento = 'DIRECCIÓN GENERAL',
                     email = 'ferneb2001@gmail.com',
                     permissions = $3,
                     updated_at = NOW()
                 WHERE id = $4`,
                [
                    DNI_FERNANDO, 
                    hashedPassword, 
                    JSON.stringify({
                        all_access: true,
                        user_management: true,
                        system_config: true,
                        data_export: true,
                        reports: true
                    }),
                    checkFernando.rows[0].id
                ]
            );
            console.log('✅ FERNANDO ACTUALIZADO COMO SUPERADMIN');
        } else {
            // CREAR FERNANDO COMO SUPERADMIN
            console.log('👤 Creando Fernando como nuevo superadmin...');
            await client.query(
                `INSERT INTO copig.admin_users 
                 (username, documento, password, password_hash, full_name, 
                  role, email, departamento, active, protected, permissions, 
                  created_at, email_verified)
                 VALUES ($1, $1, $2, $2, $3, $4, $5, $6, true, true, $7, NOW(), true)`,
                [
                    DNI_FERNANDO,
                    hashedPassword,
                    'FERNANDO NEBRO - DIRECTOR COPIG',
                    'superadmin',
                    'ferneb2001@gmail.com',
                    'DIRECCIÓN GENERAL',
                    JSON.stringify({
                        all_access: true,
                        user_management: true,
                        system_config: true,
                        data_export: true,
                        reports: true
                    })
                ]
            );
            console.log('✅ FERNANDO CREADO COMO SUPERADMIN');
        }
        
        // ELIMINAR OTROS SUPERADMINS (excepto Fernando)
        console.log('🗑️  Eliminando otros superadmins...');
        const deleteResult = await client.query(
            `UPDATE copig.admin_users 
             SET role = 'admin', active = false 
             WHERE role IN ('superadmin', 'super_admin') 
             AND username != $1 AND documento != $1`,
            [DNI_FERNANDO]
        );
        
        if (deleteResult.rowCount > 0) {
            console.log(`✅ ${deleteResult.rowCount} otro(s) superadmin(s) desactivado(s)`);
        }
        
        // VERIFICAR CONFIGURACIÓN FINAL
        const finalCheck = await client.query(
            `SELECT username, documento, full_name, role, departamento, active 
             FROM copig.admin_users 
             WHERE role = 'superadmin' AND active = true`
        );
        
        console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log('👑 SUPERADMIN ÚNICO - FERNANDO NEBRO:');
        
        finalCheck.rows.forEach(admin => {
            console.log(`   👨‍💼 ${admin.full_name}`);
            console.log(`   🆔 DNI/Usuario: ${admin.documento || admin.username}`);
            console.log(`   🏛️ Departamento: ${admin.departamento}`);
            console.log(`   ✅ Estado: ${admin.active ? 'ACTIVO' : 'INACTIVO'}`);
        });
        
        console.log('\n🔐 TUS CREDENCIALES PERSONALES:');
        console.log(`   Usuario (DNI): ${DNI_FERNANDO}`);
        console.log(`   Contraseña: ${CONTRASEÑA_FERNANDO}`);
        console.log('   URL: http://localhost:3030/');
        console.log('\n🎯 ¡LISTO PARA PROBAR EL SISTEMA!');
        
        return {
            dni: DNI_FERNANDO,
            password: CONTRASEÑA_FERNANDO,
            configured: true
        };
        
    } catch (error) {
        console.error('❌ ERROR EN CONFIGURACIÓN:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// EJECUTAR CONFIGURACIÓN
if (require.main === module) {
    configurarFernandoSuperadmin()
        .then((config) => {
            console.log('\n🏁 FERNANDO CONFIGURADO COMO SUPERADMIN ÚNICO');
            console.log('🚀 Sistema COPIG listo para pruebas con tus credenciales');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { configurarFernandoSuperadmin };