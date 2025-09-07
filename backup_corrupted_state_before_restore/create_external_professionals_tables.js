/**
 * CREACIÓN DE TABLAS PARA PROFESIONALES EXTERNOS
 * Arquitectos, Agrimensores, etc. (no del COPIG)
 * Basado en análisis de SOPROF.DBF y SOMATRI.DBF
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

console.log('🏗️ CREACIÓN DE TABLAS PARA PROFESIONALES EXTERNOS');
console.log('📁 Fuente: Análisis SOPROF.DBF + SOMATRI.DBF');
console.log('🎯 Objetivo: Separar profesionales externos de COPIG');
console.log('='.repeat(80));

async function createExternalProfessionalsTables() {
    try {
        console.log('\n1️⃣ VERIFICANDO CONEXIÓN A BASE DE DATOS...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa');

        console.log('\n2️⃣ CREANDO TABLA: profesionales_externos');
        console.log('📋 Para datos personales de SOPROF.DBF');
        
        // Tabla para profesionales externos (datos personales)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.profesionales_externos (
                id SERIAL PRIMARY KEY,
                tipo_documento INTEGER NOT NULL,
                numero_documento BIGINT NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                domicilio VARCHAR(255),
                provincia INTEGER,
                departamento INTEGER,
                localidad INTEGER,
                fecha_nacimiento DATE,
                cuit BIGINT,
                sexo CHAR(1),
                estado_civil CHAR(1),
                nacionalidad CHAR(1) DEFAULT 'A',
                telefono VARCHAR(50),
                tipo_profesional INTEGER,
                fecha_fallecimiento DATE,
                estado CHAR(1) DEFAULT 'A',
                domicilio_legal VARCHAR(255),
                origen VARCHAR(20) NOT NULL DEFAULT 'SOPROF',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tipo_documento, numero_documento)
            )
        `);
        console.log('✅ Tabla profesionales_externos creada');

        console.log('\n3️⃣ CREANDO TABLA: matriculas_externas');
        console.log('📋 Para matrículas de SOMATRI.DBF');
        
        // Tabla para matrículas externas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.matriculas_externas (
                id SERIAL PRIMARY KEY,
                numero_matricula INTEGER NOT NULL,
                categoria VARCHAR(10) NOT NULL,
                tipo_documento INTEGER NOT NULL,
                numero_documento BIGINT NOT NULL,
                codigo_titulo VARCHAR(10),
                entidad_otorgante VARCHAR(10),
                fecha_inscripcion DATE,
                fecha_titulo DATE,
                fecha_habilitacion DATE,
                fecha_certificado DATE,
                fecha_pago DATE,
                numero_recibo INTEGER,
                ano_habilitacion INTEGER,
                numero_afiliado INTEGER,
                condicion CHAR(1) DEFAULT '1',
                origen VARCHAR(20) NOT NULL DEFAULT 'SOMATRI',
                activo BOOLEAN DEFAULT true,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(numero_matricula, categoria, origen)
            )
        `);
        console.log('✅ Tabla matriculas_externas creada');

        console.log('\n4️⃣ CREANDO RELACIÓN ENTRE TABLAS...');
        
        // Agregar foreign key para relacionar matrículas con profesionales
        await pool.query(`
            ALTER TABLE copig.matriculas_externas 
            ADD COLUMN IF NOT EXISTS profesional_externo_id INTEGER REFERENCES copig.profesionales_externos(id)
        `);
        console.log('✅ Relación establecida');

        console.log('\n5️⃣ CREANDO ÍNDICES PARA OPTIMIZACIÓN...');
        
        // Índices para optimizar búsquedas
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_prof_ext_documento 
            ON copig.profesionales_externos(tipo_documento, numero_documento)
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_prof_ext_nombre 
            ON copig.profesionales_externos(nombre)
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_matr_ext_numero 
            ON copig.matriculas_externas(numero_matricula)
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_matr_ext_categoria 
            ON copig.matriculas_externas(categoria)
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_matr_ext_documento 
            ON copig.matriculas_externas(tipo_documento, numero_documento)
        `);
        
        console.log('✅ Índices creados');

        console.log('\n6️⃣ VERIFICANDO TABLAS CREADAS...');
        
        // Verificar tablas
        const tablesCheck = await pool.query(`
            SELECT table_name, column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name IN ('profesionales_externos', 'matriculas_externas')
            ORDER BY table_name, ordinal_position
        `);
        
        console.log(`📊 Columnas verificadas: ${tablesCheck.rows.length}`);
        
        // Mostrar estructura de tablas
        let currentTable = '';
        tablesCheck.rows.forEach(row => {
            if (row.table_name !== currentTable) {
                console.log(`\n📋 TABLA: ${row.table_name}`);
                currentTable = row.table_name;
            }
            console.log(`   • ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ TABLAS PARA PROFESIONALES EXTERNOS CREADAS EXITOSAMENTE');
        console.log('🎯 PRÓXIMO PASO: Importar datos de SOPROF.DBF y SOMATRI.DBF');
        console.log('📊 Capacidad: Arquitectos, Agrimensores y otros profesionales externos');
        console.log('🔗 Relación: profesionales_externos ← matriculas_externas');
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ ERROR CREANDO TABLAS:', error.message);
        
        if (error.message.includes('already exists')) {
            console.log('💡 Las tablas ya existen, continuando...');
        } else {
            throw error;
        }
    } finally {
        await pool.end();
    }
}

// Ejecutar creación de tablas
createExternalProfessionalsTables();