const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN DIRECTA DE REPRESENTANTES TÉCNICOS');
console.log('='.repeat(80));

// Leer archivo Excel
const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📁 Total registros: ${data.length}\n`);

(async () => {
    try {
        // Limpiar RT antiguos
        await pool.query('DELETE FROM copig.representantes_tecnicos');
        console.log('✅ Tabla RT limpiada\n');
        
        let importados = 0;
        let errores = 0;
        let empresasNoEncontradas = new Set();
        let matriculasNoEncontradas = new Set();
        
        console.log('Procesando registros...\n');
        
        for (const row of data) {
            const cuit = row['cuit'] ? String(row['cuit']).trim() : null;
            const matricula = row['mat-prof'];
            const categoria = row['cat-prof'] || 'A';
            
            if (!cuit || !matricula) continue;
            
            try {
                // Buscar empresa por CUIT
                const empresaResult = await pool.query(
                    'SELECT id FROM copig.empresas WHERE cuit = $1',
                    [cuit]
                );
                
                if (empresaResult.rows.length === 0) {
                    empresasNoEncontradas.add(cuit);
                    continue;
                }
                
                const empresaId = empresaResult.rows[0].id;
                
                // Buscar profesional por matrícula
                const profResult = await pool.query(`
                    SELECT p.id 
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    WHERE m.numero_matricula = $1
                    LIMIT 1
                `, [parseInt(matricula)]);
                
                if (profResult.rows.length === 0) {
                    matriculasNoEncontradas.add(matricula);
                    continue;
                }
                
                const profesionalId = profResult.rows[0].id;
                
                // Insertar RT (ignorar duplicados)
                await pool.query(`
                    INSERT INTO copig.representantes_tecnicos 
                    (empresa_id, profesional_id, categoria, activo, fecha_inicio)
                    VALUES ($1, $2, $3, true, CURRENT_DATE)
                    ON CONFLICT (empresa_id, profesional_id) DO NOTHING
                `, [empresaId, profesionalId, categoria]);
                
                importados++;
                
                if (importados % 100 === 0) {
                    process.stdout.write(`  Importados: ${importados}\r`);
                }
                
            } catch (error) {
                errores++;
            }
        }
        
        console.log('\n\n' + '='.repeat(80));
        console.log(' RESUMEN');
        console.log('='.repeat(80));
        
        console.log(`\n✅ RT importados: ${importados}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`⚠️ Empresas no encontradas (CUITs únicos): ${empresasNoEncontradas.size}`);
        console.log(`⚠️ Matrículas no encontradas: ${matriculasNoEncontradas.size}`);
        
        // Validación final
        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT empresa_id) as empresas_con_rt,
                COUNT(*) as total_rt,
                COUNT(DISTINCT profesional_id) as rt_unicos
            FROM copig.representantes_tecnicos
        `);
        
        console.log('\n📊 ESTADO FINAL:');
        console.log(`  Empresas con RT: ${stats.rows[0].empresas_con_rt}`);
        console.log(`  Total asignaciones: ${stats.rows[0].total_rt}`);
        console.log(`  RT únicos: ${stats.rows[0].rt_unicos}`);
        
        // Verificar empresas importantes
        console.log('\n🏢 EMPRESAS IMPORTANTES:');
        const importantes = ['IMPSA', 'YPF', 'TECHINT', 'PAMAR'];
        
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
                console.log(`  ${result.rows[0].razon_social.substring(0, 40)}: ${result.rows[0].num_rt} RTs`);
            }
        }
        
        await pool.end();
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();