const DBF = require('node-dbf').default;
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);
const path = require('path');

console.log('='.repeat(80));
console.log(' IMPORTACIÓN DE PROFESIONALES EXTERNOS (NO COPIG)');
console.log('='.repeat(80));
console.log('\nEsto importará arquitectos, agrimensores y lic. higiene y seguridad\n');

async function importarProfesionales(dbfPath, tipo) {
    try {
        const dbfFile = new DBF(dbfPath, 'latin1');
        console.log(`\n📁 Procesando ${tipo}...`);
        console.log(`   Total registros: ${dbfFile.recordCount}`);
        
        let importados = 0;
        let errores = 0;
        let duplicados = 0;
        
        for (let i = 0; i < dbfFile.recordCount; i++) {
            const record = dbfFile.records[i];
            
            // Extraer datos según el tipo
            let apellido, nombre, documento, estado;
            
            if (tipo.includes('SV')) {
                // Arquitectos/Agrimensores
                if (record['APELLNOM']) {
                    const partes = record['APELLNOM'].split(',');
                    apellido = partes[0] ? partes[0].trim() : '';
                    nombre = partes[1] ? partes[1].trim() : '';
                } else {
                    apellido = record.APELLIDO || '';
                    nombre = record.NOMBRE || '';
                }
                documento = record.DOCUMENTO || record.DNI || null;
                estado = record.ESTDO === 'A' ? 'activo' : 'inactivo';
            } else {
                // Higiene y Seguridad
                apellido = record.APELLIDO || '';
                nombre = record.NOMBRE || '';
                documento = record.DOCUMENTO || record.DNI || null;
                estado = record.ESTADO === 'A' ? 'activo' : 'inactivo';
            }
            
            if (!apellido && !nombre) continue;
            
            try {
                // Verificar si ya existe por documento
                if (documento) {
                    const existe = await pool.query(
                        'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
                        [documento]
                    );
                    
                    if (existe.rows.length > 0) {
                        duplicados++;
                        continue;
                    }
                }
                
                // Insertar profesional
                const result = await pool.query(`
                    INSERT INTO copig.profesionales 
                    (nombre, numero_documento, email, telefono, direccion, 
                     codigo_postal, localidad, provincia, pais, estado, 
                     fecha_nacimiento, categoria, observaciones, fecha_creacion)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                            NULL, 'A', $11, NOW())
                    RETURNING id
                `, [
                    `${apellido}, ${nombre}`.toUpperCase(),
                    documento,
                    record.EMAIL || null,
                    record.TELEFONO || null,
                    record.DIRECCION || record.DOMICILIO || null,
                    record.CODPOS || null,
                    record.LOCALIDAD || null,
                    'MENDOZA',
                    'ARGENTINA',
                    estado,
                    `Profesional externo importado de ${tipo}`
                ]);
                
                importados++;
                
                if (importados % 100 === 0) {
                    process.stdout.write(`   Importados: ${importados}\r`);
                }
                
            } catch (err) {
                errores++;
            }
        }
        
        console.log(`\n   ✅ Importados: ${importados}`);
        console.log(`   ⚠️  Duplicados: ${duplicados}`);
        console.log(`   ❌ Errores: ${errores}`);
        
        return importados;
        
    } catch (error) {
        console.error(`Error procesando ${dbfPath}:`, error.message);
        return 0;
    }
}

async function importarMatriculas(dbfPath, tipo) {
    try {
        const dbfFile = new DBF(dbfPath, 'latin1');
        console.log(`\n📁 Procesando matrículas ${tipo}...`);
        console.log(`   Total registros: ${dbfFile.recordCount}`);
        
        let importadas = 0;
        let errores = 0;
        let sinProfesional = 0;
        
        for (let i = 0; i < dbfFile.recordCount; i++) {
            const record = dbfFile.records[i];
            
            const matricula = record.MATRICULA;
            const documento = record.DOCUMENTO || record.DNI;
            const titulo = record.TITULO || tipo;
            
            if (!matricula) continue;
            
            try {
                // Buscar profesional por documento
                if (documento) {
                    const prof = await pool.query(
                        'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
                        [documento]
                    );
                    
                    if (prof.rows.length > 0) {
                        // Insertar matrícula
                        await pool.query(`
                            INSERT INTO copig.matriculas 
                            (profesional_id, numero_matricula, tipo_matricula, 
                             fecha_otorgamiento, estado, observaciones)
                            VALUES ($1, $2, $3, CURRENT_DATE, 'activa', $4)
                            ON CONFLICT (numero_matricula) DO NOTHING
                        `, [
                            prof.rows[0].id,
                            parseInt(matricula),
                            titulo,
                            `Matrícula ${tipo} importada`
                        ]);
                        
                        importadas++;
                    } else {
                        sinProfesional++;
                    }
                } else {
                    sinProfesional++;
                }
                
                if (importadas % 100 === 0) {
                    process.stdout.write(`   Importadas: ${importadas}\r`);
                }
                
            } catch (err) {
                errores++;
            }
        }
        
        console.log(`\n   ✅ Importadas: ${importadas}`);
        console.log(`   ⚠️  Sin profesional: ${sinProfesional}`);
        console.log(`   ❌ Errores: ${errores}`);
        
        return importadas;
        
    } catch (error) {
        console.error(`Error procesando ${dbfPath}:`, error.message);
        return 0;
    }
}

