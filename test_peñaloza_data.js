const Parser = require('node-dbf').default;

async function testPeñalozaData() {
    try {
        console.log('🔍 PROBANDO DATOS DE PEÑALOZA PARA VERIFICAR TITLES');
        console.log('='.repeat(60));
        
        // Probar con un archivo que sabemos que funciona
        const pagosPath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPPAGOS.DBF';
        console.log('📂 1. PROBANDO SPPAGOS.DBF (sabemos que funciona)...');
        
        const pagosParser = new Parser(pagosPath);
        console.log(`✅ SPPAGOS records: ${pagosParser.recordCount}`);
        
        if (pagosParser.recordCount && pagosParser.recordCount > 0) {
            // Mostrar unos casos de nuestras matrículas problemáticas
            const matriculasProblematicas = [8763, 5454, 9106, 8765, 6975, 9113];
            let encontrados = 0;
            
            console.log('\n🔍 BUSCANDO CASOS PROBLEMÁTICOS EN SPPAGOS:');
            
            for (const matricula of matriculasProblematicas) {
                for (let i = 0; i < Math.min(1000, pagosParser.recordCount); i++) {
                    const record = pagosParser.readRecord(i);
                    if (record && record.MATPROF === matricula) {
                        console.log(`✅ Mat. ${matricula} ENCONTRADA en SPPAGOS:`);
                        console.log(`   Profesional: ${record.MATPROF || 'N/A'}`);
                        console.log(`   Fecha: ${record.FECHAPAG || 'N/A'}`);
                        console.log(`   Concepto: ${record.CONCEPTO || 'N/A'}`);
                        encontrados++;
                        break;
                    }
                }
            }
            
            console.log(`\n📊 Encontrados en SPPAGOS: ${encontrados}/${matriculasProblematicas.length}`);
            
        }
        
        // Ahora probar SPPROF.DBF
        console.log('\n📂 2. PROBANDO SPPROF.DBF...');
        const sprofPath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPPROF.DBF';
        
        try {
            const sprofParser = new Parser(sprofPath);
            console.log(`📊 SPPROF records: ${sprofParser.recordCount}`);
            
            if (sprofParser.recordCount && sprofParser.recordCount > 0) {
                console.log('\n🧪 PRIMEROS 3 REGISTROS DE SPPROF:');
                for (let i = 0; i < Math.min(3, sprofParser.recordCount); i++) {
                    const record = sprofParser.readRecord(i);
                    console.log(`\n  📄 Registro ${i + 1}:`);
                    if (record) {
                        Object.keys(record).forEach(key => {
                            const value = record[key];
                            if (value !== null && value !== undefined && value !== '') {
                                console.log(`    ${key}: ${value}`);
                            }
                        });
                    }
                }
            } else {
                console.log('⚠️ SPPROF no tiene registros o no se puede leer');
            }
            
        } catch (sprofError) {
            console.log(`❌ Error con SPPROF: ${sprofError.message}`);
        }
        
        console.log('\n✅ Prueba completada');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

testPeñalozaData();