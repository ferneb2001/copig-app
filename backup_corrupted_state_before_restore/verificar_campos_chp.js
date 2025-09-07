/**
 * VERIFICAR CAMPOS EN TABLAS CHP
 */

const { Client } = require('pg');
const config = require('./config.json');

async function verificarCamposCHP() {
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        console.log('📋 ESTRUCTURA TABLA solicitudes_chp:');
        console.log('='.repeat(50));
        
        // VER ESTRUCTURA solicitudes_chp
        const estructura = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
        
        console.log('\n📋 ESTRUCTURA TABLA documentos_chp:');
        console.log('='.repeat(50));
        
        // VER ESTRUCTURA documentos_chp
        const estructuraDocs = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'documentos_chp'
            ORDER BY ordinal_position
        `);
        
        if (estructuraDocs.rows.length > 0) {
            estructuraDocs.rows.forEach(col => {
                console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        } else {
            console.log('❌ Tabla documentos_chp NO EXISTE');
        }
        
        console.log('\n📊 DATOS EJEMPLO solicitudes_chp:');
        console.log('='.repeat(50));
        
        // VER DATOS EJEMPLO CON IMPORTES
        const datos = await client.query(`
            SELECT id, numero_solicitud, profesional_id, cliente, proyecto,
                   monto_honorarios, porcentaje_chp, costo, estado, fecha_solicitud
            FROM copig.solicitudes_chp 
            ORDER BY fecha_solicitud DESC 
            LIMIT 3
        `);
        
        datos.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`  Número: ${row.numero_solicitud}`);
            console.log(`  Cliente: ${row.cliente}`);
            console.log(`  Proyecto: ${row.proyecto}`);
            console.log(`  💰 Monto Honorarios: $${row.monto_honorarios || 'NO DEFINIDO'}`);
            console.log(`  📊 Porcentaje CHP: ${row.porcentaje_chp || 'NO DEFINIDO'}%`);
            console.log(`  💵 Costo Final: $${row.costo || 'NO DEFINIDO'}`);
            console.log(`  📋 Estado: ${row.estado}`);
            console.log(`  📅 Fecha: ${row.fecha_solicitud?.toLocaleDateString()}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

verificarCamposCHP();