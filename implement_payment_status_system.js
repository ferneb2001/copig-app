const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function implementPaymentStatusSystem() {
    try {
        console.log('=== IMPLEMENTANDO SISTEMA DE ESTADOS BASADO EN PAGOS ANUALES ===\n');

        // Crear función SQL para calcular estado del profesional
        console.log('1. Creando función SQL para calcular estado...');
        
        const createFunctionQuery = `
            CREATE OR REPLACE FUNCTION calcular_estado_profesional(p_matricula TEXT)
            RETURNS TEXT AS $$
            DECLARE
                current_year INTEGER;
                payments_current_year INTEGER;
                payments_previous_year INTEGER;
                last_payment_date DATE;
                months_without_payment INTEGER;
                total_amount_current_year DECIMAL;
                expected_annual_amount DECIMAL := 150000; -- Monto anual aproximado basado en análisis
            BEGIN
                current_year := EXTRACT(YEAR FROM CURRENT_DATE);
                
                -- Contar pagos del año actual
                SELECT COUNT(*), COALESCE(SUM(importe), 0)
                INTO payments_current_year, total_amount_current_year
                FROM copig.pagos_historicos 
                WHERE matricula = p_matricula 
                AND EXTRACT(YEAR FROM fecha_pago) = current_year
                AND fecha_pago IS NOT NULL;
                
                -- Contar pagos del año anterior
                SELECT COUNT(*)
                INTO payments_previous_year
                FROM copig.pagos_historicos 
                WHERE matricula = p_matricula 
                AND EXTRACT(YEAR FROM fecha_pago) = current_year - 1
                AND fecha_pago IS NOT NULL;
                
                -- Último pago general
                SELECT MAX(fecha_pago)
                INTO last_payment_date
                FROM copig.pagos_historicos 
                WHERE matricula = p_matricula 
                AND fecha_pago IS NOT NULL;
                
                -- Calcular meses sin pago
                IF last_payment_date IS NOT NULL THEN
                    months_without_payment := EXTRACT(MONTH FROM age(CURRENT_DATE, last_payment_date));
                ELSE
                    months_without_payment := 999; -- Sin pagos nunca
                END IF;
                
                -- LÓGICA DE DETERMINACIÓN DE ESTADO
                
                -- AL DÍA: Pagó este año (1 cuota completa O 3 cuotas)
                IF payments_current_year >= 1 AND total_amount_current_year >= expected_annual_amount * 0.8 THEN
                    RETURN 'AL_DIA';
                END IF;
                
                -- AL DÍA: 3 cuotas parciales este año que sumen el monto esperado
                IF payments_current_year >= 2 AND total_amount_current_year >= expected_annual_amount * 0.7 THEN
                    RETURN 'AL_DIA';
                END IF;
                
                -- MOROSO: Pagó año anterior pero no este año
                IF payments_previous_year > 0 AND payments_current_year = 0 THEN
                    RETURN 'MOROSO';
                END IF;
                
                -- SUSPENDIDO: Más de 18 meses sin pagos
                IF months_without_payment > 18 THEN
                    RETURN 'SUSPENDIDO';
                END IF;
                
                -- MOROSO: Menos de 18 meses pero sin pagos del año actual
                IF payments_current_year = 0 THEN
                    RETURN 'MOROSO';
                END IF;
                
                -- Por defecto
                RETURN 'EN_PROCESO';
                
            END;
            $$ LANGUAGE plpgsql;
        `;
        
        await pool.query(createFunctionQuery);
        console.log('✅ Función SQL creada exitosamente');

        // Probar la función con algunos casos
        console.log('\n2. Probando función con casos reales...');
        
        const testCases = await pool.query(`
            SELECT 
                p.nombre,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_calculado,
                COUNT(ph.id) as total_pagos,
                MAX(ph.fecha_pago) as ultimo_pago,
                SUM(CASE WHEN EXTRACT(YEAR FROM ph.fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 ELSE 0 END) as pagos_este_año,
                SUM(CASE WHEN EXTRACT(YEAR FROM ph.fecha_pago) = EXTRACT(YEAR FROM CURRENT_DATE) THEN ph.importe ELSE 0 END) as monto_este_año
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.activo = true
            GROUP BY p.id, p.nombre, m.numero_matricula
            ORDER BY pagos_este_año DESC, monto_este_año DESC
            LIMIT 15
        `);
        
        console.log('🧪 CASOS DE PRUEBA:');
        testCases.rows.forEach((caso, index) => {
            console.log(`\n   ${index + 1}. ${caso.nombre} (Mat: ${caso.numero_matricula})`);
            console.log(`      Estado calculado: ${caso.estado_calculado}`);
            console.log(`      Total pagos históricos: ${caso.total_pagos}`);
            console.log(`      Pagos este año (2025): ${caso.pagos_este_año}`);
            console.log(`      Monto este año: $${parseFloat(caso.monto_este_año || 0)}`);
            console.log(`      Último pago: ${caso.ultimo_pago ? caso.ultimo_pago.toLocaleDateString('es-AR') : 'Nunca'}`);
        });

        // Estadísticas generales
        console.log('\n3. Generando estadísticas generales...');
        
        const statsQuery = await pool.query(`
            WITH estados AS (
                SELECT 
                    m.numero_matricula,
                    calcular_estado_profesional(m.numero_matricula::TEXT) as estado
                FROM copig.matriculas m
                LEFT JOIN copig.profesionales p ON m.profesional_id = p.id
                WHERE p.activo = true
            )
            SELECT 
                estado,
                COUNT(*) as cantidad,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM estados), 1) as porcentaje
            FROM estados
            GROUP BY estado
            ORDER BY cantidad DESC
        `);
        
        console.log('📊 ESTADÍSTICAS DE ESTADOS:');
        statsQuery.rows.forEach(stat => {
            console.log(`   ${stat.estado}: ${stat.cantidad} profesionales (${stat.porcentaje}%)`);
        });

        console.log('\n4. ✅ SISTEMA DE ESTADOS IMPLEMENTADO EXITOSAMENTE');
        console.log('\nPRÓXIMOS PASOS:');
        console.log('- Actualizar endpoint /api/admin/profesionales para usar calcular_estado_profesional()');
        console.log('- Actualizar frontend para mostrar estados con colores distintivos');
        console.log('- Agregar filtros por estado en interfaz admin');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

implementPaymentStatusSystem();