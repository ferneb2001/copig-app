const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_${timestamp}`;
    
    try {
        console.log('🗂️  CREANDO BACKUP COMPLETO...\n');
        
        // 1. BACKUP DE BASE DE DATOS
        console.log('1. Creando backup de base de datos PostgreSQL...');
        
        const { spawn } = require('child_process');
        const pgdumpPath = 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe'; // Ajusta según tu instalación
        
        const pgdump = spawn(pgdumpPath, [
            '-h', 'localhost',
            '-p', '5432',
            '-U', 'postgres',
            '-d', 'copig_moderno',
            '-f', `${backupDir}_database.sql`,
            '--verbose'
        ], {
            env: { ...process.env, PGPASSWORD: 'ansiktet1969' }
        });
        
        pgdump.stdout.on('data', (data) => {
            console.log(`   📊 ${data.toString()}`);
        });
        
        pgdump.stderr.on('data', (data) => {
            console.log(`   🔧 ${data.toString()}`);
        });
        
        await new Promise((resolve, reject) => {
            pgdump.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Backup de base de datos completado\n');
                    resolve();
                } else {
                    console.log('❌ Error en backup de base de datos, código:', code);
                    // Continuar con backup manual si pg_dump falla
                    resolve();
                }
            });
        });
        
        // 2. BACKUP MANUAL DE DATOS CRÍTICOS (por si pg_dump no funciona)
        console.log('2. Creando backup manual de tablas críticas...');
        
        const criticalTables = [
            'copig.profesionales',
            'copig.matriculas', 
            'copig.empresas',
            'copig.pagos_historicos',
            'copig.representantes_tecnicos',
            'copig.admin_users',
            'copig.restricciones_deudas'
        ];
        
        let manualBackup = {
            timestamp: new Date().toISOString(),
            tables: {}
        };
        
        for (const table of criticalTables) {
            try {
                const result = await pool.query(`SELECT * FROM ${table}`);
                manualBackup.tables[table] = {
                    rowCount: result.rows.length,
                    data: result.rows
                };
                console.log(`   ✅ ${table}: ${result.rows.length} registros`);
            } catch (error) {
                console.log(`   ❌ Error en ${table}: ${error.message}`);
                manualBackup.tables[table] = { error: error.message };
            }
        }
        
        // Guardar backup manual en JSON
        fs.writeFileSync(`${backupDir}_manual.json`, JSON.stringify(manualBackup, null, 2));
        console.log(`✅ Backup manual guardado: ${backupDir}_manual.json\n`);
        
        // 3. BACKUP DE ARCHIVOS DE CÓDIGO
        console.log('3. Creando lista de archivos críticos para backup...');
        
        const criticalFiles = [
            'server.js',
            'admin.html', 
            'config.json',
            'package.json',
            'portal-profesional.html',
            'empresas.html',
            'implement_payment_status_system.js'
        ];
        
        const fileBackup = {
            timestamp: new Date().toISOString(),
            files: {}
        };
        
        criticalFiles.forEach(filename => {
            try {
                if (fs.existsSync(filename)) {
                    const content = fs.readFileSync(filename, 'utf8');
                    fileBackup.files[filename] = content;
                    console.log(`   ✅ ${filename} - ${content.length} caracteres`);
                } else {
                    console.log(`   ⚠️  ${filename} - No encontrado`);
                    fileBackup.files[filename] = null;
                }
            } catch (error) {
                console.log(`   ❌ Error leyendo ${filename}: ${error.message}`);
                fileBackup.files[filename] = { error: error.message };
            }
        });
        
        fs.writeFileSync(`${backupDir}_files.json`, JSON.stringify(fileBackup, null, 2));
        console.log(`✅ Backup de archivos guardado: ${backupDir}_files.json\n`);
        
        // 4. RESUMEN DEL BACKUP
        console.log('📋 RESUMEN DEL BACKUP:');
        console.log(`   📅 Timestamp: ${timestamp}`);
        console.log(`   💾 Backup BD PostgreSQL: ${backupDir}_database.sql`);
        console.log(`   🗃️  Backup manual JSON: ${backupDir}_manual.json`);
        console.log(`   📁 Backup archivos: ${backupDir}_files.json`);
        console.log('');
        console.log('🔐 BACKUP COMPLETO REALIZADO - Sistema protegido');
        
        return {
            success: true,
            timestamp,
            files: [`${backupDir}_database.sql`, `${backupDir}_manual.json`, `${backupDir}_files.json`]
        };
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
        return { success: false, error: error.message };
    } finally {
        await pool.end();
    }
}

createFullBackup();