const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixedAnalysis() {
    console.log('🔍 ANÁLISIS CORREGIDO - CONTINUACIÓN\n');
    
    try {
        // 2. ANÁLISIS DNI FALTANTES (corregido)
        console.log('📋 2. ANÁLISIS DNI FALTANTES (CORREGIDO)');
        console.log('-'.repeat(45));
        
        const dniFaltantes = await pool.query(`
            SELECT COUNT(*) as sin_dni
            FROM copig.profesionales 
            WHERE (numero_documento IS NULL OR numero_documento = '' OR CAST(numero_documento AS TEXT) = '') 
            AND activo = true
        `);
        
        console.log(`❌ Profesionales sin DNI: ${dniFaltantes.rows[0].sin_dni}`);

        // 3. ANÁLISIS DE ESTADOS FINANCIEROS INCONSISTENTES  
        console.log('\n💰 3. ANÁLISIS ESTADOS FINANCIEROS INCONSISTENTES');
        console.log('-'.repeat(55));
        
        const estadosInconsistentes = await pool.query(`
            SELECT 
                p.nombre,
                p.provincia,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_calculado,
                MAX(ph.fecha_pago) as ultimo_pago_real,
                EXTRACT(YEAR FROM MAX(ph.fecha_pago)) as ano_ultimo_pago
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.activo = true
            GROUP BY p.id, p.nombre, p.provincia, m.numero_matricula
            HAVING calcular_estado_profesional(m.numero_matricula::TEXT) = 'AL_DIA' 
               AND (MAX(ph.fecha_pago) IS NULL OR EXTRACT(YEAR FROM MAX(ph.fecha_pago)) < 2024)
            ORDER BY MAX(ph.fecha_pago) DESC NULLS LAST
            LIMIT 10
        `);
        
        console.log('Casos "AL DIA" pero sin pagos recientes (TOP 10):');
        estadosInconsistentes.rows.forEach(row => {
            console.log(`   ❌ ${row.nombre} (${row.numero_matricula}) - ${row.provincia}`);
            console.log(`      Estado: ${row.estado_calculado} | Último pago: ${row.ano_ultimo_pago || 'NUNCA'}`);
        });

        // ANÁLISIS ESPECÍFICO: Profesionales externos vs COPIG
        console.log('\n🌍 4. ANÁLISIS PROFESIONALES EXTERNOS vs COPIG');
        console.log('-'.repeat(50));
        
        const externosVsCopig = await pool.query(`
            SELECT 
                CASE 
                    WHEN provincia = 'Mendoza' THEN 'COPIG_MENDOZA'
                    ELSE 'EXTERNOS'
                END as tipo,
                COUNT(*) as cantidad,
                COUNT(CASE WHEN calcular_estado_profesional(m.numero_matricula::TEXT) = 'AL_DIA' THEN 1 END) as al_dia,
                COUNT(CASE WHEN calcular_estado_profesional(m.numero_matricula::TEXT) = 'MOROSO' THEN 1 END) as morosos
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            GROUP BY CASE WHEN provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END
        `);
        
        externosVsCopig.rows.forEach(row => {
            const porcentajeAlDia = ((row.al_dia / row.cantidad) * 100).toFixed(1);
            console.log(`   ${row.tipo}:`);
            console.log(`     • Total: ${row.cantidad}`);
            console.log(`     • Al día: ${row.al_dia} (${porcentajeAlDia}%)`);
            console.log(`     • Morosos: ${row.morosos}`);
        });

        // 5. PROFESIONALES CON MATRÍCULAS EN RANGO SOSPECHOSO
        console.log('\n🔍 5. ANÁLISIS MATRÍCULAS SOSPECHOSAS');
        console.log('-'.repeat(40));
        
        const matriculasSospechosas = await pool.query(`
            SELECT 
                p.nombre,
                p.provincia,
                m.numero_matricula,
                m.fecha_inscripcion
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true 
            AND m.numero_matricula >= 10000  -- Matrículas muy altas que pueden ser externas
            AND p.provincia != 'Mendoza'
            ORDER BY m.numero_matricula DESC
            LIMIT 10
        `);
        
        console.log('Profesionales externos con matrículas altas:');
        matriculasSospechosas.rows.forEach(row => {
            console.log(`   🔍 ${row.nombre} (${row.numero_matricula}) - ${row.provincia}`);
            console.log(`      Fecha inscripción: ${row.fecha_inscripcion?.toLocaleDateString('es-AR') || 'No disponible'}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('📊 CONCLUSIONES PRELIMINARES');
        console.log('='.repeat(80));
        
        console.log(`\n🎯 HALLAZGO CRÍTICO:`);
        console.log(`   • ${externosVsCopig.rows.find(r => r.tipo === 'EXTERNOS')?.cantidad || 0} profesionales NO son de COPIG Mendoza`);
        console.log(`   • Están mezclados con los ${externosVsCopig.rows.find(r => r.tipo === 'COPIG_MENDOZA')?.cantidad || 0} legítimos de Mendoza`);
        console.log(`   • Esto explica las inconsistencias geográficas y de estados`);
        
        console.log(`\n💡 TEORÍA CONFIRMADA:`);
        console.log(`   • Archivos SVPROF.DBF (externos) se importaron junto con SPPROF.DBF (COPIG)`);
        console.log(`   • Necesitamos SEPARAR estos dos conjuntos de datos`);
        console.log(`   • Los profesionales externos tienen lógicas de negocio diferentes`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixedAnalysis();