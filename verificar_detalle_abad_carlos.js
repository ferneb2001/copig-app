const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarDetalleABAD() {
    try {
        console.log('🔍 VERIFICAR DETALLE ABAD, CARLOS ADRIAN\n');
        
        // 1. Obtener ID de ABAD, CARLOS ADRIAN
        const profesionalId = await pool.query(`
            SELECT id FROM copig.profesionales 
            WHERE numero_documento = 17086342
        `);
        
        if (profesionalId.rows.length === 0) {
            console.log('❌ ABAD, CARLOS ADRIAN no encontrado');
            return;
        }
        
        const id = profesionalId.rows[0].id;
        console.log(`ID de ABAD, CARLOS ADRIAN: ${id}`);
        
        // 2. Simular exactamente lo que devuelve el endpoint de detalle
        console.log('\n=== SIMULANDO ENDPOINT /api/admin/profesionales/:id ===');
        const result = await pool.query(`
            SELECT 
                ve.*,
                p.sexo,
                p.estado_civil,
                p.nacionalidad,
                p.provincia,
                tp.descripcion as titulo,
                COUNT(ph.id) as total_pagos,
                SUM(ph.importe) as monto_total_pagos
            FROM copig.vista_profesionales_estados ve
            LEFT JOIN copig.profesionales p ON ve.id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
            LEFT JOIN copig.pagos_historicos ph ON ve.numero_matricula::text = ph.matricula::text
            WHERE ve.id = $1
            GROUP BY ve.id, ve.nombre, ve.numero_documento, ve.email, ve.registro_activo,
                     ve.numero_matricula, ve.fecha_inscripcion, ve.fecha_habilitacion,
                     ve.ultimo_pago, ve.dias_sin_pagar, ve.estado_habilitacion,
                     ve.estado_visual, ve.motivo_estado,
                     p.sexo, p.estado_civil, p.nacionalidad, p.provincia, tp.descripcion
        `, [id]);
        
        if (result.rows.length > 0) {
            const prof = result.rows[0];
            console.log('DATOS QUE DEVUELVE EL ENDPOINT:');
            console.log(`  nombre: ${prof.nombre}`);
            console.log(`  numero_documento: ${prof.numero_documento}`);
            console.log(`  numero_matricula: ${prof.numero_matricula}`);
            console.log(`  estado_visual: ${prof.estado_visual}`);
            console.log(`  estado_habilitacion: ${prof.estado_habilitacion}`);
            console.log(`  motivo_estado: ${prof.motivo_estado}`);
            console.log(`  ultimo_pago: ${prof.ultimo_pago}`);
            console.log(`  dias_sin_pagar: ${prof.dias_sin_pagar}`);
            console.log(`  registro_activo: ${prof.registro_activo}`);
            console.log(`  total_pagos: ${prof.total_pagos}`);
            console.log(`  monto_total_pagos: ${prof.monto_total_pagos}`);
            console.log(`  titulo: ${prof.titulo || 'null'}`);
            console.log(`  sexo: ${prof.sexo || 'null'}`);
            console.log(`  nacionalidad: ${prof.nacionalidad || 'null'}`);
            console.log(`  provincia: ${prof.provincia || 'null'}`);
        }
        
        // 3. Verificar cómo el frontend interpreta estos datos
        console.log('\n=== ANÁLISIS FRONTEND ===');
        console.log('El frontend probablemente está calculando el estado incorrectamente');
        console.log('Necesito ver exactamente qué campo usa para mostrar "✅ Al día"');
        
        // 4. Comparar con listado general
        console.log('\n=== COMPARAR CON LISTADO GENERAL ===');
        const listado = await pool.query(`
            SELECT 
                id, 
                numero_matricula as matricula,
                nombre, 
                numero_documento,
                email,
                fecha_inscripcion,
                fecha_habilitacion,
                ultimo_pago,
                estado_visual as estado
            FROM copig.vista_profesionales_estados
            WHERE numero_documento = 17086342
        `);
        
        if (listado.rows.length > 0) {
            const list = listado.rows[0];
            console.log('DATOS EN LISTADO GENERAL:');
            console.log(`  estado: ${list.estado}`);
            console.log(`  ultimo_pago: ${list.ultimo_pago}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

verificarDetalleABAD().catch(console.error);