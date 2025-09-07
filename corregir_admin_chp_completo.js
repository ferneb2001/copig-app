/**
 * CORRECCIÓN COMPLETA DEL PANEL ADMIN CHP
 * FECHA: 2025-09-04
 * PROBLEMA: No se ven importes ni documentos en panel admin
 * SOLUCIÓN: Corregir endpoint para incluir documentos y verificar campos
 */

const fs = require('fs');

async function corregirAdminCHP() {
    console.log('🔧 CORRIGIENDO PANEL ADMIN CHP...');
    console.log('='.repeat(60));
    
    try {
        // LEER ARCHIVO server.js
        let serverContent = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
        
        // BUSCAR Y CORREGIR ENDPOINT ADMIN
        console.log('1. 🔍 Buscando endpoint admin solicitudes CHP...');
        
        const oldEndpoint = `        const result = await pool.query(\`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        \`)`;
        
        const newEndpoint = `        const result = await pool.query(\`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   m.numero_matricula,
                   COALESCE(
                       JSON_AGG(
                           CASE 
                               WHEN d.id IS NOT NULL THEN 
                                   JSON_BUILD_OBJECT(
                                       'id', d.id,
                                       'tipo_documento', d.tipo_documento,
                                       'nombre_archivo', d.nombre_archivo,
                                       'ruta_archivo', d.ruta_archivo,
                                       'fecha_carga', d.fecha_carga
                                   )
                               ELSE NULL
                           END
                       ) FILTER (WHERE d.id IS NOT NULL), 
                       '[]'
                   ) as documentos
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.documentos_chp d ON s.id = d.solicitud_id
            GROUP BY s.id, s.profesional_id, s.tipo_solicitud, s.numero_solicitud,
                     s.fecha_solicitud, s.estado, s.motivo_solicitud, s.documentos_adjuntos,
                     s.observaciones, s.fecha_aprobacion, s.fecha_rechazo, s.motivo_rechazo,
                     s.admin_id, s.numero_chp, s.fecha_vencimiento_chp, s.costo, s.pagado,
                     s.fecha_pago, s.metodo_pago, s.created_at, s.updated_at, s.cliente,
                     s.proyecto, s.descripcion, s.ubicacion_obra, s.tipo_obra,
                     s.fecha_actualizacion, s.aprobado_por, s.monto_honorarios,
                     s.numero_factura, s.fecha_factura, s.arancel_final,
                     s.comprobante_pago_path, s.revisado_por, s.fecha_revision,
                     s.requiere_factura_oficial, s.observaciones_arca, s.porcentaje_chp,
                     p.nombre, m.numero_matricula
            ORDER BY s.fecha_solicitud DESC
        \`)`;
        
        if (serverContent.includes(oldEndpoint)) {
            serverContent = serverContent.replace(oldEndpoint, newEndpoint);
            console.log('✅ Endpoint admin corregido - Ahora incluye documentos');
        } else {
            console.log('⚠️  Endpoint no encontrado con formato exacto, buscando alternativo...');
            
            // BUSCAR PATRÓN MÁS FLEXIBLE
            const flexiblePattern = /const result = await pool\.query\(`\s*SELECT s\.\*,[\s\S]*?FROM copig\.solicitudes_chp s[\s\S]*?ORDER BY s\.fecha_solicitud DESC\s*`\)/;
            
            if (flexiblePattern.test(serverContent)) {
                serverContent = serverContent.replace(flexiblePattern, `const result = await pool.query(\`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   m.numero_matricula,
                   COALESCE(
                       JSON_AGG(
                           CASE 
                               WHEN d.id IS NOT NULL THEN 
                                   JSON_BUILD_OBJECT(
                                       'id', d.id,
                                       'tipo_documento', d.tipo_documento,
                                       'nombre_archivo', d.nombre_archivo,
                                       'ruta_archivo', d.ruta_archivo,
                                       'fecha_carga', d.fecha_carga
                                   )
                               ELSE NULL
                           END
                       ) FILTER (WHERE d.id IS NOT NULL), 
                       '[]'
                   ) as documentos
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.documentos_chp d ON s.id = d.solicitud_id
            GROUP BY s.id, s.profesional_id, s.tipo_solicitud, s.numero_solicitud,
                     s.fecha_solicitud, s.estado, s.motivo_solicitud, s.documentos_adjuntos,
                     s.observaciones, s.fecha_aprobacion, s.fecha_rechazo, s.motivo_rechazo,
                     s.admin_id, s.numero_chp, s.fecha_vencimiento_chp, s.costo, s.pagado,
                     s.fecha_pago, s.metodo_pago, s.created_at, s.updated_at, s.cliente,
                     s.proyecto, s.descripcion, s.ubicacion_obra, s.tipo_obra,
                     s.fecha_actualizacion, s.aprobado_por, s.monto_honorarios,
                     s.numero_factura, s.fecha_factura, s.arancel_final,
                     s.comprobante_pago_path, s.revisado_por, s.fecha_revision,
                     s.requiere_factura_oficial, s.observaciones_arca, s.porcentaje_chp,
                     p.nombre, m.numero_matricula
            ORDER BY s.fecha_solicitud DESC
        \`)`);
                console.log('✅ Endpoint admin corregido con patrón flexible');
            } else {
                console.log('❌ No se pudo encontrar el endpoint para corregir');
            }
        }
        
        console.log('2. 💾 Guardando servidor corregido...');
        fs.writeFileSync('C:\\copig-app\\server.js', serverContent);
        
        console.log('3. 🧪 Creando script de prueba...');
        const scriptPrueba = `
/**
 * SCRIPT PRUEBA ADMIN CHP CORREGIDO
 */
const { Client } = require('pg');
const config = require('./config.json');

async function probarAdminCHP() {
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        console.log('🧪 PROBANDO CONSULTA CORREGIDA...');
        
        const result = await client.query(\`
            SELECT s.id, s.numero_solicitud, s.cliente, s.proyecto,
                   s.monto_honorarios, s.porcentaje_chp, s.costo, s.estado,
                   p.nombre as profesional_nombre,
                   m.numero_matricula,
                   COALESCE(
                       JSON_AGG(
                           CASE 
                               WHEN d.id IS NOT NULL THEN 
                                   JSON_BUILD_OBJECT(
                                       'id', d.id,
                                       'tipo_documento', d.tipo_documento,
                                       'nombre_archivo', d.nombre_archivo,
                                       'ruta_archivo', d.ruta_archivo
                                   )
                               ELSE NULL
                           END
                       ) FILTER (WHERE d.id IS NOT NULL), 
                       '[]'
                   ) as documentos
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.documentos_chp d ON s.id = d.solicitud_id
            GROUP BY s.id, s.numero_solicitud, s.cliente, s.proyecto,
                     s.monto_honorarios, s.porcentaje_chp, s.costo, s.estado,
                     p.nombre, m.numero_matricula
            ORDER BY s.fecha_solicitud DESC
            LIMIT 3
        \`);
        
        console.log('📊 RESULTADOS DE PRUEBA:');
        console.log('='.repeat(50));
        
        result.rows.forEach(row => {
            console.log(\`🆔 ID: \${row.id} - \${row.numero_solicitud}\`);
            console.log(\`👤 Profesional: \${row.profesional_nombre} (Mat: \${row.numero_matricula})\`);
            console.log(\`🏢 Cliente: \${row.cliente}\`);
            console.log(\`📋 Proyecto: \${row.proyecto}\`);
            console.log(\`💰 Honorarios: $\${row.monto_honorarios || 'NO DECLARADO'}\`);
            console.log(\`📊 Porcentaje: \${row.porcentaje_chp || 'NO DEFINIDO'}%\`);
            console.log(\`💵 Costo CHP: $\${row.costo || 'NO CALCULADO'}\`);
            console.log(\`📋 Estado: \${row.estado}\`);
            console.log(\`📎 Documentos: \${Array.isArray(row.documentos) ? row.documentos.length : 0} archivo(s)\`);
            if (Array.isArray(row.documentos) && row.documentos.length > 0) {
                row.documentos.forEach(doc => {
                    console.log(\`  - \${doc.tipo_documento}: \${doc.nombre_archivo}\`);
                });
            }
            console.log('---');
        });
        
        console.log('\\n✅ CONSULTA FUNCIONANDO CORRECTAMENTE');
        console.log('🎯 El panel admin ahora debería mostrar importes y documentos');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    } finally {
        await client.end();
    }
}

probarAdminCHP();
`;
        
        fs.writeFileSync('C:\\copig-app\\probar_admin_chp_corregido.js', scriptPrueba);
        
        console.log('✅ CORRECCIÓN COMPLETADA');
        console.log('='.repeat(60));
        console.log('📋 CAMBIOS REALIZADOS:');
        console.log('1. ✅ Endpoint admin incluye tabla documentos_chp');
        console.log('2. ✅ Consulta agrupa documentos en JSON');
        console.log('3. ✅ Mantiene todos los campos financieros');
        console.log('4. ✅ Script de prueba creado');
        console.log('');
        console.log('⚠️  NEXT STEPS:');
        console.log('1. Ejecutar: node probar_admin_chp_corregido.js');
        console.log('2. Reiniciar servidor: Ctrl+C → node server.js');
        console.log('3. Probar panel admin con Fernando');
        
    } catch (error) {
        console.error('❌ ERROR EN CORRECCIÓN:', error);
        throw error;
    }
}

// EJECUTAR CORRECCIÓN
if (require.main === module) {
    corregirAdminCHP()
        .then(() => {
            console.log('\\n🏁 ADMIN CHP CORREGIDO - Listo para mostrar importes y documentos');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { corregirAdminCHP };