/**
 * IMPORTACIÓN COMPLETA DE PROFESIONALES EXTERNOS
 * SOPROF.DBF (datos personales) + SOMATRI.DBF (matrículas)
 * Arquitectos, Agrimensores y otros profesionales no del COPIG
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

console.log('🚀 IMPORTACIÓN DE PROFESIONALES EXTERNOS');
console.log('📁 Fuente: SOPROF.DBF + SOMATRI.DBF del Ing. Peñaloza');
console.log('🎯 Destino: profesionales_externos + matriculas_externas');
console.log('📊 Datos esperados: ~695 profesionales, ~691 matrículas');
console.log('='.repeat(80));

// Función para leer archivo DBF usando event-based Parser
async function readDBFFile(filePath, fileName) {
    return new Promise((resolve, reject) => {
        console.log(`📖 Leyendo archivo: ${fileName}`);
        
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }

            if (!Parser) {
                throw new Error('Librería node-dbf no está disponible.');
            }
            
            const parser = new Parser(filePath);
            const records = [];
            let recordCount = 0;
            
            parser.on('start', (p) => {
                console.log(`📖 Iniciando lectura de ${fileName}...`);
            });

            parser.on('header', (h) => {
                console.log(`📋 Header ${fileName}: ${h.numberOfRecords} registros encontrados`);
            });

            parser.on('record', (record) => {
                records.push(record);
                recordCount++;
                
                // Mostrar progreso cada 100 registros
                if (recordCount % 100 === 0) {
                    console.log(`📊 ${fileName} - Registros leídos: ${recordCount}`);
                }
            });

            parser.on('end', (p) => {
                console.log(`✅ ${fileName} leído exitosamente: ${records.length} registros`);
                resolve(records);
            });

            parser.on('error', (error) => {
                console.error(`❌ Error leyendo ${fileName}:`, error.message);
                reject(new Error(`Error leyendo ${fileName}: ${error.message}`));
            });

            // Iniciar el parsing
            parser.parse();
            
        } catch (error) {
            reject(error);
        }
    });
}

// Función para convertir fechas de formato YYYYMMDD a Date
function convertirFecha(fechaString) {
    if (!fechaString || fechaString.length !== 8) {
        return null;
    }
    
    const year = fechaString.substring(0, 4);
    const month = fechaString.substring(4, 6);
    const day = fechaString.substring(6, 8);
    
    // Validar fecha
    const fecha = new Date(`${year}-${month}-${day}`);
    if (isNaN(fecha.getTime())) {
        return null;
    }
    
    return fecha;
}

async function importarProfesionalesExternos() {
    try {
        console.log('\\n1️⃣ VERIFICACIONES PREVIAS...');
        
        // Verificar conexión a BD
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión a BD exitosa');

        // Verificar tablas
        const tablesCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'profesionales_externos'
            ) as prof_exists,
            EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'matriculas_externas'
            ) as matr_exists
        `);
        
        if (!tablesCheck.rows[0].prof_exists || !tablesCheck.rows[0].matr_exists) {
            throw new Error('❌ Tablas de profesionales externos no existen. Ejecutar create_external_professionals_tables.js primero');
        }
        console.log('✅ Tablas profesionales_externos y matriculas_externas confirmadas');

        console.log('\\n2️⃣ LECTURA DE ARCHIVOS DBF...');
        
        // Rutas a los archivos DBF
        const soprofPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SOPROF.DBF');
        const somatriPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SOMATRI.DBF');
        
        // Leer ambos archivos
        const profesionales = await readDBFFile(soprofPath, 'SOPROF.DBF');
        const matriculas = await readDBFFile(somatriPath, 'SOMATRI.DBF');

        console.log('\\n3️⃣ ANÁLISIS PREVIO...');
        
        // Contar registros actuales
        const currentProfCount = await pool.query('SELECT COUNT(*) FROM copig.profesionales_externos');
        const currentMatrCount = await pool.query('SELECT COUNT(*) FROM copig.matriculas_externas');
        console.log(`📊 Profesionales externos actuales en BD: ${currentProfCount.rows[0].count}`);
        console.log(`📊 Matrículas externas actuales en BD: ${currentMatrCount.rows[0].count}`);

        console.log('\\n4️⃣ IMPORTACIÓN DE PROFESIONALES (SOPROF.DBF)...');
        
        let profProcesados = 0;
        let profNuevos = 0;
        let profErrores = 0;

        for (let i = 0; i < profesionales.length; i++) {
            const prof = profesionales[i];
            
            try {
                // Mostrar progreso cada 50 registros
                if (i % 50 === 0) {
                    console.log(`📊 Progreso profesionales: ${i}/${profesionales.length} (${((i/profesionales.length)*100).toFixed(1)}%)`);
                }

                // Validar datos básicos
                if (!prof.DCNRO || !prof.NOMBRE) {
                    continue;
                }

                // Convertir fecha de nacimiento
                const fechaNacimiento = prof.NACIO ? convertirFecha(prof.NACIO) : null;

                // Verificar si ya existe
                const existingProf = await pool.query(
                    'SELECT id FROM copig.profesionales_externos WHERE tipo_documento = $1 AND numero_documento = $2',
                    [prof.DCTIPO || 1, prof.DCNRO]
                );

                if (existingProf.rows.length === 0) {
                    // Insertar nuevo profesional
                    await pool.query(`
                        INSERT INTO copig.profesionales_externos 
                        (tipo_documento, numero_documento, nombre, domicilio, provincia, departamento, 
                         localidad, fecha_nacimiento, cuit, sexo, estado_civil, nacionalidad, telefono, 
                         tipo_profesional, estado, domicilio_legal, origen)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                    `, [
                        prof.DCTIPO || 1,
                        prof.DCNRO,
                        prof.NOMBRE.trim(),
                        prof.DOMICI || null,
                        prof.PROVIN || null,
                        prof.DPTO || null,
                        prof.LOCALI || null,
                        fechaNacimiento,
                        prof.CUIT && prof.CUIT !== 0 ? prof.CUIT : null,
                        prof.SEXO || null,
                        prof.ESTCIV || null,
                        prof.NACION || 'A',
                        prof.TELEF || null,
                        prof.TIPO || null,
                        prof.ESTADO || 'A',
                        prof.DOMLEG || null,
                        'SOPROF'
                    ]);

                    profNuevos++;
                }

                profProcesados++;

            } catch (error) {
                console.error(`❌ Error en profesional ${i}:`, error.message);
                profErrores++;
                
                if (profErrores > 50) {
                    console.log('⚠️ Demasiados errores en profesionales, deteniendo...');
                    break;
                }
            }
        }

        console.log('\\n5️⃣ IMPORTACIÓN DE MATRÍCULAS (SOMATRI.DBF)...');
        
        let matrProcesadas = 0;
        let matrNuevas = 0;
        let matrErrores = 0;

        for (let i = 0; i < matriculas.length; i++) {
            const matr = matriculas[i];
            
            try {
                // Mostrar progreso cada 50 registros
                if (i % 50 === 0) {
                    console.log(`📊 Progreso matrículas: ${i}/${matriculas.length} (${((i/matriculas.length)*100).toFixed(1)}%)`);
                }

                // Validar datos básicos
                if (!matr.DCNRO || !matr.NUMERO) {
                    continue;
                }

                // Buscar el profesional correspondiente
                const profesionalExterno = await pool.query(
                    'SELECT id FROM copig.profesionales_externos WHERE tipo_documento = $1 AND numero_documento = $2',
                    [matr.DCTIPO || 1, matr.DCNRO]
                );

                if (profesionalExterno.rows.length === 0) {
                    // Si no existe el profesional, saltar esta matrícula
                    continue;
                }

                const profesionalExternoId = profesionalExterno.rows[0].id;

                // Convertir fechas
                const fechaInscripcion = matr.INSCR ? convertirFecha(matr.INSCR) : null;
                const fechaTitulo = matr.FECTIT ? convertirFecha(matr.FECTIT) : null;
                const fechaHabilitacion = matr.FECHAB ? convertirFecha(matr.FECHAB) : null;
                const fechaCertificado = matr.FECCERT ? convertirFecha(matr.FECCERT) : null;
                const fechaPago = matr.PAGO ? convertirFecha(matr.PAGO) : null;

                // Verificar si ya existe
                const existingMatr = await pool.query(
                    'SELECT id FROM copig.matriculas_externas WHERE numero_matricula = $1 AND categoria = $2 AND origen = $3',
                    [matr.NUMERO, matr.CATEGO || '', 'SOMATRI']
                );

                if (existingMatr.rows.length === 0) {
                    // Insertar nueva matrícula
                    await pool.query(`
                        INSERT INTO copig.matriculas_externas 
                        (numero_matricula, categoria, tipo_documento, numero_documento, codigo_titulo, 
                         entidad_otorgante, fecha_inscripcion, fecha_titulo, fecha_habilitacion, 
                         fecha_certificado, fecha_pago, numero_recibo, ano_habilitacion, numero_afiliado, 
                         condicion, origen, activo, profesional_externo_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                    `, [
                        matr.NUMERO,
                        matr.CATEGO || '',
                        matr.DCTIPO || 1,
                        matr.DCNRO,
                        matr.TITULO || null,
                        matr.OTORGA || null,
                        fechaInscripcion,
                        fechaTitulo,
                        fechaHabilitacion,
                        fechaCertificado,
                        fechaPago,
                        matr.RECIBO && matr.RECIBO !== 0 ? matr.RECIBO : null,
                        matr.HABILI || null,
                        matr.AFILIA || null,
                        matr.CONDIC || '1',
                        'SOMATRI',
                        matr.CONDIC === '1',
                        profesionalExternoId
                    ]);

                    matrNuevas++;
                }

                matrProcesadas++;

            } catch (error) {
                console.error(`❌ Error en matrícula ${i}:`, error.message);
                matrErrores++;
                
                if (matrErrores > 50) {
                    console.log('⚠️ Demasiados errores en matrículas, deteniendo...');
                    break;
                }
            }
        }

        console.log('\\n' + '='.repeat(80));
        console.log('📊 RESUMEN DE IMPORTACIÓN:');
        console.log('='.repeat(80));
        console.log('👥 PROFESIONALES EXTERNOS (SOPROF):');
        console.log(`   • Procesados: ${profProcesados}`);
        console.log(`   • Nuevos creados: ${profNuevos}`);
        console.log(`   • Errores: ${profErrores}`);
        console.log('🎫 MATRÍCULAS EXTERNAS (SOMATRI):');
        console.log(`   • Procesadas: ${matrProcesadas}`);
        console.log(`   • Nuevas creadas: ${matrNuevas}`);
        console.log(`   • Errores: ${matrErrores}`);
        console.log('='.repeat(80));

        // Verificación final
        const finalProfCount = await pool.query('SELECT COUNT(*) FROM copig.profesionales_externos');
        const finalMatrCount = await pool.query('SELECT COUNT(*) FROM copig.matriculas_externas');
        const categorias = await pool.query('SELECT categoria, COUNT(*) as total FROM copig.matriculas_externas GROUP BY categoria ORDER BY categoria');
        
        console.log(`\\n🎯 TOTALES FINALES:`);
        console.log(`   👥 Profesionales externos: ${finalProfCount.rows[0].count}`);
        console.log(`   🎫 Matrículas externas: ${finalMatrCount.rows[0].count}`);
        console.log(`\\n📋 CATEGORÍAS DE MATRÍCULAS:`);
        categorias.rows.forEach(cat => {
            console.log(`   ${cat.categoria}: ${cat.total} matrículas`);
        });

        if (profNuevos > 0 || matrNuevas > 0) {
            console.log('\\n✅ IMPORTACIÓN EXITOSA');
            console.log('🎯 Profesionales externos disponibles para representación técnica');
        }

    } catch (error) {
        console.error('\\n❌ ERROR CRÍTICO:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar importación
importarProfesionalesExternos();