const fs = require('fs');

console.log('🚀 AGREGANDO ENDPOINTS AL FINAL DE SERVER.JS');

let content = fs.readFileSync('server.js', 'utf8');

// Endpoints completos
const endpoints = `
// ============================================================================
// ENDPOINTS DOCUMENTOS CHP - FUNCIONALIDAD COMPLETA PARA PROFESIONALES
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
        
        const doc = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1 AND profesional_id = $2',
            [id, profesionalId]
        );
        
        if (doc.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        
        await pool.query('DELETE FROM copig.documentos_chp WHERE id = $1', [id]);
        
        console.log(\`✅ Documento \${id} eliminado correctamente\`);
        
        res.json({ success: true, message: 'Documento eliminado correctamente' });
        
    } catch (error) {
        console.error('❌ Error eliminando documento:', error);
        res.status(500).json({ success: false, message: 'Error eliminando documento' });
    }
});
`;

// Reemplazar antes de module.exports
content = content.replace('module.exports = app;', endpoints + '\nmodule.exports = app;');

fs.writeFileSync('server.js', content, 'utf8');

console.log('✅ Endpoints agregados exitosamente');
console.log('🔄 Ahora debes REINICIAR EL SERVIDOR:');
console.log('   1. Ctrl+C en ambos procesos');
console.log('   2. node server.js');