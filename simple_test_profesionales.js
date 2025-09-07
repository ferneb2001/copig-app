const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function testProfesionalesQuery() {
    console.log('🧪 PRUEBA DIRECTA CONSULTA PROFESIONALES');
    console.log('========================================\n');
    
    try {
        // Parámetros exactos que usa el endpoint
        const page = 1;
        const limit = 2;
        const offset = (page - 1) * limit;
        const buscar = '';
        
        console.log('1. Probando consulta básica...');
        
        // Consulta simplificada
        const dataQuery = `
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                p.email,
                p.fecha_inscripcion,
                m.numero_matricula as matricula,
                m.categoria,
                p.activo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY p.nombre 
            LIMIT $1 OFFSET $2
        `;
        
        const result = await pool.query(dataQuery, [limit, offset]);
        console.log(`✅ Consulta exitosa: ${result.rows.length} profesionales obtenidos`);
        
        result.rows.forEach((prof, index) => {
            console.log(`   ${index + 1}. ${prof.nombre} - DNI: ${prof.numero_documento} - Mat: ${prof.matricula}`);
        });
        
        // Consulta contador
        console.log('\n2. Probando contador...');
        const countQuery = `SELECT COUNT(*) as total FROM copig.profesionales`;
        const countResult = await pool.query(countQuery);
        console.log(`✅ Total profesionales: ${countResult.rows[0].total}`);
        
        // Verificar vista específica que usa el código
        console.log('\n3. Verificando vista vista_profesionales_estados...');
        try {
            const vistaQuery = `SELECT COUNT(*) FROM copig.vista_profesionales_estados`;
            const vistaResult = await pool.query(vistaQuery);
            console.log(`✅ Vista existe con ${vistaResult.rows[0].count} registros`);
        } catch (error) {
            console.log(`❌ Vista NO existe: ${error.message}`);
            console.log('💡 El endpoint usa una vista que no existe - Ese es el problema');
        }
        
    } catch (error) {
        console.error('❌ ERROR en consulta:', error.message);
        console.error('Detalle:', error.detail);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

testProfesionalesQuery();