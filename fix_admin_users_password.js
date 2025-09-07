const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno',
    user: 'postgres',
    password: 'ansiktet1969'
});

async function fixPasswordColumn() {
    try {
        console.log('🔍 Verificando estructura de tabla admin_users...');
        
        // Primero agregar columna password si no existe
        await pool.query(`
            ALTER TABLE copig.admin_users 
            ADD COLUMN IF NOT EXISTS password VARCHAR(255)
        `);
        console.log('✅ Columna password verificada/agregada');
        
        // Generar hash de la contraseña
        const password = 'ansiktet2025';
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Actualizar la contraseña del usuario 40101718
        const result = await pool.query(
            'UPDATE copig.admin_users SET password = $1 WHERE documento = $2',
            [hashedPassword, '40101718']
        );
        
        console.log('✅ Contraseña configurada para usuario 40101718');
        console.log('   DNI: 40101718');
        console.log('   Contraseña: ansiktet2025');
        console.log('   Filas actualizadas:', result.rowCount);
        
        // Configurar contraseña por defecto para otros usuarios sin password
        const defaultPassword = 'copig2025';
        const defaultHash = await bcrypt.hash(defaultPassword, 12);
        
        const resultDefault = await pool.query(
            'UPDATE copig.admin_users SET password = $1 WHERE password IS NULL AND id != 9',
            [defaultHash]
        );
        
        console.log(`✅ Configuradas ${resultDefault.rowCount} contraseñas por defecto (copig2025)`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixPasswordColumn();