const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function migrarInformacionAdicional() {
    try {
        console.log('🚀 MIGRAR INFORMACIÓN ADICIONAL DESDE JSON\n');
        
        console.log('=== BACKUP PREVENTIVO ===');
        console.log('FERNANDO: Se recomienda hacer backup antes de continuar');
        
        // 1. Crear mapeos
        console.log('\n=== CREAR MAPEOS ===');
        
        // Mapeo de nacionalidades
        const nacionalidades = {
            'A': 'Argentina',
            'B': 'Bolivia',
            'C': 'Chile',
            'U': 'Uruguay',
            'P': 'Paraguay',
            'E': 'España',
            'I': 'Italia',
            'F': 'Francia',
            'G': 'Alemania'
        };
        
        // Mapeo de provincias (códigos comunes)
        const provincias = {
            1: 'Mendoza',
            2: 'Buenos Aires',
            3: 'Córdoba',
            4: 'Santa Fe',
            5: 'San Luis',
            6: 'San Juan',
            7: 'La Rioja',
            8: 'Catamarca',
            9: 'Tucumán',
            10: 'Santiago del Estero',
            11: 'Chaco',
            12: 'Corrientes',
            13: 'Entre Ríos',
            14: 'Formosa',
            15: 'Jujuy',
            16: 'La Pampa',
            17: 'Misiones',
            18: 'Neuquén',
            19: 'Río Negro',
            20: 'Salta',
            21: 'Santa Cruz',
            22: 'Tierra del Fuego',
            23: 'Chubut',
            24: 'CABA'
        };
        
        // Mapeo de títulos (según catálogo)
        const titulos = {
            '001': 2, // ARQUITECTO
            '002': 3, // INGENIERO CIVIL
            '003': 4, // INGENIERO EN CONSTRUCCIONES
            '033': 5, // INGENIERO CIVIL
            '034': 6, // ARQUITECTO
            '035': 7, // INGENIERO EN CONSTRUCCIONES
            '036': 8, // MAESTRO MAYOR DE OBRAS
            '037': 9, // CONSTRUCTOR
            '038': 10 // TECNICO EN CONSTRUCCIONES
        };
        
        console.log('Mapeos creados:');
        console.log(`- ${Object.keys(nacionalidades).length} nacionalidades`);
        console.log(`- ${Object.keys(provincias).length} provincias`);
        console.log(`- ${Object.keys(titulos).length} títulos`);
        
        // 2. Script de migración - SOLO MOSTRAR PRIMERO
        console.log('\n=== SCRIPT DE MIGRACIÓN (SIMULACIÓN) ===');
        
        // Contar registros a procesar
        const totalRegistros = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.foxpro_matricula_profesional_map
        `);
        
        console.log(`Total registros a procesar: ${totalRegistros.rows[0].total}`);
        
        // Simular migración de títulos
        console.log('\n--- MIGRACIÓN TÍTULOS ---');
        const titulosMigrar = await pool.query(`
            SELECT 
                f.profesional_dcnro,
                f.profesional_nombre,
                f.datos_matricula->>'titulo' as codigo_titulo,
                m.id as matricula_id,
                m.titulo_id as titulo_actual
            FROM copig.foxpro_matricula_profesional_map f
            JOIN copig.profesionales p ON p.numero_documento = f.profesional_dcnro::bigint
            JOIN copig.matriculas m ON m.profesional_id = p.id
            WHERE f.datos_matricula->>'titulo' IS NOT NULL
            LIMIT 5
        `);
        
        console.log('Ejemplos de títulos a migrar:');
        titulosMigrar.rows.forEach(reg => {
            const tituloId = titulos[reg.codigo_titulo];
            console.log(`${reg.profesional_nombre} - Código: ${reg.codigo_titulo} → Título ID: ${tituloId || 'NO MAPEADO'}`);
        });
        
        // Simular migración de sexo/nacionalidad
        console.log('\n--- MIGRACIÓN DATOS PERSONALES ---');
        const datosMigrar = await pool.query(`
            SELECT 
                f.profesional_dcnro,
                f.profesional_nombre,
                f.datos_profesional->>'sexo' as sexo,
                f.datos_profesional->>'nacion' as codigo_nacionalidad,
                f.datos_profesional->>'provin' as codigo_provincia,
                p.sexo as sexo_actual,
                p.nacionalidad as nacionalidad_actual
            FROM copig.foxpro_matricula_profesional_map f
            JOIN copig.profesionales p ON p.numero_documento = f.profesional_dcnro::bigint
            WHERE f.datos_profesional->>'sexo' IS NOT NULL
            LIMIT 5
        `);
        
        console.log('Ejemplos de datos personales a migrar:');
        datosMigrar.rows.forEach(reg => {
            const sexoTexto = reg.sexo === 'M' ? 'Masculino' : reg.sexo === 'F' ? 'Femenino' : reg.sexo;
            const nacionalidad = nacionalidades[reg.codigo_nacionalidad] || reg.codigo_nacionalidad;
            const provincia = provincias[parseInt(reg.codigo_provincia)] || `Provincia ${reg.codigo_provincia}`;
            
            console.log(`${reg.profesional_nombre}:`);
            console.log(`  Sexo: ${reg.sexo} → ${sexoTexto}`);
            console.log(`  Nacionalidad: ${reg.codigo_nacionalidad} → ${nacionalidad}`);
            console.log(`  Provincia: ${reg.codigo_provincia} → ${provincia}`);
        });
        
        console.log('\n=== CONFIRMACIÓN REQUERIDA ===');
        console.log('¿Fernando quiere ejecutar la migración real?');
        console.log('Esto actualizará TODOS los profesionales con sus datos faltantes');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

migrarInformacionAdicional();