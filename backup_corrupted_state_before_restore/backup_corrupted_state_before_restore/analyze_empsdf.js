/**
 * ANÁLISIS DE EMPSDF.DBF
 * Archivo principal de empresas para mapeo
 */

const Parser = require('node-dbf').default;

async function analizarEMPSDF() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 ANÁLISIS DE EMPSDF.DBF (Empresas)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const archivo = 'C:\\copig-app\\adminsp\\COPIG\\EMPSDF.DBF';
    
    const parser = new Parser(archivo);
    let contador = 0;
    let campos = null;
    const empresasConId = [];
    
    parser.on('header', (header) => {
        console.log('📋 ESTRUCTURA DEL ARCHIVO:');
        console.log('─────────────────────────────────────────');
        console.log(`Registros: ${header.numberOfRecords}`);
        console.log(`\nCAMPOS DISPONIBLES:`);
        header.fields.forEach(field => {
            console.log(`  - ${field.name} (${field.type}, longitud: ${field.length})`);
        });
        campos = header.fields.map(f => f.name);
        console.log();
    });
    
    parser.on('record', (record) => {
        contador++;
        
        // Mostrar primeros 5 registros
        if (contador <= 5) {
            console.log(`\n📄 REGISTRO #${contador}:`);
            console.log('─────────────────────────────────────────');
            
            for (const campo of campos) {
                const valor = record[campo];
                if (valor !== null && valor !== undefined) {
                    const valorStr = valor.toString().trim();
                    if (valorStr && valorStr !== '0' && valorStr !== 'NaN') {
                        console.log(`  ${campo}: "${valorStr}"`);
                    }
                }
            }
        }
        
        // Buscar IMPSA
        if (record.RAZSOC && record.RAZSOC.toString().includes('IMPSA')) {
            console.log(`\n🎯 ENCONTRADO IMPSA:`);
            console.log('─────────────────────────────────────────');
            for (const campo of campos) {
                const valor = record[campo];
                if (valor && valor.toString().trim()) {
                    console.log(`  ${campo}: "${valor.toString().trim()}"`);
                }
            }
            
            // Guardar ID si existe
            if (record.NUMERO || record.ID || record.CODIGO) {
                empresasConId.push({
                    id: record.NUMERO || record.ID || record.CODIGO,
                    nombre: record.RAZSOC.toString().trim()
                });
            }
        }
    });
    
    parser.on('end', () => {
        console.log(`\n✅ Total registros: ${contador}`);
        
        if (empresasConId.length > 0) {
            console.log('\n📊 EMPRESAS CON ID ENCONTRADAS:');
            console.log('─────────────────────────────────────────');
            empresasConId.slice(0, 10).forEach(emp => {
                console.log(`  ID ${emp.id}: ${emp.nombre}`);
            });
        }
        
        console.log('\n💡 CONCLUSIÓN:');
        console.log('─────────────────────────────────────────');
        console.log('Este archivo contiene el mapeo de IDs de empresas.');
        console.log('Podemos usar estos IDs para relacionar con SPRTCOS.DBF');
    });
    
    parser.parse();
}

analizarEMPSDF();