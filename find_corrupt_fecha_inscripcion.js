const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function findCorruptFechaInscripcion() {
    console.log('🔍 BUSCANDO FECHAS_INSCRIPCION CORRUPTAS...\n');
    
    try {
        // Verificar fechas nulas o inválidas
        console.log('1. Verificando fechas nulas...');
        const nullDates = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.matriculas 
            WHERE fecha_inscripcion IS NULL
        `);
        console.log(`❌ Fechas nulas: ${nullDates.rows[0].total}`);

        // Verificar fechas con años extraños
        console.log('\n2. Verificando fechas con años problemáticos...');
        const weirdDates = await pool.query(`
            SELECT 
                numero_matricula,
                fecha_inscripcion,
                EXTRACT(YEAR FROM fecha_inscripcion) as year
            FROM copig.matriculas 
            WHERE fecha_inscripcion IS NOT NULL 
            AND (EXTRACT(YEAR FROM fecha_inscripcion) < 1950 OR EXTRACT(YEAR FROM fecha_inscripcion) > 2030)
            LIMIT 10
        `);
        console.log(`❌ Fechas con años problemáticos: ${weirdDates.rows.length}`);
        weirdDates.rows.forEach(row => {
            console.log(`   Matrícula ${row.numero_matricula}: ${row.fecha_inscripcion} (año ${row.year})`);
        });

        // Verificar algunos registros específicos que podrían tener problemas
        console.log('\n3. Verificando muestra de fechas_inscripcion...');
        const sample = await pool.query(`
            SELECT 
                m.numero_matricula,
                p.nombre,
                m.fecha_inscripcion,
                pg_typeof(m.fecha_inscripcion) as tipo_dato
            FROM copig.matriculas m
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY m.fecha_inscripcion DESC
            LIMIT 10
        `);
        
        console.log('Muestra de fechas recientes:');
        sample.rows.forEach(row => {
            console.log(`   ${row.nombre} (${row.numero_matricula}): ${row.fecha_inscripcion} (${row.tipo_dato})`);
        });

        // Verificar si hay datos problemáticos con tipos de datos
        console.log('\n4. Verificando tipos de datos en fecha_inscripcion...');
        const dataTypes = await pool.query(`
            SELECT 
                pg_typeof(fecha_inscripcion) as tipo,
                COUNT(*) as cantidad
            FROM copig.matriculas
            GROUP BY pg_typeof(fecha_inscripcion)
        `);
        
        dataTypes.rows.forEach(row => {
            console.log(`   ${row.tipo}: ${row.cantidad} registros`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

findCorruptFechaInscripcion();