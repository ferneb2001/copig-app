const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkMatriculasStructure() {
    console.log('📊 ANÁLISIS ESTRUCTURA TABLA MATRICULAS');
    console.log('='.repeat(50));
    
    try {
        // Estructura de la tabla matriculas
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'matriculas' 
            ORDER BY ordinal_position
        `);
        
        console.log('Columnas en tabla copig.matriculas:');
        structure.rows.forEach(col => {
            console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
        
        // Muestra de datos
        const sample = await pool.query(`
            SELECT * FROM copig.matriculas 
            LIMIT 5
        `);
        
        console.log('\n📋 Muestra de datos (5 registros):');
        sample.rows.forEach((row, i) => {
            console.log(`\nRegistro ${i + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        });
        
        // Verificar profesionales externos con matrículas
        const externosConMatriculas = await pool.query(`
            SELECT 
                p.id, p.nombre, p.provincia,
                m.numero_matricula,
                COALESCE(
                    m.fecha_otorgamiento, 
                    m.created_at, 
                    m.fecha_creacion,
                    m.fecha_inscripcion
                ) as fecha_disponible
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia != 'Mendoza' 
            AND p.activo = true
            LIMIT 10
        `);
        
        console.log('\n🔍 Profesionales externos con matrículas (muestra):');
        externosConMatriculas.rows.forEach(row => {
            console.log(`  ${row.nombre} (${row.provincia}) - Matrícula: ${row.numero_matricula} - Fecha: ${row.fecha_disponible}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkMatriculasStructure();