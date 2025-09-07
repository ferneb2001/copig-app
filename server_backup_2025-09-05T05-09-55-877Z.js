const express = require('express');
const multer = require('multer');
const path = require('path');

// Configuración multer para documentos CHP
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads', 'chp', req.params.categoria || 'general');
        
        // Crear carpeta si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Nombre único: timestamp_originalname
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${timestamp}_${baseName}${extension}`);
    }
});

// Filtro para solo permitir PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    }
});

const { Pool } = require('pg');
const bcrypt_25 = require('bcryptjs');
const fs = require('fs');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3030;

// Cargar configuración
const config = require('./config.json');

// Configuración de la base de datos
const pool = new Pool({
    user: config.database.user,
    host: config.database.host,
    database: config.database.database,
    password: config.database.password,
    port: config.database.port,
});

// Configuración de sesiones
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'admin_sessions',
        schemaName: 'copig'
    }),
    secret: process.env.SESSION_SECRET || 'copig-admin-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Endpoint temprano para crear solicitud CHP (antes de otros middlewares que puedan interferir)
app.post('/api/chp/create', express.json(), async (req, res) => {
    try {
        const { comitente, proyecto, descripcion, ubicacion_obra, observaciones, monto_honorarios, costo } = req.body;
        const profesional_id_1 = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado - Sin sesión de profesional' });
        }
        
        // Generar número de solicitud
        const numeroResult_87 = await pool.query(`
            SELECT 'CHP-' || TO_CHAR(NOW(), 'YYYY') || '-' || nextval('copig.chp_numero_seq')::text as numero
        `);
        const numero_solicitud_88 = numeroResult.rows[0].numero;
        
        // Calcular costo dinámicamente si no se proporcionó
        let costoFinal = costo;
        if (!costoFinal && monto_honorarios) {
            const arancelCalculado_2 = await calcularArancelDinamico(monto_honorarios);
            costoFinal = arancelCalculado ? arancelCalculado.arancel : 0;
        }
        
        // Determinar estado inicial: si hay costo, requiere pago
        const estado_inicial = costoFinal && costoFinal > 0 ? 'PENDIENTE_PAGO' : 'PENDIENTE';
        
        // Insertar solicitud
        const result_3 = await pool.query(`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra, 
             observaciones, tipo_solicitud, monto_honorarios, costo, estado, pagado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'CERTIFICADO', $8, $9, $10, false)
            RETURNING *
        `, [profesional_id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra, 
            observaciones, monto_honorarios, costoFinal, estado_inicial]);
        
        console.log('✅ Solicitud CHP creada:', numero_solicitud, `- Costo: $${costoFinal}`);
        
        res.json({ 
            success: true, 
            message: 'Solicitud creada exitosamente',
            numeroSolicitud: numero_solicitud,
            costo: costoFinal,
            estado: estado_inicial,
            solicitud: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando solicitud CHP:', error);
        res.status(500).json({ success: false, message: 'Error al crear la solicitud: ' + error.message });
    }
});

// Endpoint para actualizar una solicitud CHP
app.put('/api/profesional/solicitud-chp/:id', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const { comitente, proyecto, descripcion, ubicacion_obra, observaciones, monto_honorarios } = req.body;
        const profesional_id_5 = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        // Verificar que la solicitud pertenece al profesional y está en estado modificable
        const checkResult_73 = await pool.query(`
            SELECT estado FROM copig.solicitudes_chp 
            WHERE id = $1 AND profesional_id = $2
        `, [id, profesional_id]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        
        const estadoActual = checkResult.rows[0].estado;
        if (!['PENDIENTE', 'OBSERVADO', 'PENDIENTE_PAGO'].includes(estadoActual)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Solo se pueden modificar solicitudes en estado PENDIENTE u OBSERVADO' 
            });
        }
        
        // Calcular nuevo costo si cambió el monto de honorarios
        let nuevoCosto = null;
        if (monto_honorarios) {
            const arancelCalculado = await calcularArancelDinamico(monto_honorarios);
            nuevoCosto = arancelCalculado ? arancelCalculado.arancel : 0;
        }
        
        // Determinar nuevo estado: si hay costo, requiere pago
        let nuevoEstado = estadoActual;
        if (nuevoCosto !== null) {
            nuevoEstado = nuevoCosto > 0 ? 'PENDIENTE_PAGO' : 'PENDIENTE';
        }
        
        // Actualizar solicitud
        const result_4 = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET comitente = $1, proyecto = $2, descripcion = $3, ubicacion_obra = $4, 
                observaciones = $5, monto_honorarios = $6, costo = COALESCE($7, costo),
                estado = $8, fecha_actualizacion = NOW()
            WHERE id = $9 AND profesional_id = $10
            RETURNING *
        `, [comitente, proyecto, descripcion, ubicacion_obra, observaciones, 
            monto_honorarios, nuevoCosto, nuevoEstado, id, profesional_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Error al actualizar la solicitud' });
        }
        
        console.log('✅ Solicitud CHP actualizada:', id, `- Nuevo costo: $${nuevoCosto || 'sin cambios'}`);
        
        res.json({ 
            success: true, 
            message: 'Solicitud actualizada exitosamente',
            solicitud: result.rows[0],
            nuevoCosto: nuevoCosto
        });
        
    } catch (error) {
        console.error('Error actualizando solicitud CHP:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la solicitud: ' + error.message });
    }
});

// Endpoint para obtener aranceles vigentes
app.get('/api/aranceles-chp', async (req, res) => {
    try {
        const result_6 = await pool.query(`
            SELECT segmento, nombre_segmento, monto_desde, monto_hasta, arancel,
                   fecha_vigencia_desde, fecha_vigencia_hasta,
                   porcentaje_fijo, usar_porcentaje_fijo
            FROM copig.aranceles_chp 
            WHERE activo = true 
            AND (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURRENT_DATE)
            ORDER BY monto_desde
        `);
        
        res.json({ success: true, aranceles: result.rows });
    } catch (error) {
        console.error('Error obteniendo aranceles:', error);
        res.status(500).json({ success: false, message: 'Error al obtener aranceles' });
    }
});

// Endpoint para obtener detalle de una solicitud específica
app.get('/api/profesional/solicitud-chp/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const profesional_id_86 = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result_7 = await pool.query(`
            SELECT s.*, p.nombre as profesional_nombre
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            WHERE s.id = $1 AND s.profesional_id = $2
        `, [id, profesional_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        
        res.json({ success: true, solicitud: result.rows[0] });
        
    } catch (error) {
        console.error('Error obteniendo detalle solicitud:', error);
        res.status(500).json({ success: false, message: 'Error al obtener detalles' });
    }
});

// Endpoints admin para gestionar aranceles
app.get('/api/admin/aranceles-chp', async (req, res) => {
    try {
        const result_8 = await pool.query(`
            SELECT * FROM copig.aranceles_chp 
            ORDER BY activo DESC, monto_desde ASC
        `);
        res.json({ success: true, aranceles: result.rows });
    } catch (error) {
        console.error('Error obteniendo aranceles admin:', error);
        res.status(500).json({ success: false, message: 'Error al obtener aranceles' });
    }
});

app.put('/api/admin/arancel-chp/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { segmento, nombre_segmento, monto_desde, monto_hasta, arancel, 
                fecha_vigencia_desde, fecha_vigencia_hasta, activo, observaciones,
                porcentaje_fijo, usar_porcentaje_fijo } = req.body;
        
        const result_9 = await pool.query(`
            UPDATE copig.aranceles_chp 
            SET segmento = $1, nombre_segmento = $2, monto_desde = $3, monto_hasta = $4,
                arancel = $5, fecha_vigencia_desde = $6, fecha_vigencia_hasta = $7,
                activo = $8, observaciones = $9, porcentaje_fijo = $10, 
                usar_porcentaje_fijo = $11, updated_at = NOW()
            WHERE id = $12
            RETURNING *
        `, [segmento, nombre_segmento, monto_desde, monto_hasta, arancel,
            fecha_vigencia_desde, fecha_vigencia_hasta, activo, observaciones,
            porcentaje_fijo, usar_porcentaje_fijo, id]);
        
        console.log('✅ Arancel actualizado:', id);
        res.json({ success: true, arancel: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando arancel:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar arancel' });
    }
});

// Función para calcular arancel basado en honorarios
async function calcularArancelDinamico(montoHonorarios) {
    try {
        const result_10 = await pool.query(`
            SELECT segmento, arancel, nombre_segmento, porcentaje_fijo, usar_porcentaje_fijo
            FROM copig.aranceles_chp 
            WHERE activo = true 
            AND (fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= CURRENT_DATE)
            AND monto_desde <= $1 
            AND (monto_hasta IS NULL OR monto_hasta >= $1)
            ORDER BY monto_desde DESC
            LIMIT 1
        `, [montoHonorarios]);
        
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error calculando arancel:', error);
        return null;
    }
}

app.use('/assets', express.static('assets'));

// ========================================
// SOLO FUNCIONALIDADES CORE DE COPIG
// ========================================

// Servir archivos HTML principales - Login unificado como página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
    console.log('🔍 Acceso a /admin - Sesión:', req.session.user ? 'EXISTE' : 'NO EXISTE');
    if (req.session.user) {
        console.log('👤 Usuario en sesión:', req.session.user);
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        console.log('🚫 Redirigiendo a login unificado');
        res.redirect('/');
    }
});

// Ruta de prueba SIN autenticación
app.get('/admin-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin/login', (req, res) => {
    // Redirigir al login unificado con mensaje específico
    console.log('🔄 Redirigiendo /admin/login a login unificado');
    res.redirect('/?message=sistema-unificado');
});

app.get('/portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'portal.html'));
});

// Portal profesional con verificación de sesión
app.get('/portal-profesional', (req, res) => {
    console.log('🔍 Acceso a /portal-profesional - Sesión:', req.session.user ? 'EXISTE' : 'NO EXISTE');
    if (req.session.user && req.session.user.role === 'profesional') {
        console.log('👤 Profesional en sesión:', req.session.user.username);
        res.sendFile(path.join(__dirname, 'portal-profesional.html'));
    } else {
        console.log('🚫 Redirigiendo a login - Sin sesión de profesional');
        res.redirect('/');
    }
});

// Página de cambio de contraseña para primer ingreso
app.get('/cambiar-contrasena', (req, res) => {
    console.log('🔍 Acceso a /cambiar-contrasena - Sesión:', req.session.user ? 'EXISTE' : 'NO EXISTE');
    if (req.session.user && req.session.user.requiresPasswordChange) {
        console.log('🔑 Usuario requiere cambio de contraseña:', req.session.user.username);
        res.sendFile(path.join(__dirname, 'cambio-password.html'));
    } else {
        console.log('🚫 Redirigiendo - No requiere cambio de contraseña o sin sesión');
        // Redirigir según el rol del usuario
        if (req.session.user) {
            if (req.session.user.role === 'profesional') {
                res.redirect('/portal-profesional');
            } else {
                res.redirect('/admin');
            }
        } else {
            res.redirect('/');
        }
    }
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/user-management', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-management.html'));
});

app.get('/empresas', (req, res) => {
    res.sendFile(path.join(__dirname, 'empresas.html'));
});

app.get('/pagos', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'pagos.html'));
});

// Middleware de autenticación
// Definición de permisos por rol
const ROLE_PERMISSIONS = {
    'super_admin': {
        admin: ['read', 'write', 'delete', 'manage_users', 'manage_roles', 'system_config'],
        profesional: ['read', 'write', 'delete'],
        empresas: ['read', 'write', 'delete'],
        solicitudes: ['read', 'write', 'approve', 'reject'],
        certificados: ['read', 'write', 'generate']
    },
    'admin_full': {
        admin: ['read', 'write', 'manage_users'],
        profesional: ['read', 'write', 'delete'],
        empresas: ['read', 'write', 'delete'],
        solicitudes: ['read', 'write', 'approve', 'reject'],
        certificados: ['read', 'write', 'generate']
    },
    'admin_partial': {
        profesional: ['read', 'write'],
        empresas: ['read'],
        solicitudes: ['read', 'write'],
        certificados: ['read']
    },
    'profesional': {
        profesional: ['read_own', 'write_own'],
        solicitudes: ['read_own', 'write_own'],
        certificados: ['read_own']
    }
};

// Función para obtener roles y permisos del usuario
async function getUserRoles(userId, userType) {
    try {
        // Caso especial para super_admin - no existe en la base de datos
        if (userId === 'super_admin') {
            return {
                role_type: 'super_admin',
                permissions: ROLE_PERMISSIONS['super_admin'] || {},
                custom_permissions: {}
            };
        }
        
        // Verificar que userId sea un número entero válido
        const numericUserId = parseInt(userId);
        if (isNaN(numericUserId)) {
            console.warn('getUserRoles: userId no es un número válido:', userId);
            const defaultRole_11 = userType === 'admin' ? 'admin_partial' : 'profesional';
            return {
                role_type: defaultRole,
                permissions: ROLE_PERMISSIONS[defaultRole] || {},
                custom_permissions: {}
            };
        }
        
        const result_12 = await pool.query(
            'SELECT role_type, permissions, active FROM copig.user_roles WHERE user_id = $1 AND user_type = $2 AND active = true',
            [numericUserId, userType]
        );
        
        if (result.rows.length === 0) {
            // Si no hay rol asignado, usar rol por defecto
            const defaultRole = userType === 'admin' ? 'admin_partial' : 'profesional';
            return {
                role_type: defaultRole,
                permissions: ROLE_PERMISSIONS[defaultRole] || {},
                custom_permissions: {}
            };
        }
        
        const userRole = result.rows[0];
        const basePermissions = ROLE_PERMISSIONS[userRole.role_type] || {};
        const customPermissions = userRole.permissions || {};
        
        return {
            role_type: userRole.role_type,
            permissions: basePermissions,
            custom_permissions: customPermissions
        };
    } catch (error) {
        console.error('Error obteniendo roles del usuario:', error);
        return {
            role_type: userType === 'admin' ? 'admin_partial' : 'profesional',
            permissions: ROLE_PERMISSIONS[userType === 'admin' ? 'admin_partial' : 'profesional'] || {},
            custom_permissions: {}
        };
    }
}

// Función para verificar permisos
function hasPermission(userPermissions, resource, action) {
    const resourcePermissions = userPermissions.permissions[resource] || [];
    const customResourcePermissions = userPermissions.custom_permissions[resource] || [];
    
    return resourcePermissions.includes(action) || customResourcePermissions.includes(action);
}

// Middleware de autenticación básico
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ error: 'No autorizado' });
    }
}

// Middleware de autenticación específico para profesionales
function requireProfesionalAuth(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'profesional') {
        return next();
    } else {
        return res.status(401).json({ error: 'Acceso denegado - Se requiere sesión de profesional' });
    }
}

// Middleware de autorización basado en roles y permisos
function requirePermission(resource, action) {
    return async (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        
        try {
            const user_51 = req.session.user;
            const userType = user.role === 'profesional' ? 'profesional' : 'admin';
            const userRoles = await getUserRoles(user.id, userType);
            
            // Almacenar información de roles en la request para uso posterior
            req.userRoles = userRoles;
            req.userId = user.id;
            req.userType = userType;
            
            if (hasPermission(userRoles, resource, action)) {
                return next();
            } else {
                return res.status(403).json({ 
                    error: 'Acceso denegado - Permisos insuficientes',
                    required: `${resource}:${action}`,
                    user_role: userRoles.role_type
                });
            }
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
}

// APIs PROFESIONAL - Endpoints para el portal profesional
// ========================================

// Obtener solicitudes CHP del profesional logueado
app.get('/api/profesional/solicitudes-chp', requireProfesionalAuth, async (req, res) => {
    try {
        const profesionalId_13 = req.session.user.id;
        console.log(`🔍 [PROFESIONAL] Consultando solicitudes CHP para profesional ID: ${profesionalId}`);
        
        const result_14 = await pool.query(`
            SELECT 
                id,
                comitente,
                proyecto,
                descripcion,
                tipo_obra,
                estado,
                fecha_solicitud,
                fecha_actualizacion
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1 
            ORDER BY fecha_solicitud DESC
        `, [profesionalId]);
        
        console.log(`✅ [PROFESIONAL] Encontradas ${result.rows.length} solicitudes CHP`);
        res.json({ success: true, solicitudes: result.rows });
        
    } catch (error) {
        console.error('❌ [PROFESIONAL] Error obteniendo solicitudes CHP:', error);
        res.status(500).json({ error: 'Error obteniendo solicitudes CHP' });
    }
});

// Crear nueva solicitud CHP
app.post('/api/profesional/nueva-solicitud', requireProfesionalAuth, async (req, res) => {
    try {
        const profesionalId_15 = req.session.user.id;
        const { comitente, proyecto, descripcion, tipoObra } = req.body;
        
        console.log(`🔍 [PROFESIONAL] Creando nueva solicitud CHP para profesional ID: ${profesionalId}`);
        console.log('📋 Datos:', { comitente, proyecto, descripcion, tipoObra });
        
        // Validar campos requeridos
        if (!comitente || !proyecto || !descripcion || !tipoObra) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        
        const result_16 = await pool.query(`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, comitente, proyecto, descripcion, tipo_obra, estado, fecha_solicitud, fecha_actualizacion)
            VALUES ($1, $2, $3, $4, $5, 'pendiente', NOW(), NOW())
            RETURNING *
        `, [profesionalId, comitente, proyecto, descripcion, tipoObra]);
        
        console.log(`✅ [PROFESIONAL] Solicitud CHP creada con ID: ${result.rows[0].id}`);
        res.json({ 
            success: true, 
            message: 'Solicitud CHP creada exitosamente',
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ [PROFESIONAL] Error creando solicitud CHP:', error);
        res.status(500).json({ error: 'Error creando solicitud CHP' });
    }
});

// Subir documento
app.post('/api/profesional/upload-documento', requireProfesionalAuth, async (req, res) => {
    try {
        const profesionalId_17 = req.session.user.id;
        const { categoria, nombreArchivo, solicitudId } = req.body;
        
        console.log(`🔍 [PROFESIONAL] Upload documento para profesional ID: ${profesionalId}`);
        console.log('📁 Datos:', { categoria, nombreArchivo, solicitudId });
        
        // Validar campos requeridos
        if (!categoria || !nombreArchivo) {
            return res.status(400).json({ error: 'Categoría y nombre de archivo son requeridos' });
        }
        
        // Validar categorías permitidas
        const categoriasPermitidas = ['comprobante_pago', 'planos', 'documentacion_tecnica', 'otros'];
        if (!categoriasPermitidas.includes(categoria)) {
            return res.status(400).json({ error: 'Categoría no válida' });
        }
        
        const result_18 = await pool.query(`
            INSERT INTO copig.documentos_profesional 
            (profesional_id, solicitud_chp_id, categoria, nombre_archivo, fecha_upload)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `, [profesionalId, solicitudId || null, categoria, nombreArchivo]);
        
        console.log(`✅ [PROFESIONAL] Documento subido con ID: ${result.rows[0].id}`);
        res.json({ 
            success: true, 
            message: 'Documento subido exitosamente',
            documento: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ [PROFESIONAL] Error subiendo documento:', error);
        res.status(500).json({ error: 'Error subiendo documento' });
    }
});

// Obtener estado de pagos
app.get('/api/profesional/pagos', requireProfesionalAuth, async (req, res) => {
    try {
        const profesionalId_19 = req.session.user.id;
        console.log(`🔍 [PROFESIONAL] Consultando pagos para profesional ID: ${profesionalId}`);
        
        // Obtener matrícula del profesional
        const profesionalResult_53 = await pool.query(
            'SELECT numero_documento FROM copig.profesionales WHERE id = $1', 
            [profesionalId]
        );
        
        if (profesionalResult.rows.length === 0) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        
        const numeroDocumento = profesionalResult.rows[0].numero_documento;
        
        // Buscar matricula
        const matriculaResult_101 = await pool.query(
            'SELECT numero_matricula FROM copig.matriculas WHERE profesional_id = $1', 
            [profesionalId]
        );
        
        const matricula_65 = matriculaResult.rows.length > 0 ? 
            matriculaResult.rows[0].numero_matricula : numeroDocumento;
        
        // Obtener pagos históricos
        const result_20 = await pool.query(`
            SELECT 
                fecha_pago as fecha,
                detalle as concepto,
                importe,
                numero_recibo,
                'pagado' as estado
            FROM copig.pagos_historicos 
            WHERE matricula = $1 
            ORDER BY fecha_pago DESC
        `, [matricula]);
        
        console.log(`✅ [PROFESIONAL] Encontrados ${result.rows.length} pagos`);
        res.json({
            success: true,
            pagos: result.rows
        });
        
    } catch (error) {
        console.error('❌ [PROFESIONAL] Error obteniendo pagos:', error);
        res.status(500).json({ error: 'Error obteniendo estado de pagos' });
    }
});

// Obtener certificados emitidos
app.get('/api/profesional/certificados', requireProfesionalAuth, async (req, res) => {
    try {
        const profesionalId_24 = req.session.user.id;
        console.log(`🔍 [PROFESIONAL] Consultando certificados para profesional ID: ${profesionalId}`);
        
        const result_21 = await pool.query(`
            SELECT 
                c.id,
                c.numero_certificado as numero,
                s.proyecto,
                s.comitente,
                c.fecha_emision,
                c.estado,
                c.archivo_pdf
            FROM copig.certificados_chp c
            INNER JOIN copig.solicitudes_chp s ON c.solicitud_chp_id = s.id
            WHERE s.profesional_id = $1 
            AND c.estado = 'emitido'
            ORDER BY c.fecha_emision DESC
        `, [profesionalId]);
        
        console.log(`✅ [PROFESIONAL] Encontrados ${result.rows.length} certificados`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('❌ [PROFESIONAL] Error obteniendo certificados:', error);
        res.status(500).json({ error: 'Error obteniendo certificados' });
    }
});

// Función auxiliar para filtros de auditoría
function getAuditFilters() {
    return `AND p.nombre NOT ILIKE '%PROFESIONAL HISTÓRICO%' 
            AND p.nombre NOT ILIKE '%Importado desde pagos%'`;
}

// APIs CORE - Solo funcionalidades originales
app.get('/api/profesionales', requireAuth, async (req, res) => {
    try {
        console.log('🔍 Consultando profesionales...');
        
        // Obtener parámetros de paginación
        const requestedLimit = parseInt(req.query.limit) || 50;
        
        // Advertencia si se solicita más del límite máximo
        if (requestedLimit > 100) {
            console.log(`⚠️ Límite solicitado (${requestedLimit}) excede el máximo permitido (100). Aplicando límite de 100.`);
        }
        
        // Consulta con filtros para excluir registros de auditoría
        // Mantiene registros históricos e importados en BD para auditoría
        // pero los oculta de consultas normales
        const result_22 = await pool.query(`
            SELECT 
                p.*, 
                p.numero_documento, 
                m.numero_matricula as matricula_profesional 
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id 
            WHERE p.nombre NOT ILIKE '%PROFESIONAL HISTÓRICO%'
              AND p.nombre NOT ILIKE '%Importado desde pagos%'
            ORDER BY p.nombre
            LIMIT LEAST($1, 100)
        `, [requestedLimit]);
        
        console.log(`✅ Profesionales encontrados: ${result.rows.length} (límite aplicado: ${Math.min(requestedLimit, 100)})`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error obteniendo profesionales:', error);
        console.error('❌ Detalle del error:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});

// Ruta adicional que el frontend admin espera
// Endpoint simple sin JOINs ni lógica compleja - solo listado básico
app.get('/api/admin/profesionales-simple', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando profesionales con endpoint simple...');
        
        // Query completamente básica sin JOINs, sin filtros complejos, sin búsqueda
        const result_23 = await pool.query(`
            SELECT 
                p.id, 
                p.numero_documento as dni, 
                p.nombre, 
                p.email 
            FROM copig.profesionales p 
            WHERE p.activo = true 
            ORDER BY p.nombre 
            LIMIT 50
        `);
        
        console.log(`✅ [ADMIN] Profesionales encontrados: ${result.rows.length}`);
        
        // Devolver formato esperado por el frontend
        res.json({
            profesionales: result.rows,
            pagination: {
                current_page: 1,
                total_pages: 1,
                total_records: result.rows.length,
                per_page: 50
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo profesionales (simple):', error);
        console.error('❌ Detalle del error:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});

app.get('/api/admin/profesionales', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando profesionales...');
        
        // Parámetros de búsqueda y paginación
        const buscar = req.query.buscar || '';
        const page_104 = parseInt(req.query.page) || 1;
        const limit_105 = 50;
        const offset_28 = (page - 1) * limit;
        
        console.log(`📋 Búsqueda: "${buscar}", página: ${page}`);
        
        // Query base
        let baseQuery = `
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.activo = true
        `;
        let params_27 = [];
        
        // Agregar búsqueda si existe
        if (buscar.trim()) {
            baseQuery += ` AND (p.nombre ILIKE $1 OR p.numero_documento::TEXT ILIKE $1 OR m.numero_matricula::TEXT ILIKE $1)`;
            params = [`%${buscar.trim()}%`];
        }
        
        // Consulta usando nueva vista con estados calculados
        const dataQuery = `
            SELECT 
                id, 
                numero_matricula as matricula,
                nombre, 
                numero_documento,
                email,
                fecha_inscripcion,
                fecha_habilitacion,
                ultimo_pago,
                estado_visual as estado
            FROM copig.vista_profesionales_estados
            ${buscar.trim() ? 'WHERE (nombre ILIKE $1 OR numero_documento::TEXT ILIKE $1 OR numero_matricula::TEXT ILIKE $1)' : ''}
            ORDER BY nombre 
            LIMIT ${limit} OFFSET ${offset}
        `;
        
        // Consulta contador usando misma vista
        const countQuery_30 = `
            SELECT COUNT(*) as total 
            FROM copig.vista_profesionales_estados
            ${buscar.trim() ? 'WHERE (nombre ILIKE $1 OR numero_documento::TEXT ILIKE $1 OR numero_matricula::TEXT ILIKE $1)' : ''}
        `;
        
        const [result, countResult] = await Promise.all([
            pool.query(dataQuery, params),
            pool.query(countQuery, params)
        ]);
        
        const total = parseInt(countResult.rows[0].total);
        const totalPages_31 = Math.ceil(total / limit);
        
        console.log(`✅ [ADMIN] ${result.rows.length} de ${total} profesionales (página ${page}/${totalPages})`);
        
        res.json({
            profesionales: result.rows,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_records: total,
                per_page: limit
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error:', error.message);
        res.status(500).json({ error: 'Error obteniendo profesionales' });
    }
});

// Obtener profesional por ID (para admin)
app.get('/api/admin/profesionales/:id', requirePermission('profesional', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 [ADMIN] Consultando profesional ID: ${id}`);
        const result_26 = await pool.query(`
            SELECT 
                ve.*,
                p.sexo,
                p.estado_civil,
                p.nacionalidad,
                p.provincia,
                tp.descripcion as titulo,
                COUNT(ph.id) as total_pagos,
                SUM(ph.importe) as monto_total_pagos
            FROM copig.vista_profesionales_estados ve
            LEFT JOIN copig.profesionales p ON ve.id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos_profesionales tp ON m.titulo_id = tp.id
            LEFT JOIN copig.pagos_historicos ph ON ve.numero_matricula::text = ph.matricula::text
            WHERE ve.id = $1
            GROUP BY ve.id, ve.nombre, ve.numero_documento, ve.email, ve.registro_activo,
                     ve.numero_matricula, ve.fecha_inscripcion, ve.fecha_habilitacion,
                     ve.ultimo_pago, ve.dias_sin_pagar, ve.estado_habilitacion,
                     ve.estado_visual, ve.motivo_estado,
                     p.sexo, p.estado_civil, p.nacionalidad, p.provincia, tp.descripcion
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        console.log(`✅ [ADMIN] Profesional encontrado: ${result.rows[0].nombre}`);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo profesional:', error);
        res.status(500).json({ error: 'Error obteniendo profesional' });
    }
});

// Crear nuevo profesional (para admin)
app.post('/api/admin/profesionales', requirePermission('profesional', 'write'), async (req, res) => {
    const client_97 = await pool.connect();
    try {
        const { 
            nombre, 
            numero_documento,
            tipo_documento,
            email,
            telefono,
            domicilio,
            nacionalidad,
            numero_matricula,
            categoria,
            titulo,
            password,
            activo = true
        } = req.body;

        console.log('🔍 [ADMIN] Creando nuevo profesional:', { nombre, numero_documento, numero_matricula });

        // Validaciones básicas
        if (!nombre || !numero_documento || !email || !numero_matricula || !categoria || !titulo || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios' 
            });
        }

        await client.query('BEGIN');

        // Verificar si ya existe el profesional
        const checkExisting_74 = await client.query(
            'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
            [numero_documento]
        );

        if (checkExisting.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un profesional con ese número de documento' 
            });
        }

        // Verificar si la matrícula ya existe
        const checkMatricula = await client.query(
            'SELECT id FROM copig.matriculas WHERE numero_matricula = $1',
            [numero_matricula]
        );

        if (checkMatricula.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un profesional con ese número de matrícula' 
            });
        }

        // Crear el profesional
        const insertProfesional = await client.query(
            `INSERT INTO copig.profesionales 
            (nombre, numero_documento, tipo_documento, email, telefono, domicilio, nacionalidad, titulo, activo, fecha_creacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING id`,
            [nombre, numero_documento, tipo_documento || 'DNI', email, telefono, domicilio, nacionalidad || 'Argentina', titulo, activo]
        );

        const profesionalId_122 = insertProfesional.rows[0].id;

        // Crear la matrícula
        await client.query(
            `INSERT INTO copig.matriculas 
            (profesional_id, numero_matricula, categoria, fecha_inscripcion, activo)
            VALUES ($1, $2, $3, NOW(), $4)`,
            [profesionalId, numero_matricula, categoria, activo]
        );

        // Crear las credenciales de acceso
        const bcrypt_52 = require('bcryptjs');
        const hashedPassword_56 = await bcrypt.hash(password, 12);

        await client.query(
            `INSERT INTO copig.profesionales_auth 
            (profesional_id, numero_documento, password_hash, activo, created_at)
            VALUES ($1, $2, $3, $4, NOW())`,
            [profesionalId, numero_documento, hashedPassword, activo]
        );

        await client.query('COMMIT');

        console.log(`✅ [ADMIN] Profesional creado exitosamente: ${nombre} (ID: ${profesionalId})`);

        res.json({ 
            success: true, 
            message: 'Profesional creado exitosamente',
            data: {
                id: profesionalId,
                nombre,
                numero_documento,
                numero_matricula,
                email
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ [ADMIN] Error creando profesional:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el profesional',
            error: error.message 
        });
    } finally {
        client.release();
    }
});

// Actualizar profesional (para admin)
app.put('/api/admin/profesionales/:id', requirePermission('profesional', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre, 
            domicilio, 
            telefono, 
            celular, 
            email, 
            sexo, 
            estado_civil, 
            fecha_nacimiento, 
            cuit, 
            nacionalidad,
            activo 
        } = req.body;
        
        console.log(`🔍 [ADMIN] Actualizando profesional ID: ${id}`);
        console.log(`📝 [ADMIN] Datos recibidos:`, { nombre, email, telefono, celular });
        
        // Construir query dinámico solo con campos que se enviaron
        const updateFields_68 = [];
        const values_69 = [];
        let paramCounter_109 = 1;
        
        if (nombre !== undefined) {
            updateFields.push(`nombre = $${paramCounter++}`);
            values.push(nombre);
        }
        if (domicilio !== undefined) {
            updateFields.push(`domicilio = $${paramCounter++}`);
            values.push(domicilio);
        }
        if (telefono !== undefined) {
            updateFields.push(`telefono = $${paramCounter++}`);
            values.push(telefono || null);
        }
        if (celular !== undefined) {
            updateFields.push(`celular = $${paramCounter++}`);
            values.push(celular || null);
        }
        if (email !== undefined) {
            updateFields.push(`email = $${paramCounter++}`);
            values.push(email || null);
        }
        if (sexo !== undefined) {
            updateFields.push(`sexo = $${paramCounter++}`);
            values.push(sexo || null);
        }
        if (estado_civil !== undefined) {
            updateFields.push(`estado_civil = $${paramCounter++}`);
            values.push(estado_civil || null);
        }
        if (fecha_nacimiento !== undefined) {
            updateFields.push(`fecha_nacimiento = $${paramCounter++}`);
            values.push(fecha_nacimiento || null);
        }
        if (cuit !== undefined) {
            updateFields.push(`cuit = $${paramCounter++}`);
            values.push(cuit || null);
        }
        if (nacionalidad !== undefined) {
            updateFields.push(`nacionalidad = $${paramCounter++}`);
            values.push(nacionalidad || null);
        }
        if (activo !== undefined) {
            updateFields.push(`activo = $${paramCounter++}`);
            values.push(activo);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No se enviaron campos para actualizar' 
            });
        }
        
        // Agregar ID al final
        values.push(id);
        
        const updateQuery = `
            UPDATE copig.profesionales 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;
        
        console.log(`📊 [ADMIN] Ejecutando actualización:`, updateQuery.substring(0, 100) + '...');
        
        const result_29 = await pool.query(updateQuery, values);
        
        if (result.rowCount === 0) {
            console.log(`❌ [ADMIN] Profesional ID ${id} no encontrado`);
            return res.status(404).json({ 
                success: false, 
                error: 'Profesional no encontrado' 
            });
        }
        
        console.log(`✅ [ADMIN] Profesional ${result.rows[0].nombre} actualizado exitosamente`);
        
        res.json({ 
            success: true, 
            message: 'Profesional actualizado exitosamente',
            profesional: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error actualizando profesional:', error);
        res.status(500).json({ error: 'Error actualizando profesional: ' + error.message });
    }
});

// Eliminar profesional (para admin)
app.delete('/api/admin/profesionales/:id', requirePermission('profesional', 'delete'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 [ADMIN] Eliminando profesional ID: ${id}`);
        // Implementación básica - puedes expandir según necesites  
        res.json({ success: true, message: 'Funcionalidad en desarrollo' });
    } catch (error) {
        console.error('❌ [ADMIN] Error eliminando profesional:', error);
        res.status(500).json({ error: 'Error eliminando profesional' });
    }
});

app.get('/api/empresas', requirePermission('empresas', 'read'), async (req, res) => {
    try {
        const { buscar, page, limit, estado } = req.query;
        console.log('🔍 Consultando empresas con parámetros:', { buscar, page, limit, estado });
        
        // Filtro base - solo excluir registros completamente inválidos
        let whereClause_110 = 'WHERE 1=1';
        let params_62 = [];
        let paramIndex = 1;
        
        // Agregar filtro de búsqueda por razón social
        if (buscar && buscar.trim() !== '') {
            whereClause += ` AND razon_social ILIKE $${paramIndex}`;
            params.push(`%${buscar.trim()}%`);
            paramIndex++;
            console.log('🔍 Agregando filtro de búsqueda:', buscar);
        }
        
        // Agregar filtro de estado si se especifica
        if (estado && estado !== '') {
            console.log('🔍 Agregando filtro de estado:', estado);
            if (estado === 'A') {
                whereClause += ` AND (activo = true AND estado = 'A')`;
            } else if (estado === 'I') {
                whereClause += ` AND (activo = false OR estado = 'I')`;
            } else if (estado === 'S') {
                whereClause += ` AND estado = 'S'`;
            }
        }
        
        // Paginación
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 100;
        const offset_106 = (pageNum - 1) * limitNum;
        
        console.log('🔍 Query WHERE:', whereClause);
        console.log('🔍 Query Params:', params);
        
        const query_61 = `
            SELECT * FROM copig.empresas 
            ${whereClause} 
            ORDER BY razon_social 
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        params.push(limitNum, offset);
        
        console.log('🔍 Query final:', query.replace(/\s+/g, ' '));
        console.log('🔍 Parámetros:', params);
        
        // Ejecutar consulta principal
        const result_32 = await pool.query(query, params);
        
        // Obtener total de registros (sin límite) para paginación
        const countQuery_111 = query.replace(/SELECT \* FROM/, 'SELECT COUNT(*) as total FROM').split('ORDER BY')[0];
        const countResult = await pool.query(countQuery, params.slice(0, -2)); // Remover LIMIT y OFFSET
        const totalItems = parseInt(countResult.rows[0].total);
        
        console.log(`✅ Encontradas ${result.rows.length} empresas (página ${pageNum}, límite ${limitNum})`);
        console.log(`📊 Total de empresas disponibles: ${totalItems}`);
        console.log('📋 Primeras empresas encontradas:', result.rows.slice(0, 3).map(e => ({
            id: e.id,
            razon_social: e.razon_social,
            activo: e.activo
        })));
        
        // Calcular información de paginación
        const totalPages = Math.ceil(totalItems / limitNum);
        const hasPrev = pageNum > 1;
        const hasNext = pageNum < totalPages;
        
        // Devolver datos con paginación
        res.json({
            empresas: result.rows,
            pagination: {
                currentPage: pageNum,
                totalPages: totalPages,
                totalItems: totalItems,
                limit: limitNum,
                hasPrev: hasPrev,
                hasNext: hasNext
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
});

// Obtener empresa por ID
app.get('/api/empresas/:id', requirePermission('empresas', 'read'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Consultando empresa ID: ${id}`);
        
        // Validar que el ID sea un número
        const empresaId_33 = parseInt(id);
        if (isNaN(empresaId)) {
            return res.status(400).json({ error: 'ID de empresa inválido' });
        }
        
        // Consulta básica simplificada
        const result_34 = await pool.query('SELECT * FROM copig.empresas WHERE id = $1', [empresaId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        const empresa = result.rows[0];
        
        // Obtener representantes técnicos de la empresa
        const representantesResult = await pool.query(`
            SELECT 
                rt.id,
                rt.categoria_representacion,
                rt.fecha_inicio,
                rt.fecha_fin,
                rt.activo,
                rt.observaciones,
                p.nombre as profesional_nombre,
                m.numero_matricula
            FROM copig.representantes_tecnicos rt
            INNER JOIN copig.profesionales p ON rt.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON rt.profesional_id = m.profesional_id
            WHERE rt.empresa_id = $1
            ORDER BY p.nombre
        `, [empresaId]);
        
        // Agregar representantes técnicos al objeto empresa
        empresa.representantes_tecnicos = representantesResult.rows;
        
        console.log(`✅ Empresa encontrada: ${empresa.razon_social} con ${representantesResult.rows.length} representantes técnicos`);
        res.json(empresa);
    } catch (error) {
        console.error('Error obteniendo empresa por ID:', error);
        res.status(500).json({ error: 'Error obteniendo empresa' });
    }
});

// Actualizar empresa por ID
app.put('/api/empresas/:id', requirePermission('empresas', 'write'), async (req, res) => {
    const { id } = req.params;
    console.log(`🔄 [PUT] Iniciando actualización de empresa ID: ${id}`);
    console.log('📋 [PUT] Headers:', req.headers);
    console.log('📋 [PUT] Body completo:', JSON.stringify(req.body, null, 2));
    
    try {
        // Validar que el ID sea un número
        const empresaId_39 = parseInt(id);
        if (isNaN(empresaId)) {
            console.log('❌ [PUT] Error: ID de empresa inválido:', id);
            return res.status(400).json({ 
                success: false, 
                error: 'ID de empresa inválido' 
            });
        }
        
        const { razon_social, cuit, email, telefono, domicilio, localidad, departamento, provincia, codigo_postal, observaciones, activo } = req.body;
        console.log('📊 [PUT] Campos extraídos:', { razon_social, cuit, email, telefono, domicilio, localidad, departamento, provincia, codigo_postal, observaciones, activo });
        
        // Validaciones básicas
        if (!razon_social || razon_social.trim() === '') {
            console.log('❌ [PUT] Validación fallida: Razón social vacía');
            return res.status(400).json({ 
                success: false, 
                error: 'La razón social es requerida' 
            });
        }
        
        // Verificar que la empresa existe y mostrar datos actuales
        console.log('🔍 [PUT] Verificando existencia de empresa...');
        const existsResult_40 = await pool.query('SELECT * FROM copig.empresas WHERE id = $1', [empresaId]);
        
        if (existsResult.rows.length === 0) {
            console.log(`❌ [PUT] Empresa con ID ${empresaId} no encontrada`);
            return res.status(404).json({ 
                success: false, 
                error: 'Empresa no encontrada' 
            });
        }
        
        console.log('📊 [PUT] Datos actuales de la empresa:', JSON.stringify(existsResult.rows[0], null, 2));
        
        // Validar CUIT si se proporciona
        if (cuit && cuit.trim() !== '') {
            const cuitLimpio_35 = cuit.replace(/[^\d]/g, '');
            if (cuitLimpio.length !== 11) {
                console.log('❌ [PUT] Validación fallida: CUIT inválido:', cuit);
                return res.status(400).json({ 
                    success: false, 
                    error: 'El CUIT debe tener 11 dígitos' 
                });
            }
        }
        
        // Preparar valores para actualización
        const nuevosValores = [
            razon_social.trim(), 
            cuit && cuit.trim() !== '' ? cuit.trim() : null, 
            email && email.trim() !== '' ? email.trim() : null, 
            telefono && telefono.trim() !== '' ? telefono.trim() : null, 
            domicilio && domicilio.trim() !== '' ? domicilio.trim() : null,
            localidad && localidad.trim() !== '' ? localidad.trim() : null,
            departamento && departamento.trim() !== '' ? departamento.trim() : null,
            provincia && provincia.trim() !== '' ? provincia.trim() : null,
            codigo_postal && codigo_postal.trim() !== '' ? codigo_postal.trim() : null,
            observaciones && observaciones.trim() !== '' ? observaciones.trim() : null,
            activo !== undefined ? activo : true, 
            empresaId
        ];
        
        console.log('🔄 [PUT] Valores finales para actualización:', nuevosValores);
        
        // Actualizar empresa
        console.log('💾 [PUT] Ejecutando UPDATE...');
        const result_36 = await pool.query(`
            UPDATE copig.empresas 
            SET razon_social = $1, cuit = $2, email = $3, telefono = $4, domicilio = $5, 
                localidad = $6, departamento = $7, provincia = $8, codigo_postal = $9, 
                observaciones = $10, activo = $11, fecha_actualizacion = NOW()
            WHERE id = $12
            RETURNING *
        `, nuevosValores);
        
        if (result.rows.length === 0) {
            console.log('❌ [PUT] UPDATE no afectó ninguna fila - empresa no encontrada o sin cambios');
            return res.status(400).json({ 
                success: false, 
                error: 'No se pudo actualizar la empresa' 
            });
        }
        
        console.log('✅ [PUT] Empresa actualizada exitosamente');
        console.log('📊 [PUT] Datos después de actualización:', JSON.stringify(result.rows[0], null, 2));
        
        const response_37 = { 
            success: true, 
            message: 'Empresa actualizada correctamente',
            empresa: result.rows[0]
        };
        
        console.log('📤 [PUT] Enviando respuesta:', response);
        res.json(response);
        
    } catch (error) {
        console.error('❌ [PUT] Error completo actualizando empresa:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
            stack: error.stack.substring(0, 500),
            requestBody: req.body,
            empresaId: id
        });
        
        let errorResponse_38 = { success: false };
        
        // Manejar errores específicos de PostgreSQL
        if (error.code === '23505') {
            if (error.constraint === 'empresas_cuit_key') {
                errorResponse.error = 'Ya existe una empresa con ese CUIT';
                console.log('❌ [PUT] Error: CUIT duplicado');
                return res.status(400).json(errorResponse);
            }
            errorResponse.error = 'Ya existe una empresa con esos datos';
            console.log('❌ [PUT] Error: Datos duplicados');
            return res.status(400).json(errorResponse);
        }
        
        errorResponse.error = 'Error interno del servidor al actualizar empresa';
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = error.message;
        }
        
        console.log('📤 [PUT] Enviando error:', errorResponse);
        res.status(500).json(errorResponse);
    }
});

// Crear nueva empresa
app.post('/api/empresas', requirePermission('empresas', 'write'), async (req, res) => {
    console.log('🆕 [POST] Iniciando creación de empresa...');
    console.log('📋 [POST] Headers:', req.headers);
    console.log('📋 [POST] Body completo:', JSON.stringify(req.body, null, 2));
    
    try {
        const { 
            razon_social, 
            cuit, 
            email, 
            telefono, 
            domicilio, 
            localidad,
            departamento,
            provincia,
            codigo_postal,
            observaciones,
            activo 
        } = req.body;
        
        console.log('📊 [POST] Campos extraídos:', { razon_social, cuit, email, telefono, domicilio, localidad, departamento, provincia, codigo_postal, observaciones, activo });
        
        // Validaciones básicas
        if (!razon_social || razon_social.trim() === '') {
            console.log('❌ [POST] Validación fallida: Razón social vacía');
            return res.status(400).json({ 
                success: false, 
                error: 'La razón social es requerida' 
            });
        }
        
        // Validar CUIT si se proporciona
        if (cuit && cuit.trim() !== '') {
            const cuitLimpio = cuit.replace(/[^\d]/g, '');
            if (cuitLimpio.length !== 11) {
                console.log('❌ [POST] Validación fallida: CUIT inválido:', cuit);
                return res.status(400).json({ 
                    success: false, 
                    error: 'El CUIT debe tener 11 dígitos' 
                });
            }
        }
        
        // Preparar datos para inserción
        const datosEmpresa = [
            razon_social.trim(), 
            cuit && cuit.trim() !== '' ? cuit.trim() : null, 
            email && email.trim() !== '' ? email.trim() : null, 
            telefono && telefono.trim() !== '' ? telefono.trim() : null, 
            domicilio && domicilio.trim() !== '' ? domicilio.trim() : null,
            localidad && localidad.trim() !== '' ? localidad.trim() : null,
            departamento && departamento.trim() !== '' ? departamento.trim() : null,
            provincia && provincia.trim() !== '' ? provincia.trim() : null,
            codigo_postal && codigo_postal.trim() !== '' ? codigo_postal.trim() : null,
            observaciones && observaciones.trim() !== '' ? observaciones.trim() : null,
            activo !== undefined ? activo : true
        ];
        
        console.log('💾 [POST] Datos finales para insertar:', datosEmpresa);
        
        // Crear nueva empresa
        const result_41 = await pool.query(`
            INSERT INTO copig.empresas (razon_social, cuit, email, telefono, domicilio, localidad, departamento, provincia, codigo_postal, observaciones, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, datosEmpresa);
        
        console.log(`✅ [POST] Empresa creada exitosamente:`, result.rows[0]);
        
        const response = { 
            success: true, 
            message: 'Empresa creada correctamente',
            empresa: result.rows[0]
        };
        
        console.log('📤 [POST] Enviando respuesta:', response);
        res.status(201).json(response);
        
    } catch (error) {
        console.error('❌ [POST] Error completo creando empresa:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
            stack: error.stack.substring(0, 500),
            requestBody: req.body
        });
        
        let errorResponse = { success: false };
        
        // Manejar errores específicos de PostgreSQL
        if (error.code === '23505') {
            if (error.constraint === 'empresas_cuit_key') {
                errorResponse.error = 'Ya existe una empresa con ese CUIT';
                console.log('❌ [POST] Error: CUIT duplicado');
                return res.status(400).json(errorResponse);
            }
            errorResponse.error = 'Ya existe una empresa con esos datos';
            console.log('❌ [POST] Error: Datos duplicados');
            return res.status(400).json(errorResponse);
        }
        
        if (error.code === '23502') {
            errorResponse.error = 'Faltan datos obligatorios para crear la empresa';
            console.log('❌ [POST] Error: Datos faltantes');
            return res.status(400).json(errorResponse);
        }
        
        if (error.code === '22001') {
            errorResponse.error = 'Uno de los campos excede la longitud máxima permitida';
            console.log('❌ [POST] Error: Campo demasiado largo');
            return res.status(400).json(errorResponse);
        }
        
        errorResponse.error = 'Error interno del servidor al crear empresa';
        if (process.env.NODE_ENV === 'development') {
            errorResponse.details = error.message;
        }
        
        console.log('📤 [POST] Enviando error:', errorResponse);
        res.status(500).json(errorResponse);
    }
});

// Eliminar empresa por ID
app.delete('/api/empresas/:id', requirePermission('empresas', 'delete'), async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Eliminando empresa ID: ${id}`);
        
        // Validar que el ID sea un número
        const empresaId = parseInt(id);
        if (isNaN(empresaId)) {
            return res.status(400).json({ error: 'ID de empresa inválido' });
        }
        
        // Verificar que la empresa existe
        const existsResult = await pool.query('SELECT razon_social FROM copig.empresas WHERE id = $1', [empresaId]);
        if (existsResult.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        const empresaNombre = existsResult.rows[0].razon_social;
        
        // Eliminar empresa (o marcar como inactiva según preferencias)
        const result_42 = await pool.query('DELETE FROM copig.empresas WHERE id = $1 RETURNING *', [empresaId]);
        
        console.log(`✅ Empresa eliminada: ${empresaNombre}`);
        res.json({ 
            success: true, 
            message: 'Empresa eliminada correctamente'
        });
    } catch (error) {
        console.error('Error eliminando empresa:', error);
        res.status(500).json({ error: 'Error eliminando empresa' });
    }
});

// Gestión de Representantes Técnicos
// ===================================

// Obtener representantes técnicos de una empresa
app.get('/api/empresas/:empresaId/representantes', requirePermission('empresas', 'read'), async (req, res) => {
    try {
        const { empresaId } = req.params;
        console.log(`🔍 Consultando representantes técnicos de empresa ID: ${empresaId}`);
        
        const result_43 = await pool.query(`
            SELECT 
                rt.*,
                p.nombre,
                p.apellido,
                p.dni,
                p.matricula,
                p.email,
                p.telefono,
                e.razon_social
            FROM copig.representantes_tecnicos rt
            JOIN copig.profesionales p ON rt.profesional_id = p.id
            JOIN copig.empresas e ON rt.empresa_id = e.id
            WHERE rt.empresa_id = $1
            ORDER BY rt.fecha_designacion DESC
        `, [empresaId]);
        
        console.log(`✅ Encontrados ${result.rows.length} representantes técnicos`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo representantes técnicos:', error);
        res.status(500).json({ error: 'Error obteniendo representantes técnicos' });
    }
});

// Asignar representante técnico a empresa
app.post('/api/empresas/:empresaId/representantes', requirePermission('empresas', 'write'), async (req, res) => {
    try {
        const { empresaId } = req.params;
        const { profesional_id, titulo_externo, categoria_representacion, observaciones } = req.body;
        
        console.log(`🆕 Asignando representante técnico: Empresa ${empresaId} - Profesional ${profesional_id}`);
        
        if (!profesional_id) {
            return res.status(400).json({ error: 'El ID del profesional es requerido' });
        }
        
        // Verificar que la empresa existe
        const empresaCheck = await pool.query('SELECT razon_social FROM copig.empresas WHERE id = $1', [empresaId]);
        if (empresaCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        // Verificar que el profesional existe
        const profesionalCheck = await pool.query('SELECT nombre, apellido FROM copig.profesionales WHERE id = $1', [profesional_id]);
        if (profesionalCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        
        const result_44 = await pool.query(`
            INSERT INTO copig.representantes_tecnicos 
            (empresa_id, profesional_id, titulo_externo, categoria_representacion, observaciones)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [empresaId, profesional_id, titulo_externo || null, categoria_representacion || null, observaciones || null]);
        
        console.log(`✅ Representante técnico asignado exitosamente`);
        res.status(201).json({
            success: true,
            message: 'Representante técnico asignado exitosamente',
            representante: result.rows[0]
        });
    } catch (error) {
        console.error('Error asignando representante técnico:', error);
        
        // Manejar violación de constraint de unicidad
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Este profesional ya es representante técnico de esta empresa' });
        }
        
        res.status(500).json({ error: 'Error asignando representante técnico' });
    }
});

// Actualizar representante técnico
app.put('/api/representantes/:id', requirePermission('empresas', 'write'), async (req, res) => {
    try {
        const { id } = req.params;
        const { activo, titulo_externo, categoria_representacion, observaciones } = req.body;
        
        console.log(`🔄 Actualizando representante técnico ID: ${id}`);
        
        const result_45 = await pool.query(`
            UPDATE copig.representantes_tecnicos
            SET activo = $1, titulo_externo = $2, categoria_representacion = $3, 
                observaciones = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING *
        `, [
            activo !== undefined ? activo : true, 
            titulo_externo, 
            categoria_representacion, 
            observaciones, 
            id
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Representante técnico no encontrado' });
        }
        
        console.log(`✅ Representante técnico actualizado`);
        res.json({
            success: true,
            message: 'Representante técnico actualizado exitosamente',
            representante: result.rows[0]
        });
    } catch (error) {
        console.error('Error actualizando representante técnico:', error);
        res.status(500).json({ error: 'Error actualizando representante técnico' });
    }
});

// Eliminar representante técnico
app.delete('/api/representantes/:id', requirePermission('empresas', 'delete'), async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️ Eliminando representante técnico ID: ${id}`);
        
        const result_46 = await pool.query('DELETE FROM copig.representantes_tecnicos WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Representante técnico no encontrado' });
        }
        
        console.log(`✅ Representante técnico eliminado`);
        res.json({
            success: true,
            message: 'Representante técnico eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando representante técnico:', error);
        res.status(500).json({ error: 'Error eliminando representante técnico' });
    }
});

// Gestión de roles de usuario
app.get('/api/admin/user-roles', requirePermission('admin', 'manage_roles'), async (req, res) => {
    try {
        const result_47 = await pool.query(`
            SELECT ur.*, 
                   CASE 
                       WHEN ur.user_type = 'admin' THEN au.email
                       WHEN ur.user_type = 'profesional' THEN p.nombre || ' ' || p.apellido
                   END as user_name
            FROM copig.user_roles ur
            LEFT JOIN copig.admin_users au ON ur.user_id = au.id AND ur.user_type = 'admin'
            LEFT JOIN copig.profesionales p ON ur.user_id = p.id AND ur.user_type = 'profesional'
            ORDER BY ur.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo roles de usuario:', error);
        res.status(500).json({ error: 'Error obteniendo roles de usuario' });
    }
});

