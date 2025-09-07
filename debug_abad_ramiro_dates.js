const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugAbadRamiroDates() {
    try {
        console.log('=== INVESTIGANDO FECHAS DE ABAD, RAMIRO ===\n');

        // 1. Buscar ABAD, RAMIRO (ID 9182)
        console.log('1. DATOS DE ABAD, RAMIRO:');
        const profQuery = await pool.query(`
            SELECT p.id, p.nombre, p.numero_documento, m.numero_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = 9182
        `);
        
        if (profQuery.rows.length > 0) {
            const prof = profQuery.rows[0];
            console.log(`   ✅ ${prof.nombre} (ID: ${prof.id}, DNI: ${prof.numero_documento}, Mat: ${prof.numero_matricula})`);
            
            // 2. Ver TODOS los pagos de este profesional
            console.log('\n2. TODOS LOS PAGOS (sin límite):');
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
            `, [prof.id]);
            
            console.log(`   Total de pagos encontrados: ${pagosQuery.rows.length}`);
            
            let validDates = 0;
            let invalidDates = 0;
            
            pagosQuery.rows.forEach((pago, index) => {
                console.log(`\n   Pago ${index + 1}:`);
                console.log(`     fecha_pago (raw): ${pago.fecha_pago}`);
                console.log(`     fecha_pago (type): ${typeof pago.fecha_pago}`);
                console.log(`     importe: $${pago.importe}`);
                
                if (pago.fecha_pago === null || pago.fecha_pago === undefined) {
                    console.log(`     ❌ FECHA NULL`);
                    invalidDates++;
                } else {
                    try {
                        const fechaJS = new Date(pago.fecha_pago);
                        const isValid = !isNaN(fechaJS.getTime());
                        
                        if (isValid) {
                            console.log(`     ✅ FECHA VÁLIDA: ${fechaJS.toLocaleDateString('es-AR')}`);
                            validDates++;
                        } else {
                            console.log(`     ❌ FECHA INVÁLIDA (NaN)`);
                            invalidDates++;
                        }
                    } catch (error) {
                        console.log(`     ❌ ERROR AL PARSEAR: ${error.message}`);
                        invalidDates++;
                    }
                }
            });
            
            console.log(`\n📊 RESUMEN:`);
            console.log(`   ✅ Fechas válidas: ${validDates}`);
            console.log(`   ❌ Fechas inválidas: ${invalidDates}`);
            console.log(`   📈 Porcentaje válidas: ${((validDates / pagosQuery.rows.length) * 100).toFixed(1)}%`);
            
        } else {
            console.log('   ❌ Profesional no encontrado');
        }

        // 3. Buscar fechas problemáticas específicas
        console.log('\n3. BUSCANDO FECHAS ESPECÍFICAMENTE PROBLEMÁTICAS:');
        const problemQuery = await pool.query(`
            SELECT 
                matricula,
                fecha_pago,
                importe,
                COUNT(*) as cantidad
            FROM copig.pagos_historicos 
            WHERE matricula = '9106'
            GROUP BY matricula, fecha_pago, importe
            ORDER BY fecha_pago DESC
            LIMIT 15
        `);
        
        problemQuery.rows.forEach((pago, index) => {
            console.log(`   ${index + 1}. Fecha: ${pago.fecha_pago} | Monto: $${pago.importe} | Cantidad: ${pago.cantidad}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugAbadRamiroDates();