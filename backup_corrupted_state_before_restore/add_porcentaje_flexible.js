const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function addPorcentajeFlexible() {
    try {
        console.log('🔧 Agregando campos de porcentaje flexible a aranceles...');
        
        // Agregar campos para porcentaje configurable
        await pool.query(`
            ALTER TABLE copig.aranceles_chp 
            ADD COLUMN IF NOT EXISTS porcentaje_fijo DECIMAL(5,2),
            ADD COLUMN IF NOT EXISTS usar_porcentaje_fijo BOOLEAN DEFAULT false
        `);
        
        console.log('✅ Campos agregados: porcentaje_fijo, usar_porcentaje_fijo');
        
        // Calcular porcentajes actuales y configurarlos como fijos
        const aranceles = await pool.query(`
            SELECT id, segmento, monto_desde, monto_hasta, arancel 
            FROM copig.aranceles_chp 
            WHERE activo = true
        `);
        
        for (let arancel of aranceles.rows) {
            // Calcular porcentaje representativo (punto medio del rango)
            const montoMedio = arancel.monto_hasta 
                ? (parseFloat(arancel.monto_desde) + parseFloat(arancel.monto_hasta)) / 2
                : parseFloat(arancel.monto_desde) * 1.5; // Para segmento C sin límite superior
            
            const porcentaje = (parseFloat(arancel.arancel) / montoMedio * 100);
            
            await pool.query(`
                UPDATE copig.aranceles_chp 
                SET porcentaje_fijo = $1, 
                    usar_porcentaje_fijo = true,
                    observaciones = COALESCE(observaciones, '') || ' - Porcentaje calculado: ' || $1::text || '%'
                WHERE id = $2
            `, [parseFloat(porcentaje.toFixed(2)), arancel.id]);
            
            console.log(`✅ Segmento ${arancel.segmento}: ${porcentaje.toFixed(2)}% configurado`);
        }
        
        // Verificar resultados
        const result = await pool.query(`
            SELECT segmento, nombre_segmento, arancel, porcentaje_fijo, usar_porcentaje_fijo
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.log('📊 ARANCELES CON PORCENTAJES CONFIGURADOS:');
        console.table(result.rows);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

addPorcentajeFlexible();