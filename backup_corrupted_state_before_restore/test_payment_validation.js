const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testPaymentValidation() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 ANÁLISIS DE VALIDACIÓN DEL SISTEMA DE PAGOS');
        console.log('===============================================');

        // Test 1: Obtener profesionales de diferentes rangos para probar
        console.log('\n📊 TEST 1: OBTENIENDO PROFESIONALES DE PRUEBA');
        const testProfesionales = await client.query(`
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                m.numero as matricula,
                m.categoria
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.activo = true 
            AND p.numero_documento IS NOT NULL 
            ORDER BY m.numero ASC
            LIMIT 10
        `);
        
        console.log(`✅ Encontrados ${testProfesionales.rows.length} profesionales para probar`);
        
        // Test 2: Probar la query exacta del endpoint /api/profesional/login
        console.log('\n📊 TEST 2: VALIDACIÓN DE QUERY DEL ENDPOINT');
        
        const loginQuery = `
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                p.email,
                p.telefono,
                p.celular,
                p.domicilio,
                p.activo as profesional_activo,
                m.numero as matricula_numero,
                COALESCE(ma.matricula_personalizada, m.numero::TEXT) as matricula_display,
                m.categoria,
                m.activo as matricula_activa,
                m.condicion,
                m.fecha_ultimo_pago,
                m.vencimiento_habilitacion,
                pa.password_hash,
                pa.password_set,
                pa.login_attempts
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.matriculas_alfanumericas ma ON p.id = ma.profesional_id AND ma.activo = true
            LEFT JOIN copig.profesionales_auth pa ON p.id = pa.profesional_id
            WHERE m.numero::TEXT = $1 AND p.numero_documento::TEXT = $2
            ORDER BY m.fecha_inscripcion DESC
            LIMIT 1
        `;
        
        // Probar con varios profesionales
        let successCount = 0;
        let failCount = 0;
        
        for (const prof of testProfesionales.rows) {
            console.log(`\n🔍 Probando: ${prof.nombre} - Mat: ${prof.matricula} - Doc: ${prof.numero_documento}`);
            
            try {
                const result = await client.query(loginQuery, [
                    prof.matricula.toString(),
                    prof.numero_documento.toString()
                ]);
                
                if (result.rows.length > 0) {
                    const validatedProf = result.rows[0];
                    console.log(`   ✅ SUCCESS - Encontrado: ${validatedProf.nombre}`);
                    console.log(`   📋 ID: ${validatedProf.id}, Matrícula Display: ${validatedProf.matricula_display}`);
                    successCount++;
                } else {
                    console.log(`   ❌ FAIL - No encontrado`);
                    failCount++;
                }
            } catch (error) {
                console.log(`   ❌ ERROR - ${error.message}`);
                failCount++;
            }
        }
        
        console.log(`\n📊 RESULTADOS DEL TEST:`);
        console.log(`✅ Exitosos: ${successCount}`);
        console.log(`❌ Fallidos: ${failCount}`);
        console.log(`📈 Tasa de éxito: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);
        
        // Test 3: Verificar casos especiales
        console.log('\n📊 TEST 3: CASOS ESPECIALES');
        
        // Profesionales con matrículas muy bajas
        const lowMatriculas = await client.query(`
            SELECT p.nombre, p.numero_documento, m.numero as matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.numero <= 10 AND p.activo = true AND m.activo = true
            ORDER BY m.numero ASC
            LIMIT 5
        `);
        
        console.log('\n🔢 Profesionales con matrículas muy bajas:');
        for (const prof of lowMatriculas.rows) {
            console.log(`   Mat: ${prof.matricula} - Doc: ${prof.numero_documento} - ${prof.nombre}`);
            
            const testResult = await client.query(loginQuery, [
                prof.matricula.toString(),
                prof.numero_documento.toString()
            ]);
            
            console.log(`   ${testResult.rows.length > 0 ? '✅' : '❌'} Validación: ${testResult.rows.length > 0 ? 'OK' : 'FAIL'}`);
        }
        
        // Profesionales con matrículas altas
        const highMatriculas = await client.query(`
            SELECT p.nombre, p.numero_documento, m.numero as matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.numero >= 10000 AND p.activo = true AND m.activo = true
            ORDER BY m.numero DESC
            LIMIT 5
        `);
        
        console.log('\n🔢 Profesionales con matrículas altas:');
        for (const prof of highMatriculas.rows) {
            console.log(`   Mat: ${prof.matricula} - Doc: ${prof.numero_documento} - ${prof.nombre}`);
            
            const testResult = await client.query(loginQuery, [
                prof.matricula.toString(),
                prof.numero_documento.toString()
            ]);
            
            console.log(`   ${testResult.rows.length > 0 ? '✅' : '❌'} Validación: ${testResult.rows.length > 0 ? 'OK' : 'FAIL'}`);
        }
        
        // Test 4: Verificar matrículas alfanuméricas
        console.log('\n📊 TEST 4: MATRÍCULAS ALFANUMÉRICAS');
        
        const alphaMatriculas = await client.query(`
            SELECT 
                p.nombre,
                p.numero_documento,
                m.numero as matricula_numerica,
                ma.matricula_personalizada
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.matriculas_alfanumericas ma ON p.id = ma.profesional_id
            WHERE ma.activo = true
        `);
        
        console.log(`🎯 Matrículas alfanuméricas encontradas: ${alphaMatriculas.rows.length}`);
        
        for (const prof of alphaMatriculas.rows) {
            console.log(`\n🔍 Probando alfanumérica: ${prof.nombre}`);
            console.log(`   📊 Numérica: ${prof.matricula_numerica} → Personalizada: ${prof.matricula_personalizada}`);
            
            // Probar con matrícula alfanumérica
            const alphaQuery = `
                SELECT 
                    p.id,
                    p.nombre,
                    p.numero_documento,
                    p.email,
                    p.telefono,
                    p.celular,
                    p.domicilio,
                    p.activo as profesional_activo,
                    m.numero as matricula_numero,
                    ma.matricula_personalizada as matricula_display,
                    m.categoria,
                    m.activo as matricula_activa,
                    m.condicion,
                    m.fecha_ultimo_pago,
                    m.vencimiento_habilitacion,
                    pa.password_hash,
                    pa.password_set,
                    pa.login_attempts
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                JOIN copig.matriculas_alfanumericas ma ON p.id = ma.profesional_id AND ma.activo = true
                LEFT JOIN copig.profesionales_auth pa ON p.id = pa.profesional_id
                WHERE ma.matricula_personalizada = $1 AND p.numero_documento::TEXT = $2
                ORDER BY m.fecha_inscripcion DESC
                LIMIT 1
            `;
            
            const alphaResult = await client.query(alphaQuery, [
                prof.matricula_personalizada,
                prof.numero_documento.toString()
            ]);
            
            console.log(`   ${alphaResult.rows.length > 0 ? '✅' : '❌'} Validación alfanumérica: ${alphaResult.rows.length > 0 ? 'OK' : 'FAIL'}`);
            
            // También probar con matrícula numérica
            const numericResult = await client.query(loginQuery, [
                prof.matricula_numerica.toString(),
                prof.numero_documento.toString()
            ]);
            
            console.log(`   ${numericResult.rows.length > 0 ? '✅' : '❌'} Validación numérica: ${numericResult.rows.length > 0 ? 'OK' : 'FAIL'}`);
        }
        
        // Test 5: Análisis de problemas potenciales
        console.log('\n📊 TEST 5: ANÁLISIS DE PROBLEMAS POTENCIALES');
        
        // Verificar tipos de datos
        const dataTypes = await client.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name IN ('profesionales', 'matriculas')
            AND column_name IN ('numero_documento', 'numero', 'id')
            ORDER BY table_name, column_name
        `);
        
        console.log('\n🔬 Tipos de datos relevantes:');
        dataTypes.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // Verificar discrepancias
        const discrepancies = await client.query(`
            SELECT 
                COUNT(CASE WHEN p.numero_documento IS NULL THEN 1 END) as docs_nulos,
                COUNT(CASE WHEN m.numero IS NULL THEN 1 END) as matriculas_nulas,
                COUNT(CASE WHEN p.activo = false THEN 1 END) as profesionales_inactivos,
                COUNT(CASE WHEN m.activo = false THEN 1 END) as matriculas_inactivas
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
        `);
        
        const disc = discrepancies.rows[0];
        console.log('\n⚠️  Posibles problemas:');
        console.log(`   📋 Documentos nulos: ${disc.docs_nulos}`);
        console.log(`   🎯 Matrículas nulas: ${disc.matriculas_nulas}`);
        console.log(`   👤 Profesionales inactivos: ${disc.profesionales_inactivos}`);
        console.log(`   📊 Matrículas inactivas: ${disc.matriculas_inactivas}`);
        
        console.log('\n🎯 CONCLUSIÓN DEL ANÁLISIS:');
        console.log('===========================');
        
        if (successCount / (successCount + failCount) >= 0.95) {
            console.log('✅ Sistema de validación funcionando correctamente');
        } else {
            console.log('⚠️  Sistema de validación necesita ajustes');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testPaymentValidation();