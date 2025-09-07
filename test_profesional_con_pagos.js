const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testProfesionalConPagos() {
    const client = await pool.connect();
    try {
        console.log('🔍 BUSCANDO PROFESIONAL CON PAGOS\n');
        
        // 1. Buscar un profesional que tenga pagos
        console.log('📊 1. Buscando profesionales con pagos (método 1 - por matrícula):');
        const conPagosMatricula = await client.query(`
            SELECT pr.id, pr.nombre, pr.numero_documento, m.numero_matricula, 
                   COUNT(ph.id) as total_pagos, 
                   SUM(ph.importe) as total_monto
            FROM copig.profesionales pr
            JOIN copig.matriculas m ON pr.id = m.profesional_id
            JOIN copig.pagos_historicos ph ON m.numero_matricula::text = ph.matricula::text
            GROUP BY pr.id, pr.nombre, pr.numero_documento, m.numero_matricula
            ORDER BY total_pagos DESC
            LIMIT 5
        `);
        
        if (conPagosMatricula.rows.length > 0) {
            console.log('   ✅ Profesionales encontrados con pagos (por matrícula):');
            conPagosMatricula.rows.forEach(prof => {
                console.log(`     ${prof.nombre} (Mat: ${prof.numero_matricula}, DNI: ${prof.numero_documento}): ${prof.total_pagos} pagos, $${prof.total_monto}`);
            });
        } else {
            console.log('   ❌ No se encontraron profesionales con pagos por matrícula');
        }
        
        // 2. Buscar por DNI como matrícula
        console.log('\n📋 2. Buscando profesionales con pagos (método 2 - por DNI):');
        const conPagosDNI = await client.query(`
            SELECT pr.id, pr.nombre, pr.numero_documento, 
                   COUNT(ph.id) as total_pagos, 
                   SUM(ph.importe) as total_monto
            FROM copig.profesionales pr
            JOIN copig.pagos_historicos ph ON pr.numero_documento::text = ph.matricula::text
            GROUP BY pr.id, pr.nombre, pr.numero_documento
            ORDER BY total_pagos DESC
            LIMIT 5
        `);
        
        if (conPagosDNI.rows.length > 0) {
            console.log('   ✅ Profesionales encontrados con pagos (por DNI):');
            conPagosDNI.rows.forEach(prof => {
                console.log(`     ${prof.nombre} (DNI: ${prof.numero_documento}): ${prof.total_pagos} pagos, $${prof.total_monto}`);
            });
        } else {
            console.log('   ❌ No se encontraron profesionales con pagos por DNI');
        }
        
        // 3. Analizar las matrículas más comunes en pagos
        console.log('\n🔍 3. Analizando matrículas más frecuentes en pagos:');
        const matriculasComunes = await client.query(`
            SELECT matricula, COUNT(*) as total_pagos, SUM(importe) as total_monto
            FROM copig.pagos_historicos 
            WHERE matricula IS NOT NULL AND importe > 0
            GROUP BY matricula
            ORDER BY total_pagos DESC
            LIMIT 10
        `);
        
        console.log('   Top 10 matrículas con más pagos:');
        matriculasComunes.rows.forEach(m => {
            console.log(`     Matrícula ${m.matricula}: ${m.total_pagos} pagos, $${m.total_monto}`);
        });
        
        // 4. Ver si alguna de esas matrículas está en profesionales
        console.log('\n🔗 4. Verificando conexiones:');
        if (matriculasComunes.rows.length > 0) {
            const primeraMatricula = matriculasComunes.rows[0].matricula;
            
            // Buscar por número de matrícula
            const profPorMatricula = await client.query(`
                SELECT pr.id, pr.nombre, pr.numero_documento, m.numero_matricula
                FROM copig.profesionales pr
                JOIN copig.matriculas m ON pr.id = m.profesional_id
                WHERE m.numero_matricula::text = $1
            `, [primeraMatricula]);
            
            console.log(`   Buscando profesional con matrícula ${primeraMatricula}:`);
            if (profPorMatricula.rows.length > 0) {
                console.log(`     ✅ Encontrado: ${profPorMatricula.rows[0].nombre}`);
            } else {
                console.log(`     ❌ No encontrado por matrícula`);
                
                // Buscar por DNI igual a esa matrícula
                const profPorDNI = await client.query(`
                    SELECT pr.id, pr.nombre, pr.numero_documento
                    FROM copig.profesionales pr
                    WHERE pr.numero_documento::text = $1
                `, [primeraMatricula]);
                
                if (profPorDNI.rows.length > 0) {
                    console.log(`     ✅ Encontrado por DNI: ${profPorDNI.rows[0].nombre}`);
                } else {
                    console.log(`     ❌ No encontrado por DNI tampoco`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

testProfesionalConPagos().catch(console.error);