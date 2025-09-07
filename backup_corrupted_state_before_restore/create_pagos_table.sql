-- Script para crear la tabla pagos_historicos en el esquema copig
-- Ejecutar este script en PostgreSQL para crear la estructura necesaria

CREATE TABLE IF NOT EXISTS copig.pagos_historicos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(50) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    fecha_vencimiento DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    metodo_pago VARCHAR(50),
    numero_recibo VARCHAR(100),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_matricula ON copig.pagos_historicos(matricula);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON copig.pagos_historicos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON copig.pagos_historicos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_concepto ON copig.pagos_historicos(concepto);

-- Insertar datos de ejemplo para pruebas
INSERT INTO copig.pagos_historicos (matricula, concepto, monto, fecha_pago, fecha_vencimiento, estado, metodo_pago, numero_recibo, observaciones) 
VALUES 
    ('12345678', 'Cuota Anual 2024', 15000.00, '2024-01-15', '2024-01-31', 'pagado', 'Transferencia', 'REC001', 'Pago realizado en tiempo'),
    ('12345678', 'Matrícula Renovación', 5000.00, '2024-02-10', '2024-02-28', 'pagado', 'Efectivo', 'REC002', NULL),
    ('87654321', 'Cuota Anual 2024', 15000.00, '2024-01-20', '2024-01-31', 'pagado', 'Débito', 'REC003', NULL),
    ('11223344', 'Cuota Anual 2024', 15000.00, '2024-01-31', '2024-01-31', 'vencido', NULL, NULL, 'No se recibió pago'),
    ('55667788', 'Matrícula Nueva', 8000.00, '2024-03-05', '2024-03-15', 'pagado', 'Transferencia', 'REC004', 'Nuevo profesional'),
    ('12345678', 'Multa por Documentación', 2500.00, '2024-03-20', '2024-04-30', 'pendiente', NULL, NULL, 'Documentación tardía'),
    ('99887766', 'Cuota Semestral', 7500.00, '2024-06-01', '2024-06-30', 'pendiente', NULL, NULL, 'Pago pendiente'),
    ('44556677', 'Certificado Profesional', 1200.00, '2024-07-15', '2024-07-30', 'pagado', 'Tarjeta', 'REC005', 'Certificado expedido'),
    ('33445566', 'Cuota Anual 2024', 15000.00, '2024-08-01', '2024-08-31', 'pendiente', NULL, NULL, 'Pago programado'),
    ('22334455', 'Actualización de Datos', 800.00, '2024-08-10', '2024-08-25', 'pagado', 'Efectivo', 'REC006', NULL);

-- Comentarios sobre los campos
COMMENT ON TABLE copig.pagos_historicos IS 'Tabla para registrar el historial de pagos de los profesionales';
COMMENT ON COLUMN copig.pagos_historicos.matricula IS 'Número de matrícula o documento del profesional';
COMMENT ON COLUMN copig.pagos_historicos.concepto IS 'Descripción del concepto por el cual se realiza el pago';
COMMENT ON COLUMN copig.pagos_historicos.monto IS 'Importe del pago en pesos';
COMMENT ON COLUMN copig.pagos_historicos.fecha_pago IS 'Fecha en la que se realizó o debe realizarse el pago';
COMMENT ON COLUMN copig.pagos_historicos.fecha_vencimiento IS 'Fecha límite para el pago';
COMMENT ON COLUMN copig.pagos_historicos.estado IS 'Estado del pago: pagado, pendiente, vencido';
COMMENT ON COLUMN copig.pagos_historicos.metodo_pago IS 'Método utilizado para el pago: efectivo, transferencia, débito, tarjeta';
COMMENT ON COLUMN copig.pagos_historicos.numero_recibo IS 'Número de recibo o comprobante del pago';
COMMENT ON COLUMN copig.pagos_historicos.observaciones IS 'Observaciones adicionales sobre el pago';