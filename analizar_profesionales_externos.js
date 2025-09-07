const dbf = require('node-dbf').default;
const fs = require('fs');

console.log('='.repeat(80));
console.log(' ANÁLISIS DE PROFESIONALES EXTERNOS AL COPIG');
console.log('='.repeat(80));

async function analizarDBF(archivo, nombre) {
    try {
        console.log(`\n📁 ${nombre} (${archivo})`);
        console.log('-'.repeat(50));
        
        const reader = new dbf(archivo, 'latin1');
        
        console.log(`Total registros: ${reader.recordCount}`);
        
        if (reader.recordCount > 0) {
            // Mostrar estructura
            const fields = Object.keys(reader.records[0]);
            console.log(`Campos: ${fields.join(', ')}`);
            
            // Mostrar ejemplos
            console.log('\nEjemplos:');
            for (let i = 0; i < Math.min(5, reader.recordCount); i++) {
                const record = reader.records[i];
                // Buscar campos relevantes
                let info = '';
                if (record.APELLNOM || record['APELLNOM']) {
                    info = record.APELLNOM || record['APELLNOM'];
                } else if (record.APELLIDO) {
                    info = `${record.APELLIDO}, ${record.NOMBRE || ''}`;
                }
                
                if (record.MATRICULA) {
                    info += ` - Mat: ${record.MATRICULA}`;
                }
                
                if (record.TITULO) {
                    info += ` - ${record.TITULO}`;
                }
                
                if (record.PROFESION) {
                    info += ` - ${record.PROFESION}`;
                }
                
                console.log(`  ${i+1}. ${info}`);
            }
            
            // Contar por profesión/título si existe
            if (fields.includes('TITULO') || fields.includes('PROFESION')) {
                const profesiones = new Map();
                reader.records.forEach(record => {
                    const prof = record.TITULO || record.PROFESION || 'Sin especificar';
                    profesiones.set(prof, (profesiones.get(prof) || 0) + 1);
                });
                
                console.log('\nDistribución por profesión:');
                const sorted = Array.from(profesiones.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                    
                sorted.forEach(([prof, count]) => {
                    if (prof && prof.trim()) {
                        console.log(`  ${prof}: ${count}`);
                    }
                });
            }
        }
        
    } catch (error) {
        console.log(`Error leyendo ${archivo}: ${error.message}`);
    }
}

(async () => {
    try {
        console.log('\n🔍 SISTEMA SV* - PROFESIONALES EXTERNOS (Arquitectos, Agrimensores, etc.)');
        console.log('='.repeat(80));
        
        // Analizar archivos SV más recientes
        const pathBase = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\';
        
        if (fs.existsSync(pathBase + 'SVPROF.DBF')) {
            await analizarDBF(pathBase + 'SVPROF.DBF', 'SVPROF - Profesionales Externos');
        }
        
        if (fs.existsSync(pathBase + 'SVMATRI.DBF')) {
            await analizarDBF(pathBase + 'SVMATRI.DBF', 'SVMATRI - Matrículas Externos');
        }
        
        console.log('\n🔍 SISTEMA SO* - OTROS PROFESIONALES (Lic. Higiene y Seguridad, etc.)');
        console.log('='.repeat(80));
        
        if (fs.existsSync(pathBase + 'SOPROF.DBF')) {
            await analizarDBF(pathBase + 'SOPROF.DBF', 'SOPROF - Otros Profesionales');
        }
        
        if (fs.existsSync(pathBase + 'SOMATRI.DBF')) {
            await analizarDBF(pathBase + 'SOMATRI.DBF', 'SOMATRI - Matrículas Otros');
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESUMEN');
        console.log('='.repeat(80));
        console.log('\nEstos profesionales NO pertenecen al COPIG pero pueden ser RT de empresas.');
        console.log('Incluyen: Arquitectos, Agrimensores, Lic. en Higiene y Seguridad, etc.');
        console.log('\n✅ Archivos identificados y listos para importar cuando lo necesites');
        
    } catch (error) {
        console.error('Error:', error);
    }
})();