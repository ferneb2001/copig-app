const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verEstructuraPagos() {
    const client = await pool.connect();
    try {
        console.log('🔍 ESTRUCTURA DE TABLAS FINANCIERAS\n');
        
        // 1. Ver estructura de pagos_historicos
        console.log('📊 1. Estructura de copig.pagos_historicos:');
        const estructura = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'pagos_historicos'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // 2. Ver algunos registros de ejemplo
        console.log('\n💰 2. Ejemplos de registros en pagos_historicos:');
        const ejemplos = await client.query(`
            SELECT * FROM copig.pagos_historicos LIMIT 3
        `);
        
        ejemplos.rows.forEach((pago, i) => {
            console.log(`\n   Registro ${i + 1}:`);
            Object.keys(pago).forEach(key => {
                if (pago[key] !== null) {
                    console.log(`     ${key}: ${pago[key]}`);
                }
            });
        });
        
        // 3. Ver qué campos usan para mapear profesionales
        console.log('\n🔗 3. Análisis de campos de mapeo:');
        const camposMapeo = await client.query(`
            SELECT DISTINCT 
                CASE WHEN matricula IS NOT NULL THEN 'matricula' ELSE NULL END as tiene_matricula,
                CASE WHEN profesional_id IS NOT NULL THEN 'profesional_id' ELSE NULL END as tiene_profesional_id
            FROM copig.pagos_historicos
            LIMIT 10
        `);
        
        console.log('   Campos disponibles para mapeo:');
        camposMapeo.rows.forEach(campo => {
            if (campo.tiene_matricula) console.log(`     ✅ matricula`);
            if (campo.tiene_profesional_id) console.log(`     ✅ profesional_id`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

verEstructuraPagos().catch(console.error);