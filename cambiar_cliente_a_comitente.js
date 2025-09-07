const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function cambiarClienteAComitente() {
    try {
        console.log('🔄 CAMBIANDO "CLIENTE" A "COMITENTE" EN SISTEMA CHP\n');
        
        // 1. Verificar estructura actual tabla solicitudes_chp
        console.log('=== 1. ESTRUCTURA ACTUAL TABLA SOLICITUDES_CHP ===');
        const estructura = await pool.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            AND column_name IN ('cliente', 'comitente')
            ORDER BY column_name
        `);
        
        console.log('Columnas relacionadas encontradas:');
        estructura.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}(${col.character_maximum_length || 'N/A'}) - ${col.is_nullable}`);
        });
        
        // 2. Verificar datos actuales en columna cliente
        console.log('\n=== 2. DATOS ACTUALES COLUMNA CLIENTE ===');
        const datosActuales = await pool.query(`
            SELECT id, numero_solicitud, cliente FROM copig.solicitudes_chp ORDER BY id
        `);
        
        console.log(`Registros con datos en columna cliente: ${datosActuales.rows.length}`);
        datosActuales.rows.forEach(sol => {
            console.log(`  ${sol.numero_solicitud}: "${sol.cliente}"`);
        });
        
        // 3. Renombrar columna cliente a comitente
        console.log('\n=== 3. RENOMBRAR COLUMNA CLIENTE → COMITENTE ===');
        await pool.query(`
            ALTER TABLE copig.solicitudes_chp 
            RENAME COLUMN cliente TO comitente
        `);
        console.log('✅ Columna renombrada: cliente → comitente');
        
        // 4. Verificar cambio exitoso
        console.log('\n=== 4. VERIFICAR CAMBIO EXITOSO ===');
        const verificacion = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'solicitudes_chp'
            AND column_name IN ('cliente', 'comitente')
        `);
        
        verificacion.rows.forEach(col => {
            console.log(`✅ Columna existente: ${col.column_name}`);
        });
        
        // 5. Verificar datos preservados
        console.log('\n=== 5. VERIFICAR DATOS PRESERVADOS ===');
        const datosPreservados = await pool.query(`
            SELECT id, numero_solicitud, comitente FROM copig.solicitudes_chp ORDER BY id
        `);
        
        console.log(`Registros con datos preservados: ${datosPreservados.rows.length}`);
        datosPreservados.rows.forEach(sol => {
            console.log(`  ${sol.numero_solicitud}: "${sol.comitente}"`);
        });
        
        // 6. Actualizar server.js - Buscar referencias a "cliente"
        console.log('\n=== 6. BUSCAR REFERENCIAS "CLIENTE" EN SERVER.JS ===');
        const fs = require('fs');
        const serverContent = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
        const lineas = serverContent.split('\n');
        
        let referenciasCLiente = [];
        lineas.forEach((linea, i) => {
            if (linea.toLowerCase().includes('cliente') && 
                (linea.includes('solicitudes_chp') || linea.includes('INSERT') || linea.includes('SELECT') || linea.includes('UPDATE'))) {
                referenciasCLiente.push({
                    linea: i + 1,
                    contenido: linea.trim()
                });
            }
        });
        
        console.log(`Referencias "cliente" encontradas: ${referenciasCLiente.length}`);
        referenciasCLiente.forEach(ref => {
            console.log(`  Línea ${ref.linea}: ${ref.contenido}`);
        });
        
        console.log('\n✅ PASO 1 COMPLETADO: BASE DE DATOS ACTUALIZADA');
        console.log('📝 SIGUIENTE: Actualizar referencias en código');
        
    } catch (error) {
        console.error('❌ Error cambiando cliente a comitente:', error);
    } finally {
        await pool.end();
    }
}

cambiarClienteAComitente().catch(console.error);