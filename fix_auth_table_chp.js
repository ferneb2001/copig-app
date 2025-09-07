const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixAuthTable() {
    try {
        console.log('🔧 CORRIGIENDO TABLA DE AUTENTICACIÓN\n');
        
        // 1. Verificar estructura actual
        console.log('=== VERIFICAR ESTRUCTURA ACTUAL ===');
        const estructura = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales_auth'
            ORDER BY ordinal_position
        `);
        
        if (estructura.rows.length > 0) {
            console.log('Estructura actual profesionales_auth:');
            estructura.rows.forEach(col => {
                console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
            });
        } else {
            console.log('❌ Tabla profesionales_auth no existe');
        }
        
        // 2. Verificar si falta columna password
        const hasPassword = estructura.rows.some(col => col.column_name === 'password');
        if (!hasPassword) {
            console.log('\n=== AGREGAR COLUMNA PASSWORD ===');
            await pool.query(`
                ALTER TABLE copig.profesionales_auth 
                ADD COLUMN IF NOT EXISTS password VARCHAR(255)
            `);
            console.log('✅ Columna password agregada');
        }
        
        // 3. Verificar profesional de prueba
        console.log('\n=== VERIFICAR PROFESIONAL DE PRUEBA ===');
        const profesional = await pool.query(`
            SELECT id FROM copig.profesionales WHERE numero_documento = 99999999
        `);
        
        if (profesional.rows.length === 0) {
            console.log('❌ Profesional de prueba no existe');
            return;
        }
        
        const profesionalId = profesional.rows[0].id;
        console.log(`✅ Profesional ID: ${profesionalId}`);
        
        // 4. Verificar si existe auth para profesional
        const existeAuth = await pool.query(`
            SELECT * FROM copig.profesionales_auth WHERE profesional_id = $1
        `, [profesionalId]);
        
        if (existeAuth.rows.length === 0) {
            console.log('\n=== CREAR AUTH PARA PROFESIONAL DE PRUEBA ===');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('prueba123', 10);
            
            await pool.query(`
                INSERT INTO copig.profesionales_auth (
                    profesional_id, username, password, activo, first_login
                ) VALUES ($1, $2, $3, true, false)
            `, [profesionalId, '99999999', hashedPassword]);
            
            console.log('✅ Auth creada para profesional de prueba');
        } else {
            console.log('\n=== ACTUALIZAR AUTH EXISTENTE ===');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('prueba123', 10);
            
            await pool.query(`
                UPDATE copig.profesionales_auth 
                SET password = $1, username = $2, activo = true
                WHERE profesional_id = $3
            `, [hashedPassword, '99999999', profesionalId]);
            
            console.log('✅ Auth actualizada para profesional de prueba');
        }
        
        // 5. Verificar resultado final
        console.log('\n=== VERIFICAR RESULTADO FINAL ===');
        const verificacion = await pool.query(`
            SELECT pa.*, p.nombre, p.numero_documento
            FROM copig.profesionales_auth pa
            JOIN copig.profesionales p ON pa.profesional_id = p.id
            WHERE p.numero_documento = 99999999
        `);
        
        if (verificacion.rows.length > 0) {
            const auth = verificacion.rows[0];
            console.log('✅ Auth configurada correctamente:');
            console.log(`   Nombre: ${auth.nombre}`);
            console.log(`   DNI: ${auth.numero_documento}`);
            console.log(`   Username: ${auth.username}`);
            console.log(`   Activo: ${auth.activo}`);
            console.log(`   First login: ${auth.first_login}`);
            console.log(`   Password hash: ${auth.password.substring(0, 20)}...`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

fixAuthTable().catch(console.error);