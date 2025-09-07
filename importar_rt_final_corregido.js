const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN FINAL DE RT - VERSIÓN CORREGIDA');
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
        // PASO 1: Organizar datos por empresa
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
        
        // PASO 2: Importar RT directamente
        console.log('👷 IMPORTANDO REPRESENTANTES TÉCNICOS...\n');
        
        let importados = 0;
        let yaExisten = 0;
        let empresaNoEncontrada = 0;
        let matriculaNoEncontrada = 0;
        let errores = 0;
        
        for (const [marEmp, empresa] of empresasExcel) {
            if (empresa.representantes.length === 0) continue;
            
            // Buscar empresa por diferentes métodos
            let empresaId = null;
            
            // Método 1: Por CUIT si existe
            if (empresa.cuit && empresa.cuit.toString().length > 5) {
                const result = await pool.query(
                    'SELECT id FROM copig.empresas WHERE cuit = $1',
                    [empresa.cuit]
                );
                if (result.rows.length > 0) {
                    empresaId = result.rows[0].id;
                }
            }
            
            // Método 2: Por nombre parcial
            if (!empresaId) {
                const palabras = empresa.razon.split(' ').filter(p => 
                    p.length > 2 && !['S.A.', 'S.R.L.', 'S.H.', 'DE', 'LA', 'EL', 'Y', 'DEL'].includes(p)
                );
                
                for (let i = Math.min(2, palabras.length); i > 0 && !empresaId; i--) {
                    const busqueda = palabras.slice(0, i).join(' ');
                    
                    if (busqueda.length < 3) continue;
                    
                    const result = await pool.query(`
                        SELECT id FROM copig.empresas 
                        WHERE UPPER(razon_social) LIKE $1
                        LIMIT 1
                    `, [`%${busqueda}%`]);
                    
                    if (result.rows.length > 0) {
                        empresaId = result.rows[0].id;
                    }
                }
            }
            
            // Método 3: Para casos especiales conocidos
            if (!empresaId) {
                // Mapeo manual de empresas problemáticas
                const mapeosEspeciales = {
                    '3': 'TECNICAGUA', 
                    '10': 'PETERSEN',
                    // Agregar más según se necesite
                };
                
                if (mapeosEspeciales[marEmp]) {
                    const result = await pool.query(`
                        SELECT id FROM copig.empresas 
                        WHERE UPPER(razon_social) LIKE $1
                        LIMIT 1
                    `, [`%${mapeosEspeciales[marEmp]}%`]);
                    
                    if (result.rows.length > 0) {
                        empresaId = result.rows[0].id;
                    }
                }
            }
            
            if (!empresaId) {
                empresaNoEncontrada++;
                if (empresaNoEncontrada <= 5) {
                    console.log(`  ❌ Empresa no encontrada: ${empresa.razon.substring(0, 50)}`);
                }
                continue;
            }
            
            // Importar RT de esta empresa
            for (const rt of empresa.representantes) {
                try {
                    // Buscar profesional por matrícula
                    const profResult = await pool.query(`
                        SELECT p.id 
                        FROM copig.profesionales p
                        JOIN copig.matriculas m ON p.id = m.profesional_id
                        WHERE m.numero_matricula = $1
                        LIMIT 1
                    `, [rt.matricula]);
                    
                    if (profResult.rows.length > 0) {
                        // Verificar si ya existe
                        const existe = await pool.query(`
                            SELECT id FROM copig.representantes_tecnicos
                            WHERE empresa_id = $1 AND profesional_id = $2
                        `, [empresaId, profResult.rows[0].id]);
                        
                        if (existe.rows.length > 0) {
                            yaExisten++;
                        } else {
                            // Insertar nuevo RT
                            await pool.query(`
                                INSERT INTO copig.representantes_tecnicos 
                                (empresa_id, profesional_id, categoria_representacion, activo, fecha_inicio)
                                VALUES ($1, $2, $3, true, CURRENT_DATE)
                            `, [empresaId, profResult.rows[0].id, rt.categoria]);
                            
                            importados++;
                            
                            if (importados % 100 === 0) {
                                console.log(`  Importados: ${importados}`);
                            }
                        }
                    } else {
                        matriculaNoEncontrada++;
                        if (matriculaNoEncontrada <= 5) {
                            console.log(`  ⚠️ Matrícula ${rt.matricula} no encontrada`);
                        }
                    }
                } catch (err) {
                    errores++;
                    if (errores <= 3) {
                        console.log(`  Error: ${err.message}`);
                    }
                }
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESULTADO FINAL');
        console.log('='.repeat(80));
        
        console.log(`\n📊 RESUMEN DE IMPORTACIÓN:`);
        console.log(`  ✅ RT nuevos importados: ${importados}`);
        console.log(`  ⚠️ RT ya existentes: ${yaExisten}`);
        console.log(`  ❌ Empresas no encontradas: ${empresaNoEncontrada}`);
        console.log(`  ❌ Matrículas no encontradas: ${matriculaNoEncontrada}`);
        console.log(`  ❌ Errores: ${errores}`);
        
        // Verificación final
        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT empresa_id) as empresas_con_rt,
                COUNT(*) as total_rt,
                COUNT(DISTINCT profesional_id) as rt_unicos
            FROM copig.representantes_tecnicos
        `);
        
        console.log(`\n📈 ESTADO FINAL EN BD:`);
        console.log(`  • Empresas con RT: ${stats.rows[0].empresas_con_rt}`);
        console.log(`  • Total asignaciones: ${stats.rows[0].total_rt}`);
        console.log(`  • RT únicos: ${stats.rows[0].rt_unicos}`);
        
        // Verificar empresas importantes
        console.log('\n🏢 EMPRESAS IMPORTANTES:');
        const importantes = ['IMPSA', 'YPF', 'TECHINT', 'CAMILETTI', 'PAMAR', 'TECNICAGUA'];
        
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
            
            if (result.rows.length > 0) {
                console.log(`  ${result.rows[0].razon_social.substring(0, 45)}: ${result.rows[0].num_rt} RTs`);
            }
        }
        
        console.log('\n✅ IMPORTACIÓN COMPLETADA');
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();