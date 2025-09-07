/**
 * IMPLEMENTAR LÓGICA DE ESTADO PROFESIONAL
 * =======================================
 * Implementar estado dinámico basado en pagos realizados
 * Siguiendo lógicas típicas de colegios profesionales argentinos
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function implementProfessionalStatusLogic() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🎯 IMPLEMENTANDO: Lógica de estado profesional dinámico\n');
        console.log('='.repeat(70) + '\n');
        
        // 1. CREAR FUNCIÓN DE ESTADO EN BASE DE DATOS
        console.log('🔧 1. CREANDO FUNCIÓN DE CÁLCULO DE ESTADO\n');
        
        await pool.query(`
            CREATE OR REPLACE FUNCTION calcular_estado_profesional(
                profesional_id INTEGER,
                matricula_numero VARCHAR
            ) RETURNS TABLE (
                estado_habilitacion VARCHAR(20),
                motivo_estado TEXT,
                ultimo_pago DATE,
                dias_sin_pagar INTEGER,
                tiene_restricciones BOOLEAN
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    CASE 
                        -- Al día: Pagó en los últimos 18 meses
                        WHEN MAX(ph.fecha_pago) >= CURRENT_DATE - INTERVAL '18 months' THEN 'HABILITADO'
                        -- Moroso tolerable: Pagó entre 18 meses y 3 años
                        WHEN MAX(ph.fecha_pago) >= CURRENT_DATE - INTERVAL '3 years' THEN 'MOROSO'
                        -- Inhabilitado: Sin pagos por más de 3 años
                        WHEN MAX(ph.fecha_pago) < CURRENT_DATE - INTERVAL '3 years' THEN 'INHABILITADO'
                        -- Sin pagos registrados
                        WHEN MAX(ph.fecha_pago) IS NULL THEN 'SIN_PAGOS'
                        ELSE 'INDEFINIDO'
                    END::VARCHAR(20) as estado_habilitacion,
                    
                    CASE 
                        WHEN MAX(ph.fecha_pago) >= CURRENT_DATE - INTERVAL '18 months' THEN 'Al día con pagos recientes'
                        WHEN MAX(ph.fecha_pago) >= CURRENT_DATE - INTERVAL '3 years' THEN 'Moroso - pagos atrasados'
                        WHEN MAX(ph.fecha_pago) < CURRENT_DATE - INTERVAL '3 years' THEN 'Inhabilitado por morosidad prolongada'
                        WHEN MAX(ph.fecha_pago) IS NULL THEN 'Sin registros de pago'
                        ELSE 'Estado no determinado'
                    END::TEXT as motivo_estado,
                    
                    MAX(ph.fecha_pago) as ultimo_pago,
                    
                    CASE 
                        WHEN MAX(ph.fecha_pago) IS NOT NULL THEN 
                            EXTRACT(DAYS FROM CURRENT_DATE - MAX(ph.fecha_pago))::INTEGER
                        ELSE NULL
                    END as dias_sin_pagar,
                    
                    EXISTS(
                        SELECT 1 FROM copig.restricciones_deudas rd 
                        WHERE rd.matricula = matricula_numero
                    ) as tiene_restricciones
                    
                FROM copig.pagos_historicos ph
                WHERE ph.matricula::text = matricula_numero::text;
                
            END;
            $$ LANGUAGE plpgsql;
        `);
        
        console.log('✅ Función calcular_estado_profesional creada');
        
        // 2. CREAR VISTA CON ESTADOS CALCULADOS
        console.log('📊 2. CREANDO VISTA CON ESTADOS DINÁMICOS\n');
        
        await pool.query(`
            CREATE OR REPLACE VIEW copig.vista_profesionales_con_estado AS
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                p.email,
                p.activo as registro_activo,
                m.numero_matricula,
                m.fecha_inscripcion,
                m.fecha_habilitacion,
                -- Estado calculado dinámicamente
                estado.estado_habilitacion,
                estado.motivo_estado,
                estado.ultimo_pago,
                estado.dias_sin_pagar,
                estado.tiene_restricciones,
                -- Estado visual para interfaz
                CASE estado.estado_habilitacion
                    WHEN 'HABILITADO' THEN '🟢 Habilitado'
                    WHEN 'MOROSO' THEN '🟡 Moroso'
                    WHEN 'INHABILITADO' THEN '🔴 Inhabilitado'
                    WHEN 'SIN_PAGOS' THEN '⚫ Sin pagos'
                    ELSE '⚪ Indefinido'
                END as estado_visual
                
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN LATERAL calcular_estado_profesional(p.id, m.numero_matricula::varchar) estado ON true
            WHERE p.activo = true;
        `);
        
        console.log('✅ Vista vista_profesionales_con_estado creada');
        
        // 3. PROBAR LA NUEVA LÓGICA
        console.log('🧪 3. PROBANDO NUEVA LÓGICA DE ESTADOS\n');
        
        const testResults = await pool.query(`
            SELECT 
                estado_habilitacion,
                COUNT(*) as cantidad,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM copig.vista_profesionales_con_estado), 2) as porcentaje
            FROM copig.vista_profesionales_con_estado
            GROUP BY estado_habilitacion
            ORDER BY cantidad DESC
        `);
        
        console.log('📊 Distribución de estados calculados:');
        testResults.rows.forEach(row => {
            console.log(`   ${row.estado_habilitacion}: ${row.cantidad} profesionales (${row.porcentaje}%)`);
        });
        
        // 4. MOSTRAR EJEMPLOS POR CATEGORÍA
        console.log('\n📋 4. EJEMPLOS POR CATEGORÍA\n');
        
        const ejemplos = await pool.query(`
            SELECT 
                nombre,
                numero_matricula,
                estado_visual,
                motivo_estado,
                ultimo_pago,
                dias_sin_pagar
            FROM copig.vista_profesionales_con_estado
            ORDER BY 
                CASE estado_habilitacion
                    WHEN 'HABILITADO' THEN 1
                    WHEN 'MOROSO' THEN 2  
                    WHEN 'INHABILITADO' THEN 3
                    WHEN 'SIN_PAGOS' THEN 4
                    ELSE 5
                END,
                ultimo_pago DESC NULLS LAST
            LIMIT 20
        `);
        
        console.log('Ejemplos de cada estado:');
        ejemplos.rows.forEach(prof => {
            console.log(`   ${prof.estado_visual} - ${prof.nombre} (Mat ${prof.numero_matricula})`);
            console.log(`     ${prof.motivo_estado}`);
            if (prof.ultimo_pago) {
                console.log(`     Último pago: ${prof.ultimo_pago.toISOString().split('T')[0]} (${prof.dias_sin_pagar} días atrás)`);
            }
            console.log('');
        });
        
        // 5. ACTUALIZAR ENDPOINT PARA USAR NUEVA LÓGICA
        console.log('🔄 5. ENDPOINT ACTUALIZACIÓN PREPARADA\n');
        
        console.log('✅ Para actualizar el endpoint, cambiar query por:');
        console.log(`
            SELECT 
                id, numero_matricula as matricula, nombre, numero_documento, 
                email, fecha_inscripcion, fecha_habilitacion, ultimo_pago,
                estado_visual as estado
            FROM copig.vista_profesionales_con_estado
            ORDER BY nombre 
            LIMIT \${limit} OFFSET \${offset}
        `);
        
        console.log('\n' + '='.repeat(70));
        console.log('🎯 IMPLEMENTACIÓN COMPLETADA');
        console.log('='.repeat(70));
        
        console.log('\n✅ NUEVA LÓGICA IMPLEMENTADA:');
        console.log('   🟢 HABILITADO: Pagos en últimos 18 meses');
        console.log('   🟡 MOROSO: Último pago entre 18 meses y 3 años');
        console.log('   🔴 INHABILITADO: Sin pagos por más de 3 años');
        console.log('   ⚫ SIN PAGOS: Nunca registró pagos');
        
        console.log('\n📋 BENEFICIOS:');
        console.log('   - Estado calculado dinámicamente');
        console.log('   - Basado en criterios reales de colegios profesionales');
        console.log('   - Actualización automática según pagos');
        console.log('   - Compatible con interfaz existente');
        
        console.log('\n⚠️  PRÓXIMO PASO:');
        console.log('   Actualizar server.js para usar nueva vista en lugar de tabla profesionales');
        
    } catch (error) {
        console.error('❌ Error implementando lógica:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    implementProfessionalStatusLogic();
}

module.exports = implementProfessionalStatusLogic;