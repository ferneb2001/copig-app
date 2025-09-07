const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN MASIVA DESDE emp-rtcos-20250831.xlsx');
console.log(' Fuente de verdad actualizada de Empresas y RT');
console.log('='.repeat(80));

// Leer archivo Excel
const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📁 Leyendo archivo: emp-rtcos-20250831.xlsx`);
console.log(`📊 Total de registros en Excel: ${data.length}`);

(async () => {
    try {
        // PASO 1: Procesar y organizar datos del Excel
        console.log('\n🔄 PASO 1: PROCESANDO DATOS DEL EXCEL...\n');
        
        const empresasMap = new Map();
        const matriculasNecesarias = new Set();
        
        // Agrupar por empresa
        data.forEach(row => {
            const empresaId = row['mar-emp'];
            const cuit = row['cuit'] ? String(row['cuit']).trim() : null;
            const razonSocial = row['Razón social / Apellido y Nombre'];
            const matricula = row['mat-prof'];
            
            // Solo procesar la primera aparición de cada empresa (tiene la razón social)
            if (empresaId && !empresasMap.has(empresaId)) {
                empresasMap.set(empresaId, {
                    id_excel: empresaId,
                    cuit: cuit,
                    razon_social: razonSocial,
                    representantes: []
                });
            }
            
            // Agregar representante técnico si existe
            if (empresaId && matricula) {
                const empresa = empresasMap.get(empresaId);
                if (empresa) {
                    empresa.representantes.push({
                        matricula: matricula,
                        categoria: row['cat-prof'] || 'A',
                        fecha_inicio: row['fecha-ini'],
                        fecha_fin: row['fecha-fin']
                    });
                    matriculasNecesarias.add(matricula);
                }
            }
        });
        
        console.log(`✅ Empresas únicas identificadas: ${empresasMap.size}`);
        console.log(`✅ Matrículas de RT únicas: ${matriculasNecesarias.size}`);
        console.log(`✅ Total de asignaciones empresa-RT: ${data.filter(r => r['mat-prof']).length}`);
        
        // PASO 2: Verificar/crear empresas
        console.log('\n🏢 PASO 2: PROCESANDO EMPRESAS...\n');
        
        let empresasCreadas = 0;
        let empresasActualizadas = 0;
        let empresasError = 0;
        const mapeoEmpresasExcel = new Map(); // ID Excel -> ID BD
        
        for (const [idExcel, empresa] of empresasMap) {
            try {
                // Buscar empresa por CUIT primero
                let empresaDB = null;
                
                if (empresa.cuit) {
                    const result = await pool.query(
                        'SELECT id, razon_social FROM copig.empresas WHERE cuit = $1',
                        [empresa.cuit]
                    );
                    if (result.rows.length > 0) {
                        empresaDB = result.rows[0];
                    }
                }
                
                // Si no existe por CUIT, buscar por razón social similar
                if (!empresaDB && empresa.razon_social) {
                    const result = await pool.query(
                        'SELECT id, razon_social, cuit FROM copig.empresas WHERE UPPER(razon_social) = UPPER($1) LIMIT 1',
                        [empresa.razon_social]
                    );
                    if (result.rows.length > 0) {
                        empresaDB = result.rows[0];
                    }
                }
                
                if (empresaDB) {
                    // Empresa existe - actualizar si es necesario
                    mapeoEmpresasExcel.set(idExcel, empresaDB.id);
                    
                    // Actualizar CUIT si no tenía
                    if (empresa.cuit && !empresaDB.cuit) {
                        await pool.query(
                            'UPDATE copig.empresas SET cuit = $1, fecha_actualizacion = NOW() WHERE id = $2',
                            [empresa.cuit, empresaDB.id]
                        );
                        empresasActualizadas++;
                    }
                } else {
                    // Crear nueva empresa
                    const insertResult = await pool.query(`
                        INSERT INTO copig.empresas (
                            razon_social, 
                            cuit, 
                            activo,
                            fecha_creacion,
                            fecha_actualizacion
                        ) VALUES ($1, $2, true, NOW(), NOW())
                        RETURNING id
                    `, [
                        empresa.razon_social || `EMPRESA ${idExcel}`,
                        empresa.cuit
                    ]);
                    
                    mapeoEmpresasExcel.set(idExcel, insertResult.rows[0].id);
                    empresasCreadas++;
                }
                
                // Mostrar progreso cada 100 empresas
                if ((empresasCreadas + empresasActualizadas) % 100 === 0) {
                    process.stdout.write(`   Procesadas: ${empresasCreadas + empresasActualizadas}/${empresasMap.size}\r`);
                }
                
            } catch (error) {
                console.error(`\n   ❌ Error con empresa ${empresa.razon_social}: ${error.message}`);
                empresasError++;
            }
        }
        
        console.log(`\n   ✅ Empresas creadas: ${empresasCreadas}`);
        console.log(`   ✅ Empresas actualizadas: ${empresasActualizadas}`);
        console.log(`   ❌ Empresas con error: ${empresasError}`);
        
        // PASO 3: Limpiar representantes técnicos antiguos
        console.log('\n🧹 PASO 3: LIMPIANDO REPRESENTANTES TÉCNICOS ANTIGUOS...\n');
        
        const deleteResult = await pool.query('DELETE FROM copig.representantes_tecnicos');
        console.log(`   ✅ ${deleteResult.rowCount} registros antiguos eliminados`);
        
        // PASO 4: Importar nuevos representantes técnicos
        console.log('\n👷 PASO 4: IMPORTANDO REPRESENTANTES TÉCNICOS...\n');
        
        let rtImportados = 0;
        let rtError = 0;
        let matriculasNoEncontradas = new Set();
        
        for (const [idExcel, empresa] of empresasMap) {
            const empresaIdBD = mapeoEmpresasExcel.get(idExcel);
            
            if (!empresaIdBD) {
                continue; // Saltar si no se pudo mapear la empresa
            }
            
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
                        // Insertar representante técnico
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
                            !rt.fecha_fin, // Activo si no tiene fecha fin
                            rt.categoria || 'A'
                        ]);
                        
                        rtImportados++;
                    } else {
                        matriculasNoEncontradas.add(rt.matricula);
                    }
                    
                    // Mostrar progreso
                    if (rtImportados % 100 === 0) {
                        process.stdout.write(`   Importados: ${rtImportados}\r`);
                    }
                    
                } catch (error) {
                    rtError++;
                    // No mostrar error individual para no saturar la consola
                }
            }
        }
        
        console.log(`\n   ✅ Representantes técnicos importados: ${rtImportados}`);
        console.log(`   ⚠️ Matrículas no encontradas: ${matriculasNoEncontradas.size}`);
        console.log(`   ❌ Errores en importación: ${rtError}`);
        
        if (matriculasNoEncontradas.size > 0 && matriculasNoEncontradas.size <= 20) {
            console.log(`\n   Matrículas no encontradas: ${Array.from(matriculasNoEncontradas).slice(0, 20).join(', ')}`);
        }
        
        // PASO 5: Validación final
        console.log('\n✅ PASO 5: VALIDACIÓN FINAL...\n');
        
        const validacion = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.empresas) as total_empresas,
                (SELECT COUNT(DISTINCT empresa_id) FROM copig.representantes_tecnicos) as empresas_con_rt,
                (SELECT COUNT(*) FROM copig.representantes_tecnicos) as total_rt,
                (SELECT COUNT(DISTINCT profesional_id) FROM copig.representantes_tecnicos) as rt_unicos
        `);
        
        const stats = validacion.rows[0];
        
        console.log('='.repeat(80));
        console.log(' RESUMEN DE IMPORTACIÓN');
        console.log('='.repeat(80));
        
        console.log('\n📊 ESTADO FINAL EN BASE DE DATOS:');
        console.log(`   • Total empresas: ${stats.total_empresas}`);
        console.log(`   • Empresas con RT: ${stats.empresas_con_rt}`);
        console.log(`   • Total asignaciones RT: ${stats.total_rt}`);
        console.log(`   • RT únicos: ${stats.rt_unicos}`);
        
        console.log('\n📊 COMPARACIÓN CON EXCEL:');
        console.log(`   • Empresas Excel: ${empresasMap.size}`);
        console.log(`   • Asignaciones Excel: ${data.filter(r => r['mat-prof']).length}`);
        console.log(`   • Importación exitosa: ${Math.round(rtImportados * 100 / data.filter(r => r['mat-prof']).length)}%`);
        
        // Verificar algunas empresas importantes
        console.log('\n🏢 VERIFICACIÓN DE EMPRESAS IMPORTANTES:');
        const empresasImportantes = ['IMPSA', 'YPF', 'TECHINT', 'PAMAR', 'CAMILETTI'];
        
        for (const nombre of empresasImportantes) {
            const result = await pool.query(`
                SELECT e.id, e.razon_social, COUNT(rt.id) as num_rt
                FROM copig.empresas e
                LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
                WHERE UPPER(e.razon_social) LIKE $1
                GROUP BY e.id, e.razon_social
                LIMIT 1
            `, [`%${nombre}%`]);
            
            if (result.rows.length > 0) {
                const emp = result.rows[0];
                console.log(`   ✅ ${emp.razon_social}: ${emp.num_rt} RTs`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' ✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        
        await pool.end();
        
    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error);
        console.error('\nPara restaurar desde backup, ejecute los comandos en backup_info_20250903_225414.json');
        await pool.end();
        process.exit(1);
    }
})();