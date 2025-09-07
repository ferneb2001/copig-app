const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function addMontoObraEstimado() {
    try {
        console.log('🏗️  Agregando campo monto_obra_estimado a solicitudes_chp...');
        
        // Verificar si la columna ya existe
        const columnExists = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'copig' 
                AND table_name = 'solicitudes_chp' 
                AND column_name = 'monto_obra_estimado'
            );
        `);
        
        if (columnExists.rows[0].exists) {
            console.log('✅ Columna monto_obra_estimado YA existe');
        } else {
            // Agregar la columna
            await pool.query(`
                ALTER TABLE copig.solicitudes_chp 
                ADD COLUMN monto_obra_estimado DECIMAL(15,2) DEFAULT NULL;
            `);
            
            console.log('✅ Columna monto_obra_estimado agregada exitosamente');
        }
        
        // Agregar comentario descriptivo
        await pool.query(`
            COMMENT ON COLUMN copig.solicitudes_chp.monto_obra_estimado 
            IS 'Monto estimado de la obra informado por el profesional (opcional, como referencia para calcular arancel)';
        `);
        
        console.log('📝 Comentario descriptivo agregado');
        
        // Verificar estructura actualizada
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            AND column_name IN ('monto_obra_estimado', 'arancel_final', 'comitente', 'proyecto')
            ORDER BY column_name;
        `);
        
        console.log('🔍 Columnas relacionadas con montos:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'OPCIONAL' : 'OBLIGATORIO'})`);
        });
        
        console.log('\n🎯 ¡Sistema listo para recibir montos estimados de obras!');
        
    } catch (error) {
        console.error('❌ Error agregando monto_obra_estimado:', error);
    } finally {
        await pool.end();
    }
}

addMontoObraEstimado();