/**
 * ACTUALIZAR FERNANDO EXISTENTE COMO SUPERADMIN
 * FECHA: 2025-09-04
 * DNI: 20562024 / Contraseña: ansiktet1969
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');

async function actualizarFernandoSuperadmin() {
    console.log('🔧 ACTUALIZANDO FERNANDO EXISTENTE COMO SUPERADMIN...');
    console.log('='.repeat(60));
    
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // CREDENCIALES DEFINITIVAS DE FERNANDO
        const DNI_FERNANDO = "20562024";
        const CONTRASEÑA_FERNANDO = "ansiktet1969";
        
        // HASHEAR LA CONTRASEÑA DE FERNANDO
        console.log('🔐 Hasheando nueva contraseña...');
        const hashedPassword = await bcrypt.hash(CONTRASEÑA_FERNANDO, 10);
        
        // ACTUALIZAR FERNANDO EXISTENTE (por email ferneb2001@gmail.com)
        console.log('👤 Actualizando Fernando existente con tu DNI...');
        const updateResult = await client.query(
            `UPDATE copig.admin_users 
             SET username = $1, 
                 documento = $1,
                 password = $2, 
                 password_hash = $2, 
                 full_name = 'FERNANDO NEBRO - DIRECTOR COPIG',
                 role = 'superadmin',
                 active = true,
                 protected = true,
                 departamento = 'DIRECCIÓN GENERAL',
                 permissions = $3,
                 updated_at = NOW()
             WHERE email = 'ferneb2001@gmail.com'`,
            [
                DNI_FERNANDO, 
                hashedPassword,
                JSON.stringify({
                    all_access: true,
                    user_management: true,
                    system_config: true,
                    data_export: true,
                    reports: true
                })
            ]
        );
        
        if (updateResult.rowCount > 0) {
            console.log('✅ FERNANDO ACTUALIZADO EXITOSAMENTE');
        } else {
            console.log('❌ No se encontró usuario para actualizar');
        }
        
        // DESACTIVAR OTROS SUPERADMINS
        console.log('🗑️  Desactivando otros superadmins...');
        const deactivateResult = await client.query(
            `UPDATE copig.admin_users 
             SET role = 'admin', active = false 
             WHERE role IN ('superadmin', 'super_admin') 
             AND username != $1 AND documento != $1`,
            [DNI_FERNANDO]
        );
        
        if (deactivateResult.rowCount > 0) {
            console.log(`✅ ${deactivateResult.rowCount} otro(s) superadmin(s) desactivado(s)`);
        }
        
        // VERIFICAR CONFIGURACIÓN FINAL
        const finalCheck = await client.query(
            `SELECT username, documento, full_name, role, email, departamento, active 
             FROM copig.admin_users 
             WHERE role = 'superadmin' AND active = true`
        );
        
        console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log('👑 FERNANDO NEBRO - SUPERADMIN ÚNICO:');
        
        finalCheck.rows.forEach(admin => {
            console.log(`   👨‍💼 ${admin.full_name}`);
            console.log(`   🆔 DNI/Usuario: ${admin.documento || admin.username}`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   🏛️ Departamento: ${admin.departamento}`);
            console.log(`   ✅ Estado: ${admin.active ? 'ACTIVO' : 'INACTIVO'}`);
        });
        
        console.log('\n🔐 TUS CREDENCIALES DE ACCESO:');
        console.log(`   🌐 URL: http://localhost:3030/`);
        console.log(`   👤 Usuario: ${DNI_FERNANDO}`);
        console.log(`   🔑 Contraseña: ${CONTRASEÑA_FERNANDO}`);
        console.log('\n🎯 ¡SISTEMA LISTO PARA PROBAR!');
        console.log('🏛️ Ingresa como SUPERADMIN con tu DNI personal');
        
        return {
            dni: DNI_FERNANDO,
            password: CONTRASEÑA_FERNANDO,
            configured: true
        };
        
    } catch (error) {
        console.error('❌ ERROR EN ACTUALIZACIÓN:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// EJECUTAR ACTUALIZACIÓN
if (require.main === module) {
    actualizarFernandoSuperadmin()
        .then((config) => {
            console.log('\n🏁 FERNANDO CONFIGURADO COMO SUPERADMIN CON SU DNI');
            console.log('🚀 Sistema COPIG listo - Puedes probarlo ahora');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { actualizarFernandoSuperadmin };