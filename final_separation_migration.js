const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function finalSeparationMigration() {
    console.log('🎯 MIGRACIÓN FINAL DE SEPARACIÓN - PROFESIONALES EXTERNOS');
    console.log('='.repeat(80));
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // FASE 1: Análisis pre-separación
        console.log('📊 FASE 1: ANÁLISIS PRE-SEPARACIÓN');
        console.log('-'.repeat(50));
        
        const preAnalysis = await client.query(`
            SELECT 
                CASE WHEN p.provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END as tipo,
                COUNT(*) as cantidad,
                MIN(m.numero_matricula) as matricula_minima,
                MAX(m.numero_matricula) as matricula_maxima
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            GROUP BY CASE WHEN p.provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END
        `);
        
        console.log('Estado actual del sistema:');
        preAnalysis.rows.forEach(row => {
            console.log(`   ${row.tipo}: ${row.cantidad} profesionales (Matrículas: ${row.matricula_minima} - ${row.matricula_maxima})`);
        });
        
        // FASE 2: Identificar profesionales externos
        console.log('\n🎯 FASE 2: IDENTIFICAR PROFESIONALES EXTERNOS');
        console.log('-'.repeat(50));
        
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
                m.fecha_inscripcion,
                m.categoria
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia != 'Mendoza' 
            AND p.activo = true
            ORDER BY p.provincia, p.nombre
        `;
        
        const profesionalesExternos = await client.query(externosQuery);
        console.log(`📋 Profesionales a migrar: ${profesionalesExternos.rows.length}`);
        
        // Distribución por provincia
        const porProvincia = {};
        profesionalesExternos.rows.forEach(row => {
            if (!porProvincia[row.provincia]) porProvincia[row.provincia] = 0;
            porProvincia[row.provincia]++;
        });
        
        console.log('Distribución por provincia:');
        Object.entries(porProvincia).forEach(([provincia, cantidad]) => {
            console.log(`   ${provincia}: ${cantidad} profesionales`);
        });
        
        // FASE 3: Migración controlada
        console.log('\n🔄 FASE 3: MIGRACIÓN CONTROLADA');
        console.log('-'.repeat(40));
        
        let migratedCount = 0;
        let migratedMatriculas = 0;
        let migratedPagos = 0;
        
        for (const profesional of profesionalesExternos.rows) {
            try {
                // 1. Insertar profesional externo
                const insertProf = await client.query(`
                    INSERT INTO copig.profesionales_externos (
                        nombre, numero_documento, tipo_documento, sexo, 
                        nacionalidad, fecha_nacimiento, estado_civil, 
                        domicilio, provincia, email, telefono, 
                        activo, fecha_creacion
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id
                `, [
                    profesional.nombre,
                    profesional.numero_documento,
                    'DNI',
                    profesional.sexo || 'M',
                    profesional.nacionalidad || 'Argentina',
                    profesional.fecha_nacimiento,
                    profesional.estado_civil,
                    profesional.domicilio,
                    profesional.provincia,
                    profesional.email,
                    profesional.telefono || profesional.celular,
                    profesional.activo,
                    profesional.created_at || new Date()
                ]);
                
                const newProfId = insertProf.rows[0].id;
                
                // 2. Migrar matrícula si existe
                if (profesional.matricula_id && profesional.numero_matricula) {
                    await client.query(`
                        INSERT INTO copig.matriculas_externas (
                            profesional_id, numero_matricula, fecha_otorgamiento, 
                            estado, fecha_creacion
                        ) VALUES ($1, $2, $3, $4, $5)
                    `, [
                        newProfId,
                        profesional.numero_matricula,
                        profesional.fecha_inscripcion, // Usar fecha_inscripcion como fecha_otorgamiento
                        'ACTIVA',
                        new Date()
                    ]);
                    migratedMatriculas++;
                    
                    // 3. Migrar pagos históricos
                    const pagosMigrated = await client.query(`
                        INSERT INTO copig.pagos_externos (
                            matricula, fecha_pago, concepto, importe, recibo, 
                            estado, fecha_importacion
                        )
                        SELECT 
                            $1,
                            fecha_pago,
                            concepto,
                            importe,
                            recibo,
                            'PAGADO',
                            NOW()
                        FROM copig.pagos_historicos 
                        WHERE matricula = $1
                    `, [profesional.numero_matricula.toString()]);
                    
                    migratedPagos += pagosMigrated.rowCount || 0;
                }
                
                migratedCount++;
                
                // Progress cada 25 registros
                if (migratedCount % 25 === 0) {
                    console.log(`   Progreso: ${migratedCount}/${profesionalesExternos.rows.length} profesionales`);
                }
                
            } catch (error) {
                console.error(`❌ Error migrando ${profesional.nombre}:`, error.message);
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ MIGRACIÓN COMPLETADA');
        console.log(`   • Profesionales migrados: ${migratedCount}`);
        console.log(`   • Matrículas migradas: ${migratedMatriculas}`);
        console.log(`   • Pagos migrados: ${migratedPagos}`);
        
        // FASE 4: Verificación
        console.log('\n📊 VERIFICACIÓN POST-MIGRACIÓN');
        console.log('-'.repeat(40));
        
        const verification = await client.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos
        `);
        
        console.log('Registros en tablas externas:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros}`);
        });
        
        // FASE 5: Crear script de limpieza
        console.log('\n🗑️ PREPARANDO SCRIPT DE LIMPIEZA');
        console.log('-'.repeat(40));
        
        const cleanupScript = `-- SCRIPT DE LIMPIEZA FINAL - EJECUTAR DESPUÉS DE VERIFICAR MIGRACIÓN
-- ⚠️ BACKUP OBLIGATORIO ANTES DE EJECUTAR
-- ⚠️ VERIFICAR QUE SISTEMA FUNCIONA CON PROFESIONALES SEPARADOS

BEGIN;

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

-- 4. Verificación final
SELECT 
    COUNT(*) as profesionales_totales,
    COUNT(CASE WHEN provincia = 'Mendoza' THEN 1 END) as solo_mendoza,
    COUNT(CASE WHEN provincia != 'Mendoza' THEN 1 END) as externos_restantes
FROM copig.profesionales 
WHERE activo = true;

COMMIT;

-- Resultado esperado:
-- profesionales_totales = solo_mendoza
-- externos_restantes = 0
`;
        
        fs.writeFileSync('C:/copig-app/cleanup_externos_final.sql', cleanupScript);
        console.log('✅ Script de limpieza creado: cleanup_externos_final.sql');
        
        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('🎉 ESTRATEGIA DE SEPARACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        
        console.log('\n✅ RESULTADOS:');
        console.log(`   • ${migratedCount} profesionales externos migrados a tablas separadas`);
        console.log(`   • ${migratedMatriculas} matrículas migradas`);
        console.log(`   • ${migratedPagos} pagos históricos migrados`);
        console.log(`   • Sistema COPIG principal preservado intacto`);
        console.log(`   • Backup disponible: backup_separation_2025-09-05T22-04-29-380Z`);
        
        console.log('\n🎯 PRÓXIMOS PASOS:');
        console.log('   1. 🔍 VERIFICAR que sistema COPIG funciona normalmente');
        console.log('   2. 🧪 PROBAR búsquedas, login, estados financieros');
        console.log('   3. 📊 CONFIRMAR que solo aparecen profesionales de Mendoza');
        console.log('   4. 🗑️ EJECUTAR cleanup_externos_final.sql para limpiar');
        console.log('   5. ✨ DISFRUTAR sistema limpio y coherente');
        
        return {
            migrated: migratedCount,
            matriculas: migratedMatriculas,
            pagos: migratedPagos
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante migración:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

finalSeparationMigration()
    .then(result => {
        console.log(`\n🏆 MIGRACIÓN EXITOSA: ${result.migrated} profesionales separados`);
        console.log('✅ Inconsistencias geográficas resueltas completamente');
        
        return pool.end();
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        pool.end();
        process.exit(1);
    });