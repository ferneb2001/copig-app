/**
 * Verificar estado final tras limpieza de duplicados
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verifyFinalState() {
    try {
        console.log('🔍 VERIFICACIÓN FINAL TRAS LIMPIEZA DE DUPLICADOS');
        console.log('='.repeat(60));

        // Verificar que no hay más duplicados
        console.log('\n1️⃣ VERIFICANDO DUPLICADOS RESTANTES:');
        const duplicados = await pool.query(`
            SELECT razon_social, COUNT(*) as cantidad
            FROM copig.empresas 
            GROUP BY razon_social 
            HAVING COUNT(*) > 1
            LIMIT 5
        `);
        
        if (duplicados.rows.length === 0) {
            console.log('   ✅ No hay empresas duplicadas');
        } else {
            console.log(`   ⚠️ Aún hay ${duplicados.rows.length} empresas con duplicados:`);
            duplicados.rows.forEach(dup => {
                console.log(`      ${dup.razon_social}: ${dup.cantidad} veces`);
            });
        }

        // Verificar IMPSA específicamente
        console.log('\n2️⃣ VERIFICANDO IMPSA:');
        const impsaResult = await pool.query(`
            SELECT 
                e.id,
                e.razon_social,
                COUNT(rt.id) as representantes
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            WHERE e.razon_social ILIKE '%IMPSA%'
            GROUP BY e.id, e.razon_social
        `);

        if (impsaResult.rows.length === 1) {
            const impsa = impsaResult.rows[0];
            console.log(`   ✅ Solo una IMPSA: ID ${impsa.id} con ${impsa.representantes} representantes`);
        } else {
            console.log(`   ❌ Problema: ${impsaResult.rows.length} IMPSA encontradas`);
            impsaResult.rows.forEach(imp => {
                console.log(`      ID ${imp.id}: ${imp.representantes} representantes`);
            });
        }

        // Estadísticas generales
        console.log('\n3️⃣ ESTADÍSTICAS GENERALES:');
        const totalEmpresas = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
        const totalRep = await pool.query('SELECT COUNT(*) as total FROM copig.representantes_tecnicos');
        const empresasConRep = await pool.query(`
            SELECT COUNT(DISTINCT empresa_id) as total 
            FROM copig.representantes_tecnicos
        `);

        console.log(`   📊 Total empresas: ${totalEmpresas.rows[0].total}`);
        console.log(`   📊 Total representantes técnicos: ${totalRep.rows[0].total}`);
        console.log(`   📊 Empresas con representantes: ${empresasConRep.rows[0].total}`);

        // Top 5 empresas con más representantes
        console.log('\n4️⃣ TOP 5 EMPRESAS CON MÁS REPRESENTANTES:');
        const topEmpresas = await pool.query(`
            SELECT 
                e.razon_social,
                COUNT(rt.id) as total_rep
            FROM copig.empresas e
            INNER JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            GROUP BY e.id, e.razon_social
            ORDER BY COUNT(rt.id) DESC
            LIMIT 5
        `);

        topEmpresas.rows.forEach((emp, i) => {
            console.log(`   ${i+1}. ${emp.razon_social}: ${emp.total_rep} representantes`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyFinalState();