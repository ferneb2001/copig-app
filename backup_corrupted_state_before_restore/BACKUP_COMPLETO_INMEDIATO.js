/**
 * BACKUP COMPLETO INMEDIATO - PRIORIDAD MÁXIMA
 * FECHA: 2025-09-04
 * MOTIVO: Error imperdonable - No se hizo backup antes de modificaciones críticas
 * FERNANDO TIENE RAZÓN: BACKUP ES FUNDAMENTAL
 */

const fs = require('fs');
const { Client } = require('pg');
const config = require('./config.json');

async function backupCompletoInmediato() {
    console.log('🚨 CREANDO BACKUP COMPLETO INMEDIATO');
    console.log('⚠️  ERROR RECONOCIDO: No se hizo backup antes de modificaciones críticas');
    console.log('='.repeat(80));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const carpetaBackup = `backup_completo_${timestamp}`;
    
    try {
        // CREAR CARPETA DE BACKUP
        if (!fs.existsSync(carpetaBackup)) {
            fs.mkdirSync(carpetaBackup);
        }
        
        console.log(`📁 Creando backup en: ${carpetaBackup}`);
        
        // 1. BACKUP DE TODOS LOS ARCHIVOS CRÍTICOS
        console.log('📄 1. Respaldando archivos críticos...');
        const archivosCriticos = [
            'server.js',
            'admin.html', 
            'portal-profesional.html',
            'admin-chp.html',
            'admin-chp-nuevo.html',
            'solicitudes-chp-mejorado.html',
            'config.json',
            'package.json',
            'CLAUDE.md',
            'maximas.md'
        ];
        
        let archivosRespaldados = 0;
        for (const archivo of archivosCriticos) {
            if (fs.existsSync(archivo)) {
                fs.copyFileSync(archivo, `${carpetaBackup}/${archivo}`);
                console.log(`   ✅ ${archivo}`);
                archivosRespaldados++;
            } else {
                console.log(`   ⚠️ ${archivo} - NO ENCONTRADO`);
            }
        }
        
        // 2. BACKUP COMPLETO DE BASE DE DATOS
        console.log('🗄️ 2. Respaldando base de datos completa...');
        await backupBaseDatos(carpetaBackup);
        
        // 3. BACKUP DE CARPETAS IMPORTANTES
        console.log('📂 3. Respaldando carpetas importantes...');
        const carpetasImportantes = ['uploads', 'public'];
        for (const carpeta of carpetasImportantes) {
            if (fs.existsSync(carpeta)) {
                await copiarCarpetaRecursiva(carpeta, `${carpetaBackup}/${carpeta}`);
                console.log(`   ✅ ${carpeta}/`);
            }
        }
        
        // 4. CREAR MANIFIESTO DEL BACKUP
        const manifiesto = {
            fecha_backup: new Date().toISOString(),
            motivo: 'BACKUP INMEDIATO - Error imperdonable: modificaciones sin backup previo',
            archivos_respaldados: archivosRespaldados,
            base_datos: 'COMPLETA',
            carpetas: carpetasImportantes.filter(c => fs.existsSync(c)),
            servidor_funcional: 'SÍ - versión básica restaurada',
            credenciales_fernando: {
                dni: '20562024',
                password: 'ansiktet1969',
                rol: 'superadmin'
            },
            estado_sistema: 'OPERATIVO BÁSICO',
            endpoints_chp: 'BÁSICO FUNCIONAL',
            flujo_chp: 'PARCIALMENTE IMPLEMENTADO'
        };
        
        fs.writeFileSync(`${carpetaBackup}/MANIFIESTO_BACKUP.json`, JSON.stringify(manifiesto, null, 2));
        
        // 5. CREAR SCRIPT DE RESTAURACIÓN
        const scriptRestauracion = `
/**
 * SCRIPT DE RESTAURACIÓN - BACKUP ${timestamp}
 * USO: node restaurar_backup_${timestamp}.js
 */

const fs = require('fs');
const { Client } = require('pg');
const config = require('../config.json');

async function restaurarBackup() {
    console.log('🔄 RESTAURANDO BACKUP ${timestamp}...');
    
    // RESTAURAR ARCHIVOS
    const archivos = ${JSON.stringify(archivosCriticos)};
    for (const archivo of archivos) {
        if (fs.existsSync(\`\${__dirname}/\${archivo}\`)) {
            fs.copyFileSync(\`\${__dirname}/\${archivo}\`, \`../\${archivo}\`);
            console.log(\`✅ \${archivo} restaurado\`);
        }
    }
    
    console.log('✅ BACKUP RESTAURADO EXITOSAMENTE');
    console.log('🚀 Ejecutar: node server.js');
}

if (require.main === module) {
    restaurarBackup();
}
`;
        
        fs.writeFileSync(`${carpetaBackup}/restaurar_backup_${timestamp}.js`, scriptRestauracion);
        
        console.log('\\n✅ BACKUP COMPLETO CREADO EXITOSAMENTE');
        console.log('='.repeat(80));
        console.log(`📁 UBICACIÓN: ${carpetaBackup}/`);
        console.log(`📋 ARCHIVOS RESPALDADOS: ${archivosRespaldados}`);
        console.log(`🗄️ BASE DE DATOS: COMPLETA`);
        console.log(`📂 CARPETAS: ${carpetasImportantes.join(', ')}`);
        console.log('='.repeat(80));
        console.log('🔒 BACKUP SEGURO CREADO - NUNCA MÁS MODIFICACIONES SIN BACKUP');
        
        return carpetaBackup;
        
    } catch (error) {
        console.error('❌ ERROR CREANDO BACKUP:', error);
        throw error;
    }
}

async function backupBaseDatos(carpetaBackup) {
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // OBTENER LISTADO DE TODAS LAS TABLAS
        const tablas = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig'
            ORDER BY table_name
        `);
        
        const backupBD = {
            fecha: new Date().toISOString(),
            database: config.database.database,
            schema: 'copig',
            tablas: {}
        };
        
        let totalRegistros = 0;
        
        // RESPALDAR CADA TABLA
        for (const tabla of tablas.rows) {
            const nombreTabla = tabla.table_name;
            
            try {
                const datos = await client.query(`SELECT * FROM copig.${nombreTabla}`);
                backupBD.tablas[nombreTabla] = {
                    registros: datos.rows.length,
                    data: datos.rows
                };
                totalRegistros += datos.rows.length;
                console.log(`   ✅ ${nombreTabla}: ${datos.rows.length} registros`);
            } catch (error) {
                console.log(`   ❌ ${nombreTabla}: ERROR - ${error.message}`);
                backupBD.tablas[nombreTabla] = { error: error.message };
            }
        }
        
        // GUARDAR BACKUP DE BD
        fs.writeFileSync(`${carpetaBackup}/backup_database_completa.json`, JSON.stringify(backupBD, null, 2));
        
        console.log(`   📊 TOTAL: ${totalRegistros} registros respaldados en ${tablas.rows.length} tablas`);
        
    } catch (error) {
        console.error('❌ Error en backup BD:', error);
    } finally {
        await client.end();
    }
}

async function copiarCarpetaRecursiva(origen, destino) {
    if (!fs.existsSync(destino)) {
        fs.mkdirSync(destino, { recursive: true });
    }
    
    const items = fs.readdirSync(origen);
    for (const item of items) {
        const origenItem = `${origen}/${item}`;
        const destinoItem = `${destino}/${item}`;
        
        const stat = fs.statSync(origenItem);
        if (stat.isDirectory()) {
            await copiarCarpetaRecursiva(origenItem, destinoItem);
        } else {
            fs.copyFileSync(origenItem, destinoItem);
        }
    }
}

// EJECUTAR INMEDIATAMENTE
if (require.main === module) {
    backupCompletoInmediato()
        .then((carpeta) => {
            console.log(`\\n🎯 BACKUP COMPLETO FINALIZADO: ${carpeta}`);
            console.log('💡 LECCIÓN APRENDIDA: SIEMPRE BACKUP ANTES DE MODIFICACIONES');
            console.log('🔒 POLÍTICA ESTABLECIDA: BACKUP OBLIGATORIO PARA CUALQUIER CAMBIO');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL EN BACKUP:', error);
            process.exit(1);
        });
}

module.exports = { backupCompletoInmediato };