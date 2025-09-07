const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function investigarAcosta() {
    try {
        console.log('🔍 Buscando a Acosta Sergio Daniel...');
        
        // Buscar el profesional
        const profesional = await pool.query(`
            SELECT p.id, p.nombre, p.numero_documento,
                   m.numero_matricula, m.titulo_id,
                   t.descripcion as titulo_asignado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE UPPER(p.nombre) LIKE '%ACOSTA%SERGIO%DANIEL%'
        `);
        
        if (profesional.rows.length > 0) {
            console.log('✅ Encontrado:');
            console.log(profesional.rows[0]);
            
            // Ver todos los títulos disponibles
            console.log('\n📋 Títulos disponibles en la base de datos:');
            const titulos = await pool.query('SELECT id, descripcion FROM copig.titulos ORDER BY descripcion');
            titulos.rows.forEach(titulo => {
                console.log(`  ${titulo.id}: ${titulo.descripcion}`);
            });
            
        } else {
            console.log('❌ No se encontró el profesional. Buscando por partes...');
            
            const busqueda = await pool.query(`
                SELECT p.id, p.nombre, p.numero_documento,
                       m.numero_matricula, m.titulo_id,
                       t.descripcion as titulo_asignado
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE UPPER(p.nombre) LIKE '%ACOSTA%'
                ORDER BY p.nombre
            `);
            
            console.log(`Encontrados ${busqueda.rows.length} profesionales con apellido Acosta:`);
            busqueda.rows.forEach(prof => {
                console.log(`${prof.nombre} - Matrícula: ${prof.numero_matricula} - Título: ${prof.titulo_asignado || 'SIN TÍTULO'}`);
            });
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

investigarAcosta();