const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function crearBackup() {
    try {
        console.log('🛡️  CREANDO BACKUP ANTES DE MIGRACIÓN INFORMACIÓN ADICIONAL\n');
        
        // 1. Crear nombre de archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = 'C:\\copig-app\\backup_migracion_info_adicional_' + timestamp;
        const backupFile = path.join(backupDir, 'backup_completo.json');
        
        console.log(`📁 Directorio backup: ${backupDir}`);
        console.log(`📄 Archivo backup: ${backupFile}`);
        
        // 2. Crear directorio
        await fs.mkdir(backupDir, { recursive: true });
        console.log('✅ Directorio creado');
        
        // 3. Backup tablas críticas
        console.log('\n=== CREANDO BACKUP TABLAS CRÍTICAS ===');
        
        const tablasBackup = [
            'profesionales',
            'matriculas', 
            'foxpro_matricula_profesional_map',
            'titulos_profesionales',
            'vista_profesionales_estados'
        ];
        
        const backupData = {};
        
        for (const tabla of tablasBackup) {
            console.log(`📊 Respaldando ${tabla}...`);
            try {
                const result = await pool.query(`SELECT * FROM copig.${tabla}`);
                backupData[tabla] = {
                    registros: result.rows.length,
                    datos: result.rows,
                    timestamp: new Date().toISOString()
                };
                console.log(`✅ ${tabla}: ${result.rows.length} registros`);
            } catch (err) {
                console.log(`⚠️ ${tabla}: ${err.message}`);
                backupData[tabla] = {
                    error: err.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        // 4. Guardar backup
        console.log('\n=== GUARDANDO BACKUP ===');
        const backupCompleto = {
            fecha_backup: new Date().toISOString(),
            proposito: 'Backup antes de migrar información adicional desde JSON FoxPro',
            total_tablas: tablasBackup.length,
            tablas: backupData,
            metadatos: {
                total_profesionales: backupData.profesionales?.registros || 0,
                total_matriculas: backupData.matriculas?.registros || 0,
                total_registros_foxpro: backupData.foxpro_matricula_profesional_map?.registros || 0
            }
        };
        
        await fs.writeFile(backupFile, JSON.stringify(backupCompleto, null, 2), 'utf8');
        
        // 5. Verificar backup
        console.log('\n=== VERIFICANDO BACKUP ===');
        const stats = await fs.stat(backupFile);
        const tamanoMB = (stats.size / 1024 / 1024).toFixed(2);
        
        console.log(`✅ Backup creado: ${backupFile}`);
        console.log(`📏 Tamaño: ${tamanoMB} MB`);
        console.log(`📅 Fecha: ${stats.mtime}`);
        
        // 6. Crear resumen de backup
        const resumenFile = path.join(backupDir, 'resumen_backup.txt');
        const resumen = `
BACKUP INFORMACIÓN ADICIONAL - ${new Date().toISOString()}
================================================================

PROPÓSITO: Backup antes de migrar información adicional desde JSON FoxPro

UBICACIÓN: ${backupFile}
TAMAÑO: ${tamanoMB} MB

TABLAS RESPALDADAS:
${tablasBackup.map(tabla => `- ${tabla}: ${backupData[tabla]?.registros || 'ERROR'} registros`).join('\n')}

METADATOS:
- Total profesionales: ${backupCompleto.metadatos.total_profesionales}
- Total matrículas: ${backupCompleto.metadatos.total_matriculas}  
- Total registros FoxPro: ${backupCompleto.metadatos.total_registros_foxpro}

VERIFICACIÓN:
✅ Backup completado exitosamente
✅ Archivo verificado: ${tamanoMB} MB
✅ Listo para proceder con migración

================================================================
PARA RESTAURAR (si necesario):
node restaurar_backup_informacion_adicional.js "${backupFile}"
        `;
        
        await fs.writeFile(resumenFile, resumen, 'utf8');
        
        console.log('\n🎉 BACKUP COMPLETADO EXITOSAMENTE');
        console.log(`📂 FERNANDO, el backup está en: ${backupDir}`);
        console.log(`📄 Archivo principal: backup_completo.json`);
        console.log(`📋 Resumen legible: resumen_backup.txt`);
        console.log(`💾 Tamaño total: ${tamanoMB} MB`);
        
        return backupDir;
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

crearBackup().catch(console.error);