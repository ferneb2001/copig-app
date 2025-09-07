-- Sistema de Pagos de Matrícula COPIG
-- =====================================

-- Tabla para configuración de aranceles anuales
CREATE TABLE IF NOT EXISTS copig.aranceles_matricula (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    año INTEGER NOT NULL,
    monto_base DECIMAL(10,2) NOT NULL,
    descuento_pago_anual DECIMAL(5,2) DEFAULT 0,
    recargo_mora DECIMAL(5,2) DEFAULT 0,
    fecha_vencimiento DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para métodos de pago disponibles
CREATE TABLE IF NOT EXISTS copig.metodos_pago (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'transferencia', 'tarjeta', 'virtual_wallet', 'banco_macro'
    activo BOOLEAN DEFAULT true,
    permite_cuotas BOOLEAN DEFAULT false,
    configuracion JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para planes de cuotas
CREATE TABLE IF NOT EXISTS copig.planes_cuotas (
    id SERIAL PRIMARY KEY,
    metodo_pago_id INTEGER REFERENCES copig.metodos_pago(id),
    cantidad_cuotas INTEGER NOT NULL,
    coeficiente DECIMAL(5,4) NOT NULL, -- Factor multiplicador para calcular cuotas
    descripcion VARCHAR(100),
    activo BOOLEAN DEFAULT true
);

-- Tabla principal de pagos de matrícula
CREATE TABLE IF NOT EXISTS copig.pagos_matricula (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    año INTEGER NOT NULL,
    monto_base DECIMAL(10,2) NOT NULL,
    descuentos DECIMAL(10,2) DEFAULT 0,
    recargos DECIMAL(10,2) DEFAULT 0,
    monto_final DECIMAL(10,2) NOT NULL,
    metodo_pago_id INTEGER REFERENCES copig.metodos_pago(id),
    plan_cuotas_id INTEGER REFERENCES copig.planes_cuotas(id),
    estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, procesando, aprobado, rechazado, vencido
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_pago TIMESTAMP,
    comprobante_numero VARCHAR(100),
    datos_pago JSONB DEFAULT '{}', -- CBU, datos de tarjeta, etc.
    observaciones TEXT,
    created_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para cuotas individuales (cuando se paga en cuotas)
CREATE TABLE IF NOT EXISTS copig.cuotas_pago (
    id SERIAL PRIMARY KEY,
    pago_matricula_id INTEGER REFERENCES copig.pagos_matricula(id),
    numero_cuota INTEGER NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, pagada, vencida
    fecha_pago TIMESTAMP,
    comprobante VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para transacciones y estados de pago
CREATE TABLE IF NOT EXISTS copig.transacciones_pago (
    id SERIAL PRIMARY KEY,
    pago_matricula_id INTEGER REFERENCES copig.pagos_matricula(id),
    cuota_id INTEGER REFERENCES copig.cuotas_pago(id),
    numero_transaccion VARCHAR(100) UNIQUE,
    monto DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL, -- iniciada, pendiente, aprobada, rechazada, cancelada
    metodo_utilizado VARCHAR(50),
    datos_transaccion JSONB DEFAULT '{}',
    fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mensaje_respuesta TEXT
);

-- Tabla para notificaciones de pago
CREATE TABLE IF NOT EXISTS copig.notificaciones_pago (
    id SERIAL PRIMARY KEY,
    profesional_id INTEGER NOT NULL,
    pago_id INTEGER REFERENCES copig.pagos_matricula(id),
    tipo VARCHAR(50) NOT NULL, -- recordatorio, vencimiento, confirmacion, rechazo
    asunto VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    enviada BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_pagos_matricula_profesional ON copig.pagos_matricula(profesional_id);
CREATE INDEX IF NOT EXISTS idx_pagos_matricula_año ON copig.pagos_matricula(año);
CREATE INDEX IF NOT EXISTS idx_pagos_matricula_estado ON copig.pagos_matricula(estado);
CREATE INDEX IF NOT EXISTS idx_cuotas_pago_matricula ON copig.cuotas_pago(pago_matricula_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_pago_matricula ON copig.transacciones_pago(pago_matricula_id);

-- Insertar métodos de pago iniciales
INSERT INTO copig.metodos_pago (codigo, nombre, tipo, activo, permite_cuotas, configuracion) VALUES
('TRANSFER_BANK', 'Transferencia Bancaria', 'transferencia', true, false, '{"banco": "Banco Macro", "cuenta": "12345678", "cbu": "0270123456789012345678", "titular": "COPIG"}'),
('CBU_DIRECT', 'CBU - Transferencia Directa', 'transferencia', true, false, '{"cbu": "0270123456789012345678", "alias": "COPIG.MATRICULA"}'),
('MERCADO_PAGO', 'Mercado Pago', 'virtual_wallet', true, true, '{"public_key": "", "access_token": ""}'),
('MODO', 'MODO', 'virtual_wallet', true, false, '{"merchant_id": "", "api_key": ""}'),
('BANCO_MACRO', 'Banco Macro Online', 'banco_macro', true, true, '{"merchant_id": "", "terminal_id": ""}'),
('VISA', 'Visa', 'tarjeta', true, true, '{"processor": "decidir"}'),
('MASTERCARD', 'Mastercard', 'tarjeta', true, true, '{"processor": "decidir"}'),
('AMERICAN_EXPRESS', 'American Express', 'tarjeta', true, true, '{"processor": "decidir"}');

-- Insertar planes de cuotas
INSERT INTO copig.planes_cuotas (metodo_pago_id, cantidad_cuotas, coeficiente, descripcion) VALUES
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MERCADO_PAGO'), 3, 1.05, '3 cuotas sin interés'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MERCADO_PAGO'), 6, 1.12, '6 cuotas con 12% de recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MERCADO_PAGO'), 12, 1.25, '12 cuotas con 25% de recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'BANCO_MACRO'), 1, 1.00, 'Pago al contado'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'BANCO_MACRO'), 3, 1.08, '3 cuotas - 8% recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'BANCO_MACRO'), 6, 1.15, '6 cuotas - 15% recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'VISA'), 1, 1.00, 'Pago al contado'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'VISA'), 3, 1.06, '3 cuotas sin interés'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'VISA'), 6, 1.14, '6 cuotas - 14% recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'VISA'), 12, 1.28, '12 cuotas - 28% recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MASTERCARD'), 1, 1.00, 'Pago al contado'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MASTERCARD'), 3, 1.06, '3 cuotas sin interés'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MASTERCARD'), 6, 1.14, '6 cuotas - 14% recargo'),
((SELECT id FROM copig.metodos_pago WHERE codigo = 'MASTERCARD'), 12, 1.28, '12 cuotas - 28% recargo');

