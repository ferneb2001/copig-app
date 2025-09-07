/**
 * ANÁLISIS ENFOCADO EN EMPRESAS DE SANCION.DBF
 * ¿Estas empresas tienen IDs altos que expliquen los faltantes?
 */

const fs = require('fs');
const path = require('path');
const Parser = require('node-dbf').default;

console.log('🔍 ANÁLISIS ENFOCADO - EMPRESAS EN SANCION.DBF');
console.log('🎯 Verificar si hay empresas con IDs altos (>1189)');
console.log('='.repeat(70));

async function analyzeSancionEmpresas() {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SANCION.DBF');
        
        console.log(`📖 Leyendo SANCION.DBF...`);
        
        const parser = new Parser(filePath);
        const records = [];
        
        parser.on('record', (record) => records.push(record));
        
        parser.on('end', (p) => {
            console.log(`✅ Leídos: ${records.length} registros`);
            
            // Filtrar solo empresas
            const empresas = records.filter(r => r.CATEGO === 'EN');
            console.log(`🏢 Empresas encontradas: ${empresas.length}`);
            
            // Analizar rangos de matrículas de empresas
            const matriculasEmpresas = empresas.map(e => e.MATRIC).filter(m => m && m > 0);
            matriculasEmpresas.sort((a, b) => a - b);
            
            console.log(`\\n📊 ESTADÍSTICAS DE EMPRESAS:`);
            console.log(`   • Total empresas: ${empresas.length}`);
            console.log(`   • Rango matrículas: ${matriculasEmpresas[0]} - ${matriculasEmpresas[matriculasEmpresas.length - 1]}`);
            
            // Empresas con IDs altos
            const empresasAltasIds = matriculasEmpresas.filter(m => m > 1189);
            console.log(`   • Empresas con ID > 1189: ${empresasAltasIds.length}`);
            
            if (empresasAltasIds.length > 0) {
                console.log(`   • IDs altos encontrados: ${empresasAltasIds.slice(0, 10).join(', ')}${empresasAltasIds.length > 10 ? '...' : ''}`);
            }
            
            console.log(`\\n📋 PRIMERAS 15 EMPRESAS:`);
            empresas.slice(0, 15).forEach((emp, i) => {
                console.log(`   ${i + 1}. ID: ${emp.MATRIC} - ${emp.NOMBRE}`);
            });
            
            // Buscar solapamientos con empresas conocidas
            const idsConocidos = [1, 2, 3, 4, 5, 6, 10, 60, 64, 66, 137]; // Algunos IDs que sabemos que existen
            const solapamientos = matriculasEmpresas.filter(id => idsConocidos.includes(id));
            
            if (solapamientos.length > 0) {
                console.log(`\\n🔍 SOLAPAMIENTOS CON EMPRESAS CONOCIDAS:`);
                console.log(`   IDs que coinciden: ${solapamientos.join(', ')}`);
                
                solapamientos.forEach(id => {
                    const empresa = empresas.find(e => e.MATRIC === id);
                    if (empresa) {
                        console.log(`   • ID ${id}: ${empresa.NOMBRE}`);
                    }
                });
            }
            
            resolve({
                totalEmpresas: empresas.length,
                rangoMin: matriculasEmpresas[0],
                rangoMax: matriculasEmpresas[matriculasEmpresas.length - 1],
                empresasAltasIds: empresasAltasIds.length,
                solapamientos: solapamientos.length
            });
        });
        
        parser.on('error', reject);
        parser.parse();
    });
}

analyzeSancionEmpresas().then(result => {
    console.log('\\n' + '='.repeat(70));
    console.log('🎯 CONCLUSIÓN:');
    if (result.empresasAltasIds > 0) {
        console.log('   ✅ SÍ hay empresas con IDs > 1189 en SANCION.DBF');
        console.log('   💡 Esto podría explicar PARTE del problema');
    } else {
        console.log('   ❌ No hay empresas con IDs > 1189 en SANCION.DBF');
        console.log('   💡 Necesitamos buscar en otros archivos');
    }
    
    if (result.solapamientos > 0) {
        console.log('   🔍 Hay solapamientos - podría ser una fuente complementaria');
    }
    
    console.log('='.repeat(70));
}).catch(error => {
    console.error('❌ Error:', error.message);
});