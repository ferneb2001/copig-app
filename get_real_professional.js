const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function getRealProfessional() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 BUSCANDO PROFESIONAL REAL DE LA BASE DE DATOS');
        console.log('===============================================');

        // Buscar profesionales reales con datos completos
        const realProfessionals = await client.query(`
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                m.numero as matricula,
                m.categoria,
                p.email,
                p.telefono,
                p.celular,
                p.domicilio,
                p.provincia
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.activo = true 
            AND p.numero_documento IS NOT NULL 
            AND p.nombre NOT LIKE '%HISTÓRICO%'
            AND p.nombre NOT LIKE '%PRUEBA%'
            AND p.nombre NOT LIKE '%TEST%'
            AND LENGTH(TRIM(p.nombre)) > 10
            AND p.numero_documento::TEXT NOT IN ('20562024', '12345678', '1', '2', '3')
            AND p.email IS NOT NULL
            AND LENGTH(TRIM(p.email)) > 0
            ORDER BY RANDOM()
            LIMIT 5
        `);
        
        if (realProfessionals.rows.length > 0) {
            console.log('✅ PROFESIONALES REALES ENCONTRADOS:');
            console.log('====================================');
            
            for (let i = 0; i < realProfessionals.rows.length; i++) {
                const prof = realProfessionals.rows[i];
                console.log(`\n👤 PROFESIONAL ${i + 1}:`);
                console.log(`   📝 Nombre: ${prof.nombre}`);
                console.log(`   🎯 Matrícula: ${prof.matricula}`);
                console.log(`   🆔 Documento: ${prof.numero_documento}`);
                console.log(`   🏷️  Categoría: ${prof.categoria}`);
                console.log(`   📧 Email: ${prof.email || 'Sin email'}`);
                console.log(`   📞 Teléfono: ${prof.telefono || 'Sin teléfono'}`);
                console.log(`   📱 Celular: ${prof.celular || 'Sin celular'}`);
                console.log(`   🏠 Domicilio: ${prof.domicilio || 'Sin domicilio'}`);
                console.log(`   🌍 Provincia: ${prof.provincia || 'Sin provincia'}`);
                
                // Mapear categoría
                const categoriaMap = {
                    'A': 'Ingeniero Civil',
                    'B': 'Ingeniero Mecánico', 
                    'C': 'Ingeniero Electrónico',
                    'D': 'Ingeniero Industrial',
                    'E': 'Ingeniero Químico',
                    'F': 'Ingeniero en Minas',
                    'G': 'Ingeniero Agrimensor',
                    'H': 'Ingeniero en Sistemas',
                    'I': 'Ingeniero en Sistemas de Información',
                    'J': 'Otras Ingenierías'
                };
                
                console.log(`   🎓 Especialidad: ${categoriaMap[prof.categoria] || 'Especialidad ' + prof.categoria}`);
                console.log('   ─────────────────────────────────────');
            }
            
            // Destacar el primero como ejemplo
            const ejemplo = realProfessionals.rows[0];
            console.log('\n🌟 PROFESIONAL RECOMENDADO PARA PRUEBAS:');
            console.log('=======================================');
            console.log(`👤 ${ejemplo.nombre}`);
            console.log(`🎯 Matrícula: ${ejemplo.matricula}`);
            console.log(`🆔 Documento: ${ejemplo.numero_documento}`);
            console.log('');
            console.log('💻 PARA USAR EN EL SISTEMA:');
            console.log('==========================');
            console.log(`🔗 Portal: http://localhost:3030/pago-matricula`);
            console.log(`📝 Usuario: ${ejemplo.matricula}`);
            console.log(`🆔 Documento: ${ejemplo.numero_documento}`);
            console.log('🔐 Contraseña: No requerida (primera vez)');
            
        } else {
            console.log('❌ No se encontraron profesionales reales con datos completos');
            
            // Buscar cualquier profesional real (menos estricto)
            const anyProfessional = await client.query(`
                SELECT 
                    p.nombre,
                    p.numero_documento,
                    m.numero as matricula,
                    m.categoria
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.activo = true AND m.activo = true 
                AND p.numero_documento IS NOT NULL 
                AND p.nombre NOT LIKE '%HISTÓRICO%'
                AND m.numero > 1000
                ORDER BY RANDOM()
                LIMIT 3
            `);
            
            if (anyProfessional.rows.length > 0) {
                console.log('\n✅ PROFESIONALES DISPONIBLES (datos básicos):');
                anyProfessional.rows.forEach((prof, i) => {
                    console.log(`${i + 1}. ${prof.nombre} - Matrícula: ${prof.matricula} - Doc: ${prof.numero_documento}`);
                });
            }
        }

        // Estadísticas adicionales
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_profesionales,
                COUNT(CASE WHEN p.email IS NOT NULL AND LENGTH(TRIM(p.email)) > 0 THEN 1 END) as con_email,
                COUNT(CASE WHEN p.telefono IS NOT NULL OR p.celular IS NOT NULL THEN 1 END) as con_telefono
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true AND m.activo = true 
            AND p.nombre NOT LIKE '%HISTÓRICO%'
        `);
        
        console.log('\n📊 ESTADÍSTICAS DE LA BASE:');
        console.log('===========================');
        const s = stats.rows[0];
        console.log(`👥 Total profesionales: ${s.total_profesionales}`);
        console.log(`📧 Con email: ${s.con_email}`);
        console.log(`📞 Con teléfono: ${s.con_telefono}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

getRealProfessional();