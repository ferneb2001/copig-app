-- ====================================================
-- SISTEMA FINANCIERO COPIG - ESTRUCTURA DE TABLAS
-- ====================================================
-- Autor: Fernando Adrian Nebro
-- Fecha: 2025-01-02
-- Descripción: Estructura completa para gestión financiera
-- ====================================================

-- 1. TABLA DE PAGOS HISTÓRICOS
-- ====================================================
CREATE TABLE IF NOT EXISTS copig.pagos (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER REFERENCES copig.profesionales(id),
    numero_matricula INTEGER,
    fecha_pago DATE NOT NULL,
    periodo_pago VARCHAR(20), -- Ej: "2025-01", "2025-ANUAL"
    concepto VARCHAR(200) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    numero_recibo VARCHAR(50),
    medio_pago VARCHAR(50), -- efectivo, transferencia, tarjeta, etc
    observaciones TEXT,
    usuario_registro VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos de importación DBF
    dbf_id_original INTEGER,
    dbf_imported BOOLEAN DEFAULT FALSE,
    dbf_import_date TIMESTAMP,
    
    -- Índices para búsquedas
    INDEX idx_pagos_profesional (profesional_id),
    INDEX idx_pagos_matricula (numero_matricula),
    INDEX idx_pagos_fecha (fecha_pago),
    INDEX idx_pagos_periodo (periodo_pago)
);

-- 2. TABLA DE RESTRICCIONES/DEUDAS
-- ====================================================
CREATE TABLE IF NOT EXISTS copig.restricciones (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER REFERENCES copig.profesionales(id),
    numero_matricula INTEGER,
    tipo_restriccion VARCHAR(50) NOT NULL, -- 'SUSPENSION', 'INHABILITACION', 'DEUDA', 'MOROSIDAD'
    motivo TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'ACTIVA', -- 'ACTIVA', 'LEVANTADA', 'CANCELADA'
    resolucion_numero VARCHAR(50),
    expediente_numero VARCHAR(50),
    monto_deuda DECIMAL(12,2),
    periodos_adeudados TEXT, -- JSON array de periodos
    observaciones TEXT,
    usuario_registro VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_levantamiento VARCHAR(100),
    fecha_levantamiento TIMESTAMP,
    motivo_levantamiento TEXT,
    -- Campos de importación DBF
    dbf_id_original INTEGER,
    dbf_imported BOOLEAN DEFAULT FALSE,
    dbf_import_date TIMESTAMP,
    
    -- Índices
    INDEX idx_restricciones_profesional (profesional_id),
    INDEX idx_restricciones_matricula (numero_matricula),
    INDEX idx_restricciones_estado (estado),
    INDEX idx_restricciones_tipo (tipo_restriccion)
);

-- 3. TABLA DE SANCIONES
-- ====================================================
CREATE TABLE IF NOT EXISTS copig.sanciones (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER REFERENCES copig.profesionales(id),
    numero_matricula INTEGER,
    tipo_sancion VARCHAR(50) NOT NULL, -- 'MULTA', 'SUSPENSION', 'APERCIBIMIENTO', 'INHABILITACION'
    descripcion TEXT NOT NULL,
    fecha_sancion DATE NOT NULL,
    fecha_inicio_cumplimiento DATE,
    fecha_fin_cumplimiento DATE,
    estado VARCHAR(20) DEFAULT 'VIGENTE', -- 'VIGENTE', 'CUMPLIDA', 'APELADA', 'ANULADA'
    resolucion_numero VARCHAR(50),
    expediente_numero VARCHAR(50),
    articulos_aplicados TEXT, -- Artículos del código de ética
    monto_multa DECIMAL(12,2),
    observaciones TEXT,
    usuario_registro VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos de importación DBF
    dbf_id_original INTEGER,
    dbf_imported BOOLEAN DEFAULT FALSE,
    dbf_import_date TIMESTAMP,
    
    -- Índices
    INDEX idx_sanciones_profesional (profesional_id),
    INDEX idx_sanciones_matricula (numero_matricula),
    INDEX idx_sanciones_estado (estado),
    INDEX idx_sanciones_fecha (fecha_sancion)
);

