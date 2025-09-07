const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testCeccarelli() {
    const client = await pool.connect();
    try {
        console.log('🔍 PROBANDO CECCARELLI - PROFESIONAL CON 105 PAGOS\n');
        
        // Buscar ID de CECCARELLI
        const ceccarelli = await client.query(`
            SELECT pr.id, pr.nombre, pr.numero_documento, m.numero_matricula
            FROM copig.profesionales pr
            JOIN copig.matriculas m ON pr.id = m.profesional_id
            WHERE pr.nombre ILIKE '%CECCARELLI%'
        `);
        
        if (ceccarelli.rows.length > 0) {
            const prof = ceccarelli.rows[0];
            console.log(`✅ Profesional encontrado:`);
            console.log(`   ID: ${prof.id}`);
            console.log(`   Nombre: ${prof.nombre}`);
            console.log(`   DNI: ${prof.numero_documento}`);
            console.log(`   Matrícula: ${prof.numero_matricula}\n`);
            
            // Simular consulta del endpoint corregido
            console.log('🔍 Simulando consulta del endpoint corregido:');
            
            const matriculaNum = prof.numero_matricula || prof.numero_documento;
            const pagos = await client.query(`
                SELECT fecha_pago as fecha, concepto, importe, numero_recibo
                FROM copig.pagos_historicos 
                WHERE matricula = $1 
                ORDER BY fecha_pago DESC
                LIMIT 20
            `, [matriculaNum]);
            
            console.log(`   Pagos encontrados: ${pagos.rows.length}`);
            
            if (pagos.rows.length > 0) {
                const totalPagos = pagos.rows.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0);
                const ultimoPago = pagos.rows[0].fecha;
                
                console.log(`   Total pagado: $${totalPagos.toFixed(2)}`);
                console.log(`   Último pago: ${ultimoPago}`);
                console.log(`   Primeros 3 pagos:`);
                
                pagos.rows.slice(0, 3).forEach((pago, i) => {
                    console.log(`     ${i+1}. ${pago.fecha} - ${pago.concepto} - $${pago.importe} (Recibo: ${pago.numero_recibo})`);
                });
                
                console.log(`\n✅ RESULTADO: El endpoint debería mostrar:`);
                console.log(`   - Total Pagado: $${totalPagos.toFixed(2)}`);
                console.log(`   - Pagos Realizados: ${pagos.rows.length} (de un total mayor)`);
                console.log(`   - Último Pago: ${ultimoPago.toLocaleDateString('es-AR')}`);
                console.log(`   - Estado Financiero: Al día (sin restricciones)`);
                
            } else {
                console.log(`   ❌ No se encontraron pagos (algo está mal)`);
            }
            
        } else {
            console.log('❌ No se encontró CECCARELLI');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

testCeccarelli().catch(console.error);