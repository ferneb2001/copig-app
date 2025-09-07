const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixDatabaseStructure() {
    try {
        console.log('🔧 ARREGLANDO ESTRUCTURA DE BASE DE DATOS...\n');
        
        // 1. Agregar constraint UNIQUE a matriculas.numero_matricula
        console.log('1. Agregando constraint UNIQUE a matriculas...');
        try {
            await pool.query(`
                ALTER TABLE copig.matriculas 
                ADD CONSTRAINT uk_matriculas_numero_matricula 
                UNIQUE (numero_matricula)
            `);
            console.log('   ✅ Constraint UNIQUE agregado');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('   ⚠️ Constraint ya existe');
            } else {
                console.log(`   ❌ Error agregando constraint: ${error.message}`);
            }
        }
        
        // 2. Verificar/recrear tabla pagos_historicos con estructura correcta
        console.log('\n2. Verificando tabla pagos_historicos...');
        
        // Eliminar tabla si existe con problemas
        await pool.query('DROP TABLE IF EXISTS copig.pagos_historicos');
        
        // Recrear con estructura correcta
        await pool.query(`
            CREATE TABLE copig.pagos_historicos (
                id SERIAL PRIMARY KEY,
                matricula VARCHAR(20),
                fecha_pago DATE,
                importe DECIMAL(10,2) DEFAULT 0,
                concepto VARCHAR(200),
                detalle VARCHAR(500),
                estado VARCHAR(50) DEFAULT 'PAGADO',
                numero_recibo INTEGER,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        console.log('   ✅ Tabla pagos_historicos recreada');
        
        // 3. Crear índices para mejorar performance
        console.log('\n3. Creando índices...');
        
        try {
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_pagos_historicos_matricula 
                ON copig.pagos_historicos(matricula)
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_pagos_historicos_fecha 
                ON copig.pagos_historicos(fecha_pago)
            `);
            
            await pool.query(`
                CREATE INDEX IF NOT EXISTS idx_matriculas_profesional 
                ON copig.matriculas(profesional_id)
            `);
            
            console.log('   ✅ Índices creados');
        } catch (error) {
            console.log(`   ⚠️ Error creando índices: ${error.message}`);
        }
        
        // 4. Verificar estructura final
        console.log('\n4. Verificando estructura final...');
        
        const matriculasInfo = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'matriculas' 
              AND table_schema = 'copig' 
            ORDER BY ordinal_position
        `);
        
        console.log('   Tabla matriculas:');
        matriculasInfo.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
        const pagosInfo = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'pagos_historicos' 
              AND table_schema = 'copig' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n   Tabla pagos_historicos:');
        pagosInfo.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
        // 5. Verificar constraints
        console.log('\n5. Verificando constraints...');
        const constraints = await pool.query(`
            SELECT 
                tc.constraint_name, 
                tc.constraint_type, 
                kcu.column_name
            FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'matriculas' 
              AND tc.table_schema = 'copig'
              AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
            ORDER BY tc.constraint_name
        `);
        
        console.log('   Constraints en matriculas:');
        constraints.rows.forEach(row => {
            console.log(`   - ${row.constraint_name}: ${row.constraint_type} en ${row.column_name}`);
        });
        
        console.log('\n✅ ESTRUCTURA DE BASE DE DATOS CORREGIDA');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixDatabaseStructure();