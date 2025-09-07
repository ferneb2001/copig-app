const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function verificarInconsistencias() {
    try {
        console.log('🔍 Verificando posibles inconsistencias en títulos...');
        
        // Contar profesionales por título
        const resumen = await pool.query(`
            SELECT t.descripcion, COUNT(*) as cantidad
            FROM copig.matriculas m
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE m.titulo_id IS NOT NULL
            GROUP BY t.descripcion
            ORDER BY COUNT(*) DESC
            LIMIT 15
        `);
        
        console.log('\n📊 Títulos más asignados:');
        resumen.rows.forEach(item => {
            console.log(`${item.cantidad.toString().padStart(4)} profesionales: ${item.descripcion}`);
        });
        
        // Buscar casos específicos que podrían estar mal
        console.log('\n🔍 Casos potencialmente problemáticos:');
        
        // Ingenieros hidráulicos (revisar si algunos deberían ser en construcciones)
        const hidraulicos = await pool.query(`
            SELECT p.nombre, m.numero_matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE t.descripcion = 'INGENIERO HIDRAULICO'
            ORDER BY p.nombre
            LIMIT 10
        `);
        
        console.log('\nPrimeros 10 "INGENIERO HIDRAULICO":');
        hidraulicos.rows.forEach(prof => {
            console.log(`  Matrícula ${prof.numero_matricula}: ${prof.nombre}`);
        });
        
        // Profesionales sin título asignado
        const sinTitulo = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM copig.matriculas m
            WHERE m.titulo_id IS NULL
        `);
        
        console.log(`\n❌ Profesionales SIN título asignado: ${sinTitulo.rows[0].cantidad}`);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

verificarInconsistencias();