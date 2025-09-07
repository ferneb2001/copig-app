const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeMatriculaOptions() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 ANÁLISIS DE OPCIONES PARA MATRÍCULAS ALFANUMÉRICAS');
        console.log('===================================================');

        // Opción 1: Verificar si podemos modificar el campo existente
        console.log('\n📊 OPCIÓN 1: MODIFICAR CAMPO EXISTENTE');
        console.log('====================================');
        
        const fieldInfo = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'matriculas' AND column_name = 'numero'
        `);
        
        console.log('Campo actual "numero":', fieldInfo.rows[0]);
        
        // Verificar referencias
        const references = await client.query(`
            SELECT 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND (ccu.table_name='matriculas' OR tc.table_name='matriculas')
        `);
        
        console.log('\n🔗 Referencias encontradas:');
        if (references.rows.length > 0) {
            references.rows.forEach(ref => {
                console.log(`  - ${ref.table_name}.${ref.column_name} -> ${ref.foreign_table_name}.${ref.foreign_column_name}`);
            });
        } else {
            console.log('  ✅ No hay referencias FK que bloqueen la modificación');
        }

        // Opción 2: Crear tabla de matrículas personalizadas
        console.log('\n📊 OPCIÓN 2: TABLA DE MATRÍCULAS PERSONALIZADAS');
        console.log('===========================================');
        
        console.log('✅ Crear tabla separada para matrículas alfanuméricas');
        console.log('✅ Mantener compatibilidad con sistema existente');
        console.log('✅ Mapeo transparente entre sistemas');

        // Verificar matrículas existentes para detectar patrones
        const sampleMatriculas = await client.query(`
            SELECT numero, COUNT(*) as count 
            FROM copig.matriculas 
            WHERE numero IS NOT NULL
            GROUP BY numero
            ORDER BY numero DESC
            LIMIT 10
        `);
        
        console.log('\n📋 MATRÍCULAS MÁS ALTAS ACTUALES:');
        sampleMatriculas.rows.forEach(row => {
            console.log(`  - ${row.numero} (usado ${row.count} vez${row.count > 1 ? 'es' : ''})`);
        });

        // Simular creación de tabla personalizada
        console.log('\n🔧 SIMULACIÓN: CREAR TABLA PERSONALIZADA');
        console.log('======================================');
        
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS copig.matriculas_alfanumericas (
            id SERIAL PRIMARY KEY,
            matricula_original INTEGER REFERENCES copig.matriculas(numero),
            matricula_personalizada VARCHAR(50) UNIQUE NOT NULL,
            profesional_id INTEGER NOT NULL,
            activo BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(matricula_original, matricula_personalizada)
        )`;
        
        console.log('📄 SQL de creación:');
        console.log(createTableSQL);

        console.log('\n💡 RECOMENDACIÓN TÉCNICA');
        console.log('=======================');
        console.log('✅ OPCIÓN 2 es la más segura y flexible:');
        console.log('   • No afecta la integridad de datos existentes');
        console.log('   • Permite matrículas como FN-1969, ABC-123, etc.');
        console.log('   • Mantiene compatibilidad hacia atrás');
        console.log('   • Fácil de implementar y mantener');

        console.log('\n🎯 MATRÍCULAS ALFANUMÉRICAS POSIBLES:');
        console.log('===================================');
        console.log('✅ FN-1969 (tu matrícula deseada)');
        console.log('✅ ABC-123');
        console.log('✅ ING-2025');
        console.log('✅ SIST-001');
        console.log('✅ Cualquier combinación de letras, números y guiones');

        console.log('\n🚀 PRÓXIMO PASO:');
        console.log('================');
        console.log('Implementar tabla de matrículas alfanuméricas y');
        console.log('actualizar tu matrícula 1969 → FN-1969');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

analyzeMatriculaOptions();