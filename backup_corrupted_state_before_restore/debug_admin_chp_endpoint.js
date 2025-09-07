const fetch = require('node-fetch');

console.log('🔍 DEBUGGING ENDPOINT ADMIN CHP...');
console.log('═══════════════════════════════════════════════');

async function testAdminCHPEndpoint() {
    try {
        console.log('\n📡 PROBANDO /api/admin/solicitudes-chp:');
        
        const response = await fetch('http://localhost:3030/api/admin/solicitudes-chp', {
            method: 'GET',
            headers: {
                'Cookie': 'connect.sid=fake-admin-session'
            }
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`   Response: ${responseText.substring(0, 200)}...`);
        
        if (response.status === 401) {
            console.log('   ❌ PROBLEMA: No autorizado - El admin no tiene sesión válida');
        }
        
        if (response.status === 404) {
            console.log('   ❌ PROBLEMA: Endpoint no encontrado');
        }
        
    } catch (error) {
        console.error('❌ Error probando endpoint:', error.message);
    }
}

async function checkDirectDBQuery() {
    try {
        const { Pool } = require('pg');
        const config = require('./config.json');
        const pool = new Pool(config.database);
        
        console.log('\n📊 CONSULTA DIRECTA A BD:');
        const result = await pool.query(`
            SELECT COUNT(*) as total FROM copig.solicitudes_chp
        `);
        
        console.log(`   Total solicitudes: ${result.rows[0].total}`);
        
        if (result.rows[0].total > 0) {
            const samples = await pool.query(`
                SELECT id, numero_solicitud, cliente, estado 
                FROM copig.solicitudes_chp 
                ORDER BY id DESC LIMIT 3
            `);
            
            console.log('   📋 Últimas solicitudes:');
            samples.rows.forEach(s => {
                console.log(`      • ${s.numero_solicitud}: ${s.cliente} (${s.estado})`);
            });
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error consultando BD:', error.message);
    }
}

async function main() {
    await testAdminCHPEndpoint();
    await checkDirectDBQuery();
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('• Si status 401: Problema de autenticación admin');
    console.log('• Si status 404: Endpoint no existe o ruta incorrecta');
    console.log('• Si BD tiene datos: Problema en endpoint o frontend');
}

main().catch(console.error);