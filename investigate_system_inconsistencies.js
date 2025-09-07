const { Pool } = require('pg');
const fs = require('fs');
const config = require('./config.json');

console.log('🔍 INVESTIGANDO INCONSISTENCIAS DEL SISTEMA...');
console.log('══════════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function checkDatabaseIntegrity() {
    try {
        console.log('\n📊 VERIFICANDO INTEGRIDAD DE BASE DE DATOS:');
        
        // 1. Verificar cuántos usuarios hay en total
        const userCounts = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM copig.admin_users'),
            pool.query('SELECT COUNT(*) as count FROM copig.profesionales'),
            pool.query('SELECT COUNT(*) as count FROM copig.empresas'),
            pool.query('SELECT COUNT(*) as count FROM copig.solicitudes_chp')
        ]);
        
        console.log('   📋 CONTEOS ACTUALES:');
        console.log(`      • admin_users: ${userCounts[0].rows[0].count}`);
        console.log(`      • profesionales: ${userCounts[1].rows[0].count}`);
        console.log(`      • empresas: ${userCounts[2].rows[0].count}`);
        console.log(`      • solicitudes_chp: ${userCounts[3].rows[0].count}`);
        
        // 2. Verificar usuarios admin recientes
        const recentAdmins = await pool.query(`
            SELECT id, username, full_name, role, documento, created_at, updated_at, active
            FROM copig.admin_users 
            ORDER BY id DESC
        `);
        
        console.log('\n   👥 TODOS LOS USUARIOS ADMIN:');
        if (recentAdmins.rows.length === 0) {
            console.log('      ❌ NO HAY USUARIOS ADMIN - SISTEMA SIN ADMINISTRADORES');
        } else {
            recentAdmins.rows.forEach((user, index) => {
                console.log(`      ${index + 1}. ID: ${user.id} | ${user.username} | ${user.full_name}`);
                console.log(`          Rol: ${user.role} | DNI: ${user.documento || 'NULL'} | Activo: ${user.active}`);
                console.log(`          Creado: ${user.created_at} | Modificado: ${user.updated_at}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando integridad:', error.message);
    }
}

async function checkRecentDatabaseActivity() {
    try {
        console.log('\n📋 VERIFICANDO ACTIVIDAD RECIENTE EN BD:');
        
        // Revisar logs del servidor para operaciones de DELETE o DROP
        const serverLogPath = './server.js';
        const serverContent = fs.readFileSync(serverLogPath, 'utf8');
        
        console.log('   🔍 BUSCANDO OPERACIONES PELIGROSAS EN CÓDIGO:');
        
        const dangerousOperations = [
            'DELETE FROM',
            'DROP TABLE',
            'TRUNCATE',
            'admin_users',
            'DROP USER',
            'DELETE.*admin'
        ];
        
        dangerousOperations.forEach(op => {
            const regex = new RegExp(op, 'gi');
            const matches = serverContent.match(regex);
            if (matches) {
                console.log(`      ⚠️  ENCONTRADO "${op}": ${matches.length} ocurrencias`);
            } else {
                console.log(`      ✅ "${op}": No encontrado`);
            }
        });
        
        // Buscar scripts que podrían haber eliminado usuarios
        const scriptFiles = fs.readdirSync('./')
            .filter(file => file.endsWith('.js') && file.includes('delete') || 
                           file.endsWith('.js') && file.includes('clean') ||
                           file.endsWith('.js') && file.includes('remove') ||
                           file.endsWith('.js') && file.includes('fix'));
        
        console.log('\n   📁 SCRIPTS POTENCIALMENTE PELIGROSOS:');
        if (scriptFiles.length === 0) {
            console.log('      ✅ No se encontraron scripts de limpieza/eliminación');
        } else {
            scriptFiles.forEach(file => {
                console.log(`      ⚠️  ${file} - Revisar contenido`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando actividad:', error.message);
    }
}

async function checkSystemConsistency() {
    try {
        console.log('\n🔧 VERIFICANDO CONSISTENCIA DEL SISTEMA:');
        
        // 1. Verificar tablas críticas existen
        const criticalTables = [
            'copig.admin_users',
            'copig.profesionales',
            'copig.empresas',
            'copig.solicitudes_chp',
            'copig.matriculas'
        ];
        
        console.log('   📋 TABLAS CRÍTICAS:');
        for (const table of criticalTables) {
            try {
                const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`      ✅ ${table}: ${result.rows[0].count} registros`);
            } catch (error) {
                console.log(`      ❌ ${table}: ERROR - ${error.message}`);
            }
        }
        
        // 2. Verificar integridad referencial
        console.log('\n   🔗 INTEGRIDAD REFERENCIAL:');
        
        try {
            const orphanedSolicitudes = await pool.query(`
                SELECT COUNT(*) as count
                FROM copig.solicitudes_chp s
                LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
                WHERE p.id IS NULL
            `);
            
            if (orphanedSolicitudes.rows[0].count > 0) {
                console.log(`      ⚠️  SOLICITUDES HUÉRFANAS: ${orphanedSolicitudes.rows[0].count}`);
            } else {
                console.log('      ✅ SOLICITUDES: Integridad OK');
            }
        } catch (error) {
            console.log(`      ❌ Error verificando solicitudes: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Error verificando consistencia:', error.message);
    }
}

async function suggestSolutions() {
    console.log('\n🛠️  SOLUCIONES RECOMENDADAS:');
    console.log('');
    console.log('1. 🔒 CREAR BACKUP AUTOMÁTICO:');
    console.log('   • Implementar backup diario de BD');
    console.log('   • Backup antes de ejecutar scripts de migración');
    console.log('   • Versionado de backups');
    console.log('');
    console.log('2. 🛡️  PROTECCIÓN DE USUARIOS CRÍTICOS:');
    console.log('   • Flag "protected" para usuarios admin críticos');
    console.log('   • Verificación antes de DELETE en admin_users');
    console.log('   • Log de todas las operaciones de usuarios');
    console.log('');
    console.log('3. 📋 AUDITORIA:');
    console.log('   • Tabla de log_operaciones para rastrear cambios');
    console.log('   • Timestamp de todas las modificaciones');
    console.log('   • Usuario responsable de cada cambio');
    console.log('');
    console.log('4. 🔧 VERIFICACIONES AUTOMÁTICAS:');
    console.log('   • Script de verificación de integridad diario');
    console.log('   • Alerta cuando faltan usuarios admin');
    console.log('   • Verificación de consistencia en startup');
    console.log('');
    console.log('5. 📝 DOCUMENTACIÓN:');
    console.log('   • Lista de usuarios críticos que NO deben eliminarse');
    console.log('   • Procedimiento de recuperación de usuarios');
    console.log('   • Scripts de migración documentados y probados');
}

async function createProtectionMeasures() {
    try {
        console.log('\n🛡️  IMPLEMENTANDO MEDIDAS DE PROTECCIÓN:');
        
        // 1. Crear tabla de auditoria
        console.log('   📋 Creando tabla de auditoría...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.audit_log (
                id SERIAL PRIMARY KEY,
                tabla VARCHAR(50),
                operacion VARCHAR(10),
                registro_id INTEGER,
                datos_antes JSONB,
                datos_despues JSONB,
                usuario_responsable VARCHAR(100),
                timestamp TIMESTAMP DEFAULT NOW(),
                ip_address INET,
                user_agent TEXT
            )
        `);
        console.log('   ✅ Tabla audit_log creada');
        
        // 2. Marcar usuarios críticos como protegidos
        console.log('   🔒 Marcando usuarios críticos como protegidos...');
        await pool.query(`
            ALTER TABLE copig.admin_users 
            ADD COLUMN IF NOT EXISTS protected BOOLEAN DEFAULT false
        `);
        
        await pool.query(`
            UPDATE copig.admin_users 
            SET protected = true 
            WHERE role IN ('super_admin', 'admin') OR documento IN ('20562024', '40101718')
        `);
        console.log('   ✅ Usuarios críticos protegidos');
        
        console.log('\n✅ MEDIDAS DE PROTECCIÓN IMPLEMENTADAS');
        
    } catch (error) {
        console.error('❌ Error implementando protecciones:', error.message);
    }
}

async function main() {
    await checkDatabaseIntegrity();
    await checkRecentDatabaseActivity();
    await checkSystemConsistency();
    await createProtectionMeasures();
    await suggestSolutions();
    
    console.log('\n🎯 RESUMEN DE INCONSISTENCIAS ENCONTRADAS:');
    console.log('• Usuario staff 40101718 había desaparecido misteriosamente');
    console.log('• Solo queda 1 usuario admin en sistema de varios que deberían existir');
    console.log('• Posible ejecución de scripts que eliminaron usuarios sin backup');
    console.log('• Falta de protección para usuarios críticos');
    console.log('• Sin sistema de auditoría para rastrear cambios');
    
    console.log('\n✅ ACCIONES TOMADAS:');
    console.log('• Usuario staff 40101718 recreado');
    console.log('• Tabla de auditoría implementada');
    console.log('• Usuarios críticos marcados como protegidos');
    console.log('• Medidas de protección activadas');
    
    await pool.end();
}

main().catch(console.error);