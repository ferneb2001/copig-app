const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarPagosProfesional() {
    const client = await pool.connect();
    try {
        console.log('🔍 VERIFICANDO CONEXIÓN PAGOS-PROFESIONALES\n');
        
        // 1. Verificar tabla de pagos históricos
        console.log('📊 1. Verificando tabla pagos_historicos:');
        const pagosCount = await client.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        console.log(`   Total pagos en BD: ${pagosCount.rows[0].total}`);
        
        // 2. Verificar algunos ejemplos de pagos
        console.log('\n💰 2. Ejemplos de pagos en BD:');
        const ejemplosPagos = await client.query(`
            SELECT matricula, fecha_pago, concepto, monto 
            FROM copig.pagos_historicos 
            LIMIT 5
        `);
        ejemplosPagos.rows.forEach(pago => {
            console.log(`   Matrícula: ${pago.matricula}, Fecha: ${pago.fecha_pago}, Monto: $${pago.monto}`);
        });
        
        // 3. Verificar profesional ELSA BEATRIZ ACOSTA
        console.log('\n👤 3. Verificando profesional ELSA BEATRIZ ACOSTA:');
        const acosta = await client.query(`
            SELECT p.id, p.nombre, p.numero_documento, m.numero_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.nombre ILIKE '%ACOSTA%' AND p.nombre ILIKE '%ELSA%'
        `);
        
        if (acosta.rows.length > 0) {
            const prof = acosta.rows[0];
            console.log(`   ID: ${prof.id}, DNI: ${prof.numero_documento}, Matrícula: ${prof.numero_matricula}`);
            
            // Buscar pagos con su matrícula
            const pagosPorMatricula = await client.query(`
                SELECT COUNT(*) as total, SUM(monto) as total_monto
                FROM copig.pagos_historicos 
                WHERE matricula = $1
            `, [prof.numero_matricula]);
            
            console.log(`   Pagos por matrícula ${prof.numero_matricula}: ${pagosPorMatricula.rows[0].total} pagos, $${pagosPorMatricula.rows[0].total_monto || 0}`);
            
            // Buscar pagos con su DNI
            const pagosPorDNI = await client.query(`
                SELECT COUNT(*) as total, SUM(monto) as total_monto
                FROM copig.pagos_historicos 
                WHERE matricula = $1
            `, [prof.numero_documento]);
            
            console.log(`   Pagos por DNI ${prof.numero_documento}: ${pagosPorDNI.rows[0].total} pagos, $${pagosPorDNI.rows[0].total_monto || 0}`);
        } else {
            console.log('   ❌ Profesional ACOSTA no encontrado');
        }
        
        // 4. Verificar distribución de matrículas en pagos vs profesionales
        console.log('\n📋 4. Análisis de matrículas:');
        
        const matriculasEnPagos = await client.query(`
            SELECT DISTINCT matricula 
            FROM copig.pagos_historicos 
            WHERE matricula IS NOT NULL 
            ORDER BY matricula::integer 
            LIMIT 10
        `);
        
        console.log('   Primeras 10 matrículas en pagos:');
        matriculasEnPagos.rows.forEach(m => console.log(`     ${m.matricula}`));
        
        const matriculasEnProfesionales = await client.query(`
            SELECT numero_matricula 
            FROM copig.matriculas 
            WHERE numero_matricula IS NOT NULL 
            ORDER BY numero_matricula 
            LIMIT 10
        `);
        
        console.log('   Primeras 10 matrículas en profesionales:');
        matriculasEnProfesionales.rows.forEach(m => console.log(`     ${m.numero_matricula}`));
        
        // 5. Verificar coincidencias exactas
        console.log('\n🔗 5. Verificando coincidencias:');
        const coincidencias = await client.query(`
            SELECT COUNT(*) as coincidencias
            FROM copig.matriculas m
            INNER JOIN copig.pagos_historicos p ON m.numero_matricula::text = p.matricula::text
        `);
        
        console.log(`   Profesionales con pagos encontrados: ${coincidencias.rows[0].coincidencias}`);
        
        // 6. Ejemplos de profesionales CON pagos
        console.log('\n✅ 6. Ejemplos de profesionales CON pagos:');
        const conPagos = await client.query(`
            SELECT pr.nombre, pr.numero_documento, m.numero_matricula, 
                   COUNT(ph.id) as total_pagos, 
                   SUM(ph.monto) as total_monto
            FROM copig.profesionales pr
            JOIN copig.matriculas m ON pr.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            GROUP BY pr.id, pr.nombre, pr.numero_documento, m.numero_matricula
            ORDER BY total_pagos DESC
            LIMIT 5
        `);
        
        conPagos.rows.forEach(prof => {
            console.log(`   ${prof.nombre} (${prof.numero_matricula}): ${prof.total_pagos} pagos, $${prof.total_monto}`);
        });
        
        console.log('\n🎯 RESUMEN:');
        console.log(`   - Total pagos en BD: ${pagosCount.rows[0].total}`);
        console.log(`   - Profesionales con pagos: ${coincidencias.rows[0].coincidencias}`);
        console.log(`   - Problema identificado: ${coincidencias.rows[0].coincidencias == 0 ? 'SÍ - Sin conexiones' : 'Parcial - Pocas conexiones'}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar verificación
verificarPagosProfesional().catch(console.error);