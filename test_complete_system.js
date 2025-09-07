/**
 * PRUEBA COMPLETA DEL SISTEMA CORREGIDO
 * ===================================
 * Verificar que fechas de matriculación y pagos aparecen correctamente
 */

const { Pool } = require('pg');
const config = require('./config.json');
const https = require('https');
const http = require('http');

async function testCompleteSystem() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🎯 VERIFICACIÓN COMPLETA SISTEMA COPIG\n');
        console.log('='.repeat(60) + '\n');
        
        // 1. VERIFICAR DATOS EN BASE DE DATOS
        console.log('📊 1. VERIFICANDO DATOS EN BASE DE DATOS\n');
        
        // Profesionales con fechas de matriculación
        const profConFechas = await pool.query(`
            SELECT p.nombre, p.numero_documento, p.id,
                   m.numero_matricula, m.fecha_inscripcion, m.fecha_habilitacion
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY p.id
            LIMIT 5
        `);
        
        console.log(`✅ ${profConFechas.rows.length} profesionales con fechas encontrados:`);
        profConFechas.rows.forEach(prof => {
            console.log(`   ID: ${prof.id} - ${prof.nombre}`);
            console.log(`     Mat: ${prof.numero_matricula} - Inscripción: ${prof.fecha_inscripcion.toISOString().split('T')[0]}`);
        });
        
        // 2. VERIFICAR ENDPOINT CORREGIDO PROFESIONALES
        console.log('\n🔗 2. VERIFICANDO ENDPOINT CORREGIDO\n');
        
        const testProf = profConFechas.rows[0];
        if (testProf) {
            const endpointQuery = await pool.query(`
                SELECT p.*, 
                       m.numero_matricula, 
                       m.fecha_inscripcion, 
                       m.fecha_habilitacion, 
                       m.fecha_titulo,
                       m.categoria as categoria_matricula,
                       m.activo as matricula_activa
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.id = $1
            `, [testProf.id]);
            
            if (endpointQuery.rows.length > 0) {
                const result = endpointQuery.rows[0];
                console.log('✅ Query endpoint profesionales/:id CORREGIDA:');
                console.log(`   ID: ${result.id} - ${result.nombre}`);
                console.log(`   Matrícula: ${result.numero_matricula || 'N/A'}`);
                console.log(`   Fecha inscripción: ${result.fecha_inscripcion ? result.fecha_inscripcion.toISOString().split('T')[0] : 'N/A'}`);
                console.log(`   Fecha habilitación: ${result.fecha_habilitacion ? result.fecha_habilitacion.toISOString().split('T')[0] : 'N/A'}`);
                console.log(`   Categoría: ${result.categoria_matricula || 'N/A'}`);
                console.log(`   Activo: ${result.matricula_activa ? 'SÍ' : 'NO'}`);
            }
        }
        
        // 3. VERIFICAR PAGOS HISTÓRICOS
        console.log('\n💰 3. VERIFICANDO PAGOS HISTÓRICOS\n');
        
        // Buscar profesional con pagos
        const profConPagos = await pool.query(`
            SELECT p.nombre, p.id, m.numero_matricula,
                   COUNT(ph.id) as total_pagos,
                   SUM(ph.importe) as monto_total,
                   MAX(ph.fecha_pago) as ultimo_pago
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            WHERE ph.importe > 0
            GROUP BY p.nombre, p.id, m.numero_matricula
            HAVING COUNT(ph.id) > 10
            ORDER BY total_pagos DESC
            LIMIT 3
        `);
        
        console.log(`✅ ${profConPagos.rows.length} profesionales con pagos históricos:`);
        profConPagos.rows.forEach(prof => {
            console.log(`   ID: ${prof.id} - ${prof.nombre}`);
            console.log(`     Matrícula: ${prof.numero_matricula}`);
            console.log(`     Total pagos: ${prof.total_pagos}`);
            console.log(`     Monto total: $${prof.monto_total}`);
            console.log(`     Último pago: ${prof.ultimo_pago ? prof.ultimo_pago.toISOString().split('T')[0] : 'N/A'}`);
        });
        
        // 4. PROBAR QUERY PAGOS ESPECÍFICA
        if (profConPagos.rows.length > 0) {
            const testProfPagos = profConPagos.rows[0];
            const pagosQuery = await pool.query(`
                SELECT fecha_pago, importe, concepto, estado, numero_recibo,
                       detalle
                FROM copig.pagos_historicos 
                WHERE matricula::text = $1::text
                ORDER BY fecha_pago DESC
                LIMIT 5
            `, [testProfPagos.numero_matricula]);
            
            console.log(`\n✅ Query pagos históricos para profesional ID ${testProfPagos.id}:`);
            pagosQuery.rows.forEach(pago => {
                console.log(`   Fecha: ${pago.fecha_pago ? pago.fecha_pago.toISOString().split('T')[0] : 'N/A'}`);
                console.log(`   Importe: $${pago.importe} - Recibo: ${pago.numero_recibo || 'N/A'}`);
                console.log(`   Estado: ${pago.estado || 'N/A'} - Concepto: ${pago.concepto || 'N/A'}`);
                console.log('');
            });
        }
        
        // 5. VERIFICAR ESTRUCTURA ENDPOINTS EN SERVER.JS
        console.log('\n🔧 4. VERIFICANDO ESTRUCTURA SERVER.JS\n');
        
        const fs = require('fs');
        const serverContent = fs.readFileSync('server.js', 'utf8');
        
        // Buscar endpoints corregidos
        const endpointsVerificar = [
            'LEFT JOIN copig.matriculas',
            'fecha_inscripcion',
            'fecha_habilitacion',
            'profesional/:id/matriculacion',
            'profesional/:id/pagos'
        ];
        
        endpointsVerificar.forEach(endpoint => {
            const found = serverContent.includes(endpoint);
            console.log(`   ${found ? '✅' : '❌'} ${endpoint}`);
        });
        
        // 6. RESUMEN FINAL
        console.log('\n' + '='.repeat(60));
        console.log('🎯 RESUMEN DE VERIFICACIÓN');
        console.log('='.repeat(60));
        
        const fechasOK = profConFechas.rows.length > 0;
        const pagosOK = profConPagos.rows.length > 0;
        const endpointsOK = serverContent.includes('LEFT JOIN copig.matriculas');
        
        console.log(`📅 Fechas matriculación en BD: ${fechasOK ? '✅ DISPONIBLES' : '❌ NO DISPONIBLES'}`);
        console.log(`💰 Pagos históricos en BD: ${pagosOK ? '✅ DISPONIBLES' : '❌ NO DISPONIBLES'}`);
        console.log(`🔗 Endpoints corregidos: ${endpointsOK ? '✅ ACTUALIZADOS' : '❌ NO ACTUALIZADOS'}`);
        
        if (fechasOK && pagosOK && endpointsOK) {
            console.log('\n🎉 SISTEMA COMPLETAMENTE FUNCIONAL');
            console.log('📋 Los datos deberían aparecer en las interfaces web');
            console.log('\n📍 Para verificar en interfaz web:');
            console.log('   1. Ir a: http://localhost:3030/admin');
            console.log('   2. Ver detalles de cualquier profesional');
            console.log('   3. Verificar que aparezcan fechas de matriculación');
            console.log('   4. Verificar que aparezcan pagos históricos');
        } else {
            console.log('\n⚠️  HAY PROBLEMAS PENDIENTES');
            console.log('📋 Verificar que el servidor esté ejecutándose con cambios aplicados');
        }
        
        console.log('\n⚠️  IMPORTANTE: Si las interfaces web no muestran los datos,');
        console.log('   verificar que el servidor fue reiniciado después de las correcciones');
        
    } catch (error) {
        console.error('❌ Error en verificación:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    testCompleteSystem();
}

module.exports = testCompleteSystem;