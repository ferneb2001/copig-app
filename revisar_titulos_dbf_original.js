const DBF = require('node-dbf');
const path = require('path');

async function revisarTitulosOriginales() {
    try {
        console.log('🔍 Revisando títulos en archivos DBF originales...');
        
        // Buscar archivos DBF de profesionales
        const archivos = [
            'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPTITPR.DBF',
            'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPROFES.DBF',
            'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPTITPR.DBF',
            'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPROFES.DBF'
        ];
        
        for (const archivo of archivos) {
            try {
                console.log(`\n📁 Analizando: ${path.basename(archivo)}`);
                
                const dbf = await DBF.open(archivo);
                const records = await dbf.readRecords(20); // Primeros 20 registros
                
                console.log(`Registros encontrados: ${records.length}`);
                
                if (records.length > 0) {
                    console.log('Estructura del registro:');
                    const firstRecord = records[0];
                    Object.keys(firstRecord).forEach(key => {
                        console.log(`  ${key}: ${firstRecord[key]}`);
                    });
                    
                    // Buscar específicamente el registro de Acosta Sergio Daniel
                    const acosta = records.find(r => 
                        (r.NOMBRE || r.APELLNOM || '').toUpperCase().includes('ACOSTA') &&
                        (r.NOMBRE || r.APELLNOM || '').toUpperCase().includes('SERGIO')
                    );
                    
                    if (acosta) {
                        console.log('\n🎯 ENCONTRADO ACOSTA SERGIO DANIEL:');
                        Object.keys(acosta).forEach(key => {
                            console.log(`  ${key}: ${acosta[key]}`);
                        });
                    }
                }
                
            } catch (error) {
                console.log(`  ❌ No se pudo abrir: ${error.message}`);
            }
        }
        
        console.log('\n💡 Análisis completado');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

revisarTitulosOriginales();