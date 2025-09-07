const { Pool } = require('pg');
const config = require('./config.json');

async function checkAdminUsers() {
    const pool = new Pool(config.database);
    
    try {
        // Verificar estructura
        console.log('=== ESTRUCTURA TABLA admin_users ===');
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'admin_users'
            ORDER BY ordinal_position
        `);
        
        structure.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        // Verificar contenido actual
        console.log('\n=== CONTENIDO ACTUAL ===');
        const result = await pool.query('SELECT * FROM copig.admin_users ORDER BY id');
        console.log('Registros encontrados:', result.rows.length);
        
        result.rows.forEach(user => {
            console.log(`- ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Documento: ${user.documento}, Activo: ${user.active}`);
        });
        
        // Verificar por tipo de rol
        console.log('\n=== DISTRIBUCIÓN POR ROLES ===');
        const roleCount = await pool.query(`
            SELECT role, COUNT(*) as cantidad, 
                   COUNT(CASE WHEN active = true THEN 1 END) as activos
            FROM copig.admin_users 
            GROUP BY role
        `);
        
        roleCount.rows.forEach(row => {
            console.log(`- ${row.role}: ${row.cantidad} total (${row.activos} activos)`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAdminUsers();