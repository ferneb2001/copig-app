/**
 * ANÁLISIS COMPLETO DE ARCHIVOS SOPROF Y SOMATRI
 * Basado en documentación del Ing. Peñaloza
 * Para crear tabla de profesionales externos (arquitectos, agrimensores, etc.)
 */

const fs = require('fs');
const path = require('path');
const Parser = require('node-dbf').default;

console.log('🔍 ANÁLISIS COMPLETO - PROFESIONALES EXTERNOS');
console.log('📁 Archivos: SOPROF.DBF y SOMATRI.DBF');
console.log('🎯 Objetivo: Diseñar tabla profesionales_externos');
console.log('='.repeat(80));

// Función para analizar archivo DBF
async function analyzeDBFFile(filePath, fileName) {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 ANALIZANDO: ${fileName}`);
        console.log('-'.repeat(50));
        
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }
            
            const parser = new Parser(filePath);
            const records = [];
            let headerInfo = null;
            
            parser.on('start', (p) => {
                console.log(`🚀 Iniciando análisis de ${fileName}...`);
            });

            parser.on('header', (h) => {
                headerInfo = h;
                console.log(`📊 Header info - Registros: ${h.numberOfRecords}`);
                console.log(`📅 Última actualización: ${h.dateOfLastUpdate}`);
            });

            parser.on('record', (record) => {
                records.push(record);
                
                // Solo mostrar los primeros 3 registros para análisis
                if (records.length <= 3) {
                    console.log(`\n📝 REGISTRO ${records.length}:`);
                    Object.keys(record).forEach(key => {
                        if (!key.startsWith('@')) {
                            console.log(`   ${key}: "${record[key]}"`);
                        }
                    });
                }
            });

            parser.on('end', (p) => {
                console.log(`\n✅ ${fileName} analizado: ${records.length} registros`);
                
                // Análisis de campos
                if (records.length > 0) {
                    console.log(`\n🔍 ANÁLISIS DE CAMPOS en ${fileName}:`);
                    const sampleRecord = records[0];
                    Object.keys(sampleRecord).forEach(key => {
                        if (!key.startsWith('@')) {
                            const value = sampleRecord[key];
                            const type = typeof value;
                            const length = value ? value.toString().length : 0;
                            console.log(`   📌 ${key}: ${type}, longitud: ${length}, ejemplo: "${value}"`);
                        }
                    });
                    
                    // Estadísticas
                    console.log(`\n📈 ESTADÍSTICAS ${fileName}:`);
                    console.log(`   • Total registros: ${records.length}`);
                    console.log(`   • Primeros registros analizados: ${Math.min(3, records.length)}`);
                    console.log(`   • Campos detectados: ${Object.keys(sampleRecord).filter(k => !k.startsWith('@')).length}`);
                }
                
                resolve({
                    fileName,
                    totalRecords: records.length,
                    headerInfo,
                    sampleRecords: records.slice(0, 3),
                    allFields: records.length > 0 ? Object.keys(records[0]).filter(k => !k.startsWith('@')) : []
                });
            });

            parser.on('error', (error) => {
                console.error(`❌ Error en ${fileName}:`, error.message);
                reject(error);
            });

            parser.parse();
            
        } catch (error) {
            console.error(`❌ Error crítico analizando ${fileName}:`, error.message);
            reject(error);
        }
    });
}

async function analyzeFiles() {
    try {
        const sooprofPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SOPROF.DBF');
        const somatriPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SOMATRI.DBF');
        
        // Analizar ambos archivos
        const soprofAnalysis = await analyzeDBFFile(sooprofPath, 'SOPROF.DBF');
        const somatriAnalysis = await analyzeDBFFile(somatriPath, 'SOMATRI.DBF');
        
        console.log('\n' + '='.repeat(80));
        console.log('🎯 RESUMEN COMPARATIVO:');
        console.log('='.repeat(80));
        
        console.log(`📊 SOPROF.DBF: ${soprofAnalysis.totalRecords} registros`);
        console.log(`📊 SOMATRI.DBF: ${somatriAnalysis.totalRecords} registros`);
        
        console.log(`\n🔍 CAMPOS EN SOPROF: ${soprofAnalysis.allFields.join(', ')}`);
        console.log(`🔍 CAMPOS EN SOMATRI: ${somatriAnalysis.allFields.join(', ')}`);
        
        // Comparar campos comunes
        const commonFields = soprofAnalysis.allFields.filter(field => 
            somatriAnalysis.allFields.includes(field)
        );
        
        if (commonFields.length > 0) {
            console.log(`\n🤝 CAMPOS COMUNES (${commonFields.length}): ${commonFields.join(', ')}`);
        }
        
        const uniqueSoprof = soprofAnalysis.allFields.filter(field => 
            !somatriAnalysis.allFields.includes(field)
        );
        
        const uniqueSomatri = somatriAnalysis.allFields.filter(field => 
            !soprofAnalysis.allFields.includes(field)
        );
        
        if (uniqueSoprof.length > 0) {
            console.log(`🆔 SOLO EN SOPROF (${uniqueSoprof.length}): ${uniqueSoprof.join(', ')}`);
        }
        
        if (uniqueSomatri.length > 0) {
            console.log(`🆔 SOLO EN SOMATRI (${uniqueSomatri.length}): ${uniqueSomatri.join(', ')}`);
        }
        
        console.log('\n🎯 RECOMENDACIÓN PARA TABLA profesionales_externos:');
        console.log('   • Debe incluir campos comunes de ambos archivos');
        console.log('   • Agregar campo "origen" para identificar si es SOPROF o SOMATRI');
        console.log('   • Considerar campos únicos según necesidades del sistema');
        
        console.log('\n✅ ANÁLISIS COMPLETO FINALIZADO');
        
    } catch (error) {
        console.error('\n❌ ERROR EN ANÁLISIS:', error.message);
    }
}

// Ejecutar análisis
analyzeFiles();