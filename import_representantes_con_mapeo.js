/**
 * IMPORTACIÓN SEGURA DE REPRESENTANTES TÉCNICOS CON MAPEO CORRECTO
 * NO BORRA DATOS - SOLO INSERTA
 * Usa EMPSDF.DBF para mapear IDs antiguos a CUITs
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

async function importarConMapeo() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 IMPORTACIÓN SEGURA DE REPRESENTANTES TÉCNICOS');
    console.log('⚠️  NO SE BORRARÁN DATOS - SOLO SE INSERTARÁN NUEVOS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        // PASO 1: Leer EMPSDF.DBF para crear mapeo ID → CUIT
        console.log('📊 PASO 1: Leyendo archivo de empresas (EMPSDF.DBF)...');
        const mapeoEmpresas = await leerEMPSDF();
        console.log(`✅ ${Object.keys(mapeoEmpresas).length} empresas mapeadas\n`);
        
        // PASO 2: Obtener empresas actuales de BD por CUIT
        console.log('📊 PASO 2: Obteniendo empresas actuales de BD...');
        const empresasResult = await pool.query('SELECT id, cuit FROM copig.empresas WHERE cuit IS NOT NULL');
        const empresasPorCuit = {};
        empresasResult.rows.forEach(e => {
            if (e.cuit) empresasPorCuit[e.cuit.trim()] = e.id;
        });
        console.log(`✅ ${Object.keys(empresasPorCuit).length} empresas en BD con CUIT\n`);
        
        // PASO 3: Obtener profesionales por matrícula
        console.log('📊 PASO 3: Obteniendo profesionales de BD...');
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
        
        // PASO 4: Leer SPRTCOS.DBF e importar
        console.log('📊 PASO 4: Procesando representantes técnicos (SPRTCOS.DBF)...');
        const resultado = await procesarSPRTCOS(mapeoEmpresas, empresasPorCuit, profesionalesPorMatricula);
        
        // PASO 5: Mostrar resumen
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📈 RESUMEN DE IMPORTACIÓN:');
        console.log('─────────────────────────────────────────');
        console.log(`✅ Importados exitosamente: ${resultado.importados}`);
        console.log(`📋 Total procesados: ${resultado.total}`);
        console.log(`❌ Sin mapeo de empresa: ${resultado.sinMapeo}`);
        console.log(`❌ Empresa no encontrada en BD: ${resultado.empresaNoEncontrada}`);
        console.log(`❌ Profesional no encontrado: ${resultado.profesionalNoEncontrado}`);
        console.log(`⚠️  Duplicados omitidos: ${resultado.duplicados}`);
        
        // Verificar resultado final
        const finalResult = await pool.query(`
            SELECT COUNT(*) as total,
                   COUNT(DISTINCT empresa_id) as empresas,
                   COUNT(DISTINCT profesional_id) as profesionales
            FROM copig.representantes_tecnicos
        `);
        
        console.log('\n📊 ESTADO FINAL EN BASE DE DATOS:');
        console.log('─────────────────────────────────────────');
        console.log(`Total representantes técnicos: ${finalResult.rows[0].total}`);
        console.log(`Empresas con representantes: ${finalResult.rows[0].empresas}`);
        console.log(`Profesionales como representantes: ${finalResult.rows[0].profesionales}`);
        
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
            if (record.NUMERO && record.ECUIT) {
                mapeo[record.NUMERO.toString()] = record.ECUIT.toString().trim();
            }
        });
        
        parser.on('end', () => resolve(mapeo));
        parser.on('error', reject);
        parser.parse();
    });
}

function procesarSPRTCOS(mapeoEmpresas, empresasPorCuit, profesionalesPorMatricula) {
    return new Promise((resolve) => {
        const archivo = 'C:\\copig-app\\adminsp\\COPIG\\SPRTCOS.DBF';
        const parser = new Parser(archivo);
        
        const estadisticas = {
            total: 0,
            importados: 0,
            sinMapeo: 0,
            empresaNoEncontrada: 0,
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
            
            // Mapear ID antiguo → CUIT → ID actual
            const cuit = mapeoEmpresas[empresaIdAntiguo];
            if (!cuit) {
                estadisticas.sinMapeo++;
                return;
            }
            
            const empresaIdActual = empresasPorCuit[cuit];
            if (!empresaIdActual) {
                estadisticas.empresaNoEncontrada++;
                return;
            }
            
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
            
            // Insertar (sin await para hacerlo más rápido)
            const promesa = pool.query(`
                INSERT INTO copig.representantes_tecnicos 
                (empresa_id, profesional_id, categoria_representacion, fecha_inicio, fecha_fin, activo)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (empresa_id, profesional_id) DO NOTHING
            `, [
                empresaIdActual,
                profesionalId,
                categoria,
                fechaInicio,
                fechaFin,
                !fechaFin
            ]).then(() => {
                estadisticas.importados++;
                if (estadisticas.importados % 10 === 0) {
                    process.stdout.write(`\r  Importados: ${estadisticas.importados}...`);
                }
            }).catch(() => {
                // Silenciar errores individuales
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
    if (!fechaStr || fechaStr === '000000' || fechaStr.length !== 8) {
        return null;
    }
    
    const año = fechaStr.substring(0, 4);
    const mes = fechaStr.substring(4, 6);
    const dia = fechaStr.substring(6, 8);
    
    const fecha = new Date(año, mes - 1, dia);
    
    if (isNaN(fecha.getTime())) {
        return null;
    }
    
    return fecha.toISOString().split('T')[0];
}

importarConMapeo();