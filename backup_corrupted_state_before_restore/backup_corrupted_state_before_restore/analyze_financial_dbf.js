const Parser = require('node-dbf').default;
const path = require('path');

// Archivos DBF financieros identificados
const archivosFinancieros = [
    {
        nombre: 'SPPAGOS.DBF',
        ruta: 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPPAGOS.DBF',
        descripcion: 'Pagos históricos - 124,108 registros según análisis previo'
    },
    {
        nombre: 'SPRESTRI.DBF', 
        ruta: 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPRESTRI.DBF',
        descripcion: 'Restricciones/deudas activas - 3,530 registros según análisis previo'
    }
];

function analizarArchivoDBF(archivo) {
    return new Promise((resolve) => {
        console.log(`\n=== ANALIZANDO: ${archivo.nombre} ===`);
        console.log(`Descripción: ${archivo.descripcion}`);
        console.log(`Ruta: ${archivo.ruta}`);
        
        try {
            const parser = new Parser(archivo.ruta);
            const registrosMuestra = [];
            let totalRegistros = 0;
            let camposMostrados = false;
            
            parser.on('record', (record) => {
                totalRegistros++;
                
                // Mostrar estructura de campos una sola vez
                if (!camposMostrados && parser.header) {
                    console.log(`\nESTRUCTURA DE CAMPOS:`);
                    console.log(`Total de registros en header: ${parser.header.recordsCount}`);
                    console.log(`\nCampos disponibles:`);
                    
                    parser.header.fields.forEach((field, index) => {
                        console.log(`${index + 1}. ${field.name.padEnd(15)} - Tipo: ${field.type}, Longitud: ${field.length}`);
                    });
                    camposMostrados = true;
                }
                
                // Guardar primeros 3 registros para muestra
                if (registrosMuestra.length < 3) {
                    registrosMuestra.push(record);
                }
            });
            
            parser.on('end', () => {
                console.log(`\nTotal de registros procesados: ${totalRegistros}`);
                console.log(`\nPRIMEROS 3 REGISTROS DE MUESTRA:`);
                
                registrosMuestra.forEach((record, index) => {
                    console.log(`\nRegistro ${index + 1}:`);
                    Object.keys(record).forEach(campo => {
                        console.log(`  ${campo}: ${record[campo]}`);
                    });
                });
                
                console.log('\n' + '-'.repeat(80));
                resolve();
            });
            
            parser.on('error', (error) => {
                console.error(`Error procesando ${archivo.nombre}:`, error.message);
                resolve();
            });
            
        } catch (error) {
            console.error(`Error inicializando parser para ${archivo.nombre}:`, error.message);
            resolve();
        }
    });
}

async function main() {
    console.log('='.repeat(80));
    console.log('ANÁLISIS DE ARCHIVOS DBF FINANCIEROS - COPIG');
    console.log('='.repeat(80));
    
    for (const archivo of archivosFinancieros) {
        await analizarArchivoDBF(archivo);
        console.log('\n' + '-'.repeat(80));
    }
    
    console.log('\n=== ANÁLISIS COMPLETADO ===');
}

main().catch(console.error);