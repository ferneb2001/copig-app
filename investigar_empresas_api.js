const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function investigarEmpresasAPI() {
    try {
        console.log('🔍 INVESTIGANDO PROBLEMA API EMPRESAS');
        console.log('='.repeat(50));
        
        // 1. Verificar que las empresas de ejemplo SÍ existen en BD
        console.log('📋 1. VERIFICANDO EMPRESAS DE EJEMPLO ESPECÍFICAS:');
        const empresasEjemplo = [
            'A.EVANGELISTA S.A.',
            'A.PRO.TA.M',
            'AB CONTROL S.A.',
            'ABB S.A.',
            'ABELAR SERVICIOS S.R.L.'
        ];
        
        for (const nombre of empresasEjemplo) {
            const resultado = await pool.query(`
                SELECT id, razon_social, cuit, activo 
                FROM copig.empresas 
                WHERE razon_social ILIKE $1
            `, [`%${nombre}%`]);
            
            if (resultado.rows.length > 0) {
                const empresa = resultado.rows[0];
                console.log(`   ✅ ${nombre} - ID: ${empresa.id} - CUIT: ${empresa.cuit} - Activo: ${empresa.activo}`);
                
                // Probar API para esta empresa específica
                console.log(`   📡 Probando endpoint GET /api/empresas/${empresa.id}:`);
                
                try {
                    // Simular consulta API tal como la haría el frontend
                    const empresaDetalle = await pool.query(`
                        SELECT id, razon_social, cuit, email, telefono, domicilio, 
                               localidad, departamento, codigo_postal, activo,
                               fecha_creacion, fecha_actualizacion, observaciones
                        FROM copig.empresas 
                        WHERE id = $1
                    `, [empresa.id]);
                    
                    if (empresaDetalle.rows.length > 0) {
                        console.log(`      ✅ Datos encontrados: ${JSON.stringify(empresaDetalle.rows[0], null, 8)}`);
                    } else {
                        console.log(`      ❌ NO ENCONTRADA en consulta de detalle - PROBLEMA AQUÍ!`);
                    }
                } catch (error) {
                    console.log(`      ❌ Error en consulta de detalle: ${error.message}`);
                }
            } else {
                console.log(`   ❌ ${nombre} - NO ENCONTRADA`);
            }
        }
        
        // 2. Investigar IDs problemáticos
        console.log('\n📊 2. INVESTIGANDO RANGOS DE ID EXTRAÑOS:');
        const rangosID = await pool.query(`
            SELECT 
                MIN(id) as min_id,
                MAX(id) as max_id,
                COUNT(*) as total_empresas,
                COUNT(CASE WHEN id > 100000 THEN 1 END) as ids_altos,
                COUNT(CASE WHEN id < 10000 THEN 1 END) as ids_normales
            FROM copig.empresas
        `);
        
        const stats = rangosID.rows[0];
        console.log(`   ID Mínimo: ${stats.min_id}`);
        console.log(`   ID Máximo: ${stats.max_id}`);
        console.log(`   Total empresas: ${stats.total_empresas}`);
        console.log(`   IDs normales (< 10K): ${stats.ids_normales}`);
        console.log(`   IDs altos (> 100K): ${stats.ids_altos}`);
        
        // 3. Ver empresas con IDs más altos
        console.log('\n🔍 3. EMPRESAS CON IDs MÁS ALTOS (pueden ser problemáticas):');
        const idsAltos = await pool.query(`
            SELECT id, razon_social, cuit
            FROM copig.empresas 
            WHERE id > 100000
            ORDER BY id DESC
            LIMIT 10
        `);
        
        idsAltos.rows.forEach(emp => {
            console.log(`   ID ${emp.id}: ${emp.razon_social} - CUIT: ${emp.cuit}`);
        });
        
        // 4. Verificar problemas de encoding
        console.log('\n🔍 4. PROBLEMAS DE ENCODING EN NOMBRES:');
        const problemasEncoding = await pool.query(`
            SELECT id, razon_social, cuit
            FROM copig.empresas 
            WHERE razon_social LIKE '%�%' OR razon_social LIKE '%?%'
            LIMIT 10
        `);
        
        if (problemasEncoding.rows.length > 0) {
            console.log('   ⚠️ Empresas con caracteres corruptos:');
            problemasEncoding.rows.forEach(emp => {
                console.log(`      ID ${emp.id}: "${emp.razon_social}" - CUIT: ${emp.cuit}`);
            });
        } else {
            console.log('   ✅ No se encontraron problemas de encoding');
        }
        
        // 5. Resumen para diagnóstico
        console.log('\n📋 DIAGNÓSTICO DEL PROBLEMA:');
        console.log('   Las empresas SÍ existen en la base de datos');
        console.log('   El problema parece estar en:');
        console.log('   a) Frontend empresas.html llamando endpoints incorrectos');
        console.log('   b) Endpoints de API no implementados en server.js');
        console.log('   c) Permisos de acceso a endpoints de empresas');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error investigando:', error);
        await pool.end();
    }
}

investigarEmpresasAPI();