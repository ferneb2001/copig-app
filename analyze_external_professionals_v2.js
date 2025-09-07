const Parser = require('node-dbf').default;
const fs = require('fs');

async function analyzeFile(filePath, fileName, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n======================================`);
        console.log(`ANALIZANDO: ${fileName}`);
        console.log(`DESCRIPCIÓN: ${description}`);
        console.log(`======================================`);

        if (!fs.existsSync(filePath)) {
            console.log(`❌ ARCHIVO NO ENCONTRADO: ${filePath}`);
            resolve();
            return;
        }

        const parser = new Parser(filePath);
        let records = [];
        let campos = null;
        let totalRegistros = 0;

        parser.on('header', (header) => {
            totalRegistros = header.numberOfRecords;
            console.log(`📊 TOTAL REGISTROS: ${totalRegistros}`);
            
            console.log(`\n📋 CAMPOS DISPONIBLES:`);
            header.fields.forEach((field, index) => {
                console.log(`${index + 1}. ${field.name} (${field.type}, longitud: ${field.length})`);
            });
            campos = header.fields.map(f => f.name);
        });

        parser.on('record', (record) => {
            // Guardar solo los primeros 10 para mostrar ejemplos
            if (records.length < 10) {
                records.push(record);
            }
        });

        parser.on('end', () => {
            console.log(`\n🔍 PRIMEROS 10 REGISTROS:`);
            for (let i = 0; i < Math.min(10, records.length); i++) {
                console.log(`\n--- REGISTRO ${i + 1} ---`);
                for (const [key, value] of Object.entries(records[i])) {
                    console.log(`${key}: ${value}`);
                }
            }

            // Análisis específico por tipo de archivo
            if (fileName.includes('PROF')) {
                analyzeByCategory(records, fileName, campos);
            } else if (fileName.includes('MATRI')) {
                analyzeMatriculas(records, fileName, campos);
            }

            resolve();
        });

        parser.on('error', (error) => {
            console.error(`❌ ERROR al procesar ${fileName}:`, error.message);
            reject(error);
        });

        parser.parse();
    });
}

function analyzeByCategory(records, fileName, campos) {
    console.log(`\n📈 ANÁLISIS POR CATEGORÍA/TÍTULO - ${fileName}:`);
    
    // Buscar campo de categoría o título
    const categoryFields = ['CATEGOR', 'CATEGORIA', 'TITULO', 'PROFESI', 'TIPO'];
    let categoryField = null;
    
    if (campos) {
        categoryField = campos.find(field => 
            categoryFields.some(cat => field.toUpperCase().includes(cat))
        );
    }
    
    if (categoryField && records.length > 0) {
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
    
    if (campos) {
        statusField = campos.find(field => 
            statusFields.some(status => field.toUpperCase().includes(status))
        );
    }
    
    if (statusField && records.length > 0) {
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

function analyzeMatriculas(records, fileName, campos) {
    console.log(`\n📈 ANÁLISIS DE MATRÍCULAS - ${fileName}:`);
    
    // Buscar campo de número de matrícula
    const matriculaFields = ['MATPROF', 'MATRICULA', 'NUMERO', 'NMATRIC'];
    let matriculaField = null;
    
    if (campos) {
        matriculaField = campos.find(field => 
            matriculaFields.some(mat => field.toUpperCase().includes(mat))
        );
    }
    
    if (matriculaField && records.length > 0) {
        const validMatriculas = records.filter(record => 
            record[matriculaField] && record[matriculaField] !== 0
        );
        
        console.log(`Total matrículas válidas (muestra): ${validMatriculas.length}/10`);
        
        if (validMatriculas.length > 0) {
            const matriculas = validMatriculas.map(r => r[matriculaField]).filter(m => m > 0);
            if (matriculas.length > 0) {
                const minMatricula = Math.min(...matriculas);
                const maxMatricula = Math.max(...matriculas);
                
                console.log(`Rango de matrículas (en muestra): ${minMatricula} - ${maxMatricula}`);
                
                // Mostrar algunas matrículas de ejemplo
                console.log(`\nEjemplos de matrículas:`);
                validMatriculas.slice(0, 10).forEach((record, index) => {
                    console.log(`  ${index + 1}. Matrícula: ${record[matriculaField]}`);
                });
            }
        }
    } else {
        console.log('No se encontró campo de matrícula válido');
    }
}

async function main() {
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
            await analyzeFile(file.path, file.name, file.description);
        } catch (error) {
            console.error(`❌ ERROR procesando ${file.name}:`, error);
        }
    }
    
    console.log('\n✅ Análisis completado');
}

// Ejecutar el análisis
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error en análisis:', error);
        process.exit(1);
    });