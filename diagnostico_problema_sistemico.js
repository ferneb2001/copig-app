const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function diagnosticoSistemico() {
    try {
        console.log('🚨 DIAGNÓSTICO PROBLEMA SISTÉMICO - TODOS LOS PROFESIONALES\n');
        
        // 1. Estadísticas generales
        console.log('=== ESTADÍSTICAS GENERALES ===');
        const totalProfesionales = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        const totalMatriculas = await pool.query('SELECT COUNT(*) as total FROM copig.matriculas');
        const totalPagos = await pool.query('SELECT COUNT(*) as total FROM copig.pagos_historicos');
        
        console.log(`Total profesionales: ${totalProfesionales.rows[0].total}`);
        console.log(`Total matrículas: ${totalMatriculas.rows[0].total}`);
        console.log(`Total pagos históricos: ${totalPagos.rows[0].total}`);
        
        // 2. Problema "Sin matrícula"
        console.log('\n=== PROBLEMA "SIN MATRÍCULA" ===');
        const profesionalesSinMatricula = await pool.query(`
            SELECT COUNT(*) as sin_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.profesional_id IS NULL
        `);
        
        const profesionalesConMatricula = await pool.query(`
            SELECT COUNT(*) as con_matricula
            FROM copig.profesionales p
            INNER JOIN copig.matriculas m ON p.id = m.profesional_id
        `);
        
        console.log(`Profesionales SIN matrícula: ${profesionalesSinMatricula.rows[0].sin_matricula}`);
        console.log(`Profesionales CON matrícula: ${profesionalesConMatricula.rows[0].con_matricula}`);
        
        // 3. Problema fechas futuras
        console.log('\n=== PROBLEMA FECHAS FUTURAS ===');
        const fechasFuturas = await pool.query(`
            SELECT COUNT(*) as fechas_futuras
            FROM copig.pagos_historicos 
            WHERE fecha_pago > CURRENT_DATE
        `);
        
        const fechasAno2025 = await pool.query(`
            SELECT COUNT(*) as fechas_2025
            FROM copig.pagos_historicos 
            WHERE EXTRACT(YEAR FROM fecha_pago) = 2025
        `);
        
        console.log(`Pagos con fechas futuras: ${fechasFuturas.rows[0].fechas_futuras}`);
        console.log(`Pagos en año 2025: ${fechasAno2025.rows[0].fechas_2025}`);
        
        // 4. Ejemplos de fechas problemáticas
        console.log('\n=== EJEMPLOS FECHAS PROBLEMÁTICAS ===');
        const ejemplosFechas = await pool.query(`
            SELECT matricula, fecha_pago, importe, concepto
            FROM copig.pagos_historicos 
            WHERE fecha_pago > CURRENT_DATE
            ORDER BY fecha_pago DESC
            LIMIT 5
        `);
        
        ejemplosFechas.rows.forEach(pago => {
            console.log(`Matrícula ${pago.matricula}: ${pago.fecha_pago} - $${pago.importe} - ${pago.concepto || pago.detalle || 'Sin concepto'}`);
        });
        
        // 5. Problema totales en $0.00
        console.log('\n=== PROBLEMA CÁLCULOS $0.00 ===');
        const pagosConImporteCero = await pool.query(`
            SELECT COUNT(*) as pagos_cero
            FROM copig.pagos_historicos 
            WHERE importe = 0 OR importe IS NULL
        `);
        
        const pagosConImporte = await pool.query(`
            SELECT COUNT(*) as pagos_con_importe
            FROM copig.pagos_historicos 
            WHERE importe > 0
        `);
        
        console.log(`Pagos con importe $0.00 o NULL: ${pagosConImporteCero.rows[0].pagos_cero}`);
        console.log(`Pagos con importe > $0.00: ${pagosConImporte.rows[0].pagos_con_importe}`);
        
        // 6. Verificar endpoint que usa el admin
        console.log('\n=== VERIFICAR ENDPOINT ADMIN ===');
        console.log('Buscando código que genera "Sin matrícula"...');
        
        // 7. Datos faltantes masivos
        console.log('\n=== DATOS FALTANTES MASIVOS ===');
        const datosFaltantes = await pool.query(`
            SELECT 
                COUNT(CASE WHEN telefono IS NULL OR telefono = '' THEN 1 END) as sin_telefono,
                COUNT(CASE WHEN domicilio IS NULL OR domicilio = '' THEN 1 END) as sin_domicilio,
                COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as sin_email,
                COUNT(*) as total_profesionales
            FROM copig.profesionales
        `);
        
        const stats = datosFaltantes.rows[0];
        console.log(`Sin teléfono: ${stats.sin_telefono}/${stats.total_profesionales} (${Math.round(stats.sin_telefono/stats.total_profesionales*100)}%)`);
        console.log(`Sin domicilio: ${stats.sin_domicilio}/${stats.total_profesionales} (${Math.round(stats.sin_domicilio/stats.total_profesionales*100)}%)`);
        console.log(`Sin email: ${stats.sin_email}/${stats.total_profesionales} (${Math.round(stats.sin_email/stats.total_profesionales*100)}%)`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

diagnosticoSistemico();