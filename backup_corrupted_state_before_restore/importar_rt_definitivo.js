const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN DEFINITIVA - USANDO RAZÓN SOCIAL PARA MAPEAR');
console.log('='.repeat(80));

const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

console.log(`\n📁 Total registros: ${data.length}\n`);

function limpiarTexto(texto) {
    if (!texto) return '';
    return String(texto).trim().toUpperCase().replace(/\s+/g, ' ');
}

(async () => {
    try {
        // PASO 1: Organizar datos por empresa Excel ID
        console.log('📊 ORGANIZANDO DATOS...\n');
        
        const empresasExcel = new Map();
        
        data.forEach(row => {
            const marEmp = row['mar-emp'];
            const razon = limpiarTexto(row['Razón social / Apellido y Nombre']);
            const matricula = row['mat-prof'];
            
            if (!empresasExcel.has(marEmp)) {
                empresasExcel.set(marEmp, {
                    razon: razon,
                    cuit: row['cuit'],
                    representantes: []
                });
            }
            
            if (matricula) {
                empresasExcel.get(marEmp).representantes.push({
                    matricula: parseInt(matricula),
                    categoria: row['cat-prof'] || 'A'
                });
            }
        });
        
        console.log(`  Empresas únicas: ${empresasExcel.size}`);
        console.log(`  Con representantes: ${Array.from(empresasExcel.values()).filter(e => e.representantes.length > 0).length}\n`);
        
        // PASO 2: Mapear con BD por razón social
        console.log('🔗 MAPEANDO CON BASE DE DATOS...\n');
        
        const mapeoEmpresaBD = new Map();
        let mapeadas = 0;
        let noMapeadas = [];
        
        for (const [marEmp, empresa] of empresasExcel) {
            if (empresa.representantes.length === 0) continue;
            
            // Buscar por primeras palabras significativas de la razón social
            const palabras = empresa.razon.split(' ').filter(p => p.length > 2 && !['S.A.', 'S.R.L.', 'S.H.', 'DE', 'LA', 'EL', 'Y'].includes(p));
            
            let empresaBD = null;
            
            // Intentar con diferentes combinaciones
            for (let i = Math.min(3, palabras.length); i > 0 && !empresaBD; i--) {
                const busqueda = palabras.slice(0, i).join(' ');
                
                if (busqueda.length < 3) continue;
                
                const result = await pool.query(`
                    SELECT id, razon_social 
                    FROM copig.empresas 
                    WHERE UPPER(razon_social) LIKE $1
                    LIMIT 1
                `, [`%${busqueda}%`]);
                
                if (result.rows.length > 0) {
                    empresaBD = result.rows[0];
                }
            }
            
            if (empresaBD) {
                mapeoEmpresaBD.set(marEmp, empresaBD.id);
                mapeadas++;
            } else {
                noMapeadas.push(empresa.razon.substring(0, 50));
            }
        }
        
        console.log(`  ✅ Empresas mapeadas: ${mapeadas}`);
        console.log(`  ❌ No mapeadas: ${noMapeadas.length}\n`);
        
        if (noMapeadas.length > 0 && noMapeadas.length <= 10) {
            console.log('  Empresas no mapeadas:');
            noMapeadas.forEach(r => console.log(`    - ${r}`));
        }
        
        // PASO 3: Importar RT (sin limpiar, manteniendo los existentes)
        console.log('\n👷 IMPORTANDO REPRESENTANTES TÉCNICOS...\n');
        
        // NO BORRAR LOS EXISTENTES - Solo agregar nuevos
        
        let importados = 0;
        let noImportados = 0;
        
        for (const [marEmp, empresaIdBD] of mapeoEmpresaBD) {
            const empresa = empresasExcel.get(marEmp);
            
            for (const rt of empresa.representantes) {
                try {
                    // Buscar profesional
                    const profResult = await pool.query(`
                        SELECT p.id 
                        FROM copig.profesionales p
                        JOIN copig.matriculas m ON p.id = m.profesional_id
                        WHERE m.numero_matricula = $1
                        LIMIT 1
                    `, [rt.matricula]);
                    
                    if (profResult.rows.length > 0) {
                        await pool.query(`
                            INSERT INTO copig.representantes_tecnicos 
                            (empresa_id, profesional_id, categoria, activo)
                            VALUES ($1, $2, $3, true)
                            ON CONFLICT (empresa_id, profesional_id) DO NOTHING
                        `, [empresaIdBD, profResult.rows[0].id, rt.categoria]);
                        
                        importados++;
                    } else {
                        noImportados++;
                        if (noImportados <= 5) {
                            console.log(`    Matrícula ${rt.matricula} no encontrada`);
                        }
                    }
                } catch (err) {
                    // Ignorar errores de duplicados
                }
            }
            
            if (importados % 100 === 0) {
                process.stdout.write(`  Importados: ${importados}\r`);
            }
        }
        
        console.log(`\n  ✅ RT importados: ${importados}`);
        console.log(`  ❌ No importados (matrícula no existe): ${noImportados}\n`);
        
        // VALIDACIÓN FINAL
        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT empresa_id) as empresas_con_rt,
                COUNT(*) as total_rt,
                COUNT(DISTINCT profesional_id) as rt_unicos
            FROM copig.representantes_tecnicos
        `);
        
        console.log('='.repeat(80));
        console.log(' RESULTADO FINAL');
        console.log('='.repeat(80));
        console.log(`\n📊 ESTADO EN BASE DE DATOS:`);
        console.log(`  • Empresas con RT: ${stats.rows[0].empresas_con_rt}`);
        console.log(`  • Total asignaciones: ${stats.rows[0].total_rt}`);
        console.log(`  • RT únicos: ${stats.rows[0].rt_unicos}\n`);
        
        // Verificar empresas importantes
        console.log('🏢 EMPRESAS IMPORTANTES:');
        const importantes = [
            'IMPSA', 'PESCARMONA',
            'YPF',
            'TECHINT',
            'CAMILETTI',
            'PAGLIARA',
            'PAMAR',
            'CEOSA'
        ];
        
        for (const nombre of importantes) {
            const result = await pool.query(`
                SELECT e.razon_social, COUNT(rt.id) as num_rt
                FROM copig.empresas e
                LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
                WHERE UPPER(e.razon_social) LIKE $1
                GROUP BY e.razon_social
                ORDER BY num_rt DESC
                LIMIT 1
            `, [`%${nombre}%`]);
            
            if (result.rows.length > 0 && result.rows[0].num_rt > 0) {
                console.log(`  ✅ ${result.rows[0].razon_social.substring(0, 45)}: ${result.rows[0].num_rt} RTs`);
            }
        }
        
        console.log('\n✅ IMPORTACIÓN COMPLETADA');
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();