const { Pool } = require('pg');
const config = require('./config.json');

async function verificarUltimaSolicitud() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔍 Verificando última solicitud de Gastón Nebro...');
        
        // Buscar solicitudes del profesional de prueba
        const query = await pool.query(`
            SELECT id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra, estado, fecha_solicitud
            FROM copig.solicitudes_chp 
            WHERE profesional_id = 10752
            ORDER BY fecha_solicitud DESC
            LIMIT 5
        `);
        
        console.log('\n📋 Últimas 5 solicitudes del profesional de prueba:');
        query.rows.forEach((sol, index) => {
            console.log(`${index + 1}. ${sol.numero_solicitud}`);
            console.log(`   Comitente: ${sol.comitente || 'NO ESPECIFICADO'}`);
            console.log(`   Proyecto: ${sol.proyecto}`);
            console.log(`   Descripción: ${sol.descripcion}`);
            console.log(`   Ubicación: ${sol.ubicacion_obra}`);
            console.log(`   Estado: ${sol.estado}`);
            console.log(`   Fecha: ${sol.fecha_solicitud}`);
            console.log('');
        });
        
        // Verificar específicamente la de Gastón Nebro
        const gastonSolicitud = query.rows.find(sol => sol.comitente && sol.comitente.toLowerCase().includes('gaston'));
        
        if (gastonSolicitud) {
            console.log('✅ SOLICITUD DE GASTÓN NEBRO ENCONTRADA EN BD:');
            console.log(`   - Número: ${gastonSolicitud.numero_solicitud}`);
            console.log(`   - Comitente: ${gastonSolicitud.comitente}`);
            console.log(`   - Proyecto: ${gastonSolicitud.proyecto}`);
            console.log(`   - ID: ${gastonSolicitud.id}`);
            console.log(`   - Estado: ${gastonSolicitud.estado}`);
        } else {
            console.log('❌ No se encontró solicitud de Gastón Nebro');
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await pool.end();
    }
}

verificarUltimaSolicitud();