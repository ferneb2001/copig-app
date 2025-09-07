const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración BD
const configFile = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const pool = new Pool(configFile.database);

// Parser manual para DBF
function parseDBFManual(filePath) {
    const buffer = fs.readFileSync(filePath);
    const records = [];
    
    // DBF header es de 32 bytes + campos
    // Simplificado: leer raw data
    const fileSize = buffer.length;
    const recordSize = 80; // Estimado para SPRESTRI
    const startData = 321; // Típico inicio de datos
    
    let position = startData;
    while (position < fileSize - recordSize) {
        const recordBuffer = buffer.slice(position, position + recordSize);
        const recordString = recordBuffer.toString('latin1').replace(/\0/g, ' ');
        
        if (recordString.trim().length > 0 && !recordString.includes('\x1A')) {
            records.push(recordString);
        }
        
        position += recordSize;
    }
    
    return records;
}

async function importRestricciones() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   IMPORTACIÓN DE RESTRICCIONES/DEUDAS (SOLO INFORMATIVO)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️ NOTA: Estas restricciones son SOLO INFORMATIVAS');
    console.log('No bloquean el ejercicio profesional (según Fernando Nebro)\n');
    
    const client = await pool.connect();
    
    try {
        // Buscar archivo SPRESTRI.DBF
        const dbfPath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRESTRI.DBF';
        
        if (!fs.existsSync(dbfPath)) {
            console.log('❌ No se encontró SPRESTRI.DBF');
            return;
        }
        
        console.log('📁 Procesando SPRESTRI.DBF...');
        const records = parseDBFManual(dbfPath);
        console.log(`📊 Total de restricciones encontradas: ${records.length}\n`);
        
        let imported = 0;
        let suspensiones = 0;
        let levantamientos = 0;
        let otros = 0;
        
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            
            // Mostrar progreso
            if (i % 500 === 0 && i > 0) {
                console.log(`   Procesando: ${i}/${records.length} (${Math.round(i/records.length*100)}%)`);
            }
            
            // Extraer información del registro
            // Formato estimado: " 6497A SUSPENSIONRESOL.22/94..."
            const matricula = record.substring(0, 7).trim();
            let tipoRestriccion = 'INFORMATIVA';
            let descripcion = record;
            
            if (record.includes('SUSPENSION')) {
                tipoRestriccion = 'SUSPENSION_INFORMATIVA';
                suspensiones++;
            } else if (record.includes('LEVANTAM')) {
                tipoRestriccion = 'LEVANTAMIENTO';
                levantamientos++;
            } else {
                otros++;
            }
            
            // Extraer fecha si existe (formato AAAAMMDD)
            const fechaMatch = record.match(/(\d{8})/);
            let fechaInicio = null;
            if (fechaMatch) {
                const fechaStr = fechaMatch[1];
                const año = fechaStr.substring(0, 4);
                const mes = fechaStr.substring(4, 6);
                const dia = fechaStr.substring(6, 8);
                if (parseInt(año) > 1900 && parseInt(año) < 2030) {
                    fechaInicio = `${año}-${mes}-${dia}`;
                }
            }
            
            // Buscar profesional por matrícula
            const profResult = await client.query(`
                SELECT p.id 
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE m.numero_matricula::TEXT = $1
                LIMIT 1
            `, [matricula]);
            
            const profesionalId = profResult.rows[0]?.id || null;
            
            // Insertar restricción informativa
            await client.query(`
                INSERT INTO copig.restricciones_deudas 
                (profesional_id, matricula, tipo_restriccion, descripcion, fecha_inicio, estado, dbf_origen, dbf_registro)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                profesionalId,
                matricula,
                tipoRestriccion,
                descripcion.substring(0, 500), // Limitar descripción
                fechaInicio,
                'INFORMATIVA', // Siempre informativa
                'SPRESTRI.DBF',
                record
            ]);
            
            imported++;
        }
        
        console.log('\n✅ IMPORTACIÓN COMPLETADA');
        console.log('═══════════════════════════════════════════');
        console.log(`📊 Total importadas: ${imported} restricciones`);
        console.log(`   - Suspensiones informativas: ${suspensiones}`);
        console.log(`   - Levantamientos: ${levantamientos}`);
        console.log(`   - Otros tipos: ${otros}`);
        console.log('\n⚠️ RECORDATORIO: Estas restricciones son SOLO INFORMATIVAS');
        console.log('No afectan la habilitación para ejercer la profesión');
        
        // Mostrar algunas muestras
        const muestras = await client.query(`
            SELECT matricula, tipo_restriccion, fecha_inicio
            FROM copig.restricciones_deudas
            WHERE profesional_id IS NOT NULL
            LIMIT 5
        `);
        
        if (muestras.rows.length > 0) {
            console.log('\n📋 Ejemplos de restricciones importadas:');
            muestras.rows.forEach(r => {
                console.log(`   Matrícula ${r.matricula}: ${r.tipo_restriccion} ${r.fecha_inicio ? `(${r.fecha_inicio})` : ''}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
    }
}

async function importSanciones() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   IMPORTACIÓN DE SANCIONES (INFORMATIVO)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const client = await pool.connect();
    
    try {
        const dbfPath = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SANCION.DBF';
        
        if (!fs.existsSync(dbfPath)) {
            console.log('❌ No se encontró SANCION.DBF');
            return;
        }
        
        console.log('📁 Procesando SANCION.DBF...');
        const buffer = fs.readFileSync(dbfPath);
        
        // Parser simplificado para SANCION.DBF
        const records = [];
        const recordSize = 134; // Según análisis previo
        const startData = 321;
        
        let position = startData;
        while (position < buffer.length - recordSize) {
            const recordBuffer = buffer.slice(position, position + recordSize);
            const recordString = recordBuffer.toString('latin1').replace(/\0/g, ' ');
            
            if (recordString.trim().length > 0 && !recordString.includes('\x1A')) {
                records.push(recordString);
            }
            
            position += recordSize;
        }
        
        console.log(`📊 Total de sanciones encontradas: ${records.length}\n`);
        
        let imported = 0;
        
        for (const record of records) {
            // Formato: "  229ENEMP.ING.DE OBRAS.CONSTR.CIV..."
            const entidadId = record.substring(0, 10).trim();
            const descripcion = record.substring(10, 100).trim();
            
            await client.query(`
                INSERT INTO copig.sanciones_aplicadas 
                (entidad_id, tipo_entidad, descripcion, dbf_origen, dbf_registro)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                entidadId,
                'EMPRESA',
                descripcion || record,
                'SANCION.DBF',
                record
            ]);
            
            imported++;
        }
        
        console.log(`✅ ${imported} sanciones importadas (INFORMATIVO)`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
    }
}

// Ejecutar importaciones
async function main() {
    try {
        await importRestricciones();
        await importSanciones();
        
        // Reporte final
        const client = await pool.connect();
        const stats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.pagos_historicos) as pagos,
                (SELECT COUNT(*) FROM copig.restricciones_deudas) as restricciones,
                (SELECT COUNT(*) FROM copig.sanciones_aplicadas) as sanciones
        `);
        client.release();
        
        console.log('\n╔════════════════════════════════════════════════╗');
        console.log('║     SISTEMA FINANCIERO COPIG - ESTADO ACTUAL    ║');
        console.log('╠════════════════════════════════════════════════╣');
        console.log(`║ 💰 Pagos históricos:       ${stats.rows[0].pagos.toString().padEnd(20)} ║`);
        console.log(`║ 📋 Restricciones (info):   ${stats.rows[0].restricciones.toString().padEnd(20)} ║`);
        console.log(`║ ⚖️ Sanciones (info):        ${stats.rows[0].sanciones.toString().padEnd(20)} ║`);
        console.log('╚════════════════════════════════════════════════╝');
        console.log('\n✅ Sistema listo para gestión financiera');
        console.log('📌 Las restricciones y sanciones son SOLO INFORMATIVAS');
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();