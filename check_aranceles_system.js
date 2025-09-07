const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function checkArancelesSystem() {
    try {
        console.log('🔍 Verificando sistema de aranceles...');
        
        // Verificar si existe la tabla
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'copig' AND table_name = 'aranceles_chp'
            );
        `);
        
        if (tableExists.rows[0].exists) {
            console.log('✅ Tabla aranceles_chp encontrada');
            
            const aranceles = await pool.query(`
                SELECT segmento, nombre_segmento, monto_desde, monto_hasta, arancel, 
                       fecha_vigencia_desde, fecha_vigencia_hasta, activo
                FROM copig.aranceles_chp 
                WHERE activo = true
                ORDER BY monto_desde
            `);
            
            console.log('📊 Aranceles activos:');
            console.table(aranceles.rows);
            
            if (aranceles.rows.length === 0) {
                console.log('⚠️  No hay aranceles configurados. Ejecutando create_dynamic_aranceles.js');
                return false;
            }
        } else {
            console.log('❌ Tabla aranceles_chp NO encontrada. Creándola...');
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error verificando aranceles:', error);
        return false;
    } finally {
        await pool.end();
    }
}

checkArancelesSystem().then(result => {
    if (!result) {
        console.log('🛠️  Necesita ejecutar: node create_dynamic_aranceles.js');
    }
});