const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function corregirFechas() {
    console.log('🔧 Iniciando corrección de fechas incorrectas...\n');
    
    try {
        // Primero, hacer backup de los registros que vamos a modificar
        console.log('📦 Creando backup de registros a modificar...');
        
        const queryBackup = `
            CREATE TABLE IF NOT EXISTS copig.pagos_historicos_backup_fechas AS
            SELECT * FROM copig.pagos_historicos 
            WHERE EXTRACT(YEAR FROM fecha_pago) > 2025 
               OR EXTRACT(YEAR FROM fecha_pago) < 1980
        `;
        
        await pool.query(queryBackup);
        console.log('✅ Backup creado en copig.pagos_historicos_backup_fechas\n');
        
        // Corregir fechas futuras específicas
        const correcciones = [
            { incorrecto: 2202, correcto: 2022, descripcion: '2202 → 2022' },
            { incorrecto: 2102, correcto: 2021, descripcion: '2102 → 2021' },
            { incorrecto: 2028, correcto: 2024, descripcion: '2028 → 2024' },
            { incorrecto: 1202, correcto: 2012, descripcion: '1202 → 2012' },
            { incorrecto: 1201, correcto: 2012, descripcion: '1201 → 2012' },
            { incorrecto: 1010, correcto: 2010, descripcion: '1010 → 2010' },
            { incorrecto: 241, correcto: 2024, descripcion: '0241 → 2024' },
            { incorrecto: 201, correcto: 2021, descripcion: '0201 → 2021' }
        ];
        
        console.log('🔧 Aplicando correcciones de años incorrectos:');
        console.log('=============================================');
        
        for (const corr of correcciones) {
            const queryCorregir = `
                UPDATE copig.pagos_historicos
                SET fecha_pago = fecha_pago + INTERVAL '${corr.correcto - corr.incorrecto} years'
                WHERE EXTRACT(YEAR FROM fecha_pago) = $1
                RETURNING id
            `;
            
            const result = await pool.query(queryCorregir, [corr.incorrecto]);
            console.log(`✅ ${corr.descripcion}: ${result.rowCount} registros corregidos`);
        }
        
        // Para fechas muy antiguas (1950-1979), asumimos que el siglo está mal
        // 1979 → 2019, 1978 → 2018, etc.
        console.log('\n🔧 Corrigiendo fechas del siglo XX (1950-1979):');
        console.log('================================================');
        
        for (let year = 1950; year <= 1979; year++) {
            const newYear = year + 40; // 1979 → 2019, 1950 → 1990
            
            const queryCorregir = `
                UPDATE copig.pagos_historicos
                SET fecha_pago = fecha_pago + INTERVAL '${newYear - year} years'
                WHERE EXTRACT(YEAR FROM fecha_pago) = $1
                RETURNING id
            `;
            
            const result = await pool.query(queryCorregir, [year]);
            if (result.rowCount > 0) {
                console.log(`✅ ${year} → ${newYear}: ${result.rowCount} registros corregidos`);
            }
        }
        
        // Verificar resultados
        console.log('\n📊 Verificando resultados de la corrección:');
        console.log('==========================================');
        
        const queryVerificar = `
            SELECT 
                EXTRACT(YEAR FROM fecha_pago) as año,
                COUNT(*) as cantidad
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NOT NULL
                AND (EXTRACT(YEAR FROM fecha_pago) > 2025 
                    OR EXTRACT(YEAR FROM fecha_pago) < 1980)
            GROUP BY año
            ORDER BY año DESC
        `;
        
        const resultVerificar = await pool.query(queryVerificar);
        
        if (resultVerificar.rows.length === 0) {
            console.log('✅ ¡Todas las fechas incorrectas han sido corregidas!');
        } else {
            console.log('⚠️ Aún quedan fechas por corregir:');
            resultVerificar.rows.forEach(row => {
                console.log(`Año ${row.año}: ${row.cantidad} registros`);
            });
        }
        
        // Mostrar resumen final
        console.log('\n📈 Resumen final:');
        console.log('================');
        
        const queryResumen = `
            SELECT 
                MIN(fecha_pago) as fecha_mas_antigua,
                MAX(fecha_pago) as fecha_mas_reciente,
                COUNT(*) as total_pagos
            FROM copig.pagos_historicos 
            WHERE fecha_pago IS NOT NULL
        `;
        
        const resultResumen = await pool.query(queryResumen);
        const resumen = resultResumen.rows[0];
        
        console.log(`Total de pagos: ${resumen.total_pagos}`);
        console.log(`Fecha más antigua: ${new Date(resumen.fecha_mas_antigua).toLocaleDateString('es-AR')}`);
        console.log(`Fecha más reciente: ${new Date(resumen.fecha_mas_reciente).toLocaleDateString('es-AR')}`);
        
        console.log('\n✅ Corrección completada exitosamente');
        console.log('💾 Backup guardado en: copig.pagos_historicos_backup_fechas');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️ Para revertir los cambios:');
        console.log('DELETE FROM copig.pagos_historicos;');
        console.log('INSERT INTO copig.pagos_historicos SELECT * FROM copig.pagos_historicos_backup_fechas;');
    } finally {
        await pool.end();
    }
}

// Ejecutar
corregirFechas();