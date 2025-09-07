// Script para agregar endpoints de corrección de títulos al server.js
const fs = require('fs');

function agregarEndpoints() {
    try {
        console.log('🔧 Agregando endpoints de corrección de títulos al servidor...');
        
        let serverJs = fs.readFileSync('server.js', 'utf8');
        
        // Buscar dónde insertar los nuevos endpoints
        const insertPoint = serverJs.lastIndexOf('// ==================== ENDPOINTS DE DATOS ====================');
        
        if (insertPoint === -1) {
            console.log('❌ No se encontró el punto de inserción');
            return;
        }
        
        const nuevosEndpoints = `
// ==================== ENDPOINTS CORRECCIÓN DE TÍTULOS ====================

// Obtener títulos disponibles
app.get('/api/admin/titulos-disponibles', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        const result = await pool.query('SELECT id, descripcion FROM copig.titulos ORDER BY descripcion');
        res.json({ success: true, titulos: result.rows });
    } catch (error) {
        console.error('Error obteniendo títulos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Corregir título de un profesional
app.post('/api/admin/corregir-titulo', requirePermission('profesional', 'write'), async (req, res) => {
    try {
        const { profesional_id, nuevo_titulo_id, observaciones } = req.body;
        
        // Obtener datos actuales
        const profesionalActual = await pool.query(\`
            SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_actual
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE p.id = $1
        \`, [profesional_id]);
        
        if (profesionalActual.rows.length === 0) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        
        // Obtener nuevo título
        const nuevoTitulo = await pool.query('SELECT descripcion FROM copig.titulos WHERE id = $1', [nuevo_titulo_id]);
        
        if (nuevoTitulo.rows.length === 0) {
            return res.status(404).json({ error: 'Título no encontrado' });
        }
        
        // Actualizar título
        const updateResult = await pool.query(\`
            UPDATE copig.matriculas 
            SET titulo_id = $1 
            WHERE profesional_id = $2
        \`, [nuevo_titulo_id, profesional_id]);
        
        // Registrar corrección en log (crear tabla si no existe)
        try {
            await pool.query(\`
                CREATE TABLE IF NOT EXISTS copig.correcciones_titulos (
                    id SERIAL PRIMARY KEY,
                    profesional_id INTEGER,
                    matricula INTEGER,
                    nombre_profesional VARCHAR(255),
                    titulo_anterior VARCHAR(255),
                    titulo_nuevo VARCHAR(255),
                    observaciones TEXT,
                    usuario_correccion VARCHAR(255),
                    fecha_correccion TIMESTAMP DEFAULT NOW()
                )
            \`);
            
            await pool.query(\`
                INSERT INTO copig.correcciones_titulos 
                (profesional_id, matricula, nombre_profesional, titulo_anterior, titulo_nuevo, observaciones, usuario_correccion)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            \`, [
                profesional_id,
                profesionalActual.rows[0].numero_matricula,
                profesionalActual.rows[0].nombre,
                profesionalActual.rows[0].titulo_actual || 'Sin título',
                nuevoTitulo.rows[0].descripcion,
                observaciones,
                req.session.user.username || 'Sistema'
            ]);
            
        } catch (logError) {
            console.error('Error registrando corrección:', logError);
        }
        
        console.log(\`✅ Título corregido: \${profesionalActual.rows[0].nombre} - \${profesionalActual.rows[0].titulo_actual} → \${nuevoTitulo.rows[0].descripcion}\`);
        
        res.json({ 
            success: true, 
            mensaje: \`Título actualizado exitosamente para \${profesionalActual.rows[0].nombre}\`
        });
        
    } catch (error) {
        console.error('Error corrigiendo título:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener historial de correcciones
app.get('/api/admin/historial-correcciones', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        const result = await pool.query(\`
            SELECT * FROM copig.correcciones_titulos 
            ORDER BY fecha_correccion DESC 
            LIMIT 20
        \`);
        
        res.json({ success: true, correcciones: result.rows });
        
    } catch (error) {
        // Si la tabla no existe, devolver vacío
        console.log('Tabla correcciones_titulos no existe aún');
        res.json({ success: true, correcciones: [] });
    }
});

`;
        
        // Insertar después del comentario
        const afterComment = serverJs.indexOf('\\n', insertPoint) + 1;
        serverJs = serverJs.substring(0, afterComment) + nuevosEndpoints + serverJs.substring(afterComment);
        
        // Backup y guardar
        fs.writeFileSync('server_backup_before_titulo_endpoints.js', fs.readFileSync('server.js', 'utf8'));
        fs.writeFileSync('server.js', serverJs);
        
        console.log('✅ Endpoints agregados exitosamente');
        console.log('📁 Backup guardado en: server_backup_before_titulo_endpoints.js');
        console.log('🔄 **REINICIA EL SERVIDOR** para activar los nuevos endpoints');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

agregarEndpoints();