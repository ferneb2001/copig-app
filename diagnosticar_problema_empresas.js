const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function diagnosticarProblemaEmpresas() {
    try {
        console.log('🔍 DIAGNOSTICANDO PROBLEMA DE EMPRESAS');
        console.log('='.repeat(50));
        
        // 1. Verificar estructura de tabla empresas
        console.log('📊 1. ESTRUCTURA DE TABLA EMPRESAS:');
        const columnas = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'empresas' AND table_schema = 'copig'
            ORDER BY ordinal_position
        `);
        
        columnas.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        // 2. Contar empresas
        const total = await pool.query('SELECT COUNT(*) FROM copig.empresas');
        console.log(`\n📊 2. TOTAL EMPRESAS EN BD: ${total.rows[0].count}`);
        
        // 3. Ver ejemplos de empresas problemáticas
        console.log('\n🔍 3. EMPRESAS DE EJEMPLO (primeras 5):');
        const ejemplos = await pool.query('SELECT * FROM copig.empresas ORDER BY id LIMIT 5');
        
        ejemplos.rows.forEach(empresa => {
            console.log(`\n   ID: ${empresa.id}`);
            console.log(`   Razón Social: "${empresa.razon_social}"`);
            console.log(`   CUIT: "${empresa.cuit || 'NULL'}"`);
            console.log(`   Domicilio: "${empresa.domicilio || 'NULL'}"`);
            console.log(`   Localidad: "${empresa.localidad || 'NULL'}"`);
            console.log(`   Teléfono: "${empresa.telefono || 'NULL'}"`);
            console.log(`   Email: "${empresa.email || 'NULL'}"`);
            console.log(`   Activo: ${empresa.activo}`);
        });
        
        // 4. Buscar específicamente las empresas que mencionaste
        console.log('\n🎯 4. BUSCANDO EMPRESAS ESPECÍFICAS MENCIONADAS:');
        const empresasProblema = [
            'A.EVANGELISTA S.A.',
            'A.PRO.TA.M',
            'AB CONTROL S.A.',
            'ABB S.A.',
            'ABELAR SERVICIOS S.R.L.'
        ];
        
        for (const nombreEmpresa of empresasProblema) {
            const resultado = await pool.query(`
                SELECT id, razon_social, cuit, activo
                FROM copig.empresas 
                WHERE razon_social ILIKE $1
                LIMIT 3
            `, [`%${nombreEmpresa}%`]);
            
            console.log(`\n   Buscando "${nombreEmpresa}":`);
            if (resultado.rows.length > 0) {
                resultado.rows.forEach(emp => {
                    console.log(`     ✅ ID: ${emp.id} - "${emp.razon_social}" - CUIT: ${emp.cuit} - Activo: ${emp.activo}`);
                });
            } else {
                console.log(`     ❌ No encontrada`);
            }
        }
        
        // 5. Verificar si hay problemas de caracteres especiales
        console.log('\n🔍 5. VERIFICANDO CARACTERES ESPECIALES:');
        const caracteresRaros = await pool.query(`
            SELECT id, razon_social 
            FROM copig.empresas 
            WHERE razon_social LIKE '%�%' OR razon_social LIKE '%?%'
            LIMIT 10
        `);
        
        if (caracteresRaros.rows.length > 0) {
            console.log('   ⚠️  Empresas con caracteres problemáticos:');
            caracteresRaros.rows.forEach(emp => {
                console.log(`     ID: ${emp.id} - "${emp.razon_social}"`);
            });
        } else {
            console.log('   ✅ No se encontraron caracteres problemáticos');
        }
        
        // 6. Verificar rangos de ID
        console.log('\n📊 6. RANGOS DE ID:');
        const rangos = await pool.query('SELECT MIN(id) as min_id, MAX(id) as max_id FROM copig.empresas');
        console.log(`   ID mínimo: ${rangos.rows[0].min_id}`);
        console.log(`   ID máximo: ${rangos.rows[0].max_id}`);
        
        console.log('\n💡 PRÓXIMO PASO: Verificar el frontend empresas.html');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

diagnosticarProblemaEmpresas();