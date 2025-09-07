const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkEmpresasConRepresentantes() {
    try {
        console.log('🎯 EMPRESAS CON REPRESENTANTES TÉCNICOS IMPORTADOS:');
        console.log('='.repeat(80));
        
        const result = await pool.query(`
            SELECT 
                e.id as empresa_id,
                e.razon_social,
                e.cuit,
                COUNT(rt.id) as cantidad_representantes,
                STRING_AGG(
                    p.nombre || ' (' || rt.categoria_representacion || ')', 
                    ', ' ORDER BY p.nombre
                ) as representantes
            FROM copig.empresas e
            INNER JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            INNER JOIN copig.profesionales p ON rt.profesional_id = p.id
            WHERE rt.activo = true
            GROUP BY e.id, e.razon_social, e.cuit
            ORDER BY cantidad_representantes DESC, e.razon_social
        `);
        
        result.rows.forEach((empresa, i) => {
            console.log(`${i+1}. ID: ${empresa.empresa_id} - ${empresa.razon_social}`);
            console.log(`   CUIT: ${empresa.cuit}`);
            console.log(`   👥 ${empresa.cantidad_representantes} representante(s): ${empresa.representantes}`);
            console.log('');
        });
        
        console.log(`📊 TOTAL: ${result.rows.length} empresas tienen representantes técnicos`);
        
        // También mostrar las primeras 10 empresas por ID para que Fernando pueda buscarlas fácilmente
        console.log('\n🔍 PRIMERAS 10 EMPRESAS POR ID PARA BUSCAR FÁCILMENTE:');
        console.log('-'.repeat(80));
        
        const primeras = await pool.query(`
            SELECT 
                e.id as empresa_id,
                e.razon_social,
                p.nombre as representante
            FROM copig.empresas e
            INNER JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
            INNER JOIN copig.profesionales p ON rt.profesional_id = p.id
            WHERE rt.activo = true
            ORDER BY e.id
            LIMIT 10
        `);
        
        primeras.rows.forEach((emp, i) => {
            console.log(`${i+1}. Buscar empresa ID ${emp.empresa_id}: "${emp.razon_social}" → Rep: ${emp.representante}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkEmpresasConRepresentantes();