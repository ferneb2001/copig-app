#!/usr/bin/env node

/**
 * AGREGAR NUEVOS ESTADOS AL FLUJO CHP
 * Fecha: 2025-09-04
 * Propósito: Agregar los nuevos estados para el flujo completo de CHP
 */

const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function agregarNuevosEstados() {
    try {
        console.log('🔄 Agregando nuevos estados al flujo CHP...');
        
        // 1. Modificar constraint de estado para incluir nuevos estados
        console.log('📝 Actualizando constraint de estados...');
        
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
        `);
        
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (
                'PENDIENTE', 
                'EN_REVISION', 
                'ESPERANDO_PAGO', 
                'PAGO_VERIFICADO', 
                'LISTO_EMITIR',
                'APROBADO', 
                'RECHAZADO', 
                'EMITIDO',
                'OBSERVADO'
            ))
        `);
        
        // 2. Agregar nuevas columnas para el flujo de facturación
        console.log('➕ Agregando columnas para facturación...');
        
        // Verificar si las columnas ya existen antes de agregarlas
        const columnasExistentes = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
        `);
        
        const columnas = columnasExistentes.rows.map(row => row.column_name);
        
        if (!columnas.includes('numero_factura')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN numero_factura VARCHAR(50)
            `);
            console.log('  ✅ Agregada columna: numero_factura');
        }
        
        if (!columnas.includes('fecha_factura')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN fecha_factura TIMESTAMP
            `);
            console.log('  ✅ Agregada columna: fecha_factura');
        }
        
        if (!columnas.includes('arancel_final')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN arancel_final DECIMAL(12,2)
            `);
            console.log('  ✅ Agregada columna: arancel_final');
        }
        
        if (!columnas.includes('comprobante_pago_path')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN comprobante_pago_path VARCHAR(255)
            `);
            console.log('  ✅ Agregada columna: comprobante_pago_path');
        }
        
        if (!columnas.includes('fecha_pago')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN fecha_pago TIMESTAMP
            `);
            console.log('  ✅ Agregada columna: fecha_pago');
        }
        
        if (!columnas.includes('revisado_por')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN revisado_por INTEGER REFERENCES copig.admin_users(id)
            `);
            console.log('  ✅ Agregada columna: revisado_por');
        }
        
        if (!columnas.includes('fecha_revision')) {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN fecha_revision TIMESTAMP
            `);
            console.log('  ✅ Agregada columna: fecha_revision');
        }
        
        // 3. Crear tabla de notificaciones
        console.log('📬 Creando tabla de notificaciones...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.notificaciones_chp (
                id SERIAL PRIMARY KEY,
                solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id),
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                tipo VARCHAR(50) NOT NULL, -- 'FACTURA_GENERADA', 'PAGO_PENDIENTE', 'CHP_LISTO', etc.
                titulo VARCHAR(200) NOT NULL,
                mensaje TEXT NOT NULL,
                leida BOOLEAN DEFAULT FALSE,
                fecha_envio TIMESTAMP DEFAULT NOW(),
                datos_adicionales JSONB -- Para almacenar info extra como número de factura, etc.
            )
        `);
        console.log('  ✅ Tabla notificaciones_chp creada/verificada');
        
        // 4. Crear tabla de facturas CHP
        console.log('📄 Creando tabla de facturas CHP...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.facturas_chp (
                id SERIAL PRIMARY KEY,
                solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id),
                numero_factura VARCHAR(50) UNIQUE NOT NULL,
                monto DECIMAL(12,2) NOT NULL,
                fecha_emision TIMESTAMP DEFAULT NOW(),
                fecha_vencimiento DATE,
                estado VARCHAR(20) DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'PAGADA', 'VENCIDA'
                descripcion TEXT,
                creado_por INTEGER REFERENCES copig.admin_users(id),
                archivo_pdf VARCHAR(255)
            )
        `);
        console.log('  ✅ Tabla facturas_chp creada/verificada');
        
        // 5. Verificar estados actuales
        console.log('📊 Verificando estados actuales de solicitudes...');
        
        const estadosActuales = await pool.query(`
            SELECT estado, COUNT(*) as cantidad 
            FROM copig.solicitudes_chp 
            GROUP BY estado 
            ORDER BY cantidad DESC
        `);
        
        console.log('  Estados actuales:');
        estadosActuales.rows.forEach(row => {
            console.log(`    ${row.estado}: ${row.cantidad} solicitudes`);
        });
        
        console.log('\n🎉 ACTUALIZACIÓN DE ESTADOS COMPLETADA');
        console.log('═══════════════════════════════════════');
        console.log('✅ Nuevos estados agregados al flujo CHP:');
        console.log('   • PENDIENTE → EN_REVISION → ESPERANDO_PAGO');
        console.log('   • PAGO_VERIFICADO → LISTO_EMITIR → EMITIDO');
        console.log('✅ Columnas de facturación agregadas');
        console.log('✅ Tabla de notificaciones creada');
        console.log('✅ Tabla de facturas creada');
        console.log('═══════════════════════════════════════');
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error agregando nuevos estados:', error);
        return { success: false, error: error.message };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    agregarNuevosEstados()
        .then(result => {
            if (result.success) {
                process.exit(0);
            } else {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { agregarNuevosEstados };