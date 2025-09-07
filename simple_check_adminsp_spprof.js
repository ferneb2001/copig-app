const Parser = require('node-dbf').default;

async function checkSpprofStructure() {
    try {
        console.log('🔍 VERIFICANDO ESTRUCTURA DE SPPROF.DBF EN ADMINSP');
        console.log('='.repeat(60));
        
        // Usar el SPPROF.DBF activo de la carpeta de Peñaloza
        const dbfPath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPPROF.DBF';
        console.log(`📂 Archivo: ${dbfPath}`);
        
        const parser = new Parser(dbfPath);
        console.log(`📊 Número de registros: ${parser.recordCount}`);
        console.log(`📋 Campos disponibles: ${parser.header ? parser.header.fields?.length : 'N/A'}`);
        
        if (parser.header && parser.header.fields) {
            console.log('\n📝 CAMPOS ENCONTRADOS:');
            parser.header.fields.forEach((field, index) => {
                console.log(`  ${index + 1}. ${field.name} (${field.type}, ${field.length})`);
            });
        }
        
        console.log('\n🧪 LEYENDO PRIMEROS 3 REGISTROS:');
        
        if (parser.recordCount && parser.recordCount > 0) {
            for (let i = 0; i < Math.min(3, parser.recordCount); i++) {
                try {
                    const record = parser.readRecord(i);
                    console.log(`\n  📄 Registro ${i + 1}:`);
                    if (record) {
                        Object.keys(record).forEach(key => {
                            const value = record[key];
                            if (value !== null && value !== undefined && value !== '') {
                                console.log(`    ${key}: ${value}`);
                            }
                        });
                    } else {
                        console.log('    (registro vacío o null)');
                    }
                } catch (recordError) {
                    console.log(`    ❌ Error leyendo registro ${i + 1}: ${recordError.message}`);
                }
            }
        } else {
            console.log('  ⚠️ No hay registros para mostrar');
        }
        
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkSpprofStructure();