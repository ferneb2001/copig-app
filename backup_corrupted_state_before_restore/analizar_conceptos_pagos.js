const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

// Según Peñaloza:
// - Concepto 1: Matrícula anual
// - Concepto 4: Pagos válidos (¿cuotas?)
// - Concepto 8: Reinscripciones (multas + matrícula)
// SPRESTRI: Planes de pago con cuotas y vencimientos
// Estado = 1 en SPRESTRI significa pago cumplido

(async () => {
    try {
        console.log('=== ANÁLISIS DE CONCEPTOS DE PAGO SEGÚN PEÑALOZA ===\n');
        
        // 1. Ver qué conceptos existen en la BD
        const conceptos = await pool.query(`
            SELECT DISTINCT detalle, COUNT(*) as cantidad
            FROM copig.pagos_historicos
            WHERE detalle IS NOT NULL
            GROUP BY detalle
            ORDER BY cantidad DESC
            LIMIT 20
        `);
        
        console.log('TOP 20 CONCEPTOS/DETALLES EN PAGOS:');
        conceptos.rows.forEach(c => {
            console.log(`  ${c.detalle}: ${c.cantidad} pagos`);
        });
        
        // 2. Buscar patrones de conceptos 1, 4, 8
        console.log('\n=== BÚSQUEDA DE CONCEPTOS 1, 4, 8 ===');
        
        // Buscar conceptos que contengan '1', '4', '8'
        const patron1 = await pool.query(`
            SELECT COUNT(*) as total, SUM(importe) as monto_total
            FROM copig.pagos_historicos
            WHERE detalle LIKE '%1%' OR detalle LIKE '%MAT%' OR detalle LIKE '%MATRIC%'
        `);
        
        const patron4 = await pool.query(`
            SELECT COUNT(*) as total, SUM(importe) as monto_total
            FROM copig.pagos_historicos
            WHERE detalle LIKE '%4%' OR detalle LIKE '%CUOT%'
        `);
        
        const patron8 = await pool.query(`
            SELECT COUNT(*) as total, SUM(importe) as monto_total
            FROM copig.pagos_historicos
            WHERE detalle LIKE '%8%' OR detalle LIKE '%REINSC%' OR detalle LIKE '%MULTA%'
        `);
        
        console.log(`\nConcepto 1 (Matrículas): ${patron1.rows[0].total} pagos, Total: $${patron1.rows[0].monto_total}`);
        console.log(`Concepto 4 (Cuotas?): ${patron4.rows[0].total} pagos, Total: $${patron4.rows[0].monto_total}`);
        console.log(`Concepto 8 (Reinscripciones): ${patron8.rows[0].total} pagos, Total: $${patron8.rows[0].monto_total}`);
        
        // 3. Ejemplos específicos
        console.log('\n=== EJEMPLOS DE CADA TIPO ===');
        
        const ejemplosMatricula = await pool.query(`
            SELECT matricula, fecha_pago, importe, detalle
            FROM copig.pagos_historicos
            WHERE detalle LIKE '%MAT%' OR detalle LIKE '%DER.INSC%'
            LIMIT 5
        `);
        
        console.log('\nEjemplos de MATRÍCULAS:');
        ejemplosMatricula.rows.forEach(p => {
            console.log(`  Mat ${p.matricula}: ${p.detalle} - $${p.importe} (${new Date(p.fecha_pago).toLocaleDateString()})`);
        });
        
        const ejemplosMultas = await pool.query(`
            SELECT matricula, fecha_pago, importe, detalle
            FROM copig.pagos_historicos
            WHERE detalle LIKE '%MUL%'
            LIMIT 5
        `);
        
        console.log('\nEjemplos de MULTAS:');
        ejemplosMultas.rows.forEach(p => {
            console.log(`  Mat ${p.matricula}: ${p.detalle} - $${p.importe} (${new Date(p.fecha_pago).toLocaleDateString()})`);
        });
        
        // 4. Verificar tabla restricciones (SPRESTRI)
        console.log('\n=== ANÁLISIS DE RESTRICCIONES/PLANES DE PAGO ===');
        
        const restricciones = await pool.query(`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN estado = '1' THEN 1 END) as pagadas,
                   COUNT(CASE WHEN estado != '1' OR estado IS NULL THEN 1 END) as pendientes
            FROM copig.restricciones_deudas
        `);
        
        console.log(`Total restricciones: ${restricciones.rows[0].total}`);
        console.log(`  - Pagadas (estado=1): ${restricciones.rows[0].pagadas}`);
        console.log(`  - Pendientes: ${restricciones.rows[0].pendientes}`);
        
        // 5. Ver estructura de restricciones
        const estructuraRestr = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'copig' AND table_name = 'restricciones_deudas'
            ORDER BY ordinal_position
        `);
        
        console.log('\nESTRUCTURA TABLA RESTRICCIONES:');
        estructuraRestr.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();