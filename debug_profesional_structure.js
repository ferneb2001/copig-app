const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugProfesionalStructure() {
    try {
        console.log('=== INVESTIGANDO DATOS FALTANTES EN PROFESIONAL ===\n');
        
        // 1. Ver estructura de tabla profesionales
        console.log('1. ESTRUCTURA TABLA PROFESIONALES:');
        const profStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        
        profStructure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        // 2. Ver datos reales de ABAD, CARLOS ADRIAN (ID 7354)
        console.log('\n2. DATOS REALES DE ABAD, CARLOS ADRIAN:');
        const profesionalData = await pool.query(`
            SELECT *
            FROM copig.profesionales 
            WHERE id = 7354
        `);
        
        if (profesionalData.rows.length > 0) {
            const prof = profesionalData.rows[0];
            console.log('   Datos del profesional:');
            Object.keys(prof).forEach(key => {
                const value = prof[key] === null ? 'NULL' : prof[key];
                console.log(`   ${key}: ${value}`);
            });
        }

        // 3. Ver estructura de tabla matriculas
        console.log('\n3. ESTRUCTURA TABLA MATRICULAS:');
        const matriculaStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'matriculas'
            ORDER BY ordinal_position
        `);
        
        matriculaStructure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        // 4. Ver datos de matrícula para este profesional
        console.log('\n4. DATOS MATRÍCULA PARA ABAD, CARLOS:');
        const matriculaData = await pool.query(`
            SELECT m.*
            FROM copig.matriculas m
            WHERE m.profesional_id = 7354
        `);
        
        if (matriculaData.rows.length > 0) {
            const mat = matriculaData.rows[0];
            console.log('   Datos de matrícula:');
            Object.keys(mat).forEach(key => {
                const value = mat[key] === null ? 'NULL' : mat[key];
                console.log(`   ${key}: ${value}`);
            });
        }

        // 5. Ver si existe tabla de títulos
        console.log('\n5. VERIFICANDO TABLAS RELACIONADAS:');
        const relatedTables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND (table_name LIKE '%titulo%' OR table_name LIKE '%especialidad%' OR table_name LIKE '%carrera%')
        `);
        
        if (relatedTables.rows.length > 0) {
            console.log('   Tablas relacionadas encontradas:');
            relatedTables.rows.forEach(table => {
                console.log(`   - ${table.table_name}`);
            });
        } else {
            console.log('   No se encontraron tablas de títulos/especialidades');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugProfesionalStructure();