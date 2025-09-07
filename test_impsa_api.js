/**
 * Probar API de IMPSA específicamente
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testIMPSAAPI() {
    try {
        console.log('🧪 PRUEBA ESPECÍFICA DE IMPSA');
        console.log('='.repeat(50));

        // 1. Verificar que IMPSA existe
        console.log('\n1️⃣ VERIFICANDO IMPSA EN BD:');
        const impsaResult = await pool.query(`
            SELECT id, razon_social 
            FROM copig.empresas 
            WHERE razon_social ILIKE '%IMPSA%'
        `);

        console.log(`   Encontradas ${impsaResult.rows.length} IMPSA:`);
        impsaResult.rows.forEach(emp => {
            console.log(`   • ID: ${emp.id} - ${emp.razon_social}`);
        });

        const impsaId = impsaResult.rows[0].id;

        // 2. Simular consulta exacta del servidor
        console.log(`\n2️⃣ SIMULANDO CONSULTA DEL SERVIDOR (ID: ${impsaId}):`);
        
        // Consulta básica
        const empresa = await pool.query('SELECT * FROM copig.empresas WHERE id = $1', [impsaId]);
        console.log(`   ✅ Empresa encontrada: ${empresa.rows[0].razon_social}`);

        // Consulta de representantes (exacta del servidor)
        const representantesResult = await pool.query(`
            SELECT 
                rt.id,
                rt.categoria_representacion,
                rt.fecha_inicio,
                rt.fecha_fin,
                rt.activo,
                rt.observaciones,
                p.nombre as profesional_nombre,
                m.numero_matricula
            FROM copig.representantes_tecnicos rt
            INNER JOIN copig.profesionales p ON rt.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON rt.profesional_id = m.profesional_id
            WHERE rt.empresa_id = $1
            ORDER BY p.nombre
        `, [impsaId]);

        console.log(`   ✅ Representantes encontrados: ${representantesResult.rows.length}`);
        
        if (representantesResult.rows.length > 0) {
            console.log(`   📋 DETALLE DE REPRESENTANTES:`);
            representantesResult.rows.forEach((rep, i) => {
                console.log(`      ${i+1}. ${rep.profesional_nombre} (Mat: ${rep.numero_matricula})`);
                console.log(`         Categoría: ${rep.categoria_representacion}, Activo: ${rep.activo}`);
                console.log(`         Inicio: ${rep.fecha_inicio}`);
            });
        } else {
            console.log(`   ❌ NO HAY REPRESENTANTES - PROBLEMA ENCONTRADO!`);
        }

        // 3. Verificar otros empresas que deberían tener representantes
        console.log(`\n3️⃣ VERIFICANDO OTRAS EMPRESAS CON REPRESENTANTES:`);
        
        const otrasEmpresas = [137, 66, 1163]; // IDs de empresas que sabemos que tienen representantes
        
        for (let empresaId of otrasEmpresas) {
            const empresa = await pool.query('SELECT razon_social FROM copig.empresas WHERE id = $1', [empresaId]);
            if (empresa.rows.length > 0) {
                const reps = await pool.query(`
                    SELECT COUNT(*) as total
                    FROM copig.representantes_tecnicos rt
                    WHERE rt.empresa_id = $1
                `, [empresaId]);
                
                console.log(`   • ID ${empresaId}: ${empresa.rows[0].razon_social} → ${reps.rows[0].total} reps`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

testIMPSAAPI();