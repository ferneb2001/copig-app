-- SCRIPT DE LIMPIEZA FINAL
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
