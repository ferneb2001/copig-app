/**
 * CORREGIR LÓGICA DE ESTADO PROFESIONAL (SIMPLIFICADA)
 * ===================================================
 * Implementación simplificada de estado dinámico
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function fixProfessionalStatusSimple() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🎯 CORRIGIENDO: Lógica de estado profesional (versión simplificada)\n');
        console.log('='.repeat(70) + '\n');
        
        // 1. CREAR VISTA SIMPLE CON ESTADOS
        console.log('📊 1. CREANDO VISTA SIMPLIFICADA CON ESTADOS\n');
        
        await pool.query(`DROP VIEW IF EXISTS copig.vista_profesionales_estados CASCADE`);
        
        await pool.query(`
            CREATE VIEW copig.vista_profesionales_estados AS
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                p.email,
                p.activo as registro_activo,
                m.numero_matricula,
                m.fecha_inscripcion,
                m.fecha_habilitacion,
                MAX(ph.fecha_pago) as ultimo_pago,
                -- Cálculo de días sin pagar
                CASE 
                    WHEN MAX(ph.fecha_pago) IS NOT NULL THEN 
                        EXTRACT(day FROM NOW() - MAX(ph.fecha_pago))
                    ELSE NULL
                END as dias_sin_pagar,
                -- Estado calculado
                CASE 
                    WHEN MAX(ph.fecha_pago) >= (CURRENT_DATE - INTERVAL '18 months') THEN 'HABILITADO'
                    WHEN MAX(ph.fecha_pago) >= (CURRENT_DATE - INTERVAL '3 years') THEN 'MOROSO'
                    WHEN MAX(ph.fecha_pago) < (CURRENT_DATE - INTERVAL '3 years') THEN 'INHABILITADO'
                    WHEN MAX(ph.fecha_pago) IS NULL THEN 'SIN_PAGOS'
                    ELSE 'INDEFINIDO'
                END as estado_habilitacion,
                -- Estado visual
                CASE 
                    WHEN MAX(ph.fecha_pago) >= (CURRENT_DATE - INTERVAL '18 months') THEN '🟢 Habilitado'
                    WHEN MAX(ph.fecha_pago) >= (CURRENT_DATE - INTERVAL '3 years') THEN '🟡 Moroso'
                    WHEN MAX(ph.fecha_pago) < (CURRENT_DATE - INTERVAL '3 years') THEN '🔴 Inhabilitado'
                    WHEN MAX(ph.fecha_pago) IS NULL THEN '⚫ Sin pagos'
                    ELSE '⚪ Indefinido'
                END as estado_visual,
                -- Motivo del estado
                CASE 
                    WHEN MAX(ph.fecha_pago) >= (CURRENT_DATE - INTERVAL '18 months') THEN 'Al día con pagos recientes'
                    WHEN MAX(ph.fecha_pago) >= (CURRENT_DATE - INTERVAL '3 years') THEN 'Moroso - pagos atrasados'
                    WHEN MAX(ph.fecha_pago) < (CURRENT_DATE - INTERVAL '3 years') THEN 'Inhabilitado por morosidad prolongada'
                    WHEN MAX(ph.fecha_pago) IS NULL THEN 'Sin registros de pago'
                    ELSE 'Estado no determinado'
                END as motivo_estado
                
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE p.activo = true
            GROUP BY p.id, p.nombre, p.numero_documento, p.email, p.activo, 
                     m.numero_matricula, m.fecha_inscripcion, m.fecha_habilitacion
        `);
        
        console.log('✅ Vista vista_profesionales_estados creada');
        
        // 2. PROBAR LA NUEVA VISTA
        console.log('🧪 2. PROBANDO NUEVA VISTA\n');
        
        const testResults = await pool.query(`
            SELECT 
                estado_habilitacion,
                COUNT(*) as cantidad
            FROM copig.vista_profesionales_estados
            GROUP BY estado_habilitacion
            ORDER BY cantidad DESC
        `);
        
        console.log('📊 Distribución de estados:');
        testResults.rows.forEach(row => {
            const total = testResults.rows.reduce((sum, r) => sum + parseInt(r.cantidad), 0);
            const percentage = Math.round((row.cantidad / total) * 100);
            console.log(`   ${row.estado_habilitacion}: ${row.cantidad} profesionales (${percentage}%)`);
        });
        
        // 3. MOSTRAR EJEMPLOS
        console.log('\n📋 3. EJEMPLOS DE CADA ESTADO\n');
        
        const ejemplos = await pool.query(`
            SELECT 
                nombre,
                numero_matricula,
                estado_visual,
                ultimo_pago,
                dias_sin_pagar
            FROM copig.vista_profesionales_estados
            WHERE estado_habilitacion IN ('HABILITADO', 'MOROSO', 'INHABILITADO', 'SIN_PAGOS')
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
        
        let currentState = '';
        ejemplos.rows.forEach(prof => {
            const stateEmoji = prof.estado_visual.split(' ')[0];
            if (currentState !== stateEmoji) {
                currentState = stateEmoji;
                console.log(`\n${prof.estado_visual.split(' ')[1].toUpperCase()}:`);
            }
            
            console.log(`   ${prof.nombre} (Mat ${prof.numero_matricula})`);
            if (prof.ultimo_pago) {
                console.log(`     Último pago: ${prof.ultimo_pago.toISOString().split('T')[0]} (${Math.floor(prof.dias_sin_pagar)} días)`);
            } else {
                console.log(`     Sin pagos registrados`);
            }
        });
        
        console.log('\n' + '='.repeat(70));
        console.log('🎯 VISTA LISTA PARA USAR EN SERVIDOR');
        console.log('='.repeat(70));
        
        console.log('\n✅ CAMBIO REQUERIDO EN server.js:');
        console.log('   Reemplazar query actual por:');
        console.log(`
   SELECT 
       id, numero_matricula as matricula, nombre, numero_documento, 
       email, fecha_inscripcion, fecha_habilitacion, ultimo_pago,
       estado_visual as estado
   FROM copig.vista_profesionales_estados
   ORDER BY nombre 
   LIMIT \${limit} OFFSET \${offset}
        `);
        
        console.log('\n📋 BENEFICIOS IMPLEMENTADOS:');
        console.log('   🟢 Estados calculados dinámicamente según pagos reales');
        console.log('   📊 Diferenciación clara: Habilitado/Moroso/Inhabilitado/Sin pagos');
        console.log('   🔄 Se actualiza automáticamente con nuevos pagos');
        console.log('   🎨 Iconos visuales para interfaz');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    fixProfessionalStatusSimple();
}

module.exports = fixProfessionalStatusSimple;