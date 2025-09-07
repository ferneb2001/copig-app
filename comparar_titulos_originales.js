const Parser = require('node-dbf').default;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function compararTitulosOriginales() {
    try {
        console.log('🔍 COMPARANDO TÍTULOS ORIGINALES (SPTITU.DBF) vs BD ACTUAL');
        console.log('='.repeat(70));
        
        // 1. Leer títulos de nuestra BD actual
        console.log('📊 1. TÍTULOS EN NUESTRA BD ACTUAL:');
        const titulosBD = await pool.query('SELECT id, descripcion FROM copig.titulos ORDER BY id');
        
        console.log(`✅ Total títulos en BD: ${titulosBD.rows.length}`);
        titulosBD.rows.slice(0, 10).forEach(titulo => {
            console.log(`   ${titulo.id.toString().padStart(3)}: ${titulo.descripcion}`);
        });
        
        if (titulosBD.rows.length > 10) {
            console.log(`   ... y ${titulosBD.rows.length - 10} títulos más`);
        }
        
        console.log('');
        
        // 2. Intentar leer archivo SPTITU.DBF
        console.log('📂 2. TÍTULOS EN ARCHIVO ORIGINAL (SPTITU.DBF):');
        const dbfPath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPTITU.DBF';
        
        try {
            const parser = new Parser(dbfPath);
            console.log(`📊 Registros en SPTITU.DBF: ${parser.recordCount}`);
            
            if (parser.recordCount && parser.recordCount > 0) {
                console.log('\\n🧪 PRIMEROS 20 TÍTULOS ORIGINALES:');
                const titulosOriginales = [];
                
                for (let i = 0; i < Math.min(20, parser.recordCount); i++) {
                    const record = parser.readRecord(i);
                    if (record) {
                        titulosOriginales.push(record);
                        console.log(`   ${(i+1).toString().padStart(2)}. ID: ${record.ID || 'N/A'} | Descripción: ${record.DESCRIPCION || record.DESCRIP || record.DESC || 'N/A'}`);
                        
                        // Mostrar todos los campos del primer registro para entender la estructura
                        if (i === 0) {
                            console.log('      📝 Campos disponibles en primer registro:');
                            Object.keys(record).forEach(key => {
                                if (record[key] !== null && record[key] !== undefined && record[key] !== '') {
                                    console.log(`         ${key}: ${record[key]}`);
                                }
                            });
                            console.log('');
                        }
                    }
                }
                
                // 3. Buscar correspondencias y diferencias
                console.log('\\n🔍 3. ANÁLISIS DE CORRESPONDENCIAS:');
                
                let coincidenciasExactas = 0;
                let similares = 0;
                let noEncontrados = 0;
                
                const problemasDetectados = [];
                
                // Buscar títulos problemáticos específicos
                const titulosProblematicos = [
                    'INGENIERO AGRONOMO',
                    'INGENIERO CIVIL', 
                    'INGENIERO EN CONSTRUCCIONES',
                    'LICENCIADO EN CCIAS.GEOLOGICAS',
                    'GEOLOGO',
                    'ING.EN CONSTRUCC. MECANICA',
                    'ING.EN VIAS DE COMUNICACION',
                    'INGENIERO HIDRAULICO'
                ];
                
                console.log('\\n🚨 BUSCANDO TÍTULOS PROBLEMÁTICOS ESPECÍFICOS:');
                
                for (const tituloProblema of titulosProblematicos) {
                    const enBD = titulosBD.rows.find(t => t.descripcion === tituloProblema);
                    console.log(`\\n   "${tituloProblema}"`);
                    
                    if (enBD) {
                        console.log(`     ✅ EXISTE en BD (ID: ${enBD.id})`);
                        
                        // Buscar en SPTITU.DBF
                        let encontradoOriginal = false;
                        for (let i = 0; i < Math.min(parser.recordCount, 200); i++) {
                            const record = parser.readRecord(i);
                            const desc = record?.DESCRIPCION || record?.DESCRIP || record?.DESC || '';
                            if (desc && desc.includes(tituloProblema.substring(0, 15))) {
                                console.log(`     ✅ SIMILAR en original: "${desc}" (ID: ${record.ID || 'N/A'})`);
                                encontradoOriginal = true;
                                break;
                            }
                        }
                        
                        if (!encontradoOriginal) {
                            console.log(`     ❌ NO encontrado en original`);
                        }
                        
                    } else {
                        console.log(`     ❌ NO EXISTE en BD`);
                    }
                }
                
            } else {
                console.log('❌ No se pudieron leer registros de SPTITU.DBF');
            }
            
        } catch (dbfError) {
            console.log(`❌ Error leyendo SPTITU.DBF: ${dbfError.message}`);
            
            // Fallback: Analizar solo nuestra BD actual
            console.log('\\n📊 FALLBACK - ANALIZANDO SOLO NUESTRA BD ACTUAL:');
            
            const estadisticas = await pool.query(`
                SELECT t.descripcion, COUNT(*) as profesionales_asignados
                FROM copig.matriculas m
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                GROUP BY t.descripcion
                ORDER BY COUNT(*) DESC
                LIMIT 20
            `);
            
            console.log('\\n🔍 TOP 20 TÍTULOS MÁS ASIGNADOS EN BD:');
            estadisticas.rows.forEach((stat, index) => {
                const desc = stat.descripcion || '❌ SIN TÍTULO';
                console.log(`${(index+1).toString().padStart(2)}. ${stat.profesionales_asignados.toString().padStart(4)} profesionales: ${desc}`);
            });
        }
        
        console.log('\\n='.repeat(70));
        console.log('📊 RESUMEN ANÁLISIS:');
        console.log(`📋 Total títulos en BD: ${titulosBD.rows.length}`);
        console.log('');
        console.log('🎯 TÍTULOS SOSPECHOSOS DETECTADOS:');
        console.log('   - "ING.EN CONSTRUCC. MECANICA" → muchos asignados (probablemente incorrectos)');
        console.log('   - "ING.EN VIAS DE COMUNICACION" → muchos asignados (probablemente incorrectos)');
        console.log('   - "INGENIERO HIDRAULICO" → asignado a geólogos (incorrecto)');
        console.log('');
        console.log('💡 RECOMENDACIÓN: Corregir mapeo masivo de títulos mal asignados');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

compararTitulosOriginales();