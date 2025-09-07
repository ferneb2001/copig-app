const Parser = require('node-dbf').default;
const fs = require('fs');
const xlsx = require('xlsx');

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeMissingRepresentatives() {
    console.log('🔍 ANÁLISIS DE REPRESENTANTES TÉCNICOS FALTANTES');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');
    
    try {
        // PASO 1: Contar representantes actuales
        console.log('📊 PASO 1: Estado actual del sistema...');
        
        const currentReps = await pool.query(`
            SELECT COUNT(*) as total 
            FROM copig.representantes_tecnicos
        `);
        
        const totalEmpresas = await pool.query(`
            SELECT COUNT(*) as total 
            FROM copig.empresas
        `);
        
        const empresasConRep = await pool.query(`
            SELECT COUNT(DISTINCT empresa_id) as total 
            FROM copig.representantes_tecnicos
        `);
        
        console.log(`   ✅ Representantes técnicos actuales: ${currentReps.rows[0].total}`);
        console.log(`   ✅ Total empresas: ${totalEmpresas.rows[0].total}`);
        console.log(`   ✅ Empresas con representantes: ${empresasConRep.rows[0].total}`);
        console.log(`   ❌ Empresas sin representantes: ${totalEmpresas.rows[0].total - empresasConRep.rows[0].total}\n`);
        
        // PASO 2: Analizar el Excel original
        console.log('📋 PASO 2: Analizando Excel emp-rtcos-20250831.xlsx...');
        
        const excelPath = 'C:/copig-app/emp-rtcos-20250831.xlsx';
        if (!fs.existsSync(excelPath)) {
            console.log(`❌ No se encontró el archivo Excel: ${excelPath}`);
            return;
        }
        
        const workbook = xlsx.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`   📄 Total filas en Excel: ${excelData.length}`);
        
        // Obtener todas las matrículas únicas del Excel
        const matriculasExcel = new Set();
        excelData.forEach(row => {
            const matricula = parseInt(row.MATRICULA);
            if (matricula && !isNaN(matricula)) {
                matriculasExcel.add(matricula);
            }
        });
        
        console.log(`   👥 Matrículas únicas en Excel: ${matriculasExcel.size}\n`);
        
        // PASO 3: Verificar cuáles de estas matrículas existen en el sistema
        console.log('🔍 PASO 3: Verificando existencia en sistema...');
        
        const matriculasArray = Array.from(matriculasExcel);
        const matriculasEnSistema = await pool.query(`
            SELECT numero_matricula 
            FROM copig.matriculas 
            WHERE numero_matricula = ANY($1)
        `, [matriculasArray]);
        
        const matriculasSistemaSet = new Set(matriculasEnSistema.rows.map(r => parseInt(r.numero_matricula)));
        
        console.log(`   💾 Matrículas del Excel encontradas en sistema: ${matriculasSistemaSet.size}`);
        
        const matriculasFaltantes = matriculasArray.filter(m => !matriculasSistemaSet.has(m));
        console.log(`   ❌ Matrículas del Excel NO encontradas en sistema: ${matriculasFaltantes.length}\n`);
        
        if (matriculasFaltantes.length > 0) {
            // PASO 4: Buscar matrículas faltantes en DBF externos
            console.log('🔎 PASO 4: Buscando matrículas faltantes en DBF externos...\n');
            
            const dbfFiles = [
                {
                    name: 'SVMATRI.DBF',
                    path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SVMATRI.DBF',
                    profPath: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SVPROF.DBF',
                    description: 'Profesionales Externos (Arquitectos/Agrimensores)',
                    type: 'SV'
                },
                {
                    name: 'SOMATRI.DBF',
                    path: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SOMATRI.DBF',
                    profPath: 'C:/copig-app/COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SOPROF.DBF',
                    description: 'Otros Profesionales (Higiene/Seguridad)',
                    type: 'SO'
                }
            ];
            
            let totalEncontradas = 0;
            const detalleEncontradas = [];
            
            for (const dbfFile of dbfFiles) {
                console.log(`📁 Buscando en ${dbfFile.name} - ${dbfFile.description}...`);
                
                const encontradas = await buscarMatriculasEnDBF(dbfFile, matriculasFaltantes);
                totalEncontradas += encontradas.length;
                detalleEncontradas.push(...encontradas);
                
                console.log(`   ✅ ${encontradas.length} matrículas encontradas\n`);
            }
            
            // PASO 5: Mostrar ejemplos de matrículas encontradas
            if (detalleEncontradas.length > 0) {
                console.log('🎯 EJEMPLOS DE MATRÍCULAS ENCONTRADAS EN DBF EXTERNOS:');
                console.log('────────────────────────────────────────────────────────────────────────────────');
                
                // Agrupar por tipo
                const porTipo = { SV: [], SO: [] };
                detalleEncontradas.forEach(item => {
                    porTipo[item.tipo].push(item);
                });
                
                Object.entries(porTipo).forEach(([tipo, items]) => {
                    if (items.length > 0) {
                        console.log(`\n📁 ${tipo === 'SV' ? 'ARQUITECTOS/AGRIMENSORES' : 'HIGIENE Y SEGURIDAD'}: ${items.length} matrículas`);
                        
                        items.slice(0, 10).forEach((item, index) => {
                            const ejemplosExcel = excelData.filter(row => parseInt(row.MATRICULA) === item.matricula);
                            console.log(`   ${index + 1}. Mat. ${item.matricula} → ${item.profesionalNombre || 'Sin nombre en DBF'}`);
                            console.log(`      Título: ${item.titulo} - Categoría: ${item.categoria}`);
                            if (ejemplosExcel.length > 0) {
                                console.log(`      En Excel aparece como: ${ejemplosExcel[0].PROFESIONAL}`);
                                console.log(`      Para empresa: ${ejemplosExcel[0].EMPRESA}`);
                            }
                        });
                        
                        if (items.length > 10) {
                            console.log(`   ... y ${items.length - 10} más`);
                        }
                    }
                });
            }
            
            // PASO 6: Análisis de títulos de las matrículas encontradas
            if (detalleEncontradas.length > 0) {
                console.log('\n📚 ANÁLISIS POR TIPO DE TÍTULO:');
                console.log('────────────────────────────────────────────────────────────────────────────────');
                
                const titulosCounts = {};
                detalleEncontradas.forEach(item => {
                    const key = `${item.titulo} (${item.tipo})`;
                    titulosCounts[key] = (titulosCounts[key] || 0) + 1;
                });
                
                Object.entries(titulosCounts)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([titulo, count]) => {
                        console.log(`   ${titulo}: ${count} profesionales`);
                    });
            }
        }
        
        // PASO 7: Resumen final
        console.log('\n📊 RESUMEN FINAL');
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log(`📄 Total matrículas únicas en Excel: ${matriculasExcel.size}`);
        console.log(`💾 Matrículas ya en sistema COPIG: ${matriculasSistemaSet.size}`);
        console.log(`❌ Matrículas faltantes en sistema: ${matriculasFaltantes.length}`);
        console.log(`✅ Encontradas en DBF externos: ${totalEncontradas}`);
        console.log(`❓ Aún no localizadas: ${matriculasFaltantes.length - totalEncontradas}`);
        
        const porcentajeEncontrado = matriculasFaltantes.length > 0 ? 
            ((totalEncontradas / matriculasFaltantes.length) * 100).toFixed(1) : 0;
        
        console.log(`\n📈 TASA DE RECUPERACIÓN: ${porcentajeEncontrado}% de las faltantes fueron encontradas en DBF externos`);
        
        if (totalEncontradas > 0) {
            console.log('\n💡 CONCLUSIÓN:');
            console.log(`Los ${totalEncontradas} profesionales encontrados en archivos DBF externos (SV*/SO*) son:`);
            console.log('• Arquitectos y Agrimensores (SVPROF.DBF/SVMATRI.DBF)');
            console.log('• Licenciados en Higiene y Seguridad (SOPROF.DBF/SOMATRI.DBF)');
            console.log('\nEstos profesionales NO están en el sistema actual porque:');
            console.log('• No fueron importados junto con los ingenieros/geólogos principales');
            console.log('• Son profesionales "externos" al COPIG que pueden ser representantes técnicos');
            
            console.log('\n🚀 PRÓXIMOS PASOS RECOMENDADOS:');
            console.log('1. Importar profesionales de SVPROF.DBF con sus matrículas SVMATRI.DBF');
            console.log('2. Importar profesionales de SOPROF.DBF con sus matrículas SOMATRI.DBF');
            console.log('3. Re-ejecutar importación de representantes técnicos del Excel');
            console.log(`4. Esto debería completar los ~${totalEncontradas} representantes técnicos faltantes`);
        }
        
        console.log('\n✅ Análisis completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function buscarMatriculasEnDBF(dbfFile, matriculasBuscadas) {
    const matriculasMap = await leerMatriculasDBF(dbfFile.path);
    const profesionalesMap = await leerProfesionalesDBF(dbfFile.profPath);
    
    const encontradas = [];
    const matriculasSet = new Set(matriculasBuscadas);
    
    matriculasMap.forEach((matriculaInfo, numero) => {
        if (matriculasSet.has(numero)) {
            const profesionalInfo = profesionalesMap.get(matriculaInfo.dcnro);
            encontradas.push({
                matricula: numero,
                tipo: dbfFile.type,
                archivo: dbfFile.name,
                titulo: matriculaInfo.titulo,
                categoria: matriculaInfo.categoria,
                profesionalNombre: profesionalInfo ? profesionalInfo.nombre : null,
                profesionalEstado: profesionalInfo ? profesionalInfo.estado : null
            });
        }
    });
    
    return encontradas;
}

