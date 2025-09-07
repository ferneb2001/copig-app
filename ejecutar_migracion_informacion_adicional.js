const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function ejecutarMigracion() {
    try {
        console.log('🚀 EJECUTANDO MIGRACIÓN INFORMACIÓN ADICIONAL\n');
        
        // 1. Mapeos de códigos
        const nacionalidades = {
            'A': 'Argentina', 'B': 'Bolivia', 'C': 'Chile', 'U': 'Uruguay', 
            'P': 'Paraguay', 'E': 'España', 'I': 'Italia', 'F': 'Francia', 'G': 'Alemania'
        };
        
        const provincias = {
            1: 'Mendoza', 2: 'Buenos Aires', 3: 'Córdoba', 4: 'Santa Fe', 5: 'San Luis',
            6: 'San Juan', 7: 'La Rioja', 8: 'Catamarca', 9: 'Tucumán', 10: 'Santiago del Estero',
            11: 'Chaco', 12: 'Corrientes', 13: 'Entre Ríos', 14: 'Formosa', 15: 'Jujuy',
            16: 'La Pampa', 17: 'Misiones', 18: 'Neuquén', 19: 'Río Negro', 20: 'Salta',
            21: 'Santa Cruz', 22: 'Tierra del Fuego', 23: 'Chubut', 24: 'CABA'
        };
        
        const titulos = {
            '001': 2, '002': 3, '003': 4, '033': 5, '034': 6, 
            '035': 7, '036': 8, '037': 9, '038': 10
        };
        
        console.log('✅ Mapeos creados');
        
        // 2. MIGRACIÓN TÍTULOS
        console.log('\n=== MIGRACIÓN TÍTULOS ===');
        let titulosMigrados = 0;
        
        const profesionalesConTitulo = await pool.query(`
            SELECT 
                p.id as profesional_id,
                m.id as matricula_id,
                f.datos_matricula->>'titulo' as codigo_titulo
            FROM copig.foxpro_matricula_profesional_map f
            JOIN copig.profesionales p ON p.numero_documento = f.profesional_dcnro::bigint
            JOIN copig.matriculas m ON m.profesional_id = p.id
            WHERE f.datos_matricula->>'titulo' IS NOT NULL
            AND m.titulo_id IS NULL
        `);
        
        console.log(`Profesionales con títulos a migrar: ${profesionalesConTitulo.rows.length}`);
        
        for (const prof of profesionalesConTitulo.rows) {
            const tituloId = titulos[prof.codigo_titulo];
            if (tituloId) {
                await pool.query(`
                    UPDATE copig.matriculas 
                    SET titulo_id = $1 
                    WHERE id = $2
                `, [tituloId, prof.matricula_id]);
                titulosMigrados++;
            }
        }
        
        console.log(`✅ ${titulosMigrados} títulos migrados`);
        
        // 3. MIGRACIÓN DATOS PERSONALES
        console.log('\n=== MIGRACIÓN DATOS PERSONALES ===');
        let datosPersonalesMigrados = 0;
        
        const profesionalesConDatos = await pool.query(`
            SELECT 
                p.id as profesional_id,
                f.datos_profesional->>'sexo' as sexo,
                f.datos_profesional->>'nacion' as codigo_nacionalidad,
                f.datos_profesional->>'provin' as codigo_provincia,
                f.datos_profesional->>'estciv' as estado_civil_codigo
            FROM copig.foxpro_matricula_profesional_map f
            JOIN copig.profesionales p ON p.numero_documento = f.profesional_dcnro::bigint
            WHERE f.datos_profesional->>'sexo' IS NOT NULL
        `);
        
        console.log(`Profesionales con datos personales a migrar: ${profesionalesConDatos.rows.length}`);
        
        for (const prof of profesionalesConDatos.rows) {
            const sexo = prof.sexo === 'M' ? 'Masculino' : prof.sexo === 'F' ? 'Femenino' : null;
            const nacionalidad = nacionalidades[prof.codigo_nacionalidad] || prof.codigo_nacionalidad;
            const provincia = provincias[parseInt(prof.codigo_provincia)] || null;
            const estadoCivil = prof.estado_civil_codigo ? 
                (prof.estado_civil_codigo === '1' ? 'Soltero' : 
                 prof.estado_civil_codigo === '2' ? 'Casado' : 
                 prof.estado_civil_codigo === '3' ? 'Divorciado' : 
                 prof.estado_civil_codigo === '4' ? 'Viudo' : null) : null;
            
            // Crear columna provincia si no existe
            try {
                await pool.query(`ALTER TABLE copig.profesionales ADD COLUMN IF NOT EXISTS provincia VARCHAR(50)`);
            } catch (err) {
                // Columna ya existe
            }
            
            await pool.query(`
                UPDATE copig.profesionales 
                SET sexo = $1, nacionalidad = $2, estado_civil = $3, provincia = $4
                WHERE id = $5
                AND (sexo IS NULL OR nacionalidad IS NULL OR estado_civil IS NULL OR provincia IS NULL)
            `, [sexo, nacionalidad, estadoCivil, provincia, prof.profesional_id]);
            
            datosPersonalesMigrados++;
        }
        
        console.log(`✅ ${datosPersonalesMigrados} registros de datos personales actualizados`);
        
        // 4. VERIFICACIÓN ABAD, RAMIRO
        console.log('\n=== VERIFICACIÓN ABAD, RAMIRO ===');
        const abadResult = await pool.query(`
            SELECT 
                p.nombre, 
                p.sexo, 
                p.nacionalidad, 
                p.estado_civil,
                p.provincia,
                tp.descripcion as titulo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
            WHERE p.numero_documento = 28511894
        `);
        
        if (abadResult.rows.length > 0) {
            const abad = abadResult.rows[0];
            console.log('ABAD, RAMIRO después de migración:');
            console.log(`  Título: ${abad.titulo || 'No especificado'}`);
            console.log(`  Sexo: ${abad.sexo || 'No especificado'}`);
            console.log(`  Nacionalidad: ${abad.nacionalidad || 'No especificado'}`);
            console.log(`  Estado Civil: ${abad.estado_civil || 'No especificado'}`);
            console.log(`  Provincia: ${abad.provincia || 'No especificado'}`);
        }
        
        // 5. ESTADÍSTICAS FINALES
        console.log('\n=== ESTADÍSTICAS FINALES ===');
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_profesionales,
                COUNT(p.sexo) as con_sexo,
                COUNT(p.nacionalidad) as con_nacionalidad,
                COUNT(p.estado_civil) as con_estado_civil,
                COUNT(p.provincia) as con_provincia,
                COUNT(tp.id) as con_titulo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
        `);
        
        const stat = stats.rows[0];
        console.log(`Total profesionales: ${stat.total_profesionales}`);
        console.log(`Con sexo: ${stat.con_sexo} (${Math.round(stat.con_sexo/stat.total_profesionales*100)}%)`);
        console.log(`Con nacionalidad: ${stat.con_nacionalidad} (${Math.round(stat.con_nacionalidad/stat.total_profesionales*100)}%)`);
        console.log(`Con estado civil: ${stat.con_estado_civil} (${Math.round(stat.con_estado_civil/stat.total_profesionales*100)}%)`);
        console.log(`Con provincia: ${stat.con_provincia} (${Math.round(stat.con_provincia/stat.total_profesionales*100)}%)`);
        console.log(`Con título: ${stat.con_titulo} (${Math.round(stat.con_titulo/stat.total_profesionales*100)}%)`);
        
        console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('La información adicional ahora debe mostrarse correctamente en el frontend');
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

ejecutarMigracion().catch(console.error);