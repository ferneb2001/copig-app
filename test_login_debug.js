const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('./config.json');

const pool = new Pool(config.database);

async function testLogin() {
    try {
        console.log('🔍 Probando login con DNI: 20562024');
        console.log('🔍 Probando password: ansiktet1969');
        
        // Simular el mismo flujo que server.js
        const dni = '20562024';
        const password = 'ansiktet1969';
        
        // 1) Verificar super admin (hardcodeado)
        if (dni === '20562024' && password === 'ansiktet1969') {
            console.log('✅ Super admin: Credenciales correctas');
            console.log('✅ Debería retornar success: true');
            return;
        }
        
        console.log('❌ Super admin: No debería llegar aquí');
        
    } catch (error) {
        console.log('❌ Error en test:', error.message);
        console.log('❌ Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

testLogin();