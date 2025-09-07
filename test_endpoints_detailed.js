const axios = require('axios');
const { Pool } = require('pg');

// Leer configuración
const config = require('./config.json');

// Pool de base de datos
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function testEndpointsDetailed() {
    console.log('🔍 DIAGNÓSTICO DETALLADO DE ENDPOINTS');
    console.log('====================================\n');

    const client = axios.create({
        baseURL: 'http://localhost:3030',
        timeout: 10000,
        withCredentials: true
    });

    try {
        // 1. Login primero
        console.log('1. Realizando login...');
        const loginResponse = await client.post('/api/unified-login', {
            dni: '20562024',
            password: 'ansiktet1969'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Login exitoso');
        } else {
            console.log('❌ Login falló');
            return;
        }

        // 2. Verificar datos en BD directamente
        console.log('\n2. Verificando datos en base de datos...');
        
        const profesionalesCount = await pool.query('SELECT COUNT(*) FROM copig.profesionales');
        const empresasCount = await pool.query('SELECT COUNT(*) FROM copig.empresas');
        
        console.log(`📊 Profesionales en BD: ${profesionalesCount.rows[0].count}`);
        console.log(`📊 Empresas en BD: ${empresasCount.rows[0].count}`);

        // 3. Probar endpoint profesionales con detalles
        console.log('\n3. Probando /api/admin/profesionales...');
        try {
            const profResponse = await client.get('/api/admin/profesionales?page=1&limit=3');
            
            if (profResponse.data && profResponse.data.profesionales) {
                console.log(`✅ Profesionales endpoint OK - ${profResponse.data.profesionales.length} obtenidos`);
                console.log(`   Total disponibles: ${profResponse.data.total}`);
            } else {
                console.log('❌ Respuesta inesperada profesionales:', JSON.stringify(profResponse.data).substring(0, 200));
            }
        } catch (error) {
            console.log('❌ Error en profesionales:');
            console.log('   Status:', error.response?.status);
            console.log('   Data:', error.response?.data);
            console.log('   Message:', error.message);
        }

        // 4. Probar endpoint empresas
        console.log('\n4. Probando /api/empresas...');
        try {
            const empResponse = await client.get('/api/empresas?page=1&limit=3');
            
            if (empResponse.data && empResponse.data.empresas) {
                console.log(`✅ Empresas endpoint OK - ${empResponse.data.empresas.length} obtenidos`);
                console.log(`   Total disponibles: ${empResponse.data.total}`);
            } else {
                console.log('❌ Respuesta inesperada empresas:', JSON.stringify(empResponse.data).substring(0, 200));
            }
        } catch (error) {
            console.log('❌ Error en empresas:');
            console.log('   Status:', error.response?.status);
            console.log('   Data:', error.response?.data);
            console.log('   Message:', error.message);
        }

        // 5. Verificar función requirePermission
        console.log('\n5. Probando endpoint sin autenticación...');
        const clientNoAuth = axios.create({
            baseURL: 'http://localhost:3030',
            timeout: 5000
        });

        try {
            await clientNoAuth.get('/api/admin/profesionales');
            console.log('⚠️  Endpoint accesible sin autenticación (problema de seguridad)');
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('✅ Endpoint requiere autenticación correctamente');
            } else {
                console.log('❓ Error inesperado sin auth:', error.response?.status, error.response?.data);
            }
        }

        // 6. Probar consulta SQL directa
        console.log('\n6. Probando consulta SQL directa...');
        try {
            const directQuery = await pool.query(`
                SELECT p.id, p.nombre, p.numero_documento, m.numero_matricula, m.categoria
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                ORDER BY p.id DESC
                LIMIT 3
            `);
            
            console.log(`✅ Consulta directa OK - ${directQuery.rows.length} profesionales:`);
            directQuery.rows.forEach(prof => {
                console.log(`   ${prof.nombre} - DNI: ${prof.numero_documento} - Mat: ${prof.numero_matricula}`);
            });
            
        } catch (error) {
            console.log('❌ Error en consulta directa:', error.message);
        }

    } catch (error) {
        console.error('❌ ERROR GENERAL:', error.message);
    } finally {
        await pool.end();
    }
}

testEndpointsDetailed();