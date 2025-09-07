const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function correccionMasivaConDatosOficiales() {
    try {
        console.log('🚀 CORRECCIÓN MASIVA CON DATOS OFICIALES DE LA WEB DEL COPIG');
        console.log('='.repeat(70));
        console.log('⚠️  USANDO 2,284 PROFESIONALES EXTRAÍDOS DE LA WEB OFICIAL');
        console.log('');
        
        // Leer datos oficiales extraídos
        const datosOficiales = JSON.parse(
            fs.readFileSync('C:\\copig-app\\profesionales_web_extraidos_tablas.json', 'utf8')
        );
        
        console.log(`📊 DATOS OFICIALES CARGADOS:`);
        console.log(`   Total profesionales: ${datosOficiales.total_profesionales}`);
        console.log(`   Títulos únicos oficiales: ${datosOficiales.titulos_unicos.length}`);
        console.log('');
        
        let totalProcesados = 0;
        let totalCorregidos = 0;
        let totalYaCorrectos = 0;
        let totalNoEncontrados = 0;
        let totalTitulosCreados = 0;
        let errores = 0;
        
        const correcciones = [];
        const titulosCreados = [];
        
        // Crear backup antes de empezar
        console.log('💾 CREANDO BACKUP DE SEGURIDAD...');
        const backupFileName = `backup_antes_correccion_masiva_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        const backupData = {
            fecha_backup: new Date().toISOString(),
            matriculas_backup: await pool.query('SELECT * FROM copig.matriculas'),
            titulos_backup: await pool.query('SELECT * FROM copig.titulos')
        };
        
        fs.writeFileSync(`C:\\copig-app\\${backupFileName}`, JSON.stringify(backupData, null, 2));
        console.log(`✅ Backup guardado: ${backupFileName}`);
        console.log('');
        
        console.log('🔍 PROCESANDO CORRECCIONES POR CATEGORÍA:');
        
        // Procesar por categorías
        for (const [categoria, stats] of Object.entries(datosOficiales.estadisticas_categoria)) {
            console.log(`\\n📋 CATEGORÍA: ${categoria} (${stats.total} profesionales)`);
            
            const profesionalesCategoria = datosOficiales.profesionales.filter(p => p.categoria === categoria);
            let corregidosCategoria = 0;
            let yaCorrectosCategoria = 0;
            let noEncontradosCategoria = 0;
            
            for (const profOficial of profesionalesCategoria) {
                totalProcesados++;
                
                try {
                    // Buscar profesional por matrícula
                    const profesionalBD = await pool.query(`
                        SELECT p.id, p.nombre, m.numero_matricula, t.descripcion as titulo_actual, t.id as titulo_actual_id
                        FROM copig.profesionales p
                        JOIN copig.matriculas m ON p.id = m.profesional_id
                        LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                        WHERE m.numero_matricula = $1
                    `, [profOficial.matricula]);
                    
                    if (profesionalBD.rows.length === 0) {
                        noEncontradosCategoria++;
                        totalNoEncontrados++;
                        continue;
                    }
                    
                    const prof = profesionalBD.rows[0];
                    
                    // Verificar si el título ya es correcto
                    if (prof.titulo_actual === profOficial.titulo) {
                        yaCorrectosCategoria++;
                        totalYaCorrectos++;
                        continue;
                    }
                    
                    // Buscar si el título oficial existe en BD
                    let tituloOficial = await pool.query(`
                        SELECT id FROM copig.titulos WHERE descripcion = $1
                    `, [profOficial.titulo]);
                    
                    // Si no existe, crearlo
                    if (tituloOficial.rows.length === 0) {
                        const nuevoTitulo = await pool.query(`
                            INSERT INTO copig.titulos (descripcion)
                            VALUES ($1)
                            RETURNING id, descripcion
                        `, [profOficial.titulo]);
                        
                        tituloOficial = nuevoTitulo;
                        totalTitulosCreados++;
                        titulosCreados.push(profOficial.titulo);
                        
                        console.log(`     ➕ Creado título: "${profOficial.titulo}"`);
                    }
                    
                    // Aplicar corrección
                    await pool.query(`
                        UPDATE copig.matriculas 
                        SET titulo_id = $1 
                        WHERE profesional_id = $2
                    `, [tituloOficial.rows[0].id, prof.id]);
                    
                    corregidosCategoria++;
                    totalCorregidos++;
                    
                    correcciones.push({
                        matricula: profOficial.matricula,
                        nombre: prof.nombre,
                        titulo_anterior: prof.titulo_actual || 'SIN TÍTULO',
                        titulo_nuevo: profOficial.titulo,
                        categoria: categoria
                    });
                    
                    // Mostrar progreso cada 100
                    if (totalProcesados % 100 === 0) {
                        console.log(`     📊 Progreso: ${totalProcesados}/${datosOficiales.total_profesionales} (${((totalProcesados/datosOficiales.total_profesionales)*100).toFixed(1)}%)`);
                    }
                    
                } catch (error) {
                    console.log(`     ❌ Error Mat. ${profOficial.matricula}: ${error.message}`);
                    errores++;
                }
            }
            
            console.log(`   ✅ ${corregidosCategoria} corregidos, ${yaCorrectosCategoria} ya correctos, ${noEncontradosCategoria} no encontrados`);
        }
        
        // Crear log de correcciones
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS copig.correcciones_masivas_oficiales (
                    id SERIAL PRIMARY KEY,
                    matricula INTEGER,
                    nombre VARCHAR(255),
                    titulo_anterior VARCHAR(255),
                    titulo_nuevo VARCHAR(255),
                    categoria VARCHAR(100),
                    fecha_correccion TIMESTAMP DEFAULT NOW()
                )
            `);
            
            // Insertar todas las correcciones
            for (const corr of correcciones) {
                await pool.query(`
                    INSERT INTO copig.correcciones_masivas_oficiales 
                    (matricula, nombre, titulo_anterior, titulo_nuevo, categoria)
                    VALUES ($1, $2, $3, $4, $5)
                `, [corr.matricula, corr.nombre, corr.titulo_anterior, corr.titulo_nuevo, corr.categoria]);
            }
            
        } catch (logError) {
            console.log('⚠️  Warning: No se pudo crear log de correcciones');
        }
        
        // Resumen final
        console.log('\\n' + '='.repeat(70));
        console.log('📊 RESUMEN DE CORRECCIÓN MASIVA OFICIAL:');
        console.log(`📋 Total profesionales procesados: ${totalProcesados}`);
        console.log(`✅ Corregidos: ${totalCorregidos}`);
        console.log(`✅ Ya estaban correctos: ${totalYaCorrectos}`);
        console.log(`❌ No encontrados en BD: ${totalNoEncontrados}`);
        console.log(`➕ Títulos oficiales creados: ${totalTitulosCreados}`);
        console.log(`❌ Errores: ${errores}`);
        
        if (totalTitulosCreados > 0) {
            console.log('\\n🆕 TÍTULOS OFICIALES CREADOS:');
            titulosCreados.slice(0, 20).forEach((titulo, index) => {
                console.log(`   ${index + 1}. ${titulo}`);
            });
            if (titulosCreados.length > 20) {
                console.log(`   ... y ${titulosCreados.length - 20} títulos más`);
            }
        }
        
        // Verificar estado final del problema masivo
        console.log('\\n🔍 VERIFICANDO TÍTULOS PROBLEMÁTICOS DESPUÉS DE CORRECCIÓN:');
        const problemasRestantes = await pool.query(`
            SELECT t.descripcion, COUNT(*) as cantidad
            FROM copig.matriculas m
            JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE t.id IN (2, 3, 5) -- Los títulos problemáticos originales
            GROUP BY t.descripcion
            ORDER BY COUNT(*) DESC
        `);
        
        problemasRestantes.rows.forEach(titulo => {
            console.log(`   ${titulo.descripcion}: ${titulo.cantidad} profesionales restantes`);
        });
        
        if (totalCorregidos > 0) {
            console.log('\\n🎉 ¡CORRECCIÓN MASIVA COMPLETADA EXITOSAMENTE!');
            console.log(`✅ ${totalCorregidos} profesionales corregidos con títulos oficiales`);
            console.log(`📝 Correcciones registradas en: copig.correcciones_masivas_oficiales`);
            console.log(`💾 Backup disponible en: ${backupFileName}`);
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error general:', error);
        await pool.end();
    }
}

console.log('🚨 IMPORTANTE: Esta corrección masiva usa datos oficiales de la web del COPIG');
console.log('💾 Se creará backup automático antes de cualquier cambio');
console.log('');

correccionMasivaConDatosOficiales();