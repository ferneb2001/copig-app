const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function backupCompletoSistema() {
    try {
        console.log('🛡️  BACKUP COMPLETO DEL SISTEMA ANTES DE MIGRACIÓN\n');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupBaseDir = 'C:\\copig-app-backup-completo';
        
        // 1. BACKUP POSTGRESQL COMPLETO
        console.log('=== BACKUP POSTGRESQL COMPLETO ===');
        const dbBackupFile = path.join(backupBaseDir, `copig_moderno_${timestamp}.sql`);
        
        console.log(`📄 Archivo BD: ${dbBackupFile}`);
        
        // Crear directorio
        await fs.mkdir(backupBaseDir, { recursive: true });
        
        // Comando pg_dump
        const pgDumpCommand = `pg_dump -U postgres -h localhost -p 5432 copig_moderno > "${dbBackupFile}"`;
        console.log('🔄 Ejecutando pg_dump...');
        
        await new Promise((resolve, reject) => {
            exec(pgDumpCommand, { 
                env: { ...process.env, PGPASSWORD: 'ansiktet1969' },
                maxBuffer: 1024 * 1024 * 100 // 100MB buffer
            }, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Error pg_dump:', error);
                    reject(error);
                } else {
                    console.log('✅ pg_dump completado');
                    if (stderr) console.log('Warnings:', stderr);
                    resolve();
                }
            });
        });
        
        // Verificar backup BD
        const dbStats = await fs.stat(dbBackupFile);
        const dbTamanoMB = (dbStats.size / 1024 / 1024).toFixed(2);
        console.log(`📏 BD backup: ${dbTamanoMB} MB`);
        
        // 2. BACKUP CARPETA COPIG-APP COMPLETA
        console.log('\n=== BACKUP CARPETA COPIG-APP COMPLETA ===');
        const carpetaBackupDir = path.join(backupBaseDir, `copig-app-${timestamp}`);
        
        console.log(`📁 Destino carpeta: ${carpetaBackupDir}`);
        
        // Comando robocopy para copiar carpeta completa
        const robocopyCommand = `robocopy "C:\\copig-app" "${carpetaBackupDir}" /MIR /XD node_modules .git backup_* /XF *.log *.tmp`;
        console.log('🔄 Ejecutando robocopy...');
        
        await new Promise((resolve, reject) => {
            exec(robocopyCommand, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
                // Robocopy devuelve códigos de salida específicos, no siempre son errores
                if (error && error.code > 7) {
                    console.error('❌ Error robocopy:', error);
                    reject(error);
                } else {
                    console.log('✅ robocopy completado');
                    console.log(stdout);
                    resolve();
                }
            });
        });
        
        // 3. CREAR REGISTRO DE UBICACIONES
        console.log('\n=== DOCUMENTANDO UBICACIONES PARA RECOVERY ===');
        const registroFile = path.join(backupBaseDir, 'REGISTRO_BACKUP_RECOVERY.txt');
        
        const registro = `
BACKUP COMPLETO SISTEMA COPIG - ${new Date().toISOString()}
================================================================

PROPÓSITO: Backup completo antes de migración información adicional

🗄️  BACKUP BASE DE DATOS POSTGRESQL:
Ubicación: ${dbBackupFile}
Tamaño: ${dbTamanoMB} MB
Comando restauración: 
  psql -U postgres -h localhost -d copig_moderno < "${dbBackupFile}"

📁 BACKUP CARPETA COMPLETA COPIG-APP:
Ubicación: ${carpetaBackupDir}
Comando restauración:
  robocopy "${carpetaBackupDir}" "C:\\copig-app" /MIR

⚠️  INSTRUCCIONES RECOVERY:
1. Para restaurar BD: Detener servidor → Ejecutar psql → Reiniciar servidor
2. Para restaurar carpeta: Detener servidor → Ejecutar robocopy → Reiniciar servidor
3. Para restaurar TODO: Ejecutar ambos comandos en orden

================================================================
PRÓXIMO BACKUP: Solo cuando sea absolutamente necesario
REEMPLAZO: Este backup reemplaza backups anteriores para ahorrar espacio
================================================================
        `;
        
        await fs.writeFile(registroFile, registro, 'utf8');
        
        console.log('\n🎉 BACKUP COMPLETO EXITOSO');
        console.log(`📂 FERNANDO, backup completo en: ${backupBaseDir}`);
        console.log(`🗄️  BD PostgreSQL: ${dbTamanoMB} MB`);
        console.log(`📁 Carpeta completa: copig-app-${timestamp}`);
        console.log(`📋 Registro recovery: REGISTRO_BACKUP_RECOVERY.txt`);
        
        return backupBaseDir;
        
    } catch (error) {
        console.error('❌ Error backup completo:', error);
        throw error;
    }
}

backupCompletoSistema().catch(console.error);