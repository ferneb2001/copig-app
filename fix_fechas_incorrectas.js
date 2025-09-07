const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function analizarFechasIncorrectas() {
    console.log('🔍 Analizando fechas incorrectas en pagos históricos...\n');
    
    try {
        // Contar pagos por año para ver la magnitud del problema
        const queryAnios = `
            SELECT 
                EXTRACT(YEAR FROM fecha_pago) as año,
                COUNT(*) as cantidad,
                MIN(fecha_pago) as fecha_min,
                MAX(fecha_pago) as fecha_max
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NOT NULL
            GROUP BY año
            ORDER BY año DESC
        `;
        
        const resultAnios = await pool.query(queryAnios);
        
        console.log('📅 Distribución de pagos por año:');
        console.log('================================');
        
        let totalFuturos = 0;
        let totalMuyAntiguos = 0;
        
        resultAnios.rows.forEach(row => {
            const año = parseInt(row.año);
            const esIncorrecto = año > 2025 || año < 1980;
            
            if (año > 2025) totalFuturos += parseInt(row.cantidad);
            if (año < 1980) totalMuyAntiguos += parseInt(row.cantidad);
            
            if (esIncorrecto) {
                console.log(`❌ Año ${año}: ${row.cantidad} pagos (${row.fecha_min} - ${row.fecha_max})`);
            } else if (año >= 2020) {
                console.log(`✅ Año ${año}: ${row.cantidad} pagos`);
            }
        });
        
        console.log('\n📊 Resumen de problemas:');
        console.log('========================');
        console.log(`Pagos con fecha futura (>2025): ${totalFuturos}`);
        console.log(`Pagos muy antiguos (<1980): ${totalMuyAntiguos}`);
        
        // Ver algunos ejemplos de fechas incorrectas
        console.log('\n🔍 Ejemplos de fechas incorrectas:');
        console.log('===================================');
        
        const queryEjemplos = `
            SELECT 
                id,
                matricula,
                fecha_pago,
                monto,
                concepto,
                EXTRACT(YEAR FROM fecha_pago) as año
            FROM copig.pagos_historicos 
            WHERE EXTRACT(YEAR FROM fecha_pago) > 2025 
               OR EXTRACT(YEAR FROM fecha_pago) < 1980
            ORDER BY fecha_pago DESC
            LIMIT 20
        `;
        
        const resultEjemplos = await pool.query(queryEjemplos);
        
        resultEjemplos.rows.forEach(row => {
            console.log(`ID: ${row.id} | Mat: ${row.matricula} | Fecha: ${row.fecha_pago} | Monto: $${row.monto} | ${row.concepto || 'Sin descripción'}`);
        });
        
        // Analizar el patrón de las fechas incorrectas
        console.log('\n🔍 Analizando patrón de errores...');
        
        const queryPatron = `
            SELECT 
                fecha_pago::text as fecha_texto,
                COUNT(*) as cantidad
            FROM copig.pagos_historicos 
            WHERE EXTRACT(YEAR FROM fecha_pago) > 2025
            GROUP BY fecha_texto
            ORDER BY cantidad DESC
            LIMIT 10
        `;
        
        const resultPatron = await pool.query(queryPatron);
        
        console.log('\nFechas futuras más comunes:');
        resultPatron.rows.forEach(row => {
            console.log(`${row.fecha_texto}: ${row.cantidad} ocurrencias`);
        });
        
        // Proponer correcciones
        console.log('\n💡 Propuesta de corrección:');
        console.log('============================');
        console.log('Parece que hay un error de tipeo en los años:');
        console.log('- 2202 → probablemente debería ser 2022');
        console.log('- 2102 → probablemente debería ser 2012 o 2021');
        console.log('- 2028 → probablemente debería ser 2024 (o dejar si es pago anticipado)');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

analizarFechasIncorrectas();