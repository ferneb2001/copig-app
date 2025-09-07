const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function verificarTitulos() {
    try {
        console.log('🔍 VERIFICAR TÍTULOS PROFESIONALES\n');
        
        // 1. Estructura tabla titulos_profesionales
        console.log('=== ESTRUCTURA TABLA titulos_profesionales ===');
        const estructuraTitulosProf = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'titulos_profesionales'
            ORDER BY ordinal_position
        `);
        
        if (estructuraTitulosProf.rows.length > 0) {
            estructuraTitulosProf.rows.forEach(col => {
                console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
            
            // Ver datos de ABAD, RAMIRO
            console.log('\n=== TÍTULOS DE ABAD, RAMIRO ===');
            const titulosAbad = await pool.query(`
                SELECT * 
                FROM copig.titulos_profesionales tp
                WHERE tp.profesional_id = (
                    SELECT id FROM copig.profesionales WHERE numero_documento = 28511894
                )
            `);
            
            if (titulosAbad.rows.length > 0) {
                console.log(`Títulos encontrados: ${titulosAbad.rows.length}`);
                titulosAbad.rows.forEach((titulo, i) => {
                    console.log(`\nTítulo ${i + 1}:`);
                    Object.entries(titulo).forEach(([key, value]) => {
                        console.log(`  ${key}: ${value}`);
                    });
                });
            } else {
                console.log('❌ ABAD, RAMIRO no tiene títulos registrados');
            }
        } else {
            console.log('❌ Tabla titulos_profesionales NO EXISTE o está vacía');
        }
        
        // 2. Estructura tabla titulos
        console.log('\n=== ESTRUCTURA TABLA titulos ===');
        const estructuraTitulos = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'titulos'
            ORDER BY ordinal_position
        `);
        
        if (estructuraTitulos.rows.length > 0) {
            estructuraTitulos.rows.forEach(col => {
                console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
            
            // Ver ejemplos de títulos disponibles
            console.log('\n=== TÍTULOS DISPONIBLES (EJEMPLOS) ===');
            const ejemplosTitulos = await pool.query(`
                SELECT * FROM copig.titulos LIMIT 10
            `);
            
            ejemplosTitulos.rows.forEach((titulo, i) => {
                console.log(`${i + 1}. ID: ${titulo.id} - Nombre: ${titulo.nombre || titulo.titulo || titulo.descripcion || 'Sin nombre'}`);
            });
        } else {
            console.log('❌ Tabla titulos NO EXISTE');
        }
        
        // 3. Buscar en archivos DBF originales información sobre títulos
        console.log('\n=== BUSCAR INFORMACIÓN EN ARCHIVOS DBF ===');
        console.log('Verificando si existen archivos DBF con información de títulos...');
        
        // Buscar tablas que puedan contener información de títulos/carreras
        const tablasRelacionadas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND (
                table_name LIKE '%carrera%' OR
                table_name LIKE '%titulo%' OR
                table_name LIKE '%profesion%' OR
                table_name LIKE '%especialidad%' OR
                table_name LIKE '%grado%'
            )
            ORDER BY table_name
        `);
        
        if (tablasRelacionadas.rows.length > 0) {
            console.log('Tablas con posible información de títulos:');
            for (const tabla of tablasRelacionadas.rows) {
                console.log(`\n--- ${tabla.table_name} ---`);
                try {
                    const count = await pool.query(`SELECT COUNT(*) as total FROM copig.${tabla.table_name}`);
                    console.log(`Registros: ${count.rows[0].total}`);
                    
                    if (count.rows[0].total > 0) {
                        const sample = await pool.query(`SELECT * FROM copig.${tabla.table_name} LIMIT 3`);
                        sample.rows.forEach((row, i) => {
                            console.log(`  Ejemplo ${i + 1}:`, Object.keys(row).slice(0, 5).map(k => `${k}:${row[k]}`).join(', '));
                        });
                    }
                } catch (err) {
                    console.log(`  Error consultando ${tabla.table_name}: ${err.message}`);
                }
            }
        }
        
        // 4. Verificar problema provincia
        console.log('\n=== PROBLEMA PROVINCIA ===');
        console.log('¿Existe columna provincia en alguna tabla relacionada?');
        
        const tablasProvincia = await pool.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND column_name ILIKE '%provincia%'
        `);
        
        if (tablasProvincia.rows.length > 0) {
            console.log('Columnas provincia encontradas:');
            tablasProvincia.rows.forEach(col => {
                console.log(`  ${col.table_name}.${col.column_name}`);
            });
        } else {
            console.log('❌ No se encontraron columnas provincia');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

verificarTitulos();