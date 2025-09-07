const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function fixEstadoCheckConstraint() {
    try {
        console.log('🔧 ACTUALIZANDO RESTRICCIÓN CHECK DE ESTADOS...');
        console.log('════════════════════════════════════════════════════════');
        
        // Eliminar la restricción existente
        console.log('🗑️  Eliminando restricción CHECK antigua...');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
        `);
        
        console.log('✅ Restricción antigua eliminada');
        
        // Crear nueva restricción con todos los estados necesarios
        console.log('➕ Creando nueva restricción CHECK con todos los estados...');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (
                'PENDIENTE',
                'PENDIENTE_PAGO',
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
        
        console.log('✅ Nueva restricción CHECK creada');
        
        // Verificar la nueva restricción
        const result = await pool.query(`
            SELECT conname, pg_get_constraintdef(oid) as definition 
            FROM pg_constraint 
            WHERE conname = 'solicitudes_chp_estado_check'
        `);
        
        console.log('\n📊 NUEVA RESTRICCIÓN:');
        console.table(result.rows);
        
        console.log('\n✅ ESTADOS PERMITIDOS AHORA:');
        console.log('• PENDIENTE - Estado inicial');
        console.log('• PENDIENTE_PAGO - Requiere pago');
        console.log('• EN_REVISION - Staff revisando');
        console.log('• ESPERANDO_PAGO - Factura generada');
        console.log('• PAGO_VERIFICADO - Pago confirmado');
        console.log('• LISTO_EMITIR - Listo para emitir CHP');
        console.log('• APROBADO - Solicitud aprobada');
        console.log('• RECHAZADO - Solicitud rechazada');
        console.log('• EMITIDO - CHP emitido');
        console.log('• OBSERVADO - Con observaciones');
        
        await pool.end();
        console.log('\n🎉 RESTRICCIÓN ACTUALIZADA EXITOSAMENTE');
        
    } catch (error) {
        console.error('❌ Error actualizando restricción:', error.message);
        await pool.end();
        process.exit(1);
    }
}

fixEstadoCheckConstraint();