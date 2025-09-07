const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN FINAL DE REPRESENTANTES TÉCNICOS');
console.log(' Mapeo inteligente por CUIT y Razón Social');
console.log('='.repeat(80));

// Leer archivo Excel
const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📁 Total de registros en Excel: ${data.length}`);

// Función para limpiar CUIT
function limpiarCUIT(cuit) {
    if (!cuit) return null;
    return String(cuit).replace(/[^0-9]/g, '').trim();
}

// Función para limpiar razón social
function limpiarRazon(razon) {
    if (!razon) return '';
    return String(razon).trim().toUpperCase();
}

(async () => {
    try {
        // PASO 1: Organizar datos del Excel
        console.log('\n📊 ORGANIZANDO DATOS DEL EXCEL...\n');
        
        const empresasMap = new Map();
        
        // Agrupar por ID de empresa del Excel
        data.forEach(row => {
            const empresaId = row['mar-emp'];
            const cuit = limpiarCUIT(row['cuit']);
            const razon = limpiarRazon(row['Razón social / Apellido y Nombre']);
            const matricula = row['mat-prof'];
            
            if (!empresasMap.has(empresaId)) {
                empresasMap.set(empresaId, {
                    cuit: cuit,
                    razon: razon,
                    representantes: []
                });
            }
            
            if (matricula) {
                empresasMap.get(empresaId).representantes.push({
                    matricula: parseInt(matricula),
                    categoria: row['cat-prof'] || 'A',
                    fecha_inicio: row['fecha-ini'],
                    fecha_fin: row['fecha-fin']
                });
            }
        });
        
        console.log(`   Empresas únicas: ${empresasMap.size}`);
        console.log(`   Total de asignaciones RT: ${Array.from(empresasMap.values()).reduce((sum, e) => sum + e.representantes.length, 0)}`);
        
        // PASO 2: Mapear empresas Excel con BD
        console.log('\n🔗 MAPEANDO EMPRESAS CON BASE DE DATOS...\n');
        
        const mapeoEmpresaBD = new Map();
        let empresasMapeadas = 0;
        let empresasNoMapeadas = 0;
        
        for (const [idExcel, empresa] of empresasMap) {
            let empresaBD = null;
            
            // Primero buscar por CUIT
            if (empresa.cuit) {
                const result = await pool.query(
                    'SELECT id, razon_social FROM copig.empresas WHERE cuit = $1',
                    [empresa.cuit]
                );
                if (result.rows.length > 0) {
                    empresaBD = result.rows[0];
                }
            }
            
            // Si no encuentra por CUIT, buscar por razón social parcial
            if (!empresaBD && empresa.razon) {
                // Buscar por primeras palabras de la razón social
                const palabras = empresa.razon.split(' ').filter(p => p.length > 2);
                const busqueda = palabras.slice(0, 3).join(' ');
                
                if (busqueda.length > 5) {
                    const result = await pool.query(
                        `SELECT id, razon_social, cuit 
                         FROM copig.empresas 
                         WHERE UPPER(razon_social) LIKE $1
                         LIMIT 1`,
                        [`%${busqueda}%`]
                    );
                    
                    if (result.rows.length > 0) {
                        empresaBD = result.rows[0];
                        
                        // Si encontró por razón social y no tiene CUIT, actualizarlo
                        if (empresa.cuit && !empresaBD.cuit) {
                            await pool.query(
                                'UPDATE copig.empresas SET cuit = $1 WHERE id = $2',
                                [empresa.cuit, empresaBD.id]
                            );
                        }
                    }
                }
            }
            
            // Si aún no encuentra, crear la empresa
            if (!empresaBD && empresa.razon) {
                const result = await pool.query(`
                    INSERT INTO copig.empresas (razon_social, cuit, activo, fecha_creacion)
                    VALUES ($1, $2, true, NOW())
                    RETURNING id
                `, [empresa.razon, empresa.cuit]);
                
                empresaBD = { id: result.rows[0].id };
                console.log(`   ✅ Empresa creada: ${empresa.razon.substring(0, 50)}`);
            }
            
            if (empresaBD) {
                mapeoEmpresaBD.set(idExcel, empresaBD.id);
                empresasMapeadas++;
            } else {
                empresasNoMapeadas++;
            }
            
            // Progreso
            if ((empresasMapeadas + empresasNoMapeadas) % 100 === 0) {
                process.stdout.write(`   Procesadas: ${empresasMapeadas + empresasNoMapeadas}/${empresasMap.size}\r`);
            }
        }
        
        console.log(`\n   ✅ Empresas mapeadas: ${empresasMapeadas}`);
        console.log(`   ❌ Empresas no mapeadas: ${empresasNoMapeadas}`);
        
        // PASO 3: Limpiar RT antiguos
        console.log('\n🧹 LIMPIANDO REPRESENTANTES TÉCNICOS ANTIGUOS...\n');
        await pool.query('DELETE FROM copig.representantes_tecnicos');
        console.log('   ✅ Tabla limpiada');
        
        // PASO 4: Importar RT
        console.log('\n👷 IMPORTANDO REPRESENTANTES TÉCNICOS...\n');
        
        let rtImportados = 0;
        let rtNoImportados = 0;
        let matriculasNoEncontradas = new Set();
        
        for (const [idExcel, empresa] of empresasMap) {
            const empresaIdBD = mapeoEmpresaBD.get(idExcel);
            
            if (!empresaIdBD) continue;
            
            for (const rt of empresa.representantes) {
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
                            empresaIdBD,
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
                        // Puede ser duplicado
                    }
                } else {
                    matriculasNoEncontradas.add(rt.matricula);
                    rtNoImportados++;
                }
            }
        }
        
        console.log(`\n\n✅ RESULTADOS DE IMPORTACIÓN:`);
        console.log(`   • RT importados exitosamente: ${rtImportados}`);
        console.log(`   • RT no importados (matrícula no existe): ${rtNoImportados}`);
        console.log(`   • Matrículas no encontradas: ${matriculasNoEncontradas.size}`);
        
        // PASO 5: Validación final
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.empresas) as total_empresas,
                COUNT(DISTINCT empresa_id) as empresas_con_rt,
                COUNT(*) as total_rt,
                COUNT(DISTINCT profesional_id) as rt_unicos
            FROM copig.representantes_tecnicos
        `);
        
        console.log('\n📊 ESTADO FINAL EN BASE DE DATOS:');
        console.log(`   • Total empresas: ${stats.rows[0].total_empresas}`);
        console.log(`   • Empresas con RT: ${stats.rows[0].empresas_con_rt}`);
        console.log(`   • Total asignaciones: ${stats.rows[0].total_rt}`);
        console.log(`   • RT únicos: ${stats.rows[0].rt_unicos}`);
        
        // Verificar empresas importantes
        console.log('\n🏢 VERIFICACIÓN DE EMPRESAS IMPORTANTES:');
        
        const importantes = ['IMPSA', 'YPF', 'TECHINT', 'PAMAR', 'CAMILETTI', 'CEOSA', 'PAGLIARA'];
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
                console.log(`   ✅ ${result.rows[0].razon_social.substring(0, 50)}: ${result.rows[0].num_rt} RTs`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' ✅ IMPORTACIÓN COMPLETADA');
        console.log('='.repeat(80));
        
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();