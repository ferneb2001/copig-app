const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixEstadoPendientePago() {
    try {
        console.log('🔧 CORREGIR ESTADO PENDIENTE_PAGO\n');
        
        // 1. Ver estados actuales en uso
        console.log('=== ESTADOS ACTUALES EN BASE DE DATOS ===');
        const estadosActuales = await pool.query(`
            SELECT DISTINCT estado FROM copig.solicitudes_chp ORDER BY estado
        `);
        
        console.log('Estados encontrados:');
        estadosActuales.rows.forEach(est => {
            console.log(`  - ${est.estado}`);
        });
        
        // 2. Eliminar constraint actual
        console.log('\n=== ELIMINAR CONSTRAINT ACTUAL ===');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check
        `);
        console.log('✅ Constraint eliminado');
        
        // 3. Agregar constraint con TODOS los estados posibles incluyendo PENDIENTE_PAGO
        console.log('\n=== AGREGAR CONSTRAINT COMPLETO ===');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (
                'PENDIENTE', 'APROBADO', 'RECHAZADO', 'EMITIDO', 
                'ESPERANDO_PAGO', 'PENDIENTE_PAGO', 'PAGADO', 'CANCELADO', 
                'EN_REVISION', 'REQUIERE_CORRECCION', 'CORREGIDO', 
                'FACTURADO', 'VENCIDO', 'REEMITIDO', 'EN_PROCESO', 
                'VALIDADO', 'COMPLETADO'
            ))
        `);
        console.log('✅ Constraint actualizado con PENDIENTE_PAGO incluido');
        
        // 4. Probar creación con PENDIENTE_PAGO
        console.log('\n=== PROBAR CREACIÓN CON PENDIENTE_PAGO ===');
        try {
            const numeroResult = await pool.query('SELECT nextval(\'copig.chp_numero_seq\') as numero');
            const numero = numeroResult.rows[0].numero;
            const numeroSolicitud = `CHP-2025-${numero.toString().padStart(4, '0')}`;
            
            const testSolicitud = await pool.query(`
                INSERT INTO copig.solicitudes_chp (
                    profesional_id, numero_solicitud, cliente, proyecto, 
                    descripcion, estado, fecha_solicitud
                ) VALUES ($1, $2, $3, $4, $5, 'PENDIENTE_PAGO', NOW())
                RETURNING numero_solicitud, estado
            `, [
                10752, // Profesional de prueba
                numeroSolicitud,
                'TEST PENDIENTE_PAGO',
                'Proyecto prueba estado',
                'Prueba estado PENDIENTE_PAGO'
            ]);
            
            console.log(`✅ Solicitud ${testSolicitud.rows[0].numero_solicitud} creada con estado ${testSolicitud.rows[0].estado}`);
            
            // Eliminar la solicitud de prueba
            await pool.query(`
                DELETE FROM copig.solicitudes_chp 
                WHERE numero_solicitud = $1
            `, [numeroSolicitud]);
            console.log('✅ Solicitud de prueba eliminada');
            
        } catch (error) {
            console.error('❌ Error en prueba:', error.message);
        }
        
        // 5. Verificar qué endpoint está causando PENDIENTE_PAGO
        console.log('\n=== BUSCAR ORIGEN DE PENDIENTE_PAGO ===');
        const fs = require('fs');
        const serverContent = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
        
        if (serverContent.includes('PENDIENTE_PAGO')) {
            console.log('✅ PENDIENTE_PAGO encontrado en server.js');
            const lineas = serverContent.split('\n');
            lineas.forEach((linea, i) => {
                if (linea.includes('PENDIENTE_PAGO')) {
                    console.log(`   Línea ${i + 1}: ${linea.trim()}`);
                }
            });
        } else {
            console.log('❌ PENDIENTE_PAGO NO encontrado en server.js');
        }
        
        // Verificar en portal-profesional.html
        if (fs.existsSync('C:\\copig-app\\portal-profesional.html')) {
            const portalContent = fs.readFileSync('C:\\copig-app\\portal-profesional.html', 'utf8');
            if (portalContent.includes('PENDIENTE_PAGO')) {
                console.log('✅ PENDIENTE_PAGO encontrado en portal-profesional.html');
            }
        }
        
        console.log('\n✅ CORRECCIÓN COMPLETADA');
        console.log('Estado PENDIENTE_PAGO ahora permitido en la base de datos');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

fixEstadoPendientePago().catch(console.error);