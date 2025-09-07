const fs = require('fs');

function createWorkingEndpoints() {
    console.log('🔧 CREANDO ENDPOINTS FUNCIONALES');
    console.log('================================\n');
    
    try {
        // 1. Backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `./server.js.backup.endpoints.${timestamp}`;
        
        const content = fs.readFileSync('./server.js', 'utf8');
        fs.writeFileSync(backupPath, content);
        console.log(`✅ Backup creado: ${backupPath}`);
        
        // 2. Endpoints funcionales
        const workingEndpoints = `

// ========================================
// ENDPOINTS FUNCIONALES CORREGIDOS
// ========================================

// Endpoint para obtener profesionales (FUNCIONAL)
app.get('/api/admin/profesionales', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando profesionales...');
        
        const buscar = req.query.buscar || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        
        console.log(\`📋 Búsqueda: "\${buscar}", página: \${page}\`);
        
        let whereClause = '';
        let params = [];
        
        if (buscar.trim()) {
            whereClause = \`WHERE (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 
                           OR m.numero_matricula::TEXT ILIKE $1)\`;
            params = [\`%\${buscar.trim()}%\`];
        }
        
        // Consulta principal con campos que SÍ existen
        const dataQuery = \`
            SELECT 
                p.id, 
                p.nombre, 
                p.numero_documento,
                p.email,
                p.domicilio,
                p.telefono,
                p.created_at as fecha_registro,
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
        console.error('❌ [ADMIN] Error obteniendo profesionales:', error.message);
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});

// Endpoint para obtener empresas (FUNCIONAL) 
app.get('/api/admin/empresas', requirePermission('empresas', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando empresas...');
        
        const buscar = req.query.buscar || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const estado = req.query.estado || 'all';
        
        console.log(\`📋 Empresas - Búsqueda: "\${buscar}", página: \${page}, estado: \${estado}\`);
        
        let whereClause = '';
        let params = [];
        
        // Agregar filtros
        const conditions = [];
        
        if (buscar.trim()) {
            conditions.push('(razon_social ILIKE $' + (params.length + 1) + ' OR cuit ILIKE $' + (params.length + 1) + ')');
            params.push(\`%\${buscar.trim()}%\`);
        }
        
        if (estado !== 'all') {
            const isActivo = estado === 'activo';
            conditions.push('activo = $' + (params.length + 1));
            params.push(isActivo);
        }
        
        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }
        
        // Consulta principal
        const dataQuery = \`
            SELECT 
                id, 
                razon_social, 
                cuit,
                domicilio,
                localidad,
                email,
                telefono,
                activo,
                fecha_creacion
            FROM copig.empresas
            \${whereClause}
            ORDER BY razon_social 
            LIMIT \${limit} OFFSET \${offset}
        \`;
        
        // Consulta contador
        const countQuery = \`
            SELECT COUNT(*) as total 
            FROM copig.empresas
            \${whereClause}
        \`;
        
        const [result, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);
        
        console.log(\`✅ [ADMIN] \${result.rows.length} de \${total} empresas (página \${page}/\${totalPages})\`);
        
        res.json({
            empresas: result.rows,
            total: total,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_records: total,
                per_page: limit
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo empresas:', error.message);
        res.status(500).json({ error: 'Error obteniendo empresas' });
    }
});

// FIN ENDPOINTS FUNCIONALES CORREGIDOS
`;
        
        // 3. Agregar al final del archivo, antes del server.listen
        const serverListenPos = content.lastIndexOf('server.listen');
        if (serverListenPos === -1) {
            console.log('❌ No se encontró server.listen');
            return false;
        }
        
        const beforeListen = content.substring(0, serverListenPos);
        const afterListen = content.substring(serverListenPos);
        const newContent = beforeListen + workingEndpoints + '\n\n' + afterListen;
        
        // 4. Escribir archivo
        fs.writeFileSync('./server.js', newContent);
        console.log('✅ Endpoints funcionales agregados');
        
        console.log('\n🎉 ENDPOINTS FUNCIONALES CREADOS');
        console.log('Agregados:');
        console.log('  - GET /api/admin/profesionales (funcional)');
        console.log('  - GET /api/admin/empresas (funcional)');
        console.log('\n🔄 REINICIA EL SERVIDOR para aplicar cambios');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        return false;
    }
}

createWorkingEndpoints();