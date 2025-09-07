-- ANÁLISIS COMPRENSIVO DE RELACIONES MATRÍCULA-PROFESIONALES
-- Identificación de problemas de correspondencia y sugerencias de mejora

-- ============================================================================
-- 1. ESTADÍSTICAS GENERALES DE CORRESPONDENCIA
-- ============================================================================
SELECT 
    'ESTADISTICAS_GENERALES' as seccion,
    COUNT(DISTINCT ph.matricula) as matriculas_en_pagos,
    COUNT(DISTINCT m.numero) as matriculas_en_tabla_matriculas,
    COUNT(DISTINCT p.id) as profesionales_en_tabla,
    COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as matriculas_con_profesional,
    COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as matriculas_sin_profesional,
    ROUND((COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END)::numeric / 
           COUNT(DISTINCT ph.matricula)::numeric) * 100, 2) as porcentaje_con_profesional,
    ROUND((COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END)::numeric / 
           COUNT(DISTINCT ph.matricula)::numeric) * 100, 2) as porcentaje_sin_profesional
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id;

-- ============================================================================
-- 2. COMPARACIÓN DE ESTRATEGIAS DE JOIN
-- ============================================================================
-- Estrategia 1: JOIN directo con numero_documento
WITH join_directo AS (
    SELECT 
        COUNT(DISTINCT ph.matricula) as total_matriculas,
        COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as encontradas
    FROM copig.pagos_historicos ph
    LEFT JOIN copig.profesionales p ON ph.matricula::text = p.numero_documento::text
),
-- Estrategia 2: JOIN vía tabla matriculas (actual)
join_via_matriculas AS (
    SELECT 
        COUNT(DISTINCT ph.matricula) as total_matriculas,
        COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as encontradas
    FROM copig.pagos_historicos ph
    LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
    LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
)
SELECT 
    'COMPARACION_JOINS' as seccion,
    'DIRECTO_NUMERO_DOCUMENTO' as estrategia,
    jd.total_matriculas,
    jd.encontradas,
    (jd.total_matriculas - jd.encontradas) as perdidas,
    ROUND((jd.encontradas::numeric / jd.total_matriculas::numeric) * 100, 2) as efectividad
FROM join_directo jd

UNION ALL

SELECT 
    'COMPARACION_JOINS' as seccion,
    'VIA_TABLA_MATRICULAS' as estrategia,
    jm.total_matriculas,
    jm.encontradas,
    (jm.total_matriculas - jm.encontradas) as perdidas,
    ROUND((jm.encontradas::numeric / jm.total_matriculas::numeric) * 100, 2) as efectividad
FROM join_via_matriculas jm;

-- ============================================================================
-- 3. ANÁLISIS POR RANGO DE MATRÍCULA
-- ============================================================================
SELECT 
    'ANALISIS_POR_RANGO' as seccion,
    CASE 
        WHEN ph.matricula::integer < 1000 THEN '001-999_MATRICULAS_HISTORICAS'
        WHEN ph.matricula::integer BETWEEN 1000 AND 4999 THEN '1000-4999_MATRICULAS_MEDIAS'
        WHEN ph.matricula::integer BETWEEN 5000 AND 9999 THEN '5000-9999_MATRICULAS_ALTAS'
        WHEN ph.matricula::integer >= 10000 THEN '10000+_MATRICULAS_MODERNAS'
        ELSE 'MATRICULAS_INVALIDAS'
    END as rango_matricula,
    COUNT(DISTINCT ph.matricula) as total_matriculas,
    COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN ph.matricula END) as con_profesional,
    COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END) as sin_profesional,
    ROUND((COUNT(DISTINCT CASE WHEN p.id IS NULL THEN ph.matricula END)::numeric / 
           COUNT(DISTINCT ph.matricula)::numeric) * 100, 1) as porcentaje_sin_profesional,
    MIN(ph.matricula::integer) as matricula_minima,
    MAX(ph.matricula::integer) as matricula_maxima,
    ROUND(AVG(ph.matricula::integer), 0) as matricula_promedio
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
GROUP BY CASE 
    WHEN ph.matricula::integer < 1000 THEN '001-999_MATRICULAS_HISTORICAS'
    WHEN ph.matricula::integer BETWEEN 1000 AND 4999 THEN '1000-4999_MATRICULAS_MEDIAS'
    WHEN ph.matricula::integer BETWEEN 5000 AND 9999 THEN '5000-9999_MATRICULAS_ALTAS'
    WHEN ph.matricula::integer >= 10000 THEN '10000+_MATRICULAS_MODERNAS'
    ELSE 'MATRICULAS_INVALIDAS'
END
ORDER BY matricula_promedio;

-- ============================================================================
-- 4. TOP MATRÍCULAS SIN CORRESPONDENCIA (ORDENADAS POR IMPACTO)
-- ============================================================================
SELECT 
    'TOP_MATRICULAS_HUERFANAS' as seccion,
    ph.matricula,
    COUNT(*) as total_pagos,
    SUM(ph.importe) as total_importe,
    MIN(ph.fecha_pago) as primer_pago,
    MAX(ph.fecha_pago) as ultimo_pago,
    ROUND(EXTRACT(YEAR FROM AGE(MAX(ph.fecha_pago), MIN(ph.fecha_pago))), 0) as años_actividad,
    CASE 
        WHEN ph.matricula::integer < 1000 THEN 'HISTORICA_ANTIGUA'
        WHEN ph.matricula::integer BETWEEN 1000 AND 4999 THEN 'HISTORICA_MEDIA'
        WHEN ph.matricula::integer BETWEEN 5000 AND 9999 THEN 'MODERNA'
        ELSE 'RECIENTE'
    END as categoria_temporal
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE p.id IS NULL
GROUP BY ph.matricula
ORDER BY total_importe DESC, total_pagos DESC
LIMIT 20;

