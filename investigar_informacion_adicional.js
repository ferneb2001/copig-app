const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarInformacionAdicional() {
    try {
        console.log('🔍 INVESTIGAR INFORMACIÓN ADICIONAL - CAMPOS FALTANTES\n');
        
        // 1. Verificar estructura tabla profesionales
        console.log('=== ESTRUCTURA TABLA PROFESIONALES ===');
        const estructura = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // 2. Buscar campos relacionados con información adicional
        console.log('\n=== CAMPOS RELACIONADOS CON INFO ADICIONAL ===');
        const camposRelevantes = estructura.rows.filter(col => 
            col.column_name.toLowerCase().includes('titulo') ||
            col.column_name.toLowerCase().includes('estado') ||
            col.column_name.toLowerCase().includes('civil') ||
            col.column_name.toLowerCase().includes('nacionalidad') ||
            col.column_name.toLowerCase().includes('provincia') ||
            col.column_name.toLowerCase().includes('pais') ||
            col.column_name.toLowerCase().includes('sexo') ||
            col.column_name.toLowerCase().includes('profesion')
        );
        
        if (camposRelevantes.length > 0) {
            camposRelevantes.forEach(col => {
                console.log(`✅ ${col.column_name} (${col.data_type})`);
            });
        } else {
            console.log('❌ NO se encontraron campos relacionados');
        }
        
        // 3. Verificar datos específicos de ABAD, RAMIRO
        console.log('\n=== DATOS COMPLETOS ABAD, RAMIRO ===');
        const abad = await pool.query(`
            SELECT *
            FROM copig.profesionales 
            WHERE numero_documento = 28511894
        `);
        
        if (abad.rows.length > 0) {
            const prof = abad.rows[0];
            console.log('Datos disponibles:');
            Object.entries(prof).forEach(([key, value]) => {
                if (value !== null && value !== '') {
                    console.log(`  ${key}: ${value}`);
                } else {
                    console.log(`  ${key}: NULL/VACÍO`);
                }
            });
        }
        
        // 4. Verificar si existen tablas relacionadas
        console.log('\n=== BUSCAR TABLAS RELACIONADAS ===');
        const tablasRelacionadas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND (
                table_name LIKE '%titulo%' OR
                table_name LIKE '%profesion%' OR
                table_name LIKE '%datos%' OR
                table_name LIKE '%adicional%' OR
                table_name LIKE '%complemento%'
            )
            ORDER BY table_name
        `);
        
        if (tablasRelacionadas.rows.length > 0) {
            console.log('Tablas relacionadas encontradas:');
            tablasRelacionadas.rows.forEach(tabla => {
                console.log(`  - ${tabla.table_name}`);
            });
        } else {
            console.log('❌ No se encontraron tablas relacionadas');
        }
        
        // 5. Verificar endpoint que consulta información adicional
        console.log('\n=== ANÁLISIS DEL PROBLEMA ===');
        console.log('El frontend muestra "No especificado" para:');
        console.log('- Título');
        console.log('- Estado Civil'); 
        console.log('- Nacionalidad');
        console.log('- Provincia');
        console.log('\n🎯 CAUSAS POSIBLES:');
        console.log('1. Campos no existen en la tabla profesionales');
        console.log('2. Datos están en NULL/vacío en la base de datos');
        console.log('3. Endpoint no consulta estos campos');
        console.log('4. Frontend no mapea correctamente los campos');
        
        // 6. Ver archivos DBF originales que podrían tener esta información
        console.log('\n=== VERIFICAR DATOS ORIGINALES IMPORTADOS ===');
        const ejemplos = await pool.query(`
            SELECT nombre, numero_documento, created_at
            FROM copig.profesionales 
            WHERE numero_documento IN (28511894, 17086342, 29057309)
            ORDER BY nombre
        `);
        
        console.log('Profesionales de ejemplo para verificar datos originales:');
        ejemplos.rows.forEach(p => {
            console.log(`- ${p.nombre} (DNI: ${p.numero_documento}) - Creado: ${p.created_at}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

investigarInformacionAdicional();