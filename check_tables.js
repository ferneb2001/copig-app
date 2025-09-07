const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function checkTableStructure() {
    console.log('🔍 ESTRUCTURA DE TABLAS');
    console.log('=======================\n');
    
    try {
        // 1. Estructura tabla profesionales
        console.log('1. Tabla copig.profesionales:');
        const profColumns = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        
        profColumns.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // 2. Consulta funcional básica
        console.log('\n2. Probando consulta básica profesionales...');
        const testQuery = `
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                p.email
            FROM copig.profesionales p
            LIMIT 3
        `;
        
        const testResult = await pool.query(testQuery);
        console.log(`✅ Consulta básica OK: ${testResult.rows.length} profesionales`);
        testResult.rows.forEach(prof => {
            console.log(`   ${prof.nombre} - DNI: ${prof.numero_documento}`);
        });
        
        // 3. Tabla empresas
        console.log('\n3. Tabla copig.empresas:');
        const empColumns = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'empresas'
            ORDER BY ordinal_position
        `);
        
        empColumns.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type}`);
        });
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    } finally {
        await pool.end();
    }
}

checkTableStructure();