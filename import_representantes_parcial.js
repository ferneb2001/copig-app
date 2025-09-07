/**
 * IMPORTACIÓN PARCIAL DE REPRESENTANTES TÉCNICOS
 * Solo importa los que se pueden mapear correctamente
 * NO MODIFICA EMPRESAS - Solo agrega representantes
 */

const Parser = require('node-dbf').default;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function importarRepresentantesParcial() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 IMPORTACIÓN PARCIAL DE REPRESENTANTES TÉCNICOS');
    console.log('✅ Las 1,477 empresas NO SE MODIFICARÁN');
    console.log('✅ Solo se agregarán representantes a empresas mapeables');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        // PASO 1: Crear mapeo ID antiguo → Razón Social desde EMPSDF
        console.log('📊 PASO 1: Creando mapeo desde EMPSDF.DBF...');
        const mapeoEmpresas = await leerEMPSDF();
        console.log(`✅ ${Object.keys(mapeoEmpresas).length} empresas en EMPSDF\n`);
        
        // PASO 2: Obtener empresas actuales y buscar coincidencias
        console.log('📊 PASO 2: Mapeando con empresas actuales...');
        const empresasResult = await pool.query('SELECT id, razon_social, cuit FROM copig.empresas');
        
        // Crear mapeo por CUIT y por nombre
        const empresasPorCuit = {};
        const empresasPorNombre = {};
        
        empresasResult.rows.forEach(e => {
            if (e.cuit) {
                empresasPorCuit[e.cuit.trim()] = e.id;
            }
            // Normalizar nombre para comparación
            const nombreNorm = e.razon_social.toUpperCase().trim();
            empresasPorNombre[nombreNorm] = e.id;
        });
        
        // Mapear ID antiguo → ID actual
        const mapeoFinal = {};
        let mapeados = 0;
        
        for (const [idAntiguo, datos] of Object.entries(mapeoEmpresas)) {
            let idActual = null;
            
            // Primero intentar por CUIT
            if (datos.cuit && empresasPorCuit[datos.cuit]) {
                idActual = empresasPorCuit[datos.cuit];
                mapeados++;
            }
            // Si no, intentar por nombre exacto
            else if (datos.nombre) {
                const nombreNorm = datos.nombre.toUpperCase().trim();
                if (empresasPorNombre[nombreNorm]) {
                    idActual = empresasPorNombre[nombreNorm];
                    mapeados++;
                }
            }
            
            if (idActual) {
                mapeoFinal[idAntiguo] = idActual;
            }
        }
        
        console.log(`✅ ${mapeados} empresas mapeadas correctamente\n`);
        
        // PASO 3: Obtener profesionales
        console.log('📊 PASO 3: Obteniendo profesionales...');
        const profResult = await pool.query(`
            SELECT p.id, m.numero_matricula 
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
        `);
        const profesionalesPorMatricula = {};
        profResult.rows.forEach(p => {
            if (p.numero_matricula) {
                profesionalesPorMatricula[p.numero_matricula.toString()] = p.id;
            }
        });
        console.log(`✅ ${Object.keys(profesionalesPorMatricula).length} profesionales con matrícula\n`);
        
        // PASO 4: Procesar SPRTCOS
        console.log('📊 PASO 4: Procesando SPRTCOS.DBF...');
        const resultado = await procesarSPRTCOS(mapeoFinal, profesionalesPorMatricula);
        
        // RESUMEN
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📈 RESUMEN DE IMPORTACIÓN:');
        console.log('─────────────────────────────────────────');
        console.log(`✅ Representantes importados: ${resultado.importados}`);
        console.log(`📋 Total procesados: ${resultado.total}`);
        console.log(`❌ Empresa no mapeada: ${resultado.empresaNoMapeada}`);
        console.log(`❌ Profesional no encontrado: ${resultado.profesionalNoEncontrado}`);
        console.log(`⚠️  Duplicados omitidos: ${resultado.duplicados}`);
        
        // Verificar resultado final
        const finalResult = await pool.query(`
            SELECT COUNT(*) as total,
                   COUNT(DISTINCT empresa_id) as empresas,
                   COUNT(DISTINCT profesional_id) as profesionales
            FROM copig.representantes_tecnicos
        `);
        
        console.log('\n📊 ESTADO FINAL:');
        console.log('─────────────────────────────────────────');
        console.log(`Total representantes técnicos: ${finalResult.rows[0].total}`);
        console.log(`Empresas con representantes: ${finalResult.rows[0].empresas}`);
        console.log(`Profesionales como representantes: ${finalResult.rows[0].profesionales}`);
        
        // Mostrar ejemplos
        const ejemplos = await pool.query(`
            SELECT e.razon_social, p.nombre, rt.categoria_representacion
            FROM copig.representantes_tecnicos rt
            JOIN copig.empresas e ON rt.empresa_id = e.id
            JOIN copig.profesionales p ON rt.profesional_id = p.id
            ORDER BY e.razon_social
            LIMIT 10
        `);
        
        if (ejemplos.rows.length > 0) {
            console.log('\n📋 EJEMPLOS IMPORTADOS:');
            console.log('─────────────────────────────────────────');
            ejemplos.rows.forEach(ej => {
                console.log(`• ${ej.nombre} → ${ej.razon_social.substring(0, 40)}`);
            });
        }
        
        // Verificar empresas
        const empresasCheck = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
        console.log('\n✅ VERIFICACIÓN FINAL:');
        console.log(`   Empresas en BD: ${empresasCheck.rows[0].total} (sin cambios)`);
        
        await pool.end();
        console.log('\n✅ Importación completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

function leerEMPSDF() {
    return new Promise((resolve, reject) => {
        const archivo = 'C:\\copig-app\\adminsp\\COPIG\\EMPSDF.DBF';
        const parser = new Parser(archivo);
        const mapeo = {};
        
        parser.on('record', (record) => {
            if (record.NUMERO) {
                mapeo[record.NUMERO.toString()] = {
                    cuit: record.ECUIT ? record.ECUIT.toString().trim() : null,
                    nombre: record.NOMBRE ? record.NOMBRE.toString().trim() : null
                };
            }
        });
        
        parser.on('end', () => resolve(mapeo));
        parser.on('error', reject);
        parser.parse();
    });
}

function procesarSPRTCOS(mapeoFinal, profesionalesPorMatricula) {
    return new Promise((resolve) => {
        const archivo = 'C:\\copig-app\\adminsp\\COPIG\\SPRTCOS.DBF';
        const parser = new Parser(archivo);
        
        const estadisticas = {
            total: 0,
            importados: 0,
            empresaNoMapeada: 0,
            profesionalNoEncontrado: 0,
            duplicados: 0
        };
        
        const combinacionesImportadas = new Set();
        const promesas = [];
        
        parser.on('record', (record) => {
            estadisticas.total++;
            
            const empresaIdAntiguo = record.EMPRESA ? record.EMPRESA.toString() : null;
            const matricula = record.MATPROF ? record.MATPROF.toString() : null;
            const categoria = record.CATEGOR ? record.CATEGOR.toString().trim() : 'A';
            const fechaInicio = record.RTINICIO ? parseFecha(record.RTINICIO.toString()) : null;
            const fechaFin = record.RTFINAL ? parseFecha(record.RTFINAL.toString()) : null;
            
            if (!empresaIdAntiguo || !matricula) {
                return;
            }
            
            // Buscar empresa actual
            const empresaIdActual = mapeoFinal[empresaIdAntiguo];
            if (!empresaIdActual) {
                estadisticas.empresaNoMapeada++;
                return;
            }
            
            // Buscar profesional
            const profesionalId = profesionalesPorMatricula[matricula];
            if (!profesionalId) {
                estadisticas.profesionalNoEncontrado++;
                return;
            }
            
            // Evitar duplicados
            const clave = `${empresaIdActual}-${profesionalId}`;
            if (combinacionesImportadas.has(clave)) {
                estadisticas.duplicados++;
                return;
            }
            combinacionesImportadas.add(clave);
            
            // Insertar (sin ON CONFLICT porque no hay constraint único)
            const promesa = pool.query(`
                INSERT INTO copig.representantes_tecnicos 
                (empresa_id, profesional_id, categoria_representacion, fecha_inicio, fecha_fin, activo)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [
                empresaIdActual,
                profesionalId,
                categoria,
                fechaInicio,
                fechaFin,
                !fechaFin
            ]).then((result) => {
                if (result.rows.length > 0) {
                    estadisticas.importados++;
                    if (estadisticas.importados % 10 === 0) {
                        process.stdout.write(`\r  Importados: ${estadisticas.importados}...`);
                    }
                }
            }).catch((err) => {
                console.error('\nError insertando:', err.message);
            });
            
            promesas.push(promesa);
        });
        
        parser.on('end', async () => {
            await Promise.all(promesas);
            console.log(''); // Nueva línea después del progreso
            resolve(estadisticas);
        });
        
        parser.parse();
    });
}

function parseFecha(fechaStr) {
    if (!fechaStr || fechaStr === '000000' || fechaStr === '00000000' || fechaStr.length < 6) {
        return null;
    }
    
    // Si es formato YYYYMMDD
    if (fechaStr.length === 8) {
        const año = fechaStr.substring(0, 4);
        const mes = fechaStr.substring(4, 6);
        const dia = fechaStr.substring(6, 8);
        
        const fecha = new Date(año, mes - 1, dia);
        
        if (isNaN(fecha.getTime())) {
            return null;
        }
        
        return fecha.toISOString().split('T')[0];
    }
    
    return null;
}

importarRepresentantesParcial();