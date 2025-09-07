const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugInvalidDates() {
    try {
        console.log('=== INVESTIGANDO FECHAS INVÁLIDAS EN PAGOS ===\n');

        // 1. Buscar profesional ABAURRE,HUGO ANIBAL
        console.log('1. BUSCANDO PROFESIONAL ABAURRE,HUGO ANIBAL:');
        const profQuery = await pool.query(`
            SELECT p.id, p.nombre, m.numero_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.nombre ILIKE '%ABAURRE,HUGO%'
        `);
        
        if (profQuery.rows.length > 0) {
            const prof = profQuery.rows[0];
            console.log(`   ✅ Encontrado: ${prof.nombre} (ID: ${prof.id}, Mat: ${prof.numero_matricula})`);
            
            // 2. Ver pagos de este profesional
            console.log(`\n2. PAGOS DE ${prof.nombre}:`);
            const pagosQuery = await pool.query(`
                SELECT 
                    ph.fecha_pago,
                    ph.importe,
                    ph.concepto,
                    ph.detalle,
                    ph.estado
                FROM copig.pagos_historicos ph
                LEFT JOIN copig.matriculas m ON m.numero_matricula::TEXT = ph.matricula
                WHERE m.profesional_id = $1
                ORDER BY ph.fecha_pago DESC
                LIMIT 10
            `, [prof.id]);
            
            pagosQuery.rows.forEach((pago, index) => {
                console.log(`\n   Pago ${index + 1}:`);
                console.log(`     fecha_pago (raw): ${pago.fecha_pago}`);
                console.log(`     fecha_pago (type): ${typeof pago.fecha_pago}`);
                console.log(`     importe: $${pago.importe}`);
                console.log(`     concepto: ${pago.concepto || 'NULL'}`);
                console.log(`     detalle: ${pago.detalle || 'NULL'}`);
                console.log(`     estado: ${pago.estado || 'NULL'}`);
                
                // Probar conversiones de fecha
                if (pago.fecha_pago) {
                    try {
                        const fechaJS = new Date(pago.fecha_pago);
                        console.log(`     fecha_pago (new Date): ${fechaJS}`);
                        console.log(`     fecha_pago (isValid): ${!isNaN(fechaJS.getTime())}`);
                        console.log(`     fecha_pago (toLocaleDateString): ${fechaJS.toLocaleDateString('es-AR')}`);
                    } catch (error) {
                        console.log(`     ❌ Error conversión fecha: ${error.message}`);
                    }
                } else {
                    console.log(`     ⚠️ fecha_pago es NULL o undefined`);
                }
            });
            
        } else {
            console.log('   ❌ Profesional no encontrado');
        }

        // 3. Buscar fechas problemáticas en toda la tabla
        console.log('\n3. BUSCANDO FECHAS PROBLEMÁTICAS EN TODA LA TABLA:');
        const problemDatesQuery = await pool.query(`
            SELECT 
                matricula,
                fecha_pago,
                importe,
                concepto,
                detalle
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NULL 
            OR EXTRACT(YEAR FROM fecha_pago) > 2025
            OR EXTRACT(YEAR FROM fecha_pago) < 1950
            LIMIT 10
        `);
        
        console.log(`   Encontrados ${problemDatesQuery.rows.length} registros con fechas problemáticas:`);
        problemDatesQuery.rows.forEach((pago, index) => {
            console.log(`   ${index + 1}. Mat: ${pago.matricula}, Fecha: ${pago.fecha_pago}, Monto: $${pago.importe}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugInvalidDates();