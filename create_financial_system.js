const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const configFile = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const pool = new Pool(configFile.database);

async function createFinancialTables() {
    const client = await pool.connect();
    
    try {
        console.log('🏗️ CREANDO SISTEMA FINANCIERO COPIG...\n');
        
        // 1. Crear tabla de pagos históricos
        console.log('📊 Creando tabla copig.pagos...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.pagos (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                numero_matricula INTEGER,
                fecha_pago DATE NOT NULL,
                periodo_pago VARCHAR(20),
                concepto VARCHAR(200) NOT NULL,
                monto DECIMAL(12,2) NOT NULL,
                numero_recibo VARCHAR(50),
                medio_pago VARCHAR(50),
                observaciones TEXT,
                usuario_registro VARCHAR(100),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                dbf_id_original VARCHAR(50),
                dbf_imported BOOLEAN DEFAULT FALSE,
                dbf_import_date TIMESTAMP
            )`);
        
        // Crear índices con verificación
        console.log('   Creando índices...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_pagos_profesional ON copig.pagos(profesional_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON copig.pagos(fecha_pago)`);
        console.log('✅ Tabla pagos creada');

        // 2. Crear tabla de restricciones/deudas
        console.log('🚫 Creando tabla copig.restricciones...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.restricciones (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                numero_matricula INTEGER,
                tipo_restriccion VARCHAR(50) NOT NULL,
                motivo TEXT NOT NULL,
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE,
                estado VARCHAR(20) DEFAULT 'ACTIVA',
                resolucion_numero VARCHAR(50),
                expediente_numero VARCHAR(50),
                monto_deuda DECIMAL(12,2),
                periodos_adeudados TEXT,
                observaciones TEXT,
                usuario_registro VARCHAR(100),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usuario_levantamiento VARCHAR(100),
                fecha_levantamiento TIMESTAMP,
                motivo_levantamiento TEXT,
                dbf_id_original VARCHAR(50),
                dbf_imported BOOLEAN DEFAULT FALSE,
                dbf_import_date TIMESTAMP
            )`);
        
        await client.query(`CREATE INDEX IF NOT EXISTS idx_restricciones_profesional ON copig.restricciones(profesional_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_restricciones_estado ON copig.restricciones(estado)`);
        console.log('✅ Tabla restricciones creada');

        // 3. Crear tabla de sanciones
        console.log('⚖️ Creando tabla copig.sanciones...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.sanciones (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                empresa_id INTEGER REFERENCES copig.empresas(id),
                numero_matricula INTEGER,
                tipo_sancion VARCHAR(50) NOT NULL,
                descripcion TEXT NOT NULL,
                fecha_sancion DATE NOT NULL,
                fecha_inicio_cumplimiento DATE,
                fecha_fin_cumplimiento DATE,
                estado VARCHAR(20) DEFAULT 'VIGENTE',
                resolucion_numero VARCHAR(50),
                expediente_numero VARCHAR(50),
                articulos_aplicados TEXT,
                monto_multa DECIMAL(12,2),
                observaciones TEXT,
                usuario_registro VARCHAR(100),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                dbf_id_original VARCHAR(50),
                dbf_imported BOOLEAN DEFAULT FALSE,
                dbf_import_date TIMESTAMP
            )`);
        
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sanciones_profesional ON copig.sanciones(profesional_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sanciones_estado ON copig.sanciones(estado)`);
        console.log('✅ Tabla sanciones creada');

        // 4. Crear tabla de cuenta corriente
        console.log('💰 Creando tabla copig.cuenta_corriente...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.cuenta_corriente (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id) UNIQUE,
                saldo_actual DECIMAL(12,2) DEFAULT 0.00,
                ultimo_pago_fecha DATE,
                ultimo_pago_monto DECIMAL(12,2),
                ultimo_periodo_pago VARCHAR(20),
                estado_financiero VARCHAR(20) DEFAULT 'AL_DIA',
                cantidad_periodos_deuda INTEGER DEFAULT 0,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                habilitado_ejercer BOOLEAN DEFAULT TRUE,
                motivo_inhabilitacion TEXT,
                observaciones TEXT
            )`);
        
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cuenta_profesional ON copig.cuenta_corriente(profesional_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_cuenta_estado ON copig.cuenta_corriente(estado_financiero)`);
        console.log('✅ Tabla cuenta_corriente creada');

        // 5. Crear tabla de comprobantes de pago (para sistema bidireccional)
        console.log('📄 Creando tabla copig.comprobantes_pago...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.comprobantes_pago (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                periodo_pago VARCHAR(10),
                monto DECIMAL(12,2),
                fecha_pago DATE,
                banco VARCHAR(100),
                numero_operacion VARCHAR(50),
                archivo_pdf VARCHAR(255),
                estado VARCHAR(20) DEFAULT 'PENDIENTE',
                observaciones TEXT,
                aprobado_por INTEGER REFERENCES copig.admin_users(id),
                fecha_aprobacion TIMESTAMP,
                fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`);
        
        await client.query(`CREATE INDEX IF NOT EXISTS idx_comprobantes_profesional ON copig.comprobantes_pago(profesional_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_comprobantes_estado ON copig.comprobantes_pago(estado)`);
        console.log('✅ Tabla comprobantes_pago creada');

        // 6. Crear tabla de conceptos de pago
        console.log('📋 Creando tabla copig.conceptos_pago...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.conceptos_pago (
                id SERIAL PRIMARY KEY,
                codigo VARCHAR(20) UNIQUE NOT NULL,
                descripcion VARCHAR(200) NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                monto_base DECIMAL(12,2),
                vigente BOOLEAN DEFAULT TRUE,
                fecha_vigencia_desde DATE,
                fecha_vigencia_hasta DATE,
                observaciones TEXT
            )`);
        console.log('✅ Tabla conceptos_pago creada');

        // Insertar conceptos básicos
        await client.query(`
            INSERT INTO copig.conceptos_pago (codigo, descripcion, tipo, monto_base, vigente) VALUES
            ('CUOTA_MENSUAL', 'Cuota Mensual Colegiatura', 'CUOTA_MENSUAL', 5000.00, true),
            ('MATRICULA_ANUAL', 'Matrícula Anual', 'MATRICULA_ANUAL', 15000.00, true),
            ('CERT_ENCOMIENDA', 'Certificado de Encomienda', 'CERTIFICADO', 2500.00, true),
            ('CERT_HABILITACION', 'Certificado de Habilitación', 'CERTIFICADO', 1500.00, true),
            ('MULTA_MORA', 'Multa por Mora', 'MULTA', 0.00, true)
            ON CONFLICT (codigo) DO NOTHING
        `);
        console.log('✅ Conceptos de pago insertados');

        // 7. Crear función para actualizar cuenta corriente
        console.log('🔧 Creando funciones y triggers...');
        await client.query(`
            CREATE OR REPLACE FUNCTION copig.actualizar_cuenta_corriente_pago()
            RETURNS TRIGGER AS $$
            BEGIN
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
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        `);

        // Crear trigger
        await client.query(`
            DROP TRIGGER IF EXISTS trigger_actualizar_cuenta_pago ON copig.pagos
        `);
        
        await client.query(`
            CREATE TRIGGER trigger_actualizar_cuenta_pago
            AFTER INSERT ON copig.pagos
            FOR EACH ROW
            EXECUTE FUNCTION copig.actualizar_cuenta_corriente_pago()
        `);
        console.log('✅ Funciones y triggers creados');

        // 8. Crear vista de estado financiero
        console.log('👁️ Creando vistas...');
        await client.query(`
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
            LEFT JOIN copig.cuenta_corriente cc ON p.id = cc.profesional_id
        `);
        console.log('✅ Vista estado_financiero creada');

        // Verificar tablas creadas
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name IN ('pagos', 'restricciones', 'sanciones', 'cuenta_corriente', 'comprobantes_pago', 'conceptos_pago')
            ORDER BY table_name
        `);

        console.log('\n✅ SISTEMA FINANCIERO CREADO EXITOSAMENTE');
        console.log('📊 Tablas creadas:');
        result.rows.forEach(row => {
            console.log(`   - copig.${row.table_name}`);
        });

        // Estadísticas
        console.log('\n📈 PREPARADO PARA IMPORTAR:');
        console.log('   - 124,277 pagos de SPPAGOS.DBF');
        console.log('   - 215,720 pagos de archivos PAGO*.DBF');
        console.log('   - 3,561 restricciones de SPRESTRI.DBF');
        console.log('   - 643 sanciones de SANCION.DBF');
        console.log('   TOTAL: ~344,201 registros financieros');

    } catch (error) {
        console.error('❌ Error creando sistema financiero:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Ejecutar
createFinancialTables()
    .then(() => {
        console.log('\n✅ Proceso completado exitosamente');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });