const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' CREACIÓN DE MATRÍCULAS FALTANTES');  
console.log('='.repeat(80));

(async () => {
    try {
        // Leer Excel
        const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        // Obtener todas las matrículas únicas del Excel
        const matriculasExcel = new Set();
        const nombresPorMatricula = new Map();
        
        data.forEach(row => {
            if (row['mat-prof']) {
                const mat = parseInt(row['mat-prof']);
                matriculasExcel.add(mat);
                
                const nombre = row['Razón social / Apellido y Nombre'];
                if (nombre && !nombre.includes('S.A.') && !nombre.includes('S.R.L.') && 
                    !nombre.includes('CONSTRUC') && nombre.includes(',')) {
                    nombresPorMatricula.set(mat, nombre);
                }
            }
        });
        
        console.log(`\nMatrículas únicas en Excel: ${matriculasExcel.size}\n`);
        
        // Verificar cuáles NO tienen matrícula en BD
        let creadas = 0;
        let yaExisten = 0;
        let sinProfesional = 0;
        
        for (const matricula of matriculasExcel) {
            // Verificar si la matrícula ya existe
            const matExiste = await pool.query(
                'SELECT id FROM copig.matriculas WHERE numero_matricula = $1',
                [matricula]
            );
            
            if (matExiste.rows.length > 0) {
                yaExisten++;
                continue;
            }
            
            // Buscar profesional por nombre o crear uno genérico
            let profesionalId = null;
            const nombre = nombresPorMatricula.get(matricula) || `PROFESIONAL EXTERNO MAT. ${matricula}`;
            
            // Primero buscar si ya existe un profesional con ese nombre
            const profExiste = await pool.query(
                'SELECT id FROM copig.profesionales WHERE UPPER(nombre) = UPPER($1)',
                [nombre]
            );
            
            if (profExiste.rows.length > 0) {
                profesionalId = profExiste.rows[0].id;
            } else {
                // Buscar profesional con DNI ficticio para esta matrícula
                const profFicticio = await pool.query(
                    'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
                    [90000000 + matricula]
                );
                
                if (profFicticio.rows.length > 0) {
                    profesionalId = profFicticio.rows[0].id;
                } else {
                    // Crear profesional si no existe
                    try {
                        const nuevoProf = await pool.query(`
                            INSERT INTO copig.profesionales 
                            (nombre, numero_documento, email, activo, created_at)
                            VALUES ($1, $2, $3, true, NOW())
                            ON CONFLICT (numero_documento) DO UPDATE
                            SET nombre = EXCLUDED.nombre
                            RETURNING id
                        `, [
                            nombre.toUpperCase(),
                            90000000 + matricula,
                            `profesional${matricula}@externo.com`
                        ]);
                        profesionalId = nuevoProf.rows[0].id;
                    } catch (err) {
                        // Si falla, buscar por email alternativo
                        const profEmail = await pool.query(
                            'SELECT id FROM copig.profesionales WHERE email = $1',
                            [`profesional${matricula}@externo.com`]
                        );
                        
                        if (profEmail.rows.length > 0) {
                            profesionalId = profEmail.rows[0].id;
                        }
                    }
                }
            }
            
            if (!profesionalId) {
                sinProfesional++;
                console.log(`⚠️ No se pudo crear profesional para matrícula ${matricula}`);
                continue;
            }
            
            // Crear la matrícula
            try {
                await pool.query(`
                    INSERT INTO copig.matriculas 
                    (profesional_id, numero_matricula, categoria, estado, fecha_inscripcion, activo, created_at)
                    VALUES ($1, $2, 'A', 'A', CURRENT_DATE, true, NOW())
                    ON CONFLICT (numero_matricula) DO NOTHING
                `, [profesionalId, matricula]);
                
                creadas++;
                
                if (creadas % 50 === 0) {
                    console.log(`  Creadas: ${creadas} matrículas...`);
                }
                
            } catch (err) {
                console.log(`Error creando matrícula ${matricula}: ${err.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESULTADO');
        console.log('='.repeat(80));
        
        console.log(`\n✅ Matrículas creadas: ${creadas}`);
        console.log(`⚠️ Ya existían: ${yaExisten}`);
        console.log(`❌ Sin profesional: ${sinProfesional}`);
        
        // Verificar total final
        const total = await pool.query('SELECT COUNT(*) as total FROM copig.matriculas');
        console.log(`\n📊 Total matrículas en BD: ${total.rows[0].total}`);
        
        // Verificar algunas matrículas específicas
        console.log('\n🔍 Verificación de matrículas problemáticas:');
        const pruebas = [734, 325, 3503, 101, 3596];
        
        for (const mat of pruebas) {
            const result = await pool.query(`
                SELECT m.numero_matricula, p.nombre
                FROM copig.matriculas m
                JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE m.numero_matricula = $1
            `, [mat]);
            
            if (result.rows.length > 0) {
                console.log(`  ✅ Matrícula ${mat}: ${result.rows[0].nombre.substring(0, 40)}`);
            } else {
                console.log(`  ❌ Matrícula ${mat}: Aún no existe`);
            }
        }
        
        console.log('\n✅ Proceso completado. Ahora ejecuta importar_rt_definitivo.js');
        
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();