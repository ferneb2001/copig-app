/**
 * Investigar empresas duplicadas y representantes técnicos perdidos
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarProblemas() {
    try {
        console.log('🔍 INVESTIGANDO EMPRESAS DUPLICADAS:');
        
        // Buscar empresas duplicadas por nombre
        const duplicados = await pool.query(`
            SELECT razon_social, COUNT(*) as cantidad, array_agg(id ORDER BY id) as ids
            FROM copig.empresas 
            GROUP BY razon_social 
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC
            LIMIT 15
        `);
        
        duplicados.rows.forEach(dup => {
            console.log(`   • ${dup.razon_social}: ${dup.cantidad} veces (IDs: ${dup.ids.join(', ')})`);
        });
        
        console.log('\n🔍 VERIFICANDO PESCARMONA/IMPSA:');
        const pescarmona = await pool.query(`
            SELECT id, razon_social, observaciones, fecha_creacion
            FROM copig.empresas 
            WHERE razon_social ILIKE '%IMPSA%' OR razon_social ILIKE '%PESCARMONA%'
            ORDER BY id
        `);
        
        pescarmona.rows.forEach(emp => {
            console.log(`   • ID: ${emp.id} - ${emp.razon_social}`);
            console.log(`     Observaciones: ${emp.observaciones || 'Sin observaciones'}`);
            console.log(`     Creación: ${emp.fecha_creacion}`);
        });
        
        console.log('\n🔍 ESTADO ACTUAL DE REPRESENTANTES TÉCNICOS:');
        const totalRep = await pool.query('SELECT COUNT(*) as total FROM copig.representantes_tecnicos');
        console.log(`   Total representantes técnicos: ${totalRep.rows[0].total}`);
        
        // Verificar representantes de IMPSA
        const repIMPSA = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.representantes_tecnicos rt
            INNER JOIN copig.empresas e ON rt.empresa_id = e.id
            WHERE e.razon_social ILIKE '%IMPSA%'
        `);
        console.log(`   Representantes de IMPSA: ${repIMPSA.rows[0].total}`);
        
        // Verificar si hay representantes huérfanos (empresa_id que no existe)
        const huerfanos = await pool.query(`
            SELECT COUNT(*) as total
            FROM copig.representantes_tecnicos rt
            LEFT JOIN copig.empresas e ON rt.empresa_id = e.id
            WHERE e.id IS NULL
        `);
        console.log(`   Representantes huérfanos: ${huerfanos.rows[0].total}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

investigarProblemas();