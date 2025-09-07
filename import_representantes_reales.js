/**
 * IMPORTACIÓN REAL DE REPRESENTANTES TÉCNICOS DESDE DBF
 * Basado en documentación del Ing. Peñaloza - SPRTCOS.DBF
 * Método prudente con lectura real de archivos DBF
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Verificar si la librería DBF está disponible
let Parser;
try {
    Parser = require('node-dbf').default;
    console.log('✅ Librería node-dbf cargada');
} catch (error) {
    console.log('⚠️ Librería node-dbf no encontrada - usando método alternativo');
}

// Configuración de base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

console.log('🚀 IMPORTACIÓN REAL DE REPRESENTANTES TÉCNICOS');
console.log('📁 Fuente: SPRTCOS.DBF (Ing. Peñaloza)');
console.log('📊 Registros esperados: 3,168');
console.log('='.repeat(60));

// Función para leer archivo DBF usando event-based Parser
async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        console.log(`📖 Leyendo archivo: ${filePath}`);
        
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }

            if (!Parser) {
                throw new Error('Librería node-dbf no está disponible. Instalar con: npm install node-dbf');
            }
            
            const parser = new Parser(filePath);
            const records = [];
            let recordCount = 0;
            
            parser.on('start', (p) => {
                console.log('📖 Iniciando lectura del archivo DBF...');
            });

            parser.on('header', (h) => {
                console.log(`📋 Header DBF leído: ${h.numberOfRecords} registros encontrados`);
            });

            parser.on('record', (record) => {
                records.push(record);
                recordCount++;
                
                // Mostrar progreso cada 500 registros
                if (recordCount % 500 === 0) {
                    console.log(`📊 Registros leídos: ${recordCount}`);
                }
            });

            parser.on('end', (p) => {
                console.log(`✅ Archivo leído exitosamente: ${records.length} registros`);
                resolve(records);
            });

            parser.on('error', (error) => {
                console.error(`❌ Error leyendo DBF:`, error.message);
                reject(new Error(`Error leyendo DBF: ${error.message}`));
            });

            // Iniciar el parsing
            parser.parse();
            
        } catch (error) {
            reject(error);
        }
    });
}

async function importarRepresentantesReales() {
    try {
        console.log('\\n1️⃣ VERIFICACIONES PREVIAS...');
        
        // Verificar conexión a BD
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión a BD exitosa');

        // Verificar tabla
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'representantes_tecnicos'
            )
        `);
        
        if (!tableCheck.rows[0].exists) {
            throw new Error('❌ Tabla copig.representantes_tecnicos no existe');
        }
        console.log('✅ Tabla representantes_tecnicos confirmada');

        console.log('\\n2️⃣ LECTURA DE ARCHIVO SPRTCOS.DBF...');
        
        // Ruta al archivo DBF
        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPRTCOS.DBF');
        
        if (!fs.existsSync(dbfPath)) {
            throw new Error(`❌ Archivo SPRTCOS.DBF no encontrado en: ${dbfPath}`);
        }

        console.log(`📁 Archivo encontrado: ${dbfPath}`);
        
        // Leer archivo DBF
        const representantes = await readDBFFile(dbfPath);
        console.log(`📊 Registros leídos del DBF: ${representantes.length}`);

        if (representantes.length === 0) {
            throw new Error('❌ No se pudieron leer datos del archivo DBF');
        }

        // Mostrar estructura del primer registro para verificar
        console.log('\\n📋 Estructura del primer registro:');
        console.log(JSON.stringify(representantes[0], null, 2));

        console.log('\\n3️⃣ ANÁLISIS DE DATOS...');

        // Contar registros actuales
        const currentCount = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
        console.log(`📊 Representantes actuales en BD: ${currentCount.rows[0].count}`);

        // Verificar empresas y matrículas disponibles
        const empresasCount = await pool.query('SELECT COUNT(*) FROM copig.empresas');
        const matriculasCount = await pool.query('SELECT COUNT(*) FROM copig.matriculas');
        console.log(`🏢 Empresas disponibles: ${empresasCount.rows[0].count}`);
        console.log(`👨‍💼 Matrículas disponibles: ${matriculasCount.rows[0].count}`);

        console.log('\\n4️⃣ PROCESO DE IMPORTACIÓN...');
        
        let procesados = 0;
        let errores = 0;
        let nuevos = 0;
        let saltados = 0;

        for (let i = 0; i < representantes.length; i++) {
            const rep = representantes[i];
            
            try {
                // Mostrar progreso cada 100 registros
                if (i % 100 === 0) {
                    console.log(`📊 Progreso: ${i}/${representantes.length} (${((i/representantes.length)*100).toFixed(1)}%)`);
                }

                // Extraer campos según estructura de Peñaloza
                const empresaId = rep.EMPRESA;
                const matricula = rep.MATPROF;
                const categoria = rep.CATEGOR;
                
                // Convertir fechas desde formato YYYYMMDD
                let fechaInicio = null;
                if (rep.RTINICIO && rep.RTINICIO.length === 8) {
                    const year = rep.RTINICIO.substring(0, 4);
                    const month = rep.RTINICIO.substring(4, 6);
                    const day = rep.RTINICIO.substring(6, 8);
                    fechaInicio = new Date(`${year}-${month}-${day}`);
                }
                
                let fechaFinal = null;
                if (rep.RTFINAL && rep.RTFINAL.length === 8) {
                    const year = rep.RTFINAL.substring(0, 4);
                    const month = rep.RTFINAL.substring(4, 6);
                    const day = rep.RTFINAL.substring(6, 8);
                    fechaFinal = new Date(`${year}-${month}-${day}`);
                }
                
                const tipoVinculo = rep.RTVINCULO;
                const periodo = rep.RTPERIOD;

                // Validar datos básicos
                if (!empresaId || !matricula) {
                    saltados++;
                    continue;
                }

                // 1. Verificar que la empresa existe
                const empresaExists = await pool.query(
                    'SELECT id FROM copig.empresas WHERE id = $1', 
                    [empresaId]
                );
                
                if (empresaExists.rows.length === 0) {
                    saltados++;
                    continue;
                }

                // 2. Buscar profesional por matrícula
                const profesional = await pool.query(
                    'SELECT profesional_id FROM copig.matriculas WHERE numero_matricula = $1',
                    [matricula.toString()]
                );

                if (profesional.rows.length === 0) {
                    saltados++;
                    continue;
                }

                const profesional_id = profesional.rows[0].profesional_id;

                // 3. Verificar si ya existe
                const existingRep = await pool.query(
                    'SELECT id FROM copig.representantes_tecnicos WHERE empresa_id = $1 AND profesional_id = $2',
                    [empresaId, profesional_id]
                );

                // 4. Solo insertar si no existe
                if (existingRep.rows.length === 0) {
                    await pool.query(`
                        INSERT INTO copig.representantes_tecnicos 
                        (empresa_id, profesional_id, categoria_representacion, fecha_inicio, fecha_fin, activo, observaciones)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        empresaId,
                        profesional_id,
                        categoria || null,
                        fechaInicio || new Date(),
                        fechaFinal || null,
                        fechaFinal ? false : true,
                        `DBF Import - Vínculo: ${tipoVinculo}, Período: ${periodo}`
                    ]);

                    nuevos++;
                }

                procesados++;

            } catch (error) {
                console.error(`❌ Error en registro ${i}:`, error.message);
                errores++;
                
                // Si hay demasiados errores, parar
                if (errores > 100) {
                    console.log('⚠️ Demasiados errores, deteniendo importación');
                    break;
                }
            }
        }

        console.log('\\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE IMPORTACIÓN:');
        console.log(`   • Total en DBF: ${representantes.length}`);
        console.log(`   • Procesados: ${procesados}`);
        console.log(`   • Nuevos creados: ${nuevos}`);
        console.log(`   • Saltados (sin match): ${saltados}`);
        console.log(`   • Errores: ${errores}`);
        console.log('='.repeat(60));

        // Verificación final
        const finalCount = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
        console.log(`\\n🎯 TOTAL FINAL: ${finalCount.rows[0].count} representantes técnicos`);

        if (nuevos > 0) {
            console.log('\\n✅ IMPORTACIÓN EXITOSA');
            console.log('🎯 Próximos pasos:');
            console.log('   1. Iniciar servidor: node server.js');
            console.log('   2. Ir a gestión de empresas');
            console.log('   3. Verificar que aparecen representantes técnicos');
        }

    } catch (error) {
        console.error('\\n❌ ERROR CRÍTICO:', error.message);
        
        if (error.message.includes('node-dbf')) {
            console.log('\\n💡 SOLUCIÓN:');
            console.log('   Instalar librería: npm install node-dbf');
            console.log('   O verificar que el archivo DBF sea válido');
        }
    } finally {
        await pool.end();
    }
}

// Ejecutar importación
importarRepresentantesReales();