app.post('/api/admin/user-roles', requirePermission('admin', 'manage_roles'), async (req, res) => {
    try {
        const { user_id, user_type, role_type, permissions } = req.body;
        
        const result_48 = await pool.query(`
            INSERT INTO copig.user_roles (user_id, user_type, role_type, permissions)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, user_type) 
            DO UPDATE SET 
                role_type = EXCLUDED.role_type,
                permissions = EXCLUDED.permissions,
                updated_at = NOW()
            RETURNING *
        `, [user_id, user_type, role_type, JSON.stringify(permissions || {})]);
        
        res.json({ success: true, role: result.rows[0] });
    } catch (error) {
        console.error('Error creando/actualizando rol de usuario:', error);
        res.status(500).json({ error: 'Error creando/actualizando rol de usuario' });
    }
});

app.put('/api/admin/user-roles/:id', requirePermission('admin', 'manage_roles'), async (req, res) => {
    try {
        const { id } = req.params;
        const { role_type, permissions, active } = req.body;
        
        const result_49 = await pool.query(`
            UPDATE copig.user_roles 
            SET role_type = $1, permissions = $2, active = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `, [role_type, JSON.stringify(permissions || {}), active, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }
        
        res.json({ success: true, role: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando rol de usuario:', error);
        res.status(500).json({ error: 'Error actualizando rol de usuario' });
    }
});

app.delete('/api/admin/user-roles/:id', requirePermission('admin', 'manage_roles'), async (req, res) => {
    try {
        const { id } = req.params;
        
        const result_50 = await pool.query('DELETE FROM copig.user_roles WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }
        
        res.json({ success: true, message: 'Rol eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando rol de usuario:', error);
        res.status(500).json({ error: 'Error eliminando rol de usuario' });
    }
});

// Endpoint para obtener permisos disponibles
app.get('/api/admin/available-permissions', requirePermission('admin', 'manage_roles'), async (req, res) => {
    try {
        res.json({
            success: true,
            roles: Object.keys(ROLE_PERMISSIONS),
            permissions: ROLE_PERMISSIONS
        });
    } catch (error) {
        console.error('Error obteniendo permisos disponibles:', error);
        res.status(500).json({ error: 'Error obteniendo permisos disponibles' });
    }
});

// Login de administrador
app.post('/api/admin/login', async (req, res) => {
    try {
        console.log('🔍 LOGIN ATTEMPT:', req.body);
        const { username: email, password } = req.body;
        
        console.log('📧 Buscando usuario con email:', email);
        const result_63 = await pool.query(
            'SELECT * FROM copig.admin_users WHERE email = $1',
            [email]
        );
        
        console.log('👥 Usuarios encontrados:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('📋 Usuario encontrado:', {
                username: result.rows[0].username,
                email: result.rows[0].email,
                active: result.rows[0].active
            });
        }
        
        if (result.rows.length === 0) {
            console.log('❌ No se encontró usuario');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user_55 = result.rows[0];
        console.log('🔑 Validando contraseña...');
        const validPassword_54 = await bcrypt.compare(password, user.password_hash);
        console.log('🔐 Contraseña válida:', validPassword);
        
        if (!validPassword) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        req.session.user = {
            id: user.id,
            usuario: user.username,
            tipo_usuario: user.role
        };
        
        console.log('✅ Login exitoso, sesión creada');
        res.json({ 
            success: true, 
            usuario: user.username,
            tipo_usuario: user.role,
            redirect: '/admin'
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Logout forzado para limpiar sesiones (GET para testing)
app.get('/api/admin/force-logout', (req, res) => {
    console.log('🚫 LOGOUT FORZADO - Limpiando sesión');
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir sesión:', err);
        } else {
            console.log('✅ Sesión eliminada correctamente');
        }
        res.json({ success: true, message: 'Sesión eliminada' });
    });
});

// Unified Login - Punto único de autenticación para admins y profesionales
app.post('/api/unified-login', async (req, res) => {
    try {
        console.log('🔍 UNIFIED LOGIN ATTEMPT:', req.body);
        const { dni, password } = req.body;

        // Validar que se proporcionen dni y password
        if (!dni || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'DNI y contraseña son requeridos' 
            });
        }

        // 1) Verificar super admin
        if (dni === '20562024' && password === 'ansiktet1969') {
            console.log('🔑 Super admin autenticado');
            
            // Configurar sesión de super admin
            req.session.user = {
                id: 'super_admin',
                username: 'Super Admin',
                email: 'admin@copig.com',
                role: 'super_admin',
                dni: '20562024'
            };

            return res.json({
                success: true,
                userType: 'admin',
                redirectUrl: '/admin',
                userData: req.session.user
            });
        }

        // 2) Buscar en tabla admin_users (staff y admins)
        console.log('🔍 Buscando en usuarios administrativos con DNI:', dni);
        const adminUserResult = await pool.query(
            'SELECT * FROM copig.admin_users WHERE documento = $1 OR username = $1',
            [dni]
        );

        if (adminUserResult.rows.length > 0) {
            const adminUser = adminUserResult.rows[0];
            console.log('👤 Usuario administrativo encontrado:', adminUser.full_name, `(${adminUser.role})`);
            
            // Verificar contraseña
            const bcrypt_70 = require('bcryptjs');
            const passwordMatch = await bcrypt.compare(password, adminUser.password);
            
            if (!passwordMatch) {
                console.log('❌ Contraseña incorrecta para usuario administrativo');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Contraseña incorrecta' 
                });
            }
            
            // Verificar si está activo
            if (!adminUser.active) {
                console.log('❌ Usuario administrativo inactivo');
                return res.status(401).json({ 
                    success: false, 
                    message: 'Usuario inactivo. Contacte al administrador.' 
                });
            }
            
            // Configurar sesión
            req.session.user = {
                id: adminUser.id,
                username: adminUser.username,
                email: adminUser.email,
                role: adminUser.role,
                dni: adminUser.documento,
                full_name: adminUser.full_name
            };
            
            console.log('✅ Usuario administrativo autenticado:', adminUser.role);
            
            return res.json({
                success: true,
                userType: 'admin',
                redirectUrl: '/admin',
                userData: req.session.user,
                portal: 'admin'
            });
        }

        // 3) Buscar en tabla profesionales
        console.log('📋 Buscando profesional con DNI:', dni);
        const profesionalResult = await pool.query(
            'SELECT * FROM copig.profesionales WHERE numero_documento = $1',
            [dni]
        );

        if (profesionalResult.rows.length === 0) {
            console.log('❌ DNI no encontrado en ninguna tabla');
            return res.status(401).json({ 
                success: false, 
                message: 'DNI no encontrado en el sistema' 
            });
        }

        const profesional_64 = profesionalResult.rows[0];
        console.log('👤 Profesional encontrado:', profesional.nombre, profesional.apellido);

        // 3) Verificar si tiene contraseña configurada en profesionales_auth
        console.log('🔍 Buscando credenciales de autenticación...');
        const authResult_57 = await pool.query(
            'SELECT * FROM copig.profesionales_auth WHERE profesional_id = $1',
            [profesional.id]
        );

        if (authResult.rows.length === 0) {
            console.log('❌ Profesional sin credenciales configuradas');
            return res.status(401).json({ 
                success: false, 
                message: 'Acceso no configurado. Contacte al administrador.' 
            });
        }

        const authData = authResult.rows[0];
        
        // 4) Validar password con bcrypt
        console.log('🔐 Validando contraseña...');
        const validPassword = await bcrypt.compare(password, authData.password_hash);
        
        if (!validPassword) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({ 
                success: false, 
                message: 'Contraseña incorrecta' 
            });
        }

        // 5) Verificar si es primer ingreso
        console.log('🔍 Verificando si es primer ingreso...');
        const firstLogin = authData.first_login !== false; // Si first_login es null o true, es primer ingreso
        
        if (firstLogin) {
            console.log('🔑 Primer ingreso detectado - forzando cambio de contraseña');
            
            // Configurar sesión temporal para cambio de contraseña
            req.session.user = {
                id: profesional.id,
                username: `${profesional.nombre} ${profesional.apellido}`,
                email: profesional.email,
                role: 'profesional',
                dni: profesional.numero_documento,
                profesional_data: profesional,
                requiresPasswordChange: true
            };

            return res.json({
                success: true,
                userType: 'profesional',
                redirectUrl: '/cambiar-contrasena',
                requiresPasswordChange: true,
                message: 'Debe cambiar su contraseña en el primer ingreso',
                userData: req.session.user
            });
        }

        // 6) Autenticación exitosa - configurar sesión de profesional
        console.log('✅ Profesional autenticado correctamente');
        
        req.session.user = {
            id: profesional.id,
            username: `${profesional.nombre} ${profesional.apellido}`,
            email: profesional.email,
            role: 'profesional',
            dni: profesional.numero_documento,
            profesional_data: profesional
        };
        
        // IMPORTANTE: Guardar profesionalId para los endpoints CHP
        req.session.profesionalId = profesional.id;

        return res.json({
            success: true,
            userType: 'profesional',
            redirectUrl: '/portal-profesional',
            userData: req.session.user
        });

    } catch (error) {
        console.error('❌ Error en unified login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Cambiar contraseña en primer ingreso
app.post('/api/change-first-password', async (req, res) => {
    try {
        console.log('🔍 CHANGE FIRST PASSWORD ATTEMPT');
        
        // 1) Verificar sesión activa
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Sesión no válida' 
            });
        }

        const user = req.session.user;
        const { newPassword, confirmPassword } = req.body;

        // Validar que se proporcionen las contraseñas
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nueva contraseña y confirmación son requeridas' 
            });
        }

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Las contraseñas no coinciden' 
            });
        }

        // Validar fuerza de contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'La contraseña debe tener al menos 8 caracteres' 
            });
        }

        // 2) Hashear la nueva contraseña con bcrypt
        console.log('🔐 Hasheando nueva contraseña...');
        const saltRounds = 12;
        const hashedPassword_71 = await bcrypt.hash(newPassword, saltRounds);

        // 3) Actualizar contraseña según el tipo de usuario
        if (user.role === 'super_admin') {
            // Actualizar en admin_users
            console.log('🔍 Actualizando contraseña de super admin en admin_users');
            await pool.query(
                'UPDATE copig.admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2',
                [hashedPassword, user.email]
            );
            console.log('✅ Contraseña de super admin actualizada');

        } else if (user.role === 'profesional') {
            // Actualizar en profesionales_auth y marcar first_login como false
            console.log('🔍 Actualizando contraseña de profesional en profesionales_auth');
            
            // Verificar si existe el registro
            const authResult = await pool.query(
                'SELECT id FROM copig.profesionales_auth WHERE profesional_id = $1',
                [user.id]
            );

            if (authResult.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Registro de autenticación no encontrado' 
                });
            }

            // 4) Actualizar contraseña y marcar first_login como false
            await pool.query(`
                UPDATE copig.profesionales_auth 
                SET password_hash = $1, 
                    first_login = false, 
                    updated_at = NOW() 
                WHERE profesional_id = $2
            `, [hashedPassword, user.id]);
            
            console.log('✅ Contraseña de profesional actualizada y first_login marcado como false');

        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Tipo de usuario no válido' 
            });
        }

        // Actualizar sesión para remover flag de cambio requerido
        req.session.user.requiresPasswordChange = false;

        // 5) Determinar URL de redirección según el tipo de usuario
        let redirectUrl = '/portal-profesional';
        if (user.role === 'super_admin') {
            redirectUrl = '/admin';
        }

        console.log('✅ Cambio de contraseña completado exitosamente');

        // Retornar respuesta exitosa
        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente',
            redirectUrl: redirectUrl
        });

    } catch (error) {
        console.error('❌ Error en change first password:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Verificar estado de autenticación
app.get('/api/admin/auth/status', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Estadísticas básicas del sistema
app.get('/api/admin/stats', requireAuth, async (req, res) => {
    try {
        const profesionales_58 = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        const empresas_59 = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
        
        res.json({
            profesionales_total: parseInt(profesionales.rows[0].total),
            empresas_total: parseInt(empresas.rows[0].total)
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Estadísticas para dashboard
app.get('/api/admin/dashboard/stats', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando estadísticas dashboard...');
        
        const profesionales = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales WHERE activo = true');
        const empresas = await pool.query('SELECT COUNT(*) as total FROM copig.empresas WHERE activo = true');
        
        // Estadísticas básicas para el dashboard
        res.json({
            profesionales: parseInt(profesionales.rows[0].total),
            empresas: parseInt(empresas.rows[0].total),
            solicitudes_pendientes: 0, // Placeholder
            pagos_mes: 0 // Placeholder
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo estadísticas dashboard:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Solicitudes recientes
app.get('/api/admin/solicitudes', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando solicitudes...');
        
        // Por ahora devolver array vacío - implementar según estructura real
        res.json([]);
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo solicitudes:', error);
        res.status(500).json({ error: 'Error obteniendo solicitudes' });
    }
});

// Actividad reciente del sistema
app.get('/api/admin/dashboard/activity', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Consultando actividad...');
        
        // Por ahora devolver array vacío - implementar según necesidades
        res.json([]);
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo actividad:', error);
        res.status(500).json({ error: 'Error obteniendo actividad' });
    }
});

// Test de base de datos SIN autenticación para diagnóstico
app.get('/api/system/diagnostic', async (req, res) => {
    try {
        console.log('🔧 DIAGNÓSTICO COMPLETO DEL SISTEMA...');
        
        // 1. Test de BD
        const testResult_60 = await pool.query('SELECT NOW() as timestamp, version() as version');
        console.log('✅ Conexión a BD: OK');
        
        // 2. Contar profesionales
        const profCount = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        console.log(`✅ Profesionales: ${profCount.rows[0].total}`);
        
        // 3. Contar empresas  
        const empCount = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
        console.log(`✅ Empresas: ${empCount.rows[0].total}`);
        
        // 4. Test admin users
        const adminCount = await pool.query('SELECT COUNT(*) as total FROM copig.admin_users');
        console.log(`✅ Usuarios admin: ${adminCount.rows[0].total}`);
        
        // 5. Muestra de profesional para debug
        const sampleProf = await pool.query(`
            SELECT 
                p.*, 
                p.numero_documento, 
                m.numero_matricula as matricula_profesional 
            FROM copig.profesionales p 
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id 
            LIMIT 1
        `);
        console.log('📋 Muestra profesional:', sampleProf.rows[0]);
        
        // 6. Investigar tablas de pagos
        const todasTablas_66 = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            ORDER BY table_name
        `);
        console.log('📋 Todas las tablas:', todasTablas.rows.map(r => r.table_name));
        
        const tablasPagos_67 = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name ILIKE '%pago%'
        `);
        console.log('💰 Tablas con "pago":', tablasPagos.rows.map(r => r.table_name));
        
        res.json({
            success: true,
            timestamp: testResult.rows[0].timestamp,
            database: 'copig_moderno',
            profesionales: parseInt(profCount.rows[0].total),
            empresas: parseInt(empCount.rows[0].total),
            admin_users: parseInt(adminCount.rows[0].total),
            server_status: 'OK',
            sample_profesional: sampleProf.rows[0],
            todas_tablas: todasTablas.rows.map(r => r.table_name),
            tablas_pagos: tablasPagos.rows.map(r => r.table_name),
            message: 'DIAGNÓSTICO COMPLETO - SISTEMA FUNCIONAL'
        });
    } catch (error) {
        console.error('❌ ERROR EN DIAGNÓSTICO:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error en diagnóstico del sistema', 
            details: error.message,
            code: error.code 
        });
    }
});

// Test de base de datos (con auth)
app.get('/api/admin/test-db', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Probando conexión a BD...');
        
        const testResult = await pool.query('SELECT NOW() as timestamp, version() as version');
        
        res.json({
            success: true,
            timestamp: testResult.rows[0].timestamp,
            version: testResult.rows[0].version,
            database: 'copig_moderno'
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error en test BD:', error);
        res.status(500).json({ error: 'Error probando base de datos', details: error.message });
    }
});

// Usuarios administrativos
app.get('/api/admin/users', requireAuth, async (req, res) => {
    try {
        const { role } = req.query;
        console.log('🔍 [ADMIN] Consultando usuarios admin...', role ? `Filtro: ${role}` : 'Sin filtro');
        
        let query_72 = `SELECT id, username, email, full_name, role, active, created_at, 
                            documento, telefono, departamento
                     FROM copig.admin_users`;
        
        const params_108 = [];
        
        if (role) {
            query += ' WHERE role = $1';
            params.push(role);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result_84 = await pool.query(query, params);
        
        // Siempre devolver formato consistente
        res.json({ 
            success: true, 
            users: result.rows 
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo usuarios:', error);
        res.status(500).json({ success: false, error: 'Error obteniendo usuarios' });
    }
});

// Expediente de profesional
app.get('/api/admin/profesionales/:id/expediente', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 [ADMIN] Consultando expediente profesional ID: ${id}`);
        
        // Obtener datos del profesional
        const profesional = await pool.query(`
                SELECT p.*, 
                       m.numero_matricula, 
                       m.fecha_inscripcion, 
                       m.fecha_habilitacion, 
                       m.fecha_titulo,
                       m.categoria as categoria_matricula,
                       m.activo as matricula_activa
                FROM copig.profesionales p
                LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
                WHERE p.id = $1
            `, [id]);
        if (profesional.rows.length === 0) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        
        // Obtener matrícula por separado
        let matricula_profesional = null;
        let matricula_activa = null;
        
        try {
            const matricula_107 = await pool.query('SELECT numero_matricula, activo FROM copig.matriculas WHERE profesional_id = $1', [id]);
            if (matricula.rows.length > 0) {
                matricula_profesional = matricula.rows[0].numero_matricula;
                matricula_activa = matricula.rows[0].activo;
            }
        } catch (err) {
            console.log('⚠️ Error obteniendo matrícula:', err.message);
        }
        
        // Obtener pagos históricos
        let historialPagos = [];
        let totalPagos = 0;
        let ultimoPago_102 = null;
        
        try {
            const matriculaNum = matricula_profesional || profesional.rows[0].numero_documento;
            const pagos_112 = await pool.query(`
                SELECT fecha_pago as fecha, detalle as concepto, importe, numero_recibo
                FROM copig.pagos_historicos 
                WHERE matricula = $1 
                ORDER BY fecha_pago DESC
            `, [matriculaNum]);
            
            historialPagos = pagos.rows;
            if (historialPagos.length > 0) {
                totalPagos = historialPagos.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0);
                ultimoPago = historialPagos[0].fecha;
            }
            
            console.log(`💰 Pagos encontrados: ${historialPagos.length}, Total: $${totalPagos}`);
        } catch (error) {
            console.error('❌ Error obteniendo pagos:', error.message);
        }
        
        // Respuesta
        res.json({
            ...profesional.rows[0],
            matricula_profesional,
            matricula_activa,
            historialPagos,
            totalPagos,
            ultimoPago
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo expediente:', error);
        res.status(500).json({ error: 'Error obteniendo expediente' });
    }
});

// Debug de tablas de pagos
app.get('/api/admin/debug/tablas-pagos', requireAuth, async (req, res) => {
    try {
        // Ver todas las tablas
        const todasTablas = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            ORDER BY table_name
        `);
        
        // Buscar tablas con "pago"
        const tablasPagos = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name ILIKE '%pago%'
        `);
        
        // Ver estructura de la tabla profesionales para referencia
        const estructuraProfesionales = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'copig' 
            AND table_name = 'profesionales'
            ORDER BY ordinal_position
        `);
        
        res.json({
            todas_tablas: todasTablas.rows.map(r => r.table_name),
            tablas_pagos: tablasPagos.rows.map(r => r.table_name),
            estructura_profesionales: estructuraProfesionales.rows
        });
    } catch (error) {
        console.error('❌ Error en debug tablas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Solicitud específica por ID
app.get('/api/admin/solicitud/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 [ADMIN] Consultando solicitud ID: ${id}`);
        
        // Placeholder - implementar según estructura real
        res.json({
            id: id,
            tipo: 'CHP',
            estado: 'pendiente',
            fecha: new Date().toISOString(),
            profesional_id: null
        });
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo solicitud:', error);
        res.status(500).json({ error: 'Error obteniendo solicitud' });
    }
});

// Archivos de solicitud
app.get('/api/admin/solicitud/:id/archivos', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 [ADMIN] Consultando archivos solicitud ID: ${id}`);
        
        // Placeholder - devolver array vacío
        res.json([]);
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo archivos:', error);
        res.status(500).json({ error: 'Error obteniendo archivos' });
    }
});

// Generar factura
app.post('/api/admin/generar-factura', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Generando factura...');
        
        // Placeholder - funcionalidad en desarrollo
        res.json({ success: true, message: 'Funcionalidad de facturación en desarrollo' });
    } catch (error) {
        console.error('❌ [ADMIN] Error generando factura:', error);
        res.status(500).json({ error: 'Error generando factura' });
    }
});

// Aprobar solicitud CHP
app.post('/api/admin/aprobar-chp', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Aprobando solicitud CHP...');
        
        // Placeholder - funcionalidad en desarrollo
        res.json({ success: true, message: 'Funcionalidad de CHP en desarrollo' });
    } catch (error) {
        console.error('❌ [ADMIN] Error aprobando CHP:', error);
        res.status(500).json({ error: 'Error aprobando CHP' });
    }
});

// Actualizar usuario admin
app.put('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, documento, email, telefono, departamento, role, active, password } = req.body;
        
        console.log(`🔍 [ADMIN] Actualizando usuario ID: ${id}`);
        
        // Construir query dinámicamente según los campos proporcionados
        let updateFields = [];
        let values = [];
        let paramCount_94 = 1;
        
        if (full_name !== undefined) {
            updateFields.push(`full_name = $${paramCount++}`);
            values.push(full_name);
        }
        
        if (documento !== undefined) {
            updateFields.push(`documento = $${paramCount++}`);
            values.push(documento);
            // También actualizar username si es igual al documento
            updateFields.push(`username = $${paramCount++}`);
            values.push(documento);
        }
        
        if (email !== undefined) {
            updateFields.push(`email = $${paramCount++}`);
            values.push(email);
        }
        
        if (telefono !== undefined) {
            updateFields.push(`telefono = $${paramCount++}`);
            values.push(telefono);
        }
        
        if (departamento !== undefined) {
            updateFields.push(`departamento = $${paramCount++}`);
            values.push(departamento);
        }
        
        if (role !== undefined) {
            updateFields.push(`role = $${paramCount++}`);
            values.push(role);
        }
        
        if (active !== undefined) {
            updateFields.push(`active = $${paramCount++}`);
            values.push(active);
        }
        
        // Si se proporciona nueva contraseña, encriptarla
        if (password) {
            const bcrypt_75 = require('bcryptjs');
            const hashedPassword_76 = await bcrypt.hash(password, 12);
            updateFields.push(`password_hash = $${paramCount++}`);
            values.push(hashedPassword);
        }
        
        // Agregar updated_at
        updateFields.push(`updated_at = NOW()`);
        
        // Agregar el ID al final de los valores
        values.push(id);
        
        // Ejecutar la actualización
        const query_93 = `UPDATE copig.admin_users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
        
        await pool.query(query, values);
        
        console.log(`✅ [ADMIN] Usuario ID ${id} actualizado exitosamente`);
        
        res.json({ 
            success: true, 
            message: 'Usuario actualizado exitosamente' 
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error actualizando usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error actualizando usuario',
            error: error.message 
        });
    }
});

// Eliminar usuario admin
app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ [ADMIN] Eliminando usuario ID: ${id}`);
        
        // Verificar que no sea el último super_admin
        const checkResult = await pool.query(
            'SELECT COUNT(*) as count FROM copig.admin_users WHERE role = $1 AND id != $2',
            ['super_admin', id]
        );
        
        const userResult = await pool.query(
            'SELECT role, username FROM copig.admin_users WHERE id = $1',
            [id]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        
        const userToDelete = userResult.rows[0];
        
        // Si es super_admin y es el último, no permitir eliminación
        if (userToDelete.role === 'super_admin' && parseInt(checkResult.rows[0].count) === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el último super administrador' 
            });
        }
        
        // Eliminar usuario
        await pool.query('DELETE FROM copig.admin_users WHERE id = $1', [id]);
        
        console.log(`✅ [ADMIN] Usuario ${userToDelete.username} eliminado exitosamente`);
        res.json({ 
            success: true, 
            message: `Usuario ${userToDelete.username} eliminado exitosamente` 
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
});

// Crear usuario unificado (sin nomenclatura ADM-XXX o STAFF-XXX)
app.post('/api/admin/create-unified-user', requireAuth, async (req, res) => {
    try {
        const { username, documento, full_name, email, telefono, departamento, password, role, active } = req.body;
        
        console.log(`🔍 [ADMIN] Creando nuevo usuario tipo ${role}: ${full_name}`);
        
        // Validaciones
        if (!documento || !full_name || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios' 
            });
        }
        
        // Verificar si ya existe
        const checkExisting_77 = await pool.query(
            'SELECT id FROM copig.admin_users WHERE username = $1 OR documento = $2',
            [username || documento, documento]
        );
        
        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un usuario con ese DNI' 
            });
        }
        
        // Encriptar contraseña
        const bcrypt_78 = require('bcryptjs');
        const hashedPassword_79 = await bcrypt.hash(password, 12);
        
        // Insertar usuario (usando DNI como username)
        await pool.query(
            `INSERT INTO copig.admin_users 
            (username, email, password_hash, full_name, role, documento, telefono, departamento, active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [username || documento, email, hashedPassword, full_name, role, documento, telefono, departamento, active !== false]
        );
        
        console.log(`✅ [ADMIN] Usuario ${role} creado: ${full_name} (DNI: ${documento})`);
        
        res.json({ 
            success: true, 
            message: `Usuario ${role} creado exitosamente`
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error creando usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el usuario' 
        });
    }
});

// Crear usuario administrador (DEPRECADO - mantener por compatibilidad)
app.post('/api/admin/create-admin', requireAuth, async (req, res) => {
    try {
        const { usuario, documento, nombreCompleto, email, telefono } = req.body;
        
        console.log('🔍 [ADMIN] Creando nuevo administrador:', usuario);
        
        // Validaciones
        if (!usuario || !documento || !nombreCompleto) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios' 
            });
        }
        
        // Verificar formato ADM-XXX
        if (!usuario.startsWith('ADM-')) {
            return res.status(400).json({ 
                success: false, 
                message: 'El usuario debe comenzar con ADM-' 
            });
        }
        
        // Verificar si ya existe
        const checkExisting_80 = await pool.query(
            'SELECT id FROM copig.admin_users WHERE username = $1 OR documento = $2',
            [usuario, documento]
        );
        
        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un usuario con ese nombre o documento' 
            });
        }
        
        // Generar contraseña inicial
        const initialPassword_81 = `admin${Math.random().toString(36).slice(2, 8)}`;
        const bcrypt_82 = require('bcryptjs');
        const hashedPassword_83 = await bcrypt.hash(initialPassword, 12);
        
        // Insertar usuario
        await pool.query(
            `INSERT INTO copig.admin_users 
            (username, email, password_hash, full_name, role, documento, telefono, active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())`,
            [usuario, email, hashedPassword, nombreCompleto, 'admin', documento, telefono]
        );
        
        console.log(`✅ [ADMIN] Administrador ${usuario} creado exitosamente`);
        
        res.json({ 
            success: true, 
            message: 'Administrador creado exitosamente',
            initialPassword: initialPassword
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error creando administrador:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el administrador' 
        });
    }
});

// Crear usuario staff
app.post('/api/admin/create-staff', requireAuth, async (req, res) => {
    try {
        const { usuario, documento, nombreCompleto, email, telefono, departamento } = req.body;
        
        console.log('🔍 [ADMIN] Creando nuevo staff:', usuario);
        
        // Validaciones
        if (!usuario || !documento || !nombreCompleto) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faltan campos obligatorios' 
            });
        }
        
        // Verificar formato STAFF-XXX
        if (!usuario.startsWith('STAFF-')) {
            return res.status(400).json({ 
                success: false, 
                message: 'El usuario debe comenzar con STAFF-' 
            });
        }
        
        // Verificar si ya existe
        const checkExisting = await pool.query(
            'SELECT id FROM copig.admin_users WHERE username = $1 OR documento = $2',
            [usuario, documento]
        );
        
        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe un usuario con ese nombre o documento' 
            });
        }
        
        // Generar contraseña inicial
        const initialPassword = `staff${Math.random().toString(36).slice(2, 8)}`;
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(initialPassword, 12);
        
        // Insertar usuario
        await pool.query(
            `INSERT INTO copig.admin_users 
            (username, email, password_hash, full_name, role, documento, telefono, departamento, active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())`,
            [usuario, email, hashedPassword, nombreCompleto, 'staff', documento, telefono, departamento]
        );
        
        console.log(`✅ [ADMIN] Staff ${usuario} creado exitosamente`);
        
        res.json({ 
            success: true, 
            message: 'Usuario staff creado exitosamente',
            initialPassword: initialPassword
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error creando staff:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear el usuario staff' 
        });
    }
});

// Listar administradores
app.get('/api/admin/list-admins', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Listando administradores...');
        
        const result_85 = await pool.query(
            `SELECT id, username, email, full_name, documento, telefono, active, created_at, 
                    updated_at, last_login, password_hash IS NOT NULL as password_set
             FROM copig.admin_users 
             WHERE role IN ('admin', 'super_admin')
             ORDER BY username`
        );
        
        res.json({ 
            success: true, 
            users: result.rows 
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error listando administradores:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al listar administradores' 
        });
    }
});

// Listar staff
app.get('/api/admin/list-staff', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Listando staff...');
        
        const result_89 = await pool.query(
            `SELECT id, username, email, full_name, documento, telefono, departamento, 
                    active, created_at, updated_at, last_login, 
                    password_hash IS NOT NULL as password_set
             FROM copig.admin_users 
             WHERE role = 'staff'
             ORDER BY username`
        );
        
        res.json({ 
            success: true, 
            users: result.rows 
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error listando staff:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al listar staff' 
        });
    }
});

// Cambiar contraseña de usuario
app.post('/api/admin/users/change-password', requireAuth, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Cambiando contraseña...');
        
        // Placeholder - funcionalidad en desarrollo
        res.json({ success: true, message: 'Funcionalidad en desarrollo' });
    } catch (error) {
        console.error('❌ [ADMIN] Error cambiando contraseña:', error);
        res.status(500).json({ error: 'Error cambiando contraseña' });
    }
});

// WebSocket para notificaciones
io.on('connection', (socket) => {
    console.log('Usuario conectado');
    
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Función para inicializar tablas de base de datos
async function initializeDatabase() {
    try {
        console.log('🔍 Inicializando tablas de base de datos...');
        
        // Crear tabla solicitudes_chp si no existe (referenciada por las nuevas tablas)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.solicitudes_chp (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                comitente VARCHAR(255) NOT NULL,
                proyecto VARCHAR(255) NOT NULL,
                descripcion TEXT,
                tipo_obra VARCHAR(100),
                estado VARCHAR(50) DEFAULT 'pendiente',
                fecha_solicitud TIMESTAMP DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla solicitudes_chp verificada/creada');

        // Crear tabla profesionales_auth si no existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.profesionales_auth (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id) UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                first_login BOOLEAN DEFAULT true,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla profesionales_auth verificada/creada');

        // Crear tabla documentos_profesional
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.documentos_profesional (
                id SERIAL PRIMARY KEY,
                profesional_id INTEGER REFERENCES copig.profesionales(id),
                solicitud_chp_id INTEGER REFERENCES copig.solicitudes_chp(id),
                categoria VARCHAR(50),
                nombre_archivo VARCHAR(255),
                ruta_archivo VARCHAR(500),
                fecha_upload TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla documentos_profesional verificada/creada');

        // Crear tabla certificados_chp
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.certificados_chp (
                id SERIAL PRIMARY KEY,
                solicitud_chp_id INTEGER REFERENCES copig.solicitudes_chp(id),
                numero_certificado VARCHAR(50),
                fecha_emision DATE,
                estado VARCHAR(20),
                archivo_pdf VARCHAR(500),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla certificados_chp verificada/creada');

        // Crear tabla empresas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.empresas (
                id SERIAL PRIMARY KEY,
                razon_social VARCHAR(255) NOT NULL,
                cuit VARCHAR(15) UNIQUE,
                email VARCHAR(255),
                telefono VARCHAR(50),
                direccion TEXT,
                activo BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ Tabla empresas verificada/creada');

        // Crear tabla representantes_tecnicos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.representantes_tecnicos (
                id SERIAL PRIMARY KEY,
                empresa_id INTEGER NOT NULL REFERENCES copig.empresas(id) ON DELETE CASCADE,
                profesional_id INTEGER NOT NULL REFERENCES copig.profesionales(id) ON DELETE CASCADE,
                titulo_externo VARCHAR(255),
                categoria_representacion VARCHAR(100),
                fecha_designacion DATE DEFAULT CURRENT_DATE,
                activo BOOLEAN DEFAULT true,
                observaciones TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(empresa_id, profesional_id)
            )
        `);
        
        // Agregar columnas faltantes si la tabla ya existe
        await pool.query(`
            ALTER TABLE copig.representantes_tecnicos 
            ADD COLUMN IF NOT EXISTS titulo_externo VARCHAR(255),
            ADD COLUMN IF NOT EXISTS categoria_representacion VARCHAR(100)
        `);
        console.log('✅ Tabla representantes_tecnicos verificada/creada');

        // Crear tabla user_roles para sistema de roles configurables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.user_roles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                user_type VARCHAR(20) NOT NULL, -- 'admin' o 'profesional'
                role_type VARCHAR(50) NOT NULL, -- 'profesional', 'admin_partial', 'admin_full', 'super_admin'
                permissions JSONB DEFAULT '{}',
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, user_type)
            )
        `);
        console.log('✅ Tabla user_roles verificada/creada');
        
        console.log('🎉 Inicialización de base de datos completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        console.error('❌ Detalle del error:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        // No detener el servidor, solo registrar el error
    }
}

// Endpoint de debug para verificar sesión
app.get('/api/session-info', (req, res) => {
    res.json({
        user: req.session.user || null,
        profesionalId: req.session.profesionalId || null,
        adminId: req.session.adminId || null,
        staffId: req.session.staffId || null,
        sessionExists: !!req.session
    });
});

// ============================================
// ENDPOINTS SISTEMA CHP
// ============================================

// Crear nueva solicitud CHP (profesionales)
app.post('/api/profesional/solicitud-chp', async (req, res) => {
    try {
        const { comitente, proyecto, descripcion, ubicacion_obra, observaciones } = req.body;
        const profesional_id_90 = req.session.profesionalId;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        // Generar número de solicitud
        const numeroResult = await pool.query(`
            SELECT 'CHP-' || TO_CHAR(NOW(), 'YYYY') || '-' || nextval('copig.chp_numero_seq')::text as numero
        `);
        const numero_solicitud = numeroResult.rows[0].numero;
        
        // Insertar solicitud
        const result_91 = await pool.query(`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra, observaciones)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [profesional_id, numero_solicitud, comitente, proyecto, descripcion, ubicacion_obra, observaciones]);
        
        res.json({ 
            success: true, 
            message: 'Solicitud creada exitosamente',
            numeroSolicitud: numero_solicitud,
            solicitud: result.rows[0]
        });
    } catch (error) {
        console.error('Error creando solicitud CHP:', error);
        res.status(500).json({ success: false, message: 'Error al crear la solicitud' });
    }
});

// Obtener solicitudes del profesional
app.get('/api/profesional/solicitudes-chp', async (req, res) => {
    try {
        const profesional_id = req.session.profesionalId;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result_92 = await pool.query(`
            SELECT s.*, 
                   p.nombre as profesional_nombre
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            WHERE s.profesional_id = $1
            ORDER BY s.fecha_solicitud DESC
        `, [profesional_id]);
        
        res.json({ success: true, solicitudes: result.rows });
    } catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// Obtener todas las solicitudes (admin)
app.get('/api/admin/solicitudes-chp', async (req, res) => {
    try {
        if (!req.session.adminId && !req.session.staffId) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result_95 = await pool.query(`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   p.numero_documento,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        `);
        
        res.json({ success: true, solicitudes: result.rows });
    } catch (error) {
        console.error('Error obteniendo solicitudes admin:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// Actualizar estado de solicitud (admin)
app.put('/api/admin/solicitud-chp/:id', async (req, res) => {
    try {
        if (!req.session.adminId && !req.session.staffId) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { estado, motivo_rechazo, descripcion, arancel_establecido, accion } = req.body;
        const aprobado_por = req.session.adminId || req.session.staffId;
        
        // Manejar diferentes acciones
        let query_116, params;
        
        if (accion === 'corregir_descripcion') {
            // Solo actualizar descripción
            query = `
                UPDATE copig.solicitudes_chp 
                SET descripcion = $1, fecha_actualizacion = NOW()
                WHERE id = $2 RETURNING *
            `;
            params = [descripcion, id];
        } else if (accion === 'generar_factura') {
            // Establecer arancel y cambiar estado a ESPERANDO_PAGO
            query = `
                UPDATE copig.solicitudes_chp 
                SET estado = 'ESPERANDO_PAGO', 
                    arancel_establecido = $1,
                    fecha_actualizacion = NOW(),
                    aprobado_por = $2
                WHERE id = $3 RETURNING *
            `;
            params = [arancel_establecido, aprobado_por, id];
        } else {
            // Lógica original para cambios de estado
            query = `
                UPDATE copig.solicitudes_chp 
                SET estado = $1, 
                    fecha_actualizacion = NOW()
            `;
            params = [estado];
            let paramCount = 2;
            
            if (estado === 'APROBADO') {
                query += `, aprobado_por = $${paramCount}, fecha_aprobacion = NOW()`;
                params.push(aprobado_por);
                paramCount++;
            }
            
            if (estado === 'RECHAZADO' && motivo_rechazo) {
                query += `, motivo_rechazo = $${paramCount}`;
                params.push(motivo_rechazo);
                paramCount++;
            }
            
            if (arancel_establecido) {
                query += `, arancel_establecido = $${paramCount}`;
                params.push(arancel_establecido);
                paramCount++;
            }
            
            query += ` WHERE id = $${paramCount} RETURNING *`;
            params.push(id);
        }
        
        const result_96 = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        
        res.json({ success: true, solicitud: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando solicitud:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la solicitud' });
    }
});



// ========================================================================
// ENDPOINTS CHP SEGÚN FLUJO PDF - AGREGADO VIA SCRIPT EXTERNO
// ========================================================================

// Obtener solicitud específica para revisión (3 secciones PDF)
app.get('/api/admin/solicitud-chp/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 [ADMIN] Consultando solicitud CHP para revisión:', id);
        
        const result_100 = await pool.query(`
            SELECT s.*, p.nombre as profesional_nombre, p.numero_documento,
                   m.numero_matricula,
                   f.numero_factura, f.monto_factura, f.fecha_factura
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id  
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.facturas_chp f ON s.id = f.solicitud_id
            WHERE s.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }
        
        const solicitud = result.rows[0];
        
        res.json({
            success: true,
            solicitud: {
                ...solicitud,
                matricula: solicitud.numero_matricula
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo solicitud CHP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor' 
        });
    }
});

// Generar factura y notificar (Paso 3 del PDF)
app.post('/api/admin/chp/generar-factura', requireAuth, async (req, res) => {
    try {
        const { solicitud_id, arancel, descripcion_corregida } = req.body;
        console.log('🔍 [ADMIN] Generando factura CHP:', solicitud_id, 'Arancel:', arancel);
        
        const client_98 = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Actualizar solicitud
            await client.query(`
                UPDATE copig.solicitudes_chp 
                SET estado = 'ESPERANDO_PAGO',
                    descripcion_corregida = $1,
                    arancel_establecido = $2,
                    fecha_inicio_revision = NOW(),
                    fecha_fin_revision = NOW(),
                    revisado_por = $3,
                    fecha_revision = NOW()
                WHERE id = $4
            `, [descripcion_corregida, arancel, req.session.user.id, solicitud_id]);
            
            // Generar número de factura
            const numeroFactura = `FCCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
            
            // Crear factura
            await client.query(`
                INSERT INTO copig.facturas_chp 
                (solicitud_id, numero_factura, monto_factura, fecha_factura, estado_factura)
                VALUES ($1, $2, $3, NOW(), 'PENDIENTE')
            `, [solicitud_id, numeroFactura, arancel]);
            
            // Crear notificación para el profesional
            await client.query(`
                INSERT INTO copig.notificaciones_chp 
                (solicitud_id, tipo, mensaje, fecha_envio)
                VALUES ($1, 'FACTURA_GENERADA', $2, NOW())
            `, [solicitud_id, `Su solicitud ha sido revisada. Factura ${numeroFactura} por $${arancel} generada. Puede proceder con el pago.`]);
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Factura generada y notificación enviada',
                numero_factura: numeroFactura,
                monto: arancel
            });
            
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ [ADMIN] Error generando factura CHP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error generando factura: ' + error.message 
        });
    }
});

// Verificar pago (Paso 5 del PDF)
app.post('/api/admin/chp/verificar-pago', requireAuth, async (req, res) => {
    try {
        const { solicitud_id } = req.body;
        console.log('🔍 [ADMIN] Verificando pago CHP:', solicitud_id);
        
        const client_99 = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Actualizar solicitud a LISTA_PARA_EMITIR
            await client.query(`
                UPDATE copig.solicitudes_chp 
                SET estado = 'LISTA_PARA_EMITIR',
                    pago_verificado = true,
                    verificado_por = $1,
                    fecha_verificacion_pago = NOW()
                WHERE id = $2
            `, [req.session.user.id, solicitud_id]);
            
            // Actualizar factura
            await client.query(`
                UPDATE copig.facturas_chp 
                SET estado_factura = 'PAGADA',
                    fecha_pago_verificado = NOW()
                WHERE solicitud_id = $1
            `, [solicitud_id]);
            
            // Notificar al profesional
            await client.query(`
                INSERT INTO copig.notificaciones_chp 
                (solicitud_id, tipo, mensaje, fecha_envio)
                VALUES ($1, 'PAGO_VERIFICADO', 'Su pago ha sido verificado. El CHP está siendo procesado para emisión.', NOW())
            `, [solicitud_id]);
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Pago verificado exitosamente'
            });
            
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ [ADMIN] Error verificando pago CHP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error verificando pago: ' + error.message 
        });
    }
});

// Emitir CHP final (Paso 6 del PDF)
app.post('/api/admin/chp/emitir', requireAuth, async (req, res) => {
    try {
        const { solicitud_id } = req.body;
        console.log('🔍 [ADMIN] Emitiendo CHP final:', solicitud_id);
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Generar número de CHP
            const numeroCHP = `CHP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
            
            // Actualizar solicitud a EMITIDO
            await client.query(`
                UPDATE copig.solicitudes_chp 
                SET estado = 'EMITIDO',
                    numero_chp = $1,
                    fecha_aprobacion = NOW(),
                    aprobado_por = $2
                WHERE id = $3
            `, [numeroCHP, req.session.user.id, solicitud_id]);
            
            // Crear certificado CHP
            await client.query(`
                INSERT INTO copig.certificados_chp 
                (solicitud_id, numero_chp, fecha_emision, emitido_por, estado)
                VALUES ($1, $2, NOW(), $3, 'ACTIVO')
            `, [solicitud_id, numeroCHP, req.session.user.id]);
            
            // Notificar al profesional
            await client.query(`
                INSERT INTO copig.notificaciones_chp 
                (solicitud_id, tipo, mensaje, fecha_envio)
                VALUES ($1, 'CHP_EMITIDO', $2, NOW())
            `, [solicitud_id, `Su CHP ${numeroCHP} ha sido emitido y está disponible para descarga en su portal.`]);
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: 'CHP emitido exitosamente',
                numero_chp: numeroCHP
            });
            
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ [ADMIN] Error emitiendo CHP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error emitiendo CHP: ' + error.message 
        });
    }
});

// Rechazar solicitud
app.post('/api/admin/chp/rechazar', requireAuth, async (req, res) => {
    try {
        const { solicitud_id, motivo_rechazo } = req.body;
        console.log('🔍 [ADMIN] Rechazando solicitud CHP:', solicitud_id);
        
        await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET estado = 'RECHAZADO',
                motivo_rechazo = $1,
                fecha_rechazo = NOW(),
                admin_id = $2
            WHERE id = $3
        `, [motivo_rechazo, req.session.user.id, solicitud_id]);
        
        // Notificar al profesional
        await pool.query(`
            INSERT INTO copig.notificaciones_chp 
            (solicitud_id, tipo, mensaje, fecha_envio)
            VALUES ($1, 'SOLICITUD_RECHAZADA', $2, NOW())
        `, [solicitud_id, `Su solicitud ha sido rechazada. Motivo: ${motivo_rechazo}`]);
        
        res.json({
            success: true,
            message: 'Solicitud rechazada'
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error rechazando solicitud CHP:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error rechazando solicitud: ' + error.message 
        });
    }
});

// FIN ENDPOINTS CHP FLUJO PDF
// ========================================================================




// Endpoint específico para fechas de matriculación
app.get('/api/admin/profesional/:id/matriculacion', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 [ADMIN] Consultando fechas matriculación profesional:', id);
        
        const result_103 = await pool.query(`
            SELECT p.nombre, p.numero_documento,
                   m.numero_matricula, 
                   m.fecha_inscripcion, 
                   m.fecha_habilitacion, 
                   m.fecha_titulo,
                   m.fecha_certificado,
                   m.fecha_pago as fecha_pago_matricula,
                   m.vencimiento_habilitacion,
                   m.categoria,
                   m.activo as matricula_activa
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profesional no encontrado'
            });
        }
        
        res.json({
            success: true,
            matriculacion: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo fechas matriculación:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor' 
        });
    }
});

// Endpoint específico para pagos históricos de un profesional
app.get('/api/admin/profesional/:id/pagos', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 [ADMIN] Consultando pagos históricos profesional:', id);
        
        // Obtener matrícula del profesional
        const matriculaResult = await pool.query(`
            SELECT m.numero_matricula 
            FROM copig.matriculas m 
            WHERE m.profesional_id = $1
        `, [id]);
        
        if (matriculaResult.rows.length === 0) {
            return res.json({
                success: true,
                pagos: [],
                message: 'Profesional sin matrícula registrada'
            });
        }
        
        const numeroMatricula = matriculaResult.rows[0].numero_matricula;
        
        // Obtener pagos históricos
        const pagosResult = await pool.query(`
            SELECT fecha_pago, importe, detalle as concepto, detalle, estado, numero_recibo
            FROM copig.pagos_historicos 
            WHERE matricula::text = $1::text
            ORDER BY fecha_pago DESC
            LIMIT 50
        `, [numeroMatricula]);
        
        // Calcular estadísticas
        const totalPagado = pagosResult.rows.reduce((sum, pago) => sum + (parseFloat(pago.importe) || 0), 0);
        const ultimoPago = pagosResult.rows.length > 0 ? pagosResult.rows[0].fecha_pago : null;
        
        res.json({
            success: true,
            matricula: numeroMatricula,
            pagos: pagosResult.rows,
            estadisticas: {
                total_pagos: pagosResult.rows.length,
                monto_total: totalPagado,
                ultimo_pago: ultimoPago
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo pagos históricos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error interno del servidor' 
        });
    }
});

// Iniciar servidor con inicialización de base de datos
server.listen(PORT, async () => {
    console.log(`🚀 Servidor COPIG ejecutándose en puerto ${PORT}`);
    console.log(`📊 Dashboard disponible en: http://localhost:${PORT}/dashboard`);
    console.log(`🛡️  Panel administrativo disponible en: http://localhost:${PORT}/admin`);
    console.log(`🌐 Portal unificado disponible en: http://localhost:${PORT}/portal`);
    console.log(`🏢 Gestión de empresas disponible en: http://localhost:${PORT}/empresas`);
    
    // Inicializar tablas de base de datos
    await initializeDatabase();
    
    console.log('✅ Sistema COPIG iniciado correctamente - SIN ENRIQUECIMIENTO');
    console.log('💰 Gestión Financiera disponible en: http://localhost:3030/gestion-financiera');
});

// ========================================
// ENDPOINTS SISTEMA FINANCIERO
// ========================================

// API para obtener detalle de un pago específico
app.get('/api/financial/pago/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result_113 = await pool.query(
            'SELECT * FROM copig.pagos_historicos WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo detalle del pago:', error);
        res.status(500).json({ error: 'Error al obtener el detalle del pago' });
    }
});

// Estadísticas financieras mejoradas
app.get('/api/financial/stats', async (req, res) => {
    try {
        const stats_121 = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.pagos_historicos) as total_pagos,
                (SELECT COUNT(*) FROM copig.restricciones_deudas) as total_restricciones,
                (SELECT MAX(fecha_pago) FROM copig.pagos_historicos) as ultimo_pago,
                (SELECT SUM(importe) FROM copig.pagos_historicos) as monto_total
        `);
        
        // Estadísticas por tipo de pago
        const tiposPago = await pool.query(`
            SELECT 
                COUNT(CASE WHEN detalle ILIKE '%DER.INSC%' OR detalle ILIKE '%MATRICULA%' THEN 1 END) as matriculas,
                COUNT(CASE WHEN detalle ILIKE '%CUOTA%' OR detalle LIKE '%/4%' THEN 1 END) as cuotas,
                COUNT(CASE WHEN detalle ILIKE '%MULTA%' OR detalle ILIKE '%REINSC%' THEN 1 END) as multas,
                COUNT(CASE WHEN detalle ILIKE '%RECARGO%' THEN 1 END) as recargos
            FROM copig.pagos_historicos
        `);
        
        res.json({
            totalPagos: parseInt(stats.rows[0].total_pagos),
            totalRestricciones: parseInt(stats.rows[0].total_restricciones),
            ultimoPago: stats.rows[0].ultimo_pago,
            montoTotal: parseFloat(stats.rows[0].monto_total || 0),
            pagosPorTipo: {
                matriculas: parseInt(tiposPago.rows[0].matriculas),
                cuotas: parseInt(tiposPago.rows[0].cuotas),
                multas: parseInt(tiposPago.rows[0].multas),
                recargos: parseInt(tiposPago.rows[0].recargos)
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Función helper para identificar tipo de pago según Peñaloza
function identificarTipoPago(detalle) {
    if (!detalle) return { tipo: 'OTRO', label: 'Otro', color: '#6c757d' };
    
    const detalleUpper = detalle.toUpperCase();
    
    // Concepto 1: Matrículas
    if (detalleUpper.includes('DER.INSC') || detalleUpper.includes('DER.MATR') || 
        detalleUpper.includes('MATRICULA') || detalleUpper.includes('INSCRIPCION')) {
        return { tipo: 'MATRICULA', label: 'Matrícula', color: '#007bff' };
    }
    
    // Concepto 4: Cuotas de planes de pago
    if (detalleUpper.includes('CUOTA') || detalleUpper.includes('/4')) {
        return { tipo: 'CUOTA', label: 'Cuota Plan', color: '#28a745' };
    }
    
    // Concepto 8: Reinscripciones y multas
    if (detalleUpper.includes('MULTA') || detalleUpper.includes('REINSC')) {
        return { tipo: 'MULTA', label: 'Multa/Reinsc.', color: '#dc3545' };
    }
    
    // Otros conceptos comunes
    if (detalleUpper.includes('RECARGO')) {
        return { tipo: 'RECARGO', label: 'Recargo', color: '#fd7e14' };
    }
    
    if (detalleUpper.includes('GAS.ADM') || detalleUpper.includes('GASTOS')) {
        return { tipo: 'GASTOS', label: 'Gastos Admin.', color: '#6f42c1' };
    }
    
    if (detalleUpper.includes('CANCEL') || detalleUpper.includes('A CUENTA')) {
        return { tipo: 'PAGO_PARCIAL', label: 'Pago Parcial', color: '#ffc107' };
    }
    
    if (detalleUpper.includes('RESOL')) {
        return { tipo: 'RESOLUCION', label: 'Resolución', color: '#17a2b8' };
    }
    
    return { tipo: 'OTRO', label: 'Otro', color: '#6c757d' };
}

// Obtener pagos con paginación y filtros mejorados
app.get('/api/financial/pagos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const matricula = req.query.matricula || '';
        const tipo = req.query.tipo || '';
        
        let whereConditions = [];
        let params_117 = [];
        let paramCounter = 1;
        
        if (matricula) {
            whereConditions.push(`matricula ILIKE $${paramCounter}`);
            params.push(`%${matricula}%`);
            paramCounter++;
        }
        
        if (tipo && tipo !== 'todos') {
            switch(tipo) {
                case 'matricula':
                    whereConditions.push(`(detalle ILIKE '%DER.INSC%' OR detalle ILIKE '%MATRICULA%' OR detalle ILIKE '%DER.MATR%' OR detalle ILIKE '%INSCRIPCION%')`);
                    break;
                case 'cuota':
                    whereConditions.push(`(detalle ILIKE '%CUOTA%' OR detalle LIKE '%/4%')`);
                    break;
                case 'multa':
                    whereConditions.push(`(detalle ILIKE '%MULTA%' OR detalle ILIKE '%REINSC%')`);
                    break;
                case 'recargo':
                    whereConditions.push(`detalle ILIKE '%RECARGO%'`);
                    break;
                case 'gastos':
                    whereConditions.push(`(detalle ILIKE '%GAS.ADM%' OR detalle ILIKE '%GASTOS%')`);
                    break;
            }
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Agregar limit y offset al final
        params.push(limit);
        params.push(offset);
        
        const pagosQuery = `
            SELECT * FROM copig.pagos_historicos 
            ${whereClause}
            ORDER BY fecha_pago DESC NULLS LAST, id DESC 
            LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
        `;
        
        const countQuery = `
            SELECT COUNT(*) FROM copig.pagos_historicos 
            ${whereClause}
        `;
        
        const pagos_115 = await pool.query(pagosQuery, params);
        const count = await pool.query(countQuery, params.slice(0, -2));
        
        // Agregar tipo de pago a cada registro
        const pagosConTipo = pagos.rows.map(pago => ({
            ...pago,
            tipo_pago: identificarTipoPago(pago.detalle)
        }));
        
        res.json({
            pagos: pagosConTipo,
            totalRecords: parseInt(count.rows[0].count),
            totalPages: Math.ceil(count.rows[0].count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error obteniendo pagos:', error);
        res.status(500).json({ error: 'Error al obtener pagos' });
    }
});

// Obtener restricciones
app.get('/api/financial/restricciones', async (req, res) => {
    try {
        const result_114 = await pool.query(`
            SELECT * FROM copig.restricciones_deudas 
            ORDER BY id DESC 
            LIMIT 100
        `);
        
        res.json({ restricciones: result.rows });
    } catch (error) {
        console.error('Error obteniendo restricciones:', error);
        res.status(500).json({ error: 'Error al obtener restricciones' });
    }
});

// Obtener sanciones
app.get('/api/financial/sanciones', async (req, res) => {
    try {
        const result_126 = await pool.query(`
            SELECT * FROM copig.sanciones_aplicadas 
            ORDER BY id DESC 
            LIMIT 100
        `);
        
        res.json({ sanciones: result.rows });
    } catch (error) {
        console.error('Error obteniendo sanciones:', error);
        res.status(500).json({ error: 'Error al obtener sanciones' });
    }
});

// Resumen financiero por matrícula
app.get('/api/financial/resumen/:matricula', async (req, res) => {
    try {
        const { matricula } = req.params;
        
        // Buscar pagos
        const pagos = await pool.query(`
            SELECT COUNT(*) as total, SUM(importe) as monto_total, MAX(fecha_pago) as ultimo_pago
            FROM copig.pagos_historicos 
            WHERE matricula = $1
        `, [matricula]);
        
        // Últimos 5 pagos
        const ultimosPagos = await pool.query(`
            SELECT * FROM copig.pagos_historicos 
            WHERE matricula = $1 
            ORDER BY fecha_pago DESC 
            LIMIT 5
        `, [matricula]);
        
        // Restricciones
        const restricciones = await pool.query(`
            SELECT COUNT(*) FROM copig.restricciones_deudas 
            WHERE matricula = $1
        `, [matricula]);
        
        // Sanciones
        const sanciones = await pool.query(`
            SELECT COUNT(*) FROM copig.sanciones_aplicadas 
            WHERE entidad_id = $1
        `, [matricula]);
        
        res.json({
            matricula,
            totalPagos: parseInt(pagos.rows[0].total),
            montoTotal: pagos.rows[0].monto_total,
            ultimoPago: pagos.rows[0].ultimo_pago,
            ultimosPagos: ultimosPagos.rows,
            restricciones: parseInt(restricciones.rows[0].count),
            sanciones: parseInt(sanciones.rows[0].count)
        });
    } catch (error) {
        console.error('Error obteniendo resumen:', error);
        res.status(500).json({ error: 'Error al obtener resumen financiero' });
    }
});

// Servir página de gestión financiera
app.get('/gestion-financiera', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'gestion-financiera.html'));
});


// =====================================================
// ENDPOINTS PARA GESTIÓN DE DOCUMENTOS CHP MÚLTIPLES  
// =====================================================

// Configuración de multer para subida de archivos
// multer y path ya están declarados al inicio del archivo

// Configurar almacenamiento

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
        const files_123 = req.files;
        
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
        const documentosGuardados_124 = [];
        
        for (const file_125 of files) {
            const resultado_120 = await pool.query(`
                INSERT INTO copig.documentos_chp 
                (solicitud_id, categoria, archivo_nombre, archivo_path, archivo_size, mime_type, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [
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
            message: `${files.length} documento(s) subido(s) correctamente`,
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
        
        let query = `
            SELECT d.*, au.username as aprobado_por_nombre 
            FROM copig.documentos_chp d
            LEFT JOIN copig.admin_users au ON d.aprobado_por = au.id
            WHERE d.solicitud_id = $1
        `;
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
        
        const documento_118 = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1',
            [documentoId]
        );
        
        if (documento.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        const doc_119 = documento.rows[0];
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
        res.setHeader('Content-Disposition', `inline; filename="${doc.archivo_nombre}"`);
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
        
        const doc_130 = documento.rows[0];
        
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
        
        const resultado = await pool.query(`
            UPDATE copig.documentos_chp 
            SET estado = $1, observaciones = $2, aprobado_por = $3, fecha_revision = NOW()
            WHERE id = $4
            RETURNING *
        `, [estado, observaciones, adminId, documentoId]);
        
        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: `Documento ${estado.toLowerCase()} correctamente`,
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
        
        const stats = await pool.query(`
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
        `, [solicitudId]);
        
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



// ============================================================================
// ENDPOINTS DOCUMENTOS CHP - FUNCIONALIDAD COMPLETA PARA PROFESIONALES
// ============================================================================

// Subir documentos por categoría
app.post('/api/chp/documentos/upload/:categoria', requireProfesionalAuth, upload.array('documentos', 5), async (req, res) => {
    try {
        const { categoria } = req.params;
        const profesionalId_127 = req.session.user.id;
        const files = req.files;
        
        console.log(`📤 Subiendo ${files?.length || 0} documentos para categoría: ${categoria}`);
        
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No se recibieron archivos' });
        }
        
        const documentosGuardados = [];
        
        for (const file of files) {
            try {
                const result_128 = await pool.query(`
                    INSERT INTO copig.documentos_chp 
                    (profesional_id, categoria, archivo_nombre, archivo_path, archivo_size, mime_type, estado)
                    VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE')
                    RETURNING id
                `, [profesionalId, categoria, file.originalname, file.path, file.size, file.mimetype]);
                
                documentosGuardados.push({
                    id: result.rows[0].id,
                    nombre: file.originalname,
                    tamaño: file.size,
                    categoria: categoria
                });
                
                console.log(`✅ Documento guardado: ${file.originalname} (ID: ${result.rows[0].id})`);
            } catch (dbError) {
                console.error(`❌ Error guardando ${file.originalname}:`, dbError);
            }
        }
        
        res.json({
            success: true,
            message: `${documentosGuardados.length} documento(s) subido(s) correctamente`,
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
        const profesionalId_129 = req.session.user.id;
        
        console.log(`📋 Obteniendo documentos de categoría: ${categoria} para profesional: ${profesionalId}`);
        
        const result = await pool.query(`
            SELECT id, archivo_nombre, archivo_size, estado, fecha_carga, observaciones
            FROM copig.documentos_chp 
            WHERE profesional_id = $1 AND categoria = $2
            ORDER BY fecha_carga DESC
        `, [profesionalId, categoria]);
        
        console.log(`✅ Encontrados ${result.rows.length} documentos para categoría ${categoria}`);
        
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
        
        console.log(`🗑️ Eliminando documento ID: ${id} del profesional: ${profesionalId}`);
        
        const doc = await pool.query(
            'SELECT * FROM copig.documentos_chp WHERE id = $1 AND profesional_id = $2',
            [id, profesionalId]
        );
        
        if (doc.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        
        await pool.query('DELETE FROM copig.documentos_chp WHERE id = $1', [id]);
        
        console.log(`✅ Documento ${id} eliminado correctamente`);
        
        res.json({ success: true, message: 'Documento eliminado correctamente' });
        
    } catch (error) {
        console.error('❌ Error eliminando documento:', error);
        res.status(500).json({ success: false, message: 'Error eliminando documento' });
    }
});

module.exports = app;