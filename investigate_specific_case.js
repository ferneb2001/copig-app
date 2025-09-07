const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigateSpecificCase() {
    console.log('🔍 INVESTIGACIÓN CASO ESPECÍFICO: ABAD, CARLOS ADRIAN');
    console.log('='.repeat(70));
    
    try {
        // Buscar el profesional específico
        const profesional = await pool.query(`
            SELECT 
                p.*,
                m.numero_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.nombre ILIKE '%ABAD, CARLOS ADRIAN%'
            OR m.numero_matricula = '10030'
        `);
        
        if (profesional.rows.length === 0) {
            console.log('❌ No se encontró el profesional ABAD, CARLOS ADRIAN');
            return;
        }
        
        const prof = profesional.rows[0];
        console.log(`\n👤 PROFESIONAL ENCONTRADO:`);
        console.log(`   ID: ${prof.id}`);
        console.log(`   Nombre: ${prof.nombre}`);
        console.log(`   Matrícula: ${prof.numero_matricula}`);
        console.log(`   Email: ${prof.email || 'No disponible'}`);
        
        // Verificar estado desde función
        const estadoFuncion = await pool.query(`
            SELECT calcular_estado_profesional($1::TEXT) as estado
        `, [prof.numero_matricula.toString()]);
        
        console.log(`\n🧮 ESTADO DESDE FUNCIÓN: ${estadoFuncion.rows[0].estado}`);
        
        // Verificar pagos 2025
        const pagos2025 = await pool.query(`
            SELECT 
                fecha_pago,
                importe,
                concepto,
                EXTRACT(YEAR FROM fecha_pago) as año
            FROM copig.pagos_historicos 
            WHERE matricula = $1::TEXT
            AND EXTRACT(YEAR FROM fecha_pago) = 2025
            ORDER BY fecha_pago DESC
        `, [prof.numero_matricula.toString()]);
        
        console.log(`\n💰 PAGOS EN 2025: ${pagos2025.rows.length}`);
        let total2025 = 0;
        pagos2025.rows.forEach(pago => {
            total2025 += parseFloat(pago.importe);
            console.log(`   ${pago.fecha_pago.toISOString().split('T')[0]}: $${pago.importe}`);
        });
        console.log(`   TOTAL 2025: $${total2025}`);
        
        // Verificar todos los pagos históricos
        const todosLosPagos = await pool.query(`
            SELECT 
                fecha_pago,
                importe,
                concepto,
                EXTRACT(YEAR FROM fecha_pago) as año
            FROM copig.pagos_historicos 
            WHERE matricula = $1::TEXT
            ORDER BY fecha_pago DESC
            LIMIT 10
        `, [prof.numero_matricula.toString()]);
        
        console.log(`\n📊 ÚLTIMOS 10 PAGOS:`);
        todosLosPagos.rows.forEach(pago => {
            console.log(`   ${pago.fecha_pago.toISOString().split('T')[0]} (${pago.año}): $${pago.importe}`);
        });
        
        // Calcular estado manualmente
        let estadoManual = 'MOROSO';
        if (total2025 >= 144200) {
            estadoManual = 'AL_DIA';
        } else if (pagos2025.rows.length > 0) {
            estadoManual = 'EN_PROCESO';
        }
        
        console.log(`\n🎯 COMPARACIÓN FINAL:`);
        console.log(`   Estado función: ${estadoFuncion.rows[0].estado}`);
        console.log(`   Estado manual: ${estadoManual}`);
        console.log(`   Total 2025: $${total2025}`);
        console.log(`   Pagos 2025: ${pagos2025.rows.length}`);
        
        if (estadoFuncion.rows[0].estado !== estadoManual) {
            console.log(`\n🚨 DISCREPANCIA CONFIRMADA!`);
            console.log(`   La función dice: ${estadoFuncion.rows[0].estado}`);
            console.log(`   Debería ser: ${estadoManual}`);
        } else {
            console.log(`\n✅ Estados coinciden correctamente`);
        }
        
        // Verificar endpoint del servidor como lo haría el frontend
        console.log(`\n🌐 SIMULANDO ENDPOINT DEL SERVIDOR:`);
        
        const endpointResult = await pool.query(`
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado,
                (
                    SELECT MAX(ph.fecha_pago)::TEXT
                    FROM copig.pagos_historicos ph 
                    WHERE ph.matricula = m.numero_matricula::TEXT
                ) as ultimo_pago,
                (
                    SELECT COALESCE(SUM(importe), 0)
                    FROM copig.pagos_historicos 
                    WHERE matricula = m.numero_matricula::TEXT 
                    AND EXTRACT(YEAR FROM fecha_pago) = 2025
                ) as total_2025
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        `, [prof.id]);
        
        const endpoint = endpointResult.rows[0];
        console.log(`   Endpoint estado: ${endpoint.estado}`);
        console.log(`   Endpoint último pago: ${endpoint.ultimo_pago}`);
        console.log(`   Endpoint total 2025: $${endpoint.total_2025}`);
        
    } catch (error) {
        console.error('❌ Error en investigación:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

investigateSpecificCase()
    .then(() => {
        console.log('\n✅ Investigación específica completada');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });