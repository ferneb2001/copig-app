const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

(async () => {
    try {
        // Verificar algunas matrículas específicas
        const matriculas = [1169, 3625, 3398, 9517, 2746, 734, 735];
        
        console.log('VERIFICANDO MATRÍCULAS EN BD:');
        console.log('='.repeat(50));
        
        for (const mat of matriculas) {
            const result = await pool.query(`
                SELECT p.id, p.nombre, m.numero_matricula
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE m.numero_matricula = $1
            `, [mat]);
            
            if (result.rows.length > 0) {
                console.log(`  Matrícula ${mat}: ✅ EXISTE`);
                console.log(`    Profesional: ${result.rows[0].nombre} (ID: ${result.rows[0].id})`);
            } else {
                // Buscar como string
                const result2 = await pool.query(`
                    SELECT p.id, p.nombre, m.numero_matricula
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    WHERE m.numero_matricula::TEXT = $1
                `, [String(mat)]);
                
                if (result2.rows.length > 0) {
                    console.log(`  Matrícula ${mat}: ✅ EXISTE (como string)`);
                    console.log(`    Profesional: ${result2.rows[0].nombre} (ID: ${result2.rows[0].id})`);
                } else {
                    console.log(`  Matrícula ${mat}: ❌ NO EXISTE`);
                }
            }
        }
        
        // Ver tipo de dato
        const tipo = await pool.query(`
            SELECT data_type, udt_name
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'matriculas' 
            AND column_name = 'numero_matricula'
        `);
        
        console.log(`\nTIPO DE DATO en BD:`);
        console.log(`  numero_matricula: ${tipo.rows[0].data_type} (${tipo.rows[0].udt_name})`);
        
        // Ver algunos valores de ejemplo
        const ejemplos = await pool.query(`
            SELECT numero_matricula, pg_typeof(numero_matricula) as tipo
            FROM copig.matriculas 
            LIMIT 5
        `);
        
        console.log(`\nEJEMPLOS DE MATRÍCULAS EN BD:`);
        ejemplos.rows.forEach(ej => {
            console.log(`  ${ej.numero_matricula} (tipo: ${ej.tipo})`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        await pool.end();
    }
})();