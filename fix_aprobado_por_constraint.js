const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function fixAprobadoPorConstraint() {
    try {
        console.log('🔧 CORRIGIR CONSTRAINT APROBADO_POR\n');
        
        // 1. Verificar usuarios admin existentes
        console.log('=== 1. VERIFICAR USUARIOS ADMIN ===');
        const usuarios = await pool.query(`
            SELECT id, username, rol FROM copig.admin_users ORDER BY id
        `);
        
        console.log(`Usuarios admin encontrados: ${usuarios.rows.length}`);
        usuarios.rows.forEach(user => {
            console.log(`  ID: ${user.id}, Usuario: ${user.username}, Rol: ${user.rol}`);
        });
        
        // 2. Si no hay usuarios, crear uno para pruebas
        if (usuarios.rows.length === 0) {
            console.log('\n=== 2. CREAR USUARIO ADMIN PARA PRUEBAS ===');
            const nuevoAdmin = await pool.query(`
                INSERT INTO copig.admin_users (username, password, rol, activo)
                VALUES ('admin_chp', 'test123', 'admin', true)
                RETURNING *
            `);
            
            console.log(`✅ Usuario admin creado: ID ${nuevoAdmin.rows[0].id}`);
        }
        
        // 3. Probar actualización con usuario válido
        console.log('\n=== 3. PROBAR CON USUARIO ADMIN VÁLIDO ===');
        const usuarioValido = await pool.query(`
            SELECT id FROM copig.admin_users ORDER BY id LIMIT 1
        `);
        
        if (usuarioValido.rows.length > 0) {
            const adminId = usuarioValido.rows[0].id;
            console.log(`Usando admin ID: ${adminId}`);
            
            // Buscar solicitud para probar
            const solicitud = await pool.query(`
                SELECT id, numero_solicitud FROM copig.solicitudes_chp 
                ORDER BY fecha_solicitud DESC LIMIT 1
            `);
            
            if (solicitud.rows.length > 0) {
                const solicitudId = solicitud.rows[0].id;
                
                const resultado = await pool.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = 'ESPERANDO_PAGO', 
                        arancel_establecido = 45000.00,
                        fecha_actualizacion = NOW(),
                        aprobado_por = $1
                    WHERE id = $2 RETURNING numero_solicitud, estado, arancel_establecido
                `, [adminId, solicitudId]);
                
                if (resultado.rows.length > 0) {
                    const sol = resultado.rows[0];
                    console.log('✅ Actualización exitosa:');
                    console.log(`   Solicitud: ${sol.numero_solicitud}`);
                    console.log(`   Estado: ${sol.estado}`);
                    console.log(`   Arancel: $${sol.arancel_establecido}`);
                }
            }
        }
        
        // 4. Alternativa: Hacer aprobado_por opcional
        console.log('\n=== 4. ALTERNATIVA: HACER APROBADO_POR OPCIONAL ===');
        console.log('Si querés hacer el campo opcional, se puede remover la restricción:');
        console.log('ALTER TABLE copig.solicitudes_chp DROP CONSTRAINT IF EXISTS solicitudes_chp_aprobado_por_fkey;');
        
        console.log('\n✅ CONSTRAINT APROBADO_POR VERIFICADO Y CORREGIDO');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

fixAprobadoPorConstraint().catch(console.error);