const { Pool } = require('pg');
const config = require('./config.json');

async function verifyMatriculasStructure() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔍 Verificando estructura REAL de tabla matriculas...\n');
        
        const estructura = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'matriculas'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 COLUMNAS REALES:');
        estructura.rows.forEach((col, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        console.log('\n🗓️ COLUMNAS DE FECHA DISPONIBLES:');
        const fechaColumns = estructura.rows.filter(col => 
            col.column_name.includes('fecha') || col.data_type.includes('date')
        );
        
        fechaColumns.forEach(col => {
            console.log(`   ✅ ${col.column_name}: ${col.data_type}`);
        });
        
        // Ver muestra de datos reales
        console.log('\n📝 MUESTRA DE DATOS (primeros 3 registros):');
        const muestra = await pool.query(`
            SELECT numero_matricula, fecha_inscripcion, fecha_titulo, fecha_habilitacion, 
                   fecha_certificado, fecha_pago, vencimiento_habilitacion, activo
            FROM copig.matriculas 
            ORDER BY numero_matricula 
            LIMIT 3
        `);
        
        muestra.rows.forEach(row => {
            console.log(`Matrícula ${row.numero_matricula}:`);
            console.log(`   Inscripción: ${row.fecha_inscripcion}`);
            console.log(`   Título: ${row.fecha_titulo}`);
            console.log(`   Habilitación: ${row.fecha_habilitacion}`);
            console.log(`   Certificado: ${row.fecha_certificado}`);
            console.log(`   Pago: ${row.fecha_pago}`);
            console.log(`   Vencimiento: ${row.vencimiento_habilitacion}`);
            console.log('');
        });
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyMatriculasStructure();