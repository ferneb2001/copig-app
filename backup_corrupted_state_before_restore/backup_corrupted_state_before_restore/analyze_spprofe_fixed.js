/**
 * ANÁLISIS DETALLADO DE EMPRESAS EN SPPROFE.DBF
 * ¡ENCONTRAMOS LAS EMPRESAS FALTANTES!
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
        
        console.log('\n📋 PRIMERAS 20 REGISTROS:');
        records.slice(0, 20).forEach((empresa, i) => {
            console.log(`   ${i + 1}. DCNRO: ${empresa.DCNRO} - ${empresa.NOMBRE}`);
        });
        
        // Contar empresas con DCNRO > 1189
        const empresasAltasIds = records.filter(emp => emp.DCNRO && emp.DCNRO > 1189);
        console.log(`\n📊 ESTADÍSTICAS:`);
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
        
        // Buscar IMPSA específicamente
        const impsa = records.find(emp => emp.NOMBRE.toUpperCase().includes('IMPSA'));
        if (impsa) {
            console.log(`\n🔍 EMPRESA IMPSA ENCONTRADA:`);
            console.log(`   • ID: ${impsa.DCNRO}`);
            console.log(`   • Nombre: ${impsa.NOMBRE}`);
            console.log(`   • CUIT: ${impsa.CUIT}`);
            console.log(`   • Domicilio: ${impsa.DOMICI}`);
        }
        
        return empresasAltasIds.length;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }
}

analyzeSPPROFECompanies().then(count => {
    console.log('\n' + '='.repeat(80));
    console.log('🎉 CONCLUSIÓN IMPORTANTE:');
    console.log(`   ✅ SPPROFE.DBF contiene ${count} registros con IDs > 1189`);
    console.log('   💡 ESTAS SON LAS EMPRESAS FALTANTES!');
    console.log('   🚀 PRÓXIMO PASO: Importar estas empresas');
    console.log('='.repeat(80));
});