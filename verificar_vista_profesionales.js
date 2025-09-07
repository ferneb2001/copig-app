const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarVista() {
    try {
        console.log('🔍 VERIFICANDO VISTA vista_profesionales_estados\n');
        
        // 1. Ver estructura de la vista
        console.log('=== ESTRUCTURA DE LA VISTA ===');
        const estructura = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'vista_profesionales_estados'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`${col.column_name} (${col.data_type})`);
        });
        
        // 2. Verificar específicamente ABAD, RAMIRO
        console.log('\n=== DATOS ABAD, RAMIRO EN LA VISTA ===');
        const abad = await pool.query(`
            SELECT id, nombre, numero_documento, numero_matricula, email, estado_visual, ultimo_pago
            FROM copig.vista_profesionales_estados
            WHERE numero_documento = '28511894'
        `);
        
        if (abad.rows.length > 0) {
            const prof = abad.rows[0];
            console.log(`ID: ${prof.id}`);
            console.log(`Nombre: ${prof.nombre}`);
            console.log(`DNI: ${prof.numero_documento}`);
            console.log(`Matrícula: ${prof.numero_matricula || 'NULL'}`);
            console.log(`Email: ${prof.email || 'NULL'}`);
            console.log(`Estado: ${prof.estado_visual || 'NULL'}`);
            console.log(`Último pago: ${prof.ultimo_pago || 'NULL'}`);
        } else {
            console.log('❌ ABAD, RAMIRO NO ENCONTRADO EN LA VISTA');
        }
        
        // 3. Ver algunos ejemplos con y sin matrícula
        console.log('\n=== EJEMPLOS CON MATRÍCULA ===');
        const conMatricula = await pool.query(`
            SELECT nombre, numero_documento, numero_matricula
            FROM copig.vista_profesionales_estados
            WHERE numero_matricula IS NOT NULL
            LIMIT 3
        `);
        
        conMatricula.rows.forEach(p => {
            console.log(`${p.nombre} (DNI: ${p.numero_documento}) - Matrícula: ${p.numero_matricula}`);
        });
        
        console.log('\n=== EJEMPLOS SIN MATRÍCULA ===');
        const sinMatricula = await pool.query(`
            SELECT nombre, numero_documento, numero_matricula
            FROM copig.vista_profesionales_estados
            WHERE numero_matricula IS NULL
            LIMIT 5
        `);
        
        console.log(`Profesionales sin matrícula: ${sinMatricula.rows.length}`);
        sinMatricula.rows.forEach(p => {
            console.log(`${p.nombre} (DNI: ${p.numero_documento}) - Matrícula: ${p.numero_matricula || 'NULL'}`);
        });
        
        // 4. Verificar estadísticas de la vista
        console.log('\n=== ESTADÍSTICAS VISTA ===');
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(numero_matricula) as con_matricula,
                COUNT(*) - COUNT(numero_matricula) as sin_matricula
            FROM copig.vista_profesionales_estados
        `);
        
        const stat = stats.rows[0];
        console.log(`Total profesionales en vista: ${stat.total}`);
        console.log(`Con matrícula: ${stat.con_matricula}`);
        console.log(`Sin matrícula: ${stat.sin_matricula}`);
        
        // 5. Verificar si existe la vista
        console.log('\n=== VERIFICAR EXISTENCIA VISTA ===');
        const existeVista = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'vista_profesionales_estados'
            ) as existe
        `);
        
        console.log(`Vista existe: ${existeVista.rows[0].existe ? 'SÍ' : 'NO'}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

verificarVista();