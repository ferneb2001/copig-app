/**
 * INVESTIGACIÓN PROFUNDA DE REPRESENTANTES TÉCNICOS
 * ¿Por qué solo 29 externos? ¿Por qué 2,429 empresas "inexistentes"?
 * Análisis detallado de todos los casos
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const Parser = require('node-dbf').default;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

console.log('🔍 INVESTIGACIÓN PROFUNDA - REPRESENTANTES TÉCNICOS');
console.log('❓ ¿Por qué solo 29 externos y 2,429 empresas inexistentes?');
console.log('🎯 Análisis detallado de todos los escenarios');
console.log('='.repeat(80));

// Función para leer archivo DBF
async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        const parser = new Parser(filePath);
        const records = [];
        
        parser.on('record', (record) => records.push(record));
        parser.on('end', () => resolve(records));
        parser.on('error', (error) => reject(error));
        parser.parse();
    });
}

async function deepInvestigation() {
    try {
        console.log('\n1️⃣ CARGANDO DATOS...');
        
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión a BD exitosa');

        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPRTCOS.DBF');
        const representantes = await readDBFFile(dbfPath);
        console.log(`✅ SPRTCOS.DBF cargado: ${representantes.length} registros`);

        console.log('\n2️⃣ ANÁLISIS DETALLADO DE EMPRESAS...');
        
        // Obtener rangos de IDs de empresas existentes
        const empresaRanges = await pool.query(`
            SELECT 
                MIN(id) as min_id, 
                MAX(id) as max_id, 
                COUNT(*) as total_empresas
            FROM copig.empresas
        `);
        
        const minId = empresaRanges.rows[0].min_id;
        const maxId = empresaRanges.rows[0].max_id;
        const totalEmpresas = empresaRanges.rows[0].total_empresas;
        
        console.log(`📊 EMPRESAS EN BD: ${totalEmpresas} empresas`);
        console.log(`📊 RANGO IDs: ${minId} - ${maxId}`);

        // Obtener todos los IDs de empresas que existen
        const existingIds = await pool.query('SELECT id FROM copig.empresas ORDER BY id');
        const existingIdsSet = new Set(existingIds.rows.map(row => row.id));
        
        console.log('\n3️⃣ ANÁLISIS DE IDs EN SPRTCOS...');
        
        let empresasFueraRango = 0;
        let empresasDentroRangoInexistentes = 0;
        let empresasExistentes = 0;
        let idsAnalyzed = new Set();
        let samplesOutOfRange = [];
        let samplesInRangeButMissing = [];
        
        // Analizar IDs de empresas en SPRTCOS
        representantes.forEach(rep => {
            if (rep.EMPRESA && !idsAnalyzed.has(rep.EMPRESA)) {
                idsAnalyzed.add(rep.EMPRESA);
                
                if (rep.EMPRESA < minId || rep.EMPRESA > maxId) {
                    empresasFueraRango++;
                    if (samplesOutOfRange.length < 10) {
                        samplesOutOfRange.push(rep.EMPRESA);
                    }
                } else if (!existingIdsSet.has(rep.EMPRESA)) {
                    empresasDentroRangoInexistentes++;
                    if (samplesInRangeButMissing.length < 10) {
                        samplesInRangeButMissing.push(rep.EMPRESA);
                    }
                } else {
                    empresasExistentes++;
                }
            }
        });

        console.log(`📊 EMPRESAS ÚNICAS EN SPRTCOS: ${idsAnalyzed.size}`);
        console.log(`✅ Empresas existentes: ${empresasExistentes}`);
        console.log(`❌ Empresas fuera de rango: ${empresasFueraRango}`);
        console.log(`❌ Empresas en rango pero inexistentes: ${empresasDentroRangoInexistentes}`);
        
        if (samplesOutOfRange.length > 0) {
            console.log(`📋 Muestras fuera de rango: ${samplesOutOfRange.join(', ')}`);
        }
        if (samplesInRangeButMissing.length > 0) {
            console.log(`📋 Muestras en rango pero inexistentes: ${samplesInRangeButMissing.join(', ')}`);
        }

        console.log('\n4️⃣ ANÁLISIS DETALLADO DE MATRÍCULAS...');
        
        // Obtener estadísticas de matrículas
        const copigMatrStats = await pool.query(`
            SELECT 
                MIN(numero_matricula::integer) as min_mat,
                MAX(numero_matricula::integer) as max_mat,
                COUNT(*) as total_mat
            FROM copig.matriculas
        `);
        
        const extMatrStats = await pool.query(`
            SELECT 
                MIN(numero_matricula) as min_mat,
                MAX(numero_matricula) as max_mat,
                COUNT(*) as total_mat
            FROM copig.matriculas_externas
        `);
        
        console.log(`📊 MATRÍCULAS COPIG: ${copigMatrStats.rows[0].total_mat} (rango: ${copigMatrStats.rows[0].min_mat} - ${copigMatrStats.rows[0].max_mat})`);
        console.log(`📊 MATRÍCULAS EXTERNAS: ${extMatrStats.rows[0].total_mat} (rango: ${extMatrStats.rows[0].min_mat} - ${extMatrStats.rows[0].max_mat})`);

        console.log('\n5️⃣ INVESTIGACIÓN DE CASOS PROBLEMÁTICOS...');
        
        // Analizar los primeros 50 casos "problemáticos"
        let casosProblematicosMuestra = [];
        let contadorCasos = 0;
        
        for (let rep of representantes) {
            if (contadorCasos >= 50) break;
            
            const empresaId = rep.EMPRESA;
            const matricula = rep.MATPROF;
            
            if (!empresaId || !matricula) continue;
            
            // Verificar si la empresa existe
            const empresaExists = existingIdsSet.has(empresaId);
            
            if (!empresaExists) {
                // Verificar si la matrícula existe en COPIG o externos
                const matrCOPIG = await pool.query(
                    'SELECT COUNT(*) as count FROM copig.matriculas WHERE numero_matricula = $1',
                    [matricula.toString()]
                );
                
                const matrExt = await pool.query(
                    'SELECT COUNT(*) as count FROM copig.matriculas_externas WHERE numero_matricula = $1',
                    [matricula]
                );
                
                casosProblematicosMuestra.push({
                    empresa: empresaId,
                    matricula: matricula,
                    categoria: rep.CATEGOR,
                    tieneMatrCOPIG: matrCOPIG.rows[0].count > 0,
                    tieneMatrExt: matrExt.rows[0].count > 0
                });
                
                contadorCasos++;
            }
        }
        
        console.log(`📋 MUESTRA DE CASOS PROBLEMÁTICOS (primeros 50):`);
        let tienenMatriculaEnAlgunLado = 0;
        let soloMatrCOPIG = 0;
        let soloMatrExt = 0;
        let noTienenMatricula = 0;
        
        casosProblematicosMuestra.forEach((caso, index) => {
            if (index < 10) { // Mostrar solo los primeros 10
                console.log(`   ${index + 1}. Empresa: ${caso.empresa}, Mat: ${caso.matricula}, Cat: ${caso.categoria} → COPIG: ${caso.tieneMatrCOPIG ? '✅' : '❌'}, Ext: ${caso.tieneMatrExt ? '✅' : '❌'}`);
            }
            
            if (caso.tieneMatrCOPIG && caso.tieneMatrExt) {
                tienenMatriculaEnAlgunLado++;
            } else if (caso.tieneMatrCOPIG) {
                soloMatrCOPIG++;
                tienenMatriculaEnAlgunLado++;
            } else if (caso.tieneMatrExt) {
                soloMatrExt++;
                tienenMatriculaEnAlgunLado++;
            } else {
                noTienenMatricula++;
            }
        });
        
        console.log('\n📊 ESTADÍSTICAS DE CASOS PROBLEMÁTICOS:');
        console.log(`   ✅ Con matrícula en COPIG solamente: ${soloMatrCOPIG}`);
        console.log(`   ✅ Con matrícula en externos solamente: ${soloMatrExt}`);
        console.log(`   ❌ Sin matrícula en ningún lado: ${noTienenMatricula}`);
        console.log(`   📊 Total con matrícula válida: ${tienenMatriculaEnAlgunLado} de ${casosProblematicosMuestra.length}`);

        console.log('\n🎯 CONCLUSIONES PRELIMINARES:');
        
        if (empresasFueraRango > 0) {
            console.log(`   🔍 HAY ${empresasFueraRango} EMPRESAS CON IDs FUERA DEL RANGO ACTUAL`);
            console.log(`   💡 Podrían ser empresas históricas o de otro sistema`);
        }
        
        if (tienenMatriculaEnAlgunLado > (casosProblematicosMuestra.length * 0.5)) {
            console.log(`   🎯 MUCHOS CASOS "PROBLEMÁTICOS" TIENEN MATRÍCULAS VÁLIDAS`);
            console.log(`   💡 El problema principal son las EMPRESAS FALTANTES, no las matrículas`);
        }
        
        console.log('\n❓ PREGUNTAS PARA FERNANDO/PEÑALOZA:');
        console.log('   1. ¿Las empresas con IDs fuera del rango son empresas históricas/inactivas?');
        console.log('   2. ¿Deberíamos importar estas empresas faltantes?');
        console.log('   3. ¿O solo procesar representantes de empresas existentes?');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
    } finally {
        await pool.end();
    }
}

deepInvestigation();