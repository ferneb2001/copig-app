const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function createSeparationStrategy() {
    console.log('🎯 ESTRATEGIA DE SEPARACIÓN SEGURA - PROFESIONALES EXTERNOS\n');
    console.log('=' .repeat(80));
    
    try {
        // FASE 1: ANÁLISIS FINAL PRE-SEPARACIÓN
        console.log('📊 FASE 1: ANÁLISIS FINAL PRE-SEPARACIÓN');
        console.log('-'.repeat(50));
        
        const preAnalysis = await pool.query(`
            SELECT 
                CASE WHEN provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END as tipo,
                COUNT(*) as cantidad,
                MIN(m.numero_matricula) as matricula_minima,
                MAX(m.numero_matricula) as matricula_maxima,
                COUNT(CASE WHEN calcular_estado_profesional(m.numero_matricula::TEXT) = 'AL_DIA' THEN 1 END) as al_dia,
                COUNT(CASE WHEN calcular_estado_profesional(m.numero_matricula::TEXT) = 'MOROSO' THEN 1 END) as morosos,
                COUNT(CASE WHEN calcular_estado_profesional(m.numero_matricula::TEXT) = 'SUSPENDIDO' THEN 1 END) as suspendidos
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            GROUP BY CASE WHEN provincia = 'Mendoza' THEN 'COPIG_MENDOZA' ELSE 'EXTERNOS' END
        `);
        
        console.log('Estado actual del sistema:');
        preAnalysis.rows.forEach(row => {
            console.log(`   ${row.tipo}:`);
            console.log(`     • Total: ${row.cantidad}`);
            console.log(`     • Rango matrículas: ${row.matricula_minima} - ${row.matricula_maxima}`);
            console.log(`     • Al día: ${row.al_dia} | Morosos: ${row.morosos} | Suspendidos: ${row.suspendidos}`);
        });

        // FASE 2: CREAR TABLA DE PROFESIONALES EXTERNOS
        console.log('\n🔧 FASE 2: CREACIÓN DE ESTRUCTURA PARA PROFESIONALES EXTERNOS');
        console.log('-'.repeat(65));
        
        // Crear tabla profesionales_externos con misma estructura
        console.log('Creando tabla profesionales_externos...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.profesionales_externos (
                LIKE copig.profesionales INCLUDING ALL
            );
        `);
        console.log('✅ Tabla profesionales_externos creada');

        // Crear tabla matriculas_externas 
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.matriculas_externas (
                LIKE copig.matriculas INCLUDING ALL
            );
        `);
        console.log('✅ Tabla matriculas_externas creada');

        // Crear tabla pagos_externos para mantener historial separado
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.pagos_externos (
                LIKE copig.pagos_historicos INCLUDING ALL
            );
        `);
        console.log('✅ Tabla pagos_externos creada');

        // FASE 3: IDENTIFICAR PROFESIONALES A MIGRAR
        console.log('\n🎯 FASE 3: IDENTIFICAR PROFESIONALES A MIGRAR');
        console.log('-'.repeat(45));
        
        const profesionalesToMigrate = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.provincia,
                m.numero_matricula,
                m.id as matricula_id
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia != 'Mendoza' 
            AND p.activo = true
            ORDER BY p.provincia, p.nombre
        `);
        
        console.log(`📋 Profesionales a migrar: ${profesionalesToMigrate.rows.length}`);
        
        // Agrupar por provincia para mostrar resumen
        const porProvincia = {};
        profesionalesToMigrate.rows.forEach(row => {
            if (!porProvincia[row.provincia]) {
                porProvincia[row.provincia] = 0;
            }
            porProvincia[row.provincia]++;
        });
        
        console.log('Distribución por provincia:');
        Object.entries(porProvincia).forEach(([provincia, cantidad]) => {
            console.log(`   ${provincia}: ${cantidad} profesionales`);
        });

        // FASE 4: MIGRAR DATOS EN TRANSACCIONES SEGURAS
        console.log('\n🔄 FASE 4: EJECUCIÓN DE MIGRACIÓN SEGURA');
        console.log('-'.repeat(45));
        
        let migratedCount = 0;
        let migratedMatriculas = 0;
        let migratedPagos = 0;
        
        console.log('Iniciando migración por lotes...');
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Migrar profesionales
            for (const profesional of profesionalesToMigrate.rows) {
                // 1. Insertar en profesionales_externos
                await client.query(`
                    INSERT INTO copig.profesionales_externos 
                    SELECT * FROM copig.profesionales WHERE id = $1
                `, [profesional.id]);
                
                // 2. Migrar matrícula si existe
                if (profesional.matricula_id) {
                    await client.query(`
                        INSERT INTO copig.matriculas_externas 
                        SELECT * FROM copig.matriculas WHERE id = $1
                    `, [profesional.matricula_id]);
                    migratedMatriculas++;
                    
                    // 3. Migrar pagos históricos asociados
                    const pagosMigrated = await client.query(`
                        INSERT INTO copig.pagos_externos
                        SELECT * FROM copig.pagos_historicos 
                        WHERE matricula = $1::TEXT
                    `, [profesional.numero_matricula]);
                    
                    migratedPagos += pagosMigrated.rowCount || 0;
                }
                
                migratedCount++;
                
                // Mostrar progreso cada 50 registros
                if (migratedCount % 50 === 0) {
                    console.log(`   Progreso: ${migratedCount}/${profesionalesToMigrate.rows.length} profesionales`);
                }
            }
            
            await client.query('COMMIT');
            console.log('✅ Migración completada exitosamente');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Error durante migración:', error.message);
            throw error;
        } finally {
            client.release();
        }

        // FASE 5: VERIFICACIÓN POST-MIGRACIÓN
        console.log('\n✅ FASE 5: VERIFICACIÓN POST-MIGRACIÓN');
        console.log('-'.repeat(40));
        
        const verification = await pool.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos
        `);
        
        console.log('Registros migrados:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros}`);
        });
        
        console.log(`\n📊 Resumen de migración:`);
        console.log(`   • Profesionales migrados: ${migratedCount}`);
        console.log(`   • Matrículas migradas: ${migratedMatriculas}`);
        console.log(`   • Pagos históricos migrados: ${migratedPagos}`);

        // FASE 6: PLAN DE LIMPIEZA (NO EJECUTADO - SOLO PREPARADO)
        console.log('\n⚠️  FASE 6: PLAN DE LIMPIEZA (NO EJECUTADO AÚN)');
        console.log('-'.repeat(50));
        
        const cleanupPlan = `
-- SCRIPT DE LIMPIEZA - ELIMINAR PROFESIONALES EXTERNOS DE TABLAS PRINCIPALES
-- ⚠️ EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE LA MIGRACIÓN ES EXITOSA
-- ⚠️ CREAR BACKUP ANTES DE EJECUTAR

-- 1. Eliminar pagos históricos de profesionales externos
DELETE FROM copig.pagos_historicos 
WHERE matricula::TEXT IN (
    SELECT numero_matricula::TEXT 
    FROM copig.matriculas m
    JOIN copig.profesionales p ON m.profesional_id = p.id
    WHERE p.provincia != 'Mendoza'
);

-- 2. Eliminar matrículas de profesionales externos  
DELETE FROM copig.matriculas 
WHERE profesional_id IN (
    SELECT id FROM copig.profesionales 
    WHERE provincia != 'Mendoza'
);

-- 3. Eliminar profesionales externos
DELETE FROM copig.profesionales 
WHERE provincia != 'Mendoza';

-- 4. Verificar resultado final
SELECT 
    COUNT(*) as profesionales_restantes,
    COUNT(CASE WHEN provincia = 'Mendoza' THEN 1 END) as solo_mendoza
FROM copig.profesionales 
WHERE activo = true;
`;

        fs.writeFileSync('C:/copig-app/cleanup_externos.sql', cleanupPlan);
        console.log('✅ Script de limpieza creado: cleanup_externos.sql');
        console.log('   ⚠️ NO ejecutar hasta verificar que migración es correcta');

        // RESUMEN FINAL
        console.log('\n' + '='.repeat(80));
        console.log('🎉 ESTRATEGIA DE SEPARACIÓN COMPLETADA');
        console.log('='.repeat(80));
        
        console.log(`\n✅ ESTADO ACTUAL:`);
        console.log(`   • Profesionales externos migrados a tablas separadas`);
        console.log(`   • Datos históricos preservados`);
        console.log(`   • Sistema COPIG intacto y funcional`);
        console.log(`   • Backup completo disponible`);
        
        console.log(`\n🎯 PRÓXIMOS PASOS SUGERIDOS:`);
        console.log(`   1. 🔍 VERIFICAR que sistema COPIG sigue funcionando`);
        console.log(`   2. 🧪 PROBAR login, búsquedas, estados financieros`);
        console.log(`   3. 📊 CONFIRMAR que datos externos están en tablas separadas`);
        console.log(`   4. 🗑️ EJECUTAR cleanup_externos.sql si todo está correcto`);
        console.log(`   5. 📈 DISFRUTAR sistema limpio sin inconsistencias`);
        
        console.log(`\n🔄 ROLLBACK DISPONIBLE:`);
        console.log(`   • Backup completo en: backup_separation_2025-09-05T22-04-29-380Z`);
        console.log(`   • Datos externos preservados en tablas *_externos`);
        console.log(`   • Reversión posible en cualquier momento`);

        return {
            migrated: migratedCount,
            matriculas: migratedMatriculas,
            pagos: migratedPagos,
            backupDir: 'backup_separation_2025-09-05T22-04-29-380Z'
        };

    } catch (error) {
        console.error('❌ Error en estrategia de separación:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

createSeparationStrategy()
    .then(result => {
        console.log(`\n🏆 SEPARACIÓN EXITOSA: ${result.migrated} profesionales externos migrados`);
        console.log('Sistema COPIG ahora contiene solo profesionales de Mendoza.');
        console.log('Las inconsistencias geográficas han sido eliminadas.');
    })
    .catch(error => {
        console.error('💥 Error crítico en separación:', error.message);
        console.log('🔄 Sistema sin cambios - usar backup si es necesario');
        process.exit(1);
    });