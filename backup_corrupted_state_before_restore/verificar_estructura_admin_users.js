/**
 * VERIFICAR ESTRUCTURA DE admin_users
 */

const { Client } = require('pg');
const config = require('./config.json');

async function verificarEstructura() {
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // VER ESTRUCTURA DE admin_users
        const estructura = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'admin_users'
            ORDER BY ordinal_position
        `);
        
        console.log('📊 ESTRUCTURA TABLA admin_users:');
        console.log('='.repeat(50));
        estructura.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        // VER DATOS ACTUALES
        const datos = await client.query('SELECT * FROM copig.admin_users LIMIT 5');
        console.log('\n📋 DATOS ACTUALES:');
        console.log('='.repeat(50));
        console.log(datos.rows);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

verificarEstructura();