const xlsx = require('xlsx');
const fs = require('fs');

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeCorrectExcel() {
    console.log('🔍 ANÁLISIS CORRECTO DEL EXCEL emp-rtcos-20250831.xlsx');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');
    
    try {
        const excelPath = 'C:/copig-app/emp-rtcos-20250831.xlsx';
        const workbook = xlsx.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`📊 Total filas en Excel: ${data.length}`);
        
        // Filtrar solo los registros que tienen mat-prof (son profesionales, no empresas)
        const profesionalesData = data.filter(row => row['mat-prof'] && row['mat-prof'] > 0);
        console.log(`👥 Registros con matrícula (profesionales): ${profesionalesData.length}`);
        
        // Obtener matrículas únicas
        const matriculasExcel = new Set();
        profesionalesData.forEach(row => {
            const matricula = parseInt(row['mat-prof']);
            if (matricula && !isNaN(matricula)) {
                matriculasExcel.add(matricula);
            }
        });
        
        console.log(`📋 Matrículas únicas en Excel: ${matriculasExcel.size}\n`);
        
        // Verificar cuántas de estas matrículas están en el sistema
        const matriculasArray = Array.from(matriculasExcel);
        const matriculasEnSistema = await pool.query(`
            SELECT numero_matricula 
            FROM copig.matriculas 
            WHERE numero_matricula = ANY($1)
        `, [matriculasArray]);
        
        const matriculasSistemaSet = new Set(matriculasEnSistema.rows.map(r => parseInt(r.numero_matricula)));
        
        console.log(`💾 Matrículas del Excel encontradas en sistema COPIG: ${matriculasSistemaSet.size}`);
        
        const matriculasFaltantes = matriculasArray.filter(m => !matriculasSistemaSet.has(m));
        console.log(`❌ Matrículas del Excel NO encontradas en sistema COPIG: ${matriculasFaltantes.length}`);
        
        if (matriculasFaltantes.length > 0) {
            console.log('\n🔎 BUSCANDO MATRÍCULAS FALTANTES EN DBF EXTERNOS...\n');
            
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
            
            // Mostrar ejemplos de matrículas encontradas con sus empresas del Excel
            if (detalleEncontradas.length > 0) {
                console.log('🎯 MATRÍCULAS ENCONTRADAS EN DBF EXTERNOS (con empresas del Excel):');
                console.log('────────────────────────────────────────────────────────────────────────────────');
                
                detalleEncontradas.slice(0, 15).forEach((item, index) => {
                    // Buscar en qué empresas aparece esta matrícula en el Excel
                    const empresasExcel = profesionalesData.filter(row => parseInt(row['mat-prof']) === item.matricula);
                    
                    console.log(`${index + 1}. Mat. ${item.matricula} → ${item.profesionalNombre || 'Sin nombre'} (${item.tipo})`);
                    console.log(`    Título: ${item.titulo} - Categoría: ${item.categoria}`);
                    
                    if (empresasExcel.length > 0) {
                        const empresasUnicas = [...new Set(empresasExcel.map(e => e['Razón social / Apellido y Nombre']))];
                        console.log(`    Aparece como representante en ${empresasUnicas.length} empresa(s):`);
                        empresasUnicas.slice(0, 3).forEach(emp => {
                            console.log(`      • ${emp}`);
                        });
                        if (empresasUnicas.length > 3) {
                            console.log(`      ... y ${empresasUnicas.length - 3} más`);
                        }
                    }
                    console.log('');
                });
                
                if (detalleEncontradas.length > 15) {
                    console.log(`... y ${detalleEncontradas.length - 15} más\n`);
                }
            }
            
            // Análisis por tipo de profesional
            if (detalleEncontradas.length > 0) {
                console.log('📊 DISTRIBUCIÓN POR TIPO DE PROFESIONAL:');
                console.log('────────────────────────────────────────────────────────────────────────────────');
                
                const porTipo = { SV: [], SO: [] };
                detalleEncontradas.forEach(item => {
                    porTipo[item.tipo].push(item);
                });
                
                Object.entries(porTipo).forEach(([tipo, items]) => {
                    if (items.length > 0) {
                        const tipoNombre = tipo === 'SV' ? 'ARQUITECTOS/AGRIMENSORES' : 'HIGIENE Y SEGURIDAD';
                        console.log(`${tipoNombre}: ${items.length} profesionales`);
                        
                        // Análisis de títulos más frecuentes
                        const titulosCounts = {};
                        items.forEach(item => {
                            titulosCounts[item.titulo] = (titulosCounts[item.titulo] || 0) + 1;
                        });
                        
                        console.log('  Títulos más frecuentes:');
                        Object.entries(titulosCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .forEach(([titulo, count]) => {
                                console.log(`    • Título ${titulo}: ${count} profesionales`);
                            });
                        console.log('');
                    }
                });
            }
        }
        
        // Resumen final
        console.log('📊 RESUMEN EJECUTIVO');
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log(`📄 Total registros en Excel: ${data.length}`);
        console.log(`👥 Profesionales (con matrícula): ${profesionalesData.length}`);
        console.log(`📋 Matrículas únicas: ${matriculasExcel.size}`);
        console.log(`✅ Ya en sistema COPIG: ${matriculasSistemaSet.size}`);
        console.log(`❌ Faltantes en COPIG: ${matriculasFaltantes.length}`);
        
        if (matriculasFaltantes.length > 0) {
            console.log(`🔍 Encontradas en DBF externos: ${totalEncontradas || 0}`);
            console.log(`❓ Aún sin localizar: ${matriculasFaltantes.length - (totalEncontradas || 0)}`);
            
            const porcentaje = ((totalEncontradas || 0) / matriculasFaltantes.length * 100).toFixed(1);
            console.log(`📈 Tasa de recuperación: ${porcentaje}%`);
        }
        
        console.log('\n🎯 CONCLUSIÓN:');
        if (matriculasFaltantes.length > 0 && totalEncontradas > 0) {
            console.log(`Los ${totalEncontradas} profesionales encontrados en DBF externos son arquitectos,`);
            console.log('agrimensores y licenciados en higiene y seguridad que pueden ser representantes');
            console.log('técnicos pero no están importados en el sistema COPIG actual.');
            
            console.log('\n💡 SOLUCIÓN:');
            console.log('1. Importar profesionales de SVPROF.DBF y SVMATRI.DBF (arquitectos/agrimensores)');
            console.log('2. Importar profesionales de SOPROF.DBF y SOMATRI.DBF (higiene y seguridad)');
            console.log('3. Re-ejecutar la asignación de representantes técnicos');
        } else if (matriculasFaltantes.length === 0) {
            console.log('✅ Todas las matrículas del Excel ya están en el sistema COPIG');
            console.log('El problema puede estar en la asignación empresa-representante');
        }
        
        console.log('\n✅ Análisis completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Funciones auxiliares (copiadas del script anterior)
async function buscarMatriculasEnDBF(dbfFile, matriculasBuscadas) {
    const Parser = require('node-dbf').default;
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
    const Parser = require('node-dbf').default;
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
    const Parser = require('node-dbf').default;
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
analyzeCorrectExcel()
    .then(() => {
        pool.end();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        pool.end();
        process.exit(1);
    });