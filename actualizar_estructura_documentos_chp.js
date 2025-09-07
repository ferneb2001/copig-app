const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function actualizarEstructuraDocumentosCHP() {
    try {
        console.log('🔧 ACTUALIZAR ESTRUCTURA DOCUMENTOS CHP\n');
        
        // 1. Verificar estructura actual
        console.log('=== 1. VERIFICAR ESTRUCTURA ACTUAL ===');
        const tablaActual = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'documentos_chp'
            ORDER BY ordinal_position
        `);
        
        console.log('Estructura actual documentos_chp:');
        tablaActual.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type}`);
        });
        
        // 2. Crear nueva estructura para múltiples documentos
        console.log('\n=== 2. CREAR NUEVA ESTRUCTURA MÚLTIPLE ===');
        
        // Eliminar tabla anterior si existe
        await pool.query('DROP TABLE IF EXISTS copig.documentos_chp_old');
        
        // Respaldar datos actuales
        await pool.query(`
            CREATE TABLE copig.documentos_chp_old AS 
            SELECT * FROM copig.documentos_chp
        `);
        console.log('✅ Backup de documentos_chp_old creado');
        
        // Eliminar tabla actual
        await pool.query('DROP TABLE copig.documentos_chp');
        
        // Crear nueva estructura optimizada para múltiples archivos por categoría
        await pool.query(`
            CREATE TABLE copig.documentos_chp (
                id SERIAL PRIMARY KEY,
                solicitud_id INTEGER REFERENCES copig.solicitudes_chp(id) ON DELETE CASCADE,
                categoria VARCHAR(50) NOT NULL,  -- caja_matricula, rotulo, memoria_tecnica, planos, documentacion
                archivo_nombre VARCHAR(255) NOT NULL,
                archivo_path VARCHAR(500),  -- Ruta donde se guarda el archivo
                archivo_size INTEGER,       -- Tamaño en bytes
                mime_type VARCHAR(100) DEFAULT 'application/pdf',
                estado VARCHAR(20) DEFAULT 'PENDIENTE',  -- PENDIENTE, APROBADO, RECHAZADO
                observaciones TEXT,
                aprobado_por INTEGER REFERENCES copig.admin_users(id),
                fecha_carga TIMESTAMP DEFAULT NOW(),
                fecha_revision TIMESTAMP,
                metadata JSONB  -- Para datos adicionales del archivo
            )
        `);
        console.log('✅ Nueva tabla documentos_chp creada con estructura múltiple');
        
        // 3. Crear índices para optimización
        console.log('\n=== 3. CREAR ÍNDICES OPTIMIZACIÓN ===');
        await pool.query(`
            CREATE INDEX idx_documentos_chp_solicitud ON copig.documentos_chp(solicitud_id);
        `);
        await pool.query(`
            CREATE INDEX idx_documentos_chp_categoria ON copig.documentos_chp(categoria);
        `);
        await pool.query(`
            CREATE INDEX idx_documentos_chp_estado ON copig.documentos_chp(estado);
        `);
        console.log('✅ Índices creados para optimización de consultas');
        
        // 4. Migrar datos anteriores si existen
        console.log('\n=== 4. MIGRAR DATOS ANTERIORES ===');
        const datosAnteriores = await pool.query('SELECT * FROM copig.documentos_chp_old');
        
        if (datosAnteriores.rows.length > 0) {
            console.log(`Migrando ${datosAnteriores.rows.length} documentos anteriores...`);
            
            for (const doc of datosAnteriores.rows) {
                // Migrar con nueva estructura
                await pool.query(`
                    INSERT INTO copig.documentos_chp 
                    (solicitud_id, categoria, archivo_nombre, archivo_path, fecha_carga, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    doc.solicitud_id,
                    doc.tipo_documento || 'documentacion', // Mapear tipo antiguo a categoría
                    doc.archivo || 'documento_sin_nombre.pdf',
                    doc.archivo,
                    doc.fecha_carga || new Date(),
                    JSON.stringify({ migrado: true, tipo_original: doc.tipo_documento })
                ]);
            }
            console.log('✅ Datos anteriores migrados correctamente');
        } else {
            console.log('ℹ️ No hay datos anteriores para migrar');
        }
        
        // 5. Crear directorio para almacenar archivos si no existe
        console.log('\n=== 5. PREPARAR SISTEMA ARCHIVOS ===');
        const fs = require('fs');
        const path = require('path');
        
        const uploadsDir = path.join(__dirname, 'uploads', 'chp');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log(`✅ Directorio creado: ${uploadsDir}`);
        } else {
            console.log(`✅ Directorio ya existe: ${uploadsDir}`);
        }
        
        // Crear subdirectorios por categoría
        const categorias = ['caja_matricula', 'rotulo', 'memoria_tecnica', 'planos', 'documentacion'];
        categorias.forEach(categoria => {
            const categoriaDir = path.join(uploadsDir, categoria);
            if (!fs.existsSync(categoriaDir)) {
                fs.mkdirSync(categoriaDir, { recursive: true });
                console.log(`✅ Subdirectorio creado: ${categoria}`);
            }
        });
        
        // 6. Verificar estructura final
        console.log('\n=== 6. VERIFICAR ESTRUCTURA FINAL ===');
        const estructuraFinal = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'documentos_chp'
            ORDER BY ordinal_position
        `);
        
        console.log('Estructura final documentos_chp:');
        estructuraFinal.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
        });
        
        console.log('\n🎉 ESTRUCTURA ACTUALIZADA CORRECTAMENTE');
        console.log('📋 Funcionalidades disponibles:');
        console.log('   ✅ Múltiples archivos por categoría');
        console.log('   ✅ 5 categorías organizadas en pestañas');
        console.log('   ✅ Estado y aprobación por documento individual');
        console.log('   ✅ Metadata flexible para información adicional');
        console.log('   ✅ Sistema de archivos organizado por categorías');
        console.log('   ✅ Índices optimizados para consultas rápidas');
        
    } catch (error) {
        console.error('❌ Error actualizando estructura:', error);
    } finally {
        await pool.end();
    }
}

actualizarEstructuraDocumentosCHP().catch(console.error);