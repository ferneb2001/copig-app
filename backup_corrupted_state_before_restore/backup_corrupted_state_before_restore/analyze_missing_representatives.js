/**
 * ANÁLISIS DE REPRESENTANTES TÉCNICOS NO ENCONTRADOS
 * Investigar si las matrículas saltadas en SPRTCOS.DBF 
 * corresponden a profesionales externos recién importados
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const Parser = require('node-dbf').default;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

console.log('🔍 ANÁLISIS DE REPRESENTANTES TÉCNICOS NO ENCONTRADOS');
console.log('🎯 Objetivo: Verificar si corresponden a profesionales externos');
console.log('📁 Fuente: SPRTCOS.DBF vs profesionales_externos/matriculas_externas');
console.log('='.repeat(80));

// Función para leer archivo DBF
async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        console.log(`📖 Leyendo SPRTCOS.DBF...`);
        
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }
            
            const parser = new Parser(filePath);
            const records = [];
            let recordCount = 0;
            
            parser.on('start', (p) => {
                console.log(`🚀 Iniciando lectura...`);
            });

            parser.on('header', (h) => {
                console.log(`📋 Header: ${h.numberOfRecords} registros`);
            });

            parser.on('record', (record) => {
                records.push(record);
                recordCount++;
                
                if (recordCount % 500 === 0) {
                    console.log(`📊 Registros leídos: ${recordCount}`);
                }
            });

            parser.on('end', (p) => {
                console.log(`✅ SPRTCOS.DBF leído: ${records.length} registros`);
                resolve(records);
            });

            parser.on('error', (error) => {
                console.error(`❌ Error:`, error.message);
                reject(error);
            });

            parser.parse();
            
        } catch (error) {
            reject(error);
        }
    });
}

async function analyzeRemainingRepresentatives() {
    try {
        console.log('\n1️⃣ VERIFICACIONES PREVIAS...');
        
        // Verificar conexión a BD
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión a BD exitosa');

        // Contar datos actuales
        const copigProfCount = await pool.query('SELECT COUNT(*) FROM copig.profesionales');
        const copigMatrCount = await pool.query('SELECT COUNT(*) FROM copig.matriculas');
        const extProfCount = await pool.query('SELECT COUNT(*) FROM copig.profesionales_externos');
        const extMatrCount = await pool.query('SELECT COUNT(*) FROM copig.matriculas_externas');
        const repTecCount = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
        
        console.log('📊 ESTADO ACTUAL:');
        console.log(`   👥 Profesionales COPIG: ${copigProfCount.rows[0].count}`);
        console.log(`   🎫 Matrículas COPIG: ${copigMatrCount.rows[0].count}`);
        console.log(`   👥 Profesionales externos: ${extProfCount.rows[0].count}`);
        console.log(`   🎫 Matrículas externas: ${extMatrCount.rows[0].count}`);
        console.log(`   🏢 Representantes técnicos activos: ${repTecCount.rows[0].count}`);

        console.log('\n2️⃣ LECTURA DE SPRTCOS.DBF...');
        
        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPRTCOS.DBF');
        const representantes = await readDBFFile(dbfPath);
        
        console.log(`📊 Total registros en SPRTCOS.DBF: ${representantes.length}`);

        console.log('\n3️⃣ ANÁLISIS DETALLADO...');
        
        let totalProcesados = 0;
        let encontradosEnCOPIG = 0;
        let encontradosEnExternos = 0;
        let empresasInexistentes = 0;
        let matriculasInexistentes = 0;
        let otrosErrores = 0;
        
        // Arrays para estadísticas detalladas
        let matriculasExternasEncontradas = [];
        let categoriasExternas = {};

        console.log('🔍 Procesando registros de SPRTCOS.DBF...');
        
        for (let i = 0; i < representantes.length; i++) {
            const rep = representantes[i];
            
            try {
                // Mostrar progreso cada 500 registros
                if (i % 500 === 0) {
                    console.log(`📊 Progreso: ${i}/${representantes.length} (${((i/representantes.length)*100).toFixed(1)}%)`);
                }

                const empresaId = rep.EMPRESA;
                const matricula = rep.MATPROF;
                const categoria = rep.CATEGOR;

                // Validar datos básicos
                if (!empresaId || !matricula) {
                    otrosErrores++;
                    continue;
                }

                totalProcesados++;

                // 1. Verificar si la empresa existe
                const empresaExists = await pool.query(
                    'SELECT id FROM copig.empresas WHERE id = $1', 
                    [empresaId]
                );
                
                if (empresaExists.rows.length === 0) {
                    empresasInexistentes++;
                    continue;
                }

                // 2. Buscar en profesionales COPIG (matrículas normales)
                const profesionalCOPIG = await pool.query(
                    'SELECT profesional_id FROM copig.matriculas WHERE numero_matricula = $1',
                    [matricula.toString()]
                );

                if (profesionalCOPIG.rows.length > 0) {
                    encontradosEnCOPIG++;
                    continue;
                }

                // 3. ¡AQUÍ ESTÁ LA CLAVE! Buscar en profesionales externos
                const profesionalExterno = await pool.query(`
                    SELECT me.numero_matricula, me.categoria, pe.nombre, pe.origen
                    FROM copig.matriculas_externas me
                    INNER JOIN copig.profesionales_externos pe ON me.profesional_externo_id = pe.id
                    WHERE me.numero_matricula = $1
                `, [matricula]);

                if (profesionalExterno.rows.length > 0) {
                    encontradosEnExternos++;
                    matriculasExternasEncontradas.push({
                        matricula: matricula,
                        categoria: categoria,
                        categoriaExterna: profesionalExterno.rows[0].categoria,
                        nombreProfesional: profesionalExterno.rows[0].nombre,
                        origen: profesionalExterno.rows[0].origen
                    });
                    
                    // Contar categorías
                    const catExt = profesionalExterno.rows[0].categoria;
                    categoriasExternas[catExt] = (categoriasExternas[catExt] || 0) + 1;
                    
                    continue;
                }

                // 4. Si llegamos aquí, la matrícula no existe en ningún lado
                matriculasInexistentes++;

            } catch (error) {
                otrosErrores++;
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('📊 RESULTADOS DEL ANÁLISIS:');
        console.log('='.repeat(80));
        console.log(`📋 Total registros procesados: ${totalProcesados}`);
        console.log(`✅ Encontrados en COPIG: ${encontradosEnCOPIG}`);
        console.log(`🎯 ENCONTRADOS EN EXTERNOS: ${encontradosEnExternos}`);
        console.log(`🏢 Empresas inexistentes: ${empresasInexistentes}`);
        console.log(`🎫 Matrículas inexistentes: ${matriculasInexistentes}`);
        console.log(`❌ Otros errores: ${otrosErrores}`);

        if (encontradosEnExternos > 0) {
            console.log('\n🎉 ¡BINGO! PROFESIONALES EXTERNOS VINCULADOS A EMPRESAS:');
            console.log(`📊 Total: ${encontradosEnExternos} representantes técnicos externos`);
            
            console.log('\n📋 CATEGORÍAS DE PROFESIONALES EXTERNOS:');
            Object.entries(categoriasExternas).forEach(([categoria, count]) => {
                let descripcion = '';
                switch(categoria) {
                    case 'CA': descripcion = '(Arquitectos)'; break;
                    case 'CT': descripcion = '(Constructores/Técnicos)'; break;
                    case 'AG': descripcion = '(Agrimensores)'; break;
                    case 'CR': descripcion = '(Constructores Registrados)'; break;
                    default: descripcion = '(Otros)'; break;
                }
                console.log(`   ${categoria} ${descripcion}: ${count} representantes`);
            });

            console.log('\n📋 PRIMEROS 10 EJEMPLOS:');
            matriculasExternasEncontradas.slice(0, 10).forEach((item, index) => {
                console.log(`   ${index + 1}. Mat: ${item.matricula} - ${item.nombreProfesional} (Cat: ${item.categoriaExterna})`);
            });

            console.log('\n🎯 CONCLUSIÓN IMPORTANTE:');
            console.log('   ✅ SÍ hay profesionales externos actuando como representantes técnicos');
            console.log('   ✅ Estos profesionales ya están importados en el sistema');
            console.log('   ✅ Necesitamos modificar la importación para incluir representantes externos');
        }

        console.log('\n' + '='.repeat(80));

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar análisis
analyzeRemainingRepresentatives();