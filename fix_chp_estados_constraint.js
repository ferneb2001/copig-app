const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixEstadosConstraint() {
    try {
        console.log('🔧 CORRIGIENDO RESTRICCIONES DE ESTADOS CHP\n');
        
        // 1. Ver constraint actual
        console.log('=== VERIFICAR CONSTRAINT ACTUAL ===');
        const constraints = await pool.query(`
            SELECT conname, consrc 
            FROM pg_constraint 
            WHERE conrelid = 'copig.solicitudes_chp'::regclass 
            AND contype = 'c'
        `);
        
        if (constraints.rows.length > 0) {
            console.log('Constraints actuales:');
            constraints.rows.forEach(con => {
                console.log(`  ${con.conname}: ${con.consrc}`);
            });
        }
        
        // 2. Ver estados actuales en uso
        console.log('\n=== ESTADOS ACTUALES EN USO ===');
        const estadosEnUso = await pool.query(`
            SELECT DISTINCT estado, COUNT(*) as cantidad
            FROM copig.solicitudes_chp
            GROUP BY estado
            ORDER BY cantidad DESC
        `);
        
        console.log('Estados encontrados en la tabla:');
        estadosEnUso.rows.forEach(est => {
            console.log(`  ${est.estado}: ${est.cantidad} solicitudes`);
        });
        
        // 3. Eliminar constraint existente si existe
        console.log('\n=== ELIMINAR CONSTRAINT PROBLEMÁTICO ===');
        try {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
            `);
            console.log('✅ Constraint eliminado');
        } catch (error) {
            console.log('❌ Error eliminando constraint:', error.message);
        }
        
        // 4. Agregar nuevo constraint con todos los estados posibles
        console.log('\n=== AGREGAR NUEVO CONSTRAINT ===');
        try {
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD CONSTRAINT solicitudes_chp_estado_check 
                CHECK (estado IN (
                    'PENDIENTE', 'APROBADO', 'RECHAZADO', 'EMITIDO', 
                    'ESPERANDO_PAGO', 'PAGADO', 'CANCELADO', 'EN_REVISION',
                    'REQUIERE_CORRECCION', 'CORREGIDO', 'FACTURADO',
                    'VENCIDO', 'REEMITIDO'
                ))
            `);
            console.log('✅ Nuevo constraint agregado con todos los estados posibles');
        } catch (error) {
            console.log('❌ Error agregando constraint:', error.message);
        }
        
        // 5. Verificar que funciona
        console.log('\n=== PROBAR ACTUALIZACIÓN ===');
        try {
            // Buscar una solicitud para probar
            const solicitudPrueba = await pool.query(`
                SELECT id FROM copig.solicitudes_chp 
                WHERE estado = 'PENDIENTE' 
                LIMIT 1
            `);
            
            if (solicitudPrueba.rows.length > 0) {
                const idPrueba = solicitudPrueba.rows[0].id;
                
                await pool.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = 'APROBADO', fecha_actualizacion = NOW()
                    WHERE id = $1
                `, [idPrueba]);
                
                console.log(`✅ Solicitud ${idPrueba} actualizada a APROBADO exitosamente`);
                
                // Volver al estado original
                await pool.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = 'PENDIENTE', fecha_actualizacion = NOW()
                    WHERE id = $1
                `, [idPrueba]);
                
                console.log(`✅ Solicitud ${idPrueba} revertida a PENDIENTE`);
            }
        } catch (error) {
            console.log('❌ Error en prueba:', error.message);
        }
        
        console.log('\n✅ CORRECCIÓN COMPLETADA');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

fixEstadosConstraint().catch(console.error);