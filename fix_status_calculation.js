const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixStatusCalculation() {
    console.log('🔧 CORRIGIENDO CÁLCULO DE ESTADOS PROFESIONALES');
    console.log('='.repeat(60));
    
    try {
        // Actualizar función con criterios unificados
        console.log('📝 Actualizando función calcular_estado_profesional...');
        
        await pool.query(`
            CREATE OR REPLACE FUNCTION public.calcular_estado_profesional(p_matricula text)
            RETURNS text
            LANGUAGE plpgsql
            AS $function$
            DECLARE
                current_year INTEGER;
                payments_current_year INTEGER;
                total_amount_current_year DECIMAL;
                expected_annual_amount DECIMAL := 144200; -- Monto unificado
            BEGIN
                current_year := EXTRACT(YEAR FROM CURRENT_DATE);
                
                -- Contar pagos y sumar montos del año actual
                SELECT 
                    COUNT(*), 
                    COALESCE(SUM(importe), 0)
                INTO 
                    payments_current_year, 
                    total_amount_current_year
                FROM copig.pagos_historicos 
                WHERE matricula = p_matricula 
                AND EXTRACT(YEAR FROM fecha_pago) = current_year
                AND fecha_pago IS NOT NULL;
                
                -- LÓGICA UNIFICADA SIMPLIFICADA:
                
                -- AL DÍA: Pagó el monto completo este año
                IF total_amount_current_year >= expected_annual_amount THEN
                    RETURN 'AL_DIA';
                END IF;
                
                -- EN PROCESO: Tiene pagos este año pero no completos
                IF payments_current_year > 0 THEN
                    RETURN 'EN_PROCESO';
                END IF;
                
                -- MOROSO: Sin pagos este año
                RETURN 'MOROSO';
                
            END;
            $function$;
        `);
        
        console.log('✅ Función actualizada con criterios unificados');
        
        // Verificar algunos casos después del cambio
        console.log('\n📊 VERIFICACIÓN POST-CORRECCIÓN:');
        console.log('-'.repeat(40));
        
        const testCases = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_nuevo,
                COALESCE(
                    (SELECT SUM(importe) FROM copig.pagos_historicos 
                     WHERE matricula = m.numero_matricula::TEXT 
                     AND EXTRACT(YEAR FROM fecha_pago) = 2025), 0
                ) as total_2025
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia = 'Mendoza' AND p.activo = true
            ORDER BY p.nombre
            LIMIT 10
        `);
        
        console.log('Estados después de la corrección:');
        testCases.rows.forEach(prof => {
            const estado = prof.total_2025 >= 144200 ? 'AL_DIA' : (prof.total_2025 > 0 ? 'EN_PROCESO' : 'MOROSO');
            const coincide = prof.estado_nuevo === estado ? '✅' : '❌';
            console.log(`${coincide} ${prof.nombre} (${prof.numero_matricula}): ${prof.estado_nuevo} | $${prof.total_2025}`);
        });
        
        // Contar estados actualizados
        console.log('\n📈 RESUMEN DE ESTADOS ACTUALIZADOS:');
        console.log('-'.repeat(40));
        
        const estadosCount = await pool.query(`
            SELECT 
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                COUNT(*) as cantidad
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia = 'Mendoza' AND p.activo = true
            GROUP BY calcular_estado_profesional(m.numero_matricula::TEXT)
            ORDER BY cantidad DESC
        `);
        
        estadosCount.rows.forEach(row => {
            console.log(`   ${row.estado}: ${row.cantidad} profesionales`);
        });
        
        console.log('\n✅ CORRECCIÓN COMPLETADA');
        console.log('Los estados ahora deberían ser consistentes entre listado y detalle');
        
    } catch (error) {
        console.error('❌ Error en corrección:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

fixStatusCalculation()
    .then(() => {
        console.log('\n🎉 Estados profesionales sincronizados correctamente');
        console.log('Verificar en el sistema web que los estados coincidan');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });