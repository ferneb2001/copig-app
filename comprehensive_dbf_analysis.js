const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function comprehensiveDBFAnalysis() {
    console.log('🔍 ANÁLISIS COMPREHENSIVO DE INCONSISTENCIAS DBF → POSTGRESQL\n');
    console.log('=' .repeat(80));
    
    try {
        // 1. ANÁLISIS GEOGRÁFICO - Profesionales fuera de Mendoza
        console.log('\n📍 1. ANÁLISIS GEOGRÁFICO - Profesionales fuera de Mendoza');
        console.log('-'.repeat(60));
        
        const geografico = await pool.query(`
            SELECT 
                provincia,
                COUNT(*) as cantidad,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM copig.profesionales WHERE activo = true), 2) as porcentaje
            FROM copig.profesionales 
            WHERE activo = true
            AND provincia IS NOT NULL
            GROUP BY provincia
            ORDER BY cantidad DESC
        `);
        
        console.log('Distribución por provincia:');
        geografico.rows.forEach(row => {
            const indicator = row.provincia === 'Mendoza' ? '✅' : '⚠️ ';
            console.log(`   ${indicator} ${row.provincia}: ${row.cantidad} (${row.porcentaje}%)`);
        });
        
        const externosCount = geografico.rows
            .filter(row => row.provincia !== 'Mendoza')
            .reduce((sum, row) => sum + parseInt(row.cantidad), 0);
        
        console.log(`\n❌ TOTAL PROFESIONALES EXTERNOS: ${externosCount}`);

        // 2. ANÁLISIS DNI FALTANTES
        console.log('\n📋 2. ANÁLISIS DNI FALTANTES');
        console.log('-'.repeat(40));
        
        const dniFaltantes = await pool.query(`
            SELECT COUNT(*) as sin_dni
            FROM copig.profesionales 
            WHERE (numero_documento IS NULL OR numero_documento = '') 
            AND activo = true
        `);
        
        console.log(`❌ Profesionales sin DNI: ${dniFaltantes.rows[0].sin_dni}`);

        // 3. ANÁLISIS DE ESTADOS FINANCIEROS INCONSISTENTES  
        console.log('\n💰 3. ANÁLISIS ESTADOS FINANCIEROS INCONSISTENTES');
        console.log('-'.repeat(55));
        
        const estadosInconsistentes = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_calculado,
                MAX(ph.fecha_pago) as ultimo_pago_real,
                EXTRACT(YEAR FROM MAX(ph.fecha_pago)) as ano_ultimo_pago
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.activo = true
            GROUP BY p.id, p.nombre, m.numero_matricula
            HAVING calcular_estado_profesional(m.numero_matricula::TEXT) = 'AL_DIA' 
               AND (MAX(ph.fecha_pago) IS NULL OR EXTRACT(YEAR FROM MAX(ph.fecha_pago)) < 2024)
            ORDER BY MAX(ph.fecha_pago) DESC NULLS LAST
            LIMIT 10
        `);
        
        console.log('Casos "AL DIA" pero sin pagos recientes:');
        estadosInconsistentes.rows.forEach(row => {
            console.log(`   ❌ ${row.nombre} (${row.numero_matricula}): ${row.estado_calculado} - Último pago: ${row.ano_ultimo_pago || 'NUNCA'}`);
        });

        // 4. ANÁLISIS MATRÍCULAS DUPLICADAS
        console.log('\n🔢 4. ANÁLISIS MATRÍCULAS DUPLICADAS');
        console.log('-'.repeat(40));
        
        const matriculasDuplicadas = await pool.query(`
            SELECT 
                numero_matricula,
                COUNT(*) as cantidad_duplicados
            FROM copig.matriculas
            GROUP BY numero_matricula
            HAVING COUNT(*) > 1
            ORDER BY cantidad_duplicados DESC
        `);
        
        console.log(`❌ Matrículas duplicadas encontradas: ${matriculasDuplicadas.rows.length}`);
        matriculasDuplicadas.rows.slice(0, 5).forEach(row => {
            console.log(`   Matrícula ${row.numero_matricula}: ${row.cantidad_duplicados} duplicados`);
        });

        // 5. ANÁLISIS FECHAS DE INSCRIPCIÓN FUTURAS
        console.log('\n📅 5. ANÁLISIS FECHAS DE INSCRIPCIÓN FUTURAS');
        console.log('-'.repeat(50));
        
        const fechasFuturas = await pool.query(`
            SELECT 
                COUNT(*) as fechas_futuras
            FROM copig.matriculas
            WHERE fecha_inscripcion IS NOT NULL 
            AND EXTRACT(YEAR FROM fecha_inscripcion) > 2025
        `);
        
        console.log(`❌ Fechas de inscripción futuras: ${fechasFuturas.rows[0].fechas_futuras}`);

        // 6. ANÁLISIS EMPRESAS SIN REPRESENTANTES
        console.log('\n🏢 6. ANÁLISIS EMPRESAS SIN REPRESENTANTES TÉCNICOS');
        console.log('-'.repeat(55));
        
        const empresasSinRT = await pool.query(`
            SELECT COUNT(*) as sin_representantes
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            WHERE rt.id IS NULL AND e.activo = true
        `);
        
        console.log(`⚠️  Empresas activas sin representantes técnicos: ${empresasSinRT.rows[0].sin_representantes}`);

        // 7. ANÁLISIS PAGOS SIN CONCEPTO
        console.log('\n💸 7. ANÁLISIS PAGOS SIN CONCEPTO');
        console.log('-'.repeat(35));
        
        const pagosSinConcepto = await pool.query(`
            SELECT COUNT(*) as sin_concepto
            FROM copig.pagos_historicos
            WHERE concepto IS NULL OR concepto = '' OR concepto = 'Sin concepto'
        `);
        
        console.log(`⚠️  Pagos sin concepto: ${pagosSinConcepto.rows[0].sin_concepto}`);

        // 8. RESUMEN EJECUTIVO
        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMEN EJECUTIVO DE INCONSISTENCIAS');
        console.log('='.repeat(80));
        
        const totalProfesionales = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales WHERE activo = true');
        const totalEmpresas = await pool.query('SELECT COUNT(*) as total FROM copig.empresas WHERE activo = true');
        const totalPagos = await pool.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        
        console.log(`\n📈 DATOS TOTALES:`);
        console.log(`   • Profesionales activos: ${totalProfesionales.rows[0].total}`);
        console.log(`   • Empresas activas: ${totalEmpresas.rows[0].total}`);
        console.log(`   • Pagos históricos: ${totalPagos.rows[0].total}`);
        
        console.log(`\n❌ INCONSISTENCIAS DETECTADAS:`);
        console.log(`   • Profesionales externos (no Mendoza): ${externosCount}`);
        console.log(`   • Profesionales sin DNI: ${dniFaltantes.rows[0].sin_dni}`);
        console.log(`   • Estados financieros inconsistentes: ${estadosInconsistentes.rows.length}+`);
        console.log(`   • Matrículas duplicadas: ${matriculasDuplicadas.rows.length}`);
        console.log(`   • Fechas futuras: ${fechasFuturas.rows[0].fechas_futuras}`);
        console.log(`   • Empresas sin RT: ${empresasSinRT.rows[0].sin_representantes}`);
        console.log(`   • Pagos sin concepto: ${pagosSinConcepto.rows[0].sin_concepto}`);

        // 9. RECOMENDACIONES
        console.log(`\n💡 RECOMENDACIONES PRIORITARIAS:`);
        console.log(`   1. 🎯 SEPARAR profesionales externos de COPIG Mendoza`);
        console.log(`   2. 🔍 INVESTIGAR algoritmo estados financieros`);
        console.log(`   3. 📋 COMPLETAR DNIs faltantes desde DBFs originales`);
        console.log(`   4. 🔢 RESOLVER matrículas duplicadas`);
        console.log(`   5. 📅 CORREGIR fechas de inscripción futuras`);

    } catch (error) {
        console.error('❌ Error en análisis:', error.message);
    } finally {
        await pool.end();
    }
}

comprehensiveDBFAnalysis();