const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' ACTUALIZACIÓN DE DATOS DESDE WEB');
console.log('='.repeat(80));

// Datos encontrados en búsquedas web
const actualizaciones = [
    {
        razon_social_buscar: 'INDUSTRIAS METALURGICAS PESCARMONA',
        cuit: '30506466464',
        direccion: 'Carril Rodríguez Peña 2451, Godoy Cruz, Mendoza'
    },
    {
        razon_social_buscar: 'TECHINT',
        cuit: '30547981029',
        direccion: 'Della Paolera Carlos 297, Buenos Aires'
    }
];

(async () => {
    try {
        console.log('\n📊 Actualizando datos de empresas con información de web...\n');
        
        for (const empresa of actualizaciones) {
            // Buscar empresa en BD
            const result = await pool.query(`
                SELECT id, razon_social, cuit, domicilio
                FROM copig.empresas
                WHERE UPPER(razon_social) LIKE $1
                LIMIT 1
            `, [`%${empresa.razon_social_buscar}%`]);
            
            if (result.rows.length > 0) {
                const empresaBD = result.rows[0];
                console.log(`\nEncontrada: ${empresaBD.razon_social.substring(0, 50)}`);
                console.log(`  ID: ${empresaBD.id}`);
                
                // Actualizar CUIT si no tiene o es diferente
                if (!empresaBD.cuit || empresaBD.cuit !== empresa.cuit) {
                    await pool.query(`
                        UPDATE copig.empresas 
                        SET cuit = $1, fecha_actualizacion = NOW()
                        WHERE id = $2
                    `, [empresa.cuit, empresaBD.id]);
                    console.log(`  ✅ CUIT actualizado: ${empresa.cuit}`);
                }
                
                // Actualizar dirección si está vacía
                if (!empresaBD.domicilio && empresa.direccion) {
                    await pool.query(`
                        UPDATE copig.empresas 
                        SET domicilio = $1, fecha_actualizacion = NOW()
                        WHERE id = $2
                    `, [empresa.direccion, empresaBD.id]);
                    console.log(`  ✅ Dirección actualizada: ${empresa.direccion}`);
                }
            } else {
                console.log(`❌ No encontrada: ${empresa.razon_social_buscar}`);
            }
        }
        
        // Buscar empresas sin CUIT para futuras búsquedas
        console.log('\n\n📋 EMPRESAS SIN CUIT (primeras 10):');
        console.log('='.repeat(50));
        
        const sinCuit = await pool.query(`
            SELECT id, razon_social 
            FROM copig.empresas 
            WHERE cuit IS NULL OR cuit = ''
            LIMIT 10
        `);
        
        sinCuit.rows.forEach((emp, idx) => {
            console.log(`${idx + 1}. ${emp.razon_social.substring(0, 60)}`);
        });
        
        console.log('\nEstas empresas podrían actualizarse buscando sus datos en internet.');
        
        await pool.end();
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();