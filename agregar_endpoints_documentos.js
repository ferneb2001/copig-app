const fs = require('fs');

console.log('🚀 AGREGANDO ENDPOINTS DE DOCUMENTOS A SERVER.JS');

let serverContent = fs.readFileSync('server.js', 'utf8');

// Endpoints completos para documentos CHP
const endpointsCompletos = `
// ============================================================================
// ENDPOINTS DOCUMENTOS CHP - FUNCIONALIDAD COMPLETA
// ============================================================================

// Subir documentos por categoría
app.post('/api/chp/documentos/upload/:categoria', requireProfesionalAuth, upload.array('documentos', 10), async (req, res) => {
    try {
        const { categoria } = req.params;
        const profesionalId = req.session.user.id;
        const files = req.files;
        
        console.log(\`📤 Subiendo \${files?.length || 0} documentos para categoría: \${categoria}\`);
        
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No se recibieron archivos' });
        }
        
        // Verificar que la carpeta uploads existe
        const uploadsDir = path.join(__dirname, 'uploads', 'chp');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const documentosGuardados = [];
        
        for (const file of files) {
            try {
                const result = await pool.query(\`
                    INSERT INTO copig.documentos_chp 
                    (profesional_id, categoria, archivo_nombre, archivo_path, archivo_size, mime_type, estado)
                    VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE')
                    RETURNING id
                \`, [profesionalId, categoria, file.originalname, file.path, file.size, file.mimetype]);
                
                documentosGuardados.push({
                    id: result.rows[0].id,
                    nombre: file.originalname,
                    tamaño: file.size,
                    categoria: categoria
                });
                
                console.log(\`✅ Documento guardado: \${file.originalname} (ID: \${result.rows[0].id})\`);
            } catch (dbError) {
                console.error(\`❌ Error guardando \${file.originalname}:\`, dbError);
            }
        }
        
        res.json({
            success: true,
            message: \`\${documentosGuardados.length} documento(s) subido(s) correctamente\`,
            documentos: documentosGuardados
        });
        
    } catch (error) {
        console.error('❌ Error subiendo documentos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Obtener documentos por categoría
app.get('/api/chp/documentos/:categoria', requireProfesionalAuth, async (req, res) => {
    try {
        const { categoria } = req.params;
        const profesionalId = req.session.user.id;
        
        console.log(\`📋 Obteniendo documentos de categoría: \${categoria} para profesional: \${profesionalId}\`);
        
        const result = await pool.query(\`
            SELECT id, archivo_nombre, archivo_size, estado, fecha_carga, observaciones
            FROM copig.documentos_chp 
            WHERE profesional_id = $1 AND categoria = $2
            ORDER BY fecha_carga DESC
        \`, [profesionalId, categoria]);
        
        console.log(\`✅ Encontrados \${result.rows.length} documentos para categoría \${categoria}\`);
        
        res.json({
            success: true,
            documentos: result.rows
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo documentos:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo documentos' });
    }
});

// Eliminar documento
app.delete('/api/chp/documento/:id', requireProfesionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const profesionalId = req.session.user.id;
        
        console.log(\`🗑️ Eliminando documento ID: \${id} del profesional: \${profesionalId}\`);
        
        // Verificar que el documento pertenece al profesional
        const doc = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1 AND profesional_id = $2',
            [id, profesionalId]
        );
        
        if (doc.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        
        // Eliminar archivo físico si existe
        const filePath = doc.rows[0].archivo_path;
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(\`✅ Archivo físico eliminado: \${filePath}\`);
            } catch (fsError) {
                console.log(\`⚠️ No se pudo eliminar archivo físico: \${fsError.message}\`);
            }
        }
        
        // Eliminar de BD
        await pool.query('DELETE FROM copig.documentos_chp WHERE id = $1', [id]);
        
        console.log(\`✅ Documento \${id} eliminado correctamente\`);
        
        res.json({ success: true, message: 'Documento eliminado correctamente' });
        
    } catch (error) {
        console.error('❌ Error eliminando documento:', error);
        res.status(500).json({ success: false, message: 'Error eliminando documento' });
    }
});

// Descargar documento
app.get('/api/chp/documento/:id/download', requireProfesionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const profesionalId = req.session.user.id;
        
        // Verificar que el documento pertenece al profesional
        const doc = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1 AND profesional_id = $2',
            [id, profesionalId]
        );
        
        if (doc.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        
        const documento = doc.rows[0];
        const filePath = documento.archivo_path;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado en el servidor' });
        }
        
        // Enviar archivo
        res.download(filePath, documento.archivo_nombre, (err) => {
            if (err) {
                console.error('Error enviando archivo:', err);
                res.status(500).json({ success: false, message: 'Error enviando archivo' });
            }
        });
        
    } catch (error) {
        console.error('❌ Error descargando documento:', error);
        res.status(500).json({ success: false, message: 'Error descargando documento' });
    }
});
`;

// Buscar donde insertar los endpoints
let insertionPoint = serverContent.indexOf('// === PAGOS Y FINANZAS ===');
if (insertionPoint === -1) {
    insertionPoint = serverContent.indexOf('app.listen(');
}

if (insertionPoint !== -1) {
    const before = serverContent.substring(0, insertionPoint);
    const after = serverContent.substring(insertionPoint);
    
    const newContent = before + endpointsCompletos + '\n' + after;
    
    // Crear backup
    fs.writeFileSync('server-backup.js', serverContent, 'utf8');
    
    // Escribir archivo actualizado
    fs.writeFileSync('server.js', newContent, 'utf8');
    
    console.log('✅ Endpoints agregados a server.js');
    console.log('💾 Backup creado: server-backup.js');
    
} else {
    console.log('❌ No se pudo encontrar punto de inserción en server.js');
}

console.log('\n🎯 ENDPOINTS DOCUMENTOS CHP AGREGADOS:');
console.log('   POST /api/chp/documentos/upload/:categoria - Subir documentos');
console.log('   GET /api/chp/documentos/:categoria - Listar documentos por categoría');
console.log('   DELETE /api/chp/documento/:id - Eliminar documento');
console.log('   GET /api/chp/documento/:id/download - Descargar documento');
console.log('\n🔄 REINICIA EL SERVIDOR PARA APLICAR CAMBIOS');