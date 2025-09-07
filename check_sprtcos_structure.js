/**
 * VERIFICAR ESTRUCTURA Y PRIMEROS REGISTROS DE SPRTCOS.DBF
 */

const Parser = require('node-dbf').default;

const archivo = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRTCOS.DBF';

async function verificarEstructura() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 ANÁLISIS DETALLADO DE SPRTCOS.DBF');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const parser = new Parser(archivo);
    let contador = 0;
    let campos = null;
    
    parser.on('header', (header) => {
        console.log('📋 ESTRUCTURA DEL ARCHIVO:');
        console.log('─────────────────────────────────────────');
        console.log(`Registros: ${header.numberOfRecords}`);
        console.log(`Fecha última modificación: ${header.lastUpdated}`);
        console.log(`\nCAMPOS DISPONIBLES:`);
        header.fields.forEach(field => {
            console.log(`  - ${field.name} (${field.type}, longitud: ${field.length})`);
        });
        campos = header.fields.map(f => f.name);
        console.log();
    });
    
    parser.on('record', (record) => {
        contador++;
        
        // Mostrar primeros 5 registros completos
        if (contador <= 5) {
            console.log(`\n📄 REGISTRO #${contador}:`);
            console.log('─────────────────────────────────────────');
            
            // Verificar todos los campos
            for (const campo of campos) {
                const valor = record[campo];
                if (valor !== null && valor !== undefined) {
                    const valorStr = valor.toString().trim();
                    if (valorStr) {
                        console.log(`  ${campo}: "${valorStr}"`);
                    }
                }
            }
            
            // Si no hay valores, indicarlo
            const hayDatos = Object.values(record).some(v => v && v.toString().trim());
            if (!hayDatos) {
                console.log('  [Registro vacío - todos los campos están en blanco]');
            }
        }
    });
    
    parser.on('end', () => {
        console.log(`\n✅ Total registros analizados: ${contador}`);
        console.log('\n💡 CONCLUSIÓN:');
        console.log('─────────────────────────────────────────');
        console.log('El archivo SPRTCOS.DBF existe pero todos los registros están vacíos.');
        console.log('Necesitamos buscar los datos de representantes técnicos en otro lugar.');
        console.log('\n🔍 POSIBLES ALTERNATIVAS:');
        console.log('1. Buscar archivo SPRESTRI.DBF (restricciones)');
        console.log('2. Verificar si hay backups con datos');
        console.log('3. Solicitar a Peñaloza el archivo correcto');
    });
    
    parser.parse();
}

verificarEstructura();