const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkTitulosStructure() {
    try {
        console.log('=== INVESTIGANDO TABLAS DE TÍTULOS ===\n');
        
        // Ver estructura de titulos_profesionales
        console.log('1. ESTRUCTURA titulos_profesionales:');
        const titProfStructure = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'titulos_profesionales'
            ORDER BY ordinal_position
        `);
        
        titProfStructure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        // Ver estructura de titulos
        console.log('\n2. ESTRUCTURA titulos:');
        const titulosStructure = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'titulos'
            ORDER BY ordinal_position
        `);
        
        titulosStructure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        // Ver algunos títulos de ejemplo
        console.log('\n3. EJEMPLOS DE TÍTULOS:');
        const sampleTitles = await pool.query(`
            SELECT * FROM copig.titulos LIMIT 5
        `);
        
        sampleTitles.rows.forEach((titulo, index) => {
            console.log(`\n   Título ${index + 1}:`);
            Object.keys(titulo).forEach(key => {
                console.log(`     ${key}: ${titulo[key]}`);
            });
        });

        // Buscar profesionales que SÍ tienen título
        console.log('\n4. PROFESIONALES CON TÍTULO ASIGNADO:');
        const profConTitulo = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                m.titulo_id,
                t.descripcion as titulo
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE m.titulo_id IS NOT NULL
            LIMIT 5
        `);
        
        profConTitulo.rows.forEach((prof, index) => {
            console.log(`   ${index + 1}. ${prof.nombre} (Mat: ${prof.numero_matricula}) - Título: ${prof.titulo || 'SIN DESCRIPCIÓN'}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTitulosStructure();