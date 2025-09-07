/**
 * ANÁLISIS DEL PROBLEMA DE MAPEO
 * Ver por qué no se importan los representantes
 */

const Parser = require('node-dbf').default;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analizarProblema() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISIS DEL PROBLEMA DE MAPEO');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // 1. Leer EMPSDF
    const empresasDBF = await leerEMPSDF();
    console.log(`📊 EMPSDF.DBF: ${empresasDBF.length} empresas`);
    console.log(`   Con CUIT: ${empresasDBF.filter(e => e.cuit).length}`);
    console.log(`   Sin CUIT: ${empresasDBF.filter(e => !e.cuit).length}\n`);
    
    // 2. Leer empresas de BD
    const empresasResult = await pool.query('SELECT id, razon_social, cuit FROM copig.empresas ORDER BY id LIMIT 20');
    console.log('📊 EMPRESAS EN BD (primeras 20):');
    console.log('─────────────────────────────────────────');
    empresasResult.rows.forEach(e => {
        console.log(`ID ${e.id}: ${e.razon_social.substring(0, 40)} | CUIT: ${e.cuit || 'SIN CUIT'}`);
    });
    
    // 3. Buscar IMPSA en ambos lados
    console.log('\n🎯 BUSCANDO IMPSA:');
    console.log('─────────────────────────────────────────');
    
    const impsaDBF = empresasDBF.find(e => e.nombre && e.nombre.includes('IMPSA'));
    if (impsaDBF) {
        console.log(`DBF: ID=${impsaDBF.id}, CUIT=${impsaDBF.cuit}, Nombre=${impsaDBF.nombre}`);
    }
    
    const impsaBD = await pool.query("SELECT * FROM copig.empresas WHERE razon_social ILIKE '%IMPSA%'");
    if (impsaBD.rows.length > 0) {
        const e = impsaBD.rows[0];
        console.log(`BD:  ID=${e.id}, CUIT=${e.cuit}, Nombre=${e.razon_social}`);
    }
    
    // 4. Ver IDs de empresa en SPRTCOS
    const idsEnSPRTCOS = await leerIDsSPRTCOS();
    console.log(`\n📊 SPRTCOS.DBF:`);
    console.log('─────────────────────────────────────────');
    console.log(`IDs únicos de empresa: ${idsEnSPRTCOS.size}`);
    console.log(`Primeros 20 IDs: ${Array.from(idsEnSPRTCOS).slice(0, 20).join(', ')}`);
    
    // 5. Ver cuántos IDs de SPRTCOS están en EMPSDF
    let coincidencias = 0;
    const mapeoDBF = {};
    empresasDBF.forEach(e => {
        if (e.id) mapeoDBF[e.id] = e.cuit;
    });
    
    idsEnSPRTCOS.forEach(id => {
        if (mapeoDBF[id]) coincidencias++;
    });
    
    console.log(`\n✅ Coincidencias ID SPRTCOS → EMPSDF: ${coincidencias} de ${idsEnSPRTCOS.size}`);
    
    await pool.end();
}

function leerEMPSDF() {
    return new Promise((resolve) => {
        const archivo = 'C:\\copig-app\\adminsp\\COPIG\\EMPSDF.DBF';
        const parser = new Parser(archivo);
        const empresas = [];
        
        parser.on('record', (record) => {
            empresas.push({
                id: record.NUMERO ? record.NUMERO.toString() : null,
                cuit: record.ECUIT ? record.ECUIT.toString().trim() : null,
                nombre: record.NOMBRE ? record.NOMBRE.toString().trim() : null
            });
        });
        
        parser.on('end', () => resolve(empresas));
        parser.parse();
    });
}

function leerIDsSPRTCOS() {
    return new Promise((resolve) => {
        const archivo = 'C:\\copig-app\\adminsp\\COPIG\\SPRTCOS.DBF';
        const parser = new Parser(archivo);
        const ids = new Set();
        
        parser.on('record', (record) => {
            if (record.EMPRESA) {
                ids.add(record.EMPRESA.toString());
            }
        });
        
        parser.on('end', () => resolve(ids));
        parser.parse();
    });
}

analizarProblema();