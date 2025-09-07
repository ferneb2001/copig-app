-- SCRIPT DE LIMPIEZA DEFINITIVA - SEPARACIÓN COMPLETADA
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
