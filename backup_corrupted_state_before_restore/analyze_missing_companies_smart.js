/**
 * ANÁLISIS INTELIGENTE: Identificar solo empresas que REALMENTE faltan
 * Evitar inflado innecesario de empresas
 */

const { Pool } = require('pg');
const path = require('path');
const Parser = require('node-dbf').default;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

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

async function analyzeMissingCompanies() {
    try {
        console.log('🔍 ANÁLISIS INTELIGENTE - EMPRESAS REALMENTE NECESARIAS');
        console.log('🎯 Objetivo: Identificar solo empresas que faltan para representantes técnicos');
        console.log('='.repeat(80));

        // 1. Obtener empresas actuales en BD
        console.log('\n1️⃣ EMPRESAS ACTUALES EN BASE DE DATOS:');
        const currentCompanies = await pool.query('SELECT id, razon_social FROM copig.empresas ORDER BY id');
        console.log(`   📊 Total empresas actuales: ${currentCompanies.rows.length}`);
        
        const existingIds = new Set(currentCompanies.rows.map(row => row.id));
        const minId = Math.min(...existingIds);
        const maxId = Math.max(...existingIds);
        console.log(`   📊 Rango IDs: ${minId} - ${maxId}`);

        // 2. Leer representantes técnicos desde DBF
        console.log('\n2️⃣ REPRESENTANTES TÉCNICOS EN SPRTCOS.DBF:');
        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPRTCOS.DBF');
        const representantes = await readDBFFile(dbfPath);
        console.log(`   📊 Total registros SPRTCOS: ${representantes.length}`);

        // 3. Identificar empresas referenciadas que NO existen
        console.log('\n3️⃣ ANÁLISIS DE EMPRESAS FALTANTES:');
        const empresasReferenciadas = [...new Set(representantes.map(r => r.EMPRESA).filter(e => e && e > 0))];
        const empresasFaltantes = empresasReferenciadas.filter(id => !existingIds.has(id));
        
        console.log(`   📊 Empresas únicas referenciadas: ${empresasReferenciadas.length}`);
        console.log(`   ✅ Empresas que SÍ existen: ${empresasReferenciadas.length - empresasFaltantes.length}`);
        console.log(`   ❌ Empresas que NO existen: ${empresasFaltantes.length}`);

        // 4. Verificar cuántos representantes quedarían huérfanos
        console.log('\n4️⃣ IMPACTO EN REPRESENTANTES TÉCNICOS:');
        const repHuerfanos = representantes.filter(r => empresasFaltantes.includes(r.EMPRESA));
        console.log(`   👥 Representantes con empresas faltantes: ${repHuerfanos.length}`);
        console.log(`   👥 Representantes que sí pueden vincularse: ${representantes.length - repHuerfanos.length}`);

        // 5. Verificar si las empresas faltantes existen en SPPROFE
        console.log('\n5️⃣ VERIFICANDO EMPRESAS FALTANTES EN SPPROFE.DBF:');
        const spprofeDBF = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPPROFE.DBF');
        const empresasSPPROFE = await readDBFFile(spprofeDBF);
        
        const empresasSPPROFEMap = new Map();
        empresasSPPROFE.forEach(emp => {
            if (emp.DCNRO) {
                empresasSPPROFEMap.set(emp.DCNRO, {
                    id: emp.DCNRO,
                    nombre: emp.NOMBRE,
                    cuit: emp.CUIT,
                    domicilio: emp.DOMICI,
                    email: emp.EEMAIL
                });
            }
        });

        const empresasFaltantesEncontradas = empresasFaltantes.filter(id => empresasSPPROFEMap.has(id));
        const empresasFaltantesNoEncontradas = empresasFaltantes.filter(id => !empresasSPPROFEMap.has(id));

        console.log(`   ✅ Empresas faltantes SÍ están en SPPROFE: ${empresasFaltantesEncontradas.length}`);
        console.log(`   ❌ Empresas faltantes NO están en SPPROFE: ${empresasFaltantesNoEncontradas.length}`);

        // 6. Mostrar muestra de empresas que SÍ necesitamos importar
        console.log('\n6️⃣ EMPRESAS QUE SÍ NECESITAMOS IMPORTAR (primeras 20):');
        empresasFaltantesEncontradas.slice(0, 20).forEach((id, i) => {
            const empresa = empresasSPPROFEMap.get(id);
            console.log(`   ${i + 1}. ID: ${id} - ${empresa.nombre}`);
        });

        // 7. Estimación final
        console.log('\n' + '='.repeat(80));
        console.log('🎯 CONCLUSIONES DEL ANÁLISIS:');
        console.log(`   📊 Empresas actuales en BD: ${currentCompanies.rows.length}`);
        console.log(`   ➕ Empresas que SÍ necesitamos importar: ${empresasFaltantesEncontradas.length}`);
        console.log(`   📊 Total final estimado: ${currentCompanies.rows.length + empresasFaltantesEncontradas.length}`);
        console.log(`   👥 Representantes técnicos que se activarían: ${repHuerfanos.length}`);
        
        if (empresasFaltantesNoEncontradas.length > 0) {
            console.log(`   ⚠️ IDs huérfanos (sin empresa en SPPROFE): ${empresasFaltantesNoEncontradas.length}`);
            console.log(`      Muestra: ${empresasFaltantesNoEncontradas.slice(0, 10).join(', ')}`);
        }

        console.log('\n💡 RECOMENDACIÓN:');
        console.log(`   ✅ Importar SOLO las ${empresasFaltantesEncontradas.length} empresas necesarias`);
        console.log(`   ✅ Esto activará ${repHuerfanos.length} representantes técnicos adicionales`);
        console.log(`   ✅ No habrá inflado innecesario de empresas`);
        console.log('='.repeat(80));

        return {
            empresasActuales: currentCompanies.rows.length,
            empresasNecesarias: empresasFaltantesEncontradas.length,
            representantesActivados: repHuerfanos.length,
            empresasHuerfanas: empresasFaltantesNoEncontradas.length
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeMissingCompanies();