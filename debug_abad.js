const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432
});

async function debugAbad() {
    try {
        console.log('🔍 Investigando ABAD, CARLOS ADRIAN...');
        
        // Buscar el profesional específico
        const profesional = await pool.query(`
            SELECT 
                p.id, 
                p.nombre,
                p.numero_documento,
                p.email,
                p.activo
            FROM copig.profesionales p 
            WHERE p.nombre ILIKE '%ABAD, CARLOS%'
            LIMIT 1
        `);
        
        if (profesional.rows.length > 0) {
            const prof = profesional.rows[0];
            console.log('👤 Profesional encontrado:');
            console.log(`- ID: ${prof.id}`);
            console.log(`- Nombre: ${prof.nombre}`);
            console.log(`- DNI: ${prof.numero_documento} (tipo: ${typeof prof.numero_documento})`);
            console.log(`- Email: ${prof.email}`);
            console.log(`- Activo: ${prof.activo}`);
            
            // Buscar matrícula
            const matricula = await pool.query(`
                SELECT 
                    numero_matricula,
                    categoria,
                    fecha_inscripcion,
                    fecha_habilitacion,
                    activo
                FROM copig.matriculas 
                WHERE profesional_id = $1
            `, [prof.id]);
            
            console.log('\n🎯 Matrícula:');
            if (matricula.rows.length > 0) {
                const mat = matricula.rows[0];
                console.log(`- Número: ${mat.numero_matricula}`);
                console.log(`- Categoría: ${mat.categoria}`);
                console.log(`- Fecha inscripción: ${mat.fecha_inscripcion}`);
                console.log(`- Fecha habilitación: ${mat.fecha_habilitacion}`);
                console.log(`- Activa: ${mat.activo}`);
            } else {
                console.log('❌ No tiene matrícula registrada');
            }
            
            // Probar el query exacto del endpoint
            console.log('\n🧪 Probando query del endpoint...');
            const endpointQuery = await pool.query(`
                SELECT 
                    p.id, 
                    COALESCE(p.numero_documento::TEXT, 'Sin DNI') as dni, 
                    p.nombre, 
                    COALESCE(p.email, 'Sin email') as email,
                    COALESCE(m.numero_matricula::TEXT, 'Sin matrícula') as matricula,
                    COALESCE(m.categoria, 'N/A') as categoria,
                    COALESCE(m.fecha_inscripcion::TEXT, 'No disponible') as fecha_inscripcion,
                    p.activo
                FROM copig.profesionales p 
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.nombre ILIKE '%ABAD, CARLOS%'
                AND p.activo = true
                LIMIT 1
            `);
            
            console.log('📊 Resultado del endpoint:');
            console.log(JSON.stringify(endpointQuery.rows[0], null, 2));
            
        } else {
            console.log('❌ No se encontró ABAD, CARLOS ADRIAN');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

debugAbad();