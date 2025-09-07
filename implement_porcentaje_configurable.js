const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function implementPorcentajeConfigurable() {
    try {
        console.log('🔧 IMPLEMENTANDO PORCENTAJE CONFIGURABLE...');
        console.log('════════════════════════════════════════════════');
        
        // Agregar campo para porcentaje configurable
        await pool.query(`
            ALTER TABLE copig.aranceles_chp
            ADD COLUMN IF NOT EXISTS porcentaje_sugerido DECIMAL(5,2) DEFAULT 26.33
        `);
        
        console.log('✅ Campo porcentaje_sugerido agregado');
        
        // Configurar porcentajes sugeridos por defecto
        await pool.query(`
            UPDATE copig.aranceles_chp 
            SET porcentaje_sugerido = 26.33
            WHERE segmento = 'A'
        `);
        
        await pool.query(`
            UPDATE copig.aranceles_chp 
            SET porcentaje_sugerido = 2.24
            WHERE segmento = 'B'
        `);
        
        await pool.query(`
            UPDATE copig.aranceles_chp 
            SET porcentaje_sugerido = 1.17
            WHERE segmento = 'C'
        `);
        
        console.log('✅ Porcentajes sugeridos configurados');
        
        // Verificar implementación
        const result = await pool.query(`
            SELECT 
                segmento,
                nombre_segmento,
                arancel,
                porcentaje_sugerido,
                ROUND(arancel / (porcentaje_sugerido / 100)) as honorarios_calculados
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.log('\n📊 CONFIGURACIÓN CON PORCENTAJES EDITABLES:');
        console.table(result.rows);
        
        console.log('\n🎯 NUEVO FLUJO:');
        console.log('1. Admin ve arancel fijo: $79.000');
        console.log('2. Admin edita porcentaje: ej. 25%');
        console.log('3. Sistema calcula honorarios: $79.000 ÷ 25% = $316.000');
        console.log('4. Se muestra: "25% de $316.000 = $79.000"');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

implementPorcentajeConfigurable();