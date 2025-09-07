const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

// Mapeo de correcciones basado en análisis oficial del COPIG
const correcciones = {
    // Casos confirmados por PDF oficial del COPIG
    8763: {nombre: 'ABRAHAM, LAURA IRENE', titulo_correcto_id: 32, titulo_correcto: 'INGENIERO AGRONOMO', categoria: 'Agronomía'},
    10982: {nombre: 'ADRIAZOLA, CECILIA ANABEL', titulo_correcto_id: 32, titulo_correcto: 'INGENIERO AGRONOMO', categoria: 'Agronomía'},
    10394: {nombre: 'AGNESE, ALEJANDRO LIONEL', titulo_correcto_id: 32, titulo_correcto: 'INGENIERO AGRONOMO', categoria: 'Agronomía'},
    
    5454: {nombre: 'ACIAR,CARLOS DANTE PEDRO', titulo_correcto_id: 224, titulo_correcto: 'INGENIERO EN CONSTRUCCIONES', categoria: 'Civil'},
    7626: {nombre: 'ACOSTA,SERGIO DANIEL', titulo_correcto_id: 224, titulo_correcto: 'INGENIERO EN CONSTRUCCIONES', categoria: 'Civil'}, // Ya corregido
    9106: {nombre: 'ABAD, RAMIRO', titulo_correcto_id: 247, titulo_correcto: 'INGENIERO CIVIL', categoria: 'Civil'},
    
    8765: {nombre: 'AGUILAR, MARIA LUZ', titulo_correcto_id: 55, titulo_correcto: 'LICENCIADO EN CCIAS.GEOLOGICAS', categoria: 'Geología'},
    5507: {nombre: 'ALONSO,JORGE CRISTOBAL', titulo_correcto_id: 55, titulo_correcto: 'LICENCIADO EN CCIAS.GEOLOGICAS', categoria: 'Geología'},
    
    11418: {nombre: 'ABELDAÑO, FEDERICO ADRIAN', titulo_correcto_id: 89, titulo_correcto: 'INGENIERO INDUSTRIAL', categoria: 'Especializada'}
};

