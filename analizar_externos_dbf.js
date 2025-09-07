const DBF = require('node-dbf').default;
const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log(' ANÁLISIS DE PROFESIONALES EXTERNOS AL COPIG (NO INGENIEROS/GEÓLOGOS)');
console.log('='.repeat(80));

async function analizarArchivo(rutaArchivo, nombre) {
    try {
        if (!fs.existsSync(rutaArchivo)) {
            console.log(`❌ Archivo no encontrado: ${rutaArchivo}`);
            return null;
        }
        
        console.log(`\n📁 ${nombre}`);
        console.log(`Archivo: ${rutaArchivo}`);
        console.log('-'.repeat(60));
        
        const dbfFile = new DBF(rutaArchivo, 'latin1');
        console.log(`Total registros: ${dbfFile.recordCount}`);
        
        if (dbfFile.recordCount > 0) {
            // Mostrar estructura
            console.log('\nCampos disponibles:');
            const primerRegistro = dbfFile.records[0];
            Object.keys(primerRegistro).forEach(campo => {
                console.log(`  - ${campo}`);
            });
            
            // Mostrar algunos ejemplos
            console.log('\nPrimeros 10 registros:');
            for (let i = 0; i < Math.min(10, dbfFile.recordCount); i++) {
                const record = dbfFile.records[i];
                let info = '';
                
                // Construir información según campos disponibles
                if (record['APELLNOM']) {
                    info = record['APELLNOM'];
                } else if (record.APELLIDO && record.NOMBRE) {
                    info = `${record.APELLIDO}, ${record.NOMBRE}`;
                }
                
                if (record.MATRICULA) {
                    info += ` | Mat: ${record.MATRICULA}`;
                }
                
                if (record.TITULO) {
                    info += ` | ${record.TITULO}`;
                }
                
                if (record.PROFESION) {
                    info += ` | ${record.PROFESION}`;
                }
                
                if (record.DOCUMENTO) {
                    info += ` | DNI: ${record.DOCUMENTO}`;
                }
                
                console.log(`  ${i+1}. ${info || JSON.stringify(record).substring(0, 100)}`);
            }
            
            // Analizar tipos de profesionales si hay campo TITULO o PROFESION
            const titulos = new Map();
            dbfFile.records.forEach(record => {
                const titulo = record.TITULO || record.PROFESION || record.TIPO || '';
                if (titulo && titulo.trim()) {
                    titulos.set(titulo.trim(), (titulos.get(titulo.trim()) || 0) + 1);
                }
            });
            
            if (titulos.size > 0) {
                console.log('\n📊 Distribución por título/profesión:');
                const sorted = Array.from(titulos.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 15);
                    
                sorted.forEach(([titulo, count]) => {
                    console.log(`  ${titulo}: ${count} profesionales`);
                });
            }
            
            return dbfFile.recordCount;
        }
        
        return 0;
        
    } catch (error) {
        console.log(`Error procesando ${rutaArchivo}: ${error.message}`);
        return null;
    }
}

(async () => {
    try {
        const basePath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\';
        
        console.log('\n' + '='.repeat(80));
        console.log(' SISTEMA SV* - PROFESIONALES EXTERNOS (Arquitectos, Agrimensores, etc.)');
        console.log('='.repeat(80));
        
        let totalSV = 0;
        
        // Analizar SVPROF
        const svprof = await analizarArchivo(path.join(basePath, 'SVPROF.DBF'), 'SVPROF - Datos de Profesionales Externos');
        if (svprof) totalSV += svprof;
        
        // Analizar SVMATRI
        const svmatri = await analizarArchivo(path.join(basePath, 'SVMATRI.DBF'), 'SVMATRI - Matrículas de Externos');
        
        console.log('\n' + '='.repeat(80));
        console.log(' SISTEMA SO* - OTROS PROFESIONALES (Lic. Higiene y Seguridad, etc.)');
        console.log('='.repeat(80));
        
        let totalSO = 0;
        
        // Analizar SOPROF
        const soprof = await analizarArchivo(path.join(basePath, 'SOPROF.DBF'), 'SOPROF - Otros Profesionales');
        if (soprof) totalSO += soprof;
        
        // Analizar SOMATRI
        const somatri = await analizarArchivo(path.join(basePath, 'SOMATRI.DBF'), 'SOMATRI - Matrículas de Otros');
        
        // Verificar en BD actual
        console.log('\n' + '='.repeat(80));
        console.log(' VERIFICACIÓN EN BASE DE DATOS ACTUAL');
        console.log('='.repeat(80));
        
        const { Pool } = require('pg');
        const config = require('./config.json');
        const pool = new Pool(config.database);
        
        const result = await pool.query(`
            SELECT 
                COUNT(DISTINCT p.id) as total_profesionales,
                COUNT(DISTINCT CASE WHEN p.titulo ILIKE '%arquitect%' THEN p.id END) as arquitectos,
                COUNT(DISTINCT CASE WHEN p.titulo ILIKE '%agrimens%' THEN p.id END) as agrimensores,
                COUNT(DISTINCT CASE WHEN p.titulo ILIKE '%higiene%' THEN p.id END) as higiene_seguridad,
                COUNT(DISTINCT CASE WHEN p.titulo ILIKE '%licenciad%' THEN p.id END) as licenciados,
                COUNT(DISTINCT CASE WHEN p.titulo NOT ILIKE '%ingenier%' 
                    AND p.titulo NOT ILIKE '%geolog%' 
                    AND p.titulo IS NOT NULL 
                    AND p.titulo != '' THEN p.id END) as otros_no_copig
            FROM copig.profesionales p
        `);
        
        console.log('\nProfesionales en BD actual:');
        console.log(`  Total profesionales: ${result.rows[0].total_profesionales}`);
        console.log(`  Arquitectos: ${result.rows[0].arquitectos}`);
        console.log(`  Agrimensores: ${result.rows[0].agrimensores}`);
        console.log(`  Lic. Higiene y Seguridad: ${result.rows[0].higiene_seguridad}`);
        console.log(`  Licenciados (varios): ${result.rows[0].licenciados}`);
        console.log(`  Otros NO COPIG: ${result.rows[0].otros_no_copig}`);
        
        await pool.end();
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESUMEN FINAL');
        console.log('='.repeat(80));
        
        console.log('\n📊 TOTALES EN ARCHIVOS DBF:');
        console.log(`  Sistema SV* (externos): ${totalSV} profesionales`);
        console.log(`  Sistema SO* (otros): ${totalSO} profesionales`);
        console.log(`  TOTAL NO COPIG: ${totalSV + totalSO} profesionales`);
        
        console.log('\n💡 CONCLUSIÓN:');
        console.log('Estos son los profesionales que NO son ingenieros/geólogos pero pueden');
        console.log('ser Representantes Técnicos de empresas. Incluyen:');
        console.log('  - Arquitectos');
        console.log('  - Agrimensores');
        console.log('  - Licenciados en Higiene y Seguridad');
        console.log('  - Técnicos varios');
        console.log('  - Otros profesionales habilitados');
        
        console.log('\n⚠️ IMPORTANTE:');
        console.log('Estos profesionales deben importarse para completar las asignaciones');
        console.log('de RT del archivo Excel de Peñaloza (faltan ~530 matrículas).');
        
    } catch (error) {
        console.error('Error general:', error);
    }
})();