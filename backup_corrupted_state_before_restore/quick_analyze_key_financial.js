/**
 * ANÁLISIS RÁPIDO DE ARCHIVOS FINANCIEROS CLAVE
 * Solo analiza los más importantes sin procesar todos los registros
 */

const Parser = require('node-dbf').default;

// Solo los archivos MÁS CRÍTICOS
const archivosClave = [
    {
        nombre: 'SPRESTRI.DBF (ACTUALIZADO)',
        ruta: 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRESTRI.DBF',
        descripcion: 'Restricciones/deudas activas más actualizadas'
    },
    {
        nombre: 'SPPAGOS.DBF (ACTUALIZADO)', 
        ruta: 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPPAGOS.DBF',
        descripcion: 'Pagos históricos más actualizados'
    }
];

function analizarEstructura(archivo) {
    return new Promise((resolve) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔍 ANÁLISIS RÁPIDO: ${archivo.nombre}`);
        console.log(`📍 ${archivo.ruta}`);
        console.log(`${'='.repeat(60)}`);
        
        try {
            const parser = new Parser(archivo.ruta);
            
            let registrosMuestra = [];
            let totalProcesados = 0;
            let estructuraMostrada = false;
            const LIMITE_REGISTROS = 10; // Solo procesar 10 registros para análisis rápido
            
            parser.on('record', (record) => {
                totalProcesados++;
                
                // Mostrar estructura solo una vez
                if (!estructuraMostrada && parser.header) {
                    console.log(`\n📊 INFORMACIÓN DEL ARCHIVO:`);
                    console.log(`   Total en header: ${parser.header.recordsCount?.toLocaleString() || 'N/A'}`);
                    console.log(`   Campos disponibles: ${parser.header.fields?.length || 0}`);
                    
                    if (parser.header.fields && parser.header.fields.length > 0) {
                        console.log(`\n📋 ESTRUCTURA DE CAMPOS:`);
                        parser.header.fields.forEach((campo, idx) => {
                            console.log(`   ${(idx + 1).toString().padStart(2)}: ${campo.name.padEnd(12)} | ${campo.type} | Len:${campo.length}`);
                        });
                    }
                    estructuraMostrada = true;
                }
                
                // Solo guardar primeros registros
                if (registrosMuestra.length < 3) {
                    registrosMuestra.push(record);
                }
                
                // Detener después de LIMITE_REGISTROS para análisis rápido
                if (totalProcesados >= LIMITE_REGISTROS) {
                    parser.close?.(); // Intentar cerrar el parser
                    return false;
                }
            });
            
            parser.on('end', () => {
                console.log(`\n✅ MUESTRA ANALIZADA: ${totalProcesados} registros`);
                
                if (registrosMuestra.length > 0) {
                    console.log(`\n📝 DATOS DE MUESTRA:`);
                    registrosMuestra.forEach((registro, idx) => {
                        console.log(`\n   Registro ${idx + 1}:`);
                        Object.keys(registro).forEach(campo => {
                            const valor = registro[campo];
                            let valorMostrar = 'NULL';
                            
                            if (valor !== null && valor !== undefined) {
                                valorMostrar = valor.toString().trim();
                                if (valorMostrar === '') valorMostrar = '[VACÍO]';
                                // Truncar valores muy largos
                                if (valorMostrar.length > 50) {
                                    valorMostrar = valorMostrar.substring(0, 47) + '...';
                                }
                            }
                            
                            console.log(`     ${campo.padEnd(10)}: ${valorMostrar}`);
                        });
                    });
                }
                
                resolve({
                    archivo: archivo.nombre,
                    registrosHeader: parser.header?.recordsCount || 0,
                    campos: parser.header?.fields?.length || 0,
                    camposDetalle: parser.header?.fields || []
                });
            });
            
            parser.on('error', (error) => {
                console.log(`❌ ERROR: ${error.message}`);
                resolve({
                    archivo: archivo.nombre,
                    error: error.message
                });
            });
            
            // Timeout de seguridad
            setTimeout(() => {
                console.log(`⏰ TIMEOUT - Análisis detenido`);
                parser.close?.();
                resolve({
                    archivo: archivo.nombre,
                    timeout: true
                });
            }, 30000); // 30 segundos máximo
            
        } catch (error) {
            console.log(`❌ ERROR INICIAL: ${error.message}`);
            resolve({
                archivo: archivo.nombre,
                error: error.message
            });
        }
    });
}

async function main() {
    console.log(`\n${'█'.repeat(70)}`);
    console.log(`🚀 ANÁLISIS RÁPIDO - ARCHIVOS FINANCIEROS CLAVE`);
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log(`${'█'.repeat(70)}`);
    
    const resultados = [];
    
    for (const archivo of archivosClave) {
        console.log(`\n⏳ Procesando: ${archivo.nombre}...`);
        const resultado = await analizarEstructura(archivo);
        resultados.push(resultado);
        
        // Pequeña pausa entre archivos
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // RESUMEN EJECUTIVO
    console.log(`\n${'█'.repeat(70)}`);
    console.log(`📈 RESUMEN EJECUTIVO`);
    console.log(`${'█'.repeat(70)}`);
    
    resultados.forEach((resultado, idx) => {
        console.log(`\n${idx + 1}. ${resultado.archivo}:`);
        
        if (resultado.error) {
            console.log(`   ❌ ERROR: ${resultado.error}`);
        } else if (resultado.timeout) {
            console.log(`   ⏰ TIMEOUT - Archivo muy grande`);
        } else {
            console.log(`   📊 Registros totales: ${resultado.registrosHeader?.toLocaleString() || 'N/A'}`);
            console.log(`   📝 Campos: ${resultado.campos}`);
            
            if (resultado.camposDetalle && resultado.camposDetalle.length > 0) {
                console.log(`   🔍 Campos principales: ${resultado.camposDetalle.slice(0, 5).map(c => c.name).join(', ')}`);
            }
        }
    });
    
    console.log(`\n${'█'.repeat(70)}`);
    console.log(`✅ ANÁLISIS COMPLETADO`);
    console.log(`${'█'.repeat(70)}`);
}

// Ejecutar
main().catch(error => {
    console.error('❌ ERROR GENERAL:', error);
    process.exit(1);
});

// Manejo de señales para limpieza
process.on('SIGINT', () => {
    console.log('\n🛑 Análisis interrumpido por usuario');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Análisis terminado');
    process.exit(0);
});