const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');
const config = require('./config.json');

const app = express();
const port = 3030;

// Configuración de base de datos
const pool = new Pool(config.database);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Headers anti-caché para archivos HTML críticos
app.use((req, res, next) => {
    // Aplicar headers anti-caché solo a archivos HTML del admin
    if (req.path.includes('admin') && req.path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

app.use(session({
    secret: 'copig-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware de autenticación
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'No autorizado' });
}

function requirePermission(resource, action) {
    return (req, res, next) => {
        if (!req.session?.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        
        const user = req.session.user;
        
        // Super admin tiene todos los permisos
        if (user.role === 'super_admin') {
            console.log(`🔑 Super admin acceso otorgado para: ${resource}:${action}`);
            return next();
        }
        
        // Staff y admin tienen permisos de lectura/escritura
        if (user.role === 'admin' || user.role === 'staff') {
            return next();
        }
        
        res.status(403).json({ error: 'Acceso denegado' });
    };
}

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Login unificado
app.post('/api/unified-login', async (req, res) => {
    try {
        const { dni, password } = req.body;
        console.log('🔍 UNIFIED LOGIN ATTEMPT:', { dni, password: password ? '[HIDDEN]' : 'NO_PASSWORD' });

        // 1. Verificar super admin hardcodeado
        if (dni === '20562024' && password === 'ansiktet1969') {
            const superAdmin = {
                id: 'super_admin',
                username: 'Super Admin',
                email: 'admin@copig.com',
                role: 'super_admin',
                dni: '20562024'
            };
            
            req.session.user = superAdmin;
            console.log('🔑 Super admin autenticado');
            return res.json({
                success: true,
                user: superAdmin,
                redirectTo: '/admin'
            });
        }

        // 2. Verificar en tabla admin_users (staff/admins)
        const adminQuery = `
            SELECT id, username, email, role, password, active as activo, documento as dni
            FROM copig.admin_users 
            WHERE documento = $1 OR username = $1
        `;
        const adminResult = await pool.query(adminQuery, [dni]);
        
        if (adminResult.rows.length > 0) {
            const adminUser = adminResult.rows[0];
            
            if (!adminUser.activo) {
                return res.status(401).json({ error: 'Usuario desactivado' });
            }
            
            // Verificar contraseña (puede estar hasheada o en texto plano)
            let passwordValid = false;
            if (adminUser.password) {
                if (adminUser.password.startsWith('$2')) {
                    passwordValid = await bcrypt.compare(password, adminUser.password);
                } else {
                    passwordValid = (password === adminUser.password);
                }
            }
            
            if (passwordValid) {
                const sessionUser = {
                    id: adminUser.id,
                    username: adminUser.username,
                    email: adminUser.email,
                    role: adminUser.role,
                    dni: adminUser.dni
                };
                
                req.session.user = sessionUser;
                console.log(`🔑 Usuario ${adminUser.role} autenticado: ${adminUser.username}`);
                return res.json({
                    success: true,
                    user: sessionUser,
                    redirectTo: '/admin'
                });
            }
        }

        // 3. Verificar en tabla profesionales
        const profesionalQuery = `
            SELECT p.id, p.nombre as username, p.email, p.numero_documento as dni,
                   pa.password, p.activo
            FROM copig.profesionales p
            LEFT JOIN copig.profesionales_auth pa ON p.id = pa.profesional_id
            WHERE p.numero_documento::TEXT = $1
        `;
        const profesionalResult = await pool.query(profesionalQuery, [dni]);
        
        if (profesionalResult.rows.length > 0) {
            const profesional = profesionalResult.rows[0];
            
            if (!profesional.activo) {
                return res.status(401).json({ error: 'Profesional desactivado' });
            }
            
            // Verificar contraseña
            let passwordValid = false;
            if (profesional.password) {
                if (profesional.password.startsWith('$2')) {
                    passwordValid = await bcrypt.compare(password, profesional.password);
                } else {
                    passwordValid = (password === profesional.password);
                }
            } else {
                // Si no tiene contraseña en profesionales_auth, usar DNI como contraseña
                passwordValid = (password === dni);
            }
            
            if (passwordValid) {
                const sessionUser = {
                    id: profesional.id,
                    username: profesional.username,
                    email: profesional.email,
                    role: 'profesional',
                    dni: profesional.dni
                };
                
                req.session.user = sessionUser;
                req.session.profesionalId = profesional.id;
                req.session.userType = 'profesional';
                
                console.log(`🔑 Profesional autenticado: ${profesional.username}`);
                return res.json({
                    success: true,
                    user: sessionUser,
                    redirectTo: '/portal-profesional'
                });
            }
        }

        console.log('❌ Credenciales inválidas para DNI:', dni);
        res.status(401).json({ error: 'DNI o contraseña incorrectos' });
        
    } catch (error) {
        console.error('❌ Error en login unificado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINTS DE AUTENTICACIÓN ====================

// Endpoint para verificar status de autenticación (requerido por portal-profesional.html)
app.get('/api/admin/auth/status', (req, res) => {
    try {
        if (req.session && req.session.user) {
            // Usuario autenticado
            res.json({
                authenticated: true,
                user: {
                    id: req.session.user.id,
                    role: req.session.user.role,
                    username: req.session.user.username || req.session.user.nombre,
                    dni: req.session.user.dni || req.session.user.numero_documento,
                    nombre: req.session.user.nombre
                }
            });
        } else {
            // Usuario no autenticado
            res.json({
                authenticated: false,
                user: null
            });
        }
    } catch (error) {
        console.error('Error en auth/status:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ==================== ENDPOINTS DE DATOS ====================

// Obtener profesionales
app.get('/api/admin/profesionales', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando profesionales...');
        
        const buscar = req.query.buscar || '';
        const estado = req.query.estado || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const offset = (page - 1) * limit;
        
        console.log(`📋 Búsqueda: "${buscar}", Estado: "${estado}", página: ${page}`);
        
        let whereClause = 'WHERE p.activo = true';
        let params = [];
        let paramCount = 0;
        
        if (buscar.trim()) {
            paramCount++;
            whereClause += ` AND (p.nombre ILIKE $${paramCount} OR p.numero_documento::TEXT ILIKE $${paramCount} OR m.numero_matricula::TEXT ILIKE $${paramCount})`;
            params.push(`%${buscar.trim()}%`);
        }
        
        if (estado.trim()) {
            paramCount++;
            whereClause += ` AND calcular_estado_profesional(m.numero_matricula::TEXT) = $${paramCount}`;
            params.push(estado.trim());
        }
        
        // Query de datos
        const dataQuery = `
            SELECT 
                p.id, 
                COALESCE(p.numero_documento::TEXT, 'Sin DNI') as dni, 
                p.nombre, 
                COALESCE(p.email, 'Sin email') as email,
                COALESCE(m.numero_matricula::TEXT, 'Sin matrícula') as matricula,
                COALESCE(m.categoria, 'N/A') as categoria,
                COALESCE(m.fecha_inscripcion::TEXT, 'No disponible') as fecha_inscripcion,
                p.activo,
                CASE 
                    WHEN MAX(ph.fecha_pago) IS NULL THEN 'Sin pagos'
                    WHEN EXTRACT(YEAR FROM MAX(ph.fecha_pago)) < 1950 OR EXTRACT(YEAR FROM MAX(ph.fecha_pago)) > 2030 THEN 'Sin pagos'
                    ELSE TO_CHAR(MAX(ph.fecha_pago), 'DD/MM/YYYY')
                END as ultimo_pago,
                COALESCE(calcular_estado_profesional(m.numero_matricula::TEXT), 'SIN_MATRICULA') as estado_matricula
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            ${whereClause}
            GROUP BY p.id, p.numero_documento, p.nombre, p.email, m.numero_matricula, m.categoria, m.fecha_inscripcion, p.activo
            ORDER BY p.nombre 
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        // Query de conteo
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ${whereClause}
        `;
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const totalProfesionales = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalProfesionales / limit);
        
        console.log(`✅ [ADMIN] Encontrados ${dataResult.rows.length} profesionales de ${totalProfesionales} total`);
        
        res.json({
            success: true,
            profesionales: dataResult.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_records: totalProfesionales,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error:', error);
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});

// Obtener detalles de un profesional específico
app.get('/api/admin/profesional/:id', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        const profesionalId = parseInt(req.params.id);
        console.log(`🔍 [ADMIN] Consultando detalles del profesional ID: ${profesionalId}`);
        
        const detailsQuery = `
            SELECT 
                p.id,
                p.numero_documento as dni,
                p.nombre,
                p.email,
                p.telefono,
                p.celular,
                p.domicilio,
                p.fecha_nacimiento,
                p.sexo,
                p.estado_civil,
                p.nacionalidad,
                p.provincia,
                p.cuit,
                p.activo,
                p.created_at,
                m.numero_matricula,
                m.categoria,
                m.fecha_inscripcion,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_matricula,
                t.descripcion as titulo_profesional,
                COUNT(ph.id) as total_pagos,
                COALESCE(MAX(ph.fecha_pago), NULL) as ultimo_pago,
                COALESCE(SUM(ph.importe), 0) as total_pagado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.id = $1
            GROUP BY p.id, p.numero_documento, p.nombre, p.email, p.telefono, p.celular, 
                     p.domicilio, p.fecha_nacimiento, p.sexo, p.estado_civil, p.nacionalidad,
                     p.provincia, p.cuit, p.activo, p.created_at, m.numero_matricula, m.categoria, 
                     m.fecha_inscripcion, m.estado, t.descripcion
        `;
        
        const result = await pool.query(detailsQuery, [profesionalId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Profesional no encontrado' 
            });
        }
        
        const profesional = result.rows[0];
        
        // También obtener los últimos 10 pagos
        const pagosQuery = `
            SELECT 
                ph.fecha_pago,
                ph.importe,
                ph.concepto,
                ph.detalle,
                ph.estado
            FROM copig.pagos_historicos ph
            LEFT JOIN copig.matriculas m ON m.numero_matricula::TEXT = ph.matricula
            WHERE m.profesional_id = $1
            ORDER BY ph.fecha_pago DESC
            LIMIT 10
        `;
        
        const pagosResult = await pool.query(pagosQuery, [profesionalId]);
        
        console.log(`✅ [ADMIN] Detalles obtenidos para profesional ${profesional.nombre}`);
        
        res.json({
            success: true,
            profesional: {
                ...profesional,
                titulo: profesional.titulo_profesional, // Mapear para compatibilidad con frontend
                ultimo_pago: profesional.ultimo_pago ? 
                    profesional.ultimo_pago.toLocaleDateString('es-AR') : 
                    'Sin pagos',
                fecha_nacimiento: profesional.fecha_nacimiento ? 
                    profesional.fecha_nacimiento.toLocaleDateString('es-AR') : 
                    null,
                fecha_inscripcion: profesional.fecha_inscripcion ? 
                    profesional.fecha_inscripcion.toLocaleDateString('es-AR') : 
                    null,
                created_at: profesional.created_at.toLocaleString('es-AR')
            },
            pagos_recientes: pagosResult.rows.map(pago => ({
                ...pago,
                fecha_pago: (pago.fecha_pago && !isNaN(new Date(pago.fecha_pago).getTime())) ? 
                    pago.fecha_pago.toLocaleDateString('es-AR') : 
                    'Sin fecha',
                importe: parseFloat(pago.importe)
            }))
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo detalles:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error obteniendo detalles del profesional' 
        });
    }
});

// Obtener empresas
app.get('/api/empresas', requirePermission('empresas', 'read'), async (req, res) => {
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
            whereClause += ` AND (razon_social ILIKE $${paramCount} OR cuit ILIKE $${paramCount})`;
            params.push(`%${buscar.trim()}%`);
        }
        
        if (estado && estado !== 'todos') {
            paramCount++;
            whereClause += ` AND activo = $${paramCount}`;
            params.push(estado === 'activo');
        }
        
        // Query de datos
        const dataQuery = `
            SELECT id, razon_social, cuit, email, telefono, domicilio, 
                   localidad, departamento, codigo_postal, activo,
                   fecha_creacion, fecha_actualizacion, observaciones
            FROM copig.empresas 
            ${whereClause}
            ORDER BY razon_social 
            LIMIT ${limitNum} OFFSET ${offset}
        `;
        
        // Query de conteo
        const countQuery = `SELECT COUNT(*) as total FROM copig.empresas ${whereClause}`;
        
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limitNum);
        
        console.log(`✅ Encontradas ${dataResult.rows.length} empresas de ${total} total`);
        
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
        res.status(500).json({ error: 'Error obteniendo empresas' });
    }
});

// Endpoint para obtener una empresa específica por ID
app.get('/api/empresas/:id', requirePermission('empresas', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Obteniendo empresa con ID: ${id}`);
        
        // Obtener datos básicos de la empresa
        const result = await pool.query(`
            SELECT id, razon_social, cuit, email, telefono, domicilio, 
                   localidad, departamento, codigo_postal, activo,
                   fecha_creacion, fecha_actualizacion, observaciones
            FROM copig.empresas 
            WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            console.log(`❌ Empresa con ID ${id} no encontrada`);
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        const empresa = result.rows[0];
        
        // Obtener representantes técnicos
        const representantesResult = await pool.query(`
            SELECT rt.id, rt.profesional_id, rt.es_profesional_externo,
                   rt.documento_externo, rt.nombre_externo, rt.titulo_externo,
                   rt.categoria_representacion, rt.fecha_inicio, rt.fecha_fin, rt.activo,
                   COALESCE(p.nombre, rt.nombre_externo) as profesional_nombre,
                   m.numero_matricula
            FROM copig.representantes_tecnicos rt
            LEFT JOIN copig.profesionales p ON rt.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE rt.empresa_id = $1
            ORDER BY rt.fecha_inicio DESC
        `, [id]);
        
        empresa.representantes_tecnicos = representantesResult.rows;
        
        console.log(`✅ Empresa encontrada: ${empresa.razon_social} con ${empresa.representantes_tecnicos.length} representantes técnicos`);
        res.json(empresa);
        
    } catch (error) {
        console.error(`❌ Error obteniendo empresa ${req.params.id}:`, error);
        res.status(500).json({ error: 'Error obteniendo empresa' });
    }
});

// Endpoint para actualizar una empresa
app.put('/api/empresas/:id', requirePermission('empresas', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const { razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal, activo, observaciones, representante_tecnico_id } = req.body;
        
        console.log(`🔄 Actualizando empresa ID: ${id}`);
        console.log('📝 Datos recibidos:', { razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal, activo });
        
        const result = await pool.query(`
            UPDATE copig.empresas 
            SET razon_social = $1, cuit = $2, email = $3, telefono = $4, 
                domicilio = $5, localidad = $6, departamento = $7, codigo_postal = $8, 
                activo = $9, observaciones = $10, fecha_actualizacion = NOW()
            WHERE id = $11
            RETURNING *
        `, [razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal, activo, observaciones, id]);
        
        if (result.rows.length === 0) {
            console.log(`❌ Empresa con ID ${id} no encontrada para actualizar`);
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        console.log(`✅ Empresa actualizada: ${result.rows[0].razon_social}`);
        
        // Manejar cambio de representante técnico
        if (representante_tecnico_id !== undefined) {
            try {
                // Desactivar representantes técnicos actuales
                await pool.query(`
                    UPDATE copig.representantes_tecnicos 
                    SET activo = false, fecha_fin = NOW()
                    WHERE empresa_id = $1 AND activo = true
                `, [id]);
                
                // Si se especificó un nuevo representante técnico, asignarlo como profesional externo
                if (representante_tecnico_id && representante_tecnico_id !== '') {
                    await pool.query(`
                        INSERT INTO copig.representantes_tecnicos 
                        (empresa_id, es_profesional_externo, nombre_externo, categoria_representacion, fecha_inicio, activo)
                        VALUES ($1, true, $2, 'A', NOW(), true)
                    `, [id, representante_tecnico_id.trim()]);
                    
                    console.log(`✅ Representante técnico actualizado: "${representante_tecnico_id}" → Empresa ${id}`);
                } else {
                    console.log(`✅ Representantes técnicos removidos para empresa ${id}`);
                }
            } catch (rtError) {
                console.error('⚠️ Error actualizando representante técnico:', rtError);
                // No fallar la actualización de empresa por error en RT
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Empresa actualizada exitosamente', 
            empresa: result.rows[0] 
        });
        
    } catch (error) {
        console.error(`❌ Error actualizando empresa ${req.params.id}:`, error);
        res.status(500).json({ error: 'Error actualizando empresa' });
    }
});

// Endpoint para eliminar una empresa
app.delete('/api/empresas/:id', requirePermission('empresas', 'delete'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Eliminando empresa con ID: ${id}`);
        
        // Eliminar representantes técnicos asociados primero
        const representantesResult = await pool.query(`
            DELETE FROM copig.representantes_tecnicos 
            WHERE empresa_id = $1
            RETURNING id
        `, [id]);
        
        if (representantesResult.rows.length > 0) {
            console.log(`🗑️ Eliminados ${representantesResult.rows.length} representantes técnicos de empresa ${id}`);
        }
        
        const result = await pool.query(`
            DELETE FROM copig.empresas 
            WHERE id = $1
            RETURNING razon_social
        `, [id]);
        
        if (result.rows.length === 0) {
            console.log(`❌ Empresa con ID ${id} no encontrada para eliminar`);
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        console.log(`✅ Empresa eliminada: ${result.rows[0].razon_social}`);
        res.json({ 
            success: true, 
            message: 'Empresa eliminada exitosamente' 
        });
        
    } catch (error) {
        console.error(`❌ Error eliminando empresa ${req.params.id}:`, error);
        res.status(500).json({ error: 'Error eliminando empresa' });
    }
});

// Endpoint para crear nueva empresa
app.post('/api/empresas', requirePermission('empresas', 'write'), async (req, res) => {
    try {
        const { razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal, observaciones, representante_tecnico_id } = req.body;
        
        console.log('➕ Creando nueva empresa:', razon_social);
        console.log('📝 Datos recibidos:', { razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal });
        
        if (!razon_social || !cuit) {
            return res.status(400).json({ error: 'Razón social y CUIT son obligatorios' });
        }
        
        // Verificar que el CUIT no exista
        const existeResult = await pool.query(`
            SELECT id FROM copig.empresas WHERE cuit = $1
        `, [cuit]);
        
        if (existeResult.rows.length > 0) {
            console.log(`⚠️ CUIT ${cuit} ya existe`);
            return res.status(400).json({ error: 'El CUIT ya existe en el sistema' });
        }
        
        const result = await pool.query(`
            INSERT INTO copig.empresas 
            (razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal, observaciones, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
            RETURNING *
        `, [razon_social, cuit, email, telefono, domicilio, localidad, departamento, codigo_postal, observaciones]);
        
        const empresaId = result.rows[0].id;
        console.log(`✅ Empresa creada con ID: ${empresaId}`);
        
        // Si se especificó un representante técnico, asignarlo como profesional externo
        if (representante_tecnico_id && representante_tecnico_id !== '') {
            try {
                await pool.query(`
                    INSERT INTO copig.representantes_tecnicos 
                    (empresa_id, es_profesional_externo, nombre_externo, categoria_representacion, fecha_inicio, activo)
                    VALUES ($1, true, $2, 'A', NOW(), true)
                `, [empresaId, representante_tecnico_id.trim()]);
                
                console.log(`✅ Representante técnico asignado: "${representante_tecnico_id}" → Empresa ${empresaId}`);
            } catch (rtError) {
                console.error('⚠️ Error asignando representante técnico:', rtError);
                // No fallar la creación de empresa por error en RT
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Empresa creada exitosamente', 
            empresa: result.rows[0] 
        });
        
    } catch (error) {
        console.error('❌ Error creando empresa:', error);
        res.status(500).json({ error: 'Error creando empresa' });
    }
});

// ========================================
// ENDPOINTS CHP COMPLETOS
// ========================================

// Crear nueva solicitud CHP
app.post('/api/chp/create', async (req, res) => {
  try {
    console.log('🆕 Creando solicitud CHP...');
    console.log('📋 Datos recibidos:', req.body);
    console.log('👤 Sesión:', req.session);
    
    const { comitente, proyecto, descripcion, ubicacion_obra } = req.body;
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    // Generar número único
    const year = new Date().getFullYear();
    const nextNum = await pool.query('SELECT nextval(\'copig.chp_numero_seq\') as numero');
    const numero_solicitud = `CHP-${year}-${nextNum.rows[0].numero}`;
    
    // Insertar solicitud (usando nombres de columnas correctos)
    const result = await pool.query(`
      INSERT INTO copig.solicitudes_chp 
      (profesional_id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra, estado, fecha_solicitud)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE', NOW())
      RETURNING *
    `, [profesional_id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra]);
    
    console.log('✅ Solicitud creada:', result.rows[0]);
    
    res.json({
      success: true,
      solicitud: result.rows[0],
      message: `Solicitud ${numero_solicitud} creada exitosamente`
    });
    
  } catch (error) {
    console.error('❌ Error creando solicitud CHP:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Listar solicitudes del profesional
app.get('/api/profesional/solicitudes-chp', async (req, res) => {
  try {
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    const result = await pool.query(`
      SELECT * FROM copig.solicitudes_chp 
      WHERE profesional_id = $1 
      ORDER BY fecha_solicitud DESC
    `, [profesional_id]);
    
    res.json({ 
      success: true, 
      solicitudes: result.rows 
    });
    
  } catch (error) {
    console.error('❌ Error listando solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Listar todas las solicitudes (admin)
app.get('/api/admin/solicitudes-chp', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.nombre as profesional_nombre, m.numero_matricula
      FROM copig.solicitudes_chp s
      LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
      LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
      ORDER BY s.fecha_solicitud DESC NULLS LAST
    `);
    
    res.json({ 
      success: true, 
      solicitudes: result.rows 
    });
    
  } catch (error) {
    console.error('❌ Error listando solicitudes (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener solicitud CHP específica (admin)
app.get('/api/admin/solicitudes-chp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT s.*, p.nombre as profesional_nombre, m.numero_matricula
      FROM copig.solicitudes_chp s
      LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
      LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    res.json({ 
      success: true, 
      solicitud: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo solicitud específica:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar estado de solicitud (admin)
app.put('/api/admin/solicitud-chp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones, motivo_rechazo } = req.body;
    const aprobado_por = req.session?.userId;
    
    const result = await pool.query(`
      UPDATE copig.solicitudes_chp 
      SET estado = $1, 
          observaciones = $2, 
          motivo_rechazo = $3,
          aprobado_por = $4,
          fecha_actualizacion = NOW()
      WHERE id = $5
      RETURNING *
    `, [estado, observaciones, motivo_rechazo, aprobado_por, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }
    
    res.json({
      success: true,
      solicitud: result.rows[0],
      message: `Solicitud ${estado.toLowerCase()} exitosamente`
    });
    
  } catch (error) {
    console.error('❌ Error actualizando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Debug de sesión
app.get('/api/session-info', (req, res) => {
  res.json({
    session: req.session,
    profesionalId: req.session?.profesionalId,
    userType: req.session?.userType,
    sessionID: req.sessionID
  });
});

// ========================================
// ENDPOINTS PARA FACTURAS DEL PROFESIONAL
// ========================================

// Obtener facturas del profesional logueado
app.get('/api/profesional/facturas', async (req, res) => {
  try {
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    console.log('💳 Obteniendo facturas para profesional:', profesional_id);
    
    const result = await pool.query(`
      SELECT 
        f.*,
        s.numero_solicitud,
        s.proyecto,
        s.comitente,
        s.descripcion as solicitud_descripcion,
        (SELECT COUNT(*) FROM copig.pagos_chp p WHERE p.factura_id = f.id AND p.estado = 'VERIFICADO') as pagos_verificados
      FROM copig.facturas_chp f
      JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
      WHERE s.profesional_id = $1
      ORDER BY f.fecha_emision DESC
    `, [profesional_id]);
    
    console.log(`📊 Facturas encontradas: ${result.rows.length}`);
    
    res.json({ 
      success: true, 
      facturas: result.rows 
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo facturas profesional:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener detalle de una factura específica
app.get('/api/profesional/factura/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    console.log('🔍 Obteniendo detalle factura:', id);
    
    const result = await pool.query(`
      SELECT 
        f.*,
        s.numero_solicitud,
        s.proyecto,
        s.comitente,
        s.descripcion as solicitud_descripcion,
        s.ubicacion_obra,
        p.nombre as profesional_nombre,
        m.numero_matricula
      FROM copig.facturas_chp f
      JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
      JOIN copig.profesionales p ON s.profesional_id = p.id
      JOIN copig.matriculas m ON p.id = m.profesional_id
      WHERE f.id = $1 AND s.profesional_id = $2
    `, [id, profesional_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada o no tiene permisos'
      });
    }
    
    // Obtener pagos realizados para esta factura
    const pagos = await pool.query(`
      SELECT * FROM copig.pagos_chp 
      WHERE factura_id = $1 
      ORDER BY fecha_pago DESC
    `, [id]);
    
    const factura = result.rows[0];
    factura.pagos = pagos.rows;
    
    res.json({
      success: true,
      factura: factura
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo detalle factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Registrar un pago (subir comprobante)
app.post('/api/profesional/pago', async (req, res) => {
  try {
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    const { factura_id, monto, metodo_pago, numero_transaccion, datos_pago_extra } = req.body;
    
    console.log('💰 Registrando pago:', { factura_id, monto, metodo_pago });
    
    // Verificar que la factura pertenece al profesional
    const facturaCheck = await pool.query(`
      SELECT f.*, s.profesional_id 
      FROM copig.facturas_chp f
      JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
      WHERE f.id = $1 AND s.profesional_id = $2
    `, [factura_id, profesional_id]);
    
    if (facturaCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    // Registrar el pago
    const nuevoPago = await pool.query(`
      INSERT INTO copig.pagos_chp (
        factura_id, monto, metodo_pago, numero_transaccion, 
        datos_pago_extra, estado
      ) VALUES ($1, $2, $3, $4, $5, 'PENDIENTE')
      RETURNING *
    `, [factura_id, monto, metodo_pago, numero_transaccion, datos_pago_extra]);
    
    // Crear notificación para el staff
    await pool.query(`
      INSERT INTO copig.notificaciones_chp (
        solicitud_id, profesional_id, tipo, titulo, mensaje
      ) VALUES (
        (SELECT solicitud_id FROM copig.facturas_chp WHERE id = $1),
        $2, 'PAGO_RECIBIDO', 
        '💰 Pago Recibido', 
        'Se ha recibido un pago por $' || $3 || ' via ' || $4 || '. Verificar en panel administrativo.'
      )
    `, [factura_id, profesional_id, monto, metodo_pago]);
    
    console.log('✅ Pago registrado exitosamente');
    
    res.json({
      success: true,
      pago: nuevoPago.rows[0],
      message: 'Pago registrado exitosamente. Será verificado por el staff.'
    });
    
  } catch (error) {
    console.error('❌ Error registrando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener notificaciones del profesional
app.get('/api/profesional/notificaciones', async (req, res) => {
  try {
    const profesional_id = req.session?.profesionalId;
    
    if (!profesional_id) {
      return res.status(401).json({ 
        success: false, 
        message: 'No hay sesión de profesional activa' 
      });
    }
    
    const result = await pool.query(`
      SELECT * FROM copig.notificaciones_profesional
      WHERE profesional_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [profesional_id]);
    
    res.json({ 
      success: true, 
      notificaciones: result.rows,
      no_leidas: result.rows.filter(n => !n.leida).length
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Marcar notificación como leída
app.put('/api/profesional/notificacion/:id/leida', async (req, res) => {
  try {
    const { id } = req.params;
    const profesional_id = req.session?.profesionalId;
    
    await pool.query(`
      UPDATE copig.notificaciones_profesional 
      SET leida = TRUE, fecha_leida = NOW()
      WHERE id = $1 AND profesional_id = $2
    `, [id, profesional_id]);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Error marcando notificación:', error);
    res.status(500).json({ success: false });
  }
});

// ==================== RUTAS DE ARCHIVOS ESTÁTICOS ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    console.log('🔍 Acceso a /admin - Sesión:', req.session.user ? 'EXISTE' : 'NO_EXISTE');
    if (req.session.user) {
        console.log('👤 Usuario en sesión:', req.session.user);
    }
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/empresas', (req, res) => {
    res.sendFile(path.join(__dirname, 'empresas.html'));
});

app.get('/portal-profesional', (req, res) => {
    res.sendFile(path.join(__dirname, 'portal-profesional.html'));
});

app.get('/chp-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'chp_admin_complete_interface.html'));
});

// ==================== INICIAR SERVIDOR ====================

app.listen(port, () => {
    console.log('🚀 Servidor COPIG ejecutándose en puerto', port);
    console.log('📊 Dashboard disponible en: http://localhost:3030/dashboard');
    console.log('🛡️  Panel administrativo disponible en: http://localhost:3030/admin');
    console.log('🌐 Portal unificado disponible en: http://localhost:3030/portal');
    console.log('🏢 Gestión de empresas disponible en: http://localhost:3030/empresas');
    console.log('✅ Sistema COPIG LIMPIO iniciado correctamente');
});
