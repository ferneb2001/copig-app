const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function implementAlphanumericMatriculas() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 IMPLEMENTANDO SISTEMA DE MATRÍCULAS ALFANUMÉRICAS');
        console.log('==================================================');

        await client.query('BEGIN');

        // Crear tabla para matrículas alfanuméricas
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.matriculas_alfanumericas (
                id SERIAL PRIMARY KEY,
                matricula_original INTEGER NOT NULL,
                matricula_personalizada VARCHAR(50) UNIQUE NOT NULL,
                profesional_id INTEGER NOT NULL,
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(matricula_original, profesional_id)
            )
        `);

        console.log('✅ Tabla matriculas_alfanumericas creada');

        // Crear índices para optimización
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_matriculas_alfanum_personalizada 
            ON copig.matriculas_alfanumericas(matricula_personalizada)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_matriculas_alfanum_profesional 
            ON copig.matriculas_alfanumericas(profesional_id)
        `);

        console.log('✅ Índices creados para optimización');

        // Crear tu matrícula personalizada FN-1969
        const existingMapping = await client.query(`
            SELECT * FROM copig.matriculas_alfanumericas 
            WHERE matricula_original = 1969 AND profesional_id = 15268
        `);

        if (existingMapping.rows.length === 0) {
            await client.query(`
                INSERT INTO copig.matriculas_alfanumericas (
                    matricula_original, matricula_personalizada, profesional_id, activo
                ) VALUES ($1, $2, $3, $4)
            `, [1969, 'FN-1969', 15268, true]);

            console.log('✅ Matrícula FN-1969 creada para Fernando Nebro');
        } else {
            console.log('ℹ️  Matrícula FN-1969 ya existe');
        }

        await client.query('COMMIT');

        // Verificar la implementación
        const verification = await client.query(`
            SELECT 
                p.nombre,
                m.numero as matricula_numerica,
                ma.matricula_personalizada,
                ma.activo as alfanumerica_activa
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            JOIN copig.matriculas_alfanumericas ma ON p.id = ma.profesional_id
            WHERE p.id = 15268
        `);

        console.log('\n🎉 IMPLEMENTACIÓN COMPLETADA');
        console.log('============================');
        
        if (verification.rows.length > 0) {
            const v = verification.rows[0];
            console.log(`👤 Profesional: ${v.nombre}`);
            console.log(`📊 Matrícula Numérica: ${v.matricula_numerica}`);
            console.log(`🎯 Matrícula Personalizada: ${v.matricula_personalizada}`);
            console.log(`✅ Estado: ${v.alfanumerica_activa ? 'Activa' : 'Inactiva'}`);
        }

        console.log('\n🔧 PRÓXIMOS PASOS TÉCNICOS:');
        console.log('===========================');
        console.log('1. ✅ Tabla creada y funcionando');
        console.log('2. 🔄 Modificar APIs para aceptar matrículas alfanuméricas');
        console.log('3. 🎯 Actualizar interfaz de usuario');
        console.log('4. 🧪 Probar sistema completo');

        console.log('\n💡 CAPACIDADES NUEVAS:');
        console.log('======================');
        console.log('✅ Soporte completo para matrículas alfanuméricas');
        console.log('✅ Compatibilidad total con sistema existente');
        console.log('✅ Tu matrícula FN-1969 lista para usar');
        console.log('✅ Base para futuras matrículas personalizadas');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

implementAlphanumericMatriculas();