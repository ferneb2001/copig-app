const { Pool } = require('pg');
const config = require('./config.json');
const crypto = require('crypto');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function fixAuthTableComplete() {
    console.log('🔧 Configuración completa de profesionales_auth...\n');
    
    try {
        // 1. Agregar columna username si no existe
        console.log('📋 Verificando columna username...');
        
        const hasUsername = await pool.query(`
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales_auth'
            AND column_name = 'username'
        `);
        
        if (hasUsername.rows.length === 0) {
            console.log('⚠️  Agregando columna username...');
            await pool.query(`
                ALTER TABLE copig.profesionales_auth 
                ADD COLUMN username VARCHAR(50)
            `);
            
            // Llenar username con los DNI de los profesionales
            await pool.query(`
                UPDATE copig.profesionales_auth pa
                SET username = p.numero_documento::TEXT
                FROM copig.profesionales p
                WHERE pa.profesional_id = p.id
                  AND pa.username IS NULL
            `);
            
            console.log('✅ Columna username agregada y poblada');
        }
        
        // 2. Actualizar registro del usuario de prueba
        console.log('\n🔍 Actualizando usuario de prueba...');
        
        const profesionalQuery = `
            SELECT p.id, p.numero_documento
            FROM copig.profesionales p
            WHERE p.numero_documento = '99999999'
        `;
        
        const profesionalResult = await pool.query(profesionalQuery);
        
        if (profesionalResult.rows.length > 0) {
            const profesional = profesionalResult.rows[0];
            
            // Verificar si existe el registro
            const authCheck = await pool.query(
                'SELECT * FROM copig.profesionales_auth WHERE profesional_id = $1',
                [profesional.id]
            );
            
            if (authCheck.rows.length > 0) {
                // Actualizar registro existente
                const passwordHash = hashPassword('prueba123');
                
                await pool.query(`
                    UPDATE copig.profesionales_auth 
                    SET password_hash = $1,
                        username = $2,
                        first_login = true,
                        updated_at = NOW()
                    WHERE profesional_id = $3
                `, [passwordHash, '99999999', profesional.id]);
                
                console.log('✅ Usuario de prueba actualizado');
            } else {
                // Crear nuevo registro
                const passwordHash = hashPassword('prueba123');
                
                await pool.query(`
                    INSERT INTO copig.profesionales_auth 
                    (profesional_id, username, password_hash, first_login, created_at, updated_at)
                    VALUES ($1, $2, $3, true, NOW(), NOW())
                `, [profesional.id, '99999999', passwordHash]);
                
                console.log('✅ Usuario de prueba creado');
            }
        }
        
        // 3. Verificar estructura final
        console.log('\n📋 Estructura final de la tabla:');
        const columnsQuery = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales_auth'
            ORDER BY ordinal_position
        `;
        
        const columnsResult = await pool.query(columnsQuery);
        columnsResult.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        
        console.log('\n✅ CONFIGURACIÓN COMPLETADA');
        console.log('================================');
        console.log('Usuario de prueba:');
        console.log('   URL: http://localhost:3030/');
        console.log('   DNI: 99999999');
        console.log('   Contraseña: prueba123');
        console.log('\n⚠️  IMPORTANTE: Reinicia el servidor para aplicar los cambios');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixAuthTableComplete();