const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function testEndpoint() {
    try {
        console.log('🔍 TESTEAR ENDPOINT /api/admin/profesionales\n');
        
        // Simular el query exacto que hace el endpoint
        const buscar = '';
        const limit = 50;
        const offset = 0;
        let params = [];
        
        const dataQuery = `
            SELECT 
                id, 
                numero_matricula as matricula,
                nombre, 
                numero_documento,
                email,
                fecha_inscripcion,
                fecha_habilitacion,
                ultimo_pago,
                estado_visual as estado
            FROM copig.vista_profesionales_estados
            ORDER BY nombre 
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        console.log('=== QUERY QUE EJECUTA EL ENDPOINT ===');
        console.log(dataQuery);
        
        const result = await pool.query(dataQuery, params);
        
        console.log('\n=== PRIMEROS 3 RESULTADOS ===');
        result.rows.slice(0, 3).forEach((p, i) => {
            console.log(`\n--- Profesional ${i + 1} ---`);
            console.log(`ID: ${p.id}`);
            console.log(`Nombre: ${p.nombre}`);
            console.log(`DNI: ${p.numero_documento}`);
            console.log(`Campo 'matricula': ${p.matricula} (${typeof p.matricula})`);
            console.log(`Campo 'numero_matricula': ${p.numero_matricula || 'undefined'} (${typeof p.numero_matricula})`);
            console.log(`Email: ${p.email || 'NULL'}`);
            console.log(`Estado: ${p.estado || 'NULL'}`);
            console.log(`Último pago: ${p.ultimo_pago || 'NULL'}`);
            
            // Simular la lógica del frontend
            const matriculaFrontend = p.numero_matricula || p.matricula || 'Sin matrícula';
            console.log(`🎯 LÓGICA FRONTEND: ${matriculaFrontend}`);
        });
        
        // Buscar específicamente ABAD, RAMIRO
        console.log('\n=== ABAD, RAMIRO ESPECÍFICO ===');
        const abadQuery = `
            SELECT 
                id, 
                numero_matricula as matricula,
                nombre, 
                numero_documento,
                email,
                fecha_inscripcion,
                fecha_habilitacion,
                ultimo_pago,
                estado_visual as estado
            FROM copig.vista_profesionales_estados
            WHERE numero_documento = 28511894
        `;
        
        const abadResult = await pool.query(abadQuery);
        if (abadResult.rows.length > 0) {
            const p = abadResult.rows[0];
            console.log(`ID: ${p.id}`);
            console.log(`Nombre: ${p.nombre}`);
            console.log(`DNI: ${p.numero_documento}`);
            console.log(`Campo 'matricula': ${p.matricula} (${typeof p.matricula})`);
            console.log(`Campo 'numero_matricula': ${p.numero_matricula || 'undefined'} (${typeof p.numero_matricula})`);
            
            // Simular la lógica del frontend
            const matriculaFrontend = p.numero_matricula || p.matricula || 'Sin matrícula';
            console.log(`🎯 LÓGICA FRONTEND: ${matriculaFrontend}`);
            
            // Verificar por qué podría fallar
            console.log(`\n🔍 ANÁLISIS DETALLADO:`);
            console.log(`p.numero_matricula = ${p.numero_matricula}`);
            console.log(`p.matricula = ${p.matricula}`);
            console.log(`p.numero_matricula || p.matricula = ${p.numero_matricula || p.matricula}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testEndpoint();