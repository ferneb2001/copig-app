/**
 * PRUEBA CON UN DBF QUE SABEMOS QUE FUNCIONA
 * Para entender el formato y estructura
 */

const Parser = require('node-dbf').default;

function probarDBF(ruta, nombreArchivo) {
    return new Promise((resolve) => {
        console.log(`\n=== PROBANDO: ${nombreArchivo} ===`);
        console.log(`Ruta: ${ruta}`);
        
        try {
            const parser = new Parser(ruta);
            
            let contador = 0;
            let estructuraMostrada = false;
            const registrosMuestra = [];
            
            parser.on('record', (record) => {
                contador++;
                
                if (!estructuraMostrada && parser.header) {
                    console.log(`\nESTRUCTURA:`);
                    console.log(`Registros: ${parser.header.recordsCount}`);
                    console.log(`Campos: ${parser.header.fields.length}`);
                    
                    console.log(`\nCampos disponibles:`);
                    parser.header.fields.forEach((campo, idx) => {
                        console.log(`  ${idx + 1}: ${campo.name} (${campo.type}, ${campo.length})`);
                    });
                    estructuraMostrada = true;
                }
                
                if (registrosMuestra.length < 3) {
                    registrosMuestra.push(record);
                }
                
                if (contador >= 5) {
                    return false; // Detener después de 5
                }
            });
            
            parser.on('end', () => {
                console.log(`\nPrimeros registros:`);
                registrosMuestra.forEach((reg, idx) => {
                    console.log(`\nRegistro ${idx + 1}:`);
                    Object.keys(reg).forEach(campo => {
                        console.log(`  ${campo}: ${reg[campo]}`);
                    });
                });
                
                resolve({ success: true, registros: contador });
            });
            
            parser.on('error', (error) => {
                console.log(`ERROR: ${error.message}`);
                resolve({ success: false, error: error.message });
            });
            
        } catch (error) {
            console.log(`ERROR INICIAL: ${error.message}`);
            resolve({ success: false, error: error.message });
        }
    });
}

async function main() {
    console.log('PRUEBA DE LECTURA DBF');
    
    // Probar con archivo que sabemos que funciona
    const resultado1 = await probarDBF(
        'C:\\copig-app\\adminsp\\COPIG\\EMPSDF.DBF',
        'EMPSDF.DBF (que sabemos funciona)'
    );
    
    console.log(`\nResultado EMPSDF: ${resultado1.success ? 'ÉXITO' : 'FALLO'}`);
    
    // Ahora intentar con SPRESTRI más pequeño (archpadron21)
    const resultado2 = await probarDBF(
        'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPRESTRI.DBF',
        'SPRESTRI.DBF (archpadron21 - más pequeño)'
    );
    
    console.log(`\nResultado SPRESTRI archpadron21: ${resultado2.success ? 'ÉXITO' : 'FALLO'}`);
}

main().catch(error => {
    console.error('Error general:', error);
});