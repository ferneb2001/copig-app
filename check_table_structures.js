const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkTableStructures() {
    console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLAS');
    console.log('='.repeat(50));
    
    try {
        // Lista de tablas que podrían tener foreign keys a profesionales
        const tablesToCheck = [
            'restricciones_deudas',
            'sanciones_aplicadas', 
            'cuenta_corriente',
            'comprobantes_pago',
            'notificaciones_chp'
        ];
        
        for (const tableName of tablesToCheck) {
            console.log(`\n📋 Tabla: copig.${tableName}`);
            
            try {
                const columns = await pool.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'copig' 
                    AND table_name = $1
                    ORDER BY ordinal_position
                `, [tableName]);
                
                if (columns.rows.length === 0) {
                    console.log(`   ❌ Tabla no existe`);
                } else {
                    console.log(`   ✅ Columnas encontradas: ${columns.rows.length}`);
                    columns.rows.forEach(col => {
                        console.log(`      - ${col.column_name}: ${col.data_type}`);
                    });
                }
                
                // Verificar si hay registros que referencien profesionales externos
                const hasData = await pool.query(`
                    SELECT COUNT(*) as total FROM copig.${tableName}
                `);
                console.log(`   📊 Total registros: ${hasData.rows[0].total}`);
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
        // Verificar cuáles tablas realmente tienen foreign keys a profesionales
        console.log('\n🔗 FOREIGN KEYS REALES A PROFESIONALES:');
        const realFKs = await pool.query(`
            SELECT 
                tc.table_name,
                kcu.column_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'profesionales'
            AND tc.table_schema = 'copig'
        `);
        
        console.log(`   Encontrados ${realFKs.rows.length} foreign keys reales:`);
        realFKs.rows.forEach(fk => {
            console.log(`   - ${fk.table_name}.${fk.column_name} → profesionales.${fk.foreign_column_name}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

checkTableStructures()
    .then(() => {
        console.log('\n✅ Verificación de estructuras completada');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });