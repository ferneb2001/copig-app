const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

async function checkSolicitudes() {
    try {
        console.log('Verificando solicitudes CHP en base de datos...\n');
        
        // 1. Ver todas las solicitudes
        const allSolicitudes = await pool.query(`
            SELECT s.*, p.nombre 
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            ORDER BY s.id DESC
        `);
        
        console.log(`📊 Total de solicitudes: ${allSolicitudes.rows.length}`);
        
        if (allSolicitudes.rows.length > 0) {
            console.log('\nÚltimas solicitudes:');
            allSolicitudes.rows.slice(0, 5).forEach(s => {
                console.log(`  ID: ${s.id} | Profesional: ${s.nombre} (ID: ${s.profesional_id}) | Cliente: ${s.cliente} | Número: ${s.numero_solicitud}`);
            });
        }
        
        // 2. Ver solicitudes del profesional de prueba (ID: 10752)
        console.log('\n🔍 Solicitudes del profesional PRUEBA TEST (ID: 10752):');
        const pruebasSolicitudes = await pool.query(`
            SELECT * FROM copig.solicitudes_chp 
            WHERE profesional_id = 10752
            ORDER BY id DESC
        `);
        
        console.log(`Total para profesional de prueba: ${pruebasSolicitudes.rows.length}`);
        
        if (pruebasSolicitudes.rows.length > 0) {
            pruebasSolicitudes.rows.forEach(s => {
                console.log(`  - ${s.numero_solicitud}: ${s.cliente} | Estado: ${s.estado}`);
            });
        } else {
            console.log('  ⚠️ No hay solicitudes para el profesional de prueba');
        }
        
        // 3. Verificar la estructura de la tabla
        console.log('\n📋 Columnas de la tabla solicitudes_chp:');
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            AND column_name IN ('id', 'profesional_id', 'cliente', 'proyecto', 'numero_solicitud', 'estado')
            ORDER BY ordinal_position
        `);
        
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkSolicitudes();