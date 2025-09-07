/**
 * CREAR PROFESIONAL FICTICIO PARA PRUEBAS
 * Este profesional se puede usar para probar el sistema de certificados
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function crearProfesionalPrueba() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🧪 CREANDO PROFESIONAL FICTICIO PARA PRUEBAS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    try {
        // Datos del profesional de prueba
        const profesionalDatos = {
            nombre: 'PRUEBA TEST, JUAN CARLOS',
            numero_documento: '99999999',
            fecha_nacimiento: '1980-01-15',
            sexo: 'M',
            estado_civil: 'S',
            nacionalidad: 'Argentina',
            domicilio: 'Calle Ficticia 123',
            telefono: '261-9999999',
            celular: '261-155999999',
            email: 'prueba@test.com',
            cuit: '20999999999',
            activo: true
        };
        
        // Verificar si ya existe
        const existe = await pool.query(
            'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
            [profesionalDatos.numero_documento]
        );
        
        if (existe.rows.length > 0) {
            console.log('⚠️  El profesional de prueba ya existe con ID:', existe.rows[0].id);
            console.log('   Actualizando datos...');
            
            // Actualizar profesional existente
            await pool.query(`
                UPDATE copig.profesionales 
                SET nombre = $1, email = $2, telefono = $3, domicilio = $4, activo = true
                WHERE numero_documento = $5
            `, [
                profesionalDatos.nombre,
                profesionalDatos.email,
                profesionalDatos.telefono,
                profesionalDatos.domicilio,
                profesionalDatos.numero_documento
            ]);
            
            var profesionalId = existe.rows[0].id;
        } else {
            // Insertar nuevo profesional
            const result = await pool.query(`
                INSERT INTO copig.profesionales (
                    nombre, numero_documento, fecha_nacimiento,
                    sexo, estado_civil, nacionalidad, domicilio,
                    telefono, celular, email, cuit, activo
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id
            `, [
                profesionalDatos.nombre,
                profesionalDatos.numero_documento,
                profesionalDatos.fecha_nacimiento,
                profesionalDatos.sexo,
                profesionalDatos.estado_civil,
                profesionalDatos.nacionalidad,
                profesionalDatos.domicilio,
                profesionalDatos.telefono,
                profesionalDatos.celular,
                profesionalDatos.email,
                profesionalDatos.cuit,
                profesionalDatos.activo
            ]);
            
            var profesionalId = result.rows[0].id;
            console.log('✅ Profesional creado con ID:', profesionalId);
        }
        
        // Crear o actualizar matrícula
        const matriculaDatos = {
            numero_matricula: 99999,  // Integer, no string
            categoria: 'A',  // varchar(5) - valores típicos: 'A', 'CR'
            fecha_inscripcion: '2020-01-01',
            vencimiento_habilitacion: '2025-12-31',
            activo: true,
            estado: null  // varchar(2) - típicamente null
        };
        
        // Verificar si ya tiene matrícula
        const matriculaExiste = await pool.query(
            'SELECT id FROM copig.matriculas WHERE profesional_id = $1',
            [profesionalId]
        );
        
        if (matriculaExiste.rows.length > 0) {
            console.log('⚠️  Matrícula ya existe, actualizando...');
            await pool.query(`
                UPDATE copig.matriculas 
                SET numero_matricula = $1, activo = true, vencimiento_habilitacion = $2
                WHERE profesional_id = $3
            `, [
                matriculaDatos.numero_matricula,
                matriculaDatos.vencimiento_habilitacion,
                profesionalId
            ]);
        } else {
            await pool.query(`
                INSERT INTO copig.matriculas (
                    profesional_id, numero_matricula, categoria,
                    fecha_inscripcion, vencimiento_habilitacion, activo
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                profesionalId,
                matriculaDatos.numero_matricula,
                matriculaDatos.categoria,
                matriculaDatos.fecha_inscripcion,
                matriculaDatos.vencimiento_habilitacion,
                matriculaDatos.activo
            ]);
            console.log('✅ Matrícula creada:', matriculaDatos.numero_matricula);
        }
        
        // Crear credenciales de acceso
        const password = 'prueba123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Verificar si ya tiene credenciales
        const authExiste = await pool.query(
            'SELECT id FROM copig.profesionales_auth WHERE profesional_id = $1',
            [profesionalId]
        );
        
        if (authExiste.rows.length > 0) {
            console.log('⚠️  Credenciales ya existen, actualizando contraseña...');
            await pool.query(`
                UPDATE copig.profesionales_auth 
                SET password_hash = $1
                WHERE profesional_id = $2
            `, [hashedPassword, profesionalId]);
        } else {
            await pool.query(`
                INSERT INTO copig.profesionales_auth (profesional_id, password_hash)
                VALUES ($1, $2)
            `, [profesionalId, hashedPassword]);
            console.log('✅ Credenciales creadas');
        }
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📋 DATOS DE ACCESO PARA PRUEBAS:');
        console.log('─────────────────────────────────────────');
        console.log('Portal: http://localhost:3030/');
        console.log('Usuario (DNI): 99999999');
        console.log('Contraseña: prueba123');
        console.log('─────────────────────────────────────────');
        console.log('Nombre: PRUEBA TEST, JUAN CARLOS');
        console.log('Matrícula: 99999');
        console.log('Email: prueba@test.com');
        console.log('ID Profesional:', profesionalId);
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        console.log('✅ Profesional de prueba listo para usar');
        console.log('📝 Puedes ingresar al portal y crear solicitudes de certificado');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await pool.end();
    }
}

crearProfesionalPrueba();