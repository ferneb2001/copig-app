const fs = require('fs');

console.log('🔧 Reparando endpoints críticos...');

// Leer archivo server.js
let content = fs.readFileSync('server.js', 'utf8');

// ENDPOINT PROFESIONALES - Reemplazar con versión simple funcional
const profesionalesEndpoint = `app.get('/api/admin/profesionales', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando profesionales...');
        
        const buscar = req.query.buscar || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        
        console.log(\`📋 Búsqueda: "\${buscar}", página: \${page}\`);
        
        let whereClause = 'WHERE p.activo = true';
        let params = [];
        
        if (buscar.trim()) {
            whereClause += ' AND (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1)';
            params = [\`%\${buscar.trim()}%\`];
        }
        
        // Query de datos
        const dataQuery = \`
            SELECT 
                p.id, 
                p.numero_documento as dni, 
                p.nombre, 
                p.email,
                m.numero_matricula as matricula,
                m.categoria,
                p.activo
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            \${whereClause}
            ORDER BY p.nombre 
            LIMIT \${limit} OFFSET \${offset}
        \`;
        
        // Query de conteo
        const countQuery = \`
            SELECT COUNT(*) as total 
            FROM copig.profesionales p 
            \${whereClause}
        \`;
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const totalProfesionales = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalProfesionales / limit);
        
        console.log(\`✅ [ADMIN] Encontrados \${dataResult.rows.length} profesionales de \${totalProfesionales} total\`);
        
        res.json({
            success: true,
            profesionales: dataResult.rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalProfesionales,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error:', error);
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});`;

// ENDPOINT EMPRESAS - Reemplazar con versión simple funcional
const empresasEndpoint = `app.get('/api/empresas', requirePermission('empresas', 'read'), async (req, res) => {
    try {
        const { buscar, page = 1, limit = 100, estado } = req.query;
        console.log('🔍 Consultando empresas con parámetros:', { buscar, page, limit, estado });
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        let paramCount = 0;
        
        if (buscar && buscar.trim()) {
            paramCount++;
            whereClause += \` AND (razon_social ILIKE $\${paramCount} OR cuit ILIKE $\${paramCount})\`;
            params.push(\`%\${buscar.trim()}%\`);
        }
        
        if (estado && estado !== 'todos') {
            paramCount++;
            whereClause += \` AND activo = $\${paramCount}\`;
            params.push(estado === 'activo');
        }
        
        // Query de datos
        const dataQuery = \`
            SELECT id, razon_social, cuit, email, telefono, domicilio, 
                   localidad, departamento, codigo_postal, activo,
                   fecha_creacion, fecha_actualizacion, observaciones
            FROM copig.empresas 
            \${whereClause}
            ORDER BY razon_social 
            LIMIT \${limitNum} OFFSET \${offset}
        \`;
        
        // Query de conteo
        const countQuery = \`SELECT COUNT(*) as total FROM copig.empresas \${whereClause}\`;
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limitNum);
        
        console.log(\`✅ Encontradas \${dataResult.rows.length} empresas de \${total} total\`);
        
        res.json({
            success: true,
            empresas: dataResult.rows,
            pagination: {
                currentPage: pageNum,
                totalPages,
                total,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
        
    } catch (error) {
        console.error('❌ Error obteniendo empresas:', error);
        console.error('❌ Detalle:', {
            message: error.message,
            code: error.code,
            query: req.query
        });
        res.status(500).json({ error: 'Error obteniendo empresas' });
    }
});`;

// Buscar y reemplazar endpoints rotos
console.log('🔍 Buscando endpoints rotos...');

// Reemplazar endpoint profesionales (buscar el que tiene el error countQuery)
const profesionalesMatch = content.match(/app\.get\('\/api\/admin\/profesionales'[^}]+}[\s\S]*?}\);/);
if (profesionalesMatch) {
    content = content.replace(profesionalesMatch[0], profesionalesEndpoint);
    console.log('✅ Endpoint profesionales reemplazado');
} else {
    console.log('❌ No se encontró endpoint profesionales problemático');
}

// Reemplazar endpoint empresas (buscar el que tiene el error whereClause)
const empresasMatch = content.match(/app\.get\('\/api\/empresas'[^}]+}[\s\S]*?}\);/);
if (empresasMatch) {
    content = content.replace(empresasMatch[0], empresasEndpoint);
    console.log('✅ Endpoint empresas reemplazado');
} else {
    console.log('❌ No se encontró endpoint empresas problemático');
}

// Guardar archivo reparado
fs.writeFileSync('server.js', content, 'utf8');
console.log('✅ Archivo server.js reparado exitosamente');
console.log('🔄 Reinicia el servidor para aplicar cambios');