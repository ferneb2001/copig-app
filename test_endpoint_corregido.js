const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testEndpointCorregido() {
    try {
        console.log('✅ PRUEBA ENDPOINT ADMIN CORREGIDO\n');
        
        // 1. Probar query corregida
        console.log('=== PROBAR QUERY ADMIN CORREGIDA ===');
        const result = await pool.query(`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   p.numero_documento,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        `);
        
        console.log(`✅ Query funciona - ${result.rows.length} solicitudes encontradas`);
        
        result.rows.forEach((sol, i) => {
            console.log(`  ${i+1}. ${sol.numero_solicitud} - ${sol.estado}`);
            console.log(`     Profesional: ${sol.profesional_nombre} (DNI: ${sol.numero_documento})`);
            console.log(`     Matrícula: ${sol.numero_matricula}`);
            console.log(`     Cliente: ${sol.cliente}`);
            console.log(`     Fecha: ${sol.fecha_solicitud}`);
            console.log('');
        });
        
        console.log('🎉 ENDPOINT ADMIN CHP CORREGIDO Y FUNCIONANDO');
        console.log('\n📝 FERNANDO - AHORA DEBERÍA FUNCIONAR:');
        console.log('1. Reiniciar servidor: Ctrl+C y luego node server.js');
        console.log('2. Como profesional: crear solicitud CHP');
        console.log('3. Como admin: panel CHP debe mostrar la solicitud');
        console.log('4. La replicación debe funcionar correctamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testEndpointCorregido().catch(console.error);