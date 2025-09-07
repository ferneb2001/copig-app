const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

// Títulos EXACTOS según documentos oficiales del COPIG
const titulosOficialesExactos = {
    // AGRONOMÍA - según PDF oficial
    'INGENIERO AGRONOMO': 'INGENIERO AGRONOMO',
    'LICENCIADO EN BROMATOLOGIA': 'LICENCIADO EN BROMATOLOGIA',
    'LICENCIADO EN ENOLOGIA Y VITICULTURA': 'LICENCIADO EN ENOLOGIA Y VITICULTURA',
    
    // INGENIERÍA CIVIL - según PDF oficial
    'INGENIERO CIVIL': 'INGENIERO CIVIL',
    'INGENIERO EN CONSTRUCCIONES': 'INGENIERO EN CONSTRUCCIONES',
    
    // GEOLOGÍA - según PDF oficial
    'LICENCIADO EN CCIAS.GEOLOGICAS': 'LICENCIADO EN CCIAS.GEOLOGICAS',
    'GEOLOGO': 'GEOLOGO',
    
    // ESPECIALIZADA - según PDF oficial
    'INGENIERO ELECTRICISTA': 'INGENIERO ELECTRICISTA',
    'INGENIERO INDUSTRIAL': 'INGENIERO INDUSTRIAL',
    'INGENIERO QUIMICO': 'INGENIERO QUIMICO',
    'INGENIERO EN ALIMENTOS': 'INGENIERO EN ALIMENTOS',
    'INGENIERO ELECTRONICO': 'INGENIERO ELECTRONICO',
    'INGENIERO MECANICO': 'INGENIERO MECANICO',
    'INGENIERO EN PETROLEO': 'INGENIERO EN PETROLEO',
    'INGENIERO EN MINAS': 'INGENIERO EN MINAS'
};

async function revisarTitulosExactosOficiales() {
    try {
        console.log('🔍 REVISANDO TÍTULOS EXACTOS: OFICIAL vs BD ACTUAL');
        console.log('='.repeat(70));
        
        console.log('📋 TÍTULOS OFICIALES DEL COPIG vs NUESTROS TÍTULOS EN BD:');
        console.log('');
        
        let titulosCorrectos = 0;
        let titulosFaltantes = 0;
        let titulosIncorrectos = 0;
        
        const problemas = [];
        
        for (const [tituloOficial, tituloEsperado] of Object.entries(titulosOficialesExactos)) {
            // Buscar título exacto en BD
            const exacto = await pool.query(`
                SELECT id, descripcion FROM copig.titulos 
                WHERE descripcion = $1
            `, [tituloOficial]);
            
            console.log(`📄 "${tituloOficial}"`);
            
            if (exacto.rows.length > 0) {
                console.log(`   ✅ EXISTE EXACTO: ID ${exacto.rows[0].id}`);
                titulosCorrectos++;
            } else {
                // Buscar similares
                const similares = await pool.query(`
                    SELECT id, descripcion FROM copig.titulos 
                    WHERE descripcion ILIKE $1 
                    ORDER BY descripcion
                    LIMIT 5
                `, [`%${tituloOficial.substring(0, 15)}%`]);
                
                if (similares.rows.length > 0) {
                    console.log(`   ⚠️  NO EXACTO, pero similares:`);
                    similares.rows.forEach(similar => {
                        console.log(`      ID ${similar.id}: "${similar.descripcion}"`);
                    });
                    titulosIncorrectos++;
                    
                    problemas.push({
                        oficial: tituloOficial,
                        similares: similares.rows
                    });
                } else {
                    console.log(`   ❌ NO EXISTE (ni similares)`);
                    titulosFaltantes++;
                    
                    problemas.push({
                        oficial: tituloOficial,
                        similares: []
                    });
                }
            }
            console.log('');
        }
        
        // Verificar casos específicos problemáticos
        console.log('🚨 CASOS ESPECÍFICOS VERIFICADOS:');
        
        const casosVerificar = [
            {matricula: 8763, nombre: 'ABRAHAM, LAURA IRENE', titulo_oficial: 'INGENIERO AGRONOMO'},
            {matricula: 5454, nombre: 'ACIAR,CARLOS DANTE PEDRO', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
            {matricula: 9106, nombre: 'ABAD, RAMIRO', titulo_oficial: 'INGENIERO CIVIL'},
            {matricula: 8765, nombre: 'AGUILAR, MARIA LUZ', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'}
        ];
        
        for (const caso of casosVerificar) {
            const actual = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_bd
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [caso.matricula]);
            
            if (actual.rows.length > 0) {
                const prof = actual.rows[0];
                const coincideExacto = prof.titulo_bd === caso.titulo_oficial;
                
                console.log(`Mat. ${caso.matricula}: ${caso.nombre}`);
                console.log(`   BD actual: "${prof.titulo_bd || 'SIN TÍTULO'}"`);
                console.log(`   Oficial: "${caso.titulo_oficial}"`);
                console.log(`   ${coincideExacto ? '✅ COINCIDE EXACTO' : '❌ NO COINCIDE'}`);
                console.log('');
            }
        }
        
        console.log('='.repeat(70));
        console.log('📊 RESUMEN DE TÍTULOS OFICIALES:');
        console.log(`✅ Títulos exactos correctos: ${titulosCorrectos}`);
        console.log(`⚠️  Títulos con diferencias: ${titulosIncorrectos}`);
        console.log(`❌ Títulos faltantes: ${titulosFaltantes}`);
        console.log(`📋 Total oficiales verificados: ${Object.keys(titulosOficialesExactos).length}`);
        
        if (problemas.length > 0) {
            console.log('');
            console.log('🔧 PROBLEMAS DETECTADOS QUE NECESITAN CORRECCIÓN:');
            problemas.forEach((problema, index) => {
                console.log(`${index + 1}. OFICIAL: "${problema.oficial}"`);
                if (problema.similares.length > 0) {
                    console.log(`   Usamos erróneamente: "${problema.similares[0].descripcion}" (ID: ${problema.similares[0].id})`);
                } else {
                    console.log(`   FALTA CREAR este título en BD`);
                }
                console.log('');
            });
        }
        
        console.log('💡 RECOMENDACIÓN:');
        if (titulosIncorrectos > 0 || titulosFaltantes > 0) {
            console.log('🚨 HAY DISCREPANCIAS IMPORTANTES entre títulos oficiales y BD');
            console.log('✅ Necesitamos crear/corregir títulos para que coincidan EXACTAMENTE');
        } else {
            console.log('✅ Todos los títulos oficiales coinciden exactamente con BD');
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

revisarTitulosExactosOficiales();