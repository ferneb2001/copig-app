const Parser = require('node-dbf').default;
const fs = require('fs');

async function analyzeExternalProfessionals() {
    const files = [
        {
            name: 'SVPROF.DBF',
            path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SVPROF.DBF',
            description: 'Profesionales Externos (Arquitectos/Agrimensores)'
        },
        {
            name: 'SVMATRI.DBF', 
            path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SVMATRI.DBF',
            description: 'Matrículas de Profesionales Externos'
        },
        {
            name: 'SOPROF.DBF',
            path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SOPROF.DBF', 
            description: 'Otros Profesionales (Higiene y Seguridad)'
        },
        {
            name: 'SOMATRI.DBF',
            path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SOMATRI.DBF',
            description: 'Matrículas de Otros Profesionales'
        }
    ];

    for (const file of files) {
        try {
            console.log(`\n======================================`);
            console.log(`ANALIZANDO: ${file.name}`);
            console.log(`DESCRIPCIÓN: ${file.description}`);
            console.log(`======================================`);

            if (!fs.existsSync(file.path)) {
                console.log(`❌ ARCHIVO NO ENCONTRADO: ${file.path}`);
                continue;
            }

            const parser = new Parser(file.path);
            const records = await parser.parseSync();
            
            console.log(`📊 TOTAL REGISTROS: ${records.length}`);
            
            if (records.length === 0) {
                console.log(`⚠️ El archivo está vacío`);
                continue;
            }

            // Mostrar estructura de campos
            console.log(`\n📋 CAMPOS DISPONIBLES:`);
            if (records.length > 0) {
                const fields = Object.keys(records[0]);
                fields.forEach((field, index) => {
                    const sample = records[0][field];
                    console.log(`${index + 1}. ${field}: ${sample} (${typeof sample})`);
                });
            }

            // Mostrar primeros 10 registros
            console.log(`\n🔍 PRIMEROS 10 REGISTROS:`);
            for (let i = 0; i < Math.min(10, records.length); i++) {
                console.log(`\n--- REGISTRO ${i + 1} ---`);
                for (const [key, value] of Object.entries(records[i])) {
                    console.log(`${key}: ${value}`);
                }
            }

            // Análisis específico por tipo de archivo
            if (file.name.includes('PROF')) {
                await analyzeByCategory(records, file.name);
            } else if (file.name.includes('MATRI')) {
                await analyzeMatriculas(records, file.name);
            }

        } catch (error) {
            console.error(`❌ ERROR al procesar ${file.name}:`, error.message);
        }
    }
}

async function analyzeByCategory(records, fileName) {
    console.log(`\n📈 ANÁLISIS POR CATEGORÍA/TÍTULO - ${fileName}:`);
    
    // Buscar campo de categoría o título
    const categoryFields = ['CATEGOR', 'CATEGORIA', 'TITULO', 'PROFESI', 'TIPO'];
    let categoryField = null;
    
    if (records.length > 0) {
        const fields = Object.keys(records[0]);
        categoryField = fields.find(field => 
            categoryFields.some(cat => field.toUpperCase().includes(cat))
        );
    }
    
    if (categoryField) {
        const categoryCounts = {};
        records.forEach(record => {
            const category = record[categoryField] || 'Sin categoría';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        console.log(`Campo analizado: ${categoryField}`);
        Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`  ${category}: ${count} profesionales`);
            });
    } else {
        console.log('No se encontró campo de categoría/título');
    }
    
    // Buscar profesionales activos
    const statusFields = ['ACTIVO', 'ESTADO', 'STATUS', 'VIGENTE'];
    let statusField = null;
    
    if (records.length > 0) {
        const fields = Object.keys(records[0]);
        statusField = fields.find(field => 
            statusFields.some(status => field.toUpperCase().includes(status))
        );
    }
    
    if (statusField) {
        const activeCounts = {};
        records.forEach(record => {
            const status = record[statusField] || 'Sin estado';
            activeCounts[status] = (activeCounts[status] || 0) + 1;
        });
        
        console.log(`\nAnálisis de estado (${statusField}):`);
        Object.entries(activeCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count} profesionales`);
        });
    }
}

async function analyzeMatriculas(records, fileName) {
    console.log(`\n📈 ANÁLISIS DE MATRÍCULAS - ${fileName}:`);
    
    // Buscar campo de número de matrícula
    const matriculaFields = ['MATPROF', 'MATRICULA', 'NUMERO', 'NMATRIC'];
    let matriculaField = null;
    
    if (records.length > 0) {
        const fields = Object.keys(records[0]);
        matriculaField = fields.find(field => 
            matriculaFields.some(mat => field.toUpperCase().includes(mat))
        );
    }
    
    if (matriculaField) {
        const validMatriculas = records.filter(record => 
            record[matriculaField] && record[matriculaField] !== 0
        );
        
        console.log(`Total matrículas válidas: ${validMatriculas.length}`);
        
        if (validMatriculas.length > 0) {
            const minMatricula = Math.min(...validMatriculas.map(r => r[matriculaField]));
            const maxMatricula = Math.max(...validMatriculas.map(r => r[matriculaField]));
            
            console.log(`Rango de matrículas: ${minMatricula} - ${maxMatricula}`);
            
            // Mostrar algunas matrículas de ejemplo
            console.log(`\nEjemplos de matrículas:`);
            validMatriculas.slice(0, 20).forEach((record, index) => {
                console.log(`  ${index + 1}. Matrícula: ${record[matriculaField]}`);
            });
        }
    }
}

// Ejecutar el análisis
analyzeExternalProfessionals()
    .then(() => {
        console.log('\n✅ Análisis completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error en análisis:', error);
        process.exit(1);
    });