const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function createPaymentSystemTables() {
    try {
        console.log('🗃️  Creando tablas del sistema de pagos CHP...');

        // 1. Tabla de comprobantes de pago
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.comprobantes_pago (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER NOT NULL,
                solicitud_id INTEGER NOT NULL REFERENCES copig.solicitudes_chp(id) ON DELETE CASCADE,
                metodo_pago VARCHAR(50) NOT NULL, -- 'TRANSFERENCIA', 'TARJETA', 'MERCADOPAGO', 'EFECTIVO'
                monto_pagado DECIMAL(12,2) NOT NULL,
                fecha_pago DATE NOT NULL,
                banco VARCHAR(100),
                numero_operacion VARCHAR(50),
                archivo_comprobante VARCHAR(255), -- nombre del archivo PDF subido
                observaciones TEXT,
                estado VARCHAR(30) DEFAULT 'PENDIENTE_REVISION', -- 'PENDIENTE_REVISION', 'APROBADO', 'RECHAZADO'
                observaciones_staff TEXT,
                fecha_carga TIMESTAMP DEFAULT NOW(),
                fecha_aprobacion TIMESTAMP,
                fecha_revision TIMESTAMP,
                aprobado_por INTEGER, -- id del admin que aprobó
                revisado_por INTEGER -- id del admin que revisó
            );
        `);
        
        console.log('✅ Tabla comprobantes_pago creada');

        // 2. Agregar campos de estado de pago y facturación a solicitudes_chp
        const columnsToAdd = [
            { name: 'estado_facturacion', type: 'VARCHAR(30)', comment: 'Estado de facturación: PENDIENTE, FACTURADA, etc.' },
            { name: 'estado_pago', type: 'VARCHAR(30)', comment: 'Estado de pago: PENDIENTE, COMPROBANTE_SUBIDO, PAGADO' },
            { name: 'numero_factura', type: 'VARCHAR(50)', comment: 'Número de factura generada' },
            { name: 'fecha_facturacion', type: 'TIMESTAMP', comment: 'Fecha cuando se generó la factura oficial' },
            { name: 'observaciones_factura', type: 'TEXT', comment: 'Observaciones adicionales de la factura' }
        ];

        for (const col of columnsToAdd) {
            try {
                const exists = await pool.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_schema = 'copig' 
                        AND table_name = 'solicitudes_chp' 
                        AND column_name = $1
                    );
                `, [col.name]);

                if (!exists.rows[0].exists) {
                    await pool.query(`
                        ALTER TABLE copig.solicitudes_chp 
                        ADD COLUMN ${col.name} ${col.type};
                    `);
                    
                    await pool.query(`
                        COMMENT ON COLUMN copig.solicitudes_chp.${col.name} 
                        IS '${col.comment}';
                    `);
                    
                    console.log(`✅ Columna ${col.name} agregada a solicitudes_chp`);
                } else {
                    console.log(`⚠️  Columna ${col.name} ya existe`);
                }
            } catch (error) {
                console.warn(`⚠️  Error agregando columna ${col.name}:`, error.message);
            }
        }

        // 3. Crear directorio uploads si no existe
        const fs = require('fs');
        const uploadsDir = './uploads/comprobantes';
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        console.log('📁 Directorio uploads/comprobantes creado');

        // 4. Verificar estructura final
        const estructuraResult = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name IN ('solicitudes_chp', 'comprobantes_pago')
            AND column_name IN ('arancel_final', 'monto_obra_estimado', 'estado_facturacion', 'estado_pago', 'numero_factura')
            ORDER BY table_name, column_name;
        `);

        console.log('📊 Estructura del sistema de pagos:');
        console.table(estructuraResult.rows);

        // 5. Verificar que multer esté instalado
        try {
            require('multer');
            console.log('✅ Multer disponible para subida de archivos');
        } catch (error) {
            console.log('⚠️  Multer no instalado - ejecutar: npm install multer');
        }

        console.log('\n🎯 Sistema de pagos CHP listo:');
        console.log('   💰 Profesionales pueden subir comprobantes');
        console.log('   🔍 Staff puede revisar y aprobar/rechazar');
        console.log('   📊 Panel de facturación completo');
        console.log('   💳 Integración con pasarelas de pago');
        console.log('   📁 Almacenamiento seguro de comprobantes');

    } catch (error) {
        console.error('❌ Error creando sistema de pagos:', error);
    } finally {
        await pool.end();
    }
}

createPaymentSystemTables();