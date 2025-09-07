const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function buscarRelacionTitulo() {
    try {
        console.log('🔍 BUSCAR RELACIÓN PROFESIONALES-TÍTULOS\n');
        
        // 1. Ver contenido tabla titulos_profesionales (es catálogo)
        console.log('=== TABLA titulos_profesionales (CATÁLOGO) ===');
        const titulos = await pool.query(`SELECT * FROM copig.titulos_profesionales LIMIT 10`);
        titulos.rows.forEach((titulo, i) => {
            console.log(`${i + 1}. ID: ${titulo.id} - Código: ${titulo.codigo} - Descripción: ${titulo.descripcion}`);
        });
        
        // 2. Buscar tablas que puedan vincular profesionales con títulos
        console.log('\n=== BUSCAR TABLA DE RELACIÓN ===');
        const todasTablas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            ORDER BY table_name
        `);
        
        // Filtrar tablas que puedan ser la relación
        const posiblesRelaciones = todasTablas.rows.filter(t => 
            t.table_name.includes('profesional') || 
            t.table_name.includes('titulo') ||
            t.table_name.includes('matricula')
        );
        
        console.log('Tablas candidatas para relación profesionales-títulos:');
        for (const tabla of posiblesRelaciones) {
            console.log(`\n--- ${tabla.table_name} ---`);
            try {
                // Ver estructura
                const estructura = await pool.query(`
                    SELECT column_name, data_type
                    FROM information_schema.columns 
                    WHERE table_schema = 'copig' 
                    AND table_name = '${tabla.table_name}'
                    ORDER BY ordinal_position
                `);
                
                const columnas = estructura.rows.map(c => c.column_name).join(', ');
                console.log(`Columnas: ${columnas}`);
                
                // Si tiene profesional_id o similar, ver datos
                const tieneRelacion = estructura.rows.some(c => 
                    c.column_name.includes('profesional') || 
                    c.column_name.includes('titulo') ||
                    c.column_name.includes('codigo')
                );
                
                if (tieneRelacion) {
                    const count = await pool.query(`SELECT COUNT(*) as total FROM copig.${tabla.table_name}`);
                    console.log(`📊 ${count.rows[0].total} registros`);
                    
                    if (count.rows[0].total > 0 && count.rows[0].total < 50) {
                        const ejemplos = await pool.query(`SELECT * FROM copig.${tabla.table_name} LIMIT 3`);
                        ejemplos.rows.forEach((row, i) => {
                            console.log(`  Ejemplo ${i + 1}:`, Object.entries(row).slice(0, 4).map(([k,v]) => `${k}:${v}`).join(', '));
                        });
                    }
                }
            } catch (err) {
                console.log(`  ⚠️ Error: ${err.message}`);
            }
        }
        
        // 3. Verificar si hay información en los archivos DBF originales
        console.log('\n=== VERIFICAR ARCHIVOS DBF ORIGINALES ===');
        console.log('Los títulos podrían estar en los archivos DBF de Peñaloza...');
        
        // 4. Buscar específicamente en la tabla profesionales si hay referencias a títulos
        console.log('\n=== BUSCAR EN TABLA PROFESIONALES ORIGINAL ===');
        const profesionalCompleto = await pool.query(`
            SELECT *
            FROM copig.profesionales 
            WHERE numero_documento = 28511894
        `);
        
        if (profesionalCompleto.rows.length > 0) {
            const prof = profesionalCompleto.rows[0];
            console.log('Todos los campos de ABAD, RAMIRO:');
            Object.entries(prof).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        }
        
        // 5. Verificar si hay tablas con datos de especialidades/carreras
        console.log('\n=== BUSCAR ESPECIALIDADES/CARRERAS ===');
        const especialidades = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name ILIKE '%esp%'
        `);
        
        if (especialidades.rows.length > 0) {
            console.log('Tablas con especialidades:');
            especialidades.rows.forEach(t => console.log(`  - ${t.table_name}`));
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

buscarRelacionTitulo();