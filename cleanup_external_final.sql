-- SCRIPT DE LIMPIEZA FINAL - SEPARACIÓN DE PROFESIONALES EXTERNOS
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
