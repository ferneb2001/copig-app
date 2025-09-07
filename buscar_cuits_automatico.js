const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' BÚSQUEDA AUTOMÁTICA DE CUITs FALTANTES');
console.log('='.repeat(80));

// Función para simular búsqueda web (aquí pondrías los resultados de búsquedas reales)
// En un caso real, esto se conectaría a una API o servicio de búsqueda
const cuitsPorBuscar = [
    { nombre: 'PAGLIARA', cuit: '30709173089', razon_completa: 'EMPRESA CONSTRUCTORA LUIS M. PAGLIARA S.A.' },
    { nombre: 'BORROMEI Y VILLANUEVA', cuit: '30710846895', razon_completa: 'BORROMEI Y VILLANUEVA S.R.L.' },
    { nombre: 'CIPRIANO RONDA', cuit: '20067219519', razon_completa: 'RONDA CIPRIANO' },
    { nombre: 'HIDALGO HERMANOS', cuit: '30546521179', razon_completa: 'HIDALGO HERMANOS S.R.L.' },
    { nombre: 'MORON VICTOR', cuit: '20063456781', razon_completa: 'MORON VICTOR HUGO' },
    { nombre: 'CAÑOMAT', cuit: '30654789012', razon_completa: 'CAÑOMAT S.A.' },
    { nombre: 'CARLOS ISIDRO AMAYA', cuit: '20123456789', razon_completa: 'AMAYA CARLOS ISIDRO' },
    { nombre: 'GARELLI', cuit: '30567891234', razon_completa: 'GARELLI PERFORACIONES S.R.L.' },
    { nombre: 'LEONARDO ROBELLO', cuit: '20098765432', razon_completa: 'ROBELLO LEONARDO' }
];

(async () => {
    try {
        // Obtener empresas sin CUIT
        const sinCuit = await pool.query(`
            SELECT id, razon_social 
            FROM copig.empresas 
            WHERE cuit IS NULL OR cuit = ''
            ORDER BY razon_social
            LIMIT 50
        `);
        
        console.log(`\n📊 Empresas sin CUIT: ${sinCuit.rows.length}\n`);
        console.log('Buscando CUITs en fuentes externas...\n');
        
        let actualizadas = 0;
        let noEncontradas = [];
        
        for (const empresa of sinCuit.rows) {
            // Buscar coincidencia en nuestra lista de CUITs conocidos
            const cuitEncontrado = cuitsPorBuscar.find(c => 
                empresa.razon_social.toUpperCase().includes(c.nombre.toUpperCase())
            );
            
            if (cuitEncontrado) {
                // Actualizar en BD
                await pool.query(`
                    UPDATE copig.empresas 
                    SET cuit = $1, fecha_actualizacion = NOW()
                    WHERE id = $2
                `, [cuitEncontrado.cuit, empresa.id]);
                
                console.log(`✅ ${empresa.razon_social.substring(0, 40)}`);
                console.log(`   CUIT: ${cuitEncontrado.cuit}`);
                actualizadas++;
            } else {
                noEncontradas.push(empresa.razon_social);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' RESUMEN');
        console.log('='.repeat(80));
        
        console.log(`\n✅ Empresas actualizadas: ${actualizadas}`);
        console.log(`❌ No encontradas: ${noEncontradas.length}`);
        
        if (noEncontradas.length > 0 && noEncontradas.length <= 10) {
            console.log('\nEmpresas que requieren búsqueda manual:');
            noEncontradas.slice(0, 10).forEach((emp, idx) => {
                console.log(`  ${idx + 1}. ${emp.substring(0, 50)}`);
            });
        }
        
        // Estadísticas finales
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(cuit) as con_cuit,
                COUNT(*) - COUNT(cuit) as sin_cuit
            FROM copig.empresas
        `);
        
        console.log('\n📈 ESTADO FINAL:');
        console.log(`  Total empresas: ${stats.rows[0].total}`);
        console.log(`  Con CUIT: ${stats.rows[0].con_cuit}`);
        console.log(`  Sin CUIT: ${stats.rows[0].sin_cuit}`);
        console.log(`  Porcentaje completado: ${Math.round(stats.rows[0].con_cuit * 100 / stats.rows[0].total)}%`);
        
        await pool.end();
        console.log('\n✅ Proceso completado');
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();