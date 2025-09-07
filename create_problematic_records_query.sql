-- CONSULTA COMPLETA PARA ANÁLISIS DE REGISTROS PROBLEMÁTICOS
-- Registros con importe = 0 y/o concepto = null en pagos_historicos

-- ============================================================================
-- 1. RESUMEN ESTADÍSTICO GENERAL
-- ============================================================================
SELECT 
    'RESUMEN GENERAL' as seccion,
    COUNT(*) as total_registros,
    COUNT(*) FILTER (WHERE importe = 0) as registros_importe_zero,
    COUNT(*) FILTER (WHERE concepto IS NULL) as registros_concepto_null,
    COUNT(*) FILTER (WHERE importe = 0 AND concepto IS NULL) as registros_ambos_problemas,
    COUNT(*) FILTER (WHERE importe = 0 OR concepto IS NULL) as registros_cualquier_problema,
    ROUND((COUNT(*) FILTER (WHERE importe = 0 OR concepto IS NULL)::numeric / COUNT(*)::numeric) * 100, 2) as porcentaje_problematico,
    SUM(importe) as total_recaudado,
    SUM(importe) FILTER (WHERE importe = 0 OR concepto IS NULL) as importe_registros_problematicos
FROM copig.pagos_historicos

UNION ALL

-- ============================================================================
-- 2. ANÁLISIS DE REGISTROS POR TIPO DE PROBLEMA
-- ============================================================================
SELECT 
    'IMPORTE CERO' as seccion,
    COUNT(*) as total_registros,
    COUNT(DISTINCT matricula) as matriculas_afectadas,
    0 as registros_concepto_null,
    0 as registros_ambos_problemas,
    0 as registros_cualquier_problema,
    0 as porcentaje_problematico,
    SUM(importe) as total_recaudado,
    0 as importe_registros_problematicos
FROM copig.pagos_historicos
WHERE importe = 0

UNION ALL

SELECT 
    'CONCEPTO NULL' as seccion,
    COUNT(*) as total_registros,
    COUNT(DISTINCT matricula) as matriculas_afectadas,
    0 as registros_concepto_null,
    0 as registros_ambos_problemas,
    0 as registros_cualquier_problema,
    0 as porcentaje_problematico,
    SUM(importe) as total_recaudado,
    0 as importe_registros_problematicos
FROM copig.pagos_historicos
WHERE concepto IS NULL

ORDER BY seccion;

-- ============================================================================
-- 3. TOP PATRONES DE REGISTROS CON IMPORTE = 0
-- ============================================================================
SELECT 
    'PATRON_IMPORTE_ZERO' as tipo_analisis,
    ph.concepto,
    ph.detalle,
    COUNT(*) as cantidad,
    COUNT(DISTINCT ph.matricula) as matriculas_afectadas,
    MIN(ph.fecha_pago) as fecha_mas_antigua,
    MAX(ph.fecha_pago) as fecha_mas_reciente,
    CASE 
        WHEN ph.detalle IN ('DER.INSC.', 'der.insc.') THEN 'DERECHO_INSCRIPCION'
        WHEN ph.detalle ILIKE '%inact%' THEN 'INACTIVACION'
        WHEN ph.detalle ILIKE '%renov%' THEN 'RENOVACION'
        WHEN ph.detalle ILIKE '%baja%' THEN 'BAJA'
        WHEN ph.detalle ILIKE '%cert%' THEN 'CERTIFICACION'
        WHEN ph.detalle ILIKE '%morat%' THEN 'MORATORIA'
        ELSE 'OTRO'
    END as categoria_detalle
FROM copig.pagos_historicos ph
WHERE ph.importe = 0
GROUP BY ph.concepto, ph.detalle
ORDER BY cantidad DESC
LIMIT 20;

-- ============================================================================
-- 4. TOP PATRONES DE REGISTROS CON CONCEPTO = NULL
-- ============================================================================
SELECT 
    'PATRON_CONCEPTO_NULL' as tipo_analisis,
    ph.importe,
    ph.detalle,
    ph.estado,
    COUNT(*) as cantidad,
    COUNT(DISTINCT ph.matricula) as matriculas_afectadas,
    SUM(ph.importe) as total_importe,
    AVG(ph.importe) as importe_promedio,
    CASE 
        WHEN ph.detalle IN ('DER.INSC.', 'der.insc.') THEN 'DERECHO_INSCRIPCION'
        WHEN ph.detalle ILIKE '%inact%' THEN 'INACTIVACION'
        WHEN ph.detalle ILIKE '%renov%' THEN 'RENOVACION'
        WHEN ph.detalle ILIKE '%baja%' THEN 'BAJA'
        WHEN ph.detalle ILIKE '%cert%' THEN 'CERTIFICACION'
        WHEN ph.detalle ILIKE '%morat%' THEN 'MORATORIA'
        ELSE 'OTRO'
    END as categoria_detalle
FROM copig.pagos_historicos ph
WHERE ph.concepto IS NULL
GROUP BY ph.importe, ph.detalle, ph.estado
ORDER BY cantidad DESC
LIMIT 20;

-- ============================================================================
-- 5. MATRÍCULAS MÁS AFECTADAS (CON INFORMACIÓN DEL PROFESIONAL)
-- ============================================================================
SELECT 
    'MATRICULAS_MAS_AFECTADAS' as tipo_analisis,
    ph.matricula,
    p.nombre as profesional_nombre,
    p.numero_documento,
    COUNT(*) as total_registros_problematicos,
    COUNT(*) FILTER (WHERE ph.importe = 0) as registros_importe_zero,
    COUNT(*) FILTER (WHERE ph.concepto IS NULL) as registros_concepto_null,
    COUNT(*) FILTER (WHERE ph.importe = 0 AND ph.concepto IS NULL) as registros_ambos_problemas,
    MIN(ph.fecha_pago) as fecha_primer_problema,
    MAX(ph.fecha_pago) as fecha_ultimo_problema,
    SUM(ph.importe) as total_importe_registros_problematicos
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE ph.importe = 0 OR ph.concepto IS NULL
GROUP BY ph.matricula, p.nombre, p.numero_documento
ORDER BY total_registros_problematicos DESC
LIMIT 25;

-- ============================================================================
-- 6. DISTRIBUCIÓN TEMPORAL (CON CORRECCIÓN DE FECHAS)
-- ============================================================================
SELECT 
    'DISTRIBUCION_TEMPORAL' as tipo_analisis,
    EXTRACT(YEAR FROM 
        CASE 
            WHEN EXTRACT(YEAR FROM fecha_pago) > 5000 THEN 
                DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 3000, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
            WHEN EXTRACT(YEAR FROM fecha_pago) > 2200 THEN 
                DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 200, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
            WHEN EXTRACT(YEAR FROM fecha_pago) > 2030 THEN 
                DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 30, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
            ELSE fecha_pago 
        END
    ) as año_corregido,
    COUNT(*) as total_problemas,
    COUNT(*) FILTER (WHERE importe = 0) as problemas_importe_zero,
    COUNT(*) FILTER (WHERE concepto IS NULL) as problemas_concepto_null,
    COUNT(*) FILTER (WHERE importe = 0 AND concepto IS NULL) as problemas_ambos,
    SUM(importe) as total_importe_problemas,
    ROUND(AVG(importe), 2) as importe_promedio_problemas
FROM copig.pagos_historicos
WHERE importe = 0 OR concepto IS NULL
GROUP BY EXTRACT(YEAR FROM 
    CASE 
        WHEN EXTRACT(YEAR FROM fecha_pago) > 5000 THEN 
            DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 3000, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
        WHEN EXTRACT(YEAR FROM fecha_pago) > 2200 THEN 
            DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 200, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
        WHEN EXTRACT(YEAR FROM fecha_pago) > 2030 THEN 
            DATE(CONCAT(EXTRACT(YEAR FROM fecha_pago) - 30, '-', EXTRACT(MONTH FROM fecha_pago), '-', EXTRACT(DAY FROM fecha_pago)))
        ELSE fecha_pago 
    END
)
ORDER BY año_corregido DESC;

-- ============================================================================
-- 7. CATEGORIZACIÓN DE PROBLEMAS POR DETALLE
-- ============================================================================
SELECT 
    'CATEGORIZACION_DETALLE' as tipo_analisis,
    CASE 
        WHEN detalle IN ('DER.INSC.', 'der.insc.') THEN 'DERECHO_INSCRIPCION'
        WHEN detalle ILIKE '%inact%' THEN 'INACTIVACION'
        WHEN detalle ILIKE '%renov%' THEN 'RENOVACION'  
        WHEN detalle ILIKE '%baja%' THEN 'BAJA'
        WHEN detalle ILIKE '%cert%' THEN 'CERTIFICACION'
        WHEN detalle ILIKE '%morat%' THEN 'MORATORIA'
        WHEN detalle IS NULL THEN 'SIN_DETALLE'
        ELSE 'OTRO'
    END as categoria,
    COUNT(*) as total_registros,
    COUNT(DISTINCT matricula) as matriculas_afectadas,
    COUNT(*) FILTER (WHERE importe = 0) as con_importe_zero,
    COUNT(*) FILTER (WHERE concepto IS NULL) as con_concepto_null,
    SUM(importe) as total_importe,
    ROUND(AVG(importe), 2) as importe_promedio
FROM copig.pagos_historicos
WHERE importe = 0 OR concepto IS NULL
GROUP BY CASE 
    WHEN detalle IN ('DER.INSC.', 'der.insc.') THEN 'DERECHO_INSCRIPCION'
    WHEN detalle ILIKE '%inact%' THEN 'INACTIVACION'
    WHEN detalle ILIKE '%renov%' THEN 'RENOVACION'  
    WHEN detalle ILIKE '%baja%' THEN 'BAJA'
    WHEN detalle ILIKE '%cert%' THEN 'CERTIFICACION'
    WHEN detalle ILIKE '%morat%' THEN 'MORATORIA'
    WHEN detalle IS NULL THEN 'SIN_DETALLE'
    ELSE 'OTRO'
END
ORDER BY total_registros DESC;