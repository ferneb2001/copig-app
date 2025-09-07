const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testSpecificEndpoint() {
    console.log('🔍 PRUEBA ENDPOINT ESPECÍFICO: /api/admin/profesional/7354');
    console.log('='.repeat(70));
    
    try {
        // Buscar ABAD, CARLOS ADRIAN específicamente (ID 7354)
        console.log('1️⃣ Buscando profesional ID 7354 (ABAD, CARLOS ADRIAN)...');
        
        const profesional = await pool.query(`
            SELECT 
                p.*, 
                m.numero_matricula,
                COALESCE(calcular_estado_profesional(m.numero_matricula::TEXT), 'SIN_MATRICULA') as estado_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_funcion_directa
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = 7354
        `);
        
        if (profesional.rows.length === 0) {
            console.log('❌ No se encontró el profesional');
            return;
        }
        
        const prof = profesional.rows[0];
        console.log(`✅ Profesional encontrado: ${prof.nombre}`);
        console.log(`   ID: ${prof.id}`);
        console.log(`   Matrícula: ${prof.numero_matricula}`);
        console.log(`   Estado función: ${prof.estado_funcion_directa}`);
        console.log(`   Estado matricula: ${prof.estado_matricula}`);
        
        // 2. Simular exactamente lo que hace el endpoint /api/admin/profesional/:id
        console.log('\n2️⃣ Simulando endpoint completo...');
        
        // Obtener pagos recientes (como hace el endpoint)
        const pagosQuery = await pool.query(`
            SELECT 
                fecha_pago,
                importe,
                concepto,
                numero_recibo
            FROM copig.pagos_historicos 
            WHERE matricula = $1::TEXT 
            ORDER BY fecha_pago DESC 
            LIMIT 10
        `, [prof.numero_matricula.toString()]);
        
        const pagosRecientes = pagosQuery.rows;
        console.log(`   Pagos recientes: ${pagosRecientes.length}`);
        
        // Totales de pagos
        const totalesQuery = await pool.query(`
            SELECT 
                COUNT(*) as total_pagos,
                COALESCE(SUM(importe), 0) as total_pagado
            FROM copig.pagos_historicos 
            WHERE matricula = $1::TEXT
        `, [prof.numero_matricula.toString()]);
        
        const totales = totalesQuery.rows[0];
        console.log(`   Total pagos: ${totales.total_pagos}`);
        console.log(`   Total pagado: $${totales.total_pagado}`);
        
        // 3. Verificar restricciones
        console.log('\n3️⃣ Verificando restricciones...');
        const restricciones = await pool.query(`
            SELECT * FROM copig.restricciones_deudas 
            WHERE numero_matricula = $1::TEXT 
            ORDER BY fecha_inicio DESC
        `, [prof.numero_matricula.toString()]);
        
        console.log(`   Restricciones: ${restricciones.rows.length}`);
        const tieneDeudas = restricciones.rows.length > 0;
        console.log(`   Tiene deudas: ${tieneDeudas}`);
        
        // 4. Simular el objeto que devuelve el endpoint
        console.log('\n4️⃣ OBJETO QUE DEVUELVE EL ENDPOINT:');
        const endpointResponse = {
            success: true,
            profesional: {
                ...prof,
                total_pagos: parseInt(totales.total_pagos),
                total_pagado: parseFloat(totales.total_pagado),
                tieneDeudas: tieneDeudas,
                restricciones: restricciones.rows,
                estado_matricula: prof.estado_matricula // ← ESTE ES EL CAMPO CLAVE
            },
            pagos_recientes: pagosRecientes
        };
        
        console.log('📊 DATOS ENVIADOS AL FRONTEND:');
        console.log(`   prof.estado_matricula: "${endpointResponse.profesional.estado_matricula}"`);
        console.log(`   prof.estado_funcion_directa: "${endpointResponse.profesional.estado_funcion_directa}"`);
        console.log(`   prof.tieneDeudas: ${endpointResponse.profesional.tieneDeudas}`);
        console.log(`   prof.total_pagado: $${endpointResponse.profesional.total_pagado}`);
        
        // 5. Simular el switch del frontend
        console.log('\n5️⃣ SIMULANDO SWITCH DEL FRONTEND:');
        let estadoFinancieroText = '✅ Al día'; // Default
        let estadoFinancieroClass = 'status-aprobado';
        
        console.log(`   prof.estado_matricula existe: ${!!endpointResponse.profesional.estado_matricula}`);
        console.log(`   Valor: "${endpointResponse.profesional.estado_matricula}"`);
        
        if (endpointResponse.profesional.estado_matricula) {
            switch(endpointResponse.profesional.estado_matricula) {
                case 'AL_DIA':
                    estadoFinancieroText = '✅ Al día';
                    estadoFinancieroClass = 'status-aprobado';
                    console.log('   → Caso AL_DIA ejecutado');
                    break;
                case 'MOROSO':
                    estadoFinancieroText = '❌ Moroso';
                    estadoFinancieroClass = 'status-rechazado';
                    console.log('   → Caso MOROSO ejecutado');
                    break;
                case 'EN_PROCESO':
                    estadoFinancieroText = '🔄 En Proceso';
                    estadoFinancieroClass = 'status-pendiente';
                    console.log('   → Caso EN_PROCESO ejecutado');
                    break;
                default:
                    console.log(`   → Caso DEFAULT ejecutado para: "${endpointResponse.profesional.estado_matricula}"`);
            }
        } else {
            console.log('   → NO HAY estado_matricula, usando default');
        }
        
        console.log(`   RESULTADO FINAL: "${estadoFinancieroText}"`);
        
        // 6. ¿Por qué no coincide?
        console.log('\n6️⃣ ANÁLISIS FINAL:');
        if (estadoFinancieroText === '✅ Al día' && prof.estado_funcion_directa === 'MOROSO') {
            console.log('🚨 PROBLEMA IDENTIFICADO:');
            console.log('   El frontend muestra "Al día" pero la función dice "MOROSO"');
            console.log('   POSIBLES CAUSAS:');
            console.log('   a) El endpoint no está enviando estado_matricula correctamente');
            console.log('   b) Hay cache en el navegador');
            console.log('   c) El endpoint está usando datos diferentes a la función');
        } else {
            console.log('✅ Todo parece correcto');
        }
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

testSpecificEndpoint()
    .then(() => {
        console.log('\n✅ Prueba de endpoint completada');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });