const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixSimpleConstraint() {
    try {
        console.log('🔧 CORRECCIÓN SIMPLE CONSTRAINT CHP\n');
        
        // 1. Eliminar constraint problemático
        console.log('=== ELIMINAR CONSTRAINT EXISTENTE ===');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
        `);
        console.log('✅ Constraint eliminado');
        
        // 2. Ver estados actuales
        console.log('\n=== ESTADOS ACTUALES ===');
        const estados = await pool.query(`
            SELECT DISTINCT estado FROM copig.solicitudes_chp ORDER BY estado
        `);
        
        console.log('Estados encontrados:');
        estados.rows.forEach(est => {
            console.log(`  - ${est.estado}`);
        });
        
        // 3. Agregar constraint permisivo
        console.log('\n=== AGREGAR CONSTRAINT PERMISIVO ===');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (
                'PENDIENTE', 'APROBADO', 'RECHAZADO', 'EMITIDO', 
                'ESPERANDO_PAGO', 'PAGADO', 'CANCELADO', 'EN_REVISION',
                'REQUIERE_CORRECCION', 'CORREGIDO', 'FACTURADO',
                'VENCIDO', 'REEMITIDO', 'EN_PROCESO', 'VALIDADO'
            ))
        `);
        console.log('✅ Nuevo constraint agregado');
        
        // 4. Probar con actualización simple
        console.log('\n=== PROBAR ACTUALIZACIÓN ===');
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET estado = 'APROBADO' 
            WHERE numero_solicitud = 'CHP-2025-1015'
            RETURNING id, numero_solicitud, estado
        `);
        
        if (result.rows.length > 0) {
            const sol = result.rows[0];
            console.log(`✅ Solicitud ${sol.numero_solicitud} actualizada a ${sol.estado}`);
        }
        
        console.log('\n✅ CORRECCIÓN COMPLETADA - ESTADO APROBADO PERMITE UPDATE');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixSimpleConstraint().catch(console.error);