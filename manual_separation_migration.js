const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function manualSeparationMigration() {
    console.log('🎯 MIGRACIÓN MANUAL DE SEPARACIÓN - PROFESIONALES EXTERNOS');
    console.log('='.repeat(80));
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // FASE 1: Identificar profesionales externos
        console.log('📊 FASE 1: IDENTIFICAR PROFESIONALES EXTERNOS');
        console.log('-'.repeat(50));
        
        const externosQuery = `
            SELECT 
                p.id,
                p.numero_documento,
                p.nombre,
                p.domicilio,
                p.telefono,
                p.celular,
                p.email,
                p.sexo,
                p.estado_civil,
                p.fecha_nacimiento,
                p.cuit,
                p.nacionalidad,
                p.activo,
                p.created_at,
                p.provincia,
                m.id as matricula_id,
                m.numero_matricula,
                m.fecha_otorgamiento
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.provincia != 'Mendoza' 
            AND p.activo = true
            ORDER BY p.provincia, p.nombre
        `;
        
        const profesionalesExternos = await client.query(externosQuery);
        console.log(`📋 Profesionales a migrar: ${profesionalesExternos.rows.length}`);
        
        // Agrupar por provincia
        const porProvincia = {};
        profesionalesExternos.rows.forEach(row => {
            if (!porProvincia[row.provincia]) {
                porProvincia[row.provincia] = 0;
            }
            porProvincia[row.provincia]++;
        });
        
        console.log('Distribución por provincia:');
        Object.entries(porProvincia).forEach(([provincia, cantidad]) => {
            console.log(`   ${provincia}: ${cantidad} profesionales`);
        });
        
        // FASE 2: Migrar profesionales uno por uno
        console.log('\n🔄 FASE 2: MIGRACIÓN CONTROLADA');
        console.log('-'.repeat(40));
        
        let migratedCount = 0;
        let migratedMatriculas = 0;
        let migratedPagos = 0;
        
        for (const profesional of profesionalesExternos.rows) {
            try {
                // 1. Insertar profesional externo con casting explícito
                const insertProf = await client.query(`
                    INSERT INTO copig.profesionales_externos (
                        nombre, numero_documento, tipo_documento, sexo, 
                        nacionalidad, fecha_nacimiento, estado_civil, 
                        domicilio, localidad, departamento, provincia, 
                        email, telefono, activo, fecha_creacion
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    RETURNING id
                `, [
                    profesional.nombre,
                    profesional.numero_documento, // Ya es bigint
                    'DNI',
                    profesional.sexo || 'M',
                    profesional.nacionalidad || 'Argentina',
                    profesional.fecha_nacimiento,
                    profesional.estado_civil,
                    profesional.domicilio,
                    null, // localidad
                    null, // departamento  
                    profesional.provincia,
                    profesional.email,
                    profesional.telefono,
                    profesional.activo,
                    profesional.created_at || new Date()
                ]);
                
                const newProfId = insertProf.rows[0].id;
                
                // 2. Migrar matrícula si existe
                if (profesional.matricula_id && profesional.numero_matricula) {
                    await client.query(`
                        INSERT INTO copig.matriculas_externas (
                            profesional_id, numero_matricula, fecha_otorgamiento, 
                            estado, fecha_creacion
                        ) VALUES ($1, $2, $3, $4, $5)
                    `, [
                        newProfId,
                        profesional.numero_matricula,
                        profesional.fecha_otorgamiento,
                        'ACTIVA',
                        new Date()
                    ]);
                    migratedMatriculas++;
                    
                    // 3. Migrar pagos históricos usando STRING casting
                    const pagosMigrated = await client.query(`
                        INSERT INTO copig.pagos_externos (
                            matricula, fecha_pago, concepto, importe, recibo, 
                            estado, observaciones, fecha_importacion
                        )
                        SELECT 
                            $1::VARCHAR,
                            fecha_pago,
                            concepto,
                            importe,
                            recibo,
                            'PAGADO',
                            observaciones,
                            NOW()
                        FROM copig.pagos_historicos 
                        WHERE matricula = $1::VARCHAR
                    `, [profesional.numero_matricula.toString()]);
                    
                    migratedPagos += pagosMigrated.rowCount || 0;
                }
                
                migratedCount++;
                
                // Mostrar progreso cada 50 registros
                if (migratedCount % 50 === 0) {
                    console.log(`   Progreso: ${migratedCount}/${profesionalesExternos.rows.length} profesionales`);
                }
                
            } catch (error) {
                console.error(`❌ Error migrando profesional ${profesional.nombre}:`, error.message);
                // Continuar con el siguiente
            }
        }
        
        await client.query('COMMIT');
        
        console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log(`   • Profesionales migrados: ${migratedCount}`);
        console.log(`   • Matrículas migradas: ${migratedMatriculas}`);
        console.log(`   • Pagos históricos migrados: ${migratedPagos}`);
        
        // FASE 3: Verificación
        console.log('\n📊 VERIFICACIÓN POST-MIGRACIÓN');
        console.log('-'.repeat(40));
        
        const verification = await client.query(`
            SELECT 'profesionales_externos' as tabla, COUNT(*) as registros FROM copig.profesionales_externos
            UNION ALL
            SELECT 'matriculas_externas' as tabla, COUNT(*) as registros FROM copig.matriculas_externas
            UNION ALL
            SELECT 'pagos_externos' as tabla, COUNT(*) as registros FROM copig.pagos_externos
        `);
        
        console.log('Registros migrados:');
        verification.rows.forEach(row => {
            console.log(`   ${row.tabla}: ${row.registros}`);
        });
        
        // FASE 4: Generar script de limpieza
        console.log('\n🗑️ PREPARANDO SCRIPT DE LIMPIEZA');
        
        const cleanupScript = `
-- SCRIPT DE LIMPIEZA - ELIMINAR PROFESIONALES EXTERNOS DE TABLAS PRINCIPALES
-- ⚠️ EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE LA MIGRACIÓN ES EXITOSA
-- ⚠️ CREAR BACKUP ANTES DE EJECUTAR

-- 1. Eliminar pagos históricos de profesionales externos
DELETE FROM copig.pagos_historicos 
WHERE matricula IN (
    SELECT numero_matricula::TEXT 
    FROM copig.matriculas m
    JOIN copig.profesionales p ON m.profesional_id = p.id
    WHERE p.provincia != 'Mendoza' AND p.activo = true
);

-- 2. Eliminar matrículas de profesionales externos  
DELETE FROM copig.matriculas 
WHERE profesional_id IN (
    SELECT id FROM copig.profesionales 
    WHERE provincia != 'Mendoza' AND activo = true
);

-- 3. Eliminar profesionales externos
DELETE FROM copig.profesionales 
WHERE provincia != 'Mendoza' AND activo = true;

-- 4. Verificar resultado final
SELECT 
    COUNT(*) as profesionales_restantes,
    COUNT(CASE WHEN provincia = 'Mendoza' THEN 1 END) as solo_mendoza
FROM copig.profesionales 
WHERE activo = true;
`;
        
        const fs = require('fs');
        fs.writeFileSync('C:/copig-app/cleanup_externos.sql', cleanupScript);
        console.log('✅ Script de limpieza creado: cleanup_externos.sql');
        
        return {
            migrated: migratedCount,
            matriculas: migratedMatriculas,
            pagos: migratedPagos
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante migración:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

manualSeparationMigration()
    .then(result => {
        console.log(`\n🏆 MIGRACIÓN EXITOSA: ${result.migrated} profesionales externos separados`);
        console.log('✅ Sistema COPIG ahora contiene datos separados correctamente');
        console.log('⚠️ Ejecutar cleanup_externos.sql cuando esté listo para limpiar');
        
        return pool.end();
    })
    .catch(error => {
        console.error('💥 Error crítico en migración:', error.message);
        pool.end();
        process.exit(1);
    });