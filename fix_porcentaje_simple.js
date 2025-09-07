const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function fixPorcentajeSimple() {
    try {
        console.log('🔧 Configurando porcentajes flexibles...');
        
        // Actualizar cada segmento por separado
        await pool.query(`
            UPDATE copig.aranceles_chp 
            SET porcentaje_fijo = 9.19, 
                usar_porcentaje_fijo = true
            WHERE segmento = 'A'
        `);
        
        await pool.query(`
            UPDATE copig.aranceles_chp 
            SET porcentaje_fijo = 3.65, 
                usar_porcentaje_fijo = true
            WHERE segmento = 'B'
        `);
        
        await pool.query(`
            UPDATE copig.aranceles_chp 
            SET porcentaje_fijo = 2.24, 
                usar_porcentaje_fijo = true
            WHERE segmento = 'C'
        `);
        
        console.log('✅ Porcentajes configurados:');
        console.log('   Segmento A: 9.19%');
        console.log('   Segmento B: 3.65%'); 
        console.log('   Segmento C: 2.24%');
        
        // Verificar resultados
        const result = await pool.query(`
            SELECT segmento, nombre_segmento, arancel, porcentaje_fijo, usar_porcentaje_fijo
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.log('📊 ARANCELES ACTUALIZADOS:');
        console.table(result.rows);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

fixPorcentajeSimple();