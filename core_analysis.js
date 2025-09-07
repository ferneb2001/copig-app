const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function coreAnalysis() {
    console.log('🎯 ANÁLISIS CORE - INCONSISTENCIAS PRINCIPALES\n');
    
    try {
        // 1. RESUMEN GEOGRÁFICO YA CONFIRMADO
        console.log('📍 RESUMEN CONFIRMADO:');
        console.log('   • COPIG Mendoza: 4,947 profesionales (85.83%)');
        console.log('   • EXTERNOS (otras provincias): 409 profesionales (14.17%)');
        console.log('   • ❌ PROBLEMA: Profesionales externos mezclados con COPIG');

        // 2. ANÁLISIS ESPECÍFICO AGÜERO y SIMILARES
        console.log('\n🔍 ANÁLISIS CASOS COMO AGÜERO (Buenos Aires con matrículas COPIG):');
        console.log('-'.repeat(70));
        
        const casosExternos = await pool.query(`
            SELECT 
                p.nombre,
                p.provincia,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                MAX(ph.fecha_pago) as ultimo_pago,
                COUNT(ph.id) as total_pagos
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.provincia != 'Mendoza' AND p.activo = true
            GROUP BY p.id, p.nombre, p.provincia, m.numero_matricula
            ORDER BY m.numero_matricula DESC
            LIMIT 10
        `);
        
        casosExternos.rows.forEach(row => {
            console.log(`   🔍 ${row.nombre} (${row.numero_matricula})`);
            console.log(`      Provincia: ${row.provincia} | Estado: ${row.estado}`);
            console.log(`      Pagos: ${row.total_pagos} | Último: ${row.ultimo_pago?.getFullYear() || 'NUNCA'}`);
            console.log('');
        });

        // 3. RANGOS DE MATRÍCULAS POR PROVINCIA
        console.log('🔢 RANGOS DE MATRÍCULAS POR PROVINCIA:');
        console.log('-'.repeat(40));
        
        const rangosPorProvincia = await pool.query(`
            SELECT 
                p.provincia,
                MIN(m.numero_matricula) as minima,
                MAX(m.numero_matricula) as maxima,
                COUNT(*) as cantidad,
                AVG(m.numero_matricula) as promedio
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.numero_matricula IS NOT NULL
            GROUP BY p.provincia
            ORDER BY COUNT(*) DESC
            LIMIT 8
        `);
        
        rangosPorProvincia.rows.forEach(row => {
            console.log(`   ${row.provincia}:`);
            console.log(`     Rango: ${row.minima} - ${row.maxima} (Promedio: ${Math.round(row.promedio)})`);
            console.log(`     Cantidad: ${row.cantidad}`);
            console.log('');
        });

        // 4. ANÁLISIS TEMPORAL - ¿CUÁNDO SE INSCRIBIERON LOS EXTERNOS?
        console.log('📅 ANÁLISIS TEMPORAL - INSCRIPCIONES POR AÑO:');
        console.log('-'.repeat(45));
        
        const inscripcionesPorAno = await pool.query(`
            SELECT 
                EXTRACT(YEAR FROM m.fecha_inscripcion) as año,
                COUNT(CASE WHEN p.provincia = 'Mendoza' THEN 1 END) as mendoza,
                COUNT(CASE WHEN p.provincia != 'Mendoza' THEN 1 END) as externos,
                COUNT(*) as total
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true 
            AND m.fecha_inscripcion IS NOT NULL
            AND EXTRACT(YEAR FROM m.fecha_inscripcion) BETWEEN 2000 AND 2025
            GROUP BY EXTRACT(YEAR FROM m.fecha_inscripcion)
            ORDER BY año DESC
            LIMIT 10
        `);
        
        inscripcionesPorAno.rows.forEach(row => {
            const porcentajeExternos = ((row.externos / row.total) * 100).toFixed(1);
            console.log(`   ${row.año}: Mendoza=${row.mendoza}, Externos=${row.externos} (${porcentajeExternos}%)`);
        });

        // 5. ESTADOS FINANCIEROS COMPARADOS
        console.log('\n💰 COMPARACIÓN ESTADOS FINANCIEROS:');
        console.log('-'.repeat(40));
        
        const estadosComparados = await pool.query(`
            SELECT 
                CASE WHEN p.provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END as tipo,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                COUNT(*) as cantidad
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            GROUP BY 
                CASE WHEN p.provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END,
                calcular_estado_profesional(m.numero_matricula::TEXT)
            ORDER BY tipo, estado
        `);
        
        console.log('COPIG MENDOZA:');
        estadosComparados.rows
            .filter(row => row.tipo === 'COPIG_MENDOZA')
            .forEach(row => {
                console.log(`   ${row.estado}: ${row.cantidad}`);
            });
        
        console.log('\nEXTERNOS:');
        estadosComparados.rows
            .filter(row => row.tipo === 'EXTERNOS')
            .forEach(row => {
                console.log(`   ${row.estado}: ${row.cantidad}`);
            });

        // 6. RECOMENDACIONES ESPECÍFICAS
        console.log('\n' + '='.repeat(80));
        console.log('🎯 RECOMENDACIONES ESPECÍFICAS BASADAS EN ANÁLISIS');
        console.log('='.repeat(80));
        
        console.log(`\n1. 🚨 SEPARACIÓN INMEDIATA NECESARIA:`);
        console.log(`   • Crear tabla 'profesionales_externos' para los 409 no-Mendoza`);
        console.log(`   • Mantener solo profesionales COPIG (Mendoza) en tabla principal`);
        console.log(`   • Preservar datos históricos pero separados`);
        
        console.log(`\n2. 🔍 CRITERIOS DE SEPARACIÓN IDENTIFICADOS:`);
        console.log(`   • Provincia != 'Mendoza' = EXTERNO`);
        console.log(`   • Matrículas altas (>10000) sospechosas de ser externas`);
        console.log(`   • Patrones de pago diferentes entre grupos`);
        
        console.log(`\n3. 💾 PROCESO SEGURO PROPUESTO:`);
        console.log(`   • BACKUP completo antes de cualquier cambio`);
        console.log(`   • Migración gradual con verificaciones`);
        console.log(`   • Testing exhaustivo de funcionalidad COPIG`);
        console.log(`   • Rollback automático si hay errores`);

        console.log(`\n4. 🎯 BENEFICIOS ESPERADOS:`);
        console.log(`   • Eliminación de inconsistencias geográficas`);
        console.log(`   • Estados financieros más precisos`);
        console.log(`   • Sistema más limpio y mantenible`);
        console.log(`   • Mejor rendimiento (menos datos por consulta)`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

coreAnalysis();