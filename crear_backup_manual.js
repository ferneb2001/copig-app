const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function crearBackupManual() {
    try {
        console.log('💾 CREANDO BACKUP MANUAL DE SEGURIDAD');
        console.log('='.repeat(50));
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup_manual_${timestamp}.json`;
        
        console.log('📊 Respaldando datos críticos...');
        
        // Respaldar datos críticos
        const matriculas = await pool.query('SELECT * FROM copig.matriculas ORDER BY id');
        const titulos = await pool.query('SELECT * FROM copig.titulos ORDER BY id');
        const profesionales = await pool.query('SELECT id, nombre FROM copig.profesionales ORDER BY id');
        
        const backupData = {
            fecha_backup: new Date().toISOString(),
            descripcion: 'Backup manual antes de corrección masiva de títulos',
            estadisticas: {
                total_matriculas: matriculas.rows.length,
                total_titulos: titulos.rows.length,
                total_profesionales: profesionales.rows.length
            },
            matriculas: matriculas.rows,
            titulos: titulos.rows,
            profesionales_info: profesionales.rows
        };
        
        fs.writeFileSync(`C:\\copig-app\\${backupFileName}`, JSON.stringify(backupData, null, 2));
        
        console.log(`✅ Backup creado exitosamente: ${backupFileName}`);
        console.log(`📊 Respaldados: ${matriculas.rows.length} matrículas, ${titulos.rows.length} títulos, ${profesionales.rows.length} profesionales`);
        console.log(`💾 Tamaño: ${(fs.statSync(`C:\\copig-app\\${backupFileName}`).size / 1024 / 1024).toFixed(2)} MB`);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        await pool.end();
    }
}

crearBackupManual();