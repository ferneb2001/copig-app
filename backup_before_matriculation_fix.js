/**
 * BACKUP AUTOMÁTICO - CORRECCIÓN FECHAS MATRICULACIÓN
 * ==================================================
 * Aplicando MÁXIMA: "PEDIR BACKUP ANTES DE CAMBIOS SENSIBLES"
 */

const fs = require('fs');
const { Pool } = require('pg');
const config = require('./config.json');

async function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_matriculation_fix_${timestamp}`;
    
    console.log('🔄 Creando backup antes de corrección matriculación...');
    
    // Crear directorio
    fs.mkdirSync(backupDir);
    
    // Backup archivos críticos
    const archivos = ['server.js', 'admin.html', 'portal-profesional.html'];
    archivos.forEach(archivo => {
        fs.copyFileSync(archivo, `${backupDir}/${archivo}`);
    });
    
    // Backup específico tabla matriculas
    const pool = new Pool(config.database);
    try {
        const matriculas = await pool.query('SELECT * FROM copig.matriculas ORDER BY id');
        fs.writeFileSync(
            `${backupDir}/matriculas_backup.json`, 
            JSON.stringify(matriculas.rows, null, 2)
        );
        
        console.log(`✅ Backup creado: ${backupDir}/`);
        console.log(`   - ${archivos.length} archivos críticos`);
        console.log(`   - ${matriculas.rows.length} registros matriculas`);
        
    } catch (error) {
        console.log('❌ Error en backup:', error.message);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    createBackup();
}

module.exports = createBackup;