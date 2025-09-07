const Parser = require('node-dbf').default;
const fs = require('fs');
const xlsx = require('xlsx');

// Primero vamos a leer las matrículas que ya tenemos en el sistema
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function findMissingExternalMatriculas() {
    console.log('🔍 BUSCANDO MATRÍCULAS EXTERNAS FALTANTES');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');
    
    try {
        // PASO 1: Obtener todas las matrículas del Excel
        console.log('📋 PASO 1: Leyendo matrículas del Excel emp-rtcos-20250831.xlsx...');
        
        const excelPath = 'C:/copig-app/emp-rtcos-20250831.xlsx';
        if (!fs.existsSync(excelPath)) {
            console.log(`❌ No se encontró el archivo Excel: ${excelPath}`);
            return;
        }
        
        const workbook = xlsx.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`✅ ${excelData.length} registros leídos del Excel\n`);
        
        // PASO 2: Obtener matrículas existentes en BD
        console.log('📊 PASO 2: Obteniendo matrículas existentes en BD...');
        
        const result = await pool.query(`
            SELECT numero_matricula 
            FROM copig.matriculas 
            WHERE numero_matricula IS NOT NULL
        `);
        
        const matriculasExistentes = new Set(result.rows.map(r => parseInt(r.numero_matricula)));
        console.log(`✅ ${matriculasExistentes.size} matrículas existentes en BD\n`);
        
        // PASO 3: Encontrar matrículas faltantes del Excel
        console.log('🔍 PASO 3: Identificando matrículas faltantes del Excel...');
        
        const matriculasFaltantes = [];
        excelData.forEach((row, index) => {
            const matricula = parseInt(row.MATRICULA);
            if (matricula && !matriculasExistentes.has(matricula)) {
                matriculasFaltantes.push({
                    matricula: matricula,
                    profesional: row.PROFESIONAL || 'Sin nombre',
                    empresa: row.EMPRESA || 'Sin empresa',
                    fila: index + 2 // +2 porque las hojas empiezan en 1 y hay header
                });
            }
        });
        
        console.log(`❌ ${matriculasFaltantes.length} matrículas faltantes identificadas\n`);
        
        // PASO 4: Buscar en archivos DBF externos
        console.log('🔎 PASO 4: Buscando matrículas faltantes en archivos DBF externos...\n');
        
        const dbfFiles = [
            {
                name: 'SVMATRI.DBF',
                path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SVMATRI.DBF',
                description: 'Matrículas Externas (Arquitectos/Agrimensores)',
                type: 'SV'
            },
            {
                name: 'SOMATRI.DBF',
                path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SOMATRI.DBF',
                description: 'Matrículas Otros (Higiene y Seguridad)',
                type: 'SO'
            }
        ];
        
        const encontradas = [];
        let totalProcesadas = 0;
        
        for (const dbfFile of dbfFiles) {
            console.log(`📁 Analizando ${dbfFile.name} - ${dbfFile.description}...`);
            
            const matriculasEncontradas = await buscarEnDBF(dbfFile, matriculasFaltantes);
            encontradas.push(...matriculasEncontradas);
            totalProcesadas++;
            
            console.log(`   ✅ ${matriculasEncontradas.length} matrículas encontradas en ${dbfFile.name}\n`);
        }
        
        // PASO 5: Mostrar resultados
        console.log('📊 RESUMEN DE RESULTADOS');
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log(`📋 Total matrículas faltantes en Excel: ${matriculasFaltantes.length}`);
        console.log(`✅ Matrículas encontradas en DBF externos: ${encontradas.length}`);
        console.log(`❌ Matrículas aún no encontradas: ${matriculasFaltantes.length - encontradas.length}\n`);
        
        if (encontradas.length > 0) {
            console.log('🎯 MATRÍCULAS ENCONTRADAS EN DBF EXTERNOS:');
            console.log('────────────────────────────────────────────────────────────────────────────────');
            
            // Agrupar por tipo de archivo
            const porTipo = {};
            encontradas.forEach(item => {
                if (!porTipo[item.tipo]) porTipo[item.tipo] = [];
                porTipo[item.tipo].push(item);
            });
            
            Object.entries(porTipo).forEach(([tipo, items]) => {
                console.log(`\n📁 ${tipo === 'SV' ? 'PROFESIONALES EXTERNOS (Arquitectos/Agrimensores)' : 'OTROS PROFESIONALES (Higiene/Seguridad)'}: ${items.length}`);
                
                items.slice(0, 10).forEach((item, index) => {
                    console.log(`   ${index + 1}. Matrícula ${item.matricula} → ${item.profesionalNombre || 'Sin nombre'}`);
                    console.log(`      Excel: ${item.profesionalExcel} - ${item.empresa}`);
                    if (item.titulo) console.log(`      Título: ${item.titulo} - Categoría: ${item.categoria}`);
                });
                
                if (items.length > 10) {
                    console.log(`   ... y ${items.length - 10} más`);
                }
            });
        }
        
        // PASO 6: Matrículas aún no encontradas
        const noEncontradas = matriculasFaltantes.filter(m => 
            !encontradas.some(e => e.matricula === m.matricula)
        );
        
        if (noEncontradas.length > 0) {
            console.log('\n❌ MATRÍCULAS AÚN NO ENCONTRADAS:');
            console.log('────────────────────────────────────────────────────────────────────────────────');
            
            noEncontradas.slice(0, 20).forEach((item, index) => {
                console.log(`${index + 1}. Matrícula ${item.matricula} → ${item.profesional} (${item.empresa})`);
            });
            
            if (noEncontradas.length > 20) {
                console.log(`... y ${noEncontradas.length - 20} más`);
            }
        }
        
        console.log('\n✅ Análisis completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function buscarEnDBF(dbfFile, matriculasFaltantes) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dbfFile.path)) {
            console.log(`   ❌ Archivo no encontrado: ${dbfFile.path}`);
            resolve([]);
            return;
        }
        
        const parser = new Parser(dbfFile.path);
        const encontradas = [];
        const matriculasBuscadas = new Set(matriculasFaltantes.map(m => m.matricula));
        
        parser.on('record', (record) => {
            const numeroMatricula = parseInt(record.NUMERO);
            
            if (numeroMatricula && matriculasBuscadas.has(numeroMatricula)) {
                const matriculaOriginal = matriculasFaltantes.find(m => m.matricula === numeroMatricula);
                
                encontradas.push({
                    matricula: numeroMatricula,
                    tipo: dbfFile.type,
                    archivo: dbfFile.name,
                    categoria: record.CATEGO,
                    titulo: record.TITULO,
                    condicion: record.CONDIC,
                    dctipo: record.DCTIPO,
                    dcnro: record.DCNRO,
                    profesionalExcel: matriculaOriginal.profesional,
                    empresa: matriculaOriginal.empresa,
                    filaExcel: matriculaOriginal.fila
                });
            }
        });
        
        parser.on('end', () => {
            resolve(encontradas);
        });
        
        parser.on('error', (error) => {
            console.error(`   ❌ Error procesando ${dbfFile.name}:`, error);
            resolve([]);
        });
        
        parser.parse();
    });
}

// Ejecutar
findMissingExternalMatriculas()
    .then(() => {
        pool.end();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        pool.end();
        process.exit(1);
    });