const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

(async () => {
    try {
        // Verificar total de matrículas
        const total = await pool.query('SELECT COUNT(*) as total FROM copig.matriculas');
        console.log(`Total matrículas en BD: ${total.rows[0].total}\n`);
        
        // Verificar algunas matrículas específicas que deberían existir
        const matriculasPrueba = [734, 325, 3503, 101, 3596, 11671, 3787, 1912, 2858, 1854];
        
        console.log('Verificando matrículas que deberían haberse creado:');
        console.log('='.repeat(50));
        
        for (const mat of matriculasPrueba) {
            const result = await pool.query(`
                SELECT m.numero_matricula, p.nombre, p.numero_documento
                FROM copig.matriculas m
                JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE m.numero_matricula = $1
            `, [mat]);
            
            if (result.rows.length > 0) {
                console.log(`✅ Matrícula ${mat}: ${result.rows[0].nombre.substring(0, 40)} (DNI: ${result.rows[0].numero_documento})`);
            } else {
                console.log(`❌ Matrícula ${mat}: NO EXISTE`);
            }
        }
        
        // Ver últimas 10 matrículas creadas
        console.log('\n\nÚltimas 10 matrículas creadas:');
        console.log('='.repeat(50));
        
        const ultimas = await pool.query(`
            SELECT m.numero_matricula, p.nombre, m.created_at
            FROM copig.matriculas m
            JOIN copig.profesionales p ON m.profesional_id = p.id
            ORDER BY m.id DESC
            LIMIT 10
        `);
        
        ultimas.rows.forEach(row => {
            console.log(`Mat ${row.numero_matricula}: ${row.nombre.substring(0, 40)}`);
        });
        
        // Contar profesionales con DNI ficticio (90000000+)
        const ficticios = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.profesionales
            WHERE numero_documento >= 90000000
        `);
        
        console.log(`\n\nProfesionales con DNI ficticio (externos): ${ficticios.rows[0].total}`);
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();