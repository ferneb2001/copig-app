#!/usr/bin/env node

/**
 * ACTUALIZACIÓN SISTEMA CHP PARA INTEGRACIÓN ARCA
 * Fecha: 2025-09-04
 * Propósito: Agregar campos y funcionalidad para facturación oficial con ARCA
 */

const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function actualizarSistemaCHPconARCA() {
    try {
        console.log('🔧 ACTUALIZANDO SISTEMA CHP PARA INTEGRACIÓN ARCA');
        console.log('═══════════════════════════════════════════════════════');

        // 1. Agregar campos ARCA a tabla facturas_chp
        console.log('\n📊 PASO 1: Actualizando estructura facturas_chp...');
        
        await pool.query(`
            ALTER TABLE copig.facturas_chp 
            ADD COLUMN IF NOT EXISTS cae VARCHAR(20),
            ADD COLUMN IF NOT EXISTS fecha_vencimiento_cae DATE,
            ADD COLUMN IF NOT EXISTS punto_venta INTEGER DEFAULT 1,
            ADD COLUMN IF NOT EXISTS tipo_comprobante INTEGER DEFAULT 11,
            ADD COLUMN IF NOT EXISTS factura_oficial BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS error_arca TEXT,
            ADD COLUMN IF NOT EXISTS datos_arca JSONB
        `);
        
        console.log('✅ Campos ARCA agregados a facturas_chp');

        // 2. Crear tabla de configuración ARCA
        console.log('\n🏛️ PASO 2: Creando tabla configuración ARCA...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.configuracion_arca (
                id SERIAL PRIMARY KEY,
                cuit_copig VARCHAR(11) NOT NULL,
                razon_social VARCHAR(200) NOT NULL,
                domicilio TEXT,
                condicion_iva VARCHAR(50) DEFAULT 'Exento',
                punto_venta INTEGER DEFAULT 1,
                ambiente VARCHAR(20) DEFAULT 'testing',
                certificado_path VARCHAR(255),
                privatekey_path VARCHAR(255),
                activo BOOLEAN DEFAULT TRUE,
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Insertar configuración base del COPIG
        const configExistente = await pool.query(`
            SELECT COUNT(*) as total FROM copig.configuracion_arca
        `);
        
        if (configExistente.rows[0].total == 0) {
            await pool.query(`
                INSERT INTO copig.configuracion_arca 
                (cuit_copig, razon_social, domicilio, condicion_iva, punto_venta, ambiente)
                VALUES 
                ('30000000007', 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS', 
                 'Dirección del COPIG - Mendoza', 'Exento', 1, 'testing')
            `);
            console.log('✅ Configuración base ARCA insertada');
        } else {
            console.log('✅ Configuración ARCA ya existía');
        }

        // 3. Crear tabla de log de operaciones ARCA
        console.log('\n📋 PASO 3: Creando tabla log ARCA...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.log_arca (
                id SERIAL PRIMARY KEY,
                solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id),
                factura_id INTEGER REFERENCES copig.facturas_chp(id),
                operacion VARCHAR(50) NOT NULL, -- 'AUTH', 'CAE_REQUEST', 'VALIDATE'
                fecha_operacion TIMESTAMP DEFAULT NOW(),
                exitosa BOOLEAN NOT NULL,
                datos_enviados JSONB,
                respuesta_arca JSONB,
                error_mensaje TEXT,
                tiempo_respuesta INTEGER -- en milisegundos
            )
        `);
        
        console.log('✅ Tabla log_arca creada');

        // 4. Actualizar tabla solicitudes_chp con campos ARCA
        console.log('\n📄 PASO 4: Actualizando solicitudes_chp...');
        
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD COLUMN IF NOT EXISTS requiere_factura_oficial BOOLEAN DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS observaciones_arca TEXT
        `);
        
        console.log('✅ Campos ARCA agregados a solicitudes_chp');

        // 5. Crear vista consolidada para facturación
        console.log('\n👁️ PASO 5: Creando vista consolidada...');
        
        await pool.query(`
            CREATE OR REPLACE VIEW copig.vista_facturas_arca AS
            SELECT 
                f.id as factura_id,
                f.numero_factura,
                f.monto,
                f.estado as estado_factura,
                f.cae,
                f.fecha_vencimiento_cae,
                f.punto_venta,
                f.tipo_comprobante,
                f.factura_oficial,
                f.error_arca,
                s.id as solicitud_id,
                s.numero_solicitud,
                s.proyecto,
                s.cliente,
                s.estado as estado_solicitud,
                p.nombre as profesional_nombre,
                p.numero_documento as profesional_dni,
                p.email as profesional_email,
                f.fecha_emision as fecha_factura,
                CASE 
                    WHEN f.factura_oficial = TRUE AND f.cae IS NOT NULL THEN 'OFICIAL_ARCA'
                    WHEN f.factura_oficial = FALSE THEN 'INTERNA_COPIG'
                    ELSE 'PENDIENTE_ARCA'
                END as tipo_factura
            FROM copig.facturas_chp f
            JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            ORDER BY f.fecha_emision DESC
        `);
        
        console.log('✅ Vista consolidada creada');

        // 6. Insertar tipos de comprobante ARCA
        console.log('\n📋 PASO 6: Creando tabla tipos comprobante...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.tipos_comprobante_arca (
                codigo INTEGER PRIMARY KEY,
                descripcion VARCHAR(100) NOT NULL,
                sigla VARCHAR(10),
                activo BOOLEAN DEFAULT TRUE
            )
        `);

        // Insertar tipos principales
        await pool.query(`
            INSERT INTO copig.tipos_comprobante_arca (codigo, descripcion, sigla, activo)
            VALUES 
                (1, 'Factura A', 'FA', true),
                (6, 'Factura B', 'FB', true),
                (11, 'Factura C', 'FC', true),
                (51, 'Factura M', 'FM', true)
            ON CONFLICT (codigo) DO NOTHING
        `);
        
        console.log('✅ Tipos de comprobante ARCA insertados');

        // 7. Verificar integridad del sistema
        console.log('\n🔍 PASO 7: Verificando integridad...');
        
        const verificaciones = [
            { tabla: 'facturas_chp', columna: 'cae' },
            { tabla: 'configuracion_arca', columna: 'cuit_copig' },
            { tabla: 'log_arca', columna: 'operacion' },
            { tabla: 'tipos_comprobante_arca', columna: 'codigo' }
        ];

        for (const ver of verificaciones) {
            const resultado = await pool.query(`
                SELECT COUNT(*) as existe 
                FROM information_schema.columns 
                WHERE table_schema = 'copig' 
                AND table_name = $1 
                AND column_name = $2
            `, [ver.tabla, ver.columna]);
            
            if (resultado.rows[0].existe > 0) {
                console.log(`  ✅ ${ver.tabla}.${ver.columna} existe`);
            } else {
                console.log(`  ❌ ${ver.tabla}.${ver.columna} NO existe`);
            }
        }

        // 8. Resumen de la actualización
        console.log('\n📊 RESUMEN DE ACTUALIZACIÓN:');
        
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.facturas_chp) as facturas_total,
                (SELECT COUNT(*) FROM copig.configuracion_arca) as config_arca,
                (SELECT COUNT(*) FROM copig.tipos_comprobante_arca) as tipos_comprobante,
                (SELECT COUNT(*) FROM copig.solicitudes_chp WHERE requiere_factura_oficial = TRUE) as req_oficial
        `);

        const stat = stats.rows[0];
        console.log(`  📄 Total facturas existentes: ${stat.facturas_total}`);
        console.log(`  ⚙️ Configuraciones ARCA: ${stat.config_arca}`);
        console.log(`  📋 Tipos de comprobante: ${stat.tipos_comprobante}`);
        console.log(`  🏛️ Solicitudes que requieren factura oficial: ${stat.req_oficial || 0}`);

        console.log('\n🎉 ACTUALIZACIÓN ARCA COMPLETADA EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Base de datos preparada para integración ARCA');
        console.log('✅ Sistema puede generar facturas oficiales y no oficiales');
        console.log('✅ Log de operaciones ARCA habilitado');
        console.log('✅ Vista consolidada disponible para reportes');
        console.log('');
        console.log('📝 PRÓXIMOS PASOS:');
        console.log('1. Configurar certificados digitales del COPIG');
        console.log('2. Obtener punto de venta habilitado de ARCA');
        console.log('3. Actualizar CUIT real del COPIG en configuracion_arca');
        console.log('4. Probar integración en ambiente testing de ARCA');

        return { success: true };

    } catch (error) {
        console.error('❌ Error actualizando sistema CHP con ARCA:', error);
        return { success: false, error: error.message };
    }
}

// Ejecutar actualización si se llama directamente
if (require.main === module) {
    actualizarSistemaCHPconARCA()
        .then(result => {
            if (result.success) {
                process.exit(0);
            } else {
                console.error('💥 Actualización falló:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { actualizarSistemaCHPconARCA };