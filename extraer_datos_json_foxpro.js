const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function extraerDatosJSON() {
    try {
        console.log('🔍 EXTRAER DATOS DE OBJETOS JSON FOXPRO\n');
        
        // 1. Ver estructura de datos_profesional y datos_matricula de ABAD, RAMIRO
        console.log('=== DATOS JSON DE ABAD, RAMIRO ===');
        const datosFoxpro = await pool.query(`
            SELECT 
                profesional_dcnro,
                profesional_nombre,
                datos_profesional,
                datos_matricula
            FROM copig.foxpro_matricula_profesional_map
            WHERE profesional_dcnro = '28511894'
        `);
        
        if (datosFoxpro.rows.length > 0) {
            const datos = datosFoxpro.rows[0];
            console.log(`Profesional: ${datos.profesional_nombre} (DNI: ${datos.profesional_dcnro})`);
            
            console.log('\n--- DATOS_PROFESIONAL ---');
            if (typeof datos.datos_profesional === 'object') {
                console.log('Contenido datos_profesional:');
                Object.entries(datos.datos_profesional).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            } else {
                console.log('datos_profesional no es un objeto:', typeof datos.datos_profesional);
            }
            
            console.log('\n--- DATOS_MATRICULA ---');
            if (typeof datos.datos_matricula === 'object') {
                console.log('Contenido datos_matricula:');
                Object.entries(datos.datos_matricula).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
            } else {
                console.log('datos_matricula no es un objeto:', typeof datos.datos_matricula);
            }
        }
        
        // 2. Ver ejemplos de otros profesionales para identificar patrones
        console.log('\n=== EJEMPLOS DE OTROS PROFESIONALES ===');
        const ejemplos = await pool.query(`
            SELECT 
                profesional_dcnro,
                profesional_nombre,
                datos_profesional,
                datos_matricula
            FROM copig.foxpro_matricula_profesional_map
            WHERE datos_profesional IS NOT NULL
            LIMIT 3
        `);
        
        ejemplos.rows.forEach((prof, i) => {
            console.log(`\n--- Ejemplo ${i + 1}: ${prof.profesional_nombre} ---`);
            
            if (typeof prof.datos_profesional === 'object') {
                console.log('datos_profesional:');
                Object.entries(prof.datos_profesional).forEach(([key, value]) => {
                    if (value) console.log(`  ${key}: ${value}`);
                });
            }
            
            if (typeof prof.datos_matricula === 'object') {
                console.log('datos_matricula:');
                Object.entries(prof.datos_matricula).forEach(([key, value]) => {
                    if (value) console.log(`  ${key}: ${value}`);
                });
            }
        });
        
        // 3. Identificar campos clave que faltan en la información adicional
        console.log('\n=== IDENTIFICAR CAMPOS PARA INFORMACIÓN ADICIONAL ===');
        console.log('Buscando campos relacionados con:');
        console.log('- Título/Profesión (titulo, profesion, carrera)');
        console.log('- Estado Civil (estado_civil, civil)');
        console.log('- Nacionalidad (nacionalidad, pais)');
        console.log('- Provincia (provincia, prov)');
        
        // 4. Contar cuántos registros tienen datos JSON
        const statsJSON = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(datos_profesional) as con_datos_profesional,
                COUNT(datos_matricula) as con_datos_matricula
            FROM copig.foxpro_matricula_profesional_map
        `);
        
        const stats = statsJSON.rows[0];
        console.log('\n=== ESTADÍSTICAS DATOS JSON ===');
        console.log(`Total registros FoxPro: ${stats.total}`);
        console.log(`Con datos_profesional: ${stats.con_datos_profesional}`);
        console.log(`Con datos_matricula: ${stats.con_datos_matricula}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

extraerDatosJSON();