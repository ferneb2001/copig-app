# MEJORAS DE RELACIONES BASE DE DATOS COPIG

## 1. SOLUCIONES INMEDIATAS

### Crear Registros de Profesionales Históricos
```sql
-- Crear registros de profesionales faltantes para matrículas históricas de alto valor
INSERT INTO copig.profesionales (numero_documento, nombre, estado)
SELECT DISTINCT 
    ph.matricula::bigint as numero_documento,
    CONCAT('PROFESIONAL_HISTORICO_', ph.matricula) as nombre,
    'HISTORICO' as estado
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
WHERE p.id IS NULL 
  AND ph.matricula::integer < 5000  -- Matrículas históricas
  AND EXISTS (
    SELECT 1 FROM copig.pagos_historicos ph2 
    WHERE ph2.matricula = ph.matricula 
    GROUP BY ph2.matricula 
    HAVING SUM(ph2.importe) > 10000  -- Solo cuentas de alto valor
  );
```

### Actualizar Referencias en Tabla Matrículas
```sql
-- Vincular matrículas existentes con profesionales históricos recién creados
UPDATE copig.matriculas m
SET profesional_id = p.id
FROM copig.profesionales p
WHERE m.numero = p.numero_documento
  AND m.profesional_id IS NULL;
```

## 2. MEJORAS ESTRUCTURALES

### A. Crear Tabla de Mapeo para Relaciones Históricas
```sql
CREATE TABLE copig.pagos_matriculas_mapeo (
    id SERIAL PRIMARY KEY,
    matricula_pago VARCHAR(20) NOT NULL,
    profesional_id INTEGER REFERENCES copig.profesionales(id),
    tipo_relacion VARCHAR(20) DEFAULT 'AUTOMATICA',
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    validado_por INTEGER,
    notas TEXT
);

-- Índices para rendimiento
CREATE INDEX idx_pagos_mapeo_matricula ON copig.pagos_matriculas_mapeo(matricula_pago);
CREATE INDEX idx_pagos_mapeo_profesional ON copig.pagos_matriculas_mapeo(profesional_id);
```

### B. Estandarizar Tipos de Campo Matrícula
```sql
-- Asegurar tipos de datos consistentes en todas las tablas
ALTER TABLE copig.pagos_historicos 
ALTER COLUMN matricula TYPE VARCHAR(20);

ALTER TABLE copig.matriculas 
ALTER COLUMN numero TYPE INTEGER;

ALTER TABLE copig.profesionales 
ALTER COLUMN numero_documento TYPE BIGINT;
```

## 3. MEJORAS DE INTEGRIDAD DE DATOS

### A. Agregar Restricciones de Clave Foránea con Validación
```sql
-- Agregar restricción FK con validación diferida
ALTER TABLE copig.matriculas 
ADD CONSTRAINT fk_matriculas_profesionales 
FOREIGN KEY (profesional_id) 
REFERENCES copig.profesionales(id) 
DEFERRABLE INITIALLY DEFERRED;
```

### B. Crear Vistas de Validación
```sql
CREATE VIEW copig.v_integridad_matriculas AS
SELECT 
    ph.matricula,
    m.numero as en_tabla_matriculas,
    m.profesional_id,
    p.id as profesional_existe,
    p.nombre as profesional_nombre,
    COUNT(ph.id) as total_pagos,
    SUM(ph.importe) as total_importe,
    CASE 
        WHEN m.numero IS NULL THEN 'NO_EN_MATRICULAS'
        WHEN m.profesional_id IS NULL THEN 'SIN_PROFESIONAL_ID'
        WHEN p.id IS NULL THEN 'PROFESIONAL_INVALIDO'
        ELSE 'CORRECTO'
    END as estado_integridad
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
GROUP BY ph.matricula, m.numero, m.profesional_id, p.id, p.nombre;
```

## 4. MEJORAS EN LA API

