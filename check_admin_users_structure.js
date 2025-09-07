const { Pool } = require('pg');
const config = require('./config.json');

console.log('🔍 VERIFICANDO ESTRUCTURA DE TABLA admin_users...');
console.log('═════════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function checkTableStructure() {
    try {
        console.log('\n📊 ESTRUCTURA DE TABLA admin_users:');
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_schema='copig' AND table_name='admin_users' 
            ORDER BY ordinal_position
        `);
        
        if (structure.rows.length > 0) {
            console.log('✅ COLUMNAS ENCONTRADAS:');
            structure.rows.forEach(col => {
                console.log(`   • ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
            });
        } else {
            console.log('❌ NO SE PUDO OBTENER ESTRUCTURA');
        }
        
    } catch (error) {
        console.error('❌ Error obteniendo estructura:', error.message);
    }
}

async function searchUser40101718() {
    try {
        console.log('\n🔍 BUSCANDO USUARIO 40101718:');
        
        // Listar todos los usuarios para ver qué hay
        const allUsers = await pool.query(`
            SELECT * FROM copig.admin_users 
            ORDER BY id DESC 
            LIMIT 20
        `);
        
        if (allUsers.rows.length > 0) {
            console.log(`📋 ÚLTIMOS ${allUsers.rows.length} USUARIOS EN admin_users:`);
            allUsers.rows.forEach((user, index) => {
                console.log(`\n   ${index + 1}. ID: ${user.id}`);
                Object.keys(user).forEach(key => {
                    if (key !== 'id') {
                        console.log(`      ${key}: ${user[key]}`);
                    }
                });
            });
            
            // Buscar específicamente el 40101718 en cualquier campo
            const searchFields = Object.keys(allUsers.rows[0]);
            console.log('\n🔍 BUSCANDO "40101718" EN TODOS LOS CAMPOS:');
            
            for (const field of searchFields) {
                try {
                    const searchResult = await pool.query(`
                        SELECT * FROM copig.admin_users 
                        WHERE ${field}::text ILIKE '%40101718%'
                    `);
                    
                    if (searchResult.rows.length > 0) {
                        console.log(`   ✅ ENCONTRADO EN CAMPO ${field}:`);
                        searchResult.rows.forEach(user => {
                            console.log(`      ID ${user.id}: ${user[field]}`);
                        });
                    } else {
                        console.log(`   ❌ NO encontrado en campo ${field}`);
                    }
                } catch (searchError) {
                    console.log(`   ⚠️  Error buscando en campo ${field}: ${searchError.message}`);
                }
            }
            
        } else {
            console.log('❌ NO HAY USUARIOS EN admin_users');
        }
        
    } catch (error) {
        console.error('❌ Error buscando usuario:', error.message);
    }
}

async function checkProfesionales() {
    try {
        console.log('\n📊 VERIFICANDO EN TABLA profesionales:');
        
        const profResult = await pool.query(`
            SELECT id, nombre, apellido, numero_documento, email, activo 
            FROM copig.profesionales 
            WHERE numero_documento = '40101718'
        `);
        
        if (profResult.rows.length > 0) {
            console.log('✅ ENCONTRADO EN profesionales:');
            profResult.rows.forEach(prof => {
                console.log(`   ID: ${prof.id}`);
                console.log(`   Nombre: ${prof.nombre} ${prof.apellido}`);
                console.log(`   DNI: ${prof.numero_documento}`);
                console.log(`   Email: ${prof.email}`);
                console.log(`   Activo: ${prof.activo}`);
            });
        } else {
            console.log('❌ NO ENCONTRADO EN profesionales');
        }
        
    } catch (error) {
        console.error('❌ Error verificando profesionales:', error.message);
    }
}

async function main() {
    await checkTableStructure();
    await searchUser40101718();
    await checkProfesionales();
    
    console.log('\n🎯 CONCLUSIONES:');
    console.log('• Verificar si el usuario existe en alguna tabla');
    console.log('• Identificar qué campo contiene el DNI en admin_users');
    console.log('• Determinar si el usuario fue eliminado o movido');
    
    await pool.end();
}

main().catch(console.error);