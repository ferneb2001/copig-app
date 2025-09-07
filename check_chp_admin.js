const { Pool } = require('pg');
const config = require('./config.json');

console.log('🔍 VERIFICANDO SOLICITUDES CHP EN ADMIN...');
console.log('═══════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function checkCHPSolicitudes() {
    try {
        // Verificar solicitudes en base de datos
        console.log('\n📊 VERIFICANDO SOLICITUDES EN BASE DE DATOS:');
        
        const allSolicitudes = await pool.query(`
            SELECT s.id, s.numero_solicitud, s.cliente, s.proyecto, s.estado, s.costo, 
                   s.monto_honorarios, s.porcentaje_chp, s.fecha_solicitud,
                   p.nombre as profesional_nombre
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            ORDER BY s.id DESC
            LIMIT 10
        `);
        
        if (allSolicitudes.rows.length === 0) {
            console.log('❌ NO HAY SOLICITUDES EN LA BASE DE DATOS');
            return;
        }
        
        console.log(`✅ ENCONTRADAS ${allSolicitudes.rows.length} SOLICITUDES:`);
        allSolicitudes.rows.forEach((sol, index) => {
            console.log(`\n   ${index + 1}. ${sol.numero_solicitud}`);
            console.log(`      Cliente: ${sol.cliente}`);
            console.log(`      Profesional: ${sol.profesional_nombre || 'SIN NOMBRE'}`);
            console.log(`      Estado: ${sol.estado}`);
            console.log(`      Costo: $${sol.costo?.toLocaleString('es-AR') || 'NULL'}`);
            console.log(`      Honorarios: $${sol.monto_honorarios?.toLocaleString('es-AR') || 'NULL'}`);
            console.log(`      Porcentaje: ${sol.porcentaje_chp || 'NULL'}%`);
            console.log(`      Fecha: ${sol.fecha_solicitud || 'NULL'}`);
        });
        
    } catch (error) {
        console.error('❌ Error consultando solicitudes:', error.message);
    }
}

async function checkAdminEndpoint() {
    try {
        console.log('\n🔧 VERIFICANDO ENDPOINT ADMIN:');
        
        // Verificar si existe el endpoint en server.js
        const fs = require('fs');
        const serverContent = fs.readFileSync('./server.js', 'utf8');
        
        const adminEndpoints = [
            '/api/admin/solicitudes-chp',
            '/api/admin/chp',
            'solicitudes-chp'
        ];
        
        console.log('   🔍 Buscando endpoints admin para CHP:');
        adminEndpoints.forEach(endpoint => {
            const found = serverContent.includes(endpoint);
            console.log(`      ${found ? '✅' : '❌'} ${endpoint}: ${found ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
        });
        
        // Buscar todas las rutas que contengan "admin" y "chp"
        const adminChpMatches = serverContent.match(/\/api\/admin\/[^'"\s]*/g);
        if (adminChpMatches) {
            console.log('\n   📋 ENDPOINTS ADMIN ENCONTRADOS:');
            [...new Set(adminChpMatches)].forEach(endpoint => {
                console.log(`      • ${endpoint}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando endpoints:', error.message);
    }
}

async function main() {
    await checkCHPSolicitudes();
    await checkAdminEndpoint();
    
    console.log('\n🎯 POSIBLES PROBLEMAS:');
    console.log('1. ❓ Endpoint /api/admin/solicitudes-chp no existe');
    console.log('2. ❓ Frontend admin no está llamando al endpoint correcto');
    console.log('3. ❓ Filtros en admin panel ocultando las solicitudes');
    console.log('4. ❓ Error en la consulta SQL del endpoint admin');
    console.log('5. ❓ Problema de autenticación/sesión en admin');
    
    console.log('\n🔍 SIGUIENTE PASO:');
    console.log('• Verificar admin-chp.html para ver qué endpoint usa');
    console.log('• Revisar server.js para confirmar endpoint admin existe');
    
    await pool.end();
}

main().catch(console.error);