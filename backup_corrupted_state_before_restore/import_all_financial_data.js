const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const DBFFile = require('node-dbf').default;

// Configuración BD
const configFile = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const pool = new Pool(configFile.database);

// Rutas de archivos DBF
const DBF_BASE_PATH = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos';
const DBF_FOXPRO_PATH = 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21';
const DBF_CONSEJO_PATH = 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\consejo';

async function setupFinancialTables() {
    const client = await pool.connect();
    
    try {
        console.log('🏗️ CONFIGURANDO SISTEMA FINANCIERO COPIG...\n');
        
        // 1. CREAR TABLA DE PAGOS
        console.log('💰 Creando tabla copig.pagos_historicos...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.pagos_historicos (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER,
                matricula VARCHAR(20),
                fecha_pago DATE,
                periodo VARCHAR(20),
                concepto VARCHAR(200),
                monto DECIMAL(12,2),
                tipo_pago VARCHAR(50),
                estado VARCHAR(50),
                referencia VARCHAR(100),
                dbf_origen VARCHAR(50),
                dbf_registro TEXT,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla pagos_historicos creada');

        // 2. CREAR TABLA DE RESTRICCIONES
        console.log('🚫 Creando tabla copig.restricciones_deudas...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.restricciones_deudas (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER,
                matricula VARCHAR(20),
                tipo_restriccion VARCHAR(100),
                descripcion TEXT,
                numero_resolucion VARCHAR(100),
                fecha_inicio DATE,
                fecha_fin DATE,
                estado VARCHAR(50) DEFAULT 'ACTIVA',
                dbf_origen VARCHAR(50),
                dbf_registro TEXT,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla restricciones_deudas creada');

        // 3. CREAR TABLA DE SANCIONES
        console.log('⚖️ Creando tabla copig.sanciones_aplicadas...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.sanciones_aplicadas (
                id SERIAL PRIMARY KEY,
                entidad_id VARCHAR(50),
                tipo_entidad VARCHAR(20),
                descripcion TEXT,
                fecha_sancion DATE,
                monto_multa DECIMAL(12,2),
                articulos VARCHAR(200),
                expediente VARCHAR(100),
                dbf_origen VARCHAR(50),
                dbf_registro TEXT,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla sanciones_aplicadas creada');

        return true;
    } catch (error) {
        console.error('❌ Error configurando tablas:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

async function importSPPAGOS() {
    console.log('\n📊 IMPORTANDO SPPAGOS.DBF (Pagos principales)...');
    
    try {
        // Buscar el archivo más actualizado
        const paths = [
            path.join(DBF_BASE_PATH, 'SPPAGOS.DBF'),
            path.join(DBF_FOXPRO_PATH, 'SPPAGOS.DBF'),
            path.join(DBF_CONSEJO_PATH, 'SPPAGOS.DBF')
        ];
        
        let selectedPath = null;
        for (const p of paths) {
            if (fs.existsSync(p)) {
                selectedPath = p;
                break;
            }
        }
        
        if (!selectedPath) {
            console.log('❌ No se encontró SPPAGOS.DBF');
            return 0;
        }
        
        console.log(`📁 Archivo encontrado: ${selectedPath}`);
        const dbf = new DBFFile(selectedPath);
        await dbf.open();
        
        const client = await pool.connect();
        let imported = 0;
        
        try {
            const records = await dbf.readRecords();
            console.log(`📈 Total de registros a procesar: ${records.length}`);
            
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                
                if (i % 5000 === 0) {
                    console.log(`   Procesando: ${i}/${records.length} (${Math.round(i/records.length*100)}%)`);
                }
                
                // Extraer datos del registro (estructura puede variar)
                const registroStr = JSON.stringify(record);
                
                await client.query(`
                    INSERT INTO copig.pagos_historicos 
                    (matricula, dbf_origen, dbf_registro, fecha_importacion)
                    VALUES ($1, $2, $3, NOW())
                `, [
                    record.MATRICULA || record.MATPROF || '',
                    'SPPAGOS.DBF',
                    registroStr
                ]);
                
                imported++;
            }
            
            console.log(`✅ ${imported} pagos importados de SPPAGOS.DBF`);
            return imported;
            
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Error importando SPPAGOS:', error.message);
        return 0;
    }
}

async function importSPRESTRI() {
    console.log('\n🚫 IMPORTANDO SPRESTRI.DBF (Restricciones/Deudas)...');
    
    try {
        const paths = [
            path.join(DBF_BASE_PATH, 'SPRESTRI.DBF'),
            path.join(DBF_FOXPRO_PATH, 'SPRESTRI.DBF'),
            path.join(DBF_CONSEJO_PATH, 'SPRESTRI.DBF')
        ];
        
        let selectedPath = null;
        for (const p of paths) {
            if (fs.existsSync(p)) {
                selectedPath = p;
                break;
            }
        }
        
        if (!selectedPath) {
            console.log('❌ No se encontró SPRESTRI.DBF');
            return 0;
        }
        
        console.log(`📁 Archivo encontrado: ${selectedPath}`);
        const dbf = new DBFFile(selectedPath);
        await dbf.open();
        
        const client = await pool.connect();
        let imported = 0;
        
        try {
            const records = await dbf.readRecords();
            console.log(`📈 Total de restricciones a procesar: ${records.length}`);
            
            for (const record of records) {
                const registroStr = JSON.stringify(record);
                
                await client.query(`
                    INSERT INTO copig.restricciones_deudas 
                    (matricula, tipo_restriccion, descripcion, dbf_origen, dbf_registro)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    record.MATRICULA || record.MATPROF || '',
                    record.TIPO || 'RESTRICCION',
                    record.DESCRIPCION || record.MOTIVO || registroStr,
                    'SPRESTRI.DBF',
                    registroStr
                ]);
                
                imported++;
            }
            
            console.log(`✅ ${imported} restricciones importadas de SPRESTRI.DBF`);
            return imported;
            
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Error importando SPRESTRI:', error.message);
        return 0;
    }
}

async function importSANCION() {
    console.log('\n⚖️ IMPORTANDO SANCION.DBF (Sanciones)...');
    
    try {
        const paths = [
            path.join(DBF_BASE_PATH, 'SANCION.DBF'),
            path.join(DBF_FOXPRO_PATH, 'SANCION.DBF')
        ];
        
        let selectedPath = null;
        for (const p of paths) {
            if (fs.existsSync(p)) {
                selectedPath = p;
                break;
            }
        }
        
        if (!selectedPath) {
            console.log('❌ No se encontró SANCION.DBF');
            return 0;
        }
        
        console.log(`📁 Archivo encontrado: ${selectedPath}`);
        const dbf = new DBFFile(selectedPath);
        await dbf.open();
        
        const client = await pool.connect();
        let imported = 0;
        
        try {
            const records = await dbf.readRecords();
            console.log(`📈 Total de sanciones a procesar: ${records.length}`);
            
            for (const record of records) {
                const registroStr = JSON.stringify(record);
                
                await client.query(`
                    INSERT INTO copig.sanciones_aplicadas 
                    (entidad_id, descripcion, dbf_origen, dbf_registro)
                    VALUES ($1, $2, $3, $4)
                `, [
                    record.ID || record.EMPRESA || '',
                    record.DESCRIPCION || registroStr,
                    'SANCION.DBF',
                    registroStr
                ]);
                
                imported++;
            }
            
            console.log(`✅ ${imported} sanciones importadas de SANCION.DBF`);
            return imported;
            
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ Error importando SANCION:', error.message);
        return 0;
    }
}

async function importPAGOFiles() {
    console.log('\n📅 IMPORTANDO ARCHIVOS PAGO*.DBF (Pagos por periodo)...');
    
    const pagoFiles = [
        'PAGO2025.DBF', 'PAGO2224.DBF', 'PAGO1999.DBF', 
        'PAGO2010.DBF', 'PAGO2104.DBF', 'PAGO2106.DBF',
        'PAGO2201.DBF', 'PAGO2324.DBF', 'PAGO2504.DBF'
    ];
    
    let totalImported = 0;
    
    for (const fileName of pagoFiles) {
        try {
            const paths = [
                path.join(DBF_BASE_PATH, fileName),
                path.join(DBF_FOXPRO_PATH, fileName),
                path.join(DBF_CONSEJO_PATH, fileName)
            ];
            
            let selectedPath = null;
            for (const p of paths) {
                if (fs.existsSync(p)) {
                    selectedPath = p;
                    break;
                }
            }
            
            if (!selectedPath) {
                console.log(`   ⚠️ No encontrado: ${fileName}`);
                continue;
            }
            
            console.log(`   📁 Procesando ${fileName}...`);
            const dbf = new DBFFile(selectedPath);
            await dbf.open();
            
            const client = await pool.connect();
            
            try {
                const records = await dbf.readRecords();
                
                for (const record of records) {
                    const registroStr = JSON.stringify(record);
                    
                    await client.query(`
                        INSERT INTO copig.pagos_historicos 
                        (matricula, periodo, dbf_origen, dbf_registro)
                        VALUES ($1, $2, $3, $4)
                    `, [
                        record.MATRICULA || record.MATPROF || '',
                        fileName.replace('.DBF', ''),
                        fileName,
                        registroStr
                    ]);
                    
                    totalImported++;
                }
                
                console.log(`      ✅ ${records.length} registros de ${fileName}`);
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            console.error(`   ❌ Error con ${fileName}:`, error.message);
        }
    }
    
    console.log(`✅ Total importados de archivos PAGO: ${totalImported}`);
    return totalImported;
}

async function generateReport() {
    console.log('\n📊 GENERANDO REPORTE FINAL...\n');
    
    const client = await pool.connect();
    
    try {
        const pagos = await client.query('SELECT COUNT(*) FROM copig.pagos_historicos');
        const restricciones = await client.query('SELECT COUNT(*) FROM copig.restricciones_deudas');
        const sanciones = await client.query('SELECT COUNT(*) FROM copig.sanciones_aplicadas');
        
        console.log('╔════════════════════════════════════════════╗');
        console.log('║   SISTEMA FINANCIERO COPIG - IMPORTACIÓN    ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║ 💰 Pagos históricos:      ${pagos.rows[0].count.toString().padEnd(17)} ║`);
        console.log(`║ 🚫 Restricciones/Deudas:  ${restricciones.rows[0].count.toString().padEnd(17)} ║`);
        console.log(`║ ⚖️ Sanciones aplicadas:    ${sanciones.rows[0].count.toString().padEnd(17)} ║`);
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║ 📊 TOTAL REGISTROS:       ${(parseInt(pagos.rows[0].count) + parseInt(restricciones.rows[0].count) + parseInt(sanciones.rows[0].count)).toString().padEnd(17)} ║`);
        console.log('╚════════════════════════════════════════════╝');
        
    } finally {
        client.release();
    }
}

// EJECUTAR TODO
async function main() {
    try {
        console.log('═══════════════════════════════════════════════');
        console.log('   IMPORTACIÓN MASIVA DATOS FINANCIEROS COPIG');
        console.log('═══════════════════════════════════════════════');
        console.log('Fernando Adrian Nebro - Sistema COPIG 2025\n');
        
        // 1. Configurar tablas
        await setupFinancialTables();
        
        // 2. Importar datos principales
        await importSPPAGOS();
        await importSPRESTRI();
        await importSANCION();
        
        // 3. Importar pagos por periodo
        await importPAGOFiles();
        
        // 4. Generar reporte
        await generateReport();
        
        console.log('\n✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
        console.log('📌 Los datos están listos para ser procesados y vinculados con profesionales');
        
    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Ejecutar
main();