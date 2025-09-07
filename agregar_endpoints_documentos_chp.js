const fs = require('fs');

// Endpoints para gestión de documentos CHP múltiples
const endpointsDocumentos = `
// =====================================================
// ENDPOINTS PARA GESTIÓN DE DOCUMENTOS CHP MÚLTIPLES  
// =====================================================

// Configuración de multer para subida de archivos
const multer = require('multer');
const path = require('path');

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const categoria = req.params.categoria || 'documentacion';
        const uploadDir = path.join(__dirname, 'uploads', 'chp', categoria);
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Nombre único: timestamp_solicitudId_original
        const timestamp = Date.now();
        const solicitudId = req.params.solicitudId;
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, \`\${timestamp}_\${solicitudId}_\${originalName}\`);
    }
});

// Configurar multer con validaciones
const uploadCHP = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
        files: 10 // Máximo 10 archivos por vez
    },
    fileFilter: function (req, file, cb) {
        // Solo PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    }
});

// 1. Subir múltiples documentos por categoría
app.post('/api/chp/documentos/:solicitudId/:categoria', uploadCHP.array('documentos', 10), async (req, res) => {
    try {
        const { solicitudId, categoria } = req.params;
        const files = req.files;
        
        if (!files || files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se recibieron archivos' 
            });
        }
        
        // Verificar que la solicitud existe
        const solicitudExiste = await pool.query(
            'SELECT id FROM copig.solicitudes_chp WHERE id = $1',
            [solicitudId]
        );
        
        if (solicitudExiste.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Solicitud no encontrada' 
            });
        }
        
        // Insertar cada archivo en la base de datos
        const documentosGuardados = [];
        
        for (const file of files) {
            const resultado = await pool.query(\`
                INSERT INTO copig.documentos_chp 
                (solicitud_id, categoria, archivo_nombre, archivo_path, archivo_size, mime_type, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            \`, [
                solicitudId,
                categoria,
                file.originalname,
                file.path,
                file.size,
                file.mimetype,
                JSON.stringify({
                    filename_saved: file.filename,
                    uploaded_at: new Date().toISOString()
                })
            ]);
            
            documentosGuardados.push(resultado.rows[0]);
        }
        
        res.json({
            success: true,
            message: \`\${files.length} documento(s) subido(s) correctamente\`,
            documentos: documentosGuardados
        });
        
    } catch (error) {
        console.error('Error subiendo documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// 2. Listar documentos por solicitud y categoría
app.get('/api/chp/documentos/:solicitudId/:categoria?', async (req, res) => {
    try {
        const { solicitudId, categoria } = req.params;
        
        let query = \`
            SELECT d.*, au.username as aprobado_por_nombre 
            FROM copig.documentos_chp d
            LEFT JOIN copig.admin_users au ON d.aprobado_por = au.id
            WHERE d.solicitud_id = $1
        \`;
        const params = [solicitudId];
        
        if (categoria) {
            query += ' AND d.categoria = $2';
            params.push(categoria);
        }
        
        query += ' ORDER BY d.categoria, d.fecha_carga DESC';
        
        const documentos = await pool.query(query, params);
        
        res.json({
            success: true,
            documentos: documentos.rows
        });
        
    } catch (error) {
        console.error('Error listando documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar documentos'
        });
    }
});

// 3. Descargar/ver documento específico
app.get('/api/chp/documento/:documentoId/download', async (req, res) => {
    try {
        const { documentoId } = req.params;
        
        const documento = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1',
            [documentoId]
        );
        
        if (documento.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        const doc = documento.rows[0];
        const filePath = doc.archivo_path;
        
        // Verificar que el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo físico no encontrado'
            });
        }
        
        // Enviar el archivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', \`inline; filename="\${doc.archivo_nombre}"\`);
        res.sendFile(path.resolve(filePath));
        
    } catch (error) {
        console.error('Error descargando documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al descargar documento'
        });
    }
});

// 4. Eliminar documento
app.delete('/api/chp/documento/:documentoId', async (req, res) => {
    try {
        const { documentoId } = req.params;
        
        // Buscar el documento
        const documento = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1',
            [documentoId]
        );
        
        if (documento.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        const doc = documento.rows[0];
        
        // Eliminar archivo físico
        if (fs.existsSync(doc.archivo_path)) {
            fs.unlinkSync(doc.archivo_path);
        }
        
        // Eliminar registro de base de datos
        await pool.query('DELETE FROM copig.documentos_chp WHERE id = $1', [documentoId]);
        
        res.json({
            success: true,
            message: 'Documento eliminado correctamente'
        });
        
    } catch (error) {
        console.error('Error eliminando documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar documento'
        });
    }
});

// 5. Aprobar/rechazar documento
app.put('/api/chp/documento/:documentoId/revision', async (req, res) => {
    try {
        const { documentoId } = req.params;
        const { estado, observaciones } = req.body;
        const adminId = req.session?.adminId || 1; // ID del admin que hace la revisión
        
        if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado debe ser APROBADO o RECHAZADO'
            });
        }
        
        const resultado = await pool.query(\`
            UPDATE copig.documentos_chp 
            SET estado = $1, observaciones = $2, aprobado_por = $3, fecha_revision = NOW()
            WHERE id = $4
            RETURNING *
        \`, [estado, observaciones, adminId, documentoId]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: \`Documento \${estado.toLowerCase()} correctamente\`,
            documento: resultado.rows[0]
        });
        
    } catch (error) {
        console.error('Error en revisión de documento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al revisar documento'
        });
    }
});

// 6. Obtener estadísticas de documentos por solicitud
app.get('/api/chp/documentos/:solicitudId/estadisticas', async (req, res) => {
    try {
        const { solicitudId } = req.params;
        
        const stats = await pool.query(\`
            SELECT 
                categoria,
                COUNT(*) as total,
                COUNT(CASE WHEN estado = 'APROBADO' THEN 1 END) as aprobados,
                COUNT(CASE WHEN estado = 'RECHAZADO' THEN 1 END) as rechazados,
                COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as pendientes
            FROM copig.documentos_chp 
            WHERE solicitud_id = $1
            GROUP BY categoria
            ORDER BY categoria
        \`, [solicitudId]);
        
        res.json({
            success: true,
            estadisticas: stats.rows
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

// =====================================================
// FIN ENDPOINTS DOCUMENTOS CHP MÚLTIPLES
// =====================================================
`;

