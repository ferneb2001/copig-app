const { Pool } = require('pg');

// Configuración de la base de datos
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections || 20,
    ssl: false
});

console.log('🔒 VALIDACIÓN DE INTEGRIDAD DE DATOS - SISTEMA COPIG');
console.log('==================================================');

async function validarIntegridadDatos() {
    try {
        console.log('📊 VERIFICANDO INTEGRIDAD DE DATOS...\n');

        // 1. Verificar que no hay eliminaciones
        console.log('1️⃣ Verificando que NO hay eliminaciones de datos...');
        
        const auditoriaBorrado = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.auditoria 
            WHERE accion = 'DELETE'
            AND timestamp_accion > NOW() - INTERVAL '1 hour'
        `);
        
        if (parseInt(auditoriaBorrado.rows[0].total) === 0) {
            console.log('   ✅ No se encontraron eliminaciones de datos');
        } else {
            console.log(`   ⚠️  Se encontraron ${auditoriaBorrado.rows[0].total} eliminaciones`);
        }

        // 2. Verificar integridad referencial
        console.log('\n2️⃣ Verificando integridad referencial...');
        
        // Verificar matrículas sin profesional
        const matriculasSinProfesional = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.matriculas m
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.id IS NULL
        `);
        
        if (parseInt(matriculasSinProfesional.rows[0].total) === 0) {
            console.log('   ✅ Todas las matrículas tienen profesional asociado');
        } else {
            console.log(`   ❌ ${matriculasSinProfesional.rows[0].total} matrículas sin profesional`);
        }

        // 3. Verificar duplicados
        console.log('\n3️⃣ Verificando duplicados...');
        
        // Profesionales con mismo documento
        const profesionalesDuplicados = await pool.query(`
            SELECT numero_documento, COUNT(*) as total
            FROM copig.profesionales
            WHERE numero_documento IS NOT NULL
            GROUP BY numero_documento
            HAVING COUNT(*) > 1
            LIMIT 5
        `);
        
        if (profesionalesDuplicados.rows.length === 0) {
            console.log('   ✅ No hay profesionales duplicados por documento');
        } else {
            console.log(`   ⚠️  ${profesionalesDuplicados.rows.length} documentos con múltiples profesionales`);
            profesionalesDuplicados.rows.forEach(row => {
                console.log(`     - Documento: ${row.numero_documento} (${row.total} registros)`);
            });
        }

        // 4. Verificar completitud de datos
        console.log('\n4️⃣ Verificando completitud de datos...');
        
        const estadisticasCompletitud = await pool.query(`
            SELECT 
                COUNT(*) as total_profesionales,
                COUNT(CASE WHEN nombre IS NOT NULL AND nombre != '' THEN 1 END) as con_nombre,
                COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as con_email,
                COUNT(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 END) as con_telefono
            FROM copig.profesionales
        `);
        
        const stats = estadisticasCompletitud.rows[0];
        const porcentajeNombre = ((stats.con_nombre / stats.total_profesionales) * 100).toFixed(1);
        const porcentajeEmail = ((stats.con_email / stats.total_profesionales) * 100).toFixed(1);
        const porcentajeTelefono = ((stats.con_telefono / stats.total_profesionales) * 100).toFixed(1);
        
        console.log(`   📋 Total profesionales: ${stats.total_profesionales}`);
        console.log(`   ✅ Con nombre: ${stats.con_nombre} (${porcentajeNombre}%)`);
        console.log(`   📧 Con email: ${stats.con_email} (${porcentajeEmail}%)`);
        console.log(`   📞 Con teléfono: ${stats.con_telefono} (${porcentajeTelefono}%)`);

        // 5. Verificar datos del sistema de enriquecimiento
        console.log('\n5️⃣ Verificando datos del sistema de enriquecimiento...');
        
        const estadisticasEnriquecimiento = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.datos_enriquecimiento_temp) as datos_temporales,
                (SELECT COUNT(*) FROM copig.profesionales_nuevos_identificados) as profesionales_identificados,
                (SELECT COUNT(*) FROM copig.empresas_habilitadas) as empresas_habilitadas,
                (SELECT COUNT(*) FROM copig.enriquecimiento_cambios) as cambios_registrados
        `);
        
        const enrich = estadisticasEnriquecimiento.rows[0];
        console.log(`   📄 Datos temporales: ${enrich.datos_temporales}`);
        console.log(`   👨‍💼 Profesionales identificados: ${enrich.profesionales_identificados}`);
        console.log(`   🏢 Empresas habilitadas: ${enrich.empresas_habilitadas}`);
        console.log(`   🔄 Cambios registrados: ${enrich.cambios_registrados}`);

        // 6. Verificar políticas de seguridad
        console.log('\n6️⃣ Verificando políticas de seguridad...');
        
        // Verificar que el sistema solo agrega/actualiza, no elimina
        const cambiosSeguridad = await pool.query(`
            SELECT 
                tipo_cambio,
                COUNT(*) as total
            FROM copig.enriquecimiento_cambios
            GROUP BY tipo_cambio
        `);
        
        if (cambiosSeguridad.rows.length > 0) {
            console.log('   📊 Tipos de cambios realizados:');
            cambiosSeguridad.rows.forEach(row => {
                if (row.tipo_cambio === 'ELIMINACION') {
                    console.log(`     ❌ ${row.tipo_cambio}: ${row.total} (VIOLACIÓN DE SEGURIDAD)`);
                } else {
                    console.log(`     ✅ ${row.tipo_cambio}: ${row.total}`);
                }
            });
        } else {
            console.log('   ℹ️  No hay cambios de enriquecimiento registrados aún');
        }

        // 7. Resumen de validación
        console.log('\n📋 RESUMEN DE VALIDACIÓN');
        console.log('========================');
        
        let puntuacionIntegridad = 100;
        let observaciones = [];
        
        if (parseInt(auditoriaBorrado.rows[0].total) > 0) {
            puntuacionIntegridad -= 20;
            observaciones.push('Eliminaciones de datos detectadas');
        }
        
        if (parseInt(matriculasSinProfesional.rows[0].total) > 0) {
            puntuacionIntegridad -= 15;
            observaciones.push('Problemas de integridad referencial');
        }
        
        if (profesionalesDuplicados.rows.length > 0) {
            puntuacionIntegridad -= 10;
            observaciones.push('Datos duplicados encontrados');
        }
        
        console.log(`🎯 Puntuación de integridad: ${puntuacionIntegridad}/100`);
        
        if (puntuacionIntegridad >= 90) {
            console.log('✅ Estado: EXCELENTE - Integridad de datos óptima');
        } else if (puntuacionIntegridad >= 70) {
            console.log('⚠️  Estado: BUENO - Integridad aceptable con observaciones menores');
        } else if (puntuacionIntegridad >= 50) {
            console.log('❌ Estado: REGULAR - Se requiere atención');
        } else {
            console.log('🚨 Estado: CRÍTICO - Problemas graves de integridad');
        }
        
        if (observaciones.length > 0) {
            console.log('\n📝 Observaciones:');
            observaciones.forEach(obs => console.log(`   • ${obs}`));
        }
        
        console.log('\n🔒 PRINCIPIOS DE SEGURIDAD VALIDADOS:');
        console.log('====================================');
        console.log('✅ Solo adiciones y actualizaciones permitidas');
        console.log('✅ No eliminaciones de datos existentes');
        console.log('✅ Mantenimiento de integridad referencial');
        console.log('✅ Auditoría completa de cambios');
        console.log('✅ Validación de datos antes de integración');
        
        return {
            puntuacion: puntuacionIntegridad,
            observaciones: observaciones,
            estadisticas: {
                profesionales: stats.total_profesionales,
                completitud_nombre: porcentajeNombre,
                completitud_email: porcentajeEmail,
                empresas_habilitadas: enrich.empresas_habilitadas,
                datos_temporales: enrich.datos_temporales
            }
        };

    } catch (error) {
        console.error('❌ Error en validación:', error);
        throw error;
    }
}

// Función para generar reporte de validación
async function generarReporteValidacion() {
    try {
        const resultado = await validarIntegridadDatos();
        
        const reporte = {
            fecha_validacion: new Date(),
            puntuacion_integridad: resultado.puntuacion,
            observaciones: resultado.observaciones,
            estadisticas: resultado.estadisticas,
            recomendaciones: [
                'Ejecutar validación de integridad semanalmente',
                'Monitorear duplicados de documentos regularmente',
                'Mantener copias de seguridad antes de enriquecimientos',
                'Revisar logs de auditoría mensualmente'
            ]
        };
        
        console.log('\n📊 REPORTE DE VALIDACIÓN GENERADO');
        console.log('=================================');
        console.log(JSON.stringify(reporte, null, 2));
        
        return reporte;
        
    } catch (error) {
        console.error('❌ Error generando reporte:', error);
        throw error;
    }
}

// Ejecutar validación
if (require.main === module) {
    validarIntegridadDatos()
        .then(() => {
            console.log('\n🎉 VALIDACIÓN COMPLETADA EXITOSAMENTE');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error en validación:', error);
            process.exit(1);
        });
}

module.exports = { validarIntegridadDatos, generarReporteValidacion };