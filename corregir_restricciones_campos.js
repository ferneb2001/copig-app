const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function corregirRestricciones() {
    try {
        console.log('🔧 CORRIGIENDO RESTRICCIONES DE CAMPOS\n');
        
        // 1. Ver estructura actual
        console.log('=== ESTRUCTURA ACTUAL CAMPOS PROBLEMÁTICOS ===');
        const estructura = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            AND column_name IN ('sexo', 'estado_civil', 'nacionalidad', 'provincia')
        `);
        
        estructura.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}(${col.character_maximum_length || 'no limit'})`);
        });
        
        // 2. Ampliar campos restrictivos
        console.log('\n=== AMPLIANDO CAMPOS ===');
        
        const alteraciones = [
            "ALTER TABLE copig.profesionales ALTER COLUMN sexo TYPE VARCHAR(20)",
            "ALTER TABLE copig.profesionales ALTER COLUMN estado_civil TYPE VARCHAR(50)",
            "ALTER TABLE copig.profesionales ALTER COLUMN nacionalidad TYPE VARCHAR(50)",
            "ALTER TABLE copig.profesionales ADD COLUMN IF NOT EXISTS provincia VARCHAR(50)"
        ];
        
        for (const sql of alteraciones) {
            try {
                await pool.query(sql);
                console.log(`✅ ${sql}`);
            } catch (err) {
                console.log(`⚠️ ${sql} - ${err.message}`);
            }
        }
        
        // 3. Verificar cambios
        console.log('\n=== ESTRUCTURA DESPUÉS DE CORRECCIONES ===');
        const nuevaEstructura = await pool.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            AND column_name IN ('sexo', 'estado_civil', 'nacionalidad', 'provincia')
        `);
        
        nuevaEstructura.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type}(${col.character_maximum_length || 'no limit'})`);
        });
        
        console.log('\n✅ RESTRICCIONES CORREGIDAS - LISTO PARA REINTENTO');
        
    } catch (error) {
        console.error('❌ Error corrigiendo restricciones:', error);
    } finally {
        await pool.end();
    }
}

corregirRestricciones().catch(console.error);