const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkTableStructure() {
    try {
        console.log('=== ESTRUCTURA DE TABLAS ===\n');
        
        // Verificar tabla matriculas
        console.log('1. TABLA MATRICULAS:');
        const matriculasQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'matriculas' 
              AND table_schema = 'copig' 
            ORDER BY ordinal_position
        `;
        
        const matriculasResult = await pool.query(matriculasQuery);
        if (matriculasResult.rows.length > 0) {
            matriculasResult.rows.forEach(row => {
                console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
            });
        } else {
            console.log('   ❌ Tabla matriculas no encontrada en schema copig');
            
            // Buscar en todos los schemas
            const allMatriculasQuery = `
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_name LIKE '%matric%'
            `;
            const allResult = await pool.query(allMatriculasQuery);
            console.log('   Tablas con "matric" encontradas:');
            allResult.rows.forEach(row => {
                console.log(`   - ${row.table_schema}.${row.table_name}`);
            });
        }
        
        // Verificar tabla profesionales
        console.log('\n2. TABLA PROFESIONALES:');
        const profesionalesQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'profesionales' 
              AND table_schema = 'copig' 
            ORDER BY ordinal_position
        `;
        
        const profesionalesResult = await pool.query(profesionalesQuery);
        if (profesionalesResult.rows.length > 0) {
            profesionalesResult.rows.forEach(row => {
                console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
            });
        } else {
            console.log('   ❌ Tabla profesionales no encontrada en schema copig');
        }
        
        // Verificar todos los schemas y tablas
        console.log('\n3. TODOS LOS SCHEMAS Y TABLAS:');
        const allTablesQuery = `
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY table_schema, table_name
        `;
        
        const allTablesResult = await pool.query(allTablesQuery);
        allTablesResult.rows.forEach(row => {
            console.log(`   - ${row.table_schema}.${row.table_name}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTableStructure();