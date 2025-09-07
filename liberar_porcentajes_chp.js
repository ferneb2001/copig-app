const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function liberarPorcentajes() {
    try {
        console.log('🔧 LIBERANDO PORCENTAJES CHP - Haciendo configurable...');
        console.log('════════════════════════════════════════════════════════════');
        
        // Deshabilitar uso de porcentaje fijo para todos los segmentos
        const result = await pool.query(`
            UPDATE copig.aranceles_chp 
            SET usar_porcentaje_fijo = false,
                porcentaje_fijo = NULL
            WHERE activo = true
        `);
        
        console.log(`✅ ${result.rowCount} aranceles liberados del porcentaje fijo`);
        
        // Verificar el cambio
        const verificacion = await pool.query(`
            SELECT segmento, nombre_segmento, arancel, porcentaje_fijo, usar_porcentaje_fijo
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.log('\n📊 ESTADO ACTUAL DE ARANCELES:');
        console.table(verificacion.rows);
        
        console.log('\n🎉 RESULTADO FINAL:');
        console.log('✅ Porcentajes fijos DESHABILITADOS');
        console.log('✅ Aranceles ahora son 100% configurables');
        console.log('✅ Staff puede ingresar cualquier monto sin restricciones');
        console.log('✅ No hay más dependencia del 9.19% hardcodeado');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error liberando porcentajes:', error.message);
        await pool.end();
        process.exit(1);
    }
}

liberarPorcentajes();