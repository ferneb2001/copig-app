const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Librería para leer archivos DBF con encoding correcto
const DBF = require('node-dbf');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

// Rutas de archivos DBF principales
const DBF_PATH = 'adminsp/COPIG';
const DBF_FILES = {
    profesionales: 'SPPROF.DBF',          // Tabla principal de profesionales
    matriculas: 'SPMATRI.DBF',            // Tabla de matrículas
    pagos: 'SPPAGOS.DBF',                // Tabla de pagos históricos
    certificaciones: 'SPCEr04.DBF',       // Certificaciones
    mail: 'MAIL.DBF'                     // Información de contacto
};

// Función para leer archivos DBF con encoding correcto para FoxPro
async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        console.log(`📖 Leyendo archivo: ${filePath}`);
        
        try {
            // Verificar que el archivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }
            
            // Leer archivo DBF con encoding para FoxPro (CP850)
            const buffer = fs.readFileSync(filePath);
            const parser = new DBF(buffer, 'cp850');
            
            parser.parse((err, data) => {
                if (err) {
                    console.error(`❌ Error leyendo ${filePath}:`, err.message);
                    
                    // Intentar con encoding alternativo
                    console.log(`🔄 Intentando con encoding CP1252...`);
                    try {
                        const parser2 = new DBF(buffer, 'cp1252');
                        parser2.parse((err2, data2) => {
                            if (err2) {
                                console.error(`❌ Error con encoding alternativo:`, err2.message);
                                resolve(null);
                            } else {
                                console.log(`   📊 Registros encontrados: ${data2.length.toLocaleString()}`);
                                resolve({
                                    fields: parser2.header.fields || [],
                                    records: data2,
                                    count: data2.length
                                });
                            }
                        });
                    } catch (error2) {
                        console.error(`❌ Error con encoding alternativo:`, error2.message);
                        resolve(null);
                    }
                } else {
                    console.log(`   📊 Registros encontrados: ${data.length.toLocaleString()}`);
                    
                    // Mostrar estructura de campos si está disponible
                    if (parser.header && parser.header.fields) {
                        console.log(`   📋 Campos: ${parser.header.fields.length}`);
                        console.log('   🏗️  Estructura de campos:');
                        parser.header.fields.forEach(field => {
                            console.log(`      ${field.name} (${field.type}${field.length ? `, tamaño: ${field.length}` : ''}${field.decimal ? `, decimales: ${field.decimal}` : ''})`);
                        });
                    }
                    
                    resolve({
                        fields: parser.header.fields || [],
                        records: data,
                        count: data.length
                    });
                }
            });
            
        } catch (error) {
            console.error(`❌ Error leyendo ${filePath}:`, error.message);
            resolve(null);
        }
    });
}

