/**
 * ANÁLISIS DEL ARCHIVO SANCION.DBF
 * ¿Contiene datos de empresas que nos faltan?
 */

const fs = require('fs');
const path = require('path');
const Parser = require('node-dbf').default;

console.log('🔍 ANÁLISIS DE SANCION.DBF');
console.log('🎯 Buscar pistas sobre empresas faltantes');
console.log('='.repeat(60));

async function analyzeSancionFile() {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SANCION.DBF');
        
        console.log(`📖 Leyendo: ${filePath}`);
        
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }
            
            const parser = new Parser(filePath);
            const records = [];
            let recordCount = 0;
            
            parser.on('start', (p) => {
                console.log('📖 Iniciando lectura...');
            });

            parser.on('header', (h) => {
                console.log(`📋 Header: ${h.numberOfRecords} registros`);
            });

            parser.on('record', (record) => {
                records.push(record);
                recordCount++;
                
                // Solo mostrar los primeros 10 para análisis
                if (recordCount <= 10) {
                    console.log(`\\n📝 REGISTRO ${recordCount}:`);
                    Object.keys(record).forEach(key => {
                        if (!key.startsWith('@')) {
                            console.log(`   ${key}: "${record[key]}"`);
                        }
                    });
                }
            });

            parser.on('end', (p) => {
                console.log(`\\n✅ SANCION.DBF analizado: ${records.length} registros`);
                
                if (records.length > 0) {
                    console.log('\\n🔍 ANÁLISIS DE CAMPOS:');
                    const sample = records[0];
                    Object.keys(sample).forEach(key => {
                        if (!key.startsWith('@')) {
                            console.log(`   📌 ${key}: ${typeof sample[key]}`);
                        }
                    });
                    
                    // Buscar campos que podrían indicar empresa
                    const fieldsWithEmpresa = Object.keys(sample).filter(key => 
                        key.toLowerCase().includes('emp') || 
                        key.toLowerCase().includes('comp') ||
                        key.toLowerCase().includes('firm') ||
                        key.toLowerCase().includes('id')
                    );
                    
                    if (fieldsWithEmpresa.length > 0) {
                        console.log(`\\n🎯 CAMPOS RELACIONADOS CON EMPRESAS: ${fieldsWithEmpresa.join(', ')}`);
                    }
                }
                
                resolve(records);
            });

            parser.on('error', (error) => {
                console.error(`❌ Error:`, error.message);
                reject(error);
            });

            parser.parse();
            
        } catch (error) {
            reject(error);
        }
    });
}

analyzeSancionFile().then(() => {
    console.log('\\n✅ Análisis completado');
}).catch(error => {
    console.error('❌ Error:', error.message);
});