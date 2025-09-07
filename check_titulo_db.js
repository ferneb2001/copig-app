const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function checkTitulo() {
    try {
        // Verificar estructura de la tabla profesionales
        const structure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        
        console.log('Estructura tabla profesionales:');
        structure.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}`);
        });
        
        // Verificar datos del profesional 10752
        const result = await pool.query(`
            SELECT p.id, p.nombre, p.email, p.activo,
                   m.numero_matricula, m.titulo_id, m.categoria
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = 10752
        `);
        
        console.log('\nDatos completos del profesional 10752:');
        console.log(result.rows[0]);
        
        // Verificar si existe tabla titulos
        const titulos_check = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name = 'titulos'
        `);
        
        console.log('\n¿Existe tabla titulos?', titulos_check.rows.length > 0 ? 'SÍ' : 'NO');
        
        if (titulos_check.rows.length > 0) {
            const titulos_data = await pool.query(`SELECT * FROM copig.titulos LIMIT 5`);
            console.log('Primeros 5 títulos:');
            titulos_data.rows.forEach(titulo => console.log(titulo));
        }
        
        // Ver estructura tabla matriculas
        const matriculas_structure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'matriculas'
            ORDER BY ordinal_position
        `);
        
        console.log('\nEstructura tabla matriculas:');
        matriculas_structure.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
}

checkTitulo();