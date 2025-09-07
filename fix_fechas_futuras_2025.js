const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function corregirFechasFuturas2025() {
    console.log('🔧 Corrigiendo fechas futuras de 2025...\n');
    console.log('📅 Fecha actual: 3 de Septiembre 2025');
    console.log('⚠️  Detectando pagos posteriores a septiembre 2025...\n');
    
    try {
        // Primero analizar qué tenemos
        const queryAnalisis = `
            SELECT 
                EXTRACT(MONTH FROM fecha_pago) as mes,
                EXTRACT(YEAR FROM fecha_pago) as año,
                COUNT(*) as cantidad,
                MIN(fecha_pago) as fecha_min,
                MAX(fecha_pago) as fecha_max
            FROM copig.pagos_historicos 
            WHERE fecha_pago > '2025-09-03'
                AND fecha_pago < '2026-01-01'
            GROUP BY año, mes
            ORDER BY año DESC, mes DESC
        `;
        
        const resultAnalisis = await pool.query(queryAnalisis);
        
        if (resultAnalisis.rows.length > 0) {
            console.log('📊 Pagos futuros detectados:');
            console.log('============================');
            resultAnalisis.rows.forEach(row => {
                const mesNombre = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][row.mes];
                console.log(`${mesNombre} ${row.año}: ${row.cantidad} pagos`);
            });
            
            // Ver algunos ejemplos
            console.log('\n🔍 Ejemplos de pagos futuros:');
            const queryEjemplos = `
                SELECT 
                    id,
                    matricula,
                    fecha_pago,
                    concepto,
                    EXTRACT(MONTH FROM fecha_pago) as mes,
                    EXTRACT(DAY FROM fecha_pago) as dia
                FROM copig.pagos_historicos 
                WHERE fecha_pago > '2025-09-03'
                    AND fecha_pago < '2026-01-01'
                ORDER BY fecha_pago DESC
                LIMIT 10
            `;
            
            const resultEjemplos = await pool.query(queryEjemplos);
            resultEjemplos.rows.forEach(row => {
                console.log(`Mat ${row.matricula}: ${row.dia}/${row.mes}/2025 - ${row.concepto || 'Sin descripción'}`);
            });
            
            // Hacer backup antes de corregir
            console.log('\n📦 Creando backup de seguridad...');
            const queryBackup = `
                CREATE TABLE IF NOT EXISTS copig.pagos_futuros_2025_backup AS
                SELECT * FROM copig.pagos_historicos 
                WHERE fecha_pago > '2025-09-03'
                    AND fecha_pago < '2026-01-01'
            `;
            await pool.query(queryBackup);
            
            // Propuesta: Cambiar dic 2025 → dic 2024, nov 2025 → nov 2024, oct 2025 → oct 2024
            console.log('\n🔧 Aplicando corrección (restando 1 año a fechas futuras):');
            console.log('=========================================================');
            
            const queryCorregir = `
                UPDATE copig.pagos_historicos
                SET fecha_pago = fecha_pago - INTERVAL '1 year'
                WHERE fecha_pago > '2025-09-03'
                    AND fecha_pago < '2026-01-01'
                RETURNING id, matricula, fecha_pago
            `;
            
            const resultCorregir = await pool.query(queryCorregir);
            console.log(`✅ ${resultCorregir.rowCount} pagos corregidos (movidos a 2024)`);
            
            // Verificar resultado
            console.log('\n📊 Verificación post-corrección:');
            const queryVerificar = `
                SELECT 
                    COUNT(*) as pagos_futuros
                FROM copig.pagos_historicos 
                WHERE fecha_pago > CURRENT_DATE
            `;
            
            const resultVerificar = await pool.query(queryVerificar);
            const pagosFuturos = resultVerificar.rows[0].pagos_futuros;
            
            if (pagosFuturos === '0') {
                console.log('✅ ¡Perfecto! Ya no hay pagos con fechas futuras');
            } else {
                console.log(`⚠️ Aún quedan ${pagosFuturos} pagos con fechas futuras (revisar manualmente)`);
            }
            
        } else {
            console.log('✅ No se encontraron pagos con fechas futuras');
        }
        
        // Resumen final
        console.log('\n📈 Resumen del sistema de pagos:');
        console.log('================================');
        
        const queryResumen = `
            SELECT 
                COUNT(*) as total_pagos,
                MIN(fecha_pago) as fecha_mas_antigua,
                MAX(fecha_pago) as fecha_mas_reciente,
                COUNT(CASE WHEN fecha_pago > CURRENT_DATE THEN 1 END) as pagos_futuros
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NOT NULL
        `;
        
        const resultResumen = await pool.query(queryResumen);
        const resumen = resultResumen.rows[0];
        
        console.log(`Total de pagos: ${resumen.total_pagos}`);
        console.log(`Rango de fechas: ${new Date(resumen.fecha_mas_antigua).toLocaleDateString('es-AR')} - ${new Date(resumen.fecha_mas_reciente).toLocaleDateString('es-AR')}`);
        console.log(`Pagos con fecha futura: ${resumen.pagos_futuros}`);
        
        console.log('\n✅ Corrección completada');
        console.log('💾 Backup guardado en: copig.pagos_futuros_2025_backup');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar
corregirFechasFuturas2025();