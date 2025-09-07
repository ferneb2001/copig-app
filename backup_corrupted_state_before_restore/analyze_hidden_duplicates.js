/**
 * Investigar duplicados con caracteres imperceptibles y listar empresas con representantes
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeHiddenDuplicates() {
    try {
        console.log('🔍 INVESTIGACIÓN DE DUPLICADOS CON CARACTERES IMPERCEPTIBLES');
        console.log('='.repeat(70));

        // 1. Buscar duplicados por similitud (quitando espacios y caracteres especiales)
        console.log('\n1️⃣ BUSCANDO DUPLICADOS CON CARACTERES IMPERCEPTIBLES:');
        const duplicados = await pool.query(`
            WITH empresa_limpia AS (
                SELECT 
                    id,
                    razon_social,
                    TRIM(UPPER(REGEXP_REPLACE(razon_social, '[^A-Z0-9]', '', 'g'))) as nombre_limpio,
                    LENGTH(razon_social) as longitud_original,
                    LENGTH(TRIM(razon_social)) as longitud_sin_espacios
                FROM copig.empresas
            )
            SELECT 
                nombre_limpio,
                COUNT(*) as cantidad,
                array_agg(id ORDER BY id) as ids,
                array_agg(razon_social ORDER BY id) as nombres_originales,
                array_agg(longitud_original ORDER BY id) as longitudes
            FROM empresa_limpia
            GROUP BY nombre_limpio 
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC
            LIMIT 15
        `);

        duplicados.rows.forEach(dup => {
            console.log(`\n   📋 "${dup.nombre_limpio}" (${dup.cantidad} duplicados):`);
            for (let i = 0; i < dup.ids.length; i++) {
                console.log(`      ID ${dup.ids[i]}: "${dup.nombres_originales[i]}" (${dup.longitudes[i]} chars)`);
                // Mostrar caracteres no imprimibles
                const nombre = dup.nombres_originales[i];
                const caracteresRaros = nombre.replace(/[A-Za-z0-9\s\.\(\)\-]/g, '?');
                if (caracteresRaros.includes('?')) {
                    console.log(`         Chars especiales: ${caracteresRaros}`);
                }
            }
        });

        console.log('\n2️⃣ LISTADO COMPLETO DE EMPRESAS CON REPRESENTANTES TÉCNICOS:');
        const empresasConRep = await pool.query(`
            SELECT 
                e.id,
                e.razon_social,
                COUNT(rt.id) as total_representantes,
                array_agg(
                    p.nombre || ' (Mat: ' || COALESCE(m.numero_matricula::text, 'N/A') || ')'
                    ORDER BY p.nombre
                ) as representantes
            FROM copig.empresas e
            INNER JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            INNER JOIN copig.profesionales p ON rt.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON rt.profesional_id = m.profesional_id
            GROUP BY e.id, e.razon_social
            ORDER BY COUNT(rt.id) DESC, e.razon_social
        `);

        console.log(`\n   📊 TOTAL: ${empresasConRep.rows.length} empresas tienen representantes técnicos\n`);

        empresasConRep.rows.forEach((emp, i) => {
            console.log(`${i + 1}. 🏢 ID: ${emp.id} - ${emp.razon_social}`);
            console.log(`   👥 ${emp.total_representantes} representantes:`);
            emp.representantes.forEach(rep => {
                console.log(`      • ${rep}`);
            });
            console.log('');
        });

        console.log('\n3️⃣ VERIFICACIÓN DE INTERFAZ WEB:');
        // Verificar qué consulta usa la interfaz web para mostrar representantes
        console.log('   La interfaz web debería mostrar estos representantes.');
        console.log('   Si no los muestra, hay un problema en el endpoint del servidor.');

        // Mostrar específicamente empresas que deberían tener representantes pero quizás no se ven
        console.log('\n4️⃣ EMPRESAS CLAVE PARA VERIFICAR EN INTERFAZ:');
        const empresasClave = await pool.query(`
            SELECT e.id, e.razon_social, COUNT(rt.id) as reps
            FROM copig.empresas e
            INNER JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            WHERE e.razon_social ILIKE ANY(ARRAY['%IMPSA%', '%CONSTRUCCIONES DEL VALLE%', '%PAMAR%', '%ELITE%'])
            GROUP BY e.id, e.razon_social
            ORDER BY e.razon_social
        `);

        empresasClave.rows.forEach(emp => {
            console.log(`   🎯 Verificar: ID ${emp.id} - ${emp.razon_social} (${emp.reps} reps)`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeHiddenDuplicates();