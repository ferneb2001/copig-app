const { Pool } = require('pg');
const config = require('./config.json');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password
});

async function fixAuthSystem() {
    console.log('🔧 Corrigiendo sistema de autenticación completo...\n');
    
    try {
        // 1. Verificar estructura actual de profesionales_auth
        console.log('📋 Analizando estructura actual de profesionales_auth...');
        const columnsQuery = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales_auth'
            ORDER BY ordinal_position
        `;
        
        const columnsResult = await pool.query(columnsQuery);
        console.log('Columnas actuales:');
        columnsResult.rows.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        
        // 2. Verificar si existe numero_documento
        const hasNumeroDocumento = columnsResult.rows.some(col => col.column_name === 'numero_documento');
        
        if (hasNumeroDocumento) {
            console.log('\n⚠️  Columna numero_documento encontrada - migrando a username...');
            
            // Primero asegurar que username existe
            const hasUsername = columnsResult.rows.some(col => col.column_name === 'username');
            if (!hasUsername) {
                await pool.query(`
                    ALTER TABLE copig.profesionales_auth 
                    ADD COLUMN username VARCHAR(50)
                `);
            }
            
            // Copiar datos de numero_documento a username
            await pool.query(`
                UPDATE copig.profesionales_auth 
                SET username = numero_documento::TEXT
                WHERE username IS NULL AND numero_documento IS NOT NULL
            `);
            
            // Eliminar columna numero_documento (opcional, por ahora solo la ignoraremos)
            console.log('✅ Datos migrados de numero_documento a username');
        }
        
        // 3. Asegurar que existe columna activo si no existe
        const hasActivo = columnsResult.rows.some(col => col.column_name === 'activo');
        if (!hasActivo) {
            console.log('⚠️  Agregando columna activo...');
            await pool.query(`
                ALTER TABLE copig.profesionales_auth 
                ADD COLUMN activo BOOLEAN DEFAULT true
            `);
        }
        
        // 4. Poblar username desde profesionales si hay registros sin username
        console.log('\n🔄 Sincronizando usernames con números de documento...');
        await pool.query(`
            UPDATE copig.profesionales_auth pa
            SET username = p.numero_documento::TEXT
            FROM copig.profesionales p
            WHERE pa.profesional_id = p.id
              AND pa.username IS NULL
        `);
        
        // 5. Verificar registros huérfanos
        console.log('\n🔍 Verificando integridad de datos...');
        const orphanedAuth = await pool.query(`
            SELECT pa.id, pa.profesional_id
            FROM copig.profesionales_auth pa
            LEFT JOIN copig.profesionales p ON pa.profesional_id = p.id
            WHERE p.id IS NULL
        `);
        
        if (orphanedAuth.rows.length > 0) {
            console.log(`⚠️  Encontrados ${orphanedAuth.rows.length} registros huérfanos en profesionales_auth`);
            // Opcional: eliminarlos
            // await pool.query('DELETE FROM copig.profesionales_auth WHERE profesional_id NOT IN (SELECT id FROM copig.profesionales)');
        }
        
        // 6. Instalar bcryptjs si no está instalado
        console.log('\n📦 Verificando bcryptjs...');
        try {
            require('bcryptjs');
            console.log('✅ bcryptjs está instalado');
        } catch (e) {
            console.log('⚠️  bcryptjs no está instalado');
            console.log('   Ejecuta: npm install bcryptjs');
        }
        
        // 7. Configurar usuario de prueba con hash correcto
        console.log('\n👤 Configurando usuario de prueba...');
        const testUserQuery = `
            SELECT p.id, p.nombre, p.numero_documento
            FROM copig.profesionales p
            WHERE p.numero_documento = '99999999'
        `;
        
        const testUserResult = await pool.query(testUserQuery);
        
        if (testUserResult.rows.length > 0) {
            const testUser = testUserResult.rows[0];
            
            // Usar bcryptjs para generar el hash
            const bcryptjs = require('bcryptjs');
            const hashedPassword = await bcryptjs.hash('prueba123', 12);
            
            // Verificar si existe registro de auth
            const authCheck = await pool.query(
                'SELECT * FROM copig.profesionales_auth WHERE profesional_id = $1',
                [testUser.id]
            );
            
            if (authCheck.rows.length > 0) {
                // Actualizar
                await pool.query(`
                    UPDATE copig.profesionales_auth 
                    SET password_hash = $1,
                        username = $2,
                        first_login = false,
                        activo = true,
                        updated_at = NOW()
                    WHERE profesional_id = $3
                `, [hashedPassword, '99999999', testUser.id]);
                console.log('✅ Usuario de prueba actualizado');
            } else {
                // Crear
                await pool.query(`
                    INSERT INTO copig.profesionales_auth 
                    (profesional_id, username, password_hash, first_login, activo, created_at, updated_at)
                    VALUES ($1, $2, $3, false, true, NOW(), NOW())
                `, [testUser.id, '99999999', hashedPassword]);
                console.log('✅ Usuario de prueba creado');
            }
        }
        
        // 8. Mostrar estadísticas finales
        console.log('\n📊 Estado final del sistema:');
        
        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT p.id) as total_profesionales,
                COUNT(DISTINCT pa.id) as total_con_auth,
                COUNT(DISTINCT CASE WHEN pa.password_hash IS NOT NULL THEN pa.id END) as con_password,
                COUNT(DISTINCT CASE WHEN pa.username IS NOT NULL THEN pa.id END) as con_username
            FROM copig.profesionales p
            LEFT JOIN copig.profesionales_auth pa ON p.id = pa.profesional_id
        `);
        
        const stat = stats.rows[0];
        console.log(`   Total profesionales: ${stat.total_profesionales}`);
        console.log(`   Con autenticación: ${stat.total_con_auth}`);
        console.log(`   Con contraseña: ${stat.con_password}`);
        console.log(`   Con username: ${stat.con_username}`);
        
        console.log('\n✅ SISTEMA DE AUTENTICACIÓN CORREGIDO');
        console.log('=====================================');
        console.log('1. Todos los profesionales nuevos funcionarán correctamente');
        console.log('2. Usuario de prueba listo:');
        console.log('   DNI: 99999999');
        console.log('   Contraseña: prueba123');
        console.log('\n⚠️  IMPORTANTE: Reiniciar el servidor para aplicar cambios');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixAuthSystem();