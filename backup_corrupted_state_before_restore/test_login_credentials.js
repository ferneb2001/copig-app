const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testLoginCredentials() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 DIAGNÓSTICO DEL LOGIN PROFESIONAL');
        console.log('===================================');

        // Test 1: Verificar datos de Fernando Nebro
        console.log('\n📊 TEST 1: DATOS DE FERNANDO NEBRO');
        const fernandoTest = await client.query(`
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                m.numero as matricula,
                m.activo as matricula_activa,
                p.activo as profesional_activo,
                m.categoria
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.numero_documento = '20562024'
        `);
        
        if (fernandoTest.rows.length > 0) {
            const f = fernandoTest.rows[0];
            console.log('✅ Fernando encontrado:');
            console.log(`   👤 Nombre: ${f.nombre}`);
            console.log(`   🆔 Documento: ${f.numero_documento}`);
            console.log(`   🎯 Matrícula: ${f.matricula}`);
            console.log(`   📋 Categoría: ${f.categoria}`);
            console.log(`   ✅ Activo (Prof): ${f.profesional_activo}`);
            console.log(`   ✅ Activo (Mat): ${f.matricula_activa}`);
        } else {
            console.log('❌ Fernando NO encontrado');
        }

        // Test 2: Probar query exacta del endpoint /api/login
        console.log('\n📊 TEST 2: QUERY EXACTA DEL ENDPOINT');
        const loginQuery = `
            SELECT p.*, m.numero as matricula_numero, m.categoria
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.numero = $1 AND p.numero_documento = $2 AND m.activo = true
        `;
        
        const loginTest = await client.query(loginQuery, [1969, '20562024']);
        
        console.log(`Usando matrícula: 1969 (tipo: ${typeof 1969})`);
        console.log(`Usando documento: '20562024' (tipo: ${typeof '20562024'})`);
        console.log(`Resultados encontrados: ${loginTest.rows.length}`);
        
        if (loginTest.rows.length > 0) {
            const result = loginTest.rows[0];
            console.log('✅ Login funcionaría con:');
            console.log(`   👤 Nombre: ${result.nombre}`);
            console.log(`   🎯 Matrícula: ${result.matricula_numero}`);
            console.log(`   🆔 Documento: ${result.numero_documento}`);
        } else {
            console.log('❌ Login fallaría - investigando...');
            
            // Test 3: Verificar tipos de datos
            console.log('\n🔬 TEST 3: ANÁLISIS DE TIPOS DE DATOS');
            
            const typeTest = await client.query(`
                SELECT 
                    m.numero, 
                    pg_typeof(m.numero) as tipo_matricula,
                    p.numero_documento,
                    pg_typeof(p.numero_documento) as tipo_documento,
                    m.activo
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.numero_documento LIKE '%20562024%'
            `);
            
            if (typeTest.rows.length > 0) {
                const t = typeTest.rows[0];
                console.log(`   🎯 Matrícula: ${t.numero} (tipo: ${t.tipo_matricula})`);
                console.log(`   🆔 Documento: ${t.numero_documento} (tipo: ${t.tipo_documento})`);
                console.log(`   ✅ Activo: ${t.activo}`);
            }
            
            // Test 4: Búsquedas variantes
            console.log('\n🔬 TEST 4: BÚSQUEDAS VARIANTES');
            
            const variants = [
                ['1969', '20562024'],
                [1969, '20562024'],
                ['1969', 20562024],
                [1969, 20562024]
            ];
            
            for (const [mat, doc] of variants) {
                const variantResult = await client.query(loginQuery, [mat, doc]);
                console.log(`   Matrícula: ${mat} (${typeof mat}), Documento: ${doc} (${typeof doc}) → ${variantResult.rows.length} resultados`);
            }
        }

        // Test 5: Verificar estructura de datos completa
        console.log('\n📊 TEST 5: ESTRUCTURA COMPLETA');
        const fullData = await client.query(`
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                m.numero as matricula,
                m.activo as matricula_activa,
                p.activo as profesional_activo
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = 15268
        `);
        
        if (fullData.rows.length > 0) {
            const data = fullData.rows[0];
            console.log('📋 Datos completos de Fernando:');
            console.log(`   ID: ${data.id}`);
            console.log(`   Nombre: ${data.nombre}`);
            console.log(`   Documento: "${data.numero_documento}" (longitud: ${data.numero_documento?.length})`);
            console.log(`   Matrícula: ${data.matricula}`);
            console.log(`   Prof Activo: ${data.profesional_activo}`);
            console.log(`   Mat Activa: ${data.matricula_activa}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testLoginCredentials();