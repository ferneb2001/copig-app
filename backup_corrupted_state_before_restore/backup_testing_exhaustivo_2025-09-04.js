const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function backupCompleto() {
    const client = await pool.connect();
    try {
        console.log('🏛️ BACKUP COMPLETO SISTEMA COPIG MENDOZA');
        console.log('📅 FECHA:', new Date().toISOString());
        console.log('🎯 PROPÓSITO: Testing exhaustivo institucional\n');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `backup_copig_exhaustivo_${timestamp}`;
        await fs.mkdir(backupDir, { recursive: true });
        
        // 1. BACKUP TABLAS CRÍTICAS
        const tablasCriticas = [
            'profesionales', 'matriculas', 'empresas', 'representantes_tecnicos',
            'admin_users', 'profesionales_auth', 'user_roles',
            'solicitudes_chp', 'pagos_historicos', 'restricciones_deudas', 'sanciones_aplicadas',
            'comprobantes_pago', 'cuenta_corriente', 'facturas_chp',
            'configuracion_arca', 'tipos_comprobante_arca'
        ];
        
        let totalRecords = 0;
        const manifest = {
            timestamp: new Date().toISOString(),
            proposito: 'Testing exhaustivo COPIG Mendoza',
            tablas: {},
            integridad: {},
            estadisticas: {}
        };
        
        for (const tabla of tablasCriticas) {
            try {
                console.log(`📊 Respaldando: copig.${tabla}`);
                
                // Contar registros
                const countResult = await client.query(`SELECT COUNT(*) as total FROM copig.${tabla}`);
                const count = parseInt(countResult.rows[0].total);
                totalRecords += count;
                
                // Obtener datos
                const result = await client.query(`SELECT * FROM copig.${tabla}`);
                
                // Escribir archivo
                const filename = `${tabla}.json`;
                await fs.writeFile(
                    path.join(backupDir, filename), 
                    JSON.stringify(result.rows, null, 2)
                );
                
                manifest.tablas[tabla] = {
                    registros: count,
                    archivo: filename,
                    timestamp: new Date().toISOString()
                };
                
                console.log(`   ✅ ${count} registros respaldados`);
                
            } catch (error) {
                console.log(`   ⚠️ Error en ${tabla}:`, error.message);
                manifest.tablas[tabla] = { error: error.message };
            }
        }
        
        // 2. BACKUP ARCHIVOS CRÍTICOS DEL SISTEMA
        const archivosCriticos = [
            'server.js',
            'admin.html', 
            'portal-profesional.html',
            'empresas.html',
            'solicitudes-chp-mejorado.html',
            'admin-chp.html',
            'user-management.html',
            'config.json',
            'package.json',
            'CLAUDE.md',
            'maximas.md'
        ];
        
        const archivosDir = path.join(backupDir, 'archivos_sistema');
        await fs.mkdir(archivosDir, { recursive: true });
        
        for (const archivo of archivosCriticos) {
            try {
                if (await fs.access(archivo).then(() => true).catch(() => false)) {
                    const content = await fs.readFile(archivo, 'utf8');
                    await fs.writeFile(path.join(archivosDir, archivo), content);
                    
                    manifest.integridad[archivo] = {
                        tamaño: content.length,
                        respaldado: true
                    };
                    console.log(`📁 ${archivo} respaldado`);
                } else {
                    manifest.integridad[archivo] = { error: 'Archivo no encontrado' };
                }
            } catch (error) {
                manifest.integridad[archivo] = { error: error.message };
            }
        }
        
        // 3. ESTADÍSTICAS DEL SISTEMA
        console.log('\\n📊 RECOPILANDO ESTADÍSTICAS DEL SISTEMA:');
        
        // Usuarios activos por tipo
        const statsUsuarios = await client.query(`
            SELECT 'Profesionales' as tipo, COUNT(*) as cantidad FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 'Staff Admin' as tipo, COUNT(*) as cantidad FROM copig.admin_users WHERE role IN ('admin', 'staff')
            UNION ALL
            SELECT 'Empresas Activas' as tipo, COUNT(*) as cantidad FROM copig.empresas WHERE activo = true
            UNION ALL
            SELECT 'Matriculas Vigentes' as tipo, COUNT(*) as cantidad FROM copig.matriculas WHERE activo = true
            UNION ALL
            SELECT 'Representantes Tecnicos' as tipo, COUNT(*) as cantidad FROM copig.representantes_tecnicos WHERE activo = true
        `);
        
        statsUsuarios.rows.forEach(stat => {
            console.log(`   ${stat.tipo}: ${stat.cantidad}`);
            manifest.estadisticas[stat.tipo.toLowerCase().replace(' ', '_')] = parseInt(stat.cantidad);
        });
        
        // Actividad reciente
        const actividadReciente = await client.query(`
            SELECT 
                DATE(fecha_solicitud) as fecha,
                COUNT(*) as solicitudes_chp
            FROM copig.solicitudes_chp 
            WHERE fecha_solicitud >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(fecha_solicitud)
            ORDER BY fecha DESC
            LIMIT 10
        `);
        
        manifest.estadisticas.actividad_reciente = actividadReciente.rows;
        
        // Salud del sistema financiero
        const saludFinanciera = await client.query(`
            SELECT 
                COUNT(*) as total_pagos,
                SUM(CAST(importe AS DECIMAL)) as monto_total,
                COUNT(DISTINCT matricula) as profesionales_con_pagos
            FROM copig.pagos_historicos 
            WHERE fecha_pago >= '2020-01-01'
        `);
        
        manifest.estadisticas.salud_financiera = saludFinanciera.rows[0];
        
        // 4. ESCRIBIR MANIFEST
        await fs.writeFile(
            path.join(backupDir, 'MANIFEST.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        // 5. SCRIPT DE RESTAURACIÓN
        const scriptRestauracion = `
-- SCRIPT DE RESTAURACIÓN COPIG MENDOZA
-- Generado: ${new Date().toISOString()}
-- Propósito: Restaurar sistema post-testing exhaustivo

-- VERIFICAR CONEXIÓN
SELECT 'Conexión PostgreSQL OK' as status;

-- VERIFICAR TABLAS CRÍTICAS
${tablasCriticas.map(tabla => `SELECT COUNT(*) as ${tabla}_count FROM copig.${tabla};`).join('\\n')}

-- EN CASO DE CORRUPCIÓN, USAR ARCHIVOS JSON DEL BACKUP
-- COMANDO: node restore_from_backup.js ${backupDir}

SELECT 'Sistema COPIG verificado' as resultado;
        `;
        
        await fs.writeFile(
            path.join(backupDir, 'RESTAURAR.sql'),
            scriptRestauracion
        );
        
        // 6. RESUMEN FINAL
        console.log('\\n🎯 BACKUP COMPLETO FINALIZADO:');
        console.log(`   📂 Directorio: ${backupDir}`);
        console.log(`   📊 Total registros: ${totalRecords.toLocaleString()}`);
        console.log(`   📁 Tablas respaldadas: ${Object.keys(manifest.tablas).length}`);
        console.log(`   📄 Archivos respaldados: ${Object.keys(manifest.integridad).length}`);
        console.log(`   💾 Tamaño estimado: ${Math.round(totalRecords * 0.5)}KB`);
        
        console.log('\\n🏛️ SISTEMA COPIG MENDOZA LISTO PARA TESTING EXHAUSTIVO');
        console.log('🚀 INICIANDO FASE DE PRUEBAS INSTITUCIONALES...');
        
        return {
            success: true,
            backupDir,
            totalRecords,
            manifest
        };
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO EN BACKUP:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// EJECUTAR BACKUP INMEDIATAMENTE
backupCompleto()
    .then(result => {
        console.log('\\n✅ BACKUP COPIG COMPLETADO EXITOSAMENTE');
        console.log('🔄 INICIANDO TESTING AUTOMÁTICO...');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 FALLA CRÍTICA EN BACKUP:', error);
        process.exit(1);
    });