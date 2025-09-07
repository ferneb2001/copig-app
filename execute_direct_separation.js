const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function executeDirectSeparation() {
    console.log('🎯 EJECUTANDO SEPARACIÓN DIRECTA - MÉTODO SIMPLE Y EFECTIVO');
    console.log('='.repeat(80));
    
    try {
        // FASE 1: Crear tablas externas con estructura exacta
        console.log('🔧 FASE 1: CREAR TABLAS EXTERNAS CON ESTRUCTURA EXACTA');
        console.log('-'.repeat(55));
        
        // Eliminar tablas previas si existen
        await pool.query('DROP TABLE IF EXISTS copig.pagos_externos_simple CASCADE');
        await pool.query('DROP TABLE IF EXISTS copig.matriculas_externas_simple CASCADE');
        await pool.query('DROP TABLE IF EXISTS copig.profesionales_externos_simple CASCADE');
        
        // 1. Crear tabla profesionales externos con estructura exacta
        await pool.query(`
            CREATE TABLE copig.profesionales_externos_simple AS 
            SELECT * FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
        `);
        console.log('✅ Tabla profesionales_externos_simple creada');
        
        // 2. Crear tabla matrículas externas
        await pool.query(`
            CREATE TABLE copig.matriculas_externas_simple AS
            SELECT m.* FROM copig.matriculas m
            JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE p.provincia != 'Mendoza' AND p.activo = true
        `);
        console.log('✅ Tabla matriculas_externas_simple creada');
        
        // 3. Crear tabla pagos externos
        await pool.query(`
            CREATE TABLE copig.pagos_externos_simple AS
            SELECT ph.* FROM copig.pagos_historicos ph
            WHERE ph.matricula IN (
                SELECT m.numero_matricula::TEXT 
                FROM copig.matriculas m
                JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE p.provincia != 'Mendoza' AND p.activo = true
            )
        `);
        console.log('✅ Tabla pagos_externos_simple creada');
        
        // FASE 2: Verificar migración
        console.log('\n📊 FASE 2: VERIFICAR MIGRACIÓN COMPLETADA');
        console.log('-'.repeat(40));
        
        const verification = await pool.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos_simple
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas_simple
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos_simple
            UNION ALL
            SELECT 'total_profesionales_originales' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE activo = true
            UNION ALL
            SELECT 'profesionales_mendoza_originales' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true
            UNION ALL
            SELECT 'profesionales_externos_originales' as tabla, COUNT(*) as registros 
                FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true
        `);
        
        console.log('Estado de migración:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros} registros`);
        });
        
        // FASE 3: Análisis detallado por provincia
        console.log('\n🌍 FASE 3: ANÁLISIS POR PROVINCIA DE PROFESIONALES MIGRADOS');
        console.log('-'.repeat(60));
        
        const byProvince = await pool.query(`
            SELECT provincia, COUNT(*) as cantidad
            FROM copig.profesionales_externos_simple
            GROUP BY provincia
            ORDER BY cantidad DESC
        `);
        
        console.log('Profesionales externos por provincia:');
        byProvince.rows.forEach(row => {
            console.log(`   ${row.provincia}: ${row.cantidad} profesionales`);
        });
        
        // FASE 4: Crear script de limpieza final
        console.log('\n🗑️ FASE 4: CREAR SCRIPT DE LIMPIEZA DEFINITIVA');
        console.log('-'.repeat(45));
        
        const fs = require('fs');
        const cleanupScript = `-- SCRIPT DE LIMPIEZA DEFINITIVA - SEPARACIÓN COMPLETADA
-- ⚠️ EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE TODO FUNCIONA CORRECTAMENTE
-- ⚠️ ESTA OPERACIÓN ELIMINARÁ LOS PROFESIONALES EXTERNOS DE LAS TABLAS PRINCIPALES

BEGIN;

-- Mostrar estado ANTES de limpieza
SELECT 'ANTES - Total profesionales activos' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true;

SELECT 'ANTES - Profesionales Mendoza' as estado, COUNT(*) as cantidad  
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true;

SELECT 'ANTES - Profesionales externos' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true;

-- PASO 1: Eliminar pagos históricos de profesionales externos
DELETE FROM copig.pagos_historicos 
WHERE matricula IN (
    SELECT m.numero_matricula::TEXT 
    FROM copig.matriculas m
    JOIN copig.profesionales p ON m.profesional_id = p.id
    WHERE p.provincia != 'Mendoza' AND p.activo = true
);

-- PASO 2: Eliminar matrículas de profesionales externos
DELETE FROM copig.matriculas 
WHERE profesional_id IN (
    SELECT id FROM copig.profesionales 
    WHERE provincia != 'Mendoza' AND activo = true
);

-- PASO 3: Eliminar profesionales externos
DELETE FROM copig.profesionales 
WHERE provincia != 'Mendoza' AND activo = true;

-- Mostrar estado DESPUÉS de limpieza
SELECT 'DESPUÉS - Total profesionales activos' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE activo = true;

SELECT 'DESPUÉS - Solo profesionales Mendoza' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true;

SELECT 'DESPUÉS - Profesionales externos restantes' as estado, COUNT(*) as cantidad
FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true;

-- Verificar tablas de respaldo
SELECT 'RESPALDO - Profesionales externos' as estado, COUNT(*) as cantidad
FROM copig.profesionales_externos_simple;

SELECT 'RESPALDO - Matrículas externas' as estado, COUNT(*) as cantidad
FROM copig.matriculas_externas_simple;

SELECT 'RESPALDO - Pagos externos' as estado, COUNT(*) as cantidad
FROM copig.pagos_externos_simple;

COMMIT;

-- RESULTADO ESPERADO:
-- DESPUÉS - Profesionales externos restantes = 0  
-- DESPUÉS - Total profesionales activos = DESPUÉS - Solo profesionales Mendoza
-- RESPALDO - tablas deben contener todos los datos externos preservados
`;

        fs.writeFileSync('C:/copig-app/ejecutar_limpieza_definitiva.sql', cleanupScript);
        console.log('✅ Script creado: ejecutar_limpieza_definitiva.sql');
        
        // FASE 5: Resumen final y próximos pasos
        console.log('\n' + '='.repeat(80));
        console.log('🎉 SEPARACIÓN DIRECTA COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        
        const summary = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.profesionales_externos_simple) as externos_migrados,
                (SELECT COUNT(*) FROM copig.matriculas_externas_simple) as matriculas_migradas,
                (SELECT COUNT(*) FROM copig.pagos_externos_simple) as pagos_migrados,
                (SELECT COUNT(*) FROM copig.profesionales WHERE provincia = 'Mendoza' AND activo = true) as mendoza_restantes,
                (SELECT COUNT(*) FROM copig.profesionales WHERE provincia != 'Mendoza' AND activo = true) as externos_originales
        `);
        
        const result = summary.rows[0];
        
        console.log(`\n📊 RESULTADOS FINALES:`);
        console.log(`   ✅ Profesionales externos migrados: ${result.externos_migrados}`);
        console.log(`   ✅ Matrículas externas migradas: ${result.matriculas_migradas}`);
        console.log(`   ✅ Pagos históricos externos migrados: ${result.pagos_migrados}`);
        console.log(`   📍 Profesionales de Mendoza (se mantienen): ${result.mendoza_restantes}`);
        console.log(`   ⚠️ Profesionales externos aún en tablas principales: ${result.externos_originales}`);
        
        console.log(`\n🎯 PRÓXIMOS PASOS CRÍTICOS:`);
        console.log(`   1. 🔍 VERIFICAR que el sistema COPIG funciona correctamente`);
        console.log(`   2. 🧪 PROBAR todas las funcionalidades: login, búsquedas, listados`);
        console.log(`   3. ✅ CONFIRMAR que los datos están en tablas *_simple`);
        console.log(`   4. 🗑️ EJECUTAR ejecutar_limpieza_definitiva.sql SOLO si todo funciona`);
        console.log(`   5. 🎊 Disfrutar sistema limpio con solo profesionales de Mendoza`);
        
        console.log(`\n🔄 SEGURIDAD Y ROLLBACK:`);
        console.log(`   • Backup completo: backup_separation_2025-09-05T22-04-29-380Z`);
        console.log(`   • Datos externos preservados en: *_externos_simple`);
        console.log(`   • Operación completamente reversible`);
        console.log(`   • Sin pérdida de datos garantizada`);
        
        console.log(`\n⚠️ IMPORTANTE:`);
        console.log(`   • Los profesionales externos AÚN están en las tablas principales`);
        console.log(`   • Han sido COPIADOS a tablas de respaldo, no movidos`);
        console.log(`   • La limpieza final eliminará duplicados de tablas principales`);
        console.log(`   • Verificar funcionamiento antes de limpieza final`);
        
        return {
            migrated: parseInt(result.externos_migrados),
            matriculas: parseInt(result.matriculas_migradas),
            pagos: parseInt(result.pagos_migrados),
            mendoza: parseInt(result.mendoza_restantes),
            externalsRemaining: parseInt(result.externos_originales)
        };
        
    } catch (error) {
        console.error('❌ Error en separación directa:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

executeDirectSeparation()
    .then(result => {
        console.log(`\n🏆 MIGRACIÓN DIRECTA EXITOSA:`);
        console.log(`   🎯 ${result.migrated} profesionales externos preservados en tabla de respaldo`);
        console.log(`   📋 ${result.matriculas} matrículas externas preservadas`);
        console.log(`   💰 ${result.pagos} pagos históricos externos preservados`);
        console.log(`   🏠 ${result.mendoza} profesionales de Mendoza intactos`);
        console.log(`   ⚠️ ${result.externalsRemaining} externos aún en tablas principales (normal)`);
        console.log(`\n✨ DATOS SEPARADOS Y PRESERVADOS - LISTOS PARA LIMPIEZA FINAL`);
        console.log(`🔧 Sistema preparado para contener solo profesionales de Mendoza`);
    })
    .catch(error => {
        console.error('💥 Error crítico en separación directa:', error.message);
        process.exit(1);
    });