const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analyzeDataQuality() {
    try {
        console.log('=== ANÁLISIS DE CALIDAD DE DATOS - TABLA PROFESIONALES ===\n');

        // 1. Verificar estructura de la tabla y total de registros
        console.log('1. INFORMACIÓN GENERAL DE LA TABLA');
        console.log('=====================================');
        
        const totalQuery = 'SELECT COUNT(*) as total FROM copig.profesionales';
        const totalResult = await pool.query(totalQuery);
        const totalProfesionales = parseInt(totalResult.rows[0].total);
        console.log(`Total de profesionales: ${totalProfesionales}`);

        // Obtener estructura de la tabla
        const structureQuery = `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `;
        const structureResult = await pool.query(structureQuery);
        console.log('\nEstructura de la tabla:');
        structureResult.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // 2. Análisis de campos faltantes
        console.log('\n\n2. ANÁLISIS DE CAMPOS FALTANTES');
        console.log('===============================');
        
        const nullAnalysisQuery = `
            SELECT 
                COUNT(*) as total_registros,
                COUNT(*) FILTER (WHERE telefono IS NULL OR telefono = '') as telefono_faltante,
                COUNT(*) FILTER (WHERE celular IS NULL OR celular = '') as celular_faltante,
                COUNT(*) FILTER (WHERE email IS NULL OR email = '') as email_faltante,
                COUNT(*) FILTER (WHERE nombre IS NULL OR nombre = '') as nombre_faltante,
                COUNT(*) FILTER (WHERE numero_documento IS NULL) as documento_faltante,
                COUNT(*) FILTER (WHERE domicilio IS NULL OR domicilio = '') as domicilio_faltante
            FROM copig.profesionales
        `;
        
        const nullResult = await pool.query(nullAnalysisQuery);
        const nullData = nullResult.rows[0];
        
        console.log(`Teléfono faltante: ${nullData.telefono_faltante} (${((nullData.telefono_faltante/totalProfesionales)*100).toFixed(1)}%)`);
        console.log(`Celular faltante: ${nullData.celular_faltante} (${((nullData.celular_faltante/totalProfesionales)*100).toFixed(1)}%)`);
        console.log(`Email faltante: ${nullData.email_faltante} (${((nullData.email_faltante/totalProfesionales)*100).toFixed(1)}%)`);
        console.log(`Nombre faltante: ${nullData.nombre_faltante} (${((nullData.nombre_faltante/totalProfesionales)*100).toFixed(1)}%)`);
        console.log(`Documento faltante: ${nullData.documento_faltante} (${((nullData.documento_faltante/totalProfesionales)*100).toFixed(1)}%)`);
        console.log(`Domicilio faltante: ${nullData.domicilio_faltante} (${((nullData.domicilio_faltante/totalProfesionales)*100).toFixed(1)}%)`);

        // 3. Análisis de formatos de teléfono
        console.log('\n\n3. ANÁLISIS DE FORMATOS DE TELÉFONO');
        console.log('===================================');
        
        const phoneFormatQuery = `
            SELECT 
                COUNT(*) as total_telefonos,
                COUNT(*) FILTER (WHERE telefono ~ '^[0-9-]+$') as formato_numerico,
                COUNT(*) FILTER (WHERE telefono ~ '^[0-9]{3,4}-[0-9]{6,7}$') as formato_estandar,
                COUNT(*) FILTER (WHERE LENGTH(telefono) < 7) as muy_corto,
                COUNT(*) FILTER (WHERE LENGTH(telefono) > 15) as muy_largo,
                AVG(LENGTH(telefono))::numeric(10,2) as longitud_promedio
            FROM copig.profesionales 
            WHERE telefono IS NOT NULL AND telefono != ''
        `;
        
        const phoneResult = await pool.query(phoneFormatQuery);
        if (phoneResult.rows.length > 0) {
            const phoneData = phoneResult.rows[0];
            console.log(`Total teléfonos válidos: ${phoneData.total_telefonos}`);
            console.log(`Formato numérico: ${phoneData.formato_numerico} (${((phoneData.formato_numerico/phoneData.total_telefonos)*100).toFixed(1)}%)`);
            console.log(`Formato estándar (XXX-XXXXXXX): ${phoneData.formato_estandar} (${((phoneData.formato_estandar/phoneData.total_telefonos)*100).toFixed(1)}%)`);
            console.log(`Muy cortos (<7 dígitos): ${phoneData.muy_corto}`);
            console.log(`Muy largos (>15 dígitos): ${phoneData.muy_largo}`);
            console.log(`Longitud promedio: ${phoneData.longitud_promedio} caracteres`);
        }

        // 4. Análisis de formatos de email
        console.log('\n\n4. ANÁLISIS DE FORMATOS DE EMAIL');
        console.log('=================================');
        
        const emailFormatQuery = `
            SELECT 
                COUNT(*) as total_emails,
                COUNT(*) FILTER (WHERE email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') as formato_valido,
                COUNT(*) FILTER (WHERE email NOT LIKE '%@%') as sin_arroba,
                COUNT(*) FILTER (WHERE email LIKE '%@gmail.%') as gmail,
                COUNT(*) FILTER (WHERE email LIKE '%@hotmail.%' OR email LIKE '%@outlook.%') as microsoft,
                COUNT(*) FILTER (WHERE email LIKE '%@yahoo.%') as yahoo
            FROM copig.profesionales 
            WHERE email IS NOT NULL AND email != ''
        `;
        
        const emailResult = await pool.query(emailFormatQuery);
        if (emailResult.rows.length > 0) {
            const emailData = emailResult.rows[0];
            console.log(`Total emails válidos: ${emailData.total_emails}`);
            console.log(`Formato válido: ${emailData.formato_valido} (${((emailData.formato_valido/emailData.total_emails)*100).toFixed(1)}%)`);
            console.log(`Sin @ (inválidos): ${emailData.sin_arroba}`);
            console.log(`Gmail: ${emailData.gmail} (${((emailData.gmail/emailData.total_emails)*100).toFixed(1)}%)`);
            console.log(`Microsoft (Hotmail/Outlook): ${emailData.microsoft} (${((emailData.microsoft/emailData.total_emails)*100).toFixed(1)}%)`);
            console.log(`Yahoo: ${emailData.yahoo} (${((emailData.yahoo/emailData.total_emails)*100).toFixed(1)}%)`);
        }

        // 5. Muestra de profesionales
        console.log('\n\n5. MUESTRA DE PROFESIONALES (10 REGISTROS)');
        console.log('==========================================');
        
        const sampleQuery = `
            SELECT id, nombre, numero_documento, telefono, celular, email, domicilio, activo
            FROM copig.profesionales 
            ORDER BY id 
            LIMIT 10
        `;
        
        const sampleResult = await pool.query(sampleQuery);
        console.log('ID\t| Nombre\t\t| Documento\t| Teléfono\t| Celular\t| Email\t\t\t| Activo');
        console.log('--------|-----------------------|---------------|---------------|---------------|-------------------|---------');
        
        sampleResult.rows.forEach(prof => {
            const nombre = (prof.nombre || '').substring(0, 20).padEnd(20);
            const documento = (prof.numero_documento || '').substring(0, 12).padEnd(12);
            const telefono = (prof.telefono || '').substring(0, 12).padEnd(12);
            const celular = (prof.celular || '').substring(0, 12).padEnd(12);
            const email = (prof.email || '').substring(0, 18).padEnd(18);
            
            console.log(`${prof.id}\t| ${nombre}| ${documento}| ${telefono}| ${celular}| ${email}| ${prof.activo ? 'Sí' : 'No'}`);
        });

        // 6. Profesionales con datos más completos
        console.log('\n\n6. PROFESIONALES CON DATOS MÁS COMPLETOS');
        console.log('========================================');
        
        const completeQuery = `
            SELECT id, nombre, numero_documento, telefono, celular, email
            FROM copig.profesionales 
            WHERE telefono IS NOT NULL AND telefono != ''
            AND celular IS NOT NULL AND celular != ''
            AND email IS NOT NULL AND email != ''
            AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
            LIMIT 5
        `;
        
        const completeResult = await pool.query(completeQuery);
        console.log('Profesionales con datos completos y válidos:');
        completeResult.rows.forEach(prof => {
            console.log(`- ${prof.nombre} (Doc: ${prof.numero_documento})`);
            console.log(`  Tel: ${prof.telefono} | Cel: ${prof.celular} | Email: ${prof.email}\n`);
        });

        // 7. Casos problemáticos
        console.log('\n7. CASOS PROBLEMÁTICOS PARA REVISIÓN');
        console.log('====================================');
        
        const problemsQuery = `
            SELECT id, nombre, telefono, celular, email, 
                   CASE 
                       WHEN telefono IS NULL OR telefono = '' THEN 'Sin teléfono '
                       ELSE ''
                   END ||
                   CASE 
                       WHEN email IS NULL OR email = '' THEN 'Sin email '
                       WHEN email NOT LIKE '%@%' THEN 'Email inválido '
                       ELSE ''
                   END ||
                   CASE 
                       WHEN celular IS NULL OR celular = '' THEN 'Sin celular '
                       ELSE ''
                   END as problemas
            FROM copig.profesionales 
            WHERE (telefono IS NULL OR telefono = '')
               OR (email IS NULL OR email = '' OR email NOT LIKE '%@%')
               OR (celular IS NULL OR celular = '')
            LIMIT 5
        `;
        
        const problemsResult = await pool.query(problemsQuery);
        problemsResult.rows.forEach(prof => {
            console.log(`- ${prof.nombre} (ID: ${prof.id})`);
            console.log(`  Problemas: ${prof.problemas}`);
            console.log(`  Tel: ${prof.telefono || 'FALTANTE'} | Cel: ${prof.celular || 'FALTANTE'} | Email: ${prof.email || 'FALTANTE'}\n`);
        });

        console.log('\n=== FIN DEL ANÁLISIS ===');

    } catch (error) {
        console.error('Error durante el análisis:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar análisis
analyzeDataQuality();