/**
 * IMPORTACIÓN CORRECTA DE REPRESENTANTES TÉCNICOS
 * Usando la estructura real del archivo SPRTCOS.DBF
 * Campos: EMPRESA (ID), MATPROF (matrícula), CATEGOR, RTINICIO, RTFINAL
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

async function importarRepresentantes() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 IMPORTACIÓN MASIVA DE REPRESENTANTES TÉCNICOS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const archivo = 'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRTCOS.DBF';
    
    try {
        // Limpiar tabla actual (preguntar primero)
        console.log('⚠️  ATENCIÓN: Se van a reemplazar los 124 representantes actuales');
        console.log('   con los 3,194 registros del archivo SPRTCOS.DBF\n');
        
        // Limpiar tabla
        await pool.query('DELETE FROM copig.representantes_tecnicos');
        console.log('✅ Tabla limpiada\n');
        
        // Obtener mapeo de IDs de empresas viejos a nuevos
        // Asumiendo que el ID en SPRTCOS corresponde al ID antiguo de empresas
        const empresasResult = await pool.query('SELECT id FROM copig.empresas ORDER BY id');
        const empresasExistentes = new Set(empresasResult.rows.map(e => e.id));
        
        // Obtener profesionales por matrícula
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
        
        console.log(`📊 Empresas en BD: ${empresasExistentes.size}`);
        console.log(`📊 Profesionales con matrícula: ${Object.keys(profesionalesPorMatricula).length}\n`);
        
        const parser = new Parser(archivo);
        let total = 0;
        let importados = 0;
        let sinEmpresa = 0;
        let sinProfesional = 0;
        let duplicados = 0;
        const combinacionesImportadas = new Set();
        
        parser.on('record', async (record) => {
            total++;
            
            const empresaId = record.EMPRESA ? parseInt(record.EMPRESA) : null;
            const matricula = record.MATPROF ? record.MATPROF.toString() : null;
            const categoria = record.CATEGOR ? record.CATEGOR.toString().trim() : 'A';
            const fechaInicio = record.RTINICIO ? parseFecha(record.RTINICIO.toString()) : null;
            const fechaFin = record.RTFINAL ? parseFecha(record.RTFINAL.toString()) : null;
            
            // Validar datos
            if (!empresaId || !matricula) {
                return;
            }
            
            // Verificar si empresa existe
            if (!empresasExistentes.has(empresaId)) {
                sinEmpresa++;
                return;
            }
            
            // Verificar si profesional existe
            const profesionalId = profesionalesPorMatricula[matricula];
            if (!profesionalId) {
                sinProfesional++;
                return;
            }
            
            // Evitar duplicados
            const clave = `${empresaId}-${profesionalId}`;
            if (combinacionesImportadas.has(clave)) {
                duplicados++;
                return;
            }
            combinacionesImportadas.add(clave);
            
            // Insertar representante
            try {
                await pool.query(`
                    INSERT INTO copig.representantes_tecnicos 
                    (empresa_id, profesional_id, categoria_representacion, fecha_inicio, fecha_fin, activo)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (empresa_id, profesional_id) DO UPDATE
                    SET categoria_representacion = $3, fecha_inicio = $4, fecha_fin = $5
                `, [
                    empresaId,
                    profesionalId,
                    categoria,
                    fechaInicio,
                    fechaFin,
                    !fechaFin // activo si no tiene fecha fin
                ]);
                
                importados++;
                
                if (importados % 100 === 0) {
                    console.log(`📈 Progreso: ${importados} importados de ${total} procesados...`);
                }
            } catch (err) {
                // Silenciar errores individuales
            }
        });
        
        parser.on('end', async () => {
            console.log('\n═══════════════════════════════════════════════════════════════');
            console.log('📊 RESUMEN DE IMPORTACIÓN:');
            console.log('─────────────────────────────────────────');
            console.log(`✅ Importados exitosamente: ${importados}`);
            console.log(`📋 Total procesados: ${total}`);
            console.log(`❌ Sin empresa válida: ${sinEmpresa}`);
            console.log(`❌ Sin profesional válido: ${sinProfesional}`);
            console.log(`⚠️  Duplicados omitidos: ${duplicados}`);
            
            // Verificar resultado final
            const resultado = await pool.query(`
                SELECT COUNT(*) as total,
                       COUNT(DISTINCT empresa_id) as empresas,
                       COUNT(DISTINCT profesional_id) as profesionales
                FROM copig.representantes_tecnicos
            `);
            
            console.log('\n📈 ESTADO FINAL:');
            console.log('─────────────────────────────────────────');
            console.log(`Total representantes técnicos: ${resultado.rows[0].total}`);
            console.log(`Empresas con representantes: ${resultado.rows[0].empresas}`);
            console.log(`Profesionales como representantes: ${resultado.rows[0].profesionales}`);
            
            // Mostrar ejemplos
            const ejemplos = await pool.query(`
                SELECT e.razon_social, p.nombre, rt.categoria_representacion, rt.fecha_inicio
                FROM copig.representantes_tecnicos rt
                JOIN copig.empresas e ON rt.empresa_id = e.id
                JOIN copig.profesionales p ON rt.profesional_id = p.id
                LIMIT 5
            `);
            
            console.log('\n📋 EJEMPLOS IMPORTADOS:');
            console.log('─────────────────────────────────────────');
            ejemplos.rows.forEach(ej => {
                console.log(`- ${ej.nombre} → ${ej.razon_social} (Cat: ${ej.categoria_representacion})`);
            });
            
            await pool.end();
            console.log('\n✅ Importación completada exitosamente');
        });
        
        parser.parse();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
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

importarRepresentantes();