(async () => {
    try {
        const basePath = 'C:\\copig-app\\adminsp\\COPIG\\';
        
        console.log('\n🚀 INICIANDO IMPORTACIÓN...\n');
        
        // Contar profesionales antes
        const antesProfesionales = await pool.query(
            'SELECT COUNT(*) as total FROM copig.profesionales'
        );
        const antesMatriculas = await pool.query(
            'SELECT COUNT(*) as total FROM copig.matriculas'
        );
        
        console.log(`Estado inicial:`);
        console.log(`  Profesionales: ${antesProfesionales.rows[0].total}`);
        console.log(`  Matrículas: ${antesMatriculas.rows[0].total}`);
        
        // IMPORTAR ARQUITECTOS/AGRIMENSORES
        console.log('\n' + '='.repeat(60));
        console.log(' 1. ARQUITECTOS Y AGRIMENSORES (SV*)');
        console.log('='.repeat(60));
        
        const svprofImportados = await importarProfesionales(
            path.join(basePath, 'SVPROF.DBF'), 
            'SVPROF'
        );
        
        const svmatriImportadas = await importarMatriculas(
            path.join(basePath, 'SVMATRI.DBF'),
            'SVMATRI'
        );
        
        // IMPORTAR HIGIENE Y SEGURIDAD
        console.log('\n' + '='.repeat(60));
        console.log(' 2. LIC. HIGIENE Y SEGURIDAD (SO*)');
        console.log('='.repeat(60));
        
        const soprofImportados = await importarProfesionales(
            path.join(basePath, 'SOPROF.DBF'),
            'SOPROF'
        );
        
        const somatriImportadas = await importarMatriculas(
            path.join(basePath, 'SOMATRI.DBF'),
            'SOMATRI'
        );
        
        // Contar profesionales después
        const despuesProfesionales = await pool.query(
            'SELECT COUNT(*) as total FROM copig.profesionales'
        );
        const despuesMatriculas = await pool.query(
            'SELECT COUNT(*) as total FROM copig.matriculas'
        );
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESUMEN FINAL DE IMPORTACIÓN');
        console.log('='.repeat(80));
        
        console.log('\n📊 TOTALES IMPORTADOS:');
        console.log(`  Profesionales agregados: ${despuesProfesionales.rows[0].total - antesProfesionales.rows[0].total}`);
        console.log(`  Matrículas agregadas: ${despuesMatriculas.rows[0].total - antesMatriculas.rows[0].total}`);
        
        console.log('\n📈 ESTADO FINAL:');
        console.log(`  Total profesionales en BD: ${despuesProfesionales.rows[0].total}`);
        console.log(`  Total matrículas en BD: ${despuesMatriculas.rows[0].total}`);
        
        // Verificar algunas matrículas del Excel que antes no existían
        console.log('\n🔍 VERIFICANDO MATRÍCULAS QUE ANTES FALTABAN:');
        const matriculasPrueba = [734, 735, 736, 9106, 9517];
        
        for (const mat of matriculasPrueba) {
            const result = await pool.query(`
                SELECT p.nombre, m.numero_matricula
                FROM copig.matriculas m
                JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE m.numero_matricula = $1
            `, [mat]);
            
            if (result.rows.length > 0) {
                console.log(`  ✅ Matrícula ${mat}: ${result.rows[0].nombre}`);
            }
        }
        
        console.log('\n✅ IMPORTACIÓN COMPLETADA');
        console.log('Ahora puedes ejecutar la importación de RT del Excel');
        
        await pool.end();
        
    } catch (error) {
        console.error('Error general:', error);
        await pool.end();
    }
})();