const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function verSolicitudes() {
    try {
        const result = await pool.query(`
            SELECT s.id, s.numero_solicitud, s.cliente, s.proyecto, s.descripcion, 
                   s.estado, s.fecha_solicitud, s.monto_honorarios, s.costo,
                   p.nombre as profesional_nombre
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            ORDER BY s.fecha_solicitud DESC
            LIMIT 10
        `);
        
        console.log('📋 SOLICITUDES CHP EN BASE DE DATOS:');
        console.table(result.rows);
        
        // Buscar específicamente la de Fausto René González
        const fausto = result.rows.find(s => 
            s.profesional_nombre && s.profesional_nombre.toLowerCase().includes('fausto') ||
            s.cliente && s.cliente.toLowerCase().includes('fausto') ||
            s.proyecto && s.proyecto.toLowerCase().includes('ampliacion')
        );
        
        if (fausto) {
            console.log('🎯 SOLICITUD DE FAUSTO ENCONTRADA:');
            console.log(JSON.stringify(fausto, null, 2));
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verSolicitudes();