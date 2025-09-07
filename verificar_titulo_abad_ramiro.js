const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarTituloAbad() {
    try {
        console.log('🔍 VERIFICAR TÍTULO DE ABAD, RAMIRO\n');
        
        // 1. Obtener datos completos de ABAD RAMIRO con título
        console.log('=== DATOS COMPLETOS CON TÍTULO ===');
        const datosCompletos = await pool.query(`
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                p.sexo,
                p.estado_civil,
                p.nacionalidad,
                p.domicilio,
                m.numero_matricula,
                m.titulo_id,
                tp.descripcion as titulo,
                tp.codigo as codigo_titulo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
            WHERE p.numero_documento = 28511894
        `);
        
        if (datosCompletos.rows.length > 0) {
            const prof = datosCompletos.rows[0];
            console.log('ABAD, RAMIRO - Datos completos:');
            console.log(`  ID: ${prof.id}`);
            console.log(`  Nombre: ${prof.nombre}`);
            console.log(`  DNI: ${prof.numero_documento}`);
            console.log(`  Matrícula: ${prof.numero_matricula}`);
            console.log(`  Título ID: ${prof.titulo_id || 'NULL'}`);
            console.log(`  Título: ${prof.titulo || 'NO ESPECIFICADO'}`);
            console.log(`  Código título: ${prof.codigo_titulo || 'NULL'}`);
            console.log(`  Sexo: ${prof.sexo || 'NULL'}`);
            console.log(`  Estado civil: ${prof.estado_civil || 'NULL'}`);
            console.log(`  Nacionalidad: ${prof.nacionalidad || 'NULL'}`);
            console.log(`  Domicilio: ${prof.domicilio || 'NULL'}`);
        }
        
        // 2. Ver otros ejemplos con títulos
        console.log('\n=== EJEMPLOS DE PROFESIONALES CON TÍTULOS ===');
        const conTitulos = await pool.query(`
            SELECT 
                p.nombre, 
                p.numero_documento,
                m.numero_matricula,
                tp.descripcion as titulo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
            WHERE tp.descripcion IS NOT NULL
            LIMIT 5
        `);
        
        if (conTitulos.rows.length > 0) {
            console.log('Profesionales CON títulos registrados:');
            conTitulos.rows.forEach((prof, i) => {
                console.log(`  ${i + 1}. ${prof.nombre} (DNI: ${prof.numero_documento}) - ${prof.titulo}`);
            });
        } else {
            console.log('❌ NO se encontraron profesionales con títulos');
        }
        
        // 3. Estadísticas de títulos
        console.log('\n=== ESTADÍSTICAS TÍTULOS ===');
        const statsTitulos = await pool.query(`
            SELECT 
                COUNT(*) as total_matriculas,
                COUNT(m.titulo_id) as con_titulo_id,
                COUNT(tp.descripcion) as con_titulo_descripcion
            FROM copig.matriculas m
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
        `);
        
        const stats = statsTitulos.rows[0];
        console.log(`Total matrículas: ${stats.total_matriculas}`);
        console.log(`Con titulo_id: ${stats.con_titulo_id}`);
        console.log(`Con título_descripción: ${stats.con_titulo_descripcion}`);
        console.log(`Sin título: ${stats.total_matriculas - stats.con_titulo_descripcion}`);
        
        // 4. Ver todos los títulos disponibles
        console.log('\n=== TÍTULOS DISPONIBLES EN EL SISTEMA ===');
        const todosLosTitulos = await pool.query(`
            SELECT id, codigo, descripcion 
            FROM copig.titulos_profesionales 
            ORDER BY codigo
        `);
        
        todosLosTitulos.rows.forEach(titulo => {
            console.log(`  ${titulo.codigo}: ${titulo.descripcion} (ID: ${titulo.id})`);
        });
        
        // 5. Verificar si hay datos en archivos DBF originales
        console.log('\n=== VERIFICAR DATOS FOXPRO ORIGINALES ===');
        const datosOriginales = await pool.query(`
            SELECT *
            FROM copig.foxpro_matricula_profesional_map
            WHERE profesional_dcnro = '28511894'
        `);
        
        if (datosOriginales.rows.length > 0) {
            const orig = datosOriginales.rows[0];
            console.log('Datos originales FoxPro de ABAD, RAMIRO:');
            Object.entries(orig).forEach(([key, value]) => {
                if (value) console.log(`  ${key}: ${value}`);
            });
        } else {
            console.log('❌ No se encontraron datos originales de FoxPro para ABAD, RAMIRO');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

verificarTituloAbad();