### A. Estrategia de JOIN Mejorada
```sql
-- Consulta mejorada para pagos con búsqueda alternativa de profesionales
SELECT 
    ph.matricula,
    ph.importe,
    ph.fecha_pago,
    COALESCE(
        p.nombre,                    -- Primario: vía tabla matriculas
        pm.nombre,                   -- Secundario: vía tabla de mapeo  
        pdir.nombre,                 -- Terciario: coincidencia directa de documento
        'PROFESIONAL_NO_IDENTIFICADO'
    ) as profesional_nombre
FROM copig.pagos_historicos ph
LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
LEFT JOIN copig.pagos_matriculas_mapeo pmm ON ph.matricula = pmm.matricula_pago
LEFT JOIN copig.profesionales pm ON pmm.profesional_id = pm.id
LEFT JOIN copig.profesionales pdir ON ph.matricula::bigint = pdir.numero_documento;
```

## 5. MONITOREO Y MANTENIMIENTO

### A. Crear Función de Monitoreo de Integridad
```sql
CREATE OR REPLACE FUNCTION copig.verificar_integridad_matriculas()
RETURNS TABLE(
    problema VARCHAR,
    cantidad INTEGER,
    impacto_financiero NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'MATRICULAS_SIN_PROFESIONAL' as problema,
        COUNT(DISTINCT ph.matricula)::INTEGER as cantidad,
        SUM(ph.importe) as impacto_financiero
    FROM copig.pagos_historicos ph
    LEFT JOIN copig.matriculas m ON ph.matricula::integer = m.numero
    LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
    WHERE p.id IS NULL;
END;
$$ LANGUAGE plpgsql;
```

### B. Tareas de Mantenimiento Regulares
```sql
-- Programar verificaciones semanales de integridad
CREATE OR REPLACE FUNCTION copig.mantenimiento_semanal()
RETURNS void AS $$
BEGIN
    -- Actualizar estadísticas
    ANALYZE copig.pagos_historicos;
    ANALYZE copig.matriculas;
    ANALYZE copig.profesionales;
    
    -- Registrar problemas de integridad
    INSERT INTO copig.log_integridad
    SELECT NOW(), * FROM copig.verificar_integridad_matriculas();
END;
$$ LANGUAGE plpgsql;
```

## 6. PRIORIDAD DE IMPLEMENTACIÓN

### Fase 1 (Inmediato - 1 semana)
1. Crear registros de profesionales históricos para matrículas de alto valor
2. Actualizar referencias profesional_id en matrículas existentes
3. Desplegar estrategia mejorada de JOIN en la API

### Fase 2 (Corto plazo - 1 mes)
1. Crear tabla pagos_matriculas_mapeo
2. Implementar vistas de validación
3. Agregar funciones de monitoreo

### Fase 3 (Largo plazo - 3 meses)
1. Migración y estandarización de datos
2. Restricciones de clave foránea
3. Procedimientos de mantenimiento automatizados

## RESULTADOS ESPERADOS

- **Impacto Inmediato**: Reducir matrículas huérfanas del 39% al ~15%
- **Recuperación Financiera**: Asociar ~$2M en pagos históricos con profesionales
- **Integridad de Datos**: Mejora del 95% en correspondencia matrícula-profesional
- **Rendimiento**: Mejor rendimiento de consultas con indexación adecuada
- **Mantenimiento**: Monitoreo automatizado y alertas para problemas futuros

## ANÁLISIS DE IMPACTO POR RANGO DE MATRÍCULA

### Matrículas Históricas (1-4999)
- **Problema**: 77-82% sin correspondencia
- **Causa**: Migración incompleta de datos pre-digitales
- **Solución**: Crear registros históricos automáticamente

### Matrículas Modernas (5000+)
- **Problema**: 5-15% sin correspondencia  
- **Causa**: Errores de registro o IDs inválidos
- **Solución**: Validación y corrección manual

### Impacto Financiero Total
- **3,335 matrículas huérfanas** de 8,546 total
- **Aproximadamente $2,000,000** en pagos sin asociar
- **39% de los registros** requieren atención