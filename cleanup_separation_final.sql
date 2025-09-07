-- SCRIPT DE LIMPIEZA FINAL - SEPARACIÓN DE PROFESIONALES EXTERNOS
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
