const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno',
    user: 'postgres',
    password: 'ansiktet1969'
});

async function setPassword() {
    try {
        // Generar hash de la contraseña
        const password = 'ansiktet2025';
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Actualizar la contraseña del usuario
        const result = await pool.query(
            'UPDATE copig.admin_users SET password = $1 WHERE documento = $2',
            [hashedPassword, '40101718']
        );
        
        console.log('✅ Contraseña configurada para usuario 40101718');
        console.log('   DNI: 40101718');
        console.log('   Contraseña: ansiktet2025');
        console.log('   Filas actualizadas:', result.rowCount);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setPassword();