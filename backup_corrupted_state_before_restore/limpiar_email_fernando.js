/**
 * LIMPIAR EMAIL DE FERNANDO
 * Solo DNI y contraseña, sin email personal
 */

const { Client } = require('pg');
const config = require('./config.json');

async function limpiarEmailFernando() {
    console.log('🧹 LIMPIANDO EMAIL PERSONAL DE FERNANDO...');
    
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // ACTUALIZAR SIN EMAIL PERSONAL
        await client.query(
            `UPDATE copig.admin_users 
             SET email = 'director@copig.gov.ar',
                 updated_at = NOW()
             WHERE documento = '20562024'`
        );
        
        console.log('✅ Email personal eliminado');
        console.log('✅ Email institucional asignado: director@copig.gov.ar');
        
        // VERIFICAR
        const result = await client.query(
            'SELECT username, email, full_name FROM copig.admin_users WHERE documento = $1',
            ['20562024']
        );
        
        console.log('\n🎯 FERNANDO CONFIGURADO:');
        console.log(`   Usuario: ${result.rows[0].username}`);
        console.log(`   Email: ${result.rows[0].email}`);
        console.log(`   Nombre: ${result.rows[0].full_name}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

limpiarEmailFernando();