async function correccionMasivaTitulosInteligente() {
    try {
        console.log('🚀 CORRECCIÓN MASIVA INTELIGENTE DE TÍTULOS PROFESIONALES');
        console.log('='.repeat(70));
        console.log('⚠️  BASADA EN ANÁLISIS DE DOCUMENTOS OFICIALES DEL COPIG');
        console.log('');
        
        let totalCorregidos = 0;
        let errores = 0;
        let yaCorrectos = 0;
        let noEncontrados = 0;
        
        const logCorrecciones = [];
        
        console.log('🔍 PROCESANDO CORRECCIONES CONFIRMADAS:');
        console.log('');
        
        for (const [matricula, datos] of Object.entries(correcciones)) {
            const matriculaNum = parseInt(matricula);
            console.log(`📋 Mat. ${matriculaNum}: ${datos.nombre} (${datos.categoria})`);
            
            try {
                // Verificar estado actual
                const profesionalActual = await pool.query(`
                    SELECT p.id, p.nombre, m.numero_matricula, t.descripcion as titulo_actual, t.id as titulo_actual_id
                    FROM copig.profesionales p
                    JOIN copig.matriculas m ON p.id = m.profesional_id
                    LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                    WHERE m.numero_matricula = $1
                `, [matriculaNum]);
                
                if (profesionalActual.rows.length === 0) {
                    console.log(`   ❌ NO ENCONTRADO en BD`);
                    noEncontrados++;
                    continue;
                }
                
                const prof = profesionalActual.rows[0];
                console.log(`   Actual: "${prof.titulo_actual || 'SIN TÍTULO'}" (ID: ${prof.titulo_actual_id || 'NULL'})`);
                console.log(`   Correcto: "${datos.titulo_correcto}" (ID: ${datos.titulo_correcto_id})`);
                
                // Verificar si ya está correcto
                if (prof.titulo_actual_id === datos.titulo_correcto_id) {
                    console.log(`   ✅ YA CORRECTO - Sin cambios necesarios`);
                    yaCorrectos++;
                    continue;
                }
                
                // Aplicar corrección
                const resultado = await pool.query(`
                    UPDATE copig.matriculas 
                    SET titulo_id = $1 
                    WHERE profesional_id = $2
                `, [datos.titulo_correcto_id, prof.id]);
                
                console.log(`   ✅ CORREGIDO: ${prof.titulo_actual || 'SIN TÍTULO'} → ${datos.titulo_correcto}`);
                totalCorregidos++;
                
                // Log para auditoría
                logCorrecciones.push({
                    matricula: matriculaNum,
                    profesional_id: prof.id,
                    nombre: prof.nombre,
                    titulo_anterior: prof.titulo_actual || 'SIN TÍTULO',
                    titulo_nuevo: datos.titulo_correcto,
                    categoria: datos.categoria,
                    fecha: new Date().toISOString()
                });
                
            } catch (error) {
                console.log(`   ❌ ERROR: ${error.message}`);
                errores++;
            }
            
            console.log('');
        }
        
        // Crear tabla de log si no existe
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS copig.log_correcciones_masivas (
                    id SERIAL PRIMARY KEY,
                    matricula INTEGER,
                    profesional_id INTEGER,
                    nombre VARCHAR(255),
                    titulo_anterior VARCHAR(255),
                    titulo_nuevo VARCHAR(255),
                    categoria VARCHAR(100),
                    fecha TIMESTAMP,
                    tipo_correccion VARCHAR(50) DEFAULT 'MASIVA_OFICIAL'
                )
            `);
            
            // Insertar log de correcciones
            for (const correccion of logCorrecciones) {
                await pool.query(`
                    INSERT INTO copig.log_correcciones_masivas 
                    (matricula, profesional_id, nombre, titulo_anterior, titulo_nuevo, categoria, fecha)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    correccion.matricula,
                    correccion.profesional_id,
                    correccion.nombre,
                    correccion.titulo_anterior,
                    correccion.titulo_nuevo,
                    correccion.categoria,
                    correccion.fecha
                ]);
            }
            
        } catch (logError) {
            console.log('⚠️  Warning: No se pudo crear log de auditoría');
        }
        
        // Verificar correcciones aplicadas
        console.log('🔍 VERIFICANDO CORRECCIONES APLICADAS:');
        for (const [matricula, datos] of Object.entries(correcciones)) {
            const verificacion = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_actual
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [parseInt(matricula)]);
            
            if (verificacion.rows.length > 0) {
                const prof = verificacion.rows[0];
                const correcto = prof.titulo_actual === datos.titulo_correcto;
                console.log(`   ${correcto ? '✅' : '❌'} Mat. ${matricula}: "${prof.titulo_actual}"`);
            }
        }
        
        // Resumen final
        console.log('');
        console.log('='.repeat(70));
        console.log('📊 RESUMEN DE CORRECCIÓN MASIVA:');
        console.log(`📋 Total procesados: ${Object.keys(correcciones).length}`);
        console.log(`✅ Corregidos exitosamente: ${totalCorregidos}`);
        console.log(`✅ Ya estaban correctos: ${yaCorrectos}`);
        console.log(`❌ No encontrados: ${noEncontrados}`);
        console.log(`❌ Errores: ${errores}`);
        console.log('');
        
        if (totalCorregidos > 0) {
            console.log(`🎯 ${totalCorregidos} TÍTULOS CORREGIDOS BASADOS EN DOCUMENTOS OFICIALES DEL COPIG`);
            console.log('📝 Log de correcciones guardado en tabla: copig.log_correcciones_masivas');
        }
        
        if (yaCorrectos > 0) {
            console.log(`✅ ${yaCorrectos} títulos ya estaban correctos`);
        }
        
        console.log('');
        console.log('💡 SIGUIENTE PASO RECOMENDADO:');
        console.log('   Usar herramienta_correccion_directa.js para casos individuales restantes');
        console.log('   Hay 2,839 profesionales sin título que necesitan revisión manual');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error general:', error);
        await pool.end();
    }
}

console.log('🚨 IMPORTANTE: Este script corrige SOLO los casos confirmados por documentos oficiales');
console.log('📋 Total correcciones a aplicar:', Object.keys(correcciones).length);
console.log('');

correccionMasivaTitulosInteligente();