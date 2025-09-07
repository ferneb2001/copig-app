const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testRealProfessionalsPayment() {
    const client = await pool.connect();
    
    try {
        console.log('🧪 PRUEBA EXHAUSTIVA CON PROFESIONALES REALES');
        console.log('=============================================');

        // Lista de profesionales reales para probar
        const realProfessionals = [
            { nombre: 'MARTINEZ PELAEZ, HUGO', matricula: '9096', documento: '6860397' },
            { nombre: 'PIRRONE, MIGUEL ANGEL', matricula: '9801', documento: '32879869' },
            { nombre: 'ROMAN, FACUNDO DIEGO', matricula: '9182', documento: '30519753' },
            { nombre: 'SANTAMARIA, JORGELINA FABIANA', matricula: '9056', documento: '30071543' },
            { nombre: 'OJEDA, PABLO MIGUEL', matricula: '6740', documento: '17021944' },
            { nombre: 'NEBRO,FERNANDO', matricula: '1969', documento: '20562024' }, // Alfanumérico
            { nombre: 'NEBRO,FERNANDO', matricula: 'FN-1969', documento: '20562024' } // Alfanumérico
        ];

        // Query numérica (como en el endpoint actual)
        const numericQuery = `
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

        // Query alfanumérica
        const alphanumericQuery = `
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

        let totalTests = 0;
        let successfulTests = 0;

        for (const prof of realProfessionals) {
            totalTests++;
            console.log(`\n🔍 PROBANDO: ${prof.nombre}`);
            console.log(`   🎯 Matrícula: ${prof.matricula}`);
            console.log(`   🆔 Documento: ${prof.documento}`);
            
            let result;
            const isAlphanumeric = /^[A-Z]/.test(prof.matricula);
            
            if (isAlphanumeric) {
                console.log('   📝 Tipo: Alfanumérica');
                result = await client.query(alphanumericQuery, [prof.matricula, prof.documento]);
            } else {
                console.log('   📝 Tipo: Numérica');
                result = await client.query(numericQuery, [prof.matricula, prof.documento]);
            }
            
            if (result.rows.length > 0) {
                const validated = result.rows[0];
                console.log('   ✅ VALIDACIÓN EXITOSA');
                console.log(`   👤 Encontrado: ${validated.nombre}`);
                console.log(`   🆔 ID: ${validated.id}`);
                console.log(`   🎯 Matrícula Display: ${validated.matricula_display}`);
                console.log(`   📊 Matrícula Numérica: ${validated.matricula_numero}`);
                console.log(`   🏷️  Categoría: ${validated.categoria}`);
                console.log(`   🔐 Password Set: ${validated.password_set || false}`);
                
                // Verificar que los datos son correctos
                if (validated.numero_documento.toString() === prof.documento) {
                    console.log('   ✅ Documento coincide');
                } else {
                    console.log(`   ⚠️  Documento no coincide: esperado ${prof.documento}, obtenido ${validated.numero_documento}`);
                }
                
                successfulTests++;
            } else {
                console.log('   ❌ VALIDACIÓN FALLIDA - No encontrado');
                
                // Debug: Verificar si existe en la base
                const debugQuery = `
                    SELECT p.nombre, p.numero_documento, m.numero as matricula
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    WHERE p.numero_documento::TEXT = $1
                `;
                
                const debugResult = await client.query(debugQuery, [prof.documento]);
                if (debugResult.rows.length > 0) {
                    console.log('   🔍 DEBUG: Profesional encontrado con este documento:');
                    debugResult.rows.forEach(dr => {
                        console.log(`      - ${dr.nombre} - Mat: ${dr.matricula} - Doc: ${dr.numero_documento}`);
                    });
                } else {
                    console.log('   🔍 DEBUG: No se encontró profesional con este documento');
                }
            }
        }

        console.log(`\n📊 RESUMEN DE PRUEBAS:`);
        console.log(`===============================`);
        console.log(`📋 Total de pruebas: ${totalTests}`);
        console.log(`✅ Exitosas: ${successfulTests}`);
        console.log(`❌ Fallidas: ${totalTests - successfulTests}`);
        console.log(`📈 Tasa de éxito: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
        
        // Ahora probar con una muestra más amplia de profesionales reales
        console.log(`\n🔍 PRUEBA MASIVA CON PROFESIONALES REALES`);
        console.log(`=========================================`);
        
        const massiveTest = await client.query(`
            SELECT 
                p.nombre,
                p.numero_documento,
                m.numero as matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.activo = true 
            AND p.nombre NOT LIKE '%HISTÓRICO%'
            AND p.numero_documento IS NOT NULL
            AND m.numero > 1000
            ORDER BY RANDOM()
            LIMIT 20
        `);
        
        console.log(`📋 Probando ${massiveTest.rows.length} profesionales aleatorios...`);
        
        let massiveSuccess = 0;
        let massiveFail = 0;
        
        for (const prof of massiveTest.rows) {
            const testResult = await client.query(numericQuery, [
                prof.matricula.toString(),
                prof.numero_documento.toString()
            ]);
            
            if (testResult.rows.length > 0) {
                massiveSuccess++;
                // Solo mostrar algunos ejemplos
                if (massiveSuccess <= 5) {
                    console.log(`✅ ${prof.nombre} - Mat: ${prof.matricula} - Doc: ${prof.numero_documento}`);
                }
            } else {
                massiveFail++;
                console.log(`❌ FAIL: ${prof.nombre} - Mat: ${prof.matricula} - Doc: ${prof.numero_documento}`);
            }
        }
        
        if (massiveSuccess > 5) {
            console.log(`✅ ... y ${massiveSuccess - 5} más exitosos`);
        }
        
        console.log(`\n📊 RESULTADOS PRUEBA MASIVA:`);
        console.log(`============================`);
        console.log(`✅ Exitosos: ${massiveSuccess}`);
        console.log(`❌ Fallidos: ${massiveFail}`);
        console.log(`📈 Tasa de éxito: ${((massiveSuccess / (massiveSuccess + massiveFail)) * 100).toFixed(1)}%`);
        
        // Conclusiones
        console.log(`\n🎯 CONCLUSIONES:`);
        console.log(`================`);
        
        if (successfulTests === totalTests && (massiveSuccess / (massiveSuccess + massiveFail)) >= 0.95) {
            console.log('✅ SISTEMA DE VALIDACIÓN FUNCIONA PERFECTAMENTE');
            console.log('✅ Soporta profesionales reales y alfanuméricos');
            console.log('✅ Funcionalidad universal confirmada');
        } else {
            console.log('⚠️  SISTEMA NECESITA AJUSTES');
            console.log('❌ Algunos profesionales reales fallan la validación');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testRealProfessionalsPayment();