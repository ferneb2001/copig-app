/**
 * AGREGAR ESTADOS FALTANTES CHP - SEGÚN FLUJO PDF
 * ==============================================
 * Estados requeridos por PDF de Fernando:
 * 1. PENDIENTE (existe)
 * 2. EN_REVISION (falta) 
 * 3. ESPERANDO_PAGO (existe)
 * 4. COMPROBANTE_CARGADO (falta)
 * 5. LISTA_PARA_EMITIR (falta)
 * 6. EMITIDO (existe)
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function addMissingCHPStates() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔧 AGREGANDO ESTADOS FALTANTES CHP SEGÚN PDF...\n');
        
        // 1. Verificar estados actuales
        console.log('📋 Estados actuales:');
        const estadosActuales = await pool.query(`
            SELECT DISTINCT estado, COUNT(*) as cantidad
            FROM copig.solicitudes_chp 
            GROUP BY estado 
            ORDER BY cantidad DESC
        `);
        
        estadosActuales.rows.forEach(est => {
            console.log(`   ✅ ${est.estado}: ${est.cantidad} solicitudes`);
        });
        
        // 2. Definir flujo completo según PDF
        console.log('\n📋 Flujo completo según PDF:');
        const flujoPDF = [
            { estado: 'PENDIENTE', descripcion: 'Profesional envía solicitud sin pago' },
            { estado: 'EN_REVISION', descripcion: 'Personal COPIG revisa y corrige descripción' },
            { estado: 'ESPERANDO_PAGO', descripcion: 'Factura generada, esperando pago' },
            { estado: 'COMPROBANTE_CARGADO', descripcion: 'Profesional subió comprobante de pago' },
            { estado: 'LISTA_PARA_EMITIR', descripcion: 'Pago verificado por COPIG' },
            { estado: 'EMITIDO', descripcion: 'CHP generado y entregado al profesional' }
        ];
        
        flujoPDF.forEach((paso, index) => {
            const existe = estadosActuales.rows.some(e => e.estado === paso.estado);
            console.log(`   ${index + 1}. ${existe ? '✅' : '⭐'} ${paso.estado}: ${paso.descripcion}`);
        });
        
        // 3. Actualizar constraint de estados en BD
        console.log('\n🔧 Actualizando constraint de estados en BD...');
        
        // Primero, eliminar constraint existente si existe
        try {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
            `);
            console.log('   ✅ Constraint anterior eliminado');
        } catch (err) {
            console.log('   ⚠️  Sin constraint anterior:', err.message);
        }
        
        // Crear nuevo constraint con todos los estados
        const estadosPermitidos = flujoPDF.map(f => `'${f.estado}'`).join(', ');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (${estadosPermitidos}))
        `);
        console.log('   ✅ Nuevo constraint creado con 6 estados');
        
        // 4. Crear tabla de flujo de estados para referencia
        console.log('\n📋 Creando tabla de referencia de flujo...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.chp_flujo_estados (
                id SERIAL PRIMARY KEY,
                orden INTEGER NOT NULL,
                estado VARCHAR(30) NOT NULL,
                descripcion TEXT NOT NULL,
                siguiente_estado VARCHAR(30),
                accion_requerida TEXT,
                responsable VARCHAR(20) -- 'PROFESIONAL' o 'COPIG'
            )
        `);
        
        // Limpiar y llenar tabla de flujo
        await pool.query('DELETE FROM copig.chp_flujo_estados');
        
        const flujoDetallado = [
            { orden: 1, estado: 'PENDIENTE', descripcion: 'Profesional envía solicitud sin pago', siguiente: 'EN_REVISION', accion: 'Esperar revisión de COPIG', responsable: 'PROFESIONAL' },
            { orden: 2, estado: 'EN_REVISION', descripcion: 'Personal COPIG revisa y corrige descripción', siguiente: 'ESPERANDO_PAGO', accion: 'Revisar descripción y establecer arancel', responsable: 'COPIG' },
            { orden: 3, estado: 'ESPERANDO_PAGO', descripcion: 'Factura generada, esperando pago', siguiente: 'COMPROBANTE_CARGADO', accion: 'Pagar factura y subir comprobante', responsable: 'PROFESIONAL' },
            { orden: 4, estado: 'COMPROBANTE_CARGADO', descripcion: 'Profesional subió comprobante de pago', siguiente: 'LISTA_PARA_EMITIR', accion: 'Verificar pago', responsable: 'COPIG' },
            { orden: 5, estado: 'LISTA_PARA_EMITIR', descripcion: 'Pago verificado por COPIG', siguiente: 'EMITIDO', accion: 'Aprobar y emitir CHP', responsable: 'COPIG' },
            { orden: 6, estado: 'EMITIDO', descripcion: 'CHP generado y entregado al profesional', siguiente: null, accion: 'Descargar CHP', responsable: 'PROFESIONAL' }
        ];
        
        for (const flujo of flujoDetallado) {
            await pool.query(`
                INSERT INTO copig.chp_flujo_estados 
                (orden, estado, descripcion, siguiente_estado, accion_requerida, responsable)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [flujo.orden, flujo.estado, flujo.descripcion, flujo.siguiente, flujo.accion, flujo.responsable]);
        }
        
        console.log('   ✅ Tabla de flujo creada con 6 estados');
        
        // 5. Agregar columnas faltantes si no existen
        console.log('\n🔧 Verificando columnas requeridas por PDF...');
        
        const columnasFaltantes = [
            { nombre: 'descripcion_original', tipo: 'TEXT', descripcion: 'Descripción inicial del profesional' },
            { nombre: 'fecha_inicio_revision', tipo: 'TIMESTAMP', descripcion: 'Cuándo COPIG empezó revisión' },
            { nombre: 'fecha_fin_revision', tipo: 'TIMESTAMP', descripcion: 'Cuándo COPIG terminó revisión' },
            { nombre: 'factura_url', tipo: 'VARCHAR(500)', descripcion: 'URL o ID de factura generada' },
            { nombre: 'pago_verificado', tipo: 'BOOLEAN DEFAULT FALSE', descripcion: 'Si COPIG verificó el pago' },
            { nombre: 'notificacion_enviada', tipo: 'BOOLEAN DEFAULT FALSE', descripcion: 'Si se notificó al profesional' }
        ];
        
        for (const col of columnasFaltantes) {
            try {
                await pool.query(`
                    ALTER TABLE copig.solicitudes_chp 
                    ADD COLUMN IF NOT EXISTS ${col.nombre} ${col.tipo}
                `);
                console.log(`   ✅ ${col.nombre}: ${col.descripcion}`);
            } catch (err) {
                console.log(`   ⚠️  ${col.nombre}: ${err.message}`);
            }
        }
        
        // 6. Verificación final
        console.log('\n🔍 Verificación final de estados...');
        const verificacion = await pool.query(`
            SELECT * FROM copig.chp_flujo_estados ORDER BY orden
        `);
        
        console.log('📋 Flujo de estados implementado:');
        verificacion.rows.forEach(row => {
            console.log(`   ${row.orden}. ${row.estado} → ${row.siguiente_estado || 'FIN'}`);
            console.log(`      ${row.descripcion}`);
            console.log(`      Responsable: ${row.responsable}`);
            console.log('');
        });
        
        console.log('✅ ESTADOS CHP ACTUALIZADOS SEGÚN PDF EXITOSAMENTE');
        
    } catch (error) {
        console.log('❌ Error agregando estados:', error.message);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    addMissingCHPStates();
}

module.exports = addMissingCHPStates;