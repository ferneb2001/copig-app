const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkMigrationStatus() {
    try {
        console.log('=== STATUS DE MIGRACIÓN ===\n');
        
        // 1. Verificar si tenemos pagos_historicos
        console.log('1. TABLA PAGOS_HISTORICOS:');
        const pagosQuery = await pool.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        console.log(`   Total registros: ${parseInt(pagosQuery.rows[0].total).toLocaleString()}`);
        
        if (parseInt(pagosQuery.rows[0].total) === 0) {
            console.log('   ❌ Tabla vacía - necesita migración de pagos');
        }
        
        // 2. Verificar mapeo creado
        console.log('\n2. MAPEO FOXPRO:');
        const mapeoQuery = await pool.query('SELECT COUNT(*) as total FROM copig.foxpro_matricula_profesional_map');
        console.log(`   Mapeos creados: ${parseInt(mapeoQuery.rows[0].total).toLocaleString()}`);
        
        // 3. Verificar profesionales
        console.log('\n3. PROFESIONALES:');
        const profQuery = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        console.log(`   Total profesionales: ${parseInt(profQuery.rows[0].total).toLocaleString()}`);
        
        // 4. Verificar matrículas
        console.log('\n4. MATRÍCULAS:');
        const matQuery = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN profesional_id IS NOT NULL THEN 1 END) as con_profesional,
                COUNT(CASE WHEN profesional_id IS NULL THEN 1 END) as sin_profesional
            FROM copig.matriculas
        `);
        const mat = matQuery.rows[0];
        console.log(`   Total matrículas: ${parseInt(mat.total).toLocaleString()}`);
        console.log(`   Con profesional: ${parseInt(mat.con_profesional).toLocaleString()}`);
        console.log(`   Sin profesional: ${parseInt(mat.sin_profesional).toLocaleString()}`);
        
        if (parseInt(mat.total) > 0) {
            const porcentaje = (parseInt(mat.con_profesional) / parseInt(mat.total)) * 100;
            console.log(`   Porcentaje vinculadas: ${porcentaje.toFixed(1)}%`);
        }
        
        // 5. Sample de mapeo
        console.log('\n5. SAMPLE DE MAPEO:');
        const sampleQuery = await pool.query(`
            SELECT 
                matricula_numero,
                profesional_nombre,
                profesional_dcnro
            FROM copig.foxpro_matricula_profesional_map
            LIMIT 5
        `);
        
        sampleQuery.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. Matrícula: ${row.matricula_numero} → ${row.profesional_nombre} (DNI: ${row.profesional_dcnro})`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkMigrationStatus();