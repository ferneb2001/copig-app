/**
 * BACKUP OBLIGATORIO - IMPLEMENTACIÓN FLUJO PDF CHP
 * ================================================
 * Siguiendo máxima: "PEDIR BACKUP ANTES DE CAMBIOS SENSIBLES"
 * Backup completo antes de implementar flujo PDF
 */

const fs = require('fs');
const { Pool } = require('pg');
const config = require('./config.json');

async function createComprehensiveBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_chp_pdf_implementation_${timestamp}`;
    
    console.log('🔄 BACKUP OBLIGATORIO: Implementación flujo PDF CHP...');
    console.log(`📁 Directorio: ${backupDir}\n`);
    
    // Crear directorio
    fs.mkdirSync(backupDir);
    
    try {
        // 1. Backup archivos críticos
        console.log('📄 Backing up archivos críticos...');
        const archivosCriticos = [
            'server.js',
            'admin-chp.html', 
            'portal-profesional.html',
            'admin.html',
            'config.json',
            'maximas.md',
            'CLAUDE.md'
        ];
        
        archivosCriticos.forEach(archivo => {
            try {
                fs.copyFileSync(archivo, `${backupDir}/${archivo}`);
                console.log(`   ✅ ${archivo}`);
            } catch (err) {
                console.log(`   ❌ ${archivo}: ${err.message}`);
            }
        });
        
        // 2. Backup tablas CHP específicas
        console.log('\n💾 Backing up tablas CHP...');
        const pool = new Pool(config.database);
        
        const tablasCHP = [
            'solicitudes_chp',
            'documentos_chp', 
            'facturas_chp',
            'certificados_chp',
            'aranceles_chp',
            'notificaciones_chp'
        ];
        
        for (const tabla of tablasCHP) {
            try {
                const data = await pool.query(`SELECT * FROM copig.${tabla} ORDER BY id`);
                fs.writeFileSync(
                    `${backupDir}/${tabla}_backup.json`,
                    JSON.stringify(data.rows, null, 2)
                );
                console.log(`   ✅ ${tabla}: ${data.rows.length} registros`);
            } catch (err) {
                console.log(`   ❌ ${tabla}: ${err.message}`);
            }
        }
        
        // 3. Backup estructura de BD CHP
        console.log('\n🏗️  Backing up estructura BD CHP...');
        try {
            const estructura = await pool.query(`
                SELECT table_name, column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_schema = 'copig' AND table_name LIKE '%chp%'
                ORDER BY table_name, ordinal_position
            `);
            
            fs.writeFileSync(
                `${backupDir}/estructura_chp_backup.json`,
                JSON.stringify(estructura.rows, null, 2)  
            );
            console.log(`   ✅ Estructura CHP: ${estructura.rows.length} columnas`);
        } catch (err) {
            console.log(`   ❌ Estructura: ${err.message}`);
        }
        
        await pool.end();
        
        // 4. Crear script de restauración
        console.log('\n🔧 Creando script de restauración...');
        const restoreScript = `
/**
 * SCRIPT DE RESTAURACIÓN - CHP PDF IMPLEMENTATION
 * =============================================
 */

const fs = require('fs');

function restore() {
    console.log('🔄 Restaurando desde backup ${backupDir}...');
    
    // Restaurar archivos
    const archivos = ${JSON.stringify(archivosCriticos)};
    archivos.forEach(archivo => {
        if (fs.existsSync('${backupDir}/' + archivo)) {
            fs.copyFileSync('${backupDir}/' + archivo, archivo);
            console.log('✅ Restaurado:', archivo);
        }
    });
    
    console.log('⚠️  IMPORTANTE: Reiniciar servidor después de restauración');
    console.log('⚠️  IMPORTANTE: Restaurar BD manualmente si es necesario');
}

if (require.main === module) {
    restore();
}

module.exports = restore;
`;
        
        fs.writeFileSync(`${backupDir}/restore.js`, restoreScript);
        
        // 5. Crear informe de backup
        const informe = {
            timestamp: timestamp,
            purpose: 'Implementación flujo PDF CHP según documento Fernando',
            files_backed_up: archivosCriticos.length,
            tables_backed_up: tablasCHP.length,
            backup_directory: backupDir,
            restore_script: `${backupDir}/restore.js`,
            maxima_applied: 'PEDIR BACKUP ANTES DE CAMBIOS SENSIBLES',
            next_step: 'Implementar estados faltantes y interfaz 3 secciones'
        };
        
        fs.writeFileSync(`${backupDir}/backup_info.json`, JSON.stringify(informe, null, 2));
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ BACKUP COMPLETO CREADO EXITOSAMENTE');
        console.log(`📁 Ubicación: ${backupDir}/`);
        console.log(`📄 Archivos: ${archivosCriticos.length}`);  
        console.log(`💾 Tablas CHP: ${tablasCHP.length}`);
        console.log(`🔧 Script restauración: ${backupDir}/restore.js`);
        console.log('='.repeat(60));
        console.log('\n✅ LISTO PARA IMPLEMENTAR MEJORAS CHP SEGÚN PDF');
        
    } catch (error) {
        console.log('❌ Error durante backup:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    createComprehensiveBackup();
}

module.exports = createComprehensiveBackup;