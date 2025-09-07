const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkAdminUsersStructure() {
    try {
        console.log('=== ESTRUCTURA TABLA ADMIN_USERS ===\n');
        
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'admin_users'
            ORDER BY ordinal_position
        `);
        
        console.log('Columnas en admin_users:');
        structure.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        console.log('\n=== REGISTROS EN ADMIN_USERS ===');
        const records = await pool.query('SELECT * FROM copig.admin_users LIMIT 3');
        
        if (records.rows.length > 0) {
            console.log('Usuarios encontrados:');
            records.rows.forEach((user, index) => {
                console.log(`\n${index + 1}. Usuario:`);
                Object.keys(user).forEach(key => {
                    const value = key === 'password' ? '[HIDDEN]' : user[key];
                    console.log(`   ${key}: ${value}`);
                });
            });
        } else {
            console.log('No hay usuarios en admin_users');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAdminUsersStructure();