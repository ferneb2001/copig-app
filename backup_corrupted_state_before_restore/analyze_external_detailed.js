const Parser = require('node-dbf').default;
const fs = require('fs');

async function analyzeFileComplete(filePath, fileName, description) {
    return new Promise((resolve, reject) => {
        console.log(`\n══════════════════════════════════════════════════════════════════════════════`);
        console.log(`ANÁLISIS COMPLETO: ${fileName}`);
        console.log(`DESCRIPCIÓN: ${description}`);
        console.log(`══════════════════════════════════════════════════════════════════════════════`);

        if (!fs.existsSync(filePath)) {
            console.log(`❌ ARCHIVO NO ENCONTRADO: ${filePath}`);
            resolve();
            return;
        }

        const parser = new Parser(filePath);
        let allRecords = [];
        let totalRegistros = 0;

        parser.on('header', (header) => {
            totalRegistros = header.numberOfRecords;
            console.log(`📊 TOTAL REGISTROS: ${totalRegistros}`);
        });

        parser.on('record', (record) => {
            allRecords.push(record);
        });

        parser.on('end', () => {
            // Análisis específico por tipo de archivo
            if (fileName.includes('PROF')) {
                analyzeProfessionals(allRecords, fileName);
            } else if (fileName.includes('MATRI')) {
                analyzeMatriculasComplete(allRecords, fileName);
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

function analyzeProfessionals(records, fileName) {
    console.log(`\n📊 ANÁLISIS DETALLADO DE PROFESIONALES - ${fileName}:`);
    console.log(`Total registros procesados: ${records.length}`);
    
    // Análisis por DCTIPO (parece ser el tipo de documento o profesional)
    const tipoCounts = {};
    records.forEach(record => {
        const tipo = record.DCTIPO || 'Sin tipo';
        tipoCounts[tipo] = (tipoCounts[tipo] || 0) + 1;
    });
    
    console.log(`\n📋 ANÁLISIS POR DCTIPO:`);
    Object.entries(tipoCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tipo, count]) => {
            console.log(`  Tipo ${tipo}: ${count} profesionales`);
        });
    
    // Análisis por estado
    const estadoCounts = {};
    records.forEach(record => {
        const estado = record.ESTADO || 'Sin estado';
        estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;
    });
    
    console.log(`\n📊 ANÁLISIS POR ESTADO:`);
    Object.entries(estadoCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([estado, count]) => {
            console.log(`  Estado ${estado}: ${count} profesionales`);
        });
    
    // Mostrar algunos ejemplos de profesionales activos de cada tipo
    console.log(`\n👥 EJEMPLOS DE PROFESIONALES POR TIPO:`);
    
    [1, 2].forEach(tipo => {
        const profesionesTipo = records.filter(r => r.DCTIPO === tipo && r.ESTADO === 'A');
        console.log(`\n--- TIPO ${tipo} (ACTIVOS) - Total: ${profesionesTipo.length} ---`);
        
        profesionesTipo.slice(0, 5).forEach((prof, index) => {
            console.log(`${index + 1}. ${prof.NOMBRE} (DNI: ${prof.DCNRO})`);
            if (prof.DOMICI) console.log(`   Domicilio: ${prof.DOMICI}`);
            if (prof.TELEF && prof.TELEF !== '0') console.log(`   Teléfono: ${prof.TELEF}`);
            if (prof.SPEMAIL) console.log(`   Email: ${prof.SPEMAIL}`);
        });
    });
    
    // Buscar profesionales fallecidos
    const fallecidos = records.filter(r => r.FALLEC && r.FALLEC !== '');
    console.log(`\n⚰️  PROFESIONALES FALLECIDOS: ${fallecidos.length}`);
    
    // Profesionales con CUIT
    const conCuit = records.filter(r => r.CUIT && r.CUIT > 0);
    console.log(`💼 PROFESIONALES CON CUIT: ${conCuit.length}`);
    
    // Profesionales con email
    const conEmail = records.filter(r => r.SPEMAIL && r.SPEMAIL.trim() !== '');
    console.log(`📧 PROFESIONALES CON EMAIL: ${conEmail.length}`);
}

function analyzeMatriculasComplete(records, fileName) {
    console.log(`\n📊 ANÁLISIS DETALLADO DE MATRÍCULAS - ${fileName}:`);
    console.log(`Total registros procesados: ${records.length}`);
    
    // Análisis por categoría
    const categoriaCounts = {};
    records.forEach(record => {
        const categoria = record.CATEGO || 'Sin categoría';
        categoriaCounts[categoria] = (categoriaCounts[categoria] || 0) + 1;
    });
    
    console.log(`\n📋 ANÁLISIS POR CATEGORÍA:`);
    Object.entries(categoriaCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([categoria, count]) => {
            console.log(`  ${categoria}: ${count} matrículas`);
        });
    
    // Análisis por título
    const tituloCounts = {};
    records.forEach(record => {
        const titulo = record.TITULO || 'Sin título';
        tituloCounts[titulo] = (tituloCounts[titulo] || 0) + 1;
    });
    
    console.log(`\n🎓 ANÁLISIS POR TÍTULO:`);
    Object.entries(tituloCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([titulo, count]) => {
            console.log(`  Título ${titulo}: ${count} matrículas`);
        });
    
    // Análisis por condición
    const condicionCounts = {};
    records.forEach(record => {
        const condicion = record.CONDIC || 'Sin condición';
        condicionCounts[condicion] = (condicionCounts[condicion] || 0) + 1;
    });
    
    console.log(`\n📝 ANÁLISIS POR CONDICIÓN:`);
    Object.entries(condicionCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([condicion, count]) => {
            console.log(`  Condición ${condicion}: ${count} matrículas`);
        });
    
    // Matrículas vigentes vs vencidas
    const conVencimiento = records.filter(r => r.VTOHAB && r.VTOHAB !== '');
    console.log(`\n⏰ MATRÍCULAS CON VENCIMIENTO: ${conVencimiento.length}`);
    
    // Rango de números de matrícula
    const numerosValidos = records
        .filter(r => r.NUMERO && r.NUMERO > 0)
        .map(r => r.NUMERO);
    
    if (numerosValidos.length > 0) {
        const min = Math.min(...numerosValidos);
        const max = Math.max(...numerosValidos);
        console.log(`📈 RANGO MATRÍCULAS: ${min} - ${max}`);
        
        // Últimas matrículas emitidas (top 10)
        const ultimasMatriculas = [...numerosValidos]
            .sort((a, b) => b - a)
            .slice(0, 10);
        
        console.log(`\n🆕 ÚLTIMAS 10 MATRÍCULAS EMITIDAS:`);
        ultimasMatriculas.forEach((numero, index) => {
            const matricula = records.find(r => r.NUMERO === numero);
            console.log(`${index + 1}. Matrícula ${numero} - ${matricula.CATEGO} - Título ${matricula.TITULO}`);
        });
    }
}

async function main() {
    console.log('🔍 ANÁLISIS COMPLETO DE PROFESIONALES EXTERNOS AL COPIG');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    
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
            await analyzeFileComplete(file.path, file.name, file.description);
        } catch (error) {
            console.error(`❌ ERROR procesando ${file.name}:`, error);
        }
    }
    
    console.log('\n✅ Análisis completo finalizado');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
}

// Ejecutar el análisis
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error en análisis:', error);
        process.exit(1);
    });