-- Insertar aranceles base para 2025
INSERT INTO copig.aranceles_matricula (categoria, año, monto_base, descuento_pago_anual, fecha_vencimiento) VALUES
('ING_CIVIL', 2025, 85000.00, 10.00, '2025-12-31'),
('ING_MECANICO', 2025, 85000.00, 10.00, '2025-12-31'),
('ING_ELECTRONICO', 2025, 85000.00, 10.00, '2025-12-31'),
('ING_QUIMICO', 2025, 85000.00, 10.00, '2025-12-31'),
('GEOLOGO', 2025, 80000.00, 10.00, '2025-12-31'),
('AGRIMENSOR', 2025, 75000.00, 10.00, '2025-12-31'),
('TECNICO', 2025, 45000.00, 5.00, '2025-12-31');

-- Comentarios de documentación
COMMENT ON TABLE copig.pagos_matricula IS 'Pagos de matrícula anual de profesionales';
COMMENT ON TABLE copig.metodos_pago IS 'Métodos de pago disponibles en el sistema';
COMMENT ON TABLE copig.planes_cuotas IS 'Planes de financiación en cuotas';
COMMENT ON TABLE copig.aranceles_matricula IS 'Aranceles anuales por categoría profesional';
COMMENT ON TABLE copig.cuotas_pago IS 'Cuotas individuales para pagos financiados';
COMMENT ON TABLE copig.transacciones_pago IS 'Registro de transacciones de pago';
COMMENT ON TABLE copig.notificaciones_pago IS 'Notificaciones relacionadas con pagos';

-- Vista para consultas rápidas de estado de matriculas
CREATE OR REPLACE VIEW copig.estado_matriculas_2025 AS
SELECT 
    p.id,
    p.nombre_completo,
    m.numero as matricula,
    m.categoria,
    a.monto_base as arancel_base,
    COALESCE(pm.estado, 'sin_pago') as estado_pago,
    pm.monto_final as monto_pagado,
    pm.fecha_pago,
    CASE 
        WHEN pm.estado = 'aprobado' THEN 'Al día'
        WHEN pm.estado IS NULL THEN 'Pendiente de pago'
        WHEN pm.estado = 'pendiente' THEN 'Pago iniciado'
        ELSE 'Verificar estado'
    END as situacion_matricula
FROM copig.profesionales p
JOIN copig.matriculas m ON p.id = m.profesional_id
LEFT JOIN copig.aranceles_matricula a ON m.categoria = a.categoria AND a.año = 2025
LEFT JOIN copig.pagos_matricula pm ON p.id = pm.profesional_id AND pm.año = 2025;

-- Función para calcular monto final con descuentos y recargos
CREATE OR REPLACE FUNCTION copig.calcular_monto_matricula(
    p_categoria VARCHAR,
    p_plan_cuotas_id INTEGER DEFAULT NULL,
    p_pago_anual BOOLEAN DEFAULT false
) RETURNS DECIMAL AS $$
DECLARE
    v_monto_base DECIMAL(10,2);
    v_descuento DECIMAL(5,2) := 0;
    v_coeficiente DECIMAL(5,4) := 1.0000;
    v_monto_final DECIMAL(10,2);
BEGIN
    -- Obtener monto base
    SELECT monto_base, 
           CASE WHEN p_pago_anual THEN descuento_pago_anual ELSE 0 END
    INTO v_monto_base, v_descuento
    FROM copig.aranceles_matricula 
    WHERE categoria = p_categoria AND año = 2025 AND activo = true;
    
    -- Obtener coeficiente de cuotas si aplica
    IF p_plan_cuotas_id IS NOT NULL THEN
        SELECT coeficiente INTO v_coeficiente
        FROM copig.planes_cuotas
        WHERE id = p_plan_cuotas_id AND activo = true;
    END IF;
    
    -- Calcular monto final
    v_monto_final := v_monto_base * (1 - v_descuento/100) * v_coeficiente;
    
    RETURN ROUND(v_monto_final, 2);
END;
$$ LANGUAGE plpgsql;