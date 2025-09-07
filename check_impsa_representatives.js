/**
 * Verificar a cuál IMPSA están vinculados los representantes técnicos
 */

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkIMPSARepresentatives() {
    try {
        console.log('🔍 VERIFICANDO REPRESENTANTES DE AMBAS IMPSA:');
        
        const result = await pool.query(`
            SELECT 
                e.id as empresa_id,
                e.razon_social,
                e.fecha_creacion,
                COUNT(rt.id) as total_representantes,
                array_agg(p.nombre ORDER BY p.nombre) as representantes
            FROM copig.empresas e
            LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
            WHERE e.razon_social ILIKE '%IMPSA%'
            GROUP BY e.id, e.razon_social, e.fecha_creacion
            ORDER BY e.id
        `);
        
        result.rows.forEach(emp => {
            console.log(`\n📊 EMPRESA ID: ${emp.empresa_id}`);
            console.log(`   Nombre: ${emp.razon_social}`);
            console.log(`   Creada: ${emp.fecha_creacion}`);
            console.log(`   Representantes: ${emp.total_representantes}`);
            if (emp.total_representantes > 0) {
                console.log(`   Profesionales: ${emp.representantes.join(', ')}`);
            }
        });
        
        // Verificar también qué empresa usa la interfaz web
        console.log('\n🔍 VERIFICANDO ÚLTIMA EMPRESA VISTA EN INTERFAZ:');
        const ultimaEmpresa = await pool.query(`
            SELECT id, razon_social
            FROM copig.empresas 
            WHERE razon_social ILIKE '%IMPSA%'
            ORDER BY fecha_actualizacion DESC NULLS LAST, id DESC
            LIMIT 1
        `);
        
        if (ultimaEmpresa.rows.length > 0) {
            console.log(`   Empresa más reciente: ID ${ultimaEmpresa.rows[0].id} - ${ultimaEmpresa.rows[0].razon_social}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkIMPSARepresentatives();