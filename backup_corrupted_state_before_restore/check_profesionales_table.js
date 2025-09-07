const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkProfesionalesTable() {
    try {
        console.log('=== VERIFICACIÓN DE TABLA PROFESIONALES ===\n');

        // Verificar estructura de la tabla profesionales
        const structureQuery = `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'profesionales'
            AND column_name IN ('id', 'numero_documento', 'nombre')
            ORDER BY ordinal_position
        `;
        
        const structureResult = await pool.query(structureQuery);
        console.log('Estructura relevante de la tabla profesionales:');
        structureResult.rows.forEach(col => {
            console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Verificar algunos registros
        const sampleQuery = 'SELECT id, numero_documento, nombre FROM copig.profesionales LIMIT 5';
        const sampleResult = await pool.query(sampleQuery);
        
        console.log('\nRegistros de ejemplo de profesionales:');
        sampleResult.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}, Documento: ${row.numero_documento}, Nombre: ${row.nombre}`);
        });

        // Verificar si hay alguna matrícula que coincida
        const matchQuery = `
            SELECT 
                ph.matricula as pago_matricula,
                p.numero_documento as prof_documento,
                p.nombre as prof_nombre
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.profesionales p ON ph.matricula::text = p.numero_documento
            WHERE p.numero_documento IS NOT NULL
            LIMIT 5
        `;
        
        const matchResult = await pool.query(matchQuery);
        console.log('\nCoincidencias encontradas:');
        if (matchResult.rows.length > 0) {
            matchResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. Matrícula pago: ${row.pago_matricula}, Doc profesional: ${row.prof_documento}, Nombre: ${row.prof_nombre}`);
            });
        } else {
            console.log('No se encontraron coincidencias directas entre matricula y numero_documento');
        }

    } catch (error) {
        console.error('Error al verificar las tablas:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar verificación
checkProfesionalesTable();