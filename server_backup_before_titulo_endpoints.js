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

// ==================== INICIAR SERVIDOR ====================

app.listen(port, () => {
    console.log('🚀 Servidor COPIG ejecutándose en puerto', port);
    console.log('📊 Dashboard disponible en: http://localhost:3030/dashboard');
    console.log('🛡️  Panel administrativo disponible en: http://localhost:3030/admin');
    console.log('🌐 Portal unificado disponible en: http://localhost:3030/portal');
    console.log('🏢 Gestión de empresas disponible en: http://localhost:3030/empresas');
    console.log('✅ Sistema COPIG LIMPIO iniciado correctamente');
});
