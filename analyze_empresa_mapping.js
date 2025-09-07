/**
 * ANÁLISIS DE MAPEO EMPRESA IDs
 * Para entender la relación entre IDs del DBF y empresas actuales
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

async function analizarMapeo() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISIS DE MAPEO EMPRESA IDs');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const archivo = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRTCOS.DBF';
    
    // Obtener empresas actuales
    const empresasResult = await pool.query(`
        SELECT id, razon_social, cuit 
        FROM copig.empresas 
        ORDER BY id 
        LIMIT 100
    `);
    
    console.log('📊 EMPRESAS EN BD (primeras 20):');
    console.log('─────────────────────────────────────────');
    empresasResult.rows.slice(0, 20).forEach(e => {
        console.log(`ID ${e.id}: ${e.razon_social} (CUIT: ${e.cuit})`);
    });
    
    // Analizar IDs únicos en SPRTCOS
    const parser = new Parser(archivo);
    const empresaIds = new Set();
    const matriculas = new Set();
    
    parser.on('record', (record) => {
        if (record.EMPRESA) {
            empresaIds.add(parseInt(record.EMPRESA));
        }
        if (record.MATPROF) {
            matriculas.add(parseInt(record.MATPROF));
        }
    });
    
    parser.on('end', async () => {
        console.log('\n📈 IDs DE EMPRESA EN SPRTCOS.DBF:');
        console.log('─────────────────────────────────────────');
        const idsOrdenados = Array.from(empresaIds).sort((a, b) => a - b);
        console.log(`Total IDs únicos: ${idsOrdenados.length}`);
        console.log(`Rango: ${idsOrdenados[0]} - ${idsOrdenados[idsOrdenados.length - 1]}`);
        console.log(`Primeros 20 IDs: ${idsOrdenados.slice(0, 20).join(', ')}`);
        
        // Verificar coincidencias
        const empresasEnBD = await pool.query('SELECT id FROM copig.empresas');
        const idsEnBD = new Set(empresasEnBD.rows.map(e => e.id));
        
        let coincidencias = 0;
        idsOrdenados.forEach(id => {
            if (idsEnBD.has(id)) coincidencias++;
        });
        
        console.log(`\n✅ Coincidencias directas: ${coincidencias} de ${idsOrdenados.length}`);
        
        // Buscar archivo de empresas DBF
        console.log('\n💡 CONCLUSIÓN:');
        console.log('─────────────────────────────────────────');
        console.log('Los IDs del archivo SPRTCOS no coinciden con los IDs actuales.');
        console.log('Necesitamos buscar el archivo SPEMPRES.DBF o similar para mapear.');
        console.log('O usar un enfoque diferente basado en CUITs.');
        
        // Verificar matrículas
        const matriculasOrdenadas = Array.from(matriculas).sort((a, b) => a - b);
        console.log('\n📋 MATRÍCULAS EN SPRTCOS:');
        console.log('─────────────────────────────────────────');
        console.log(`Total matrículas únicas: ${matriculasOrdenadas.length}`);
        console.log(`Rango: ${matriculasOrdenadas[0]} - ${matriculasOrdenadas[matriculasOrdenadas.length - 1]}`);
        
        await pool.end();
    });
    
    parser.parse();
}

analizarMapeo();