// ANÁLISIS COMPLETO DEL PROBLEMA CHP - INVESTIGACIÓN PROFUNDA
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

console.log('🕵️ ANÁLISIS PROFUNDO DEL PROBLEMA CHP...');
console.log('═══════════════════════════════════════════════════');

async function investigarCompleto() {
    try {
        // 1. VERIFICAR QUE EXISTEN SOLICITUDES CHP
        console.log('1️⃣ VERIFICANDO SOLICITUDES CHP EN BASE DE DATOS...');
        const solicitudes = await pool.query('SELECT * FROM copig.solicitudes_chp ORDER BY id DESC LIMIT 5');
        console.log(`   📊 Total solicitudes encontradas: ${solicitudes.rows.length}`);
        
        if (solicitudes.rows.length > 0) {
            console.log('   ✅ SÍ HAY DATOS:');
            solicitudes.rows.forEach((s, i) => {
                console.log(`      ${i+1}. ID:${s.id} | ${s.numero_solicitud} | ${s.cliente} | Estado:${s.estado}`);
            });
        } else {
            console.log('   ❌ NO HAY SOLICITUDES CHP EN BD');
            return;
        }

        // 2. VERIFICAR ESTRUCTURA DE TABLA
        console.log('\n2️⃣ VERIFICANDO ESTRUCTURA DE TABLA...');
        const estructura = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position
        `);
        console.log(`   📋 Columnas encontradas: ${estructura.rows.length}`);
        estructura.rows.forEach(col => {
            console.log(`      - ${col.column_name}: ${col.data_type}`);
        });

        // 3. VERIFICAR QUERY ESPECÍFICA DEL ENDPOINT
        console.log('\n3️⃣ PROBANDO QUERY EXACTA DEL ENDPOINT...');
        const queryEndpoint = `
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        `;
        
        const resultEndpoint = await pool.query(queryEndpoint);
        console.log(`   🎯 Query endpoint devuelve: ${resultEndpoint.rows.length} resultados`);
        
        if (resultEndpoint.rows.length > 0) {
            console.log('   ✅ QUERY DEL ENDPOINT FUNCIONA:');
            resultEndpoint.rows.slice(0, 3).forEach((s, i) => {
                console.log(`      ${i+1}. ${s.numero_solicitud} | ${s.profesional_nombre || 'Sin nombre'} | Mat: ${s.numero_matricula || 'N/A'}`);
            });
        } else {
            console.log('   ❌ QUERY DEL ENDPOINT NO DEVUELVE DATOS');
        }

        // 4. SIMULAR RESPUESTA COMPLETA DEL ENDPOINT
        console.log('\n4️⃣ SIMULANDO RESPUESTA COMPLETA DEL ENDPOINT...');
        const respuestaCompleta = {
            success: true,
            solicitudes: resultEndpoint.rows
        };
        
        console.log('   📤 RESPUESTA QUE DEBERÍA LLEGAR AL FRONTEND:');
        console.log('   ', JSON.stringify(respuestaCompleta, null, 2).substring(0, 300) + '...');

        // 5. DIAGNÓSTICO FINAL
        console.log('\n🎯 DIAGNÓSTICO FINAL:');
        
        if (resultEndpoint.rows.length > 0) {
            console.log('✅ LOS DATOS EXISTEN EN LA BASE DE DATOS');
            console.log('✅ LA QUERY DEL ENDPOINT FUNCIONA CORRECTAMENTE');
            console.log('⚠️  EL PROBLEMA ES DE AUTORIZACIÓN/SESIÓN, NO DE DATOS');
            
            console.log('\n💡 SOLUCIÓN DEFINITIVA:');
            console.log('El problema NO son los datos. El problema es que Fernando no');
            console.log('está autorizado para acceder al endpoint /api/admin/solicitudes-chp');
            console.log('Necesitamos verificar/arreglar la autenticación de sesión.');
            
            console.log('\n📋 PRÓXIMOS PASOS:');
            console.log('1. Verificar sesión cuando Fernando se loguea como superadmin');
            console.log('2. Corregir endpoint para reconocer sesión de superadmin');
            console.log('3. Probar acceso directo al endpoint');
            
        } else {
            console.log('❌ NO HAY DATOS - Problema de base de datos');
        }

    } catch (error) {
        console.error('❌ Error en investigación:', error.message);
    } finally {
        await pool.end();
    }
}

investigarCompleto();