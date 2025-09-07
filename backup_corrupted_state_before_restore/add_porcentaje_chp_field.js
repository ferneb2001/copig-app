const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function addPorcentajeCHPField() {
    try {
        console.log('🔧 AGREGANDO CAMPO porcentaje_chp A TABLA solicitudes_chp...');
        console.log('════════════════════════════════════════════════════════════');
        
        // Agregar campo porcentaje_chp
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp
            ADD COLUMN IF NOT EXISTS porcentaje_chp DECIMAL(5,2)
        `);
        
        console.log('✅ Campo porcentaje_chp agregado exitosamente');
        
        // Verificar que se agregó correctamente
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp' 
            AND column_name = 'porcentaje_chp'
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ VERIFICACIÓN EXITOSA:');
            console.table(result.rows);
        } else {
            console.log('❌ Error: El campo no se agregó correctamente');
        }
        
        // Mostrar estructura actual de la tabla
        const estructura = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 ESTRUCTURA ACTUAL DE solicitudes_chp:');
        console.table(estructura.rows);
        
        await pool.end();
        console.log('\n🎉 CAMPO AGREGADO EXITOSAMENTE');
        
    } catch (error) {
        console.error('❌ Error agregando campo:', error.message);
        await pool.end();
        process.exit(1);
    }
}

addPorcentajeCHPField();