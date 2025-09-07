const { Pool } = require('pg');
const fs = require('fs');

// Leer configuración
let config;
try {
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    console.log('✅ Config.json cargado correctamente');
} catch (error) {
    console.error('❌ Error al cargar config.json:', error.message);
    process.exit(1);
}

// Configurar pool de PostgreSQL
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections
});

async function testDatabase() {
    console.log('\n🔍 DIAGNÓSTICO DE BASE DE DATOS');
    console.log('================================');
    
    try {
        // Test 1: Conexión básica
        console.log('\n1. Probando conexión básica...');
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL exitosa');
        
        // Test 2: Verificar esquema copig
        console.log('\n2. Verificando esquema copig...');
        const schemaResult = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'copig'
        `);
        
        if (schemaResult.rows.length > 0) {
            console.log('✅ Esquema copig existe');
        } else {
            console.log('❌ Esquema copig NO existe');
        }
        
        // Test 3: Verificar tabla profesionales
        console.log('\n3. Verificando tabla profesionales...');
        const profesionalesResult = await client.query(`
            SELECT COUNT(*) as total 
            FROM copig.profesionales
        `);
        console.log(`✅ Tabla profesionales existe con ${profesionalesResult.rows[0].total} registros`);
        
        // Test 4: Verificar tabla empresas
        console.log('\n4. Verificando tabla empresas...');
        const empresasResult = await client.query(`
            SELECT COUNT(*) as total 
            FROM copig.empresas
        `);
        console.log(`✅ Tabla empresas existe con ${empresasResult.rows[0].total} registros`);
        
        // Test 5: Verificar tabla admin_users
        console.log('\n5. Verificando tabla admin_users...');
        const adminResult = await client.query(`
            SELECT COUNT(*) as total 
            FROM copig.admin_users
        `);
        console.log(`✅ Tabla admin_users existe con ${adminResult.rows[0].total} registros`);
        
        client.release();
        
        console.log('\n✅ DIAGNÓSTICO COMPLETADO - Base de datos funcional');
        
    } catch (error) {
        console.error('\n❌ ERROR EN BASE DE DATOS:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 SOLUCIÓN: PostgreSQL no está ejecutándose');
            console.error('   Ejecutar: net start postgresql-x64-13');
        }
        
        if (error.code === '28P01') {
            console.error('\n💡 SOLUCIÓN: Credenciales incorrectas');
            console.error('   Verificar usuario/contraseña en config.json');
        }
        
        if (error.code === '3D000') {
            console.error('\n💡 SOLUCIÓN: Base de datos no existe');
            console.error('   Crear base de datos: copig_moderno');
        }
    } finally {
        await pool.end();
        process.exit(0);
    }
}

testDatabase();