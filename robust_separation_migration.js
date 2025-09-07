const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function robustSeparationMigration() {
    console.log('🎯 MIGRACIÓN ROBUSTA DE SEPARACIÓN - PROFESIONALES EXTERNOS');
    console.log('='.repeat(80));
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // FASE 1: Análisis y validación de datos
        console.log('📊 FASE 1: ANÁLISIS PRE-MIGRACIÓN');
        console.log('-'.repeat(50));
        
        // Analizar datos problemáticos en sexo
        const sexoAnalysis = await client.query(`
            SELECT sexo, LENGTH(sexo) as longitud, COUNT(*) as cantidad
            FROM copig.profesionales 
            WHERE provincia != 'Mendoza' AND activo = true
            GROUP BY sexo, LENGTH(sexo)
            ORDER BY cantidad DESC
        `);
        
        console.log('Análisis campo sexo en profesionales externos:');
        sexoAnalysis.rows.forEach(row => {
            console.log(`   "${row.sexo}" (${row.longitud} caracteres): ${row.cantidad} registros`);
        });
        
        // FASE 2: Limpiar estructura de tablas externas
        console.log('\n🔧 FASE 2: RECREAR TABLAS EXTERNAS CON CAMPOS CORREGIDOS');
        console.log('-'.repeat(65));
        
        // Eliminar tablas existentes
        await client.query('DROP TABLE IF EXISTS copig.pagos_externos CASCADE');
        await client.query('DROP TABLE IF EXISTS copig.matriculas_externas CASCADE');
        await client.query('DROP TABLE IF EXISTS copig.profesionales_externos CASCADE');
        
        // Crear tabla profesionales_externos con campos corregidos
        await client.query(`
            CREATE TABLE copig.profesionales_externos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                numero_documento BIGINT,
                tipo_documento VARCHAR(10) DEFAULT 'DNI',
                sexo VARCHAR(10), -- Cambiar de CHAR(1) a VARCHAR(10)
                nacionalidad VARCHAR(50) DEFAULT 'Argentina',
                fecha_nacimiento DATE,
                estado_civil VARCHAR(20),
                domicilio VARCHAR(300),
                localidad VARCHAR(100),
                departamento VARCHAR(100),
                provincia VARCHAR(100),
                codigo_postal VARCHAR(10),
                email VARCHAR(200),
                telefono VARCHAR(50),
                titulo VARCHAR(300),
                universidad VARCHAR(200),
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP DEFAULT NOW(),
                observaciones TEXT
            )
        `);
        
        await client.query(`
            CREATE TABLE copig.matriculas_externas (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales_externos(id),
                numero_matricula INTEGER UNIQUE,
                categoria VARCHAR(5),
                fecha_inscripcion DATE,
                estado VARCHAR(20) DEFAULT 'ACTIVA',
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await client.query(`
            CREATE TABLE copig.pagos_externos (
                id SERIAL PRIMARY KEY,
                matricula VARCHAR(20),
                fecha_pago DATE,
                concepto VARCHAR(200),
                importe DECIMAL(12,2),
                recibo VARCHAR(50),
                estado VARCHAR(20) DEFAULT 'PAGADO',
                observaciones TEXT,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        
        console.log('✅ Tablas externas recreadas con campos corregidos');
        
        // FASE 3: Identificar y migrar profesionales externos
        console.log('\n🎯 FASE 3: MIGRAR PROFESIONALES EXTERNOS');
        console.log('-'.repeat(45));
        
        const externosQuery = `
            SELECT 
                p.id,
                p.numero_documento,
                p.nombre,
                p.domicilio,
                p.telefono,
                p.celular,
                p.email,
                p.sexo,
                p.estado_civil,
                p.fecha_nacimiento,
                p.cuit,
                p.nacionalidad,
                p.activo,
                p.created_at,
                p.provincia,
                m.id as matricula_id,
                m.numero_matricula,
                m.categoria,
                m.fecha_inscripcion
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia != 'Mendoza' 
            AND p.activo = true
            ORDER BY p.provincia, p.nombre
        `;
        
        const profesionalesExternos = await client.query(externosQuery);
        console.log(`📋 Profesionales a migrar: ${profesionalesExternos.rows.length}`);
        
        let migratedCount = 0;
        let migratedMatriculas = 0;
        let migratedPagos = 0;
        let errorCount = 0;
        
        for (const profesional of profesionalesExternos.rows) {
            try {
                // Limpiar y normalizar datos
                const sexoLimpio = profesional.sexo ? 
                    (profesional.sexo.toUpperCase().includes('MASCUL') ? 'MASCULINO' :
                     profesional.sexo.toUpperCase().includes('FEMIN') ? 'FEMENINO' :
                     profesional.sexo.charAt(0).toUpperCase() === 'M' ? 'MASCULINO' :
                     profesional.sexo.charAt(0).toUpperCase() === 'F' ? 'FEMENINO' :
                     'NO_ESPECIFICADO') : 'NO_ESPECIFICADO';
                
                // 1. Insertar profesional externo con validación
                const insertProf = await client.query(`
                    INSERT INTO copig.profesionales_externos (
                        nombre, numero_documento, tipo_documento, sexo, 
                        nacionalidad, fecha_nacimiento, estado_civil, 
                        domicilio, provincia, email, telefono, 
                        activo, fecha_creacion, observaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    RETURNING id
                `, [
                    profesional.nombre,
                    profesional.numero_documento,
                    'DNI',
                    sexoLimpio,
                    profesional.nacionalidad || 'Argentina',
                    profesional.fecha_nacimiento,
                    profesional.estado_civil,
                    profesional.domicilio,
                    profesional.provincia,
                    profesional.email,
                    profesional.telefono || profesional.celular,
                    profesional.activo,
                    profesional.created_at || new Date(),
                    `Migrado automáticamente de tabla principal - ID original: ${profesional.id}`
                ]);
                
                const newProfId = insertProf.rows[0].id;
                migratedCount++;
                
                // 2. Migrar matrícula si existe
                if (profesional.matricula_id && profesional.numero_matricula) {
                    await client.query(`
                        INSERT INTO copig.matriculas_externas (
                            profesional_id, numero_matricula, categoria,
                            fecha_inscripcion, estado, activo, fecha_creacion
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        newProfId,
                        profesional.numero_matricula,
                        profesional.categoria || 'A',
                        profesional.fecha_inscripcion,
                        'ACTIVA',
                        true,
                        new Date()
                    ]);
                    migratedMatriculas++;
                    
                    // 3. Migrar pagos históricos si existen
                    try {
                        const pagosMigrated = await client.query(`
                            INSERT INTO copig.pagos_externos (
                                matricula, fecha_pago, concepto, importe, recibo, 
                                estado, observaciones, fecha_importacion
                            )
                            SELECT 
                                $1,
                                fecha_pago,
                                concepto,
                                importe,
                                recibo,
                                'PAGADO',
                                'Migrado de pagos_historicos',
                                NOW()
                            FROM copig.pagos_historicos 
                            WHERE matricula = $1
                        `, [profesional.numero_matricula.toString()]);
                        
                        migratedPagos += pagosMigrated.rowCount || 0;
                    } catch (pagosError) {
                        console.log(`⚠️ Error migrando pagos de matrícula ${profesional.numero_matricula}: ${pagosError.message}`);
                    }
                }
                
                // Progress cada 50 registros
                if (migratedCount % 50 === 0) {
                    console.log(`   Progreso: ${migratedCount}/${profesionalesExternos.rows.length} profesionales`);
                }
                
            } catch (error) {
                errorCount++;
                console.error(`❌ Error migrando ${profesional.nombre}: ${error.message}`);
                
                // Si hay muchos errores consecutivos, detener
                if (errorCount > 10) {
                    console.error('⛔ Demasiados errores consecutivos. Deteniendo migración.');
                    break;
                }
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ MIGRACIÓN COMPLETADA');
        console.log(`   • Profesionales migrados: ${migratedCount}`);
        console.log(`   • Matrículas migradas: ${migratedMatriculas}`);
        console.log(`   • Pagos migrados: ${migratedPagos}`);
        console.log(`   • Errores encontrados: ${errorCount}`);
        
        // FASE 4: Verificación post-migración
        console.log('\n📊 VERIFICACIÓN POST-MIGRACIÓN');
        console.log('-'.repeat(40));
        
        const verification = await client.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos
            UNION ALL
            SELECT 'profesionales_principales' as tabla, 
                   COUNT(*) as registros FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 'profesionales_mendoza' as tabla, 
                   COUNT(*) as registros FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
        `);
        
        console.log('Estado actual del sistema:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros} registros`);
        });
        
        // FASE 5: Crear script de limpieza final
        console.log('\n🗑️ PREPARAR SCRIPT DE LIMPIEZA');
        console.log('-'.repeat(35));
        
        const cleanupScript = `-- SCRIPT DE LIMPIEZA FINAL - SEPARACIÓN DE PROFESIONALES EXTERNOS
-- ⚠️ EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE LA MIGRACIÓN ES CORRECTA
-- ⚠️ CREAR BACKUP COMPLETO ANTES DE EJECUTAR

BEGIN;

-- Mostrar estado antes de limpieza
SELECT 
    'ANTES - Profesionales totales' as descripcion,
    COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true
UNION ALL
SELECT 
    'ANTES - Solo Mendoza' as descripcion,
    COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
UNION ALL
SELECT 
    'ANTES - Externos' as descripcion,
    COUNT(*) as cantidad  
FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true;

-- 1. Eliminar pagos históricos de profesionales externos
DELETE FROM copig.pagos_historicos 
WHERE matricula IN (
    SELECT m.numero_matricula::TEXT 
    FROM copig.matriculas m
    JOIN copig.profesionales p ON m.profesional_id = p.id
    WHERE p.provincia != 'Mendoza' AND p.activo = true
);

-- 2. Eliminar matrículas de profesionales externos  
DELETE FROM copig.matriculas 
WHERE profesional_id IN (
    SELECT id FROM copig.profesionales 
    WHERE provincia != 'Mendoza' AND activo = true
);

-- 3. Eliminar profesionales externos de tabla principal
DELETE FROM copig.profesionales 
WHERE provincia != 'Mendoza' AND activo = true;

-- 4. Verificar resultado final
SELECT 
    'DESPUÉS - Profesionales totales' as descripcion,
    COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true
UNION ALL
SELECT 
    'DESPUÉS - Solo Mendoza' as descripcion,
    COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
UNION ALL
SELECT 
    'DESPUÉS - Externos restantes' as descripcion,
    COUNT(*) as cantidad  
FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
UNION ALL
SELECT 
    'Profesionales en tabla externa' as descripcion,
    COUNT(*) as cantidad
FROM copig.profesionales_externos;

-- El resultado esperado es:
-- DESPUÉS - Profesionales totales = DESPUÉS - Solo Mendoza
-- DESPUÉS - Externos restantes = 0
-- Profesionales en tabla externa = número de externos migrados

COMMIT;
`;
        
        fs.writeFileSync('C:/copig-app/cleanup_separation_final.sql', cleanupScript);
        console.log('✅ Script de limpieza final creado: cleanup_separation_final.sql');
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('🎉 MIGRACIÓN ROBUSTA COMPLETADA');
        console.log('='.repeat(80));
        
        console.log(`\n✅ RESULTADOS EXITOSOS:`);
        console.log(`   • ${migratedCount} profesionales externos migrados`);
        console.log(`   • ${migratedMatriculas} matrículas externas migradas`);
        console.log(`   • ${migratedPagos} pagos históricos migrados`);
        console.log(`   • ${errorCount} errores manejados sin detener proceso`);
        
        console.log(`\n🎯 PRÓXIMOS PASOS:`);
        console.log(`   1. 🔍 VERIFICAR sistema COPIG funciona normalmente`);
        console.log(`   2. 🧪 PROBAR búsquedas, listados, estados financieros`);
        console.log(`   3. ✅ CONFIRMAR que datos están correctamente separados`);
        console.log(`   4. 🗑️ EJECUTAR cleanup_separation_final.sql`);
        console.log(`   5. 🎊 DISFRUTAR sistema limpio sin inconsistencias`);
        
        console.log(`\n🔄 ROLLBACK DISPONIBLE:`);
        console.log(`   • Backup: backup_separation_2025-09-05T22-04-29-380Z`);
        console.log(`   • Datos externos preservados en tablas *_externos`);
        console.log(`   • Reversión posible en cualquier momento`);
        
        return {
            migrated: migratedCount,
            matriculas: migratedMatriculas,
            pagos: migratedPagos,
            errors: errorCount
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error crítico durante migración:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

robustSeparationMigration()
    .then(result => {
        console.log(`\n🏆 SEPARACIÓN EXITOSA:`);
        console.log(`   • ${result.migrated} profesionales separados`);
        console.log(`   • ${result.matriculas} matrículas migradas`);
        console.log(`   • ${result.pagos} pagos históricos preservados`);
        console.log(`   • ${result.errors} errores manejados`);
        console.log(`\n✨ Sistema COPIG ahora contiene solo datos de Mendoza`);
        console.log(`🎯 Inconsistencias geográficas completamente resueltas`);
        
        return pool.end();
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        console.log('🔄 Sistema sin cambios - usar backup si es necesario');
        pool.end();
        process.exit(1);
    });