#!/usr/bin/env node

/**
 * BACKUP COMPLETO SISTEMA COPIG - ANTES DE IMPLEMENTAR FLUJO CHP COMPLETO
 * Fecha: 2025-09-04
 * Propósito: Backup preventivo antes de implementar el flujo completo de CHP con:
 * - Modal de revisión con 3 secciones
 * - Nuevos estados del flujo
 * - Sistema de facturación automática
 * - Portal de pago para profesionales
 * - Recálculo automático en formularios
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de base de datos
const config = require('./config.json');
const pool = new Pool(config.database);

async function crearBackupCompleto() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, `backup_chp_flujo_${timestamp}`);
    
    try {
        // Crear directorio de backup
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        console.log('🔄 Iniciando backup completo del sistema...');
        
        // 1. BACKUP BASE DE DATOS
        console.log('📊 Haciendo backup de base de datos...');
        
        const tablas = [
            'solicitudes_chp',
            'documentos_chp', 
            'aranceles_chp',
            'profesionales',
            'empresas',
            'admin_users',
            'representantes_tecnicos',
            'pagos_historicos',
            'restricciones_deudas',
            'sanciones_aplicadas',
            'cuenta_corriente',
            'comprobantes_pago'
        ];
        
        const backupData = {};
        
        for (const tabla of tablas) {
            try {
                const result = await pool.query(`SELECT * FROM copig.${tabla}`);
                backupData[tabla] = {
                    count: result.rowCount,
                    data: result.rows
                };
                console.log(`  ✅ ${tabla}: ${result.rowCount} registros`);
            } catch (error) {
                console.log(`  ⚠️ ${tabla}: No existe o error - ${error.message}`);
                backupData[tabla] = { count: 0, data: [], error: error.message };
            }
        }
        
        // Guardar backup de BD
        const backupDBFile = path.join(backupDir, 'database_backup.json');
        fs.writeFileSync(backupDBFile, JSON.stringify(backupData, null, 2));
        
        // 2. BACKUP ARCHIVOS CRÍTICOS
        console.log('📁 Haciendo backup de archivos críticos...');
        
        const archivosCriticos = [
            'server.js',
            'admin-chp.html',
            'portal-profesional.html',
            'config.json',
            'CLAUDE.md',
            'maximas.md',
            'package.json'
        ];
        
        for (const archivo of archivosCriticos) {
            try {
                if (fs.existsSync(archivo)) {
                    const contenido = fs.readFileSync(archivo, 'utf8');
                    fs.writeFileSync(path.join(backupDir, archivo), contenido);
                    console.log(`  ✅ ${archivo}: Copiado`);
                } else {
                    console.log(`  ⚠️ ${archivo}: No encontrado`);
                }
            } catch (error) {
                console.log(`  ❌ ${archivo}: Error - ${error.message}`);
            }
        }
        
        // 3. INFORMACIÓN DEL SISTEMA
        console.log('ℹ️ Guardando información del sistema...');
        
        const infoSistema = {
            timestamp: new Date().toISOString(),
            proposito: 'Backup antes de implementar flujo CHP completo',
            cambios_planificados: [
                'Modal de revisión con 3 secciones editables',
                'Nuevos estados: ESPERANDO_PAGO, PAGO_VERIFICADO, LISTO_EMITIR',
                'Sistema de facturación automática',
                'Portal de pago integrado para profesionales',
                'Carga de comprobantes de pago',
                'Recálculo automático en formularios',
                'Notificaciones automáticas entre profesional y staff'
            ],
            estadisticas_backup: backupData,
            archivos_respaldados: archivosCriticos.filter(f => fs.existsSync(f))
        };
        
        fs.writeFileSync(
            path.join(backupDir, 'info_backup.json'), 
            JSON.stringify(infoSistema, null, 2)
        );
        
        // 4. SCRIPT DE RESTAURACIÓN
        console.log('🔧 Creando script de restauración...');
        
        const scriptRestauracion = `#!/usr/bin/env node
        
/**
 * SCRIPT DE RESTAURACIÓN - BACKUP ${timestamp}
 * Restaura el sistema al estado previo antes de la implementación del flujo CHP completo
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const config = require('../config.json');
const pool = new Pool(config.database);

async function restaurarSistema() {
    console.log('🔄 Iniciando restauración del sistema...');
    
    try {
        // Leer backup de BD
        const backupData = JSON.parse(fs.readFileSync('./database_backup.json', 'utf8'));
        
        // Restaurar archivos
        const archivos = ['server.js', 'admin-chp.html', 'portal-profesional.html'];
        for (const archivo of archivos) {
            if (fs.existsSync(archivo)) {
                fs.copyFileSync(archivo, \`../\${archivo}\`);
                console.log(\`✅ Restaurado: \${archivo}\`);
            }
        }
        
        console.log('✅ Restauración completada');
        console.log('⚠️ IMPORTANTE: Reiniciar servidor manualmente');
        
    } catch (error) {
        console.error('❌ Error en restauración:', error);
    }
}

restaurarSistema();
`;
        
        fs.writeFileSync(path.join(backupDir, 'restaurar.js'), scriptRestauracion);
        
        // 5. RESUMEN FINAL
        const totalRegistros = Object.values(backupData)
            .reduce((total, tabla) => total + (tabla.count || 0), 0);
        
        console.log('\n🎉 BACKUP COMPLETO EXITOSO');
        console.log('═══════════════════════════════');
        console.log(`📁 Ubicación: ${backupDir}`);
        console.log(`📊 Total registros: ${totalRegistros}`);
        console.log(`📄 Archivos respaldados: ${archivosCriticos.filter(f => fs.existsSync(f)).length}`);
        console.log(`⏰ Timestamp: ${timestamp}`);
        console.log('═══════════════════════════════');
        console.log('✅ Sistema listo para implementar flujo CHP completo');
        
        return {
            success: true,
            backupPath: backupDir,
            timestamp: timestamp,
            totalRegistros: totalRegistros
        };
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    crearBackupCompleto()
        .then(result => {
            if (result.success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { crearBackupCompleto };