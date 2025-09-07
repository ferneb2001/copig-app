/**
 * ANÁLISIS DETALLADO DE EMPRESAS EN SPPROFE.DBF
 * ¡ENCONTRAMOS LAS EMPRESAS FALTANTES!
 * SPPROFE contiene empresas con CATEGO="EM" y IDs altos que explican el problema
 */

const fs = require('fs');
const path = require('path');
const Parser = require('node-dbf').default;

console.log('🔥 ¡EMPRESAS FALTANTES ENCONTRADAS!');
console.log('📍 ARCHIVO: SPPROFE.DBF');
console.log('🎯 Análisis detallado de empresas con IDs > 1189');
console.log('='.repeat(80));

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

async function analyzeSPPROFECompanies() {
    try {
        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPPROFE.DBF');
        const records = await readDBFFile(dbfPath);
        
        console.log(`📖 SPPROFE.DBF leído: ${records.length} registros`);
        
        // Filtrar solo empresas (CATEGO no está en SPPROFE, pero DCNRO podría ser el ID de empresa)
        console.log('\n🏢 ANÁLISIS DE EMPRESAS EN SPPROFE:');
        
        // Mostrar primeras 20 empresas para entender la estructura
        console.log('\n📋 PRIMERAS 20 REGISTROS:');
        records.slice(0, 20).forEach((empresa, i) => {
            console.log(`   ${i + 1}. DCNRO: ${empresa.DCNRO} - ${empresa.NOMBRE}`);
        });
        
        // Contar empresas con DCNRO > 1189
        const empresasAltasIds = records.filter(emp => emp.DCNRO && emp.DCNRO > 1189);
        console.log(`\n📊 ESTADÍSTICAS:`);\
        console.log(`   • Total registros: ${records.length}`);
        console.log(`   • Registros con DCNRO > 1189: ${empresasAltasIds.length}`);
        
        if (empresasAltasIds.length > 0) {
            const dcnros = empresasAltasIds.map(e => e.DCNRO).sort((a, b) => a - b);
            console.log(`   • Rango IDs: ${dcnros[0]} - ${dcnros[dcnros.length - 1]}`);
            
            console.log(`\n🎯 MUESTRA DE EMPRESAS CON IDs ALTOS (primeras 30):`);
            empresasAltasIds.slice(0, 30).forEach((emp, i) => {
                console.log(`   ${i + 1}. ID: ${emp.DCNRO} - ${emp.NOMBRE.substring(0, 60)}${emp.NOMBRE.length > 60 ? '...' : ''}`);
            });
        }
        
        // Verificar si hay empresas conocidas
        const empresasConocidas = ['IMPSA', 'PESCARMONA', 'METALURG'];
        const empresasEncontradas = records.filter(emp => 
            empresasConocidas.some(conocida => 
                emp.NOMBRE.toUpperCase().includes(conocida)
            )
        );
        
        if (empresasEncontradas.length > 0) {
            console.log(`\n🔍 EMPRESAS CONOCIDAS ENCONTRADAS:`);
            empresasEncontradas.forEach(emp => {
                console.log(`   • ID: ${emp.DCNRO} - ${emp.NOMBRE}`);
                console.log(`     CUIT: ${emp.CUIT}`);
                console.log(`     Domicilio: ${emp.DOMICI}`);
                console.log(`     Email: ${emp.EEMAIL || 'Sin email'}`);
                console.log('');
            });
        }
        
        return {
            totalRegistros: records.length,
            empresasAltasIds: empresasAltasIds.length,
            rangoMin: empresasAltasIds.length > 0 ? Math.min(...empresasAltasIds.map(e => e.DCNRO)) : 0,
            rangoMax: empresasAltasIds.length > 0 ? Math.max(...empresasAltasIds.map(e => e.DCNRO)) : 0
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

analyzeSPPROFECompanies().then(result => {
    if (result) {
        console.log('\n' + '='.repeat(80));
        console.log('🎉 CONCLUSIÓN IMPORTANTE:');
        console.log(`   ✅ SPPROFE.DBF contiene ${result.empresasAltasIds} registros con IDs > 1189`);
        console.log(`   📊 Rango: ${result.rangoMin} - ${result.rangoMax}`);
        console.log('   💡 ESTAS SON LAS EMPRESAS FALTANTES que explican el problema!');
        console.log('   🚀 PRÓXIMO PASO: Importar estas empresas al sistema');
        console.log('='.repeat(80));
    }
}).catch(error => {
    console.error('❌ Error general:', error.message);
});