-- 4. TABLA DE CUENTA CORRIENTE (Estado actual del profesional)
-- ====================================================
CREATE TABLE IF NOT EXISTS copig.cuenta_corriente (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER REFERENCES copig.profesionales(id) UNIQUE,
    numero_matricula INTEGER UNIQUE,
    saldo_actual DECIMAL(12,2) DEFAULT 0.00,
    ultimo_pago_fecha DATE,
    ultimo_pago_monto DECIMAL(12,2),
    ultimo_periodo_pago VARCHAR(20),
    estado_financiero VARCHAR(20) DEFAULT 'AL_DIA', -- 'AL_DIA', 'MOROSO', 'SUSPENDIDO'
    cantidad_periodos_deuda INTEGER DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    habilitado_ejercer BOOLEAN DEFAULT TRUE,
    motivo_inhabilitacion TEXT,
    observaciones TEXT,
    
    -- Índices
    INDEX idx_cuenta_profesional (profesional_id),
    INDEX idx_cuenta_matricula (numero_matricula),
    INDEX idx_cuenta_estado (estado_financiero)
);

-- 5. TABLA DE CONCEPTOS DE PAGO
-- ====================================================
CREATE TABLE IF NOT EXISTS copig.conceptos_pago (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'CUOTA_MENSUAL', 'MATRICULA_ANUAL', 'MULTA', 'CERTIFICADO', 'OTROS'
    monto_base DECIMAL(12,2),
    vigente BOOLEAN DEFAULT TRUE,
    fecha_vigencia_desde DATE,
    fecha_vigencia_hasta DATE,
    observaciones TEXT
);

-- 6. TABLA DE PERIODOS DE COBRO
-- ====================================================
CREATE TABLE IF NOT EXISTS copig.periodos_cobro (
    id SERIAL PRIMARY KEY,
    periodo VARCHAR(20) UNIQUE NOT NULL, -- Formato: "2025-01", "2025-ANUAL"
    año INTEGER NOT NULL,
    mes INTEGER,
    tipo_periodo VARCHAR(20) NOT NULL, -- 'MENSUAL', 'ANUAL', 'EXTRAORDINARIO'
    fecha_vencimiento DATE NOT NULL,
    monto_cuota DECIMAL(12,2) NOT NULL,
    recargo_mora DECIMAL(5,2) DEFAULT 10.00, -- Porcentaje
    estado VARCHAR(20) DEFAULT 'ABIERTO', -- 'ABIERTO', 'CERRADO', 'EN_PROCESO'
    observaciones TEXT
);

-- ====================================================
-- FUNCIONES Y TRIGGERS PARA AUTOMATIZACIÓN
-- ====================================================

