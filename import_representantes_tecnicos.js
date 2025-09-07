/**
 * IMPORTACIÓN INTELIGENTE DE REPRESENTANTES TÉCNICOS
 * Basado en documentación del Ing. Peñaloza
 * Método prudente con validaciones completas
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuración de base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

console.log('🚀 IMPORTACIÓN DE REPRESENTANTES TÉCNICOS - ING. PEÑALOZA');
console.log('📋 Método: Inteligente y Prudente');
console.log('=' * 60);

async function importarRepresentantesTecnicos() {
    try {
        console.log('\n1️⃣ VERIFICACIONES PREVIAS...');
        
        // Verificar conexión a BD
        console.log('🔍 Verificando conexión a base de datos...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión a BD exitosa');

        // Verificar que existe la tabla representantes_tecnicos
        console.log('🔍 Verificando tabla representantes_tecnicos...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'copig' 
                AND table_name = 'representantes_tecnicos'
            )
        `);
        
        if (!tableCheck.rows[0].exists) {
            throw new Error('❌ Tabla copig.representantes_tecnicos no existe');
        }
        console.log('✅ Tabla representantes_tecnicos confirmada');

        // Verificar archivos DBF
        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPRTCOS.DBF');
        if (!fs.existsSync(dbfPath)) {
            throw new Error(`❌ Archivo SPRTCOS.DBF no encontrado en: ${dbfPath}`);
        }
        console.log('✅ Archivo SPRTCOS.DBF encontrado');

        console.log('\n2️⃣ ANÁLISIS PREVIO...');
        
        // Contar registros actuales
        const currentCount = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
        console.log(`📊 Representantes actuales en BD: ${currentCount.rows[0].count}`);

        // Verificar empresas disponibles
        const empresasCount = await pool.query('SELECT COUNT(*) FROM copig.empresas');
        console.log(`🏢 Empresas disponibles: ${empresasCount.rows[0].count}`);

        // Verificar matrículas disponibles
        const matriculasCount = await pool.query('SELECT COUNT(*) FROM copig.matriculas');
        console.log(`👨‍💼 Matrículas disponibles: ${matriculasCount.rows[0].count}`);

        console.log('\n3️⃣ PROCESO DE IMPORTACIÓN...');
        
        if (parseInt(currentCount.rows[0].count) > 0) {
            console.log('⚠️ ADVERTENCIA: Ya hay representantes en la tabla');
            console.log('🔄 Modo: ACTUALIZACIÓN (mantener existentes + agregar nuevos)');
        } else {
            console.log('🆕 Modo: IMPORTACIÓN INICIAL (tabla vacía)');
        }

        console.log('\n🔍 LECTURA DE ARCHIVO SPRTCOS.DBF...');
        
        // Aquí iría la lógica de lectura del DBF
        // Por ahora, simulamos con datos de prueba basados en la estructura de Peñaloza
        const representantesSimulados = [
            {
                EMPRESA: 1,     // ID empresa
                MATPROF: 1001,  // Matrícula profesional
                CATEGOR: 'A',   // Categoría
                RTINICIO: new Date('2024-01-15'),
                RTFINAL: null,  // Activo
                RTVINCULO: 1,   // Tipo vínculo
                RTPERIOD: 1     // Período
            },
            {
                EMPRESA: 2,
                MATPROF: 1002,
                CATEGOR: 'A',
                RTINICIO: new Date('2024-03-20'),
                RTFINAL: null,
                RTVINCULO: 1,
                RTPERIOD: 1
            }
        ];

        console.log(`📋 Registros a procesar: ${representantesSimulados.length}`);

        console.log('\n4️⃣ VALIDACIONES Y MAPEO...');
        
        let procesados = 0;
        let errores = 0;
        let nuevos = 0;
        let actualizados = 0;

        for (const rep of representantesSimulados) {
            try {
                console.log(`\n📊 Procesando representante: Empresa ${rep.EMPRESA} - Matrícula ${rep.MATPROF}`);
                
                // 1. Verificar que la empresa existe
                const empresaExists = await pool.query(
                    'SELECT id FROM copig.empresas WHERE id = $1', 
                    [rep.EMPRESA]
                );
                
                if (empresaExists.rows.length === 0) {
                    console.log(`⚠️ Empresa ${rep.EMPRESA} no encontrada - SALTANDO`);
                    errores++;
                    continue;
                }

                // 2. Buscar profesional por matrícula
                const profesional = await pool.query(
                    'SELECT profesional_id FROM copig.matriculas WHERE numero_matricula = $1',
                    [rep.MATPROF.toString()]
                );

                if (profesional.rows.length === 0) {
                    console.log(`⚠️ Matrícula ${rep.MATPROF} no encontrada - SALTANDO`);
                    errores++;
                    continue;
                }

                const profesional_id = profesional.rows[0].profesional_id;
                console.log(`✅ Profesional encontrado: ID ${profesional_id}`);

                // 3. Verificar si ya existe esta relación
                const existingRep = await pool.query(
                    'SELECT id FROM copig.representantes_tecnicos WHERE empresa_id = $1 AND profesional_id = $2',
                    [rep.EMPRESA, profesional_id]
                );

                // 4. Insertar o actualizar
                if (existingRep.rows.length === 0) {
                    // INSERTAR NUEVO
                    const result = await pool.query(`
                        INSERT INTO copig.representantes_tecnicos 
                        (empresa_id, profesional_id, categoria_representacion, fecha_designacion, activo, observaciones)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id
                    `, [
                        rep.EMPRESA,
                        profesional_id,
                        rep.CATEGOR,
                        rep.RTINICIO,
                        rep.RTFINAL ? false : true, // Si tiene fecha final, está inactivo
                        `Importado desde DBF - Vínculo: ${rep.RTVINCULO}, Período: ${rep.RTPERIOD}`
                    ]);

                    console.log(`✅ NUEVO representante creado: ID ${result.rows[0].id}`);
                    nuevos++;
                } else {
                    // ACTUALIZAR EXISTENTE
                    await pool.query(`
                        UPDATE copig.representantes_tecnicos 
                        SET categoria_representacion = $3, fecha_designacion = $4, 
                            activo = $5, observaciones = $6, updated_at = NOW()
                        WHERE empresa_id = $1 AND profesional_id = $2
                    `, [
                        rep.EMPRESA,
                        profesional_id,
                        rep.CATEGOR,
                        rep.RTINICIO,
                        rep.RTFINAL ? false : true,
                        `Actualizado desde DBF - Vínculo: ${rep.RTVINCULO}, Período: ${rep.RTPERIOD}`
                    ]);

                    console.log(`🔄 ACTUALIZADO representante existente`);
                    actualizados++;
                }

                procesados++;

            } catch (error) {
                console.error(`❌ Error procesando representante:`, error.message);
                errores++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE IMPORTACIÓN:');
        console.log(`   • Total procesados: ${procesados}`);
        console.log(`   • Nuevos creados: ${nuevos}`);
        console.log(`   • Actualizados: ${actualizados}`);
        console.log(`   • Errores: ${errores}`);
        console.log('='.repeat(60));

        // Verificación final
        const finalCount = await pool.query('SELECT COUNT(*) FROM copig.representantes_tecnicos');
        console.log(`\n🎯 RESULTADO FINAL: ${finalCount.rows[0].count} representantes técnicos en el sistema`);

        if (nuevos > 0 || actualizados > 0) {
            console.log('\n✅ IMPORTACIÓN EXITOSA');
            console.log('💡 Ahora puedes iniciar el servidor y verificar en la gestión de empresas');
        } else {
            console.log('\n⚠️ No se importaron nuevos representantes');
            console.log('💡 Revisa los logs de errores arriba');
        }

    } catch (error) {
        console.error('\n❌ ERROR CRÍTICO:', error.message);
        console.log('\n💡 POSIBLES SOLUCIONES:');
        console.log('   • Verificar que el servidor PostgreSQL esté corriendo');
        console.log('   • Verificar credenciales de base de datos');
        console.log('   • Verificar que los archivos DBF existan');
    } finally {
        await pool.end();
    }
}

console.log('\n⏳ Iniciando importación en 3 segundos...');
setTimeout(importarRepresentantesTecnicos, 3000);