// Script para mejorar el query de profesionales
const fs = require('fs');

console.log('🔧 Mejorando query de profesionales...');

let content = fs.readFileSync('server.js', 'utf8');

// Nuevo endpoint profesionales con query mejorado
const newEndpoint = `app.get('/api/admin/profesionales', requirePermission('profesional', 'read'), async (req, res) => {
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
            whereClause += ' AND (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 OR m.numero_matricula::TEXT ILIKE $1)';
            params = [\`%\${buscar.trim()}%\`];
        }
        
        // Query mejorado con todos los campos necesarios
        const dataQuery = \`
            SELECT 
                p.id, 
                COALESCE(p.numero_documento::TEXT, 'Sin DNI') as dni, 
                p.nombre, 
                COALESCE(p.email, 'Sin email') as email,
                COALESCE(m.numero_matricula::TEXT, 'Sin matrícula') as matricula,
                COALESCE(m.categoria, 'N/A') as categoria,
                COALESCE(m.fecha_inscripcion::TEXT, 'No disponible') as fecha_inscripcion,
                COALESCE(m.fecha_habilitacion::TEXT, 'No disponible') as fecha_habilitacion,
                p.activo,
                CASE 
                    WHEN p.activo THEN 'Activo'
                    ELSE 'Inactivo'
                END as estado,
                COALESCE((
                    SELECT ph.fecha_pago::TEXT 
                    FROM copig.pagos_historicos ph 
                    WHERE ph.profesional_id = p.id 
                    ORDER BY ph.fecha_pago DESC 
                    LIMIT 1
                ), 'Sin pagos') as ultimo_pago
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
        console.log('📊 Primer profesional:', dataResult.rows[0] ? {
            nombre: dataResult.rows[0].nombre,
            dni: dataResult.rows[0].dni,
            matricula: dataResult.rows[0].matricula
        } : 'No hay datos');
        
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

// Buscar y reemplazar el endpoint actual
const match = content.match(/app\.get\('\/api\/admin\/profesionales'[^{]*{[\s\S]*?}\);/);
if (match) {
    content = content.replace(match[0], newEndpoint);
    console.log('✅ Endpoint profesionales mejorado');
} else {
    console.log('❌ No se encontró el endpoint profesionales');
}

fs.writeFileSync('server.js', content, 'utf8');
console.log('✅ Query de profesionales mejorado con COALESCE y datos de pagos');