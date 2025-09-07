const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function debugCHP() {
    try {
        console.log('🔍 VERIFICANDO SOLICITUDES CHP...\n');
        
        // Ver todas las solicitudes CHP
        const result = await pool.query(`
            SELECT s.*, p.nombre, p.numero_documento
            FROM copig.solicitudes_chp s 
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id 
            ORDER BY s.fecha_solicitud DESC
        `);
        
        console.log(`📊 TOTAL SOLICITUDES: ${result.rows.length}\n`);
        
        if (result.rows.length > 0) {
            console.log('📋 SOLICITUDES ENCONTRADAS:');
            result.rows.forEach((sol, i) => {
                console.log(`${i+1}. ${sol.numero_solicitud}`);
                console.log(`   Profesional: ${sol.nombre || 'SIN NOMBRE'} (DNI: ${sol.numero_documento || 'N/A'})`);
                console.log(`   Cliente: ${sol.cliente}`);
                console.log(`   Estado: ${sol.estado}`);
                console.log('');
            });
        }
        
        // Buscar Gastón Nebro
        console.log('🔍 BUSCANDO GASTÓN NEBRO...');
        const gaston = await pool.query(`
            SELECT id, nombre, numero_documento 
            FROM copig.profesionales 
            WHERE UPPER(nombre) LIKE '%GASTON%' OR UPPER(nombre) LIKE '%NEBRO%'
        `);
        
        console.log(`👤 PROFESIONALES ENCONTRADOS: ${gaston.rows.length}`);
        if (gaston.rows.length > 0) {
            gaston.rows.forEach(p => {
                console.log(`   ID: ${p.id} - ${p.nombre} - DNI: ${p.numero_documento}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugCHP();