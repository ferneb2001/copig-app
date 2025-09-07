const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function analizarProblemaMasivo() {
    try {
        console.log('🔍 ANÁLISIS DETALLADO DEL PROBLEMA DE TÍTULOS MASIVOS');
        console.log('='.repeat(70));
        
        // 1. Títulos más asignados (sospechosos)
        console.log('📊 1. TÍTULOS CON MÁS PROFESIONALES ASIGNADOS:');
        const masAsignados = await pool.query(`
            SELECT t.id, t.descripcion, COUNT(*) as cantidad
            FROM copig.matriculas m
            JOIN copig.titulos t ON m.titulo_id = t.id
            GROUP BY t.id, t.descripcion
            ORDER BY COUNT(*) DESC
            LIMIT 15
        `);
        
        masAsignados.rows.forEach((titulo, index) => {
            const marcador = titulo.cantidad > 100 ? '🚨' : titulo.cantidad > 50 ? '⚠️' : '✅';
            console.log(`${(index+1).toString().padStart(2)}. ${marcador} ${titulo.cantidad.toString().padStart(4)} profesionales: "${titulo.descripcion}" (ID: ${titulo.id})`);
        });
        
        // 2. Profesionales sin título
        console.log('\\n📊 2. PROFESIONALES SIN TÍTULO:');
        const sinTitulo = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM copig.matriculas m
            WHERE m.titulo_id IS NULL
        `);
        console.log(`❌ ${sinTitulo.rows[0].cantidad} profesionales sin título asignado`);
        
        // 3. Análisis de casos problemáticos específicos
        console.log('\\n🔍 3. CASOS PROBLEMÁTICOS DETECTADOS EN ANÁLISIS ANTERIOR:');
        
        const casosProblematicos = [
            {matricula: 8763, nombre: 'ABRAHAM, LAURA IRENE', titulo_esperado: 'INGENIERO AGRONOMO', categoria: 'agronomia'},
            {matricula: 5454, nombre: 'ACIAR,CARLOS DANTE PEDRO', titulo_esperado: 'INGENIERO EN CONSTRUCCIONES', categoria: 'civil'},
            {matricula: 9106, nombre: 'ABAD, RAMIRO', titulo_esperado: 'INGENIERO CIVIL', categoria: 'civil'},
            {matricula: 8765, nombre: 'AGUILAR, MARIA LUZ', titulo_esperado: 'LICENCIADO EN CCIAS.GEOLOGICAS', categoria: 'geologia'}
        ];
        
        for (const caso of casosProblematicos) {
            const resultado = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_actual, t.id as titulo_id
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [caso.matricula]);
            
            if (resultado.rows.length > 0) {
                const prof = resultado.rows[0];
                console.log(`\\n   Mat. ${caso.matricula}: ${prof.nombre}`);
                console.log(`     Título actual: "${prof.titulo_actual || 'SIN TÍTULO'}" (ID: ${prof.titulo_id || 'NULL'})`);
                console.log(`     Título esperado: "${caso.titulo_esperado}"`);
                
                // Buscar si existe el título esperado en BD
                const tituloEsperado = await pool.query(`
                    SELECT id, descripcion FROM copig.titulos 
                    WHERE descripcion ILIKE $1 OR descripcion ILIKE $2
                `, [`%${caso.titulo_esperado}%`, `%${caso.titulo_esperado.substring(0, 15)}%`]);
                
                if (tituloEsperado.rows.length > 0) {
                    console.log(`     ✅ Título esperado EXISTE: "${tituloEsperado.rows[0].descripcion}" (ID: ${tituloEsperado.rows[0].id})`);
                } else {
                    console.log(`     ❌ Título esperado NO EXISTE en BD`);
                }
            } else {
                console.log(`\\n   Mat. ${caso.matricula}: ❌ NO ENCONTRADO`);
            }
        }
        
        // 4. Buscar títulos correctos en BD
        console.log('\\n🔍 4. TÍTULOS CORRECTOS DISPONIBLES EN BD:');
        const titulosCorrectos = await pool.query(`
            SELECT id, descripcion FROM copig.titulos
            WHERE descripcion ILIKE '%AGRONOMO%' 
               OR descripcion ILIKE '%CIVIL%'
               OR descripcion ILIKE '%CONSTRUCCIONES%'
               OR descripcion ILIKE '%GEOLOGICAS%'
               OR descripcion ILIKE '%GEOLOGO%'
            ORDER BY descripcion
        `);
        
        titulosCorrectos.rows.forEach(titulo => {
            console.log(`   ID ${titulo.id.toString().padStart(3)}: ${titulo.descripcion}`);
        });
        
        // 5. Patrón del problema
        console.log('\\n🎯 5. PATRÓN DEL PROBLEMA IDENTIFICADO:');
        console.log('   📊 Títulos con asignación masiva sospechosa:');
        const sospechosos = masAsignados.rows.filter(t => t.cantidad > 100);
        sospechosos.forEach(titulo => {
            console.log(`     • "${titulo.descripcion}": ${titulo.cantidad} profesionales (ID: ${titulo.id})`);
        });
        
        console.log('\\n💡 CONCLUSIÓN:');
        console.log('   🚨 Hubo una IMPORTACIÓN MASIVA INCORRECTA que asignó:');
        console.log('      - Ingenieros agrónomos → "ING.EN CONSTRUCC. MECANICA"');
        console.log('      - Ingenieros civiles → "ING.EN VIAS DE COMUNICACION"');
        console.log('      - Geólogos → "INGENIERO HIDRAULICO" o SIN TÍTULO');
        console.log('');
        console.log('   ✅ SOLUCIÓN: Corrección masiva basada en especialidad real vs oficial');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

analizarProblemaMasivo();