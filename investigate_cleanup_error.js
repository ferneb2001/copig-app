const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigateError() {
    console.log('🔍 INVESTIGANDO ERROR EN LIMPIEZA');
    console.log('='.repeat(50));
    
    try {
        // Verificar triggers en la tabla profesionales
        console.log('1️⃣ Verificando triggers en tabla profesionales...');
        const triggers = await pool.query(`
            SELECT 
                trigger_name, 
                event_manipulation, 
                action_statement,
                action_timing
            FROM information_schema.triggers 
            WHERE event_object_table = 'profesionales'
            AND event_object_schema = 'copig'
        `);
        
        console.log(`   Triggers encontrados: ${triggers.rows.length}`);
        triggers.rows.forEach(trigger => {
            console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation} ${trigger.action_timing}`);
        });
        
        // Verificar constraints
        console.log('\n2️⃣ Verificando constraints...');
        const constraints = await pool.query(`
            SELECT 
                constraint_name,
                constraint_type,
                table_name
            FROM information_schema.table_constraints 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
        `);
        
        console.log(`   Constraints encontrados: ${constraints.rows.length}`);
        constraints.rows.forEach(constraint => {
            console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
        });
        
        // Verificar foreign keys que referencian profesionales
        console.log('\n3️⃣ Verificando foreign keys que referencian profesionales...');
        const foreignKeys = await pool.query(`
            SELECT 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
            WHERE constraint_type = 'FOREIGN KEY' 
            AND ccu.table_name='profesionales'
            AND tc.table_schema = 'copig'
        `);
        
        console.log(`   Foreign keys encontrados: ${foreignKeys.rows.length}`);
        foreignKeys.rows.forEach(fk => {
            console.log(`   - ${fk.table_name}.${fk.column_name} → profesionales.${fk.foreign_column_name}`);
        });
        
        // Intentar una eliminación simple para ver el error específico
        console.log('\n4️⃣ Intentando eliminación de prueba...');
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Intentar eliminar UN profesional externo para ver el error
            const testDelete = await client.query(`
                DELETE FROM copig.profesionales 
                WHERE provincia != 'Mendoza' AND activo = true
                LIMIT 1
            `);
            
            console.log(`   ✅ Prueba exitosa - eliminado ${testDelete.rowCount} profesional`);
            await client.query('ROLLBACK'); // Revertir la prueba
            
        } catch (error) {
            console.log(`   ❌ Error en prueba: ${error.message}`);
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
        
        // Verificar si hay alguna función o trigger personalizado
        console.log('\n5️⃣ Verificando funciones personalizadas...');
        const functions = await pool.query(`
            SELECT 
                routine_name,
                routine_type
            FROM information_schema.routines 
            WHERE routine_schema = 'copig'
            AND routine_name LIKE '%profesional%'
        `);
        
        console.log(`   Funciones encontradas: ${functions.rows.length}`);
        functions.rows.forEach(func => {
            console.log(`   - ${func.routine_name}: ${func.routine_type}`);
        });
        
    } catch (error) {
        console.error('❌ Error en investigación:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

investigateError()
    .then(() => {
        console.log('\n✅ Investigación completada');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });