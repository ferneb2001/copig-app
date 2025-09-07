const { Pool } = require('pg');

// Configuración de base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432
});

async function debugProfesionales() {
    try {
        console.log('🔍 Verificando profesionales en base de datos...');
        
        // Contar total
        const count = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        console.log(`📊 Total profesionales: ${count.rows[0].total}`);
        
        // Contar activos
        const countActivos = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales WHERE activo = true');
        console.log(`✅ Profesionales activos: ${countActivos.rows[0].total}`);
        
        // Mostrar primeros 5
        const primeros = await pool.query(`
            SELECT id, nombre, numero_documento, email, activo 
            FROM copig.profesionales 
            ORDER BY id 
            LIMIT 5
        `);
        
        console.log('\n📋 Primeros 5 profesionales:');
        primeros.rows.forEach(prof => {
            console.log(`- ID: ${prof.id} | ${prof.nombre} | DNI: ${prof.numero_documento} | Activo: ${prof.activo}`);
        });
        
        // Probar query simple
        console.log('\n🧪 Probando query del endpoint...');
        const simple = await pool.query(`
            SELECT 
                p.id, 
                p.numero_documento as dni, 
                p.nombre, 
                p.email 
            FROM copig.profesionales p 
            WHERE p.activo = true 
            ORDER BY p.nombre 
            LIMIT 10
        `);
        
        console.log(`✅ Query exitosa, ${simple.rows.length} profesionales encontrados`);
        console.log('Primeros resultados:');
        simple.rows.forEach(prof => {
            console.log(`- ${prof.nombre} (DNI: ${prof.dni})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

debugProfesionales();