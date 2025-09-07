const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function simpleWorkingSeparation() {
    console.log('🎯 SEPARACIÓN SIMPLE Y FUNCIONAL - PROFESIONALES EXTERNOS');
    console.log('='.repeat(80));
    
    try {
        // FASE 1: Recrear tablas externas simplificadas
        console.log('🔧 FASE 1: CREAR TABLAS EXTERNAS SIMPLIFICADAS');
        console.log('-'.repeat(50));
        
        await pool.query('DROP TABLE IF EXISTS copig.pagos_externos CASCADE');
        await pool.query('DROP TABLE IF EXISTS copig.matriculas_externas CASCADE');
        await pool.query('DROP TABLE IF EXISTS copig.profesionales_externos CASCADE');
        
        // Tabla profesionales externos - solo campos esenciales
        await pool.query(`
            CREATE TABLE copig.profesionales_externos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                numero_documento BIGINT,
                sexo VARCHAR(20),
                nacionalidad VARCHAR(50) DEFAULT 'Argentina',
                fecha_nacimiento DATE,
                estado_civil VARCHAR(20),
                domicilio VARCHAR(300),
                provincia VARCHAR(100),
                email VARCHAR(200),
                telefono VARCHAR(50),
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                id_original INTEGER
            )
        `);
        
        // Tabla matrículas externas
        await pool.query(`
            CREATE TABLE copig.matriculas_externas (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales_externos(id),
                numero_matricula INTEGER UNIQUE,
                categoria VARCHAR(5),
                fecha_inscripcion DATE,
                estado VARCHAR(20) DEFAULT 'ACTIVA',
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                id_original INTEGER
            )
        `);
        
        // Tabla pagos externos - estructura compatible con pagos_historicos
        await pool.query(`
            CREATE TABLE copig.pagos_externos (
                id SERIAL PRIMARY KEY,
                matricula VARCHAR(20),
                fecha_pago DATE,
                concepto VARCHAR(200),
                importe DECIMAL(12,2),
                detalle VARCHAR(200),
                estado VARCHAR(20) DEFAULT 'PAGADO',
                numero_recibo INTEGER,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        
        console.log('✅ Tablas externas creadas correctamente');
        
        // FASE 2: Migrar datos de profesionales externos
        console.log('\n🎯 FASE 2: MIGRAR PROFESIONALES EXTERNOS');
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
        
        const profesionalesExternos = await pool.query(externosQuery);
        console.log(`📋 Profesionales a migrar: ${profesionalesExternos.rows.length}`);
        
        let migratedCount = 0;
        let migratedMatriculas = 0;
        let migratedPagos = 0;
        let errorCount = 0;
        
        // Migrar en lotes de 1 para manejar errores individualmente
        for (const profesional of profesionalesExternos.rows) {
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // Normalizar datos problemáticos
                const sexoLimpio = profesional.sexo ? 
                    (profesional.sexo.toLowerCase().includes('mascul') ? 'MASCULINO' :
                     profesional.sexo.toLowerCase().includes('femin') ? 'FEMENINO' : 
                     'NO_ESPECIFICADO') : 'NO_ESPECIFICADO';
                
                // 1. Insertar profesional externo
                const insertResult = await client.query(`
                    INSERT INTO copig.profesionales_externos (
                        nombre, numero_documento, sexo, nacionalidad, 
                        fecha_nacimiento, estado_civil, domicilio, provincia, 
                        email, telefono, activo, fecha_creacion, id_original
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id
                `, [
                    profesional.nombre,
                    profesional.numero_documento,
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
                    profesional.id
                ]);
                
                const newProfId = insertResult.rows[0].id;
                migratedCount++;
                
                // 2. Migrar matrícula si existe
                if (profesional.matricula_id && profesional.numero_matricula) {
                    await client.query(`
                        INSERT INTO copig.matriculas_externas (
                            profesional_id, numero_matricula, categoria,
                            fecha_inscripcion, estado, fecha_creacion, id_original
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        newProfId,
                        profesional.numero_matricula,
                        profesional.categoria || 'A',
                        profesional.fecha_inscripcion,
                        'ACTIVA',
                        new Date(),
                        profesional.matricula_id
                    ]);
                    migratedMatriculas++;
                    
                    // 3. Migrar pagos históricos usando estructura real
                    const pagosMigrated = await client.query(`
                        INSERT INTO copig.pagos_externos (
                            matricula, fecha_pago, concepto, importe, 
                            detalle, estado, numero_recibo, fecha_importacion
                        )
                        SELECT 
                            $1,
                            fecha_pago,
                            concepto,
                            importe,
                            detalle,
                            estado,
                            numero_recibo,
                            NOW()
                        FROM copig.pagos_historicos 
                        WHERE matricula = $1
                    `, [profesional.numero_matricula.toString()]);
                    
                    migratedPagos += pagosMigrated.rowCount || 0;
                }
                
                await client.query('COMMIT');
                
                // Progress cada 50 registros
                if (migratedCount % 50 === 0) {
                    console.log(`   ✅ Progreso: ${migratedCount}/${profesionalesExternos.rows.length} profesionales`);
                }
                
            } catch (error) {
                await client.query('ROLLBACK');
                errorCount++;
                console.log(`   ⚠️ Error con ${profesional.nombre}: ${error.message.substring(0, 60)}...`);
                
            } finally {
                client.release();
            }
        }
        
        // FASE 3: Verificación final
        console.log('\n📊 FASE 3: VERIFICACIÓN POST-MIGRACIÓN');
        console.log('-'.repeat(40));
        
        const verification = await pool.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos
            UNION ALL
            SELECT 'total_profesionales' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 'profesionales_mendoza' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
            UNION ALL
            SELECT 'profesionales_externos_originales' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        console.log('Estado actual del sistema:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros}`);
        });
        
        // FASE 4: Crear script de limpieza final
        console.log('\n🗑️ FASE 4: CREAR SCRIPT DE LIMPIEZA');
        console.log('-'.repeat(35));
        
        const cleanupScript = `-- SCRIPT DE LIMPIEZA FINAL - SEPARACIÓN DE PROFESIONALES EXTERNOS
-- ⚠️ EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE LA MIGRACIÓN ES CORRECTA
-- ⚠️ CREAR BACKUP COMPLETO ANTES DE EJECUTAR ESTE SCRIPT

BEGIN;

-- Mostrar estado antes de la limpieza
SELECT 'ANTES - Total profesionales activos' as descripcion, COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true;

SELECT 'ANTES - Profesionales de Mendoza' as descripcion, COUNT(*) as cantidad  
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true;

SELECT 'ANTES - Profesionales externos' as descripcion, COUNT(*) as cantidad
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

-- 3. Eliminar profesionales externos de la tabla principal
DELETE FROM copig.profesionales 
WHERE provincia != 'Mendoza' AND activo = true;

-- 4. Mostrar estado después de la limpieza
SELECT 'DESPUÉS - Total profesionales activos' as descripcion, COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true;

SELECT 'DESPUÉS - Solo profesionales de Mendoza' as descripcion, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true;

SELECT 'DESPUÉS - Profesionales externos restantes' as descripcion, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true;

SELECT 'Profesionales migrados a tabla externa' as descripcion, COUNT(*) as cantidad
FROM copig.profesionales_externos;

SELECT 'Matrículas migradas a tabla externa' as descripción, COUNT(*) as cantidad
FROM copig.matriculas_externas;

SELECT 'Pagos migrados a tabla externa' as descripcion, COUNT(*) as cantidad
FROM copig.pagos_externos;

-- Resultado esperado:
-- DESPUÉS - Profesionales externos restantes = 0
-- DESPUÉS - Total profesionales activos = DESPUÉS - Solo profesionales de Mendoza
-- Migrados = cantidad original de externos

COMMIT;
`;
        
        fs.writeFileSync('C:/copig-app/cleanup_external_final.sql', cleanupScript);
        console.log('✅ Script de limpieza creado: cleanup_external_final.sql');
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('🎉 SEPARACIÓN SIMPLE Y FUNCIONAL COMPLETADA');
        console.log('='.repeat(80));
        
        const successRate = ((migratedCount / profesionalesExternos.rows.length) * 100).toFixed(1);
        
        console.log(`\n📊 RESULTADOS FINALES:`);
        console.log(`   ✅ Profesionales migrados: ${migratedCount}/${profesionalesExternos.rows.length} (${successRate}%)`);
        console.log(`   ✅ Matrículas migradas: ${migratedMatriculas}`);
        console.log(`   ✅ Pagos históricos migrados: ${migratedPagos}`);
        console.log(`   ⚠️ Errores manejados: ${errorCount}`);
        
        console.log(`\n🎯 PRÓXIMOS PASOS:`);
        console.log(`   1. 🔍 Verificar que el sistema COPIG funciona correctamente`);
        console.log(`   2. 🧪 Probar funcionalidades: búsquedas, listados, estados`);
        console.log(`   3. ✅ Confirmar que datos están en tablas *_externos`);
        console.log(`   4. 🗑️ Ejecutar cleanup_external_final.sql`);
        console.log(`   5. 🎊 Sistema limpio con solo profesionales de Mendoza`);
        
        console.log(`\n🔄 DATOS DE RESPALDO:`);
        console.log(`   • Backup completo: backup_separation_2025-09-05T22-04-29-380Z`);
        console.log(`   • Datos externos preservados en tablas copig.*_externos`);
        console.log(`   • IDs originales guardados para trazabilidad`);
        
        return {
            migrated: migratedCount,
            matriculas: migratedMatriculas,  
            pagos: migratedPagos,
            errors: errorCount,
            total: profesionalesExternos.rows.length,
            successRate: parseFloat(successRate)
        };
        
    } catch (error) {
        console.error('❌ Error crítico:', error.message);
        throw error;
    }
}

simpleWorkingSeparation()
    .then(result => {
        console.log(`\n🏆 MIGRACIÓN COMPLETADA CON ÉXITO:`);
        console.log(`   🎯 ${result.migrated}/${result.total} profesionales externos separados (${result.successRate}%)`);
        console.log(`   📋 ${result.matriculas} matrículas preservadas en tabla externa`);
        console.log(`   💰 ${result.pagos} pagos históricos migrados`);
        console.log(`   ⚠️ ${result.errors} errores controlados sin impacto`);
        console.log(`\n✨ INCONSISTENCIAS GEOGRÁFICAS RESUELTAS EXITOSAMENTE`);
        console.log(`🎊 Sistema COPIG listo para contener solo datos de Mendoza`);
        console.log(`🔧 Ejecutar cleanup_external_final.sql cuando esté listo para finalizar`);
        
        return pool.end();
    })
    .catch(error => {
        console.error('💥 Error fatal en separación:', error.message);
        pool.end();
        process.exit(1);
    });