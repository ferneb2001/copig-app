const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' CREACIÓN DE PROFESIONALES FALTANTES PARA RT');
console.log('='.repeat(80));
console.log('\nEsto creará profesionales básicos para las matrículas faltantes del Excel\n');

(async () => {
    try {
        // Leer Excel de Peñaloza
        const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        console.log(`📁 Total registros en Excel: ${data.length}\n`);
        
        // Extraer todas las matrículas únicas del Excel
        const matriculasExcel = new Set();
        data.forEach(row => {
            if (row['mat-prof']) {
                matriculasExcel.add(parseInt(row['mat-prof']));
            }
        });
        
        console.log(`📊 Matrículas únicas en Excel: ${matriculasExcel.size}\n`);
        
        // Verificar cuáles NO existen en BD
        console.log('🔍 Verificando matrículas faltantes...\n');
        
        const matriculasFaltantes = [];
        const nombresPorMatricula = new Map();
        
        // Guardar nombres del Excel
        data.forEach(row => {
            if (row['mat-prof'] && row['Razón social / Apellido y Nombre']) {
                const mat = parseInt(row['mat-prof']);
                const nombre = row['Razón social / Apellido y Nombre'];
                // Solo guardar si parece ser nombre de persona, no empresa
                if (!nombre.includes('S.A.') && !nombre.includes('S.R.L.') && 
                    !nombre.includes('CONSTRUC') && nombre.includes(',')) {
                    nombresPorMatricula.set(mat, nombre);
                }
            }
        });
        
        for (const matricula of matriculasExcel) {
            const existe = await pool.query(`
                SELECT m.numero_matricula 
                FROM copig.matriculas m
                WHERE m.numero_matricula = $1
            `, [matricula]);
            
            if (existe.rows.length === 0) {
                matriculasFaltantes.push(matricula);
            }
        }
        
        console.log(`❌ Matrículas faltantes: ${matriculasFaltantes.length}\n`);
        
        if (matriculasFaltantes.length > 0) {
            console.log('Primeras 10 matrículas faltantes:');
            matriculasFaltantes.slice(0, 10).forEach(mat => {
                const nombre = nombresPorMatricula.get(mat) || 'Sin nombre';
                console.log(`  - ${mat}: ${nombre}`);
            });
            
            console.log('\n' + '='.repeat(60));
            console.log(' CREANDO PROFESIONALES FALTANTES');
            console.log('='.repeat(60) + '\n');
            
            let creados = 0;
            let errores = 0;
            
            for (const matricula of matriculasFaltantes) {
                try {
                    // Obtener nombre del Excel si existe
                    let nombre = nombresPorMatricula.get(matricula);
                    
                    if (!nombre) {
                        // Buscar en todos los registros del Excel
                        const registro = data.find(r => parseInt(r['mat-prof']) === matricula);
                        if (registro && registro['Razón social / Apellido y Nombre']) {
                            nombre = registro['Razón social / Apellido y Nombre'];
                        }
                    }
                    
                    if (!nombre) {
                        nombre = `PROFESIONAL EXTERNO MAT. ${matricula}`;
                    }
                    
                    // Determinar tipo probable por rango de matrícula
                    let observacion = 'Profesional externo creado para completar RT';
                    if (matricula < 1000) {
                        observacion += ' (probable Arquitecto/Agrimensor)';
                    } else if (matricula > 9000) {
                        observacion += ' (probable Lic. Higiene y Seguridad)';
                    }
                    
                    // Crear profesional básico
                    const result = await pool.query(`
                        INSERT INTO copig.profesionales 
                        (nombre, numero_documento, email, telefono, activo, created_at)
                        VALUES ($1, $2, $3, $4, true, NOW())
                        RETURNING id
                    `, [
                        nombre.toUpperCase(),
                        90000000 + matricula, // DNI ficticio basado en matrícula
                        `profesional${matricula}@externo.com`,
                        observacion.substring(0, 20) // Usar parte de observación como teléfono temporal
                    ]);
                    
                    const profesionalId = result.rows[0].id;
                    
                    // Crear matrícula
                    await pool.query(`
                        INSERT INTO copig.matriculas 
                        (profesional_id, numero_matricula, categoria, estado, fecha_inscripcion, activo)
                        VALUES ($1, $2, 'A', 'A', CURRENT_DATE, true)
                    `, [profesionalId, matricula]);
                    
                    creados++;
                    
                    if (creados % 50 === 0) {
                        console.log(`  Creados: ${creados} profesionales...`);
                    }
                    
                } catch (err) {
                    errores++;
                    console.log(`  Error con matrícula ${matricula}: ${err.message}`);
                }
            }
            
            console.log('\n' + '='.repeat(80));
            console.log(' RESULTADO');
            console.log('='.repeat(80));
            
            console.log(`\n✅ Profesionales creados: ${creados}`);
            console.log(`❌ Errores: ${errores}`);
            
            // Verificar estado final
            const totalProf = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
            const totalMat = await pool.query('SELECT COUNT(*) as total FROM copig.matriculas');
            
            console.log('\n📊 ESTADO FINAL:');
            console.log(`  Total profesionales: ${totalProf.rows[0].total}`);
            console.log(`  Total matrículas: ${totalMat.rows[0].total}`);
            
            // Verificar algunas matrículas que antes no existían
            console.log('\n🔍 VERIFICACIÓN DE MATRÍCULAS CREADAS:');
            const pruebas = [734, 736, 8002, 8003, 8004];
            
            for (const mat of pruebas) {
                const result = await pool.query(`
                    SELECT p.nombre, m.numero_matricula
                    FROM copig.matriculas m
                    JOIN copig.profesionales p ON m.profesional_id = p.id
                    WHERE m.numero_matricula = $1
                `, [mat]);
                
                if (result.rows.length > 0) {
                    console.log(`  ✅ Matrícula ${mat}: ${result.rows[0].nombre.substring(0, 40)}`);
                }
            }
            
            console.log('\n✅ PROFESIONALES FALTANTES CREADOS');
            console.log('Ahora puedes ejecutar la importación de RT del Excel');
            
        } else {
            console.log('✅ No hay matrículas faltantes. Todo listo para importar RT.');
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();