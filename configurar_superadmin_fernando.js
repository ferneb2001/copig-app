/**
 * CONFIGURACIÓN SUPERADMIN PERSONALIZADA PARA FERNANDO
 * FECHA: 2025-09-04
 * OBJETIVO: Configurar credenciales personalizadas de Fernando como superadmin COPIG
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');

async function configurarSuperadminFernando() {
    console.log('🔧 CONFIGURANDO SUPERADMIN PERSONALIZADO PARA FERNANDO...');
    console.log('='.repeat(60));
    
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // SOLICITAR CREDENCIALES DE FERNANDO
        console.log('📝 Para configurar tu acceso como superadmin necesito:');
        console.log('1. Tu DNI (será tu usuario)');
        console.log('2. Tu contraseña deseada');
        console.log('');
        console.log('⚠️  IMPORTANTE: Estas serán las credenciales definitivas del superadmin COPIG');
        console.log('');
        
        // MOSTRAR INSTRUCCIONES PARA FERNANDO
        console.log('🔍 INSTRUCCIONES:');
        console.log('1. Edita este archivo y reemplaza AQUÍ por tus datos:');
        console.log('   const DNI_FERNANDO = "TU_DNI_AQUI";');
        console.log('   const CONTRASEÑA_FERNANDO = "TU_CONTRASEÑA_AQUI";');
        console.log('2. Ejecuta nuevamente: node configurar_superadmin_fernando.js');
        console.log('');
        
        // CONFIGURACIÓN A COMPLETAR POR FERNANDO
        const DNI_FERNANDO = "TU_DNI_AQUI"; // Fernando debe reemplazar esto
        const CONTRASEÑA_FERNANDO = "TU_CONTRASEÑA_AQUI"; // Fernando debe reemplazar esto
        
        // VERIFICAR SI FERNANDO YA CONFIGURÓ SUS DATOS
        if (DNI_FERNANDO === "TU_DNI_AQUI" || CONTRASEÑA_FERNANDO === "TU_CONTRASEÑA_AQUI") {
            console.log('⏸️  ESPERANDO CONFIGURACIÓN...');
            console.log('Por favor edita este archivo con tus credenciales reales.');
            console.log('');
            console.log('💡 EJEMPLO:');
            console.log('const DNI_FERNANDO = "12345678";');
            console.log('const CONTRASEÑA_FERNANDO = "micontraseñasegura";');
            return;
        }
        
        // HASHEAR LA CONTRASEÑA
        console.log('🔐 Hasheando contraseña...');
        const hashedPassword = await bcrypt.hash(CONTRASEÑA_FERNANDO, 10);
        
        // VERIFICAR SI FERNANDO YA EXISTE EN admin_users
        const checkFernando = await client.query(
            'SELECT id, username, rol FROM copig.admin_users WHERE username = $1',
            [DNI_FERNANDO]
        );
        
        if (checkFernando.rows.length > 0) {
            // ACTUALIZAR FERNANDO EXISTENTE
            await client.query(
                `UPDATE copig.admin_users 
                 SET password = $1, rol = 'superadmin', activo = true, 
                     nombre = 'FERNANDO', apellido = 'NEBRO',
                     fecha_actualizacion = NOW()
                 WHERE username = $2`,
                [hashedPassword, DNI_FERNANDO]
            );
            console.log('✅ SUPERADMIN FERNANDO ACTUALIZADO');
        } else {
            // CREAR FERNANDO COMO SUPERADMIN
            await client.query(
                `INSERT INTO copig.admin_users 
                 (username, password, nombre, apellido, rol, departamento, activo, fecha_creacion)
                 VALUES ($1, $2, 'FERNANDO', 'NEBRO', 'superadmin', 'DIRECCIÓN GENERAL', true, NOW())`,
                [DNI_FERNANDO, hashedPassword]
            );
            console.log('✅ SUPERADMIN FERNANDO CREADO');
        }
        
        // ACTUALIZAR SERVIDOR CON CREDENCIALES DE FERNANDO
        console.log('🔧 Actualizando configuración del servidor...');
        console.log('');
        console.log('⚠️  IMPORTANTE: Necesitarás actualizar server.js línea 1770 con:');
        console.log(`   if (username === '${DNI_FERNANDO}' && password === '${CONTRASEÑA_FERNANDO}') {`);
        console.log('');
        
        // MOSTRAR CREDENCIALES FINALES
        console.log('🎉 CONFIGURACIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log('🔐 TUS CREDENCIALES DE SUPERADMIN:');
        console.log(`   Usuario (DNI): ${DNI_FERNANDO}`);
        console.log(`   Contraseña: ${CONTRASEÑA_FERNANDO}`);
        console.log('   URL: http://localhost:3030/');
        console.log('');
        console.log('✅ Ahora podrás ingresar como superadmin con tu DNI y contraseña personal');
        
    } catch (error) {
        console.error('❌ ERROR EN CONFIGURACIÓN:', error);
    } finally {
        await client.end();
    }
}

// EJECUTAR CONFIGURACIÓN
if (require.main === module) {
    configurarSuperadminFernando()
        .then(() => {
            console.log('\n🏁 PROCESO COMPLETADO');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { configurarSuperadminFernando };