/**
 * CONFIGURACIÓN DEFINITIVA SUPERADMIN FERNANDO - CORREGIDO
 * FECHA: 2025-09-04
 * OBJETIVO: Configurar Fernando (DNI: 20562024) como único superadmin y eliminar temporal
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');

async function configurarFernandoSuperadmin() {
    console.log('🔧 CONFIGURANDO FERNANDO COMO SUPERADMIN DEFINITIVO...');
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
        
        // VERIFICAR SI FERNANDO YA EXISTE EN admin_users
        const checkFernando = await client.query(
            'SELECT id, username, role FROM copig.admin_users WHERE username = $1',
            [DNI_FERNANDO]
        );
        
        if (checkFernando.rows.length > 0) {
            // ACTUALIZAR FERNANDO EXISTENTE
            await client.query(
                `UPDATE copig.admin_users 
                 SET password = $1, role = 'superadmin', activo = true, 
                     nombre = 'FERNANDO', apellido = 'NEBRO',
                     departamento = 'DIRECCIÓN GENERAL',
                     fecha_actualizacion = NOW()
                 WHERE username = $2`,
                [hashedPassword, DNI_FERNANDO]
            );
            console.log('✅ SUPERADMIN FERNANDO ACTUALIZADO');
        } else {
            // CREAR FERNANDO COMO SUPERADMIN
            await client.query(
                `INSERT INTO copig.admin_users 
                 (username, password, nombre, apellido, role, departamento, activo, fecha_creacion)
                 VALUES ($1, $2, 'FERNANDO', 'NEBRO', 'superadmin', 'DIRECCIÓN GENERAL', true, NOW())`,
                [DNI_FERNANDO, hashedPassword]
            );
            console.log('✅ SUPERADMIN FERNANDO CREADO');
        }
        
        // ELIMINAR CUALQUIER SUPERADMIN TEMPORAL (admin, etc.)
        console.log('🗑️  Eliminando superadmins temporales...');
        const deleteResult = await client.query(
            `DELETE FROM copig.admin_users 
             WHERE username IN ('admin', 'superadmin', 'temporal') 
             AND username != $1`,
            [DNI_FERNANDO]
        );
        
        if (deleteResult.rowCount > 0) {
            console.log(`✅ ${deleteResult.rowCount} superadmin(s) temporal(es) eliminado(s)`);
        }
        
        // VERIFICAR CONFIGURACIÓN FINAL
        const finalCheck = await client.query(
            `SELECT username, nombre, apellido, role, departamento, activo 
             FROM copig.admin_users 
             WHERE role = 'superadmin'`
        );
        
        console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log('👑 SUPERADMIN ÚNICO CONFIGURADO:');
        
        finalCheck.rows.forEach(admin => {
            console.log(`   👨‍💼 ${admin.nombre} ${admin.apellido}`);
            console.log(`   🆔 DNI/Usuario: ${admin.username}`);
            console.log(`   🏛️ Departamento: ${admin.departamento}`);
            console.log(`   ✅ Estado: ${admin.activo ? 'ACTIVO' : 'INACTIVO'}`);
        });
        
        console.log('\n🔐 TUS CREDENCIALES DEFINITIVAS:');
        console.log(`   Usuario (DNI): ${DNI_FERNANDO}`);
        console.log(`   Contraseña: ${CONTRASEÑA_FERNANDO}`);
        console.log('   URL: http://localhost:3030/');
        console.log('\n✅ Ya no hay superadmins temporales - Solo tu cuenta personal');
        
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
            console.log('🎯 Sistema listo para pruebas con tus credenciales personales');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { configurarFernandoSuperadmin };