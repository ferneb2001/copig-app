-- SCRIPT DE LIMPIEZA FINAL - EJECUTAR DESPUÉS DE VERIFICAR MIGRACIÓN
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
