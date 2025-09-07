const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function finalWorkingSeparation() {
    console.log('🎯 SEPARACIÓN FINAL TRABAJANDO - PROFESIONALES EXTERNOS');
    console.log('='.repeat(80));
    
    try {
        // FASE 1: Verificar estructura actual de pagos_historicos
        console.log('📊 FASE 1: ANÁLISIS DE ESTRUCTURAS');
        console.log('-'.repeat(40));
        
        const pagosStructure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'pagos_historicos' 
            ORDER BY ordinal_position
        `);
        
        console.log('Estructura tabla pagos_historicos:');
        pagosStructure.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type}`);
        });
        
        // FASE 2: Recrear tablas externas
        console.log('\n🔧 FASE 2: RECREAR TABLAS EXTERNAS');
        console.log('-'.repeat(40));
        
        await pool.query('DROP TABLE IF EXISTS copig.pagos_externos CASCADE');
        await pool.query('DROP TABLE IF EXISTS copig.matriculas_externas CASCADE');
        await pool.query('DROP TABLE IF EXISTS copig.profesionales_externos CASCADE');
        
        // Crear profesionales_externos
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
                observaciones TEXT
            )
        `);
        
        // Crear matriculas_externas
        await pool.query(`
            CREATE TABLE copig.matriculas_externas (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales_externos(id),
                numero_matricula INTEGER UNIQUE,
                categoria VARCHAR(5),
                fecha_inscripcion DATE,
                estado VARCHAR(20) DEFAULT 'ACTIVA',
                fecha_creacion TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Crear pagos_externos con estructura compatible
        await pool.query(`
            CREATE TABLE copig.pagos_externos (
                id SERIAL PRIMARY KEY,
                matricula VARCHAR(20),
                fecha_pago DATE,
                concepto VARCHAR(200),
                importe DECIMAL(12,2),
                observaciones TEXT,
                estado VARCHAR(20) DEFAULT 'PAGADO',
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        
        console.log('✅ Tablas externas recreadas');
        
        // FASE 3: Migrar profesionales uno por uno
        console.log('\n🎯 FASE 3: MIGRACIÓN INDIVIDUAL');
        console.log('-'.repeat(35));
        
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
        
        // Migrar cada profesional en transacción separada
        for (const profesional of profesionalesExternos.rows) {
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // Normalizar sexo
                const sexoNormalizado = profesional.sexo ? 
                    (profesional.sexo.includes('Masculino') ? 'MASCULINO' :
                     profesional.sexo.includes('Femenino') ? 'FEMENINO' : 
                     'NO_ESPECIFICADO') : 'NO_ESPECIFICADO';
                
                // Insertar profesional
                const insertProf = await client.query(`
                    INSERT INTO copig.profesionales_externos (
                        nombre, numero_documento, sexo, nacionalidad, 
                        fecha_nacimiento, estado_civil, domicilio, provincia, 
                        email, telefono, activo, fecha_creacion, observaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id
                `, [
                    profesional.nombre,
                    profesional.numero_documento,
                    sexoNormalizado,
                    profesional.nacionalidad || 'Argentina',
                    profesional.fecha_nacimiento,
                    profesional.estado_civil,
                    profesional.domicilio,
                    profesional.provincia,
                    profesional.email,
                    profesional.telefono || profesional.celular,
                    profesional.activo,
                    profesional.created_at || new Date(),
                    `Migrado de ID original: ${profesional.id}`
                ]);
                
                const newProfId = insertProf.rows[0].id;
                migratedCount++;
                
                // Migrar matrícula si existe
                if (profesional.matricula_id && profesional.numero_matricula) {
                    await client.query(`
                        INSERT INTO copig.matriculas_externas (
                            profesional_id, numero_matricula, categoria,
                            fecha_inscripcion, estado, fecha_creacion
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                    `, [
                        newProfId,
                        profesional.numero_matricula,
                        profesional.categoria || 'A',
                        profesional.fecha_inscripcion,
                        'ACTIVA',
                        new Date()
                    ]);
                    migratedMatriculas++;
                    
                    // Migrar pagos (sin columna recibo que no existe)
                    const pagosMigrated = await client.query(`
                        INSERT INTO copig.pagos_externos (
                            matricula, fecha_pago, concepto, importe, 
                            observaciones, estado, fecha_importacion
                        )
                        SELECT 
                            $1,
                            fecha_pago,
                            concepto,
                            importe,
                            observaciones,
                            'PAGADO',
                            NOW()
                        FROM copig.pagos_historicos 
                        WHERE matricula = $1
                    `, [profesional.numero_matricula.toString()]);
                    
                    migratedPagos += pagosMigrated.rowCount || 0;
                }
                
                await client.query('COMMIT');
                
                if (migratedCount % 25 === 0) {
                    console.log(`   ✅ Progreso: ${migratedCount}/${profesionalesExternos.rows.length} profesionales`);
                }
                
            } catch (error) {
                await client.query('ROLLBACK');
                errorCount++;
                console.log(`   ⚠️ Error con ${profesional.nombre}: ${error.message.slice(0, 80)}...`);
                
            } finally {
                client.release();
            }
        }
        
        // FASE 4: Verificación final
        console.log('\n📊 VERIFICACIÓN FINAL');
        console.log('-'.repeat(25));
        
        const verification = await pool.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos
            UNION ALL
            SELECT 'profesionales_total' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 'profesionales_mendoza' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
            UNION ALL
            SELECT 'profesionales_no_mendoza' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        console.log('Estado actual del sistema:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros}`);
        });
        
        // FASE 5: Crear script de limpieza
        console.log('\n🗑️ CREAR SCRIPT DE LIMPIEZA');
        console.log('-'.repeat(30));
        
        const cleanupScript = `-- SCRIPT DE LIMPIEZA FINAL
-- Ejecutar después de verificar que la migración es correcta

BEGIN;

-- Estado antes de limpieza
SELECT 'ANTES - Total profesionales activos' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true;

SELECT 'ANTES - Profesionales Mendoza' as estado, COUNT(*) as cantidad  
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true;

SELECT 'ANTES - Profesionales externos' as estado, COUNT(*) as cantidad
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

-- 3. Eliminar profesionales externos
DELETE FROM copig.profesionales 
WHERE provincia != 'Mendoza' AND activo = true;

-- Estado después de limpieza
SELECT 'DESPUÉS - Total profesionales activos' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true;

SELECT 'DESPUÉS - Solo Mendoza' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true;

SELECT 'DESPUÉS - Externos restantes' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true;

SELECT 'Profesionales migrados a tabla externa' as estado, COUNT(*) as cantidad
FROM copig.profesionales_externos;

COMMIT;
`;
        
        fs.writeFileSync('C:/copig-app/cleanup_final_separation.sql', cleanupScript);
        console.log('✅ Script creado: cleanup_final_separation.sql');
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('🎉 SEPARACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        
        console.log(`\n📊 RESULTADOS:`);
        console.log(`   ✅ Profesionales migrados: ${migratedCount}`);
        console.log(`   ✅ Matrículas migradas: ${migratedMatriculas}`);
        console.log(`   ✅ Pagos migrados: ${migratedPagos}`);
        console.log(`   ⚠️ Errores manejados: ${errorCount}`);
        
        const porcentajeExito = ((migratedCount / profesionalesExternos.rows.length) * 100).toFixed(1);
        console.log(`   📈 Porcentaje de éxito: ${porcentajeExito}%`);
        
        console.log(`\n🎯 PRÓXIMOS PASOS:`);
        console.log(`   1. Verificar que el sistema COPIG funciona normalmente`);
        console.log(`   2. Probar búsquedas, listados y funcionalidades`);
        console.log(`   3. Confirmar datos en tablas *_externos`);
        console.log(`   4. Ejecutar cleanup_final_separation.sql`);
        console.log(`   5. Sistema limpio solo con profesionales de Mendoza`);
        
        return {
            migrated: migratedCount,
            matriculas: migratedMatriculas,
            pagos: migratedPagos,
            errors: errorCount,
            total: profesionalesExternos.rows.length
        };
        
    } catch (error) {
        console.error('❌ Error crítico:', error.message);
        throw error;
    }
}

finalWorkingSeparation()
    .then(result => {
        console.log(`\n🏆 MIGRACIÓN EXITOSA FINAL:`);
        console.log(`   🎯 ${result.migrated}/${result.total} profesionales externos separados`);
        console.log(`   📋 ${result.matriculas} matrículas preservadas`);
        console.log(`   💰 ${result.pagos} pagos históricos migrados`);
        console.log(`   ⚠️ ${result.errors} errores controlados`);
        console.log(`\n✨ INCONSISTENCIAS GEOGRÁFICAS RESUELTAS`);
        console.log(`🎊 Sistema COPIG preparado para contener solo datos de Mendoza`);
        
        return pool.end();
    })
    .catch(error => {
        console.error('💥 Error fatal:', error.message);
        pool.end();
        process.exit(1);
    });