const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function limpiarCHPCompleto() {
    try {
        console.log('🔍 Investigando estructura de tablas CHP...');
        
        // Buscar todas las tablas que podrían tener referencias
        const tables = await pool.query(`
            SELECT 
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE 
                tc.constraint_type = 'FOREIGN KEY' 
                AND ccu.table_name = 'solicitudes_chp'
                AND tc.table_schema = 'copig';
        `);
        
        console.log('📋 Tablas que referencian solicitudes_chp:');
        tables.rows.forEach(row => {
            console.log(`   ${row.table_name}.${row.column_name} → solicitudes_chp.${row.foreign_column_name}`);
        });
        
        // Contar solicitudes actuales
        const countResult = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
        console.log(`📊 Total solicitudes CHP: ${countResult.rows[0].total}`);
        
        // Limpiar cada tabla dependiente
        for (const row of tables.rows) {
            try {
                const deleteResult = await pool.query(`DELETE FROM copig.${row.table_name}`);
                console.log(`🗑️  ${row.table_name}: ${deleteResult.rowCount} registros eliminados`);
            } catch (error) {
                console.log(`⚠️  Error en ${row.table_name}:`, error.message);
            }
        }
        
        // Ahora eliminar las solicitudes
        const deleteResult = await pool.query('DELETE FROM copig.solicitudes_chp');
        console.log(`🗑️  solicitudes_chp: ${deleteResult.rowCount} solicitudes eliminadas`);
        
        // Resetear secuencia
        await pool.query("SELECT setval('copig.chp_numero_seq', 1000, false)");
        console.log('🔄 Secuencia reseteada - próxima será CHP-2025-1001');
        
        // Verificar
        const finalCount = await pool.query('SELECT COUNT(*) as total FROM copig.solicitudes_chp');
        console.log(`✅ Verificación final: ${finalCount.rows[0].total} solicitudes restantes`);
        
        console.log('\n🎉 LIMPIEZA COMPLETA EXITOSA');
        console.log('🌟 El sistema está listo para crear una solicitud desde cero');
        console.log('🔗 Ir a: http://localhost:3030/ → Login con DNI: 99999999');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

limpiarCHPCompleto();