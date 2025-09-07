#!/usr/bin/env node

/**
 * BACKUP COMPLETO ANTES DE UPGRADE ARCA
 * Fecha: 2025-09-04
 * Propósito: Backup de BD y archivos críticos antes de integración ARCA
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const pool = new Pool(config.database);

async function crearBackupCompleto() {
    try {
        console.log('💾 CREANDO BACKUP COMPLETO ANTES DE UPGRADE ARCA');
        console.log('═══════════════════════════════════════════════════');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, `backup_arca_${timestamp}`);
        
        // Crear directorio de backup
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        console.log(`📁 Directorio backup: ${backupDir}`);
        
        // 1. BACKUP BASE DE DATOS
        console.log('\n🗄️ PASO 1: Backup de base de datos...');
        
        const tablas = [
            'solicitudes_chp',
            'facturas_chp', 
            'notificaciones_chp',
            'profesionales',
            'empresas',
            'admin_users'
        ];
        
        const backupBD = {};
        let totalRegistros = 0;
        
        for (const tabla of tablas) {
            try {
                const resultado = await pool.query(`SELECT * FROM copig.${tabla}`);
                backupBD[tabla] = resultado.rows;
                totalRegistros += resultado.rows.length;
                console.log(`  ✅ ${tabla}: ${resultado.rows.length} registros`);
            } catch (error) {
                console.log(`  ⚠️ ${tabla}: ERROR - ${error.message}`);
                backupBD[tabla] = [];
            }
        }
        
        // Guardar backup BD
        const archivoBackupBD = path.join(backupDir, 'database_backup.json');
        fs.writeFileSync(archivoBackupBD, JSON.stringify(backupBD, null, 2));
        
        console.log(`✅ Backup BD guardado: ${totalRegistros} registros totales`);
        
        // 2. BACKUP ARCHIVOS CRÍTICOS  
        console.log('\n📄 PASO 2: Backup archivos críticos...');
        
        const archivosCriticos = [
            'server.js',
            'config.json',
            'portal-profesional.html',
            'admin-chp.html',
            'admin.html',
            'empresas.html',
            'CLAUDE.md'
        ];
        
        const backupArchivos = {};
        
        for (const archivo of archivosCriticos) {
            const rutaArchivo = path.join(__dirname, archivo);
            if (fs.existsSync(rutaArchivo)) {
                const contenido = fs.readFileSync(rutaArchivo, 'utf8');
                backupArchivos[archivo] = contenido;
                console.log(`  ✅ ${archivo}: ${contenido.length} caracteres`);
            } else {
                console.log(`  ⚠️ ${archivo}: NO ENCONTRADO`);
            }
        }
        
        // Guardar backup archivos
        const archivoBackupFiles = path.join(backupDir, 'files_backup.json');
        fs.writeFileSync(archivoBackupFiles, JSON.stringify(backupArchivos, null, 2));
        
        console.log(`✅ Backup archivos guardado: ${Object.keys(backupArchivos).length} archivos`);
        
        // 3. CREAR SCRIPT DE RESTAURACIÓN
        console.log('\n🔄 PASO 3: Creando script de restauración...');
        
        const scriptRestauracion = `#!/usr/bin/env node

/**
 * SCRIPT DE RESTAURACIÓN BACKUP ARCA
 * Generado automáticamente el: ${new Date().toLocaleString('es-AR')}
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const pool = new Pool(config.database);

async function restaurarBackup() {
    try {
        console.log('🔄 RESTAURANDO BACKUP ANTES DE UPGRADE ARCA...');
        
        // Restaurar base de datos
        const backupBD = JSON.parse(fs.readFileSync('${path.basename(archivoBackupBD)}', 'utf8'));
        
        for (const [tabla, datos] of Object.entries(backupBD)) {
            if (datos.length > 0) {
                await pool.query(\`DELETE FROM copig.\${tabla}\`);
                
                const columnas = Object.keys(datos[0]);
                const placeholders = datos.map((_, i) => 
                    '(' + columnas.map((_, j) => \`$\${i * columnas.length + j + 1}\`).join(',') + ')'
                ).join(',');
                
                const valores = datos.flatMap(row => columnas.map(col => row[col]));
                
                await pool.query(
                    \`INSERT INTO copig.\${tabla} (\${columnas.join(',')}) VALUES \${placeholders}\`,
                    valores
                );
                
                console.log(\`✅ \${tabla}: \${datos.length} registros restaurados\`);
            }
        }
        
        // Restaurar archivos
        const backupArchivos = JSON.parse(fs.readFileSync('${path.basename(archivoBackupFiles)}', 'utf8'));
        
        for (const [archivo, contenido] of Object.entries(backupArchivos)) {
            fs.writeFileSync(path.join('..', archivo), contenido);
            console.log(\`✅ \${archivo} restaurado\`);
        }
        
        console.log('🎉 RESTAURACIÓN COMPLETADA');
        
    } catch (error) {
        console.error('❌ Error en restauración:', error);
    }
}

if (require.main === module) {
    restaurarBackup();
}`;
        
        const archivoRestauracion = path.join(backupDir, 'restaurar_backup.js');
        fs.writeFileSync(archivoRestauracion, scriptRestauracion);
        
        console.log(`✅ Script de restauración creado`);
        
        // 4. CREAR RESUMEN
        console.log('\n📊 PASO 4: Creando resumen del backup...');
        
        const resumen = {
            fecha_backup: new Date().toISOString(),
            directorio: backupDir,
            estadisticas: {
                total_registros_bd: totalRegistros,
                tablas_respaldadas: Object.keys(backupBD).length,
                archivos_respaldados: Object.keys(backupArchivos).length
            },
            archivos_creados: [
                path.basename(archivoBackupBD),
                path.basename(archivoBackupFiles), 
                path.basename(archivoRestauracion)
            ],
            proposito: 'Backup antes de upgrade ARCA - Integración facturación electrónica',
            instrucciones_restauracion: [
                '1. Ir al directorio de backup',
                '2. Ejecutar: node restaurar_backup.js',
                '3. Reiniciar servidor si es necesario'
            ]
        };
        
        const archivoResumen = path.join(backupDir, 'RESUMEN_BACKUP.json');
        fs.writeFileSync(archivoResumen, JSON.stringify(resumen, null, 2));
        
        console.log(`✅ Resumen guardado en: ${path.basename(archivoResumen)}`);
        
        // 5. RESULTADO FINAL
        const tamanoDir = calcularTamanoDirectorio(backupDir);
        
        console.log('\n🎉 BACKUP COMPLETO CREADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════');
        console.log(`📁 Directorio: ${backupDir}`);
        console.log(`💾 Tamaño total: ${(tamanoDir / 1024 / 1024).toFixed(2)} MB`);
        console.log(`🗄️ Base de datos: ${totalRegistros} registros`);
        console.log(`📄 Archivos: ${Object.keys(backupArchivos).length} archivos`);
        console.log('\n📋 ARCHIVOS CREADOS:');
        console.log(`  • database_backup.json - Base de datos completa`);
        console.log(`  • files_backup.json - Archivos críticos`);
        console.log(`  • restaurar_backup.js - Script de restauración`);
        console.log(`  • RESUMEN_BACKUP.json - Información del backup`);
        console.log('\n✅ LISTO PARA UPGRADE ARCA');
        
        return {
            success: true,
            directorio: backupDir,
            registros: totalRegistros,
            archivos: Object.keys(backupArchivos).length,
            tamano_mb: (tamanoDir / 1024 / 1024).toFixed(2)
        };
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        return { success: false, error: error.message };
    }
}

function calcularTamanoDirectorio(dir) {
    let tamanoTotal = 0;
    const archivos = fs.readdirSync(dir);
    
    for (const archivo of archivos) {
        const rutaCompleta = path.join(dir, archivo);
        const stats = fs.statSync(rutaCompleta);
        tamanoTotal += stats.size;
    }
    
    return tamanoTotal;
}

// Ejecutar backup si se llama directamente
if (require.main === module) {
    crearBackupCompleto()
        .then(result => {
            if (result.success) {
                console.log(`\n🚀 BACKUP COMPLETADO - Tamaño: ${result.tamano_mb} MB`);
                process.exit(0);
            } else {
                console.error('💥 Backup falló:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error fatal en backup:', error);
            process.exit(1);
        });
}

module.exports = { crearBackupCompleto };