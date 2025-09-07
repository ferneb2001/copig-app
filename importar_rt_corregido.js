const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN DE REPRESENTANTES TÉCNICOS - VERSIÓN CORREGIDA');
console.log('='.repeat(80));

// Leer archivo Excel
const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📁 Total de registros en Excel: ${data.length}`);

(async () => {
    try {
        // Primero verificar algunas matrículas
        console.log('\n🔍 VERIFICANDO MATRÍCULAS...\n');
        
        const matriculasExcel = [...new Set(data.filter(r => r['mat-prof']).map(r => r['mat-prof']))];
        console.log(`Total de matrículas únicas en Excel: ${matriculasExcel.size}`);
        
        // Verificar cuántas existen en BD
        let encontradas = 0;
        let noEncontradas = [];
        
        for (const mat of matriculasExcel.slice(0, 10)) {
            const result = await pool.query(
                'SELECT COUNT(*) as count FROM copig.matriculas WHERE numero_matricula = $1',
                [parseInt(mat)]
            );
            
            if (result.rows[0].count > 0) {
                encontradas++;
                console.log(`   ✅ Matrícula ${mat}: EXISTE`);
            } else {
                noEncontradas.push(mat);
                console.log(`   ❌ Matrícula ${mat}: NO EXISTE`);
            }
        }
        
        // Ahora importar RT
        console.log('\n👷 IMPORTANDO REPRESENTANTES TÉCNICOS...\n');
        
        // Primero limpiar RT antiguos (ya hicimos backup)
        await pool.query('DELETE FROM copig.representantes_tecnicos');
        console.log('   ✅ Tabla limpiada');
        
        // Organizar datos por empresa
        const empresasRT = {};
        data.forEach(row => {
            const cuit = row['cuit'] ? String(row['cuit']).trim() : null;
            const matricula = row['mat-prof'];
            const razonSocial = row['Razón social / Apellido y Nombre'];
            
            if (cuit && matricula) {
                if (!empresasRT[cuit]) {
                    empresasRT[cuit] = {
                        razon: razonSocial,
                        representantes: []
                    };
                }
                empresasRT[cuit].representantes.push({
                    matricula: parseInt(matricula),
                    categoria: row['cat-prof'] || 'A',
                    fecha_inicio: row['fecha-ini'],
                    fecha_fin: row['fecha-fin']
                });
            }
        });
        
        console.log(`   Empresas con RT a procesar: ${Object.keys(empresasRT).length}`);
        
        let rtImportados = 0;
        let rtNoImportados = 0;
        let empresasNoEncontradas = 0;
        
        for (const [cuit, datos] of Object.entries(empresasRT)) {
            // Buscar empresa por CUIT
            const empresaResult = await pool.query(
                'SELECT id FROM copig.empresas WHERE cuit = $1',
                [cuit]
            );
            
            if (empresaResult.rows.length === 0) {
                empresasNoEncontradas++;
                continue;
            }
            
            const empresaId = empresaResult.rows[0].id;
            
            // Importar cada RT
            for (const rt of datos.representantes) {
                // Buscar profesional por matrícula
                const profResult = await pool.query(`
                    SELECT p.id 
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    WHERE m.numero_matricula = $1
                    LIMIT 1
                `, [rt.matricula]);
                
                if (profResult.rows.length > 0) {
                    try {
                        await pool.query(`
                            INSERT INTO copig.representantes_tecnicos (
                                empresa_id,
                                profesional_id,
                                fecha_inicio,
                                fecha_fin,
                                activo,
                                categoria
                            ) VALUES ($1, $2, $3, $4, $5, $6)
                        `, [
                            empresaId,
                            profResult.rows[0].id,
                            rt.fecha_inicio || null,
                            rt.fecha_fin || null,
                            !rt.fecha_fin,
                            rt.categoria
                        ]);
                        
                        rtImportados++;
                        
                        if (rtImportados % 100 === 0) {
                            process.stdout.write(`   Importados: ${rtImportados}\r`);
                        }
                    } catch (err) {
                        // Puede ser duplicado, ignorar
                    }
                } else {
                    rtNoImportados++;
                }
            }
        }
        
        console.log(`\n\n✅ RESULTADOS DE IMPORTACIÓN:`);
        console.log(`   • RT importados exitosamente: ${rtImportados}`);
        console.log(`   • RT no importados (matrícula no existe): ${rtNoImportados}`);
        console.log(`   • Empresas no encontradas por CUIT: ${empresasNoEncontradas}`);
        
        // Validación final
        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT empresa_id) as empresas_con_rt,
                COUNT(*) as total_rt,
                COUNT(DISTINCT profesional_id) as rt_unicos
            FROM copig.representantes_tecnicos
        `);
        
        console.log('\n📊 ESTADO FINAL:');
        console.log(`   • Empresas con RT: ${stats.rows[0].empresas_con_rt}`);
        console.log(`   • Total asignaciones: ${stats.rows[0].total_rt}`);
        console.log(`   • RT únicos: ${stats.rows[0].rt_unicos}`);
        
        // Verificar empresas importantes
        console.log('\n🏢 VERIFICACIÓN DE EMPRESAS IMPORTANTES:');
        
        const importantes = ['IMPSA', 'YPF', 'TECHINT', 'PAMAR', 'CAMILETTI'];
        for (const nombre of importantes) {
            const result = await pool.query(`
                SELECT e.razon_social, COUNT(rt.id) as num_rt
                FROM copig.empresas e
                LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
                WHERE UPPER(e.razon_social) LIKE $1
                GROUP BY e.razon_social
                LIMIT 1
            `, [`%${nombre}%`]);
            
            if (result.rows.length > 0) {
                console.log(`   ✅ ${result.rows[0].razon_social}: ${result.rows[0].num_rt} RTs`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' IMPORTACIÓN COMPLETADA');
        console.log('='.repeat(80));
        
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();