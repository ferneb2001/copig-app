const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function testArancelesLibres() {
    try {
        console.log('🧪 PROBANDO ARANCELES LIBRES...');
        console.log('════════════════════════════════════');
        
        // Simular diferentes montos de honorarios
        const testCases = [
            { honorarios: 300000, descripcion: 'Segmento A - Básico' },
            { honorarios: 5000000, descripcion: 'Segmento B - Intermedio' },
            { honorarios: 15000000, descripcion: 'Segmento C - Superior' },
            { honorarios: 1000000, descripcion: 'Monto personalizado 1' },
            { honorarios: 50000000, descripcion: 'Monto alto personalizado' }
        ];
        
        console.log('📋 CASOS DE PRUEBA:');
        
        for (const test of testCases) {
            // Simular la lógica de cálculo actual del servidor
            const arancelResult = await pool.query(`
                SELECT 
                    segmento, 
                    nombre_segmento, 
                    arancel, 
                    porcentaje_fijo,
                    usar_porcentaje_fijo,
                    CASE 
                        WHEN usar_porcentaje_fijo = true AND porcentaje_fijo IS NOT NULL 
                        THEN ($1 * porcentaje_fijo / 100)
                        ELSE arancel
                    END as arancel_calculado
                FROM copig.aranceles_chp 
                WHERE $1 >= monto_desde 
                AND $1 <= monto_hasta 
                AND activo = true
                ORDER BY monto_desde DESC
                LIMIT 1
            `, [test.honorarios]);
            
            if (arancelResult.rows.length > 0) {
                const arancel = arancelResult.rows[0];
                console.log(`\n💰 ${test.descripcion}:`);
                console.log(`   Honorarios: $${test.honorarios.toLocaleString('es-AR')}`);
                console.log(`   Segmento: ${arancel.segmento} - ${arancel.nombre_segmento}`);
                console.log(`   Arancel fijo: $${parseFloat(arancel.arancel).toLocaleString('es-AR')}`);
                console.log(`   Usa porcentaje: ${arancel.usar_porcentaje_fijo}`);
                console.log(`   Porcentaje: ${arancel.porcentaje_fijo || 'N/A'}`);
                console.log(`   ✅ RESULTADO: $${parseFloat(arancel.arancel_calculado).toLocaleString('es-AR')}`);
            } else {
                console.log(`\n❌ ${test.descripcion}:`);
                console.log(`   Honorarios: $${test.honorarios.toLocaleString('es-AR')}`);
                console.log(`   ⚠️  Sin segmento encontrado - Fuera de rangos`);
            }
        }
        
        // Verificar estado actual de la configuración
        console.log('\n📊 CONFIGURACIÓN ACTUAL:');
        const config = await pool.query(`
            SELECT 
                segmento,
                nombre_segmento,
                monto_desde,
                monto_hasta,
                arancel,
                porcentaje_fijo,
                usar_porcentaje_fijo
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.table(config.rows);
        
        console.log('\n🎯 CONCLUSIONES:');
        const todosLibres = config.rows.every(row => !row.usar_porcentaje_fijo);
        
        if (todosLibres) {
            console.log('✅ ÉXITO: Todos los aranceles están liberados');
            console.log('✅ No hay dependencia de porcentajes fijos');
            console.log('✅ Staff puede configurar cualquier monto manualmente');
            console.log('✅ Sistema completamente flexible');
        } else {
            console.log('❌ PROBLEMA: Algunos aranceles aún usan porcentaje fijo');
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testArancelesLibres();