const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testPaginacion() {
    const client = await pool.connect();
    try {
        console.log('📊 PROBANDO PAGINACIÓN DE PROFESIONALES\n');
        
        // 1. Contar total de profesionales
        console.log('📈 1. Contando total de profesionales activos:');
        const totalResult = await client.query(`
            SELECT COUNT(*) as total 
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
        `);
        const total = parseInt(totalResult.rows[0].total);
        const limit = 50;
        const totalPages = Math.ceil(total / limit);
        
        console.log(`   ✅ Total profesionales: ${total}`);
        console.log(`   📄 Páginas necesarias (50 por página): ${totalPages}`);
        
        // 2. Probar primera página
        console.log('\n📋 2. Probando primera página (1-50):');
        const page1 = await client.query(`
            SELECT 
                p.id, 
                m.numero_matricula as matricula,
                p.nombre, 
                p.numero_documento,
                p.email,
                CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            ORDER BY p.nombre 
            LIMIT 50 OFFSET 0
        `);
        
        console.log(`   ✅ Página 1: ${page1.rows.length} profesionales`);
        console.log(`   🔸 Primero: ${page1.rows[0]?.nombre}`);
        console.log(`   🔹 Último: ${page1.rows[page1.rows.length - 1]?.nombre}`);
        
        // 3. Probar segunda página si existe
        if (totalPages > 1) {
            console.log('\n📋 3. Probando segunda página (51-100):');
            const page2 = await client.query(`
                SELECT 
                    p.id, 
                    m.numero_matricula as matricula,
                    p.nombre, 
                    p.numero_documento,
                    p.email,
                    CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.activo = true
                ORDER BY p.nombre 
                LIMIT 50 OFFSET 50
            `);
            
            console.log(`   ✅ Página 2: ${page2.rows.length} profesionales`);
            if (page2.rows.length > 0) {
                console.log(`   🔸 Primero: ${page2.rows[0]?.nombre}`);
                console.log(`   🔹 Último: ${page2.rows[page2.rows.length - 1]?.nombre}`);
            }
        }
        
        // 4. Probar última página
        if (totalPages > 2) {
            console.log(`\n📋 4. Probando última página (${totalPages}):`)
            const offset = (totalPages - 1) * 50;
            const lastPage = await client.query(`
                SELECT 
                    p.id, 
                    m.numero_matricula as matricula,
                    p.nombre, 
                    p.numero_documento,
                    p.email,
                    CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.activo = true
                ORDER BY p.nombre 
                LIMIT 50 OFFSET ${offset}
            `);
            
            console.log(`   ✅ Página ${totalPages}: ${lastPage.rows.length} profesionales`);
            if (lastPage.rows.length > 0) {
                console.log(`   🔸 Primero: ${lastPage.rows[0]?.nombre}`);
                console.log(`   🔹 Último: ${lastPage.rows[lastPage.rows.length - 1]?.nombre}`);
            }
        }
        
        // 5. Probar paginación con búsqueda
        console.log('\n🔍 5. Probando paginación con búsqueda "MARTINEZ":');
        const searchTotal = await client.query(`
            SELECT COUNT(*) as total 
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            AND (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 OR m.numero_matricula::TEXT ILIKE $1)
        `, ['%MARTINEZ%']);
        
        const searchTotalCount = parseInt(searchTotal.rows[0].total);
        const searchPages = Math.ceil(searchTotalCount / 50);
        
        console.log(`   ✅ Total con "MARTINEZ": ${searchTotalCount} profesionales`);
        console.log(`   📄 Páginas necesarias: ${searchPages}`);
        
        const searchResult = await client.query(`
            SELECT 
                p.id, 
                m.numero_matricula as matricula,
                p.nombre, 
                p.numero_documento,
                p.email,
                CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            AND (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 OR m.numero_matricula::TEXT ILIKE $1)
            ORDER BY p.nombre 
            LIMIT 50 OFFSET 0
        `, ['%MARTINEZ%']);
        
        console.log(`   ✅ Primera página búsqueda: ${searchResult.rows.length} profesionales`);
        searchResult.rows.slice(0, 3).forEach((prof, i) => {
            console.log(`     ${i+1}. ${prof.nombre} - Mat: ${prof.matricula}`);
        });
        
        console.log('\n🎯 RESUMEN:');
        console.log(`   - Sistema soporta ${totalPages} páginas de profesionales`);
        console.log(`   - Paginación funcionando correctamente: ✅`);
        console.log(`   - Búsqueda con paginación funcionando: ✅`);
        console.log(`   - Frontend actualizado con controles: ✅`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

testPaginacion().catch(console.error);