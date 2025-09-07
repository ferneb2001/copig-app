const fs = require('fs');

function fixProfesionalesEndpoint() {
    console.log('🔧 CORRECCIÓN ENDPOINT PROFESIONALES');
    console.log('===================================\n');
    
    try {
        // 1. Backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `./server.js.backup.profesionales.${timestamp}`;
        
        const content = fs.readFileSync('./server.js', 'utf8');
        fs.writeFileSync(backupPath, content);
        console.log(`✅ Backup creado: ${backupPath}`);
        
        // 2. Buscar el endpoint problemático
        const lines = content.split('\n');
        let startLine = -1;
        let endLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("app.get('/api/admin/profesionales', requirePermission('profesional', 'read')")) {
                startLine = i;
            }
            if (startLine >= 0 && lines[i].includes('});') && lines[i+1] && 
                (lines[i+1].includes('// ') || lines[i+1].includes('app.') || lines[i+1].trim() === '')) {
                endLine = i;
                break;
            }
        }
        
        if (startLine === -1 || endLine === -1) {
            console.log('❌ No se pudo encontrar el endpoint');
            return false;
        }
        
        console.log(`✅ Endpoint encontrado en líneas ${startLine + 1} a ${endLine + 1}`);
        
        // 3. Endpoint corregido
        const fixedEndpoint = `app.get('/api/admin/profesionales', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando profesionales...');
        
        // Parámetros de búsqueda y paginación
        const buscar = req.query.buscar || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        console.log(\`📋 Búsqueda: "\${buscar}", página: \${page}\`);
        
        let params = [];
        let whereClause = '';
        
        // Agregar búsqueda si existe
        if (buscar.trim()) {
            whereClause = 'WHERE (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 OR m.numero_matricula::TEXT ILIKE $1)';
            params = [\`%\${buscar.trim()}%\`];
        }
        
        // Consulta principal
        const dataQuery = \`
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                p.email,
                p.fecha_inscripcion,
                m.numero_matricula as matricula,
                m.categoria,
                p.activo
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            \${whereClause}
            ORDER BY p.nombre 
            LIMIT \${limit} OFFSET \${offset}
        \`;
        
        // Consulta contador
        const countQuery = \`
            SELECT COUNT(DISTINCT p.id) as total 
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            \${whereClause}
        \`;
        
        const [result, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        
        console.log(\`✅ [ADMIN] \${result.rows.length} de \${total} profesionales (página \${page}/\${totalPages})\`);
        
        res.json({
            profesionales: result.rows,
            total: total,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_records: total,
                per_page: limit
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});`;
        
        // 4. Reemplazar el endpoint
        const beforeEndpoint = lines.slice(0, startLine).join('\n');
        const afterEndpoint = lines.slice(endLine + 1).join('\n');
        const newContent = beforeEndpoint + '\n' + fixedEndpoint + '\n' + afterEndpoint;
        
        // 5. Escribir archivo
        fs.writeFileSync('./server.js', newContent);
        console.log('✅ Endpoint profesionales corregido');
        
        // 6. Validar sintaxis
        try {
            require('./server.js');
            console.log('✅ Sintaxis válida');
        } catch (error) {
            console.error('❌ Error de sintaxis:', error.message);
            // Restaurar backup
            fs.writeFileSync('./server.js', content);
            console.log('🔄 Backup restaurado');
            return false;
        }
        
        console.log('\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE');
        console.log('🔄 REINICIA EL SERVIDOR para aplicar cambios');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        return false;
    }
}

fixProfesionalesEndpoint();