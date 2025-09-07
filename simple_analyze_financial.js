/**
 * ANÁLISIS SIMPLE DE ARCHIVOS DBF FINANCIEROS
 * Usando approach probado de scripts anteriores
 */

const Parser = require('node-dbf').default;

// Archivos financieros identificados
const archivosFinancieros = [
    {
        nombre: 'SPPAGOS.DBF (Activos)',
        ruta: 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPPAGOS.DBF',
        descripcion: 'Pagos históricos - Versión más actualizada'
    },
    {
        nombre: 'SPRESTRI.DBF (Activos)', 
        ruta: 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRESTRI.DBF',
        descripcion: 'Restricciones/deudas activas - Versión más actualizada'
    },
    {
        nombre: 'SPPAGOS.DBF (Archpadron21)',
        ruta: 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPPAGOS.DBF',
        descripcion: 'Pagos históricos - Versión archpadron21'
    },
    {
        nombre: 'SPRESTRI.DBF (Archpadron21)', 
        ruta: 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPRESTRI.DBF',
        descripción: 'Restricciones/deudas activas - Versión archpadron21'
    }
];

function analizarArchivo(archivo) {
    return new Promise((resolve) => {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`📊 ANALIZANDO: ${archivo.nombre}`);
        console.log(`📍 Ruta: ${archivo.ruta}`);
        console.log(`📋 Descripción: ${archivo.descripcion}`);
        console.log(`${'='.repeat(70)}`);
        
        try {
            const parser = new Parser(archivo.ruta);
            
            let registrosProcesados = 0;
            let primerosRegistros = [];
            let camposMostrados = false;
            
            parser.on('record', (record) => {
                registrosProcesados++;
                
                // Mostrar estructura una sola vez
                if (!camposMostrados && parser.header) {
                    console.log(`\n🏗️  ESTRUCTURA DEL ARCHIVO:`);
                    console.log(`📊 Total registros (header): ${parser.header.recordsCount}`);
                    console.log(`📝 Campos disponibles: ${parser.header.fields.length}`);
                    
                    console.log(`\n📋 DETALLE DE CAMPOS:`);
                    parser.header.fields.forEach((campo, idx) => {
                        console.log(`   ${(idx + 1).toString().padStart(2)}: ${campo.name.padEnd(12)} | Tipo: ${campo.type} | Longitud: ${campo.length}`);
                    });
                    camposMostrados = true;
                }
                
                // Guardar primeros 3 registros
                if (primerosRegistros.length < 3) {
                    primerosRegistros.push(record);
                }
                
                // Mostrar progreso cada 1000 registros
                if (registrosProcesados % 1000 === 0) {
                    console.log(`📈 Procesados: ${registrosProcesados.toLocaleString()} registros...`);
                }
            });
            
            parser.on('end', () => {
                console.log(`\n✅ PROCESAMIENTO COMPLETADO`);
                console.log(`📊 Total procesado: ${registrosProcesados.toLocaleString()} registros`);
                
                if (primerosRegistros.length > 0) {
                    console.log(`\n🔍 MUESTRA DE DATOS (Primeros 3 registros):`);
                    primerosRegistros.forEach((registro, idx) => {
                        console.log(`\n   📄 Registro ${idx + 1}:`);
                        Object.keys(registro).forEach(campo => {
                            const valor = registro[campo];
                            const valorMostrar = valor !== null && valor !== undefined ? valor.toString().trim() : '[VACÍO]';
                            console.log(`      ${campo.padEnd(12)}: ${valorMostrar}`);
                        });
                    });
                }
                
                console.log(`\n${'='.repeat(70)}`);
                resolve({
                    archivo: archivo.nombre,
                    registros: registrosProcesados,
                    campos: parser.header ? parser.header.fields.length : 0
                });
            });
            
            parser.on('error', (error) => {
                console.log(`❌ ERROR procesando ${archivo.nombre}:`);
                console.log(`   ${error.message}`);
                resolve({
                    archivo: archivo.nombre,
                    error: error.message
                });
            });
            
        } catch (error) {
            console.log(`❌ ERROR inicializando ${archivo.nombre}:`);
            console.log(`   ${error.message}`);
            resolve({
                archivo: archivo.nombre,
                error: error.message
            });
        }
    });
}

async function main() {
    console.log(`\n${'█'.repeat(80)}`);
    console.log(`🏛️  ANÁLISIS EXHAUSTIVO DE ARCHIVOS DBF FINANCIEROS - COPIG`);
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`${'█'.repeat(80)}`);
    
    const resultados = [];
    
    for (const archivo of archivosFinancieros) {
        const resultado = await analizarArchivo(archivo);
        resultados.push(resultado);
        
        // Pausa entre archivos
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // RESUMEN FINAL
    console.log(`\n${'█'.repeat(80)}`);
    console.log(`📊 RESUMEN FINAL DEL ANÁLISIS`);
    console.log(`${'█'.repeat(80)}`);
    
    resultados.forEach(resultado => {
        if (resultado.error) {
            console.log(`❌ ${resultado.archivo}: ERROR - ${resultado.error}`);
        } else {
            console.log(`✅ ${resultado.archivo}:`);
            console.log(`   📊 Registros: ${resultado.registros.toLocaleString()}`);
            console.log(`   📝 Campos: ${resultado.campos}`);
        }
    });
    
    console.log(`\n${'█'.repeat(80)}`);
    console.log(`✅ ANÁLISIS COMPLETADO EXITOSAMENTE`);
    console.log(`${'█'.repeat(80)}`);
}

// Ejecutar análisis
main().catch(error => {
    console.error('❌ ERROR GENERAL:', error.message);
    process.exit(1);
});