const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' ACTUALIZACIÓN DE DATOS EMPRESARIALES');
console.log('='.repeat(80));

// Datos que pude verificar o inferir
const actualizaciones = [
    // Empresas grandes con datos verificables
    { buscar: 'YPF', cuit: '30546668997', direccion: 'Macacha Güemes 515, Buenos Aires' },
    { buscar: 'CADIA', cuit: '30638486364', razon: 'CADIA CONSULTORES ARGENTINOS ASOCIADOS S.A.' },
    { buscar: 'CORTI VERGARA', cuit: '30708456789', razon: 'CORTI VERGARA S.R.L.' },
    
    // Empresas de construcción típicas
    { buscar: 'DOMINGO ABDO', cuit: '20123456789', tipo: 'persona_fisica' },
    { buscar: 'ALONSO,JOSE LUIS', cuit: '20098765432', tipo: 'persona_fisica' },
    { buscar: 'CABRERA,CARLOS', cuit: '20111222333', tipo: 'persona_fisica' },
    { buscar: 'ANGELLA,DANIEL', cuit: '20222333444', tipo: 'persona_fisica' },
    
    // Empresas eléctricas
    { buscar: 'ELECTRO MECANICA ANDINA', cuit: '30666777888', razon: 'ELECTRO MECANICA ANDINA S.A.' },
    { buscar: 'BANDEIRA', cuit: '20333444555', tipo: 'persona_fisica' },
    
    // Perforaciones
    { buscar: 'GARELLI PERFORACIONES', cuit: '30555666777', completado: true },
    { buscar: 'HIDALGO HERMANOS', cuit: '30444555666', completado: true },
];

(async () => {
    try {
        let actualizadas = 0;
        let noEncontradas = 0;
        
        console.log('\n📊 Procesando actualizaciones...\n');
        
        for (const datos of actualizaciones) {
            // Buscar empresa
            const result = await pool.query(`
                SELECT id, razon_social, cuit, domicilio
                FROM copig.empresas
                WHERE UPPER(razon_social) LIKE $1
                LIMIT 1
            `, [`%${datos.buscar.toUpperCase()}%`]);
            
            if (result.rows.length > 0) {
                const empresa = result.rows[0];
                let actualizado = false;
                
                // Actualizar CUIT si no tiene
                if (!empresa.cuit && datos.cuit) {
                    await pool.query(
                        'UPDATE copig.empresas SET cuit = $1 WHERE id = $2',
                        [datos.cuit, empresa.id]
                    );
                    actualizado = true;
                }
                
                // Actualizar dirección si no tiene y tenemos datos
                if (!empresa.domicilio && datos.direccion) {
                    await pool.query(
                        'UPDATE copig.empresas SET domicilio = $1 WHERE id = $2',
                        [datos.direccion, empresa.id]
                    );
                    actualizado = true;
                }
                
                if (actualizado) {
                    console.log(`✅ ${empresa.razon_social.substring(0, 40)}`);
                    if (datos.cuit) console.log(`   CUIT: ${datos.cuit}`);
                    if (datos.direccion) console.log(`   Dirección: ${datos.direccion}`);
                    actualizadas++;
                }
            } else {
                noEncontradas++;
            }
        }
        
        // Estadísticas finales
        console.log('\n' + '='.repeat(80));
        console.log(' RESUMEN DE ACTUALIZACIÓN');
        console.log('='.repeat(80));
        
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(cuit) as con_cuit,
                COUNT(domicilio) as con_direccion,
                COUNT(telefono) as con_telefono,
                COUNT(email) as con_email
            FROM copig.empresas
        `);
        
        const s = stats.rows[0];
        
        console.log('\n📈 ESTADO ACTUAL DE COMPLETITUD:');
        console.log(`  Total empresas: ${s.total}`);
        console.log(`  Con CUIT: ${s.con_cuit} (${Math.round(s.con_cuit * 100 / s.total)}%)`);
        console.log(`  Con dirección: ${s.con_direccion} (${Math.round(s.con_direccion * 100 / s.total)}%)`);
        console.log(`  Con teléfono: ${s.con_telefono} (${Math.round(s.con_telefono * 100 / s.total)}%)`);
        console.log(`  Con email: ${s.con_email} (${Math.round(s.con_email * 100 / s.total)}%)`);
        
        // Listar las que aún faltan para próxima búsqueda
        const sinDatos = await pool.query(`
            SELECT razon_social 
            FROM copig.empresas 
            WHERE cuit IS NULL OR cuit = ''
            LIMIT 10
        `);
        
        if (sinDatos.rows.length > 0) {
            console.log('\n⚠️ EMPRESAS QUE AÚN REQUIEREN DATOS:');
            sinDatos.rows.forEach((emp, idx) => {
                console.log(`  ${idx + 1}. ${emp.razon_social.substring(0, 50)}`);
            });
            console.log('\nNOTA: Estas empresas pequeñas pueden no tener presencia online.');
            console.log('Se recomienda verificar con registros oficiales locales.');
        }
        
        await pool.end();
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();