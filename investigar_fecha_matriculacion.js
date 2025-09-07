const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarFechaMatriculacion() {
    const client = await pool.connect();
    try {
        console.log('🔍 INVESTIGANDO FECHAS DE MATRICULACIÓN\n');
        
        // 1. Ver estructura de tabla matriculas
        console.log('📊 1. Estructura tabla copig.matriculas:');
        const estructura = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'matriculas'
            ORDER BY ordinal_position
        `);
        
        estructura.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // 2. Ver algunos registros de matriculas con fechas
        console.log('\n📅 2. Ejemplos de registros en matriculas:');
        const ejemplos = await client.query(`
            SELECT * FROM copig.matriculas 
            WHERE profesional_id IS NOT NULL
            LIMIT 5
        `);
        
        ejemplos.rows.forEach((mat, i) => {
            console.log(`\n   Registro ${i + 1}:`);
            Object.keys(mat).forEach(key => {
                if (mat[key] !== null) {
                    console.log(`     ${key}: ${mat[key]}`);
                }
            });
        });
        
        // 3. Ver estructura tabla profesionales
        console.log('\n📊 3. Estructura tabla copig.profesionales (campos fecha):');
        const estructuraProf = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'profesionales'
            AND column_name ILIKE '%fecha%'
            ORDER BY ordinal_position
        `);
        
        if (estructuraProf.rows.length > 0) {
            estructuraProf.rows.forEach(col => {
                console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        } else {
            console.log('   ❌ No hay campos de fecha en tabla profesionales');
        }
        
        // 4. Buscar campos de fecha en todas las tablas relacionadas
        console.log('\n🔍 4. Buscando campos de fecha en todas las tablas COPIG:');
        const camposFecha = await client.query(`
            SELECT table_name, column_name, data_type
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND (column_name ILIKE '%fecha%' OR column_name ILIKE '%date%')
            ORDER BY table_name, column_name
        `);
        
        const tablasFecha = {};
        camposFecha.rows.forEach(campo => {
            if (!tablasFecha[campo.table_name]) {
                tablasFecha[campo.table_name] = [];
            }
            tablasFecha[campo.table_name].push(`${campo.column_name} (${campo.data_type})`);
        });
        
        Object.keys(tablasFecha).forEach(tabla => {
            console.log(`   📋 ${tabla}:`);
            tablasFecha[tabla].forEach(campo => {
                console.log(`     - ${campo}`);
            });
        });
        
        // 5. Verificar qué está mostrando el frontend
        console.log('\n🖥️ 5. Verificando datos que llegan al frontend:');
        const datosParaFrontend = await client.query(`
            SELECT 
                p.id, 
                m.numero_matricula as matricula,
                p.nombre, 
                p.numero_documento,
                p.email,
                p.fecha_creacion,
                m.fecha_otorgamiento,
                m.fecha_vencimiento,
                CASE WHEN p.activo THEN 'Activo' ELSE 'Inactivo' END as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
            ORDER BY p.nombre 
            LIMIT 3
        `);
        
        console.log('   Datos enviados al frontend:');
        datosParaFrontend.rows.forEach((prof, i) => {
            console.log(`\n     Profesional ${i + 1}:`);
            Object.keys(prof).forEach(key => {
                if (prof[key] !== null) {
                    console.log(`       ${key}: ${prof[key]}`);
                }
            });
        });
        
        // 6. Revisar archivos DBF originales para fechas
        console.log('\n📁 6. Revisando si existen archivos DBF con fechas de matriculación...');
        
        console.log('\n🎯 CONCLUSIONES:');
        console.log('   1. Verificando estructura de datos...');
        console.log('   2. Identificando campos de fecha disponibles...');
        console.log('   3. Comparando con lo que muestra el frontend...');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

investigarFechaMatriculacion().catch(console.error);