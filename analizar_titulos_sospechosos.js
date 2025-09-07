const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function analizarTitulosSospechosos() {
    try {
        console.log('🔍 Analizando patrones sospechosos en títulos...');
        
        // 1. Analizar distribución actual vs esperada
        console.log('\n📊 DISTRIBUCIÓN ACTUAL:');
        const distribucion = await pool.query(`
            SELECT t.descripcion, COUNT(*) as cantidad,
                   ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as porcentaje
            FROM copig.matriculas m
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE m.titulo_id IS NOT NULL
            GROUP BY t.descripcion
            ORDER BY COUNT(*) DESC
        `);
        
        distribucion.rows.forEach(item => {
            console.log(`${item.cantidad.toString().padStart(4)} (${item.porcentaje}%): ${item.descripcion}`);
        });
        
        // 2. Buscar patrones en los nombres que sugieran títulos específicos
        console.log('\n🔍 ANÁLISIS DE NOMBRES PARA "INGENIERO HIDRAULICO":');
        
        const hidraulicos = await pool.query(`
            SELECT p.nombre, m.numero_matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE t.descripcion = 'INGENIERO HIDRAULICO'
            ORDER BY p.nombre
        `);
        
        // Analizar patrones en los nombres
        let patrones = {
            construccion: [],
            mecanico: [],
            civil: [],
            industrial: [],
            otros: []
        };
        
        hidraulicos.rows.forEach(prof => {
            const nombre = prof.nombre.toUpperCase();
            if (nombre.includes('CONSTRUCCION') || nombre.includes('CIVIL')) {
                patrones.construccion.push(prof);
            } else if (nombre.includes('MECANICO') || nombre.includes('MECANIC')) {
                patrones.mecanico.push(prof);
            } else if (nombre.includes('INDUSTRIAL')) {
                patrones.industrial.push(prof);
            } else {
                patrones.otros.push(prof);
            }
        });
        
        console.log(`Total profesionales como "INGENIERO HIDRAULICO": ${hidraulicos.rows.length}`);
        console.log(`- Posibles construcción/civil: ${patrones.construccion.length}`);
        console.log(`- Posibles mecánico: ${patrones.mecanico.length}`);
        console.log(`- Posibles industrial: ${patrones.industrial.length}`);
        console.log(`- Otros: ${patrones.otros.length}`);
        
        // 3. Mostrar casos específicos que podrían estar mal
        if (patrones.construccion.length > 0) {
            console.log('\n🚨 CASOS SOSPECHOSOS (podrían ser ingenieros en construcciones):');
            patrones.construccion.slice(0, 10).forEach(prof => {
                console.log(`  Mat. ${prof.numero_matricula}: ${prof.nombre}`);
            });
        }
        
        // 4. Verificar distribución original en archivos DBF
        console.log('\n💡 RECOMENDACIONES:');
        console.log('1. Verificar títulos en archivos DBF originales del Ing. Peñaloza');
        console.log('2. Los títulos podrían haberse importado con códigos incorrectos');
        console.log('3. Crear script de corrección masiva basado en archivos fuente');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

analizarTitulosSospechosos();