// Función para limpiar y normalizar datos de FoxPro
function cleanFoxProData(record, fields) {
    const cleaned = {};
    
    fields.forEach(field => {
        let value = record[field.name];
        
        // Limpiar cadenas de texto
        if (field.type === 'C' && typeof value === 'string') {
            // Remover caracteres nulos y espacios extra
            value = value.replace(/\0/g, '').trim();
            // Convertir cadenas vacías a null
            if (value === '') value = null;
        }
        
        // Limpiar campos numéricos
        if ((field.type === 'N' || field.type === 'F') && value !== null) {
            value = parseFloat(value) || 0;
        }
        
        // Limpiar campos lógicos
        if (field.type === 'L') {
            value = value === true || value === 'T' || value === 't' || value === 'Y' || value === 'y';
        }
        
        // Limpiar fechas de FoxPro
        if (field.type === 'D' && value) {
            try {
                // FoxPro guarda fechas como YYYYMMDD
                if (typeof value === 'string' && value.length === 8) {
                    const year = parseInt(value.substr(0, 4));
                    const month = parseInt(value.substr(4, 2));
                    const day = parseInt(value.substr(6, 2));
                    
                    // Validar fecha
                    if (year >= 1900 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                        value = new Date(year, month - 1, day);
                    } else {
                        value = null;
                    }
                } else if (value instanceof Date) {
                    // Ya es una fecha válida
                    if (value.getFullYear() > 2030) {
                        // Aplicar corrección similar a la del SQL
                        value = new Date(value.getFullYear() - 30, value.getMonth(), value.getDate());
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Fecha inválida en ${field.name}:`, value);
                value = null;
            }
        }
        
        cleaned[field.name.toLowerCase()] = value;
    });
    
    return cleaned;
}

// Función principal de importación
async function importFoxProData() {
    try {
        console.log('🚀 INICIANDO IMPORTACIÓN DE DATOS FOXPRO\n');
        
        // 1. Leer archivo de profesionales (SPPROF.DBF)
        console.log('👥 PASO 1: Importando profesionales originales...');
        const profPath = path.join(DBF_PATH, DBF_FILES.profesionales);
        const profesionales = await readDBFFile(profPath);
        
        if (!profesionales) {
            throw new Error('No se pudo leer el archivo de profesionales');
        }
        
        console.log(`\n📊 Análisis de profesionales:`);
        console.log(`   Total registros: ${profesionales.count.toLocaleString()}`);
        
        // Mostrar algunos registros de ejemplo
        console.log('\n🔍 Primeros 3 registros de profesionales:');
        profesionales.records.slice(0, 3).forEach((record, index) => {
            const cleaned = cleanFoxProData(record, profesionales.fields);
            console.log(`   ${index + 1}. ${JSON.stringify(cleaned, null, 2).slice(0, 200)}...`);
        });
        
        // 2. Leer archivo de matrículas (SPMATRI.DBF)
        console.log('\n🎫 PASO 2: Importando matrículas originales...');
        const matPath = path.join(DBF_PATH, DBF_FILES.matriculas);
        const matriculas = await readDBFFile(matPath);
        
        if (!matriculas) {
            throw new Error('No se pudo leer el archivo de matrículas');
        }
        
        console.log(`\n📊 Análisis de matrículas:`);
        console.log(`   Total registros: ${matriculas.count.toLocaleString()}`);
        
        // Mostrar algunos registros de ejemplo
        console.log('\n🔍 Primeros 3 registros de matrículas:');
        matriculas.records.slice(0, 3).forEach((record, index) => {
            const cleaned = cleanFoxProData(record, matriculas.fields);
            console.log(`   ${index + 1}. ${JSON.stringify(cleaned, null, 2).slice(0, 200)}...`);
        });
        
        // 3. Leer archivo de pagos (SPPAGOS.DBF)
        console.log('\n💰 PASO 3: Importando pagos históricos originales...');
        const pagosPath = path.join(DBF_PATH, DBF_FILES.pagos);
        const pagos = await readDBFFile(pagosPath);
        
        if (!pagos) {
            throw new Error('No se pudo leer el archivo de pagos');
        }
        
        console.log(`\n📊 Análisis de pagos:`);
        console.log(`   Total registros: ${pagos.count.toLocaleString()}`);
        
        // Mostrar algunos registros de ejemplo
        console.log('\n🔍 Primeros 3 registros de pagos:');
        pagos.records.slice(0, 3).forEach((record, index) => {
            const cleaned = cleanFoxProData(record, pagos.fields);
            console.log(`   ${index + 1}. ${JSON.stringify(cleaned, null, 2).slice(0, 200)}...`);
        });
        
        // 4. Análisis de correspondencias
        console.log('\n🔗 PASO 4: Analizando correspondencias...');
        
        // Crear maps para análisis rápido
        const profesionalesMap = new Map();
        const matriculasMap = new Map();
        
        profesionales.records.forEach(record => {
            const cleaned = cleanFoxProData(record, profesionales.fields);
            // Buscar campos que puedan ser número de matrícula o documento
            const possibleKeys = [
                cleaned.numero, cleaned.matricula, cleaned.nmatric, 
                cleaned.documento, cleaned.dni, cleaned.nro_doc,
                cleaned.id, cleaned.codigo
            ].filter(key => key != null);
            
            possibleKeys.forEach(key => {
                if (key && !profesionalesMap.has(key)) {
                    profesionalesMap.set(key, cleaned);
                }
            });
        });
        
        matriculas.records.forEach(record => {
            const cleaned = cleanFoxProData(record, matriculas.fields);
            const possibleKeys = [
                cleaned.numero, cleaned.matricula, cleaned.nmatric,
                cleaned.id, cleaned.codigo
            ].filter(key => key != null);
            
            possibleKeys.forEach(key => {
                if (key && !matriculasMap.has(key)) {
                    matriculasMap.set(key, cleaned);
                }
            });
        });
        
        console.log(`   🗂️ Profesionales indexados: ${profesionalesMap.size.toLocaleString()}`);
        console.log(`   🎫 Matrículas indexadas: ${matriculasMap.size.toLocaleString()}`);
        
        // Analizar correspondencias en pagos
        let correspondenciasEncontradas = 0;
        let pagosSinCorrespondencia = 0;
        
        console.log('\n🔍 Analizando correspondencias en pagos...');
        for (const record of pagos.records.slice(0, 1000)) { // Solo primeros 1000 para análisis
            const cleaned = cleanFoxProData(record, pagos.fields);
            
            const matricula = cleaned.matricula || cleaned.nmatric || cleaned.numero;
            if (matricula) {
                if (profesionalesMap.has(matricula) || matriculasMap.has(matricula)) {
                    correspondenciasEncontradas++;
                } else {
                    pagosSinCorrespondencia++;
                }
            }
        }
        
        console.log(`   ✅ Correspondencias encontradas: ${correspondenciasEncontradas} (${((correspondenciasEncontradas / 1000) * 100).toFixed(1)}%)`);
        console.log(`   ❌ Sin correspondencia: ${pagosSinCorrespondencia} (${((pagosSinCorrespondencia / 1000) * 100).toFixed(1)}%)`);
        
        // 5. Preparar datos para importación
        console.log('\n💾 PASO 5: Preparando importación a PostgreSQL...');
        
        return {
            profesionales: profesionales,
            matriculas: matriculas,
            pagos: pagos,
            correspondencias: {
                encontradas: correspondenciasEncontradas,
                perdidas: pagosSinCorrespondencia,
                porcentajeExito: (correspondenciasEncontradas / 1000) * 100
            }
        };
        
    } catch (error) {
        console.error('❌ Error en importación:', error);
        throw error;
    }
}

// Función para importar profesionales a PostgreSQL
async function importProfesionalesDB(profesionales) {
    console.log('\n👥 Importando profesionales a PostgreSQL...');
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Crear tabla temporal para profesionales FoxPro
        await client.query(`
            DROP TABLE IF EXISTS copig.profesionales_foxpro;
            CREATE TABLE copig.profesionales_foxpro (
                numero_original VARCHAR(20),
                nombre VARCHAR(200),
                apellido VARCHAR(200),
                nombre_completo VARCHAR(400),
                documento VARCHAR(20),
                fecha_inscripcion DATE,
                fecha_nacimiento DATE,
                estado VARCHAR(50),
                categoria VARCHAR(50),
                domicilio VARCHAR(300),
                telefono VARCHAR(100),
                email VARCHAR(200),
                observaciones TEXT,
                datos_originales JSONB,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            );
        `);
        
        console.log('   📊 Procesando registros...');
        let procesados = 0;
        let errores = 0;
        
        for (const record of profesionales.records) {
            try {
                const cleaned = cleanFoxProData(record, profesionales.fields);
                
                // Mapear campos comunes de FoxPro
                const numero = cleaned.numero || cleaned.matricula || cleaned.nmatric || cleaned.id;
                const nombre = cleaned.nombre || cleaned.nom || cleaned.name;
                const apellido = cleaned.apellido || cleaned.ape || cleaned.apell || cleaned.surname;
                const nombreCompleto = cleaned.nomcompleto || cleaned.nombre_completo || 
                                     (nombre && apellido ? `${apellido}, ${nombre}` : nombre || apellido);
                const documento = cleaned.documento || cleaned.dni || cleaned.doc || cleaned.nro_doc;
                
                await client.query(`
                    INSERT INTO copig.profesionales_foxpro (
                        numero_original, nombre, apellido, nombre_completo, documento,
                        fecha_inscripcion, fecha_nacimiento, estado, categoria, 
                        domicilio, telefono, email, observaciones, datos_originales
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                `, [
                    numero,
                    nombre,
                    apellido,
                    nombreCompleto,
                    documento,
                    cleaned.fecha_inscr || cleaned.fecha_ing || cleaned.fec_ing,
                    cleaned.fecha_nac || cleaned.fec_nac,
                    cleaned.estado || cleaned.est || 'ACTIVO',
                    cleaned.categoria || cleaned.cat || cleaned.tipo,
                    cleaned.domicilio || cleaned.direcc || cleaned.direccion,
                    cleaned.telefono || cleaned.tel || cleaned.phone,
                    cleaned.email || cleaned.mail,
                    cleaned.observ || cleaned.obs || cleaned.notas,
                    JSON.stringify(cleaned)
                ]);
                
                procesados++;
                
                if (procesados % 100 === 0) {
                    console.log(`   📈 Procesados: ${procesados.toLocaleString()}`);
                }
                
            } catch (error) {
                errores++;
                if (errores <= 5) {
                    console.warn(`   ⚠️ Error en registro ${procesados + 1}:`, error.message);
                }
            }
        }
        
        await client.query('COMMIT');
        console.log(`   ✅ Profesionales importados: ${procesados.toLocaleString()}`);
        console.log(`   ❌ Errores: ${errores}`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Función para reconciliar datos con tabla actual
async function reconciliarDatos() {
    console.log('\n🔗 RECONCILIANDO DATOS CON TABLA ACTUAL...');
    
    const client = await pool.connect();
    try {
        // Actualizar profesionales existentes con datos faltantes
        const updateQuery = `
            UPDATE copig.profesionales p
            SET 
                nombre = COALESCE(p.nombre, pf.nombre_completo),
                numero_documento = COALESCE(p.numero_documento, pf.numero_original::bigint)
            FROM copig.profesionales_foxpro pf
            WHERE (
                p.numero_documento = pf.numero_original::bigint OR
                p.numero_documento = pf.documento::bigint OR
                UPPER(p.nombre) = UPPER(pf.nombre_completo)
            )
        `;
        
        const updateResult = await client.query(updateQuery);
        console.log(`   ✅ Profesionales actualizados: ${updateResult.rowCount}`);
        
        // Crear profesionales históricos para matrículas huérfanas
        const insertQuery = `
            INSERT INTO copig.profesionales (numero_documento, nombre, estado, fecha_creacion)
            SELECT DISTINCT 
                pf.numero_original::bigint,
                pf.nombre_completo,
                'HISTORICO',
                NOW()
            FROM copig.profesionales_foxpro pf
            LEFT JOIN copig.profesionales p ON p.numero_documento = pf.numero_original::bigint
            WHERE p.id IS NULL 
              AND pf.numero_original IS NOT NULL 
              AND pf.numero_original ~ '^[0-9]+$'
              AND pf.numero_original::int BETWEEN 1 AND 15000
            ON CONFLICT (numero_documento) DO NOTHING
        `;
        
        const insertResult = await client.query(insertQuery);
        console.log(`   ✅ Profesionales históricos creados: ${insertResult.rowCount}`);
        
        // Actualizar tabla matriculas con IDs correctos
        const matriculasQuery = `
            UPDATE copig.matriculas m
            SET profesional_id = p.id
            FROM copig.profesionales p
            WHERE m.numero = p.numero_documento
              AND m.profesional_id IS NULL
        `;
        
        const matriculasResult = await client.query(matriculasQuery);
        console.log(`   ✅ Matrículas actualizadas: ${matriculasResult.rowCount}`);
        
        // Verificar mejora en correspondencias
        const verificacionQuery = `
            SELECT 
                COUNT(DISTINCT ph.matricula) as total_matriculas,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
                COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
        `;
        
        const verificacion = await client.query(verificacionQuery);
        const stats = verificacion.rows[0];
        
        const porcentajeConProfesional = ((stats.con_profesional / stats.total_matriculas) * 100).toFixed(1);
        const porcentajeSinProfesional = ((stats.sin_profesional / stats.total_matriculas) * 100).toFixed(1);
        
        console.log('\n📊 RESULTADOS FINALES:');
        console.log(`   Total matrículas: ${parseInt(stats.total_matriculas).toLocaleString()}`);
        console.log(`   Con profesional: ${parseInt(stats.con_profesional).toLocaleString()} (${porcentajeConProfesional}%)`);
        console.log(`   Sin profesional: ${parseInt(stats.sin_profesional).toLocaleString()} (${porcentajeSinProfesional}%)`);
        
        return {
            totalMatriculas: parseInt(stats.total_matriculas),
            conProfesional: parseInt(stats.con_profesional),
            sinProfesional: parseInt(stats.sin_profesional),
            porcentajeMejora: porcentajeConProfesional
        };
        
    } finally {
        client.release();
    }
}

// Ejecutar importación principal
async function main() {
    try {
        // Verificar que la librería DBF esté disponible
        try {
            require('node-dbf');
        } catch (error) {
            console.log('📦 Instalando librería node-dbf...');
            const { execSync } = require('child_process');
            execSync('npm install node-dbf', { stdio: 'inherit' });
            console.log('✅ Librería instalada correctamente\n');
        }
        
        // Paso 1: Leer archivos DBF
        const data = await importFoxProData();
        
        // Paso 2: Importar profesionales
        await importProfesionalesDB(data.profesionales);
        
        // Paso 3: Reconciliar datos
        const resultados = await reconciliarDatos();
        
        console.log('\n🎉 IMPORTACIÓN COMPLETADA EXITOSAMENTE!');
        console.log(`🔧 Mejora esperada: De 61% a ${resultados.porcentajeMejora}% de correspondencias`);
        console.log(`💾 Registros procesados: ${data.profesionales.count.toLocaleString()} profesionales`);
        
    } catch (error) {
        console.error('💥 Error en importación:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = { importFoxProData, reconciliarDatos };