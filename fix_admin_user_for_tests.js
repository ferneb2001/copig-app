#!/usr/bin/env node

/**
 * CREAR USUARIO ADMIN DE PRUEBA
 * Fecha: 2025-09-04
 * Propósito: Crear usuario admin para las pruebas del flujo CHP
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
const pool = new Pool(config.database);

async function crearAdminPrueba() {
    try {
        console.log('🔧 Creando usuario admin de prueba...');
        
        // Verificar si ya existe
        const existing = await pool.query(`
            SELECT id FROM copig.admin_users WHERE id = 1
        `);
        
        if (existing.rows.length > 0) {
            console.log('✅ Usuario admin ID 1 ya existe');
            return { success: true, message: 'Admin ya existía' };
        }
        
        // Crear usuario admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await pool.query(`
            INSERT INTO copig.admin_users (id, nombre, email, username, password, rol, activo)
            VALUES (1, 'ADMIN PRUEBAS', 'admin@pruebas.com', 'adminprueba', $1, 'superadmin', true)
            ON CONFLICT (id) DO NOTHING
        `, [hashedPassword]);
        
        // Verificar que se creó
        const verificacion = await pool.query(`
            SELECT * FROM copig.admin_users WHERE id = 1
        `);
        
        if (verificacion.rows.length > 0) {
            console.log('✅ Usuario admin de prueba creado exitosamente');
            console.log(`   ID: 1`);
            console.log(`   Nombre: ${verificacion.rows[0].nombre}`);
            console.log(`   Username: ${verificacion.rows[0].username}`);
            console.log(`   Rol: ${verificacion.rows[0].rol}`);
            return { success: true, admin: verificacion.rows[0] };
        } else {
            return { success: false, message: 'No se pudo crear el admin' };
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        return { success: false, error: error.message };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    crearAdminPrueba()
        .then(result => {
            if (result.success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { crearAdminPrueba };