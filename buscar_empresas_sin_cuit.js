const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

(async () => {
    try {
        // Obtener todas las empresas sin CUIT
        const result = await pool.query(`
            SELECT id, razon_social 
            FROM copig.empresas 
            WHERE cuit IS NULL OR cuit = ''
            ORDER BY razon_social
        `);
        
        console.log('EMPRESAS SIN CUIT PARA BUSCAR:');
        console.log('='.repeat(60));
        console.log(`Total: ${result.rows.length} empresas\n`);
        
        // Agrupar por tipo para búsqueda más eficiente
        const perforaciones = [];
        const construcciones = [];
        const otras = [];
        
        result.rows.forEach(emp => {
            const razon = emp.razon_social.toUpperCase();
            if (razon.includes('PERFORAC')) {
                perforaciones.push(emp);
            } else if (razon.includes('CONSTRUC') || razon.includes('CONST.')) {
                construcciones.push(emp);
            } else {
                otras.push(emp);
            }
        });
        
        console.log('CATEGORÍAS:');
        console.log(`- Perforaciones: ${perforaciones.length}`);
        console.log(`- Construcciones: ${construcciones.length}`);
        console.log(`- Otras: ${otras.length}`);
        
        console.log('\nPRIMERAS 20 PARA BÚSQUEDA INMEDIATA:');
        console.log('-'.repeat(60));
        
        const primeras20 = result.rows.slice(0, 20);
        primeras20.forEach((emp, idx) => {
            console.log(`${idx + 1}. ${emp.razon_social}`);
        });
        
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();