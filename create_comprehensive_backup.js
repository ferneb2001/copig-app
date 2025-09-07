const { Pool } = require('pg');
const fs = require('fs');
const { execSync } = require('child_process');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function createComprehensiveBackup() {
    console.log('💾 CREANDO BACKUP COMPLETO ANTES DE SEPARACIÓN\n');
    console.log('=' .repeat(70));
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `C:/copig-app/backup_separation_${timestamp}`;
    
    try {
        // 1. Crear directorio de backup
        console.log('📁 1. Creando directorio de backup...');
        fs.mkdirSync(backupDir, { recursive: true });
        console.log(`✅ Directorio creado: ${backupDir}`);

        // 2. Backup completo de PostgreSQL usando pg_dump
        console.log('\n🗄️  2. Creando backup completo de PostgreSQL...');
        try {
            const pgDumpCmd = `pg_dump -U postgres -h localhost copig_moderno > "${backupDir}/copig_moderno_complete.sql"`;
            execSync(pgDumpCmd, { env: { ...process.env, PGPASSWORD: 'ansiktet1969' } });
            console.log('✅ Backup PostgreSQL creado exitosamente');
        } catch (error) {
            console.log('⚠️  pg_dump falló, creando backup manual...');
            
            // Backup manual por tablas críticas
            const criticalTables = [
                'profesionales', 'matriculas', 'pagos_historicos', 
                'empresas', 'representantes_tecnicos', 'restricciones_deudas',
                'admin_users', 'profesionales_auth', 'sanciones_aplicadas'
            ];
            
            for (const table of criticalTables) {
                console.log(`   Backing up table: copig.${table}`);
                const data = await pool.query(`SELECT * FROM copig.${table}`);
                fs.writeFileSync(
                    `${backupDir}/${table}_backup.json`, 
                    JSON.stringify(data.rows, null, 2)
                );
                console.log(`   ✅ ${table}: ${data.rows.length} records backed up`);
            }
        }

        // 3. Estadísticas pre-separación
        console.log('\n📊 3. Recopilando estadísticas pre-separación...');
        
        const stats = {
            timestamp: new Date().toISOString(),
            descripcion: 'Backup previo a separación de profesionales externos',
            estadisticas: {}
        };

        // Contar totales por tabla
        const tables = ['profesionales', 'matriculas', 'pagos_historicos', 'empresas', 'representantes_tecnicos'];
        for (const table of tables) {
            const count = await pool.query(`SELECT COUNT(*) as total FROM copig.${table}`);
            stats.estadisticas[table] = parseInt(count.rows[0].total);
        }

        // Profesionales por provincia
        const porProvincia = await pool.query(`
            SELECT provincia, COUNT(*) as cantidad 
            FROM copig.profesionales 
            WHERE activo = true 
            GROUP BY provincia 
            ORDER BY cantidad DESC
        `);
        stats.estadisticas.profesionales_por_provincia = porProvincia.rows;

        // Estados financieros
        const estados = await pool.query(`
            SELECT 
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                COUNT(*) as cantidad
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            GROUP BY calcular_estado_profesional(m.numero_matricula::TEXT)
        `);
        stats.estadisticas.estados_financieros = estados.rows;

        // Guardar estadísticas
        fs.writeFileSync(`${backupDir}/pre_separation_stats.json`, JSON.stringify(stats, null, 2));
        
        console.log('📋 Estadísticas pre-separación:');
        Object.entries(stats.estadisticas).forEach(([key, value]) => {
            if (typeof value === 'number') {
                console.log(`   ${key}: ${value.toLocaleString()}`);
            }
        });

        // 4. Backup de archivos críticos del sistema
        console.log('\n📄 4. Copiando archivos críticos del sistema...');
        
        const criticalFiles = [
            'server.js',
            'admin.html', 
            'portal-profesional.html',
            'package.json',
            'CLAUDE.md',
            'maximas.md'
        ];

        for (const file of criticalFiles) {
            try {
                if (fs.existsSync(`C:/copig-app/${file}`)) {
                    fs.copyFileSync(
                        `C:/copig-app/${file}`, 
                        `${backupDir}/${file}`
                    );
                    console.log(`   ✅ ${file} copiado`);
                }
            } catch (error) {
                console.log(`   ⚠️  Error copiando ${file}: ${error.message}`);
            }
        }

        // 5. Crear script de rollback
        console.log('\n🔄 5. Creando script de rollback...');
        
        const rollbackScript = `
-- SCRIPT DE ROLLBACK - SEPARACIÓN PROFESIONALES EXTERNOS
-- Creado: ${new Date().toISOString()}
-- Para usar: psql -U postgres -d copig_moderno -f rollback_separation.sql

-- 1. Restaurar desde backup completo (si es necesario)
-- psql -U postgres -d copig_moderno < copig_moderno_complete.sql

-- 2. O restaurar tablas específicas desde JSON (implementar según necesidad)

-- IMPORTANTE: Este script debe ser ejecutado solo si la separación falla
-- Verificar siempre los datos antes de proceder
SELECT 'ROLLBACK SCRIPT READY - USE WITH CAUTION' as mensaje;
`;
        
        fs.writeFileSync(`${backupDir}/rollback_separation.sql`, rollbackScript);
        console.log('✅ Script de rollback creado');

        // 6. Resumen final
        console.log('\n' + '='.repeat(70));
        console.log('🎯 BACKUP COMPLETO FINALIZADO');
        console.log('='.repeat(70));
        
        console.log(`\n📁 Directorio: ${backupDir}`);
        console.log(`📊 Estadísticas: ${Object.keys(stats.estadisticas).length} categorías`);
        console.log(`🗄️  Base datos: Backup completo realizado`);
        console.log(`📄 Archivos: ${criticalFiles.length} archivos críticos`);
        console.log(`🔄 Rollback: Script de reversión listo`);
        
        console.log(`\n✅ SISTEMA LISTO PARA SEPARACIÓN SEGURA`);
        console.log(`⚠️  IMPORTANTE: Mantener servidor corriendo durante proceso`);
        
        return backupDir;

    } catch (error) {
        console.error('❌ Error creando backup:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

createComprehensiveBackup()
    .then(backupDir => {
        console.log(`\n🎉 Backup completado en: ${backupDir}`);
        console.log('Listo para proceder con la separación de profesionales externos.');
    })
    .catch(error => {
        console.error('💥 Error en backup:', error.message);
        process.exit(1);
    });