/**
 * Verificar representantes técnicos de IMPSA
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarIMPSA() {
    try {
        const result = await pool.query(`
            SELECT 
                rt.id,
                rt.categoria_representacion,
                p.nombre as profesional_nombre,
                m.numero_matricula,
                rt.fecha_inicio
            FROM copig.representantes_tecnicos rt
            INNER JOIN copig.empresas e ON rt.empresa_id = e.id
            INNER JOIN copig.profesionales p ON rt.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON rt.profesional_id = m.profesional_id
            WHERE e.razon_social ILIKE '%IMPSA%'
            ORDER BY rt.fecha_inicio DESC
        `);
        
        console.log('⭐ REPRESENTANTES TÉCNICOS DE IMPSA:');
        result.rows.forEach((rep, i) => {
            console.log(`   ${i+1}. ${rep.profesional_nombre} (Mat: ${rep.numero_matricula || 'N/A'})`);
            console.log(`      Categoría: ${rep.categoria_representacion}, Inicio: ${rep.fecha_inicio}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verificarIMPSA();