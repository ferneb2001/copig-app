const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function backupSoloCarpeta() {
    try {
        console.log('📁 BACKUP CARPETA COPIG-APP\n');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupBaseDir = 'C:\\copig-app-backup-completo';
        
        // Crear directorio base
        await fs.mkdir(backupBaseDir, { recursive: true });
        
        // Backup carpeta completa
        const carpetaBackupDir = path.join(backupBaseDir, `copig-app-${timestamp}`);
        console.log(`📁 Destino: ${carpetaBackupDir}`);
        
        // Comando robocopy para copiar carpeta completa (excluyendo temporales)
        const robocopyCommand = `robocopy "C:\\copig-app" "${carpetaBackupDir}" /MIR /XD node_modules .git backup_* /XF *.log *.tmp`;
        console.log('🔄 Copiando carpeta completa...');
        
        await new Promise((resolve, reject) => {
            exec(robocopyCommand, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
                // Robocopy códigos: 0-7 son exitosos
                if (error && error.code > 7) {
                    console.error('❌ Error robocopy:', error);
                    reject(error);
                } else {
                    console.log('✅ robocopy completado');
                    if (stdout) console.log(stdout);
                    resolve();
                }
            });
        });
        
        // Crear registro
        const registroFile = path.join(backupBaseDir, 'REGISTRO_BACKUP.txt');
        const registro = `
BACKUP CARPETA COPIG-APP - ${new Date().toISOString()}
================================================================

📁 CARPETA RESPALDADA: ${carpetaBackupDir}

COMANDO RESTAURACIÓN:
robocopy "${carpetaBackupDir}" "C:\\copig-app" /MIR

⚠️  PENDIENTE: Backup PostgreSQL (pg_dump no disponible)
- Fernando puede hacer backup BD por separado si necesario

================================================================
        `;
        
        await fs.writeFile(registroFile, registro, 'utf8');
        
        console.log('\n✅ BACKUP CARPETA COMPLETADO');
        console.log(`📂 Ubicación: ${backupBaseDir}`);
        console.log(`📁 Carpeta: copig-app-${timestamp}`);
        
        return backupBaseDir;
        
    } catch (error) {
        console.error('❌ Error backup carpeta:', error);
        throw error;
    }
}

backupSoloCarpeta().catch(console.error);