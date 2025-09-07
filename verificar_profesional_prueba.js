const { Pool } = require('pg');
const config = require('./config.json');

async function verificarProfesionalPrueba() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔍 Verificando profesional de prueba...');
        
        // Buscar el profesional con DNI 99999999
        const profesionalQuery = await pool.query(`
            SELECT id, numero_documento, nombre, email 
            FROM copig.profesionales 
            WHERE numero_documento = '99999999'
        `);
        
        console.log('👤 Profesional encontrado:', profesionalQuery.rows);
        
        // Verificar en tabla de autenticación
        const authQuery = await pool.query(`
            SELECT profesional_id, username, password, activo, first_login 
            FROM copig.profesionales_auth 
            WHERE username = '99999999'
        `);
        
        console.log('🔐 Datos de autenticación:', authQuery.rows);
        
        // Si no existe en auth, crearlo
        if (authQuery.rows.length === 0 && profesionalQuery.rows.length > 0) {
            console.log('⚠️ Profesional existe pero no tiene datos de autenticación. Creando...');
            
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('prueba123', 10);
            
            await pool.query(`
                INSERT INTO copig.profesionales_auth (profesional_id, username, password, activo, first_login)
                VALUES ($1, $2, $3, true, false)
            `, [profesionalQuery.rows[0].id, '99999999', hashedPassword]);
            
            console.log('✅ Datos de autenticación creados para el profesional de prueba');
        }
        
        // Verificar solicitudes CHP existentes
        const solicitudesQuery = await pool.query(`
            SELECT id, numero_solicitud, cliente, proyecto, estado, fecha_solicitud
            FROM copig.solicitudes_chp 
            ORDER BY fecha_solicitud DESC 
            LIMIT 10
        `);
        
        console.log('📋 Solicitudes CHP en BD:', solicitudesQuery.rows);
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await pool.end();
    }
}

verificarProfesionalPrueba();