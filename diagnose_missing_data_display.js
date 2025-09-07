/**
 * DIAGNÓSTICO DATOS FALTANTES EN INTERFAZ
 * ======================================
 * Diagnosticar por qué no aparecen:
 * 1. Fechas de matriculación de profesionales
 * 2. Pagos realizados históricos
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function diagnoseMissingDataDisplay() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔍 DIAGNÓSTICO: Datos faltantes en interfaz\n');
        console.log('=' .repeat(60) + '\n');
        
        // 1. DIAGNÓSTICO FECHAS MATRICULACIÓN
        console.log('📅 1. DIAGNÓSTICO FECHAS DE MATRICULACIÓN\n');
        
        // Verificar datos en BD
        console.log('🔍 Datos disponibles en BD:');
        const matriculasConFechas = await pool.query(`
            SELECT m.numero_matricula, m.fecha_inscripcion, m.fecha_habilitacion,
                   p.nombre, p.numero_documento
            FROM copig.matriculas m
            JOIN copig.profesionales p ON m.profesional_id = p.id
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY m.numero_matricula
            LIMIT 5
        `);
        
        console.log(`✅ ${matriculasConFechas.rows.length} matrículas con fechas encontradas:`);
        matriculasConFechas.rows.forEach(m => {
            console.log(`   Mat ${m.numero_matricula}: ${m.nombre} - Inscripción: ${m.fecha_inscripcion ? m.fecha_inscripcion.toISOString().split('T')[0] : 'NULL'}`);
        });
        
        // Verificar endpoint que debería devolver las fechas
        console.log('\n🔍 Verificando endpoints que deberían mostrar fechas:');
        
        // Probar query del endpoint de profesionales
        const profesionalConMatricula = await pool.query(`
            SELECT p.*, m.numero_matricula, m.fecha_inscripcion, m.fecha_habilitacion
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = (SELECT id FROM copig.profesionales LIMIT 1)
        `);
        
        if (profesionalConMatricula.rows.length > 0) {
            const prof = profesionalConMatricula.rows[0];
            console.log('✅ Query endpoint profesionales funciona:');
            console.log(`   ID: ${prof.id}, DNI: ${prof.numero_documento}`);
            console.log(`   Matrícula: ${prof.numero_matricula || 'NULL'}`);
            console.log(`   Fecha inscripción: ${prof.fecha_inscripcion ? prof.fecha_inscripcion.toISOString().split('T')[0] : 'NULL'}`);
            console.log(`   Fecha habilitación: ${prof.fecha_habilitacion ? prof.fecha_habilitacion.toISOString().split('T')[0] : 'NULL'}`);
        } else {
            console.log('❌ Error en query endpoint profesionales');
        }
        
        // 2. DIAGNÓSTICO PAGOS HISTÓRICOS
        console.log('\n💰 2. DIAGNÓSTICO PAGOS HISTÓRICOS\n');
        
        // Verificar datos en BD
        console.log('🔍 Datos de pagos disponibles:');
        const totalPagos = await pool.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        console.log(`📊 Total pagos históricos en BD: ${totalPagos.rows[0].total}`);
        
        if (parseInt(totalPagos.rows[0].total) > 0) {
            const muestraPagos = await pool.query(`
                SELECT matricula, fecha, importe, concepto, estado
                FROM copig.pagos_historicos
                WHERE importe > 0
                ORDER BY fecha DESC
                LIMIT 5
            `);
            
            console.log('✅ Muestra de pagos históricos:');
            muestraPagos.rows.forEach(pago => {
                console.log(`   Mat ${pago.matricula}: $${pago.importe} - ${pago.fecha ? pago.fecha.toISOString().split('T')[0] : 'Sin fecha'} - ${pago.concepto || 'Sin concepto'}`);
            });
            
            // Verificar si los pagos se vinculan correctamente con profesionales
            const pagosVinculados = await pool.query(`
                SELECT p.nombre, p.numero_documento, m.numero_matricula, 
                       ph.fecha, ph.importe, ph.concepto
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
                WHERE ph.importe > 0
                ORDER BY ph.fecha DESC
                LIMIT 3
            `);
            
            console.log(`\n🔗 Pagos vinculados con profesionales: ${pagosVinculados.rows.length}`);
            if (pagosVinculados.rows.length > 0) {
                console.log('✅ Vinculación pagos-profesionales funciona:');
                pagosVinculados.rows.forEach(pago => {
                    console.log(`   ${pago.nombre} (Mat ${pago.numero_matricula}): $${pago.importe} - ${pago.fecha ? pago.fecha.toISOString().split('T')[0] : 'Sin fecha'}`);
                });
            } else {
                console.log('❌ Error: No se pueden vincular pagos con profesionales');
                
                // Diagnosticar el problema de vinculación
                console.log('\n🔍 Diagnosticando problema de vinculación:');
                
                const muestraMatriculas = await pool.query(`
                    SELECT numero_matricula FROM copig.matriculas LIMIT 3
                `);
                const muestraPagosMatriculas = await pool.query(`
                    SELECT DISTINCT matricula FROM copig.pagos_historicos LIMIT 3
                `);
                
                console.log('   Matrículas en tabla matriculas:', muestraMatriculas.rows.map(m => m.numero_matricula));
                console.log('   Matrículas en tabla pagos:', muestraPagosMatriculas.rows.map(p => p.matricula));
                
                // Verificar tipos de datos
                const tiposMatricula = await pool.query(`
                    SELECT data_type FROM information_schema.columns 
                    WHERE table_name = 'matriculas' AND column_name = 'numero_matricula'
                `);
                const tiposPago = await pool.query(`
                    SELECT data_type FROM information_schema.columns 
                    WHERE table_name = 'pagos_historicos' AND column_name = 'matricula'
                `);
                
                console.log(`   Tipo campo matriculas.numero_matricula: ${tiposMatricula.rows[0]?.data_type}`);
                console.log(`   Tipo campo pagos_historicos.matricula: ${tiposPago.rows[0]?.data_type}`);
            }
        } else {
            console.log('❌ No hay pagos históricos en la BD - Verificar importación');
        }
        
        // 3. VERIFICAR ENDPOINTS API QUE DEBERÍAN MOSTRAR ESTOS DATOS
        console.log('\n🔗 3. VERIFICAR ENDPOINTS API\n');
        
        const fs = require('fs');
        const serverContent = fs.readFileSync('server.js', 'utf8');
        
        // Buscar endpoints que deberían incluir fechas de matriculación
        const endpointsConFechas = [
            '/api/admin/profesionales/:id',
            '/api/admin/profesionales',
            '/api/profesional/dashboard',
            '/api/profesional/profile'
        ];
        
        console.log('🔍 Endpoints que deberían incluir fechas de matriculación:');
        endpointsConFechas.forEach(endpoint => {
            const found = serverContent.includes(endpoint.replace('/:id', ''));
            console.log(`   ${found ? '✅' : '❌'} ${endpoint}`);
        });
        
        // Buscar si los endpoints incluyen joins con tabla matriculas
        const includesMatriculaJoin = serverContent.includes('JOIN copig.matriculas') || 
                                     serverContent.includes('LEFT JOIN copig.matriculas');
        console.log(`\n🔗 Endpoints incluyen JOIN con tabla matriculas: ${includesMatriculaJoin ? '✅ SÍ' : '❌ NO'}`);
        
        // Buscar endpoints que deberían incluir pagos históricos
        const includesPagosJoin = serverContent.includes('JOIN copig.pagos_historicos') || 
                                 serverContent.includes('LEFT JOIN copig.pagos_historicos');
        console.log(`🔗 Endpoints incluyen JOIN con pagos históricos: ${includesPagosJoin ? '✅ SÍ' : '❌ NO'}`);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 DIAGNÓSTICO COMPLETO');
        console.log('='.repeat(60));
        
        const problemas = [];
        
        if (matriculasConFechas.rows.length === 0) {
            problemas.push('❌ No hay fechas de matriculación en BD');
        } else if (!includesMatriculaJoin) {
            problemas.push('❌ Endpoints no hacen JOIN con tabla matriculas');
        }
        
        if (parseInt(totalPagos.rows[0].total) === 0) {
            problemas.push('❌ No hay pagos históricos importados');
        } else if (!includesPagosJoin) {
            problemas.push('❌ Endpoints no hacen JOIN con pagos históricos');
        }
        
        if (problemas.length > 0) {
            console.log('⚠️  PROBLEMAS IDENTIFICADOS:');
            problemas.forEach(problema => console.log(`   ${problema}`));
        } else {
            console.log('✅ Los datos están en BD - Problema está en las interfaces');
        }
        
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('   1. Corregir JOINs en endpoints API');
        console.log('   2. Actualizar interfaces para mostrar campos');
        console.log('   3. Verificar que las interfaces llaman a endpoints correctos');
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    diagnoseMissingDataDisplay();
}

module.exports = diagnoseMissingDataDisplay;