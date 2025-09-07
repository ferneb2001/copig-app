const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugSearchProblem() {
    try {
        console.log('=== INVESTIGANDO PROBLEMA DE BÚSQUEDA ===\n');

        // 1. Verificar si existe la matrícula 11747
        console.log('1. VERIFICANDO SI EXISTE MATRÍCULA 11747:');
        const matriculaCheck = await pool.query(`
            SELECT 
                m.numero_matricula,
                p.nombre,
                p.numero_documento
            FROM copig.matriculas m
            JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE m.numero_matricula = 11747
        `);
        
        if (matriculaCheck.rows.length > 0) {
            console.log('   ✅ Matrícula encontrada:');
            matriculaCheck.rows.forEach(row => {
                console.log(`   - ${row.nombre} (DNI: ${row.numero_documento}, Mat: ${row.numero_matricula})`);
            });
        } else {
            console.log('   ❌ Matrícula 11747 NO EXISTE en la base de datos');
        }

        // 2. Ver las matrículas más altas que existen
        console.log('\n2. MATRÍCULAS MÁS ALTAS EN BD:');
        const highMatriculas = await pool.query(`
            SELECT 
                m.numero_matricula,
                p.nombre
            FROM copig.matriculas m
            JOIN copig.profesionales p ON m.profesional_id = p.id
            ORDER BY m.numero_matricula DESC
            LIMIT 10
        `);
        
        highMatriculas.rows.forEach((row, index) => {
            console.log(`   ${index + 1}. Mat: ${row.numero_matricula} - ${row.nombre}`);
        });

        // 3. Probar el query actual del servidor
        console.log('\n3. PROBANDO QUERY ACTUAL DEL SERVIDOR:');
        const buscar = '11747';
        const whereClause = 'WHERE p.activo = true AND (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 OR m.numero_matricula::TEXT ILIKE $1)';
        const params = [`%${buscar}%`];
        
        const serverQuery = `
            SELECT 
                p.id, 
                COALESCE(p.numero_documento::TEXT, 'Sin DNI') as dni, 
                p.nombre, 
                COALESCE(p.email, 'Sin email') as email,
                COALESCE(m.numero_matricula::TEXT, 'Sin matrícula') as matricula,
                COALESCE(m.categoria, 'N/A') as categoria,
                COALESCE(m.fecha_inscripcion::TEXT, 'No disponible') as fecha_inscripcion,
                p.activo,
                COALESCE(
                    TO_CHAR(MAX(ph.fecha_pago), 'DD/MM/YYYY'), 
                    'Sin pagos'
                ) as ultimo_pago
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            ${whereClause}
            GROUP BY p.id, p.numero_documento, p.nombre, p.email, m.numero_matricula, m.categoria, m.fecha_inscripcion, p.activo
            ORDER BY p.nombre 
            LIMIT 10
        `;
        
        console.log('   Query ejecutándose:');
        console.log(`   Parámetro: "${params[0]}"`);
        
        const result = await pool.query(serverQuery, params);
        console.log(`   ✅ Resultados encontrados: ${result.rows.length}`);
        
        if (result.rows.length > 0) {
            result.rows.forEach((prof, index) => {
                console.log(`   ${index + 1}. ${prof.nombre} (DNI: ${prof.dni}, Mat: ${prof.matricula})`);
            });
        }

        // 4. Probar búsqueda directa sin ILIKE
        console.log('\n4. PROBANDO BÚSQUEDA DIRECTA (SIN ILIKE):');
        const directQuery = `
            SELECT 
                p.nombre,
                p.numero_documento,
                m.numero_matricula
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true 
            AND (
                m.numero_matricula = 11747 
                OR m.numero_matricula::TEXT = '11747'
            )
        `;
        
        const directResult = await pool.query(directQuery);
        console.log(`   Resultados directos: ${directResult.rows.length}`);
        
        if (directResult.rows.length > 0) {
            directResult.rows.forEach((prof, index) => {
                console.log(`   ${index + 1}. ${prof.nombre} (DNI: ${prof.numero_documento}, Mat: ${prof.numero_matricula})`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugSearchProblem();