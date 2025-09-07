const { Pool } = require('pg');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port
});

async function verificarColumnas() {
    try {
        console.log('=== VERIFICANDO COLUMNAS DE TABLA SOLICITUDES_CHP ===');
        
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'solicitudes_chp' 
            AND table_schema = 'copig'
            ORDER BY ordinal_position
        `);
        
        console.log('\nColumnas encontradas:');
        result.rows.forEach(row => {
            console.log(`  ${row.column_name} (${row.data_type})`);
        });
        
        // Verificar si existe columna 'cliente'
        const tieneCliente = result.rows.some(row => row.column_name === 'cliente');
        const tieneComitente = result.rows.some(row => row.column_name === 'comitente');
        
        console.log('\n=== ANÁLISIS ===');
        console.log(`Columna 'cliente': ${tieneCliente ? '✅ EXISTE' : '❌ NO EXISTE'}`);
        console.log(`Columna 'comitente': ${tieneComitente ? '✅ EXISTE' : '❌ NO EXISTE'}`);
        
        // Mostrar registros existentes
        console.log('\n=== REGISTROS EXISTENTES ===');
        const registros = await pool.query(`
            SELECT id, numero_solicitud, comitente, estado, fecha_solicitud 
            FROM copig.solicitudes_chp 
            ORDER BY id
        `);
        
        console.log(`Total de registros: ${registros.rows.length}`);
        registros.rows.forEach(row => {
            console.log(`  ${row.numero_solicitud} - ${row.comitente || 'SIN COMITENTE'} (${row.estado})`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
    
    await pool.end();
}

verificarColumnas();