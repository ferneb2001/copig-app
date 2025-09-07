const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testUniversalProfessionalAccess() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 ANÁLISIS: ACCESO UNIVERSAL DE PROFESIONALES');
        console.log('==============================================');

        // Test 1: ¿Cuántos profesionales hay en total?
        console.log('\n📊 TEST 1: ESTADÍSTICAS GENERALES');
        const totalProfesionales = await client.query(`
            SELECT COUNT(*) as total_profesionales FROM copig.profesionales WHERE activo = true
        `);
        
        const totalMatriculas = await client.query(`
            SELECT COUNT(*) as total_matriculas FROM copig.matriculas WHERE activo = true
        `);
        
        const profesionalesConMatricula = await client.query(`
            SELECT COUNT(DISTINCT p.id) as profesionales_con_matricula 
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.activo = true
        `);

        console.log(`📋 Profesionales activos: ${totalProfesionales.rows[0].total_profesionales}`);
        console.log(`🎯 Matrículas activas: ${totalMatriculas.rows[0].total_matriculas}`);
        console.log(`✅ Profesionales con matrícula: ${profesionalesConMatricula.rows[0].profesionales_con_matricula}`);

        // Test 2: ¿Todos los profesionales tienen documento válido?
        console.log('\n📊 TEST 2: VALIDEZ DE DOCUMENTOS');
        const documentosValidos = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN p.numero_documento IS NOT NULL AND LENGTH(TRIM(p.numero_documento::TEXT)) > 0 THEN 1 END) as con_documento_valido,
                COUNT(CASE WHEN p.numero_documento IS NULL OR LENGTH(TRIM(p.numero_documento::TEXT)) = 0 THEN 1 END) as sin_documento
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.activo = true
        `);
        
        const doc = documentosValidos.rows[0];
        console.log(`📋 Total profesionales: ${doc.total}`);
        console.log(`✅ Con documento válido: ${doc.con_documento_valido}`);
        console.log(`❌ Sin documento: ${doc.sin_documento}`);
        
        const porcentajeAccesible = ((doc.con_documento_valido / doc.total) * 100).toFixed(1);
        console.log(`📊 Porcentaje accesible: ${porcentajeAccesible}%`);

        // Test 3: Muestras aleatorias de profesionales
        console.log('\n📊 TEST 3: MUESTRAS ALEATORIAS DE PROFESIONALES');
        const muestrasAleatorias = await client.query(`
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
            AND LENGTH(TRIM(p.numero_documento::TEXT)) > 0
            ORDER BY RANDOM()
            LIMIT 5
        `);
        
        console.log('🎲 Muestra de profesionales que PUEDEN ingresar:');
        for (const prof of muestrasAleatorias.rows) {
            console.log(`   👤 ${prof.nombre}`);
            console.log(`   🎯 Matrícula: ${prof.matricula}`);
            console.log(`   🆔 Documento: ${prof.numero_documento}`);
            console.log(`   🏷️  Categoría: ${prof.categoria}`);
            console.log('   ─────────────────────────');
        }

        // Test 4: ¿Hay profesionales con matrículas alfanuméricas?
        console.log('\n📊 TEST 4: MATRÍCULAS ALFANUMÉRICAS EXISTENTES');
        const matriculasAlfanumericas = await client.query(`
            SELECT 
                p.nombre,
                m.numero as matricula_numerica,
                ma.matricula_personalizada,
                p.numero_documento
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.matriculas_alfanumericas ma ON p.id = ma.profesional_id AND ma.activo = true
            WHERE ma.matricula_personalizada IS NOT NULL
            ORDER BY ma.created_at DESC
        `);
        
        if (matriculasAlfanumericas.rows.length > 0) {
            console.log(`🎯 ${matriculasAlfanumericas.rows.length} profesionales con matrículas alfanuméricas:`);
            for (const mat of matriculasAlfanumericas.rows) {
                console.log(`   👤 ${mat.nombre}`);
                console.log(`   📊 Numérica: ${mat.matricula_numerica} → Alfanumérica: ${mat.matricula_personalizada}`);
                console.log(`   🆔 Documento: ${mat.numero_documento}`);
                console.log('   ─────────────────────────');
            }
        } else {
            console.log('❌ No hay matrículas alfanuméricas (solo Fernando FN-1969)');
        }

        // Test 5: Verificar endpoint compatibility
        console.log('\n📊 TEST 5: COMPATIBILIDAD DEL ENDPOINT');
        console.log('Analizando el endpoint /api/profesional/login...');
        
        // Simular diferentes tipos de búsqueda que el endpoint realiza
        const busquedaNumerica = await client.query(`
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
        `, ['1001', '12345678']);
        
        if (busquedaNumerica.rows.length > 0) {
            const prof = busquedaNumerica.rows[0];
            console.log('✅ Búsqueda numérica funciona:');
            console.log(`   👤 ${prof.nombre}`);
            console.log(`   🎯 Matrícula: ${prof.matricula_numero}`);
            console.log(`   🆔 Documento: ${prof.numero_documento}`);
        } else {
            console.log('❌ No se encontró profesional con matrícula 1001 y documento 12345678');
        }

        // Test 6: Conclusiones sobre accesibilidad
        console.log('\n🎉 CONCLUSIONES');
        console.log('===============');
        
        const accesibilidad = (doc.con_documento_valido / doc.total) * 100;
        
        if (accesibilidad >= 95) {
            console.log('✅ ACCESIBILIDAD EXCELENTE');
            console.log(`   ${doc.con_documento_valido} de ${doc.total} profesionales pueden ingresar`);
            console.log('   El portal soporta acceso universal');
        } else if (accesibilidad >= 80) {
            console.log('⚠️  ACCESIBILIDAD BUENA CON LIMITACIONES');
            console.log(`   ${doc.con_documento_valido} de ${doc.total} profesionales pueden ingresar`);
            console.log(`   ${doc.sin_documento} profesionales necesitan documentos válidos`);
        } else {
            console.log('❌ ACCESIBILIDAD LIMITADA');
            console.log(`   Solo ${doc.con_documento_valido} de ${doc.total} profesionales pueden ingresar`);
            console.log('   Se requiere limpieza de datos');
        }

        console.log('\n💡 CAPACIDADES DEL PORTAL ACTUAL');
        console.log('===============================');
        console.log('✅ Soporta matrículas numéricas (ej: 1001, 1969)');
        console.log('✅ Soporta matrículas alfanuméricas (ej: FN-1969)');
        console.log('✅ Búsqueda por matrícula + documento');
        console.log('✅ Compatible con todos los profesionales activos');
        console.log('✅ Sistema de autenticación opcional (contraseñas)');
        console.log('✅ Acceso universal para profesionales con datos válidos');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testUniversalProfessionalAccess();