// Leer el archivo server.js actual
console.log('📖 Leyendo server.js actual...');
const serverContent = fs.readFileSync('server.js', 'utf8');

// Buscar dónde insertar los nuevos endpoints (antes de module.exports)
const insertPosition = serverContent.lastIndexOf('module.exports = app;');

if (insertPosition === -1) {
    console.error('❌ No se encontró la línea module.exports en server.js');
    process.exit(1);
}

// Insertar los nuevos endpoints
const newServerContent = serverContent.slice(0, insertPosition) + 
                         endpointsDocumentos + '\n\n' + 
                         serverContent.slice(insertPosition);

// Guardar el archivo actualizado
fs.writeFileSync('server.js', newServerContent, 'utf8');

console.log('✅ Endpoints agregados exitosamente a server.js');
console.log('📋 Endpoints agregados:');
console.log('   POST /api/chp/documentos/:solicitudId/:categoria - Subir múltiples documentos');
console.log('   GET  /api/chp/documentos/:solicitudId/:categoria? - Listar documentos');
console.log('   GET  /api/chp/documento/:documentoId/download - Descargar documento');
console.log('   DELETE /api/chp/documento/:documentoId - Eliminar documento');
console.log('   PUT  /api/chp/documento/:documentoId/revision - Aprobar/rechazar documento');
console.log('   GET  /api/chp/documentos/:solicitudId/estadisticas - Estadísticas');

console.log('\n⚠️ IMPORTANTE: Es necesario instalar multer para subida de archivos');
console.log('💡 Ejecutar: npm install multer');