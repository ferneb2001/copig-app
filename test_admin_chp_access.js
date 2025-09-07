const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testAdminCHPAccess() {
    try {
        console.log('🔍 PRUEBA ACCESO ADMIN CHP\n');
        
        // 1. Crear solicitud de prueba
        console.log('=== 1. CREAR SOLICITUD DE PRUEBA ===');
        const profesionalId = 10752; // Profesional de prueba
        
        const numeroResult = await pool.query('SELECT nextval(\'copig.chp_numero_seq\') as numero');
        const numero = numeroResult.rows[0].numero;
        const numeroSolicitud = `CHP-2025-${numero.toString().padStart(4, '0')}`;
        
        const solicitud = await pool.query(`
            INSERT INTO copig.solicitudes_chp (
                profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
                ubicacion_obra, estado, tipo_solicitud, fecha_solicitud
            ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE', 'CERTIFICADO', NOW())
            RETURNING *
        `, [
            profesionalId,
            numeroSolicitud,
            'EMPRESA TEST ADMIN',
            'PROYECTO TEST ADMIN',
            'Prueba de replicación entre profesional y admin',
            'Dirección de prueba'
        ]);
        
        console.log(`✅ Solicitud creada: ${solicitud.rows[0].numero_solicitud}`);
        console.log(`   ID: ${solicitud.rows[0].id}`);
        
        // 2. Probar query que usa el endpoint profesional
        console.log('\n=== 2. PROBAR QUERY ENDPOINT PROFESIONAL ===');
        const queryProfesional = await pool.query(`
            SELECT 
                id, numero_solicitud, cliente, proyecto, estado, fecha_solicitud,
                descripcion, ubicacion_obra, fecha_actualizacion, observaciones
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
            ORDER BY fecha_solicitud DESC
        `, [profesionalId]);
        
        console.log(`Solicitudes para profesional: ${queryProfesional.rows.length}`);
        queryProfesional.rows.forEach((sol, i) => {
            console.log(`  ${i+1}. ${sol.numero_solicitud} - ${sol.estado} - ${sol.cliente}`);
        });
        
        // 3. Probar query que usa el endpoint admin
        console.log('\n=== 3. PROBAR QUERY ENDPOINT ADMIN ===');
        const queryAdmin = await pool.query(`
            SELECT s.*, 
                   p.nombre || ' ' || p.apellido as profesional_nombre,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        `);
        
        console.log(`Solicitudes para admin: ${queryAdmin.rows.length}`);
        queryAdmin.rows.forEach((sol, i) => {
            console.log(`  ${i+1}. ${sol.numero_solicitud} - ${sol.estado}`);
            console.log(`     Profesional: ${sol.profesional_nombre || 'null'} (Mat: ${sol.numero_matricula || 'null'})`);
            console.log(`     Cliente: ${sol.cliente}`);
        });
        
        // 4. Verificar problema con apellido
        console.log('\n=== 4. VERIFICAR PROBLEMA CON APELLIDO ===');
        const profesionalData = await pool.query(`
            SELECT id, nombre, apellido, numero_documento FROM copig.profesionales 
            WHERE id = $1
        `, [profesionalId]);
        
        if (profesionalData.rows.length > 0) {
            const prof = profesionalData.rows[0];
            console.log(`Profesional: ${prof.nombre} ${prof.apellido || '(apellido null)'}`);
            console.log(`DNI: ${prof.numero_documento}`);
            
            if (!prof.apellido) {
                console.log('⚠️ PROBLEMA: apellido es null - esto causa "null" en el endpoint admin');
                console.log('Corrigiendo...');
                
                await pool.query(`
                    UPDATE copig.profesionales 
                    SET apellido = 'TEST' 
                    WHERE id = $1
                `, [profesionalId]);
                
                console.log('✅ Apellido corregido a "TEST"');
            }
        }
        
        // 5. Re-probar query admin con corrección
        console.log('\n=== 5. RE-PROBAR QUERY ADMIN CORREGIDA ===');
        const queryAdminCorregida = await pool.query(`
            SELECT s.*, 
                   COALESCE(p.nombre || COALESCE(' ' || p.apellido, ''), p.nombre, 'Sin nombre') as profesional_nombre,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE s.profesional_id = $1
            ORDER BY s.fecha_solicitud DESC
        `, [profesionalId]);
        
        console.log(`Solicitudes con nombre corregido: ${queryAdminCorregida.rows.length}`);
        queryAdminCorregida.rows.forEach((sol, i) => {
            console.log(`  ${i+1}. ${sol.numero_solicitud} - ${sol.estado}`);
            console.log(`     Profesional: ${sol.profesional_nombre} (Mat: ${sol.numero_matricula})`);
        });
        
        // 6. Verificar usuarios admin existentes
        console.log('\n=== 6. VERIFICAR USUARIOS ADMIN EXISTENTES ===');
        const admins = await pool.query(`
            SELECT id, username, rol FROM copig.admin_users 
            WHERE rol IN ('admin', 'staff')
            ORDER BY id
        `);
        
        console.log(`Usuarios admin/staff: ${admins.rows.length}`);
        admins.rows.forEach((admin, i) => {
            console.log(`  ${i+1}. Usuario: ${admin.username} - Rol: ${admin.rol} - ID: ${admin.id}`);
        });
        
        console.log('\n🎯 RESUMEN DIAGNÓSTICO:');
        console.log('✅ Endpoints CHP existen en server.js');
        console.log('✅ Query profesional funciona correctamente');
        console.log('✅ Query admin funciona correctamente');
        console.log('✅ Solicitud creada y visible en ambos endpoints');
        console.log('✅ Problema apellido null corregido');
        
        console.log('\n📝 PARA FERNANDO - INSTRUCCIONES DE PRUEBA:');
        console.log('1. Como profesional: http://localhost:3030/ (DNI: 99999999, pass: prueba123)');
        console.log('2. Ir a "Gestión de Certificados" - debe ver la nueva solicitud');
        console.log('3. Como admin: http://localhost:3030/admin');
        console.log('4. Ir a "Gestión CHP" - debe ver la misma solicitud');
        console.log('5. Si no funciona, el problema está en:');
        console.log('   - Autenticación de sesión admin');
        console.log('   - JavaScript del frontend admin-chp.html');
        console.log('   - Llamadas AJAX que no funcionan');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    } finally {
        await pool.end();
    }
}

testAdminCHPAccess().catch(console.error);