-- Función para actualizar cuenta corriente después de un pago
CREATE OR REPLACE FUNCTION copig.actualizar_cuenta_corriente_pago()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar o crear cuenta corriente
    INSERT INTO copig.cuenta_corriente (
        profesional_id, 
        numero_matricula, 
        ultimo_pago_fecha,
        ultimo_pago_monto,
        ultimo_periodo_pago,
        estado_financiero,
        fecha_actualizacion
    )
    VALUES (
        NEW.profesional_id,
        NEW.numero_matricula,
        NEW.fecha_pago,
        NEW.monto,
        NEW.periodo_pago,
        'AL_DIA',
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (profesional_id) 
    DO UPDATE SET
        ultimo_pago_fecha = NEW.fecha_pago,
        ultimo_pago_monto = NEW.monto,
        ultimo_periodo_pago = NEW.periodo_pago,
        estado_financiero = 'AL_DIA',
        cantidad_periodos_deuda = 0,
        fecha_actualizacion = CURRENT_TIMESTAMP;
    
    -- Verificar si hay restricciones por deuda y levantarlas
    UPDATE copig.restricciones 
    SET 
        estado = 'LEVANTADA',
        fecha_levantamiento = CURRENT_TIMESTAMP,
        usuario_levantamiento = 'SISTEMA_AUTO',
        motivo_levantamiento = 'Pago registrado - Levantamiento automático'
    WHERE 
        profesional_id = NEW.profesional_id 
        AND tipo_restriccion IN ('DEUDA', 'MOROSIDAD')
        AND estado = 'ACTIVA';
    
    -- Actualizar estado de habilitación
    UPDATE copig.cuenta_corriente
    SET 
        habilitado_ejercer = TRUE,
        motivo_inhabilitacion = NULL
    WHERE profesional_id = NEW.profesional_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar después de insertar un pago
CREATE TRIGGER trigger_actualizar_cuenta_pago
AFTER INSERT ON copig.pagos
FOR EACH ROW
EXECUTE FUNCTION copig.actualizar_cuenta_corriente_pago();

-- Función para aplicar restricción automática
CREATE OR REPLACE FUNCTION copig.aplicar_restriccion_automatica()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_restriccion IN ('DEUDA', 'MOROSIDAD', 'SUSPENSION') AND NEW.estado = 'ACTIVA' THEN
        -- Actualizar cuenta corriente
        UPDATE copig.cuenta_corriente
        SET 
            estado_financiero = CASE 
                WHEN NEW.tipo_restriccion = 'SUSPENSION' THEN 'SUSPENDIDO'
                ELSE 'MOROSO'
            END,
            habilitado_ejercer = FALSE,
            motivo_inhabilitacion = NEW.motivo,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE profesional_id = NEW.profesional_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para restricciones
CREATE TRIGGER trigger_aplicar_restriccion
AFTER INSERT OR UPDATE ON copig.restricciones
FOR EACH ROW
EXECUTE FUNCTION copig.aplicar_restriccion_automatica();

-- ====================================================
-- VISTAS ÚTILES
-- ====================================================

-- Vista de estado financiero completo del profesional
CREATE OR REPLACE VIEW copig.vista_estado_financiero AS
SELECT 
    p.id,
    p.nombre,
    p.numero_documento,
    m.numero_matricula,
    cc.saldo_actual,
    cc.estado_financiero,
    cc.ultimo_pago_fecha,
    cc.ultimo_periodo_pago,
    cc.habilitado_ejercer,
    cc.motivo_inhabilitacion,
    (SELECT COUNT(*) FROM copig.restricciones r 
     WHERE r.profesional_id = p.id AND r.estado = 'ACTIVA') as restricciones_activas,
    (SELECT COUNT(*) FROM copig.sanciones s 
     WHERE s.profesional_id = p.id AND s.estado = 'VIGENTE') as sanciones_vigentes
FROM copig.profesionales p
LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
LEFT JOIN copig.cuenta_corriente cc ON p.id = cc.profesional_id;

-- Vista de pagos del último año
CREATE OR REPLACE VIEW copig.vista_pagos_ultimo_año AS
SELECT 
    p.profesional_id,
    p.numero_matricula,
    pr.nombre as profesional_nombre,
    COUNT(*) as cantidad_pagos,
    SUM(p.monto) as total_pagado,
    MAX(p.fecha_pago) as ultimo_pago
FROM copig.pagos p
JOIN copig.profesionales pr ON p.profesional_id = pr.id
WHERE p.fecha_pago >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY p.profesional_id, p.numero_matricula, pr.nombre;

-- ====================================================
-- DATOS INICIALES DE CONCEPTOS
-- ====================================================
INSERT INTO copig.conceptos_pago (codigo, descripcion, tipo, monto_base, vigente) VALUES
('CUOTA_MENSUAL', 'Cuota Mensual Colegiatura', 'CUOTA_MENSUAL', 5000.00, true),
('MATRICULA_ANUAL', 'Matrícula Anual', 'MATRICULA_ANUAL', 15000.00, true),
('CERT_ENCOMIENDA', 'Certificado de Encomienda', 'CERTIFICADO', 2500.00, true),
('CERT_HABILITACION', 'Certificado de Habilitación', 'CERTIFICADO', 1500.00, true),
('MULTA_MORA', 'Multa por Mora', 'MULTA', 0.00, true)
ON CONFLICT (codigo) DO NOTHING;

-- ====================================================
COMMENT ON TABLE copig.pagos IS 'Registro histórico de todos los pagos realizados por profesionales';
COMMENT ON TABLE copig.restricciones IS 'Restricciones y deudas que impiden el ejercicio profesional';
COMMENT ON TABLE copig.sanciones IS 'Sanciones disciplinarias aplicadas a profesionales';
COMMENT ON TABLE copig.cuenta_corriente IS 'Estado financiero actual de cada profesional';
COMMENT ON TABLE copig.conceptos_pago IS 'Catálogo de conceptos de cobro';
COMMENT ON TABLE copig.periodos_cobro IS 'Períodos de cobro mensuales y anuales';