async function leerMatriculasDBF(path) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            resolve(new Map());
            return;
        }
        
        const parser = new Parser(path);
        const matriculas = new Map();
        
        parser.on('record', (record) => {
            if (record.NUMERO && record.NUMERO > 0) {
                matriculas.set(record.NUMERO, {
                    numero: record.NUMERO,
                    categoria: record.CATEGO,
                    titulo: record.TITULO,
                    dcnro: record.DCNRO,
                    condicion: record.CONDIC
                });
            }
        });
        
        parser.on('end', () => resolve(matriculas));
        parser.on('error', (error) => {
            console.error(`Error leyendo matrículas ${path}:`, error);
            resolve(new Map());
        });
        
        parser.parse();
    });
}

async function leerProfesionalesDBF(path) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            resolve(new Map());
            return;
        }
        
        const parser = new Parser(path);
        const profesionales = new Map();
        
        parser.on('record', (record) => {
            if (record.DCNRO && record.DCNRO > 0) {
                profesionales.set(record.DCNRO, {
                    dcnro: record.DCNRO,
                    nombre: record.NOMBRE,
                    domicilio: record.DOMICI,
                    email: record.SPEMAIL,
                    telefono: record.TELEF,
                    estado: record.ESTADO
                });
            }
        });
        
        parser.on('end', () => resolve(profesionales));
        parser.on('error', (error) => {
            console.error(`Error leyendo profesionales ${path}:`, error);
            resolve(new Map());
        });
        
        parser.parse();
    });
}

// Ejecutar
analyzeMissingRepresentatives()
    .then(() => {
        pool.end();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        pool.end();
        process.exit(1);
    });