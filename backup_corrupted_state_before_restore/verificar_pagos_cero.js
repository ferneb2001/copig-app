const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

(async () => {
    try {
        // Verificar registros específicos que mencionó Fernando
        const ids = [123042, 123041, 123040, 123039, 123037];
        
        console.log('VERIFICANDO REGISTROS ESPECÍFICOS:');
        console.log('=====================================');
        
        for (const id of ids) {
            const result = await pool.query(
                'SELECT * FROM copig.pagos_historicos WHERE id = $1',
                [id]
            );
            
            if (result.rows.length > 0) {
                const pago = result.rows[0];
                console.log(`\nID: ${pago.id}`);
                console.log(`  Matrícula: ${pago.matricula}`);
                console.log(`  Fecha: ${pago.fecha_pago}`);
                console.log(`  Importe: ${pago.importe}`);
                console.log(`  Detalle: ${pago.detalle}`);
                console.log(`  Concepto: ${pago.concepto}`);
                console.log(`  Estado: ${pago.estado}`);
            }
        }
        
        // Ver estadísticas generales de los últimos registros
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN importe = 0 OR importe IS NULL THEN 1 END) as con_cero,
                COUNT(CASE WHEN importe > 0 THEN 1 END) as con_importe,
                COUNT(CASE WHEN detalle IS NOT NULL THEN 1 END) as con_detalle,
                COUNT(CASE WHEN detalle IS NULL THEN 1 END) as sin_detalle,
                AVG(CASE WHEN importe > 0 THEN importe END) as promedio_importe
            FROM copig.pagos_historicos
            WHERE id >= 123000
        `);
        
        console.log('\n\nESTADÍSTICAS DE ÚLTIMOS REGISTROS (ID >= 123000):');
        console.log('==================================================');
        console.log('Total registros:', stats.rows[0].total);
        console.log('Con importe 0/NULL:', stats.rows[0].con_cero);
        console.log('Con importe > 0:', stats.rows[0].con_importe);
        console.log('Con detalle:', stats.rows[0].con_detalle);
        console.log('SIN detalle:', stats.rows[0].sin_detalle);
        console.log('Promedio importe (cuando > 0):', stats.rows[0].promedio_importe);
        
        // Ver algunos ejemplos con importe > 0
        const ejemplos = await pool.query(`
            SELECT id, matricula, importe, detalle
            FROM copig.pagos_historicos
            WHERE id >= 123000 AND importe > 0
            LIMIT 5
        `);
        
        console.log('\n\nEJEMPLOS CON IMPORTE > 0:');
        console.log('=========================');
        ejemplos.rows.forEach(p => {
            console.log(`ID ${p.id}: Mat ${p.matricula}, $${p.importe}, ${p.detalle || 'sin detalle'}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();