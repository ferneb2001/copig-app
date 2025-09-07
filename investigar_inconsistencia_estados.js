const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarInconsistenciaEstados() {
    try {
        console.log('🔍 INVESTIGANDO INCONSISTENCIA ESTADOS PROFESIONALES\n');
        
        // 1. Verificar ABAD, CARLOS ADRIAN específicamente
        console.log('=== ABAD, CARLOS ADRIAN - ANÁLISIS DETALLADO ===');
        const abad = await pool.query(`
            SELECT 
                ve.*
            FROM copig.vista_profesionales_estados ve
            WHERE ve.numero_documento = 17086342
        `);
        
        if (abad.rows.length > 0) {
            const prof = abad.rows[0];
            console.log(`Nombre: ${prof.nombre}`);
            console.log(`DNI: ${prof.numero_documento}`);
            console.log(`Matrícula: ${prof.numero_matricula}`);
            console.log(`Estado visual: ${prof.estado_visual}`);
            console.log(`Estado habilitación: ${prof.estado_habilitacion}`);
            console.log(`Motivo estado: ${prof.motivo_estado}`);
            console.log(`Último pago: ${prof.ultimo_pago}`);
            console.log(`Días sin pagar: ${prof.dias_sin_pagar}`);
            console.log(`Registro activo: ${prof.registro_activo}`);
        }
        
        // 2. Buscar otros casos con misma inconsistencia
        console.log('\n=== CASOS CON INCONSISTENCIA ===');
        const inconsistentes = await pool.query(`
            SELECT 
                nombre,
                numero_documento,
                numero_matricula,
                estado_visual,
                estado_habilitacion,
                ultimo_pago,
                dias_sin_pagar
            FROM copig.vista_profesionales_estados
            WHERE estado_visual LIKE '%Inhabilitado%'
            AND (ultimo_pago >= CURRENT_DATE - INTERVAL '365 days' OR dias_sin_pagar < 365)
            LIMIT 10
        `);
        
        console.log(`Profesionales "Inhabilitados" pero con pagos recientes: ${inconsistentes.rows.length}`);
        inconsistentes.rows.forEach((prof, i) => {
            console.log(`${i + 1}. ${prof.nombre} (${prof.numero_documento})`);
            console.log(`   Estado: ${prof.estado_visual}`);
            console.log(`   Último pago: ${prof.ultimo_pago}`);
            console.log(`   Días sin pagar: ${prof.dias_sin_pagar}`);
        });
        
        // 3. Estadísticas generales de estados
        console.log('\n=== ESTADÍSTICAS ESTADOS ===');
        const statsEstados = await pool.query(`
            SELECT 
                estado_visual,
                COUNT(*) as total
            FROM copig.vista_profesionales_estados
            GROUP BY estado_visual
            ORDER BY total DESC
        `);
        
        console.log('Distribución de estados:');
        statsEstados.rows.forEach(stat => {
            console.log(`  ${stat.estado_visual}: ${stat.total} profesionales`);
        });
        
        // 4. Verificar lógica de la vista
        console.log('\n=== LÓGICA DE LA VISTA ===');
        console.log('Buscando definición de la vista vista_profesionales_estados...');
        
        const vistaDefinition = await pool.query(`
            SELECT definition 
            FROM pg_views 
            WHERE schemaname = 'copig' 
            AND viewname = 'vista_profesionales_estados'
        `);
        
        if (vistaDefinition.rows.length > 0) {
            console.log('Definición de la vista encontrada:');
            console.log(vistaDefinition.rows[0].definition.substring(0, 500) + '...');
        } else {
            console.log('❌ No se encontró la definición de la vista');
        }
        
        // 5. Verificar criterios específicos
        console.log('\n=== CRITERIOS ACTUALES ===');
        const criterios = await pool.query(`
            SELECT 
                COUNT(CASE WHEN estado_visual LIKE '%Al día%' THEN 1 END) as al_dia,
                COUNT(CASE WHEN estado_visual LIKE '%Inhabilitado%' THEN 1 END) as inhabilitado,
                COUNT(CASE WHEN estado_visual LIKE '%Habilitado%' THEN 1 END) as habilitado,
                COUNT(CASE WHEN ultimo_pago >= CURRENT_DATE - INTERVAL '365 days' THEN 1 END) as pago_reciente,
                COUNT(CASE WHEN dias_sin_pagar > 365 THEN 1 END) as mas_365_dias
            FROM copig.vista_profesionales_estados
        `);
        
        const crit = criterios.rows[0];
        console.log(`Profesionales "Al día": ${crit.al_dia}`);
        console.log(`Profesionales "Inhabilitados": ${crit.inhabilitado}`);
        console.log(`Profesionales "Habilitados": ${crit.habilitado}`);
        console.log(`Con pagos últimos 365 días: ${crit.pago_reciente}`);
        console.log(`Con más de 365 días sin pagar: ${crit.mas_365_dias}`);
        
        // 6. Buscar lógica en archivos originales
        console.log('\n=== DATOS ORIGINALES FOXPRO ===');
        const foxpro = await pool.query(`
            SELECT 
                profesional_dcnro,
                profesional_nombre,
                datos_profesional->>'estado' as estado_original,
                datos_matricula->>'condic' as condicion_matricula
            FROM copig.foxpro_matricula_profesional_map
            WHERE profesional_dcnro = '17086342'
        `);
        
        if (foxpro.rows.length > 0) {
            const fp = foxpro.rows[0];
            console.log(`Estado original FoxPro: ${fp.estado_original}`);
            console.log(`Condición matrícula: ${fp.condicion_matricula}`);
        }
        
        console.log('\n=== RECOMENDACIÓN ===');
        console.log('La inconsistencia sugiere que los criterios para "Al día" e "Inhabilitado" son independientes');
        console.log('Posiblemente: "Al día" = pagos actualizados, "Inhabilitado" = estado registro/sanciones');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

investigarInconsistenciaEstados().catch(console.error);