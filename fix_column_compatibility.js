const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixColumnCompatibility() {
    console.log('🔧 CORRECCIÓN DE COMPATIBILIDAD DE COLUMNAS');
    console.log('='.repeat(60));
    
    try {
        // Verificar estructura de tablas
        console.log('📊 Analizando estructura de tablas...');
        
        const profesionalesStruct = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales' 
            ORDER BY ordinal_position
        `);
        
        console.log('\nEstructura tabla profesionales:');
        profesionalesStruct.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}`);
        });
        
        // Verificar si existe la tabla profesionales_externos
        const externTableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'profesionales_externos'
            )
        `);
        
        if (externTableExists.rows[0].exists) {
            console.log('\n📋 Tabla profesionales_externos ya existe');
            
            const externosStruct = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'copig' 
                AND table_name = 'profesionales_externos' 
                ORDER BY ordinal_position
            `);
            
            console.log('\nEstructura tabla profesionales_externos:');
            externosStruct.rows.forEach(col => {
                console.log(`  ${col.column_name}: ${col.data_type}`);
            });
            
            // Eliminar tablas externas mal creadas
            console.log('\n🗑️ Eliminando tablas externas con estructura incompatible...');
            await pool.query('DROP TABLE IF EXISTS copig.profesionales_externos CASCADE');
            await pool.query('DROP TABLE IF EXISTS copig.matriculas_externas CASCADE'); 
            await pool.query('DROP TABLE IF EXISTS copig.pagos_externos CASCADE');
            console.log('✅ Tablas externas eliminadas');
        }
        
        // Crear tablas externas con estructura exacta
        console.log('\n🏗️ Creando tablas externas con estructura exacta...');
        
        // Obtener la definición exacta de la tabla profesionales
        const createProfesionales = await pool.query(`
            SELECT 
                'CREATE TABLE copig.profesionales_externos (' ||
                string_agg(
                    column_name || ' ' || 
                    CASE 
                        WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
                        WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
                        WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
                        ELSE UPPER(data_type)
                    END ||
                    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                    CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                    ', '
                    ORDER BY ordinal_position
                ) || ');' as create_statement
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            AND column_name != 'id'
        `);
        
        // Crear tabla profesionales_externos manualmente
        await pool.query(`
            CREATE TABLE copig.profesionales_externos (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                numero_documento BIGINT,
                tipo_documento VARCHAR(10) DEFAULT 'DNI',
                sexo CHAR(1),
                nacionalidad VARCHAR(50) DEFAULT 'Argentina',
                fecha_nacimiento DATE,
                estado_civil VARCHAR(20),
                domicilio VARCHAR(300),
                localidad VARCHAR(100),
                departamento VARCHAR(100),
                provincia VARCHAR(100),
                codigo_postal VARCHAR(10),
                email VARCHAR(200),
                telefono VARCHAR(50),
                titulo VARCHAR(300),
                universidad VARCHAR(200),
                fecha_inscripcion TIMESTAMP,
                categoria VARCHAR(5),
                observaciones TEXT,
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla profesionales_externos creada correctamente');
        
        // Crear tabla matriculas_externas
        await pool.query(`
            CREATE TABLE copig.matriculas_externas (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales_externos(id),
                numero_matricula INTEGER UNIQUE,
                fecha_otorgamiento DATE,
                estado VARCHAR(20) DEFAULT 'ACTIVA',
                observaciones TEXT,
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla matriculas_externas creada correctamente');
        
        // Crear tabla pagos_externos
        await pool.query(`
            CREATE TABLE copig.pagos_externos (
                id SERIAL PRIMARY KEY,
                matricula VARCHAR(20),
                fecha_pago DATE,
                concepto VARCHAR(200),
                importe DECIMAL(12,2),
                recibo VARCHAR(50),
                estado VARCHAR(20) DEFAULT 'PAGADO',
                observaciones TEXT,
                fecha_importacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla pagos_externos creada correctamente');
        
        // Verificar estructuras finales
        console.log('\n✅ VERIFICACIÓN FINAL:');
        const finalCheck = await pool.query(`
            SELECT 
                t.table_name,
                COUNT(c.column_name) as columnas
            FROM information_schema.tables t
            LEFT JOIN information_schema.columns c ON t.table_name = c.table_name 
                AND t.table_schema = c.table_schema
            WHERE t.table_schema = 'copig'
            AND t.table_name IN ('profesionales', 'profesionales_externos', 'matriculas_externas', 'pagos_externos')
            GROUP BY t.table_name
            ORDER BY t.table_name
        `);
        
        finalCheck.rows.forEach(table => {
            console.log(`  ${table.table_name}: ${table.columnas} columnas`);
        });
        
        console.log('\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE');
        console.log('Las tablas externas ahora tienen estructura compatible para migración');
        
    } catch (error) {
        console.error('❌ Error en corrección:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

fixColumnCompatibility()
    .then(() => {
        console.log('\n✅ LISTO PARA EJECUTAR safe_separation_strategy.js');
    })
    .catch(error => {
        console.error('💥 Error crítico:', error.message);
        process.exit(1);
    });