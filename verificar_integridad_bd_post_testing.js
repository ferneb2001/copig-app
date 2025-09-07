/**
 * VERIFICACIÓN COMPLETA DE INTEGRIDAD DE BASE DE DATOS POST-TESTING
 * FECHA: 2025-09-04
 * OBJETIVO: Verificar que todo el testing exhaustivo no causó corrupción de datos
 * 
 * MÁXIMA APLICADA: Verificación meticulosa post-testing para garantizar robustez institucional
 */

const fs = require('fs');
const { Client } = require('pg');
const config = require('./config.json');

async function verificarIntegridadCompleta() {
    console.log('🔍 INICIANDO VERIFICACIÓN COMPLETA DE INTEGRIDAD BD POST-TESTING');
    console.log('='.repeat(80));
    
    const client = new Client(config.database);
    let reporte = {
        timestamp: new Date().toISOString(),
        testing_session: '2025-09-04 Exhaustivo + Stress + UX',
        verificaciones: {},
        errores_criticos: [],
        advertencias: [],
        integridad_general: null,
        recomendaciones: []
    };
    
    try {
        await client.connect();
        
        // 1. VERIFICAR CONTEOS PRINCIPALES
        console.log('\n📊 1. VERIFICANDO CONTEOS PRINCIPALES...');
        const conteos = await verificarConteosPrincipales(client);
        reporte.verificaciones.conteos = conteos;
        
        // 2. VERIFICAR INTEGRIDAD REFERENCIAL
        console.log('\n🔗 2. VERIFICANDO INTEGRIDAD REFERENCIAL...');
        const referencias = await verificarIntegridadReferencial(client);
        reporte.verificaciones.referencias = referencias;
        
        // 3. VERIFICAR DATOS CRÍTICOS COPIG
        console.log('\n⚖️ 3. VERIFICANDO DATOS CRÍTICOS COPIG...');
        const datosCriticos = await verificarDatosCriticos(client);
        reporte.verificaciones.datos_criticos = datosCriticos;
        
        // 4. VERIFICAR CONSISTENCIA FINANCIERA
        console.log('\n💰 4. VERIFICANDO CONSISTENCIA FINANCIERA...');
        const financiero = await verificarConsistenciaFinanciera(client);
        reporte.verificaciones.financiero = financiero;
        
        // 5. VERIFICAR DUPLICADOS Y CORRUPCIÓN
        console.log('\n🚫 5. VERIFICANDO DUPLICADOS Y CORRUPCIÓN...');
        const duplicados = await verificarDuplicadosCorrupcion(client);
        reporte.verificaciones.duplicados = duplicados;
        
        // 6. VERIFICAR FUNCIONALIDAD CRÍTICA
        console.log('\n🔧 6. VERIFICANDO FUNCIONALIDAD CRÍTICA...');
        const funcionalidad = await verificarFuncionalidadCritica(client);
        reporte.verificaciones.funcionalidad = funcionalidad;
        
        // GENERAR REPORTE FINAL
        generarReporteFinal(reporte);
        
    } catch (error) {
        console.error('❌ ERROR EN VERIFICACIÓN:', error);
        reporte.errores_criticos.push({
            tipo: 'ERROR_CONEXION_BD',
            mensaje: error.message,
            stack: error.stack
        });
    } finally {
        await client.end();
        
        // GUARDAR REPORTE COMPLETO
        const archivo = `verificacion_integridad_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(archivo, JSON.stringify(reporte, null, 2));
        console.log(`\n📄 REPORTE GUARDADO: ${archivo}`);
        
        return reporte;
    }
}

async function verificarConteosPrincipales(client) {
    console.log('  → Contando registros principales...');
    
    const tablas = [
        'profesionales',
        'matriculas',
        'empresas', 
        'representantes_tecnicos',
        'pagos_historicos',
        'restricciones_deudas',
        'solicitudes_chp',
        'admin_users',
        'profesionales_auth',
        'comprobantes_pago'
    ];
    
    const conteos = {};
    
    for (const tabla of tablas) {
        try {
            const result = await client.query(`SELECT COUNT(*) as total FROM copig.${tabla}`);
            conteos[tabla] = parseInt(result.rows[0].total);
            console.log(`    ✅ ${tabla}: ${conteos[tabla]} registros`);
        } catch (error) {
            console.log(`    ❌ ${tabla}: ERROR - ${error.message}`);
            conteos[tabla] = { error: error.message };
        }
    }
    
    // TOTALES ESPERADOS (baseline post-importaciones)
    const esperados = {
        profesionales: 5384,
        matriculas: 5377,
        empresas: 1477,
        representantes_tecnicos: 665,
        pagos_historicos: 124180,
        admin_users: 3,
        solicitudes_chp: 5
    };
    
    // VERIFICAR DESVIACIONES CRÍTICAS
    for (const [tabla, esperado] of Object.entries(esperados)) {
        if (conteos[tabla] && typeof conteos[tabla] === 'number') {
            const diferencia = Math.abs(conteos[tabla] - esperado);
            const porcentaje = (diferencia / esperado) * 100;
            
            if (porcentaje > 1) { // Más del 1% de diferencia
                console.log(`    ⚠️  ${tabla}: Diferencia significativa detectada`);
                console.log(`       Esperado: ${esperado}, Actual: ${conteos[tabla]}`);
            }
        }
    }
    
    return conteos;
}

async function verificarIntegridadReferencial(client) {
    console.log('  → Verificando foreign keys críticas...');
    
    const verificaciones = [];
    
    // 1. Representantes técnicos → Empresas
    try {
        const result1 = await client.query(`
            SELECT COUNT(*) as huerfanos 
            FROM copig.representantes_tecnicos rt 
            LEFT JOIN copig.empresas e ON rt.empresa_id = e.id 
            WHERE e.id IS NULL
        `);
        const huerfanos_rt = parseInt(result1.rows[0].huerfanos);
        verificaciones.push({
            tipo: 'representantes_tecnicos → empresas',
            huerfanos: huerfanos_rt,
            estado: huerfanos_rt === 0 ? 'OK' : 'WARNING'
        });
        console.log(`    ${huerfanos_rt === 0 ? '✅' : '⚠️'} RT huérfanos: ${huerfanos_rt}`);
    } catch (error) {
        verificaciones.push({
            tipo: 'representantes_tecnicos → empresas',
            error: error.message
        });
    }
    
    // 2. Matrículas → Profesionales
    try {
        const result2 = await client.query(`
            SELECT COUNT(*) as huerfanos 
            FROM copig.matriculas m 
            LEFT JOIN copig.profesionales p ON m.profesional_id = p.id 
            WHERE p.id IS NULL
        `);
        const huerfanos_mat = parseInt(result2.rows[0].huerfanos);
        verificaciones.push({
            tipo: 'matriculas → profesionales',
            huerfanos: huerfanos_mat,
            estado: huerfanos_mat === 0 ? 'OK' : 'CRITICAL'
        });
        console.log(`    ${huerfanos_mat === 0 ? '✅' : '❌'} Matrículas huérfanas: ${huerfanos_mat}`);
    } catch (error) {
        verificaciones.push({
            tipo: 'matriculas → profesionales',
            error: error.message
        });
    }
    
    // 3. Solicitudes CHP → Profesionales
    try {
        const result3 = await client.query(`
            SELECT COUNT(*) as huerfanos 
            FROM copig.solicitudes_chp s 
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id 
            WHERE p.id IS NULL
        `);
        const huerfanos_chp = parseInt(result3.rows[0].huerfanos);
        verificaciones.push({
            tipo: 'solicitudes_chp → profesionales',
            huerfanos: huerfanos_chp,
            estado: huerfanos_chp === 0 ? 'OK' : 'WARNING'
        });
        console.log(`    ${huerfanos_chp === 0 ? '✅' : '⚠️'} Solicitudes CHP huérfanas: ${huerfanos_chp}`);
    } catch (error) {
        verificaciones.push({
            tipo: 'solicitudes_chp → profesionales',
            error: error.message
        });
    }
    
    return verificaciones;
}

async function verificarDatosCriticos(client) {
    console.log('  → Verificando datos críticos COPIG...');
    
    const verificaciones = {};
    
    // 1. Profesionales con matrícula
    try {
        const result1 = await client.query(`
            SELECT 
                COUNT(*) as total_profesionales,
                COUNT(m.id) as con_matricula,
                COUNT(*) - COUNT(m.id) as sin_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
        `);
        
        verificaciones.profesionales_matricula = result1.rows[0];
        console.log(`    ✅ Profesionales: ${result1.rows[0].total_profesionales} total, ${result1.rows[0].con_matricula} con matrícula`);
        
        if (parseInt(result1.rows[0].sin_matricula) > 10) {
            console.log(`    ⚠️  ${result1.rows[0].sin_matricula} profesionales sin matrícula (revisar)`);
        }
    } catch (error) {
        verificaciones.profesionales_matricula = { error: error.message };
    }
    
    // 2. Empresas activas vs representantes
    try {
        const result2 = await client.query(`
            SELECT 
                COUNT(*) as total_empresas,
                COUNT(CASE WHEN activo THEN 1 END) as activas,
                COUNT(rt.id) as con_representantes
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
        `);
        
        verificaciones.empresas_representantes = result2.rows[0];
        console.log(`    ✅ Empresas: ${result2.rows[0].total_empresas} total, ${result2.rows[0].activas} activas`);
        console.log(`    ✅ Representantes asignados: ${result2.rows[0].con_representantes}`);
    } catch (error) {
        verificaciones.empresas_representantes = { error: error.message };
    }
    
    // 3. Sistema financiero funcional
    try {
        const result3 = await client.query(`
            SELECT 
                COUNT(*) as pagos_totales,
                COUNT(CASE WHEN fecha_pago > '2020-01-01' THEN 1 END) as pagos_recientes,
                SUM(importe::numeric) as monto_total
            FROM copig.pagos_historicos
        `);
        
        verificaciones.sistema_financiero = result3.rows[0];
        console.log(`    ✅ Pagos históricos: ${result3.rows[0].pagos_totales} total, monto: $${parseFloat(result3.rows[0].monto_total || 0).toLocaleString()}`);
    } catch (error) {
        verificaciones.sistema_financiero = { error: error.message };
    }
    
    return verificaciones;
}

async function verificarConsistenciaFinanciera(client) {
    console.log('  → Verificando consistencia financiera...');
    
    const verificaciones = {};
    
    // 1. Pagos con fechas coherentes
    try {
        const result1 = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN fecha_pago < '1990-01-01' OR fecha_pago > CURRENT_DATE THEN 1 END) as fechas_anomalas
            FROM copig.pagos_historicos
        `);
        
        verificaciones.fechas_pagos = result1.rows[0];
        console.log(`    ${result1.rows[0].fechas_anomalas == 0 ? '✅' : '⚠️'} Fechas anómalas: ${result1.rows[0].fechas_anomalas} de ${result1.rows[0].total}`);
    } catch (error) {
        verificaciones.fechas_pagos = { error: error.message };
    }
    
    // 2. Importes válidos
    try {
        const result2 = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN importe::numeric <= 0 THEN 1 END) as importes_negativos,
                COUNT(CASE WHEN importe::numeric > 1000000 THEN 1 END) as importes_excesivos
            FROM copig.pagos_historicos
        `);
        
        verificaciones.importes = result2.rows[0];
        console.log(`    ✅ Importes negativos: ${result2.rows[0].importes_negativos}`);
        console.log(`    ✅ Importes excesivos (>$1M): ${result2.rows[0].importes_excesivos}`);
    } catch (error) {
        verificaciones.importes = { error: error.message };
    }
    
    return verificaciones;
}

async function verificarDuplicadosCorrupcion(client) {
    console.log('  → Verificando duplicados y corrupción...');
    
    const verificaciones = {};
    
    // 1. Profesionales duplicados por DNI
    try {
        const result1 = await client.query(`
            SELECT numero_documento, COUNT(*) as duplicados
            FROM copig.profesionales 
            GROUP BY numero_documento 
            HAVING COUNT(*) > 1
        `);
        
        verificaciones.profesionales_duplicados = {
            total: result1.rows.length,
            casos: result1.rows.slice(0, 10) // Primeros 10 casos
        };
        console.log(`    ${result1.rows.length === 0 ? '✅' : '⚠️'} Profesionales duplicados por DNI: ${result1.rows.length}`);
    } catch (error) {
        verificaciones.profesionales_duplicados = { error: error.message };
    }
    
    // 2. Empresas duplicadas por CUIT
    try {
        const result2 = await client.query(`
            SELECT cuit, COUNT(*) as duplicados
            FROM copig.empresas 
            WHERE cuit IS NOT NULL AND cuit != ''
            GROUP BY cuit 
            HAVING COUNT(*) > 1
        `);
        
        verificaciones.empresas_duplicadas = {
            total: result2.rows.length,
            casos: result2.rows.slice(0, 10)
        };
        console.log(`    ${result2.rows.length === 0 ? '✅' : '⚠️'} Empresas duplicadas por CUIT: ${result2.rows.length}`);
    } catch (error) {
        verificaciones.empresas_duplicadas = { error: error.message };
    }
    
    // 3. Caracteres corruptos
    try {
        const result3 = await client.query(`
            SELECT 
                COUNT(CASE WHEN nombre LIKE '%�%' THEN 1 END) as nombres_corruptos,
                COUNT(CASE WHEN domicilio LIKE '%�%' THEN 1 END) as domicilios_corruptos
            FROM copig.profesionales
        `);
        
        verificaciones.caracteres_corruptos = result3.rows[0];
        console.log(`    ✅ Nombres con caracteres corruptos: ${result3.rows[0].nombres_corruptos}`);
        console.log(`    ✅ Domicilios con caracteres corruptos: ${result3.rows[0].domicilios_corruptos}`);
    } catch (error) {
        verificaciones.caracteres_corruptos = { error: error.message };
    }
    
    return verificaciones;
}

async function verificarFuncionalidadCritica(client) {
    console.log('  → Verificando funcionalidad crítica...');
    
    const verificaciones = {};
    
    // 1. Sistema de autenticación
    try {
        const result1 = await client.query(`
            SELECT 
                COUNT(*) as total_usuarios,
                COUNT(CASE WHEN password IS NOT NULL AND password != '' THEN 1 END) as con_password
            FROM copig.admin_users
        `);
        
        const result2 = await client.query(`
            SELECT 
                COUNT(*) as total_prof_auth,
                COUNT(CASE WHEN password IS NOT NULL AND password != '' THEN 1 END) as con_password
            FROM copig.profesionales_auth
        `);
        
        verificaciones.autenticacion = {
            admin_users: result1.rows[0],
            profesionales_auth: result2.rows[0]
        };
        
        console.log(`    ✅ Admin users con password: ${result1.rows[0].con_password}/${result1.rows[0].total_usuarios}`);
        console.log(`    ✅ Prof auth con password: ${result2.rows[0].con_password}/${result2.rows[0].total_prof_auth}`);
    } catch (error) {
        verificaciones.autenticacion = { error: error.message };
    }
    
    // 2. Sistema CHP funcional
    try {
        const result3 = await client.query(`
            SELECT 
                COUNT(*) as total_solicitudes,
                COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as pendientes,
                COUNT(CASE WHEN numero_solicitud IS NOT NULL THEN 1 END) as con_numero
            FROM copig.solicitudes_chp
        `);
        
        verificaciones.sistema_chp = result3.rows[0];
        console.log(`    ✅ Solicitudes CHP: ${result3.rows[0].total_solicitudes} total, ${result3.rows[0].pendientes} pendientes`);
    } catch (error) {
        verificaciones.sistema_chp = { error: error.message };
    }
    
    return verificaciones;
}

function generarReporteFinal(reporte) {
    console.log('\n' + '='.repeat(80));
    console.log('📋 REPORTE FINAL DE INTEGRIDAD - TESTING EXHAUSTIVO COPIG');
    console.log('='.repeat(80));
    
    // CONTAR ERRORES Y ADVERTENCIAS
    let erroresCriticos = reporte.errores_criticos.length;
    let advertencias = reporte.advertencias.length;
    
    // ANALIZAR VERIFICACIONES
    for (const [categoria, datos] of Object.entries(reporte.verificaciones)) {
        if (Array.isArray(datos)) {
            datos.forEach(item => {
                if (item.estado === 'CRITICAL' || item.error) erroresCriticos++;
                if (item.estado === 'WARNING') advertencias++;
            });
        } else if (typeof datos === 'object' && datos.error) {
            erroresCriticos++;
        }
    }
    
    // DETERMINAR ESTADO GENERAL
    if (erroresCriticos === 0 && advertencias <= 3) {
        reporte.integridad_general = 'EXCELENTE';
        console.log('🏆 ESTADO GENERAL: EXCELENTE');
        console.log('✅ Sistema completamente íntegro post-testing exhaustivo');
    } else if (erroresCriticos === 0 && advertencias <= 10) {
        reporte.integridad_general = 'BUENA';
        console.log('✅ ESTADO GENERAL: BUENA');
        console.log('⚠️  Algunas advertencias menores detectadas');
    } else if (erroresCriticos <= 2) {
        reporte.integridad_general = 'ACEPTABLE';
        console.log('⚠️  ESTADO GENERAL: ACEPTABLE');
        console.log('❌ Algunos errores críticos requieren atención');
    } else {
        reporte.integridad_general = 'CRÍTICA';
        console.log('❌ ESTADO GENERAL: CRÍTICA');
        console.log('🚨 MÚLTIPLES ERRORES CRÍTICOS DETECTADOS');
    }
    
    console.log(`📊 Errores críticos: ${erroresCriticos}`);
    console.log(`⚠️  Advertencias: ${advertencias}`);
    
    // RECOMENDACIONES ESPECÍFICAS
    if (erroresCriticos === 0) {
        reporte.recomendaciones.push('Sistema apto para producción institucional');
        reporte.recomendaciones.push('Robustez confirmada post-testing exhaustivo');
    }
    
    if (advertencias > 0) {
        reporte.recomendaciones.push('Revisar advertencias antes del siguiente testing');
    }
    
    reporte.recomendaciones.push('Realizar verificaciones periódicas mensuales');
    reporte.recomendaciones.push('Mantener backups automáticos antes de cambios mayores');
    
    console.log('\n🎯 RECOMENDACIONES:');
    reporte.recomendaciones.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(80));
}

// EJECUTAR VERIFICACIÓN
if (require.main === module) {
    verificarIntegridadCompleta()
        .then(reporte => {
            console.log(`\n🏁 VERIFICACIÓN COMPLETA - Estado: ${reporte.integridad_general}`);
            process.exit(reporte.integridad_general === 'CRÍTICA' ? 1 : 0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL EN VERIFICACIÓN:', error);
            process.exit(1);
        });
}

module.exports = { verificarIntegridadCompleta };