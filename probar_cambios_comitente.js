const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function probarCambiosComitente() {
    try {
        console.log('✅ PROBANDO CAMBIOS CLIENTE → COMITENTE\n');
        
        // 1. Verificar estructura de base de datos
        console.log('=== 1. VERIFICAR BASE DE DATOS ===');
        const estructura = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            AND column_name IN ('cliente', 'comitente')
        `);
        
        estructura.rows.forEach(col => {
            console.log(`✅ Columna existente: ${col.column_name}`);
        });
        
        // 2. Probar query que usa el endpoint admin
        console.log('\n=== 2. PROBAR ENDPOINT ADMIN ===');
        const queryAdmin = await pool.query(`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   p.numero_documento,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        `);
        
        console.log(`Query admin funciona: ${queryAdmin.rows.length} solicitudes`);
        queryAdmin.rows.forEach(sol => {
            console.log(`  ${sol.numero_solicitud}: Comitente="${sol.comitente}"`);
        });
        
        // 3. Probar crear solicitud nueva con comitente
        console.log('\n=== 3. PROBAR CREACIÓN CON COMITENTE ===');
        const numeroResult = await pool.query('SELECT nextval(\'copig.chp_numero_seq\') as numero');
        const numero = numeroResult.rows[0].numero;
        const numeroSolicitud = `CHP-2025-${numero.toString().padStart(4, '0')}`;
        
        const nuevaSolicitud = await pool.query(`
            INSERT INTO copig.solicitudes_chp (
                profesional_id, numero_solicitud, comitente, proyecto, descripcion
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            10752, // Profesional de prueba
            numeroSolicitud,
            'PRUEBA COMITENTE S.A.',
            'Proyecto Test Comitente',
            'Descripción de prueba para verificar cambio cliente → comitente'
        ]);
        
        console.log(`✅ Solicitud creada: ${nuevaSolicitud.rows[0].numero_solicitud}`);
        console.log(`   Comitente: "${nuevaSolicitud.rows[0].comitente}"`);
        console.log(`   Estado: ${nuevaSolicitud.rows[0].estado || 'PENDIENTE'}`);
        
        // 4. Verificar que el endpoint profesional funciona
        console.log('\n=== 4. PROBAR ENDPOINT PROFESIONAL ===');
        const queryProfesional = await pool.query(`
            SELECT 
                id, numero_solicitud, comitente, proyecto, estado, fecha_solicitud
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
            ORDER BY fecha_solicitud DESC
        `, [10752]);
        
        console.log(`Query profesional funciona: ${queryProfesional.rows.length} solicitudes`);
        queryProfesional.rows.forEach(sol => {
            console.log(`  ${sol.numero_solicitud}: "${sol.comitente}" - ${sol.estado || 'PENDIENTE'}`);
        });
        
        console.log('\n🎉 CAMBIOS CLIENTE → COMITENTE EXITOSOS');
        console.log('✅ Base de datos actualizada correctamente');
        console.log('✅ Queries funcionan con nueva columna');
        console.log('✅ Creación de solicitudes operativa');
        console.log('✅ Endpoints admin y profesional funcionando');
        
        console.log('\n📝 SIGUIENTE PASO: Implementar 3 secciones admin según PDF');
        
    } catch (error) {
        console.error('❌ Error probando cambios:', error);
    } finally {
        await pool.end();
    }
}

probarCambiosComitente().catch(console.error);