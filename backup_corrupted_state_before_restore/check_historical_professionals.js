const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function checkHistoricalProfessionals() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 VERIFICANDO PROFESIONALES HISTÓRICOS');
        console.log('=====================================');

        // Buscar profesionales históricos con matrículas bajas
        const historicalQuery = await client.query(`
            SELECT 
                p.nombre,
                p.numero_documento,
                m.numero as matricula
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.numero <= 200
            AND p.activo = true AND m.activo = true
            ORDER BY m.numero ASC
        `);
        
        console.log(`📋 Encontrados ${historicalQuery.rows.length} profesionales históricos:`);
        console.log('');
        
        historicalQuery.rows.forEach((prof, index) => {
            if (index < 20) { // Mostrar primeros 20
                console.log(`${String(prof.matricula).padStart(3, ' ')} | ${String(prof.numero_documento).padStart(8, ' ')} | ${prof.nombre}`);
            }
        });
        
        if (historicalQuery.rows.length > 20) {
            console.log(`... y ${historicalQuery.rows.length - 20} más`);
        }
        
        // Verificar específicamente la matrícula 100
        console.log('\n🔍 VERIFICANDO MATRÍCULA 100 ESPECÍFICAMENTE:');
        const mat100 = await client.query(`
            SELECT 
                p.nombre,
                p.numero_documento,
                m.numero as matricula,
                p.activo as prof_activo,
                m.activo as mat_activa
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE m.numero = 100
        `);
        
        if (mat100.rows.length > 0) {
            const prof = mat100.rows[0];
            console.log('✅ Matrícula 100 encontrada:');
            console.log(`   👤 ${prof.nombre}`);
            console.log(`   🆔 Documento: ${prof.numero_documento}`);
            console.log(`   👤 Prof Activo: ${prof.prof_activo}`);
            console.log(`   🎯 Mat Activa: ${prof.mat_activa}`);
        } else {
            console.log('❌ Matrícula 100 NO existe en la base de datos');
        }
        
        // Encontrar el rango más alto de matrículas históricas continuas
        console.log('\n📊 RANGO DE MATRÍCULAS HISTÓRICAS CONTINUAS:');
        let lastContinuous = 0;
        
        for (const prof of historicalQuery.rows) {
            if (prof.matricula === lastContinuous + 1) {
                lastContinuous = prof.matricula;
            } else {
                break;
            }
        }
        
        console.log(`✅ Matrículas continuas desde 1 hasta: ${lastContinuous}`);
        console.log(`✅ Rango seguro para pruebas: 1-${lastContinuous}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkHistoricalProfessionals();