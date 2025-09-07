const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

(async () => {
    try {
        // Ver estructura de la tabla
        const estructura = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `);
        console.log('ESTRUCTURA TABLA:');
        estructura.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}`);
        });
        
        // Ver algunos registros de ejemplo
        const ejemplos = await pool.query(`
            SELECT * FROM copig.pagos_historicos 
            LIMIT 5
        `);
        console.log('\nEJEMPLOS DE PAGOS:');
        ejemplos.rows.forEach(pago => {
            console.log(`ID: ${pago.id}, Matrícula: ${pago.matricula}, Monto: ${pago.monto}, Importe: ${pago.importe}`);
        });
        
        // Contar pagos con monto 0 vs con monto > 0
        const conteo = await pool.query(`
            SELECT 
                COUNT(CASE WHEN monto = 0 OR monto IS NULL THEN 1 END) as montos_cero,
                COUNT(CASE WHEN monto > 0 THEN 1 END) as montos_positivos,
                COUNT(CASE WHEN importe > 0 THEN 1 END) as importes_positivos
            FROM copig.pagos_historicos
        `);
        console.log('\nESTADÍSTICAS:');
        console.log(`  Montos en 0/NULL: ${conteo.rows[0].montos_cero}`);
        console.log(`  Montos > 0: ${conteo.rows[0].montos_positivos}`);
        console.log(`  Importes > 0: ${conteo.rows[0].importes_positivos}`);
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();