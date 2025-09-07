/**
 * PROBAR ENDPOINTS CORREGIDOS
 * ===========================
 * Probar que los nuevos endpoints devuelvan fechas y pagos correctamente
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function testFixedEndpoints() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🧪 PROBANDO ENDPOINTS CORREGIDOS\n');
        console.log('=' .repeat(50) + '\n');
        
        // 1. PROBAR CONSULTA FECHAS MATRICULACIÓN (simulando endpoint)
        console.log('📅 1. PROBANDO FECHAS DE MATRICULACIÓN\n');
        
        const matriculacionTest = await pool.query(`
            SELECT p.nombre, p.numero_documento,
                   m.numero_matricula, 
                   m.fecha_inscripcion, 
                   m.fecha_habilitacion, 
                   m.fecha_titulo,
                   m.categoria,
                   m.activo as matricula_activa
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY p.nombre
            LIMIT 5
        `);
        
        console.log(`✅ ${matriculacionTest.rows.length} profesionales con fechas encontrados:`);
        matriculacionTest.rows.forEach(prof => {
            console.log(`   ${prof.nombre} (DNI: ${prof.numero_documento})`);
            console.log(`     Matrícula: ${prof.numero_matricula}`);
            console.log(`     Inscripción: ${prof.fecha_inscripcion ? prof.fecha_inscripcion.toISOString().split('T')[0] : 'N/A'}`);
            console.log(`     Habilitación: ${prof.fecha_habilitacion ? prof.fecha_habilitacion.toISOString().split('T')[0] : 'N/A'}`);
            console.log(`     Título: ${prof.fecha_titulo ? prof.fecha_titulo.toISOString().split('T')[0] : 'N/A'}`);
            console.log('');
        });
        
        // 2. PROBAR CONSULTA PAGOS HISTÓRICOS (simulando endpoint)
        console.log('💰 2. PROBANDO PAGOS HISTÓRICOS\n');
        
        // Primero verificar estructura de tabla pagos_historicos
        const estructuraPagos = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `);
        
        console.log('🔍 Estructura tabla pagos_historicos:');
        estructuraPagos.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type}`);
        });
        
        // Probar consulta pagos con estructura correcta
        const pagosTest = await pool.query(`
            SELECT matricula, fecha_pago, importe, concepto, estado
            FROM copig.pagos_historicos 
            WHERE importe > 0
            ORDER BY fecha_pago DESC
            LIMIT 10
        `);
        
        console.log(`\n✅ ${pagosTest.rows.length} pagos históricos encontrados:`);
        pagosTest.rows.forEach(pago => {
            console.log(`   Mat ${pago.matricula}: $${pago.importe} - ${pago.fecha_pago ? pago.fecha_pago.toISOString().split('T')[0] : 'Sin fecha'}`);
            console.log(`     Concepto: ${pago.concepto || 'N/A'} - Estado: ${pago.estado || 'N/A'}`);
        });
        
        // 3. PROBAR VINCULACIÓN PAGOS-PROFESIONALES
        console.log('\n🔗 3. PROBANDO VINCULACIÓN PAGOS-PROFESIONALES\n');
        
        const vinculacionTest = await pool.query(`
            SELECT p.nombre, p.numero_documento, m.numero_matricula,
                   COUNT(ph.id) as total_pagos,
                   SUM(ph.importe) as monto_total,
                   MAX(ph.fecha_pago) as ultimo_pago
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE ph.importe > 0
            GROUP BY p.nombre, p.numero_documento, m.numero_matricula
            ORDER BY total_pagos DESC
            LIMIT 5
        `);
        
        console.log(`✅ ${vinculacionTest.rows.length} profesionales con pagos vinculados:`);
        vinculacionTest.rows.forEach(prof => {
            console.log(`   ${prof.nombre} (Mat ${prof.numero_matricula}):`);
            console.log(`     Total pagos: ${prof.total_pagos}`);
            console.log(`     Monto total: $${prof.monto_total}`);
            console.log(`     Último pago: ${prof.ultimo_pago ? prof.ultimo_pago.toISOString().split('T')[0] : 'N/A'}`);
            console.log('');
        });
        
        // 4. ESTADÍSTICAS GENERALES
        console.log('📊 4. ESTADÍSTICAS GENERALES\n');
        
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.profesionales) as total_profesionales,
                (SELECT COUNT(*) FROM copig.matriculas WHERE fecha_inscripcion IS NOT NULL) as profesionales_con_fecha,
                (SELECT COUNT(DISTINCT matricula) FROM copig.pagos_historicos) as profesionales_con_pagos,
                (SELECT COUNT(*) FROM copig.pagos_historicos WHERE importe > 0) as total_pagos_validos,
                (SELECT SUM(importe) FROM copig.pagos_historicos WHERE importe > 0) as monto_total_pagos
        `);
        
        const s = stats.rows[0];
        console.log('📋 Resumen del sistema:');
        console.log(`   Total profesionales: ${s.total_profesionales}`);
        console.log(`   Con fechas matriculación: ${s.profesionales_con_fecha} (${Math.round(s.profesionales_con_fecha/s.total_profesionales*100)}%)`);
        console.log(`   Con pagos históricos: ${s.profesionales_con_pagos}`);
        console.log(`   Total pagos válidos: ${s.total_pagos_validos}`);
        console.log(`   Monto total pagos: $${s.monto_total_pagos || 0}`);
        
        console.log('\n' + '='.repeat(50));
        console.log('🎯 RESULTADO PRUEBAS');
        console.log('='.repeat(50));
        
        const fechasOK = matriculacionTest.rows.length > 0;
        const pagosOK = pagosTest.rows.length > 0;
        const vinculacionOK = vinculacionTest.rows.length > 0;
        
        console.log(`📅 Fechas matriculación: ${fechasOK ? '✅ FUNCIONAN' : '❌ NO FUNCIONAN'}`);
        console.log(`💰 Pagos históricos: ${pagosOK ? '✅ FUNCIONAN' : '❌ NO FUNCIONAN'}`);
        console.log(`🔗 Vinculación pagos-profesionales: ${vinculacionOK ? '✅ FUNCIONA' : '❌ NO FUNCIONA'}`);
        
        if (fechasOK && pagosOK && vinculacionOK) {
            console.log('\n🎉 TODAS LAS CONSULTAS FUNCIONAN CORRECTAMENTE');
            console.log('📋 Los endpoints corregidos deberían mostrar los datos');
        } else {
            console.log('\n⚠️  HAY PROBLEMAS EN ALGUNAS CONSULTAS');
            console.log('📋 Revisar estructura de datos o consultas');
        }
        
        console.log('\n⚠️  RECORDATORIO: Reiniciar servidor para que los cambios tomen efecto');
        
    } catch (error) {
        console.error('❌ Error en pruebas:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    testFixedEndpoints();
}

module.exports = testFixedEndpoints;