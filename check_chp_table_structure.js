const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function checkTableStructure() {
    try {
        console.log('🔍 Verificando estructura de tabla copig.solicitudes_chp...');
        
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position;
        `);
        
        console.log('📋 Estructura actual de solicitudes_chp:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        // Verificar si existe arancel_final
        const hasArancel = result.rows.find(row => row.column_name === 'arancel_final');
        
        if (!hasArancel) {
            console.log('\n⚠️  Columna arancel_final NO encontrada. Agregándola...');
            
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN arancel_final DECIMAL(12,2) DEFAULT 0.00;
            `);
            
            console.log('✅ Columna arancel_final agregada exitosamente');
        } else {
            console.log('\n✅ Columna arancel_final YA existe');
        }
        
        console.log('\n🎯 Tabla preparada para recibir modificaciones del staff');
        
    } catch (error) {
        console.error('❌ Error verificando estructura:', error);
    } finally {
        await pool.end();
    }
}

checkTableStructure();