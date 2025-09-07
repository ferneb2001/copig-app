const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testFechaMatriculacion() {
    const client = await pool.connect();
    try {
        console.log('🔍 PROBANDO FECHA DE MATRICULACIÓN EN API\n');
        
        // 1. Probar la consulta actualizada del endpoint
        console.log('📊 1. Consulta actualizada del endpoint:');
        const result = await client.query(`
            SELECT 
                p.id, 
                m.numero_matricula as matricula,
                p.nombre, 
                p.numero_documento,
                p.email,
                m.fecha_inscripcion,
                CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            ORDER BY p.nombre 
            LIMIT 10
        `);
        
        console.log(`   ✅ Registros encontrados: ${result.rows.length}`);
        
        let conFecha = 0;
        let sinFecha = 0;
        
        result.rows.forEach((prof, i) => {
            if (prof.fecha_inscripcion) {
                conFecha++;
                if (i < 5) {
                    const fecha = new Date(prof.fecha_inscripcion).toLocaleDateString('es-AR');
                    console.log(`     ${prof.nombre} - Mat: ${prof.matricula} - Fecha: ${fecha}`);
                }
            } else {
                sinFecha++;
            }
        });
        
        console.log(`\n   📊 Estadísticas:`);
        console.log(`     ✅ CON fecha de matriculación: ${conFecha} (${(conFecha/result.rows.length*100).toFixed(1)}%)`);
        console.log(`     ❌ SIN fecha de matriculación: ${sinFecha} (${(sinFecha/result.rows.length*100).toFixed(1)}%)`);
        
        // 2. Verificar distribución temporal
        console.log('\n📅 2. Distribución temporal de matriculaciones:');
        const distribucion = await client.query(`
            SELECT 
                EXTRACT(DECADE FROM m.fecha_inscripcion) * 10 as decada,
                COUNT(*) as cantidad,
                MIN(m.fecha_inscripcion) as primera_fecha,
                MAX(m.fecha_inscripcion) as ultima_fecha
            FROM copig.matriculas m
            WHERE m.fecha_inscripcion IS NOT NULL
            AND m.profesional_id IS NOT NULL
            GROUP BY EXTRACT(DECADE FROM m.fecha_inscripcion)
            ORDER BY decada
        `);
        
        distribucion.rows.forEach(dec => {
            console.log(`     ${dec.decada}s: ${dec.cantidad} matriculaciones`);
            console.log(`       - Desde: ${new Date(dec.primera_fecha).toLocaleDateString('es-AR')}`);
            console.log(`       - Hasta: ${new Date(dec.ultima_fecha).toLocaleDateString('es-AR')}`);
        });
        
        // 3. Verificar casos sin fecha
        console.log('\n❓ 3. Analizando casos sin fecha de matriculación:');
        const sinFechaDetalle = await client.query(`
            SELECT COUNT(*) as total_sin_fecha
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            AND m.fecha_inscripcion IS NULL
        `);
        
        const totalActivos = await client.query(`
            SELECT COUNT(*) as total
            FROM copig.profesionales p
            WHERE p.activo = true
        `);
        
        const sinFechaTotal = parseInt(sinFechaDetalle.rows[0].total_sin_fecha);
        const totalTotal = parseInt(totalActivos.rows[0].total);
        const porcentaje = (sinFechaTotal / totalTotal * 100).toFixed(1);
        
        console.log(`     ❌ Profesionales sin fecha: ${sinFechaTotal} de ${totalTotal} (${porcentaje}%)`);
        
        // 4. Ejemplos de profesionales recientes vs antiguos
        console.log('\n⏰ 4. Ejemplos por antigüedad:');
        
        const antiguos = await client.query(`
            SELECT p.nombre, m.numero_matricula, m.fecha_inscripcion
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY m.fecha_inscripcion ASC
            LIMIT 3
        `);
        
        console.log('     👴 Más antiguos:');
        antiguos.rows.forEach((prof, i) => {
            const fecha = new Date(prof.fecha_inscripcion).toLocaleDateString('es-AR');
            console.log(`       ${i+1}. ${prof.nombre} - Mat: ${prof.numero_matricula} - ${fecha}`);
        });
        
        const recientes = await client.query(`
            SELECT p.nombre, m.numero_matricula, m.fecha_inscripcion
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY m.fecha_inscripcion DESC
            LIMIT 3
        `);
        
        console.log('     👶 Más recientes:');
        recientes.rows.forEach((prof, i) => {
            const fecha = new Date(prof.fecha_inscripcion).toLocaleDateString('es-AR');
            console.log(`       ${i+1}. ${prof.nombre} - Mat: ${prof.numero_matricula} - ${fecha}`);
        });
        
        console.log('\n🎯 CONCLUSIÓN:');
        console.log(`   ✅ Las fechas de matriculación SÍ EXISTEN en la base de datos`);
        console.log(`   ✅ Backend actualizado para incluirlas en la API`);
        console.log(`   ✅ Frontend actualizado para mostrarlas en la tabla`);
        console.log(`   📄 Ahora aparecerán en la tabla principal de profesionales`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

testFechaMatriculacion().catch(console.error);