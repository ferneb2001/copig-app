const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

// Todos los casos del reporte original que generamos
const todosCasosReportados = [
    // AGRONOMÍA
    {matricula: 8763, nombre: 'ABRAHAM, LAURA IRENE', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 10982, nombre: 'ADRIAZOLA, CECILIA ANABEL', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 10394, nombre: 'AGNESE, ALEJANDRO LIONEL', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 10906, nombre: 'AIRASCA, PABLO JAVIER', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 6975, nombre: 'ALMARÁ, SUSANA ELVIRA', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 9113, nombre: 'ALOISIO, SANDRA FABIANA', titulo_oficial: 'LICENCIADO EN ENOLOGIA Y VITICULTURA'},
    {matricula: 6767, nombre: 'ALTAMIRANDA, EDUARDO FLORENCIO', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 6659, nombre: 'AHUMADA, VICTOR HUGO', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 8821, nombre: 'ARANCIBIA, MARIA ANDREA', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 10945, nombre: 'ARAYA, JULIO CESAR', titulo_oficial: 'INGENIERO AGRONOMO'},
    {matricula: 10905, nombre: 'ARCIDIÁCONO, ALEJANDRO GABRIEL', titulo_oficial: 'INGENIERO AGRONOMO'},
    
    // CIVIL
    {matricula: 9106, nombre: 'ABAD, RAMIRO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 5454, nombre: 'ACIAR,CARLOS DANTE PEDRO', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
    {matricula: 6863, nombre: 'ACUÑA,EDUARDO WALTHER.', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 9649, nombre: 'AGOSTINI, JOSE LUIS', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 10024, nombre: 'AGUIRRE, CARLOS ARTURO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 9624, nombre: 'ALBORNOZ, MARCELO ALEJANDRO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 6870, nombre: 'ALDUNATE,CARLOS DANIEL', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 7698, nombre: 'ALMONACID,RICARDO MARIO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 8792, nombre: 'ALVAREZ, HECTOR GUILLERMO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 9676, nombre: 'AMAYA, MARCELO FERNANDO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 9686, nombre: 'AMOROSO, DIEGO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 11063, nombre: 'ANASTASIADIS, JORGE DEMETRIO', titulo_oficial: 'INGENIERO CIVIL'},
    
    // GEOLOGÍA
    {matricula: 8765, nombre: 'AGUILAR, MARIA LUZ', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
    {matricula: 5507, nombre: 'ALONSO,JORGE CRISTOBAL', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
    {matricula: 6866, nombre: 'ALVAREZ,CLAUDIA SUSANA', titulo_oficial: 'GEOLOGO'},
    {matricula: 5575, nombre: 'AUGE,MIGUEL', titulo_oficial: 'GEOLOGO'}
];

async function verificarTodosCasosReportados() {
    try {
        console.log('🔍 VERIFICANDO TODOS LOS CASOS REPORTADOS EN ANÁLISIS ANTERIOR');
        console.log('='.repeat(70));
        console.log('⚠️  REVISANDO SI LOS NOMBRES COINCIDEN Y TÍTULOS SON CORRECTOS');
        console.log('');
        
        let coincidenciasExactas = 0;
        let discrepanciasNombre = 0;
        let discrepanciasTitulo = 0;
        let noEncontrados = 0;
        
        const problemasGraves = [];
        
        for (const caso of todosCasosReportados) {
            console.log(`📋 Mat. ${caso.matricula}: ${caso.nombre}`);
            console.log(`   Título oficial esperado: "${caso.titulo_oficial}"`);
            
            const resultado = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_bd
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [caso.matricula]);
            
            if (resultado.rows.length === 0) {
                console.log(`   ❌ NO ENCONTRADO en BD`);
                noEncontrados++;
            } else {
                const prof = resultado.rows[0];
                console.log(`   BD nombre: "${prof.nombre}"`);
                console.log(`   BD título: "${prof.titulo_bd || 'SIN TÍTULO'}"`);
                
                // Verificar nombre
                const nombreCoincide = prof.nombre.toUpperCase().includes(caso.nombre.toUpperCase().substring(0, 10));
                const tituloCoincide = prof.titulo_bd === caso.titulo_oficial;
                
                if (nombreCoincide && tituloCoincide) {
                    console.log(`   ✅ TODO CORRECTO`);
                    coincidenciasExactas++;
                } else {
                    let problemas = [];
                    
                    if (!nombreCoincide) {
                        console.log(`   ⚠️  NOMBRE DIFERENTE`);
                        problemas.push('NOMBRE_DIFERENTE');
                        discrepanciasNombre++;
                    }
                    
                    if (!tituloCoincide) {
                        console.log(`   ❌ TÍTULO INCORRECTO`);
                        problemas.push('TITULO_INCORRECTO');
                        discrepanciasTitulo++;
                    }
                    
                    problemasGraves.push({
                        matricula: caso.matricula,
                        nombre_esperado: caso.nombre,
                        nombre_bd: prof.nombre,
                        titulo_esperado: caso.titulo_oficial,
                        titulo_bd: prof.titulo_bd || 'SIN TÍTULO',
                        problemas: problemas
                    });
                }
            }
            
            console.log('');
        }
        
        console.log('='.repeat(70));
        console.log('📊 RESUMEN VERIFICACIÓN COMPLETA:');
        console.log(`📋 Total casos verificados: ${todosCasosReportados.length}`);
        console.log(`✅ Coincidencias exactas (nombre + título): ${coincidenciasExactas}`);
        console.log(`⚠️  Discrepancias de nombre: ${discrepanciasNombre}`);
        console.log(`❌ Discrepancias de título: ${discrepanciasTitulo}`);
        console.log(`❌ No encontrados: ${noEncontrados}`);
        
        if (problemasGraves.length > 0) {
            console.log('');
            console.log('🚨 PROBLEMAS GRAVES DETECTADOS:');
            
            const soloTitulos = problemasGraves.filter(p => p.problemas.includes('TITULO_INCORRECTO') && !p.problemas.includes('NOMBRE_DIFERENTE'));
            const soloNombres = problemasGraves.filter(p => p.problemas.includes('NOMBRE_DIFERENTE') && !p.problemas.includes('TITULO_INCORRECTO'));
            const ambos = problemasGraves.filter(p => p.problemas.includes('NOMBRE_DIFERENTE') && p.problemas.includes('TITULO_INCORRECTO'));
            
            if (soloTitulos.length > 0) {
                console.log(`\\n📋 ${soloTitulos.length} CASOS CON TÍTULO INCORRECTO (pero nombre correcto):`);
                soloTitulos.slice(0, 5).forEach(caso => {
                    console.log(`   Mat. ${caso.matricula}: "${caso.titulo_bd}" → debería ser "${caso.titulo_esperado}"`);
                });
            }
            
            if (soloNombres.length > 0) {
                console.log(`\\n👤 ${soloNombres.length} CASOS CON NOMBRE DIFERENTE (posibles duplicados de matrícula):`);
                soloNombres.slice(0, 5).forEach(caso => {
                    console.log(`   Mat. ${caso.matricula}: "${caso.nombre_bd}" vs esperado "${caso.nombre_esperado}"`);
                });
            }
            
            if (ambos.length > 0) {
                console.log(`\\n🚨 ${ambos.length} CASOS CON NOMBRE Y TÍTULO INCORRECTOS:`);
                ambos.slice(0, 3).forEach(caso => {
                    console.log(`   Mat. ${caso.matricula}:`);
                    console.log(`      BD: "${caso.nombre_bd}" - "${caso.titulo_bd}"`);
                    console.log(`      Esperado: "${caso.nombre_esperado}" - "${caso.titulo_esperado}"`);
                });
            }
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

verificarTodosCasosReportados();