const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function asignarTitulo() {
    try {
        console.log('🔧 Asignando título al profesional de prueba...');
        
        // Primero ver títulos disponibles
        const titulos = await pool.query('SELECT id, descripcion FROM copig.titulos ORDER BY id LIMIT 5');
        console.log('Títulos disponibles:');
        titulos.rows.forEach(titulo => {
            console.log(`  ${titulo.id}: ${titulo.descripcion}`);
        });
        
        // Asignar el primer título (id: 1) al profesional de prueba
        const updateResult = await pool.query(`
            UPDATE copig.matriculas 
            SET titulo_id = 1 
            WHERE profesional_id = 10752
        `);
        
        console.log(`✅ Actualizado ${updateResult.rowCount} registro(s)`);
        
        // Verificar la actualización
        const verification = await pool.query(`
            SELECT p.id, p.nombre, m.numero_matricula, m.titulo_id, t.descripcion as titulo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE p.id = 10752
        `);
        
        console.log('Verificación:');
        console.log(verification.rows[0]);
        
        await pool.end();
        console.log('🎉 Título asignado exitosamente al profesional de prueba');
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

asignarTitulo();