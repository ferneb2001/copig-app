
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
        
        const result = await client.query(`
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
        `);
        
        console.log('📊 RESULTADOS DE PRUEBA:');
        console.log('='.repeat(50));
        
        result.rows.forEach(row => {
            console.log(`🆔 ID: ${row.id} - ${row.numero_solicitud}`);
            console.log(`👤 Profesional: ${row.profesional_nombre} (Mat: ${row.numero_matricula})`);
            console.log(`🏢 Cliente: ${row.cliente}`);
            console.log(`📋 Proyecto: ${row.proyecto}`);
            console.log(`💰 Honorarios: $${row.monto_honorarios || 'NO DECLARADO'}`);
            console.log(`📊 Porcentaje: ${row.porcentaje_chp || 'NO DEFINIDO'}%`);
            console.log(`💵 Costo CHP: $${row.costo || 'NO CALCULADO'}`);
            console.log(`📋 Estado: ${row.estado}`);
            console.log(`📎 Documentos: ${Array.isArray(row.documentos) ? row.documentos.length : 0} archivo(s)`);
            if (Array.isArray(row.documentos) && row.documentos.length > 0) {
                row.documentos.forEach(doc => {
                    console.log(`  - ${doc.tipo_documento}: ${doc.nombre_archivo}`);
                });
            }
            console.log('---');
        });
        
        console.log('\n✅ CONSULTA FUNCIONANDO CORRECTAMENTE');
        console.log('🎯 El panel admin ahora debería mostrar importes y documentos');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    } finally {
        await client.end();
    }
}

probarAdminCHP();
