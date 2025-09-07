/**
 * BÚSQUEDA EXHAUSTIVA DE EMPRESAS CON IDs ALTOS
 * Analizar todos los DBF de Peñaloza para encontrar empresas con IDs > 1189
 */

const fs = require('fs');
const path = require('path');
const Parser = require('node-dbf').default;

console.log('🔍 BÚSQUEDA EXHAUSTIVA - EMPRESAS CON IDs ALTOS');
console.log('🎯 Objetivo: Encontrar empresas con IDs > 1189');
console.log('='.repeat(80));

// Archivos a analizar (basados en los DBF disponibles)
const archivosAnalizar = [
    'SVPROF.DBF',     // Posibles profesionales con empresa
    'SVPROFE.DBF',    // Profesionales externos
    'SVMATRI.DBF',    // Matrículas con posibles empresas
    'SVMATRIE.DBF',   // Matrículas externas
    'SPPROFE.DBF',    // Profesionales externos COPIG
    'SPMATRIE.DBF',   // Matrículas externas COPIG
];

async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            resolve(null); // Archivo no existe
            return;
        }
        
        const parser = new Parser(filePath);
        const records = [];
        
        parser.on('record', (record) => records.push(record));
        parser.on('end', () => resolve(records));
        parser.on('error', (error) => reject(error));
        parser.parse();
    });
}

async function searchHighIdCompanies() {
    const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos');
    
    for (let archivo of archivosAnalizar) {
        console.log(`\n📖 ANALIZANDO: ${archivo}`);
        console.log('-'.repeat(50));
        
        const filePath = path.join(dbfPath, archivo);
        
        try {
            const records = await readDBFFile(filePath);
            
            if (!records) {
                console.log(`❌ Archivo no encontrado: ${archivo}`);
                continue;
            }
            
            if (records.length === 0) {
                console.log(`⚠️ Archivo vacío: ${archivo}`);
                continue;
            }
            
            console.log(`✅ Registros leídos: ${records.length}`);
            
            // Mostrar estructura del primer registro
            const sample = records[0];
            console.log('📋 CAMPOS DISPONIBLES:');
            Object.keys(sample).forEach(key => {
                if (!key.startsWith('@')) {
                    console.log(`   • ${key}: ${typeof sample[key]} (ejemplo: "${sample[key]}")`);
                }
            });
            
            // Buscar campos que podrían contener IDs de empresa altos
            const camposEmpresa = Object.keys(sample).filter(key => 
                key.toLowerCase().includes('emp') || 
                key.toLowerCase().includes('id') ||
                key.toLowerCase().includes('cod') ||
                key.toLowerCase().includes('num') ||
                (typeof sample[key] === 'number' && sample[key] > 1000)
            );
            
            if (camposEmpresa.length > 0) {
                console.log(`\n🎯 CAMPOS CANDIDATOS: ${camposEmpresa.join(', ')}`);
                
                // Analizar cada campo candidato
                camposEmpresa.forEach(campo => {
                    const valores = records.map(r => r[campo])
                        .filter(v => typeof v === 'number' && v > 1189)
                        .sort((a, b) => a - b);
                    
                    if (valores.length > 0) {
                        const valoresUnicos = [...new Set(valores)];
                        console.log(`\n🔥 ${campo}: ${valoresUnicos.length} valores > 1189`);
                        console.log(`   Rango: ${valoresUnicos[0]} - ${valoresUnicos[valoresUnicos.length - 1]}`);
                        console.log(`   Muestra: ${valoresUnicos.slice(0, 20).join(', ')}${valoresUnicos.length > 20 ? '...' : ''}`);
                    }
                });
            }
            
        } catch (error) {
            console.error(`❌ Error procesando ${archivo}:`, error.message);
        }
    }
}

searchHighIdCompanies().then(() => {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 BÚSQUEDA COMPLETADA');
    console.log('💡 Si encontramos valores > 1189, podrían ser las empresas faltantes');
    console.log('='.repeat(80));
}).catch(error => {
    console.error('\n❌ ERROR GENERAL:', error.message);
});