const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigateInvalidDates() {
    console.log('🔍 INVESTIGANDO FECHAS INVÁLIDAS EN PAGOS_HISTORICOS...\n');
    
    try {
        // 1. Verificar fechas corruptas
        console.log('1. Verificando fechas corruptas...');
        const corruptDates = await pool.query(`
            SELECT matricula, fecha_pago, EXTRACT(YEAR FROM fecha_pago) as year 
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NOT NULL 
            AND (EXTRACT(YEAR FROM fecha_pago) < 1950 OR EXTRACT(YEAR FROM fecha_pago) > 2030) 
            LIMIT 10
        `);
        
        console.log(`❌ Fechas corruptas encontradas: ${corruptDates.rows.length}`);
        corruptDates.rows.forEach(row => {
            console.log(`   ${row.matricula}: ${row.fecha_pago} (año: ${row.year})`);
        });

        // 2. Verificar fechas nulas
        console.log('\n2. Verificando fechas nulas...');
        const nullDates = await pool.query(`
            SELECT COUNT(*) as total_nulas
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NULL
        `);
        console.log(`ℹ️  Fechas nulas: ${nullDates.rows[0].total_nulas}`);

        // 3. Simular la consulta del profesional que está fallando
        console.log('\n3. Simulando consulta de profesionales (primeros 5)...');
        const testQuery = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                m.numero_matricula,
                CASE 
                    WHEN MAX(ph.fecha_pago) IS NULL THEN 'Sin pagos'
                    WHEN EXTRACT(YEAR FROM MAX(ph.fecha_pago)) < 1950 OR EXTRACT(YEAR FROM MAX(ph.fecha_pago)) > 2030 THEN 'Sin pagos'
                    ELSE TO_CHAR(MAX(ph.fecha_pago), 'DD/MM/YYYY')
                END as ultimo_pago,
                MAX(ph.fecha_pago) as raw_date
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.activo = true
            GROUP BY p.id, p.nombre, m.numero_matricula
            ORDER BY p.nombre
            LIMIT 5
        `);

        console.log('\nResultados de la consulta:');
        testQuery.rows.forEach(row => {
            console.log(`${row.nombre} (${row.numero_matricula}): ${row.ultimo_pago} | Raw: ${row.raw_date}`);
        });

        // 4. Verificar específicamente las matrículas que mostraban Invalid Date
        console.log('\n4. Verificando matrículas específicas problemáticas...');
        const problematicMatriculas = ['9106', '11444', '8400'];
        
        for (const matricula of problematicMatriculas) {
            const specific = await pool.query(`
                SELECT 
                    p.nombre,
                    m.numero_matricula,
                    ph.fecha_pago,
                    ph.concepto,
                    ph.importe
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
                WHERE m.numero_matricula::TEXT = $1
                ORDER BY ph.fecha_pago DESC
                LIMIT 3
            `, [matricula]);
            
            console.log(`\n   Matrícula ${matricula}:`);
            if (specific.rows.length === 0) {
                console.log('     ❌ No se encontró esta matrícula');
            } else {
                specific.rows.forEach(row => {
                    console.log(`     ${row.nombre}: ${row.fecha_pago} | ${row.concepto} | $${row.importe}`);
                });
            }
        }

        // 5. Verificar tipos de datos problemáticos
        console.log('\n5. Verificando tipos de datos problemáticos...');
        const dataTypes = await pool.query(`
            SELECT 
                pg_typeof(fecha_pago) as tipo_fecha,
                COUNT(*) as cantidad
            FROM copig.pagos_historicos 
            GROUP BY pg_typeof(fecha_pago)
        `);
        
        console.log('Tipos de datos en fecha_pago:');
        dataTypes.rows.forEach(row => {
            console.log(`   ${row.tipo_fecha}: ${row.cantidad} registros`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

investigateInvalidDates();