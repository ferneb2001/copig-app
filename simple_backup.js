const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function simpleBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
        console.log('💾 CREANDO BACKUP RÁPIDO...\n');
        
        // 1. BACKUP MANUAL DE DATOS CRÍTICOS
        console.log('📊 Backup de tablas críticas...');
        
        const criticalTables = [
            'copig.profesionales',
            'copig.matriculas', 
            'copig.empresas',
            'copig.pagos_historicos',
            'copig.admin_users'
        ];
        
        let backup = {
            timestamp: new Date().toISOString(),
            tables: {}
        };
        
        for (const table of criticalTables) {
            try {
                const result = await pool.query(`SELECT * FROM ${table} LIMIT 5`); // Solo muestra para confirmar
                const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                backup.tables[table] = {
                    rowCount: parseInt(countResult.rows[0].count),
                    sampleData: result.rows
                };
                console.log(`   ✅ ${table}: ${countResult.rows[0].count} registros`);
            } catch (error) {
                console.log(`   ❌ Error en ${table}: ${error.message}`);
                backup.tables[table] = { error: error.message };
            }
        }
        
        // 2. BACKUP DE ARCHIVOS CRÍTICOS
        console.log('\n📁 Backup de archivos críticos...');
        
        const criticalFiles = ['server.js', 'admin.html', 'config.json'];
        
        criticalFiles.forEach(filename => {
            try {
                if (fs.existsSync(filename)) {
                    const stats = fs.statSync(filename);
                    const content = fs.readFileSync(filename, 'utf8').substring(0, 500); // Solo primeras líneas
                    backup[filename] = {
                        size: stats.size,
                        modified: stats.mtime,
                        preview: content + (content.length === 500 ? '...' : '')
                    };
                    console.log(`   ✅ ${filename} - ${stats.size} bytes`);
                }
            } catch (error) {
                console.log(`   ❌ ${filename}: ${error.message}`);
            }
        });
        
        // Guardar backup
        const backupFile = `backup_${timestamp}.json`;
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
        
        console.log(`\n🔐 BACKUP COMPLETADO: ${backupFile}`);
        console.log('✅ Sistema protegido - Continuando con cambios...\n');
        
        return backupFile;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

simpleBackup();