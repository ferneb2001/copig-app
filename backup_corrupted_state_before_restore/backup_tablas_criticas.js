const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);
const fs = require('fs');

const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
const timestamp = `${fecha}_${hora}`;

console.log('='.repeat(80));
console.log(' BACKUP DE TABLAS CRÍTICAS - ANTES DE IMPORTACIÓN MASIVA');
console.log(' Fecha:', new Date().toLocaleString('es-AR'));
console.log('='.repeat(80));

(async () => {
    try {
        console.log('\n🔵 CREANDO BACKUP DE TABLAS EN BASE DE DATOS...\n');
        
        // 1. Backup tabla empresas
        console.log('1. Respaldando tabla EMPRESAS...');
        await pool.query(`
            DROP TABLE IF EXISTS copig.empresas_backup_${timestamp};
        `);
        await pool.query(`
            CREATE TABLE copig.empresas_backup_${timestamp} AS 
            SELECT * FROM copig.empresas
        `);
        const empresas = await pool.query(`SELECT COUNT(*) FROM copig.empresas_backup_${timestamp}`);
        console.log(`   ✅ Tabla empresas_backup_${timestamp} creada con ${empresas.rows[0].count} registros`);
        
        // 2. Backup tabla representantes_tecnicos
        console.log('\n2. Respaldando tabla REPRESENTANTES_TECNICOS...');
        await pool.query(`
            DROP TABLE IF EXISTS copig.representantes_tecnicos_backup_${timestamp};
        `);
        await pool.query(`
            CREATE TABLE copig.representantes_tecnicos_backup_${timestamp} AS 
            SELECT * FROM copig.representantes_tecnicos
        `);
        const rts = await pool.query(`SELECT COUNT(*) FROM copig.representantes_tecnicos_backup_${timestamp}`);
        console.log(`   ✅ Tabla representantes_tecnicos_backup_${timestamp} creada con ${rts.rows[0].count} registros`);
        
        // 3. Backup tabla profesionales (por las matrículas)
        console.log('\n3. Respaldando tabla PROFESIONALES...');
        await pool.query(`
            DROP TABLE IF EXISTS copig.profesionales_backup_${timestamp};
        `);
        await pool.query(`
            CREATE TABLE copig.profesionales_backup_${timestamp} AS 
            SELECT * FROM copig.profesionales
        `);
        const profs = await pool.query(`SELECT COUNT(*) FROM copig.profesionales_backup_${timestamp}`);
        console.log(`   ✅ Tabla profesionales_backup_${timestamp} creada con ${profs.rows[0].count} registros`);
        
        // 4. Backup tabla matriculas
        console.log('\n4. Respaldando tabla MATRICULAS...');
        await pool.query(`
            DROP TABLE IF EXISTS copig.matriculas_backup_${timestamp};
        `);
        await pool.query(`
            CREATE TABLE copig.matriculas_backup_${timestamp} AS 
            SELECT * FROM copig.matriculas
        `);
        const mats = await pool.query(`SELECT COUNT(*) FROM copig.matriculas_backup_${timestamp}`);
        console.log(`   ✅ Tabla matriculas_backup_${timestamp} creada con ${mats.rows[0].count} registros`);
        
        // Crear archivo de información del backup
        console.log('\n📄 CREANDO ARCHIVO DE INFORMACIÓN DEL BACKUP...');
        
        const backupInfo = {
            fecha: new Date().toISOString(),
            timestamp: timestamp,
            motivo: 'Backup antes de importación masiva desde emp-rtcos-20250831.xlsx',
            tablas: {
                empresas: {
                    nombre_backup: `empresas_backup_${timestamp}`,
                    registros: parseInt(empresas.rows[0].count)
                },
                representantes_tecnicos: {
                    nombre_backup: `representantes_tecnicos_backup_${timestamp}`,
                    registros: parseInt(rts.rows[0].count)
                },
                profesionales: {
                    nombre_backup: `profesionales_backup_${timestamp}`,
                    registros: parseInt(profs.rows[0].count)
                },
                matriculas: {
                    nombre_backup: `matriculas_backup_${timestamp}`,
                    registros: parseInt(mats.rows[0].count)
                }
            },
            comando_restauracion: `
-- Para restaurar desde este backup:
DROP TABLE IF EXISTS copig.empresas;
CREATE TABLE copig.empresas AS SELECT * FROM copig.empresas_backup_${timestamp};

DROP TABLE IF EXISTS copig.representantes_tecnicos;
CREATE TABLE copig.representantes_tecnicos AS SELECT * FROM copig.representantes_tecnicos_backup_${timestamp};

DROP TABLE IF EXISTS copig.profesionales;
CREATE TABLE copig.profesionales AS SELECT * FROM copig.profesionales_backup_${timestamp};

DROP TABLE IF EXISTS copig.matriculas;
CREATE TABLE copig.matriculas AS SELECT * FROM copig.matriculas_backup_${timestamp};
            `
        };
        
        fs.writeFileSync(`backup_info_${timestamp}.json`, JSON.stringify(backupInfo, null, 2));
        console.log(`   ✅ Archivo backup_info_${timestamp}.json creado`);
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESUMEN DEL BACKUP');
        console.log('='.repeat(80));
        console.log(`\n✅ BACKUP COMPLETADO EXITOSAMENTE`);
        console.log(`   Timestamp: ${timestamp}`);
        console.log(`\n📊 Tablas respaldadas:`);
        console.log(`   • empresas_backup_${timestamp}: ${empresas.rows[0].count} registros`);
        console.log(`   • representantes_tecnicos_backup_${timestamp}: ${rts.rows[0].count} registros`);
        console.log(`   • profesionales_backup_${timestamp}: ${profs.rows[0].count} registros`);
        console.log(`   • matriculas_backup_${timestamp}: ${mats.rows[0].count} registros`);
        console.log(`\n💾 Información guardada en: backup_info_${timestamp}.json`);
        
        console.log('\n⚠️ IMPORTANTE:');
        console.log('   Las tablas de backup permanecerán en la BD hasta que se eliminen manualmente');
        console.log('   Para restaurar, use los comandos SQL en backup_info_${timestamp}.json');
        
        await pool.end();
        
        console.log('\n✅ Backup completado. Procediendo con la importación...\n');
        
    } catch (error) {
        console.error('\n❌ ERROR DURANTE EL BACKUP:', error);
        console.error('   NO PROCEDER CON LA IMPORTACIÓN');
        await pool.end();
        process.exit(1);
    }
})();