/**
 * CORREGIR ESTADOS EXISTENTES ANTES DE APLICAR NUEVO CONSTRAINT
 * Migrar estados actuales a estados del flujo propuesto
 */

const { Client } = require('pg');
const config = require('./config.json');

async function corregirEstadosExistentes() {
    console.log('🔧 CORRIGIENDO ESTADOS EXISTENTES EN SOLICITUDES CHP...');
    
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // PRIMERO VER QUE ESTADOS EXISTEN ACTUALMENTE
        console.log('🔍 Verificando estados actuales...');
        const estadosActuales = await client.query(`
            SELECT estado, COUNT(*) as cantidad 
            FROM copig.solicitudes_chp 
            GROUP BY estado 
            ORDER BY cantidad DESC
        `);
        
        console.log('📊 Estados encontrados:');
        estadosActuales.rows.forEach(row => {
            console.log(`   ${row.estado}: ${row.cantidad} solicitudes`);
        });
        
        // MIGRAR ESTADOS SEGÚN MAPEO DEL FLUJO PROPUESTO
        console.log('\n🔄 Migrando estados al nuevo flujo...');
        
        // MAPEO DE ESTADOS ANTIGUOS → NUEVOS
        const mapeoEstados = {
            'PENDIENTE': 'PENDIENTE',           // ✅ Ya correcto
            'PENDIENTE_PAGO': 'ESPERANDO_PAGO', // 🔄 Migrar
            'APROBADO': 'EMITIDO',              // 🔄 Migrar (CHP ya emitido)
            'RECHAZADO': 'RECHAZADO',           // ✅ Ya correcto
            'EN_REVISION': 'EN_REVISION',       // ✅ Ya correcto (si existe)
            'OBSERVADO': 'OBSERVADO'            // ✅ Ya correcto (si existe)
        };
        
        // APLICAR MIGRACIONES
        for (const [estadoAntiguo, estadoNuevo] of Object.entries(mapeoEstados)) {
            if (estadoAntiguo !== estadoNuevo) {
                const resultado = await client.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = $1 
                    WHERE estado = $2
                `, [estadoNuevo, estadoAntiguo]);
                
                if (resultado.rowCount > 0) {
                    console.log(`   ✅ ${resultado.rowCount} solicitudes: ${estadoAntiguo} → ${estadoNuevo}`);
                }
            }
        }
        
        // MIGRAR CUALQUIER ESTADO NO CONTEMPLADO A PENDIENTE
        await client.query(`
            UPDATE copig.solicitudes_chp 
            SET estado = 'PENDIENTE' 
            WHERE estado NOT IN (
                'PENDIENTE', 'EN_REVISION', 'ESPERANDO_PAGO', 
                'COMPROBANTE_CARGADO', 'LISTA_PARA_EMITIR', 
                'EMITIDO', 'OBSERVADO', 'RECHAZADO'
            )
        `);
        
        console.log('   ✅ Estados no contemplados migrados a PENDIENTE');
        
        // VERIFICAR RESULTADO
        console.log('\\n🔍 Estados después de migración:');
        const estadosFinales = await client.query(`
            SELECT estado, COUNT(*) as cantidad 
            FROM copig.solicitudes_chp 
            GROUP BY estado 
            ORDER BY cantidad DESC
        `);
        
        estadosFinales.rows.forEach(row => {
            console.log(`   ${row.estado}: ${row.cantidad} solicitudes`);
        });
        
        // AHORA SÍ APLICAR EL CONSTRAINT
        console.log('\\n🔒 Aplicando constraint de estados...');
        
        await client.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check;
            
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (
                'PENDIENTE',           -- Paso 1: Profesional envió, esperando revisión staff
                'EN_REVISION',         -- Paso 2: Staff está revisando y corrigiendo
                'ESPERANDO_PAGO',      -- Paso 3: Factura generada, esperando pago profesional
                'COMPROBANTE_CARGADO', -- Paso 4: Profesional subió comprobante
                'LISTA_PARA_EMITIR',   -- Paso 5: Pago verificado, listo para emitir CHP
                'EMITIDO',             -- Paso 6: CHP emitido y entregado
                'OBSERVADO',           -- Casos especiales: requiere correcciones
                'RECHAZADO'            -- Casos especiales: solicitud rechazada
            ));
        `);
        
        console.log('✅ Constraint aplicado exitosamente');
        
        // AGREGAR COLUMNAS NUEVAS
        console.log('\\n📋 Agregando columnas del nuevo flujo...');
        
        await client.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD COLUMN IF NOT EXISTS descripcion_corregida TEXT,
            ADD COLUMN IF NOT EXISTS arancel_establecido NUMERIC(12,2),
            ADD COLUMN IF NOT EXISTS comprobante_pago_archivo VARCHAR(255),
            ADD COLUMN IF NOT EXISTS fecha_carga_comprobante TIMESTAMP,
            ADD COLUMN IF NOT EXISTS verificado_por INTEGER,
            ADD COLUMN IF NOT EXISTS fecha_verificacion_pago TIMESTAMP;
        `);
        
        console.log('✅ Columnas agregadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// EJECUTAR
if (require.main === module) {
    corregirEstadosExistentes()
        .then(() => {
            console.log('\\n🎉 ESTADOS MIGRADOS EXITOSAMENTE');
            console.log('✅ Ahora se puede aplicar el resto del flujo propuesto');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { corregirEstadosExistentes };