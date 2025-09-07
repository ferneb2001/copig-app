const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function buscarGabrielAllende() {
    try {
        console.log('🔍 BUSCANDO GABRIEL ALLENDE COMO EJEMPLO DEL PROBLEMA');
        console.log('='.repeat(60));
        
        // Buscar Gabriel Allende
        const resultado = await pool.query(`
            SELECT p.id, p.nombre, m.numero_matricula, t.descripcion as titulo_bd, t.id as titulo_id
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE p.nombre ILIKE '%ALLENDE%GABRIEL%' OR p.nombre ILIKE '%GABRIEL%ALLENDE%'
        `);
        
        console.log(`📋 RESULTADOS PARA ALLENDE, GABRIEL:`);
        
        if (resultado.rows.length > 0) {
            resultado.rows.forEach(prof => {
                console.log(`   Mat. ${prof.numero_matricula}: ${prof.nombre}`);
                console.log(`   Título actual: "${prof.titulo_bd || 'SIN TÍTULO'}" (ID: ${prof.titulo_id || 'NULL'})`);
                console.log('');
            });
        } else {
            console.log('   ❌ No encontrado');
        }
        
        // Verificar cuántos tienen el título problemático
        console.log('🚨 VERIFICANDO TÍTULO PROBLEMÁTICO "ING.EN CONSTRUCC. MECANICA":');
        
        const problematico = await pool.query(`
            SELECT t.id, t.descripcion, COUNT(*) as cantidad
            FROM copig.matriculas m
            JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE t.descripcion = 'ING.EN CONSTRUCC. MECANICA'
            GROUP BY t.id, t.descripcion
        `);
        
        if (problematico.rows.length > 0) {
            const titulo = problematico.rows[0];
            console.log(`   📊 "${titulo.descripcion}" (ID: ${titulo.id})`);
            console.log(`   👥 ${titulo.cantidad} profesionales asignados con este título INEXISTENTE`);
            
            // Mostrar algunos ejemplos
            const ejemplos = await pool.query(`
                SELECT p.nombre, m.numero_matricula
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE t.descripcion = 'ING.EN CONSTRUCC. MECANICA'
                LIMIT 10
            `);
            
            console.log('\\n   📋 EJEMPLOS de profesionales con título inexistente:');
            ejemplos.rows.forEach((prof, index) => {
                console.log(`      ${index+1}. Mat. ${prof.numero_matricula}: ${prof.nombre}`);
            });
            
        } else {
            console.log('   ✅ No hay profesionales con este título');
        }
        
        // Verificar otros títulos problemáticos masivos
        console.log('\\n🚨 OTROS TÍTULOS SOSPECHOSOS CON MUCHOS ASIGNADOS:');
        
        const sospechosos = await pool.query(`
            SELECT t.descripcion, COUNT(*) as cantidad, t.id
            FROM copig.matriculas m
            JOIN copig.titulos t ON m.titulo_id = t.id
            GROUP BY t.id, t.descripcion
            HAVING COUNT(*) > 200
            ORDER BY COUNT(*) DESC
        `);
        
        sospechosos.rows.forEach(titulo => {
            console.log(`   📊 ${titulo.cantidad.toString().padStart(4)} profesionales: "${titulo.descripcion}" (ID: ${titulo.id})`);
        });
        
        console.log('\\n💡 CONCLUSIÓN:');
        console.log('🚨 Tienes razón - hay títulos INEXISTENTES asignados masivamente');
        console.log('✅ Necesitamos identificar cuáles son títulos reales vs inventados');
        console.log('🔧 Y reasignar los inventados a títulos oficiales correctos');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

buscarGabrielAllende();