-- ============================================================================
-- 5. ANÁLISIS TEMPORAL DE MATRÍCULAS SIN CORRESPONDENCIA
-- ============================================================================
SELECT 
    'ANALISIS_TEMPORAL' as seccion,
    EXTRACT(YEAR FROM 
        CASE 
            WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
                DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
            WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
                DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
            WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
                DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
            ELSE ph.fecha_pago 
        END
    ) as año_corregido,
    COUNT(DISTINCT ph.matricula) as matriculas_sin_profesional,
    COUNT(*) as pagos_sin_profesional,
    SUM(ph.importe) as importe_sin_profesional,
    CASE 
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) < 1980 THEN 'PRE_DIGITALIZACION'
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) BETWEEN 1980 AND 2000 THEN 'TRANSICION_DIGITAL'
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) BETWEEN 2001 AND 2010 THEN 'PRIMERA_MIGRACION'
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) BETWEEN 2011 AND 2020 THEN 'SISTEMA_MODERNO'
        ELSE 'SISTEMA_ACTUAL'
    END as epoca_sistema
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE p.id IS NULL
GROUP BY EXTRACT(YEAR FROM 
    CASE 
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 5000 THEN 
            DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 3000, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2200 THEN 
            DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 200, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
        WHEN EXTRACT(YEAR FROM ph.fecha_pago) > 2030 THEN 
            DATE(CONCAT(EXTRACT(YEAR FROM ph.fecha_pago) - 30, '-', EXTRACT(MONTH FROM ph.fecha_pago), '-', EXTRACT(DAY FROM ph.fecha_pago)))
        ELSE ph.fecha_pago 
    END
),
CASE 
    WHEN EXTRACT(YEAR FROM ph.fecha_pago) < 1980 THEN 'PRE_DIGITALIZACION'
    WHEN EXTRACT(YEAR FROM ph.fecha_pago) BETWEEN 1980 AND 2000 THEN 'TRANSICION_DIGITAL'
    WHEN EXTRACT(YEAR FROM ph.fecha_pago) BETWEEN 2001 AND 2010 THEN 'PRIMERA_MIGRACION'
    WHEN EXTRACT(YEAR FROM ph.fecha_pago) BETWEEN 2011 AND 2020 THEN 'SISTEMA_MODERNO'
    ELSE 'SISTEMA_ACTUAL'
END
ORDER BY año_corregido DESC;

-- ============================================================================
-- 6. RESUMEN DE IMPACTO FINANCIERO
-- ============================================================================
SELECT 
    'IMPACTO_FINANCIERO' as seccion,
    COUNT(DISTINCT ph.matricula) as total_matriculas_huerfanas,
    COUNT(*) as total_pagos_huerfanos,
    SUM(ph.importe) as total_importe_huerfano,
    ROUND(AVG(ph.importe), 2) as importe_promedio_huerfano,
    MIN(ph.fecha_pago) as fecha_mas_antigua,
    MAX(ph.fecha_pago) as fecha_mas_reciente,
    (SELECT SUM(importe) FROM copig.pagos_historicos) as total_sistema,
    ROUND((SUM(ph.importe) / (SELECT SUM(importe) FROM copig.pagos_historicos) * 100), 2) as porcentaje_del_total
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE p.id IS NULL;

-- ============================================================================
-- 7. SUGERENCIAS DE MEJORA
-- ============================================================================
-- Esta consulta identifica posibles mejoras en la estructura de datos
SELECT 
    'SUGERENCIAS_MEJORA' as seccion,
    'CREAR_TABLA_INTERMEDIA' as sugerencia,
    'Crear tabla pagos_matriculas_mapping para relacionar pagos históricos con profesionales actuales' as descripcion,
    COUNT(DISTINCT ph.matricula) as registros_afectados,
    SUM(ph.importe) as impacto_financiero
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'SUGERENCIAS_MEJORA' as seccion,
    'NORMALIZAR_CAMPOS_MATRICULA' as sugerencia,
    'Estandarizar formato de matrículas (padding, tipo de dato, índices)' as descripcion,
    COUNT(DISTINCT matricula) as registros_afectados,
    0 as impacto_financiero
FROM copig.pagos_historicos

UNION ALL

SELECT 
    'SUGERENCIAS_MEJORA' as seccion,
    'MIGRAR_DATOS_HISTORICOS' as sugerencia,
    'Crear registros de profesionales para matrículas históricas válidas' as descripcion,
    COUNT(DISTINCT ph.matricula) as registros_afectados,
    SUM(ph.importe) as impacto_financiero
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE p.id IS NULL AND ph.matricula::integer < 5000;

-- ============================================================================
-- 8. VERIFICACIÓN DE INTEGRIDAD REFERENCIAL
-- ============================================================================
-- Verificar si existen profesionales con el mismo número de documento que las matrículas huérfanas
SELECT 
    'VERIFICACION_INTEGRIDAD' as seccion,
    ph.matricula as matricula_huerfana,
    p.numero_documento,
    p.nombre,
    COUNT(ph.id) as pagos_en_matricula_huerfana,
    'POSIBLE_CORRESPONDENCIA_DIRECTA' as tipo_problema
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON ph.matricula::bigint = p.numero_documento
WHERE m.numero IS NULL AND p.id IS NOT NULL
GROUP BY ph.matricula, p.numero_documento, p.nombre
ORDER BY pagos_en_matricula_huerfana DESC
LIMIT 10;