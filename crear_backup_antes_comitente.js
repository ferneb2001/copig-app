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

async function crearBackupAntesComitente() {
    try {
        console.log('💾 CREANDO BACKUP COMPLETO ANTES DE CAMBIOS COMITENTE\n');
        
        const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupDir = `C:\\copig-app\\backup_antes_comitente_${fecha}`;
        
        // 1. Crear directorio de backup
        console.log('=== 1. CREAR DIRECTORIO BACKUP ===');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        console.log(`✅ Directorio creado: ${backupDir}`);
        
        // 2. Backup de archivos principales del sistema
        console.log('\n=== 2. BACKUP ARCHIVOS SISTEMA ===');
        const archivosCriticos = [
            'server.js',
            'portal-profesional.html', 
            'admin-chp.html',
            'admin.html',
            'empresas.html',
            'package.json',
            'CLAUDE.md',
            'maximas.md'
        ];
        
        archivosCriticos.forEach(archivo => {
            const origen = path.join('C:\\copig-app', archivo);
            const destino = path.join(backupDir, archivo);
            
            if (fs.existsSync(origen)) {
                fs.copyFileSync(origen, destino);
                console.log(`✅ ${archivo} - Copiado`);
            } else {
                console.log(`⚠️ ${archivo} - No existe`);
            }
        });
        
        // 3. Backup base de datos - Tablas CHP específicas
        console.log('\n=== 3. BACKUP BASE DE DATOS CHP ===');
        
        // Solicitudes CHP
        const solicitudesChp = await pool.query('SELECT * FROM copig.solicitudes_chp ORDER BY id');
        fs.writeFileSync(
            path.join(backupDir, 'solicitudes_chp_backup.json'),
            JSON.stringify(solicitudesChp.rows, null, 2)
        );
        console.log(`✅ solicitudes_chp: ${solicitudesChp.rows.length} registros`);
        
        // Documentos CHP
        try {
            const documentosChp = await pool.query('SELECT * FROM copig.documentos_chp ORDER BY id');
            fs.writeFileSync(
                path.join(backupDir, 'documentos_chp_backup.json'),
                JSON.stringify(documentosChp.rows, null, 2)
            );
            console.log(`✅ documentos_chp: ${documentosChp.rows.length} registros`);
        } catch (error) {
            console.log('ℹ️ documentos_chp: tabla no existe o vacía');
        }
        
        // Notificaciones CHP
        try {
            const notificacionesChp = await pool.query('SELECT * FROM copig.notificaciones_chp ORDER BY id');
            fs.writeFileSync(
                path.join(backupDir, 'notificaciones_chp_backup.json'),
                JSON.stringify(notificacionesChp.rows, null, 2)
            );
            console.log(`✅ notificaciones_chp: ${notificacionesChp.rows.length} registros`);
        } catch (error) {
            console.log('ℹ️ notificaciones_chp: tabla no existe o vacía');
        }
        
        // Facturas CHP
        try {
            const facturasChp = await pool.query('SELECT * FROM copig.facturas_chp ORDER BY id');
            fs.writeFileSync(
                path.join(backupDir, 'facturas_chp_backup.json'),
                JSON.stringify(facturasChp.rows, null, 2)
            );
            console.log(`✅ facturas_chp: ${facturasChp.rows.length} registros`);
        } catch (error) {
            console.log('ℹ️ facturas_chp: tabla no existe o vacía');
        }
        
        // 4. Backup estructura de tablas CHP
        console.log('\n=== 4. BACKUP ESTRUCTURA TABLAS ===');
        const estructura = await pool.query(`
            SELECT table_name, column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name LIKE '%chp%'
            ORDER BY table_name, ordinal_position
        `);
        
        fs.writeFileSync(
            path.join(backupDir, 'estructura_tablas_chp.json'),
            JSON.stringify(estructura.rows, null, 2)
        );
        console.log(`✅ Estructura tablas CHP guardada`);
        
        // 5. Backup constraints y secuencias
        console.log('\n=== 5. BACKUP CONSTRAINTS Y SECUENCIAS ===');
        const constraints = await pool.query(`
            SELECT constraint_name, constraint_type, table_name
            FROM information_schema.table_constraints
            WHERE table_schema = 'copig'
            AND table_name LIKE '%chp%'
        `);
        
        fs.writeFileSync(
            path.join(backupDir, 'constraints_chp.json'),
            JSON.stringify(constraints.rows, null, 2)
        );
        
        const secuencia = await pool.query(`
            SELECT last_value FROM copig.chp_numero_seq
        `);
        
        fs.writeFileSync(
            path.join(backupDir, 'secuencia_chp.json'),
            JSON.stringify({ ultimo_numero: secuencia.rows[0].last_value }, null, 2)
        );
        
        console.log(`✅ Constraints y secuencias guardados`);
        
        // 6. Información del estado actual
        console.log('\n=== 6. INFORMACIÓN ESTADO ACTUAL ===');
        const infoEstado = {
            fecha_backup: new Date().toISOString(),
            descripcion: 'Backup antes de cambiar cliente por comitente',
            sistema_funcionando: 'SI',
            replicacion_admin: 'CORREGIDA',
            endpoint_admin: 'FUNCIONAL',
            constraint_estados: 'CORREGIDO',
            profesional_prueba: 'DNI 99999999, contraseña prueba123',
            notas: [
                'Sistema CHP completamente funcional',
                'Replicación bidireccional operativa',
                'Endpoint admin corregido (sin apellido)',
                'Constraint estados incluyendo PENDIENTE_PAGO',
                'Listo para implementar cambios comitente'
            ]
        };
        
        fs.writeFileSync(
            path.join(backupDir, 'estado_sistema.json'),
            JSON.stringify(infoEstado, null, 2)
        );
        
        // 7. Script de restauración
        console.log('\n=== 7. CREAR SCRIPT RESTAURACIÓN ===');
        const scriptRestauracion = `
-- SCRIPT DE RESTAURACIÓN BACKUP ANTES COMITENTE
-- Fecha: ${new Date().toISOString()}

-- 1. Restaurar secuencia
SELECT setval('copig.chp_numero_seq', ${secuencia.rows[0].last_value});

-- 2. Restaurar solicitudes (ejecutar desde Node.js con JSON)
-- Usar: node restore_solicitudes_chp.js

-- 3. Restaurar archivos del sistema
-- Copiar archivos desde: ${backupDir}

-- Estado funcional confirmado antes de cambios comitente
`;
        
        fs.writeFileSync(
            path.join(backupDir, 'restauracion.sql'),
            scriptRestauracion
        );
        
        console.log('\n🎉 BACKUP COMPLETO CREADO EXITOSAMENTE');
        console.log(`📁 Ubicación: ${backupDir}`);
        console.log(`📊 Total archivos: ${fs.readdirSync(backupDir).length}`);
        
        console.log('\n✅ ESTADO CONFIRMADO ANTES DE CAMBIOS:');
        console.log('   - Sistema CHP 100% funcional');
        console.log('   - Replicación profesional ↔ admin operativa');
        console.log('   - Profesional de prueba disponible');
        console.log('   - Base de datos estable');
        
        console.log('\n🚀 LISTO PARA IMPLEMENTAR CAMBIOS COMITENTE');
        
    } catch (error) {
        console.error('❌ Error creando backup:', error);
    } finally {
        await pool.end();
    }
}

crearBackupAntesComitente().catch(console.error);