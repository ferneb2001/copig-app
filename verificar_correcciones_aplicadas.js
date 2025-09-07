const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function verificarCorreccionesAplicadas() {
    try {
        console.log('🔍 VERIFICANDO CORRECCIONES APLICADAS');
        console.log('='.repeat(50));
        
        // Casos que acabamos de corregir
        const casosCorregidos = [
            {matricula: 8763, esperado: 'INGENIERO AGRONOMO'},
            {matricula: 5454, esperado: 'INGENIERO EN CONSTRUCCIONES'},
            {matricula: 9106, esperado: 'INGENIERO CIVIL'},
            {matricula: 8765, esperado: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
            {matricula: 10982, esperado: 'INGENIERO AGRONOMO'},
            {matricula: 10394, esperado: 'INGENIERO AGRONOMO'},
            {matricula: 5507, esperado: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
            {matricula: 11418, esperado: 'INGENIERO INDUSTRIAL'}
        ];
        
        console.log('📋 VERIFICANDO CASOS CORREGIDOS:');
        let correctos = 0;
        let incorrectos = 0;
        
        for (const caso of casosCorregidos) {
            const resultado = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_actual
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [caso.matricula]);
            
            if (resultado.rows.length > 0) {
                const prof = resultado.rows[0];
                const esCorrecto = prof.titulo_actual === caso.esperado;
                
                if (esCorrecto) {
                    console.log(`✅ Mat. ${caso.matricula}: "${prof.titulo_actual}" - CORRECTO`);
                    correctos++;
                } else {
                    console.log(`❌ Mat. ${caso.matricula}: "${prof.titulo_actual || 'SIN TÍTULO'}" - Esperado: "${caso.esperado}"`);
                    incorrectos++;
                }
            } else {
                console.log(`❌ Mat. ${caso.matricula}: NO ENCONTRADO`);
                incorrectos++;
            }
        }
        
        console.log('');
        console.log('📊 RESUMEN VERIFICACIÓN:');
        console.log(`✅ Correctos: ${correctos}/${casosCorregidos.length}`);
        console.log(`❌ Incorrectos: ${incorrectos}/${casosCorregidos.length}`);
        
        // Verificar que el problema masivo disminuyó
        console.log('');
        console.log('📊 VERIFICANDO IMPACTO EN PROBLEMA MASIVO:');
        
        const estadisticasActuales = await pool.query(`
            SELECT t.descripcion, COUNT(*) as cantidad
            FROM copig.matriculas m
            JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE t.id IN (2, 3, 5) -- Los títulos problemáticos
            GROUP BY t.descripcion
            ORDER BY COUNT(*) DESC
        `);
        
        console.log('Títulos problemáticos restantes:');
        estadisticasActuales.rows.forEach(titulo => {
            console.log(`   ${titulo.descripcion}: ${titulo.cantidad} profesionales`);
        });
        
        // Verificar profesionales sin título
        const sinTitulo = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM copig.matriculas m
            WHERE m.titulo_id IS NULL
        `);
        
        console.log('');
        console.log(`📊 Profesionales sin título: ${sinTitulo.rows[0].cantidad}`);
        
        if (correctos === casosCorregidos.length) {
            console.log('');
            console.log('🎉 ¡TODAS LAS CORRECCIONES SE APLICARON CORRECTAMENTE!');
            console.log('✅ El sistema está funcionando bien');
            console.log('💡 Puedes proceder con confianza');
        } else {
            console.log('');
            console.log('⚠️  Algunas correcciones no se aplicaron correctamente');
            console.log('🔧 Revisar casos marcados como incorrectos');
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

verificarCorreccionesAplicadas();