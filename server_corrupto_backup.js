const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');

// Configuracin de multer para archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads/comprobantes');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        cb(null, `comprobante-${timestamp}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, JPG, PNG'));
        }
    }
});
const path = require('path');
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


// ============================================================================
// ENDPOINTS NUEVO FLUJO CHP SEGN PDF OFICIAL
// ============================================================================

// 1. ENDPOINT: Solicitud CHP SIN PAGO PREVIO (PASO 1 DEL FLUJO)
app.post('/api/profesional/solicitud-chp-sin-pago', upload.fields([
    { name: 'rotulo_plano', maxCount: 1 },
    { name: 'comprobante_caja', maxCount: 1 },
    { name: 'pago_matricula', maxCount: 1 },
    { name: 'documentacion_adicional', maxCount: 1 }
]), async (req, res) = {
    try {
        const profesional_id = req.session.profesionalId  req.session.user.id;
        
        if (!profesional_id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Sesin no vlida. Inicie sesin nuevamente.' 
            });
        }
        
        const { cliente, proyecto, descripcion, ubicacion_obra, observaciones } = req.body;
        
        // VALIDAR CAMPOS OBLIGATORIOS
        if (!cliente  !proyecto  !descripcion  !ubicacion_obra) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios: cliente, proyecto, descripcin y ubicacin'
            });
        }
        
        // VALIDAR DOCUMENTOS OBLIGATORIOS
        const documentosObligatorios = ['rotulo_plano', 'comprobante_caja', 'pago_matricula'];
        for (const doc of documentosObligatorios) {
            if (!req.files[doc]  req.files[doc].length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Documento obligatorio faltante: ${doc.replace('_', ' ').toUpperCase()}`
                });
            }
        }
        
        // GENERAR NMERO DE SOLICITUD
        const year = new Date().getFullYear();
        const numeroResult = await pool.query(`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_solicitud FROM 10) AS INTEGER)), 1000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_solicitud LIKE 'CHP-${year}-%'
        `);
        const numeroSolicitud = `CHP-${year}-${numeroResult.rows[0].siguiente}`;
        
        // INSERTAR SOLICITUD CON ESTADO PENDIENTE (SIN PAGO PREVIO)
        const solicitudResult = await pool.query(`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
             ubicacion_obra, observaciones, estado, fecha_solicitud, tipo_solicitud)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDIENTE', NOW(), 'CERTIFICADO')
            RETURNING *
        `, [profesional_id, numeroSolicitud, cliente, proyecto, descripcion, 
            ubicacion_obra, observaciones]);
        
        const solicitudId = solicitudResult.rows[0].id;
        
        // GUARDAR DOCUMENTOS ADJUNTOS
        const documentosGuardados = [];
        for (const [tipoDoc, archivos] of Object.entries(req.files)) {
            if (archivos && archivos.length  0) {
                const archivo = archivos[0];
                const nombreArchivo = `${Date.now()}_${archivo.originalname}`;
                const rutaArchivo = `uploads/chp/${nombreArchivo}`;
                
                // MOVER ARCHIVO A DIRECTORIO DEFINITIVO
                fs.renameSync(archivo.path, rutaArchivo);
                
                // GUARDAR EN BASE DE DATOS
                await pool.query(`
                    INSERT INTO copig.documentos_chp 
                    (solicitud_id, tipo_documento, nombre_archivo, ruta_archivo, fecha_carga)
                    VALUES ($1, $2, $3, $4, NOW())
                `, [solicitudId, tipoDoc, archivo.originalname, rutaArchivo]);
                
                documentosGuardados.push({
                    tipo: tipoDoc,
                    nombre: archivo.originalname,
                    ruta: rutaArchivo
                });
            }
        }
        
        console.log(` Solicitud CHP sin pago creada: ${numeroSolicitud} - Profesional: ${profesional_id}`);
        
        res.json({
            success: true,
            message: 'Solicitud enviada para revisin exitosamente',
            numero_solicitud: numeroSolicitud,
            estado: 'PENDIENTE',
            documentos_guardados: documentosGuardados,
            solicitud: solicitudResult.rows[0]
        });
        
    } catch (error) {
        console.error(' Error creando solicitud CHP sin pago:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// 2. ENDPOINT: Corregir descripcin de tarea (PASO 2 DEL FLUJO)
app.post('/api/admin/corregir-descripcion-chp/:id', async (req, res) = {
    try {
        // VERIFICAR AUTENTICACIN ADMIN
        const isAuthorized = req.session.adminId  
                           req.session.staffId  
                           req.session.user.tipo === 'admin'  
                           req.session.user.tipo === 'staff' 
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { descripcion_corregida } = req.body;
        
        if (!descripcion_corregida) {
            return res.status(400).json({
                success: false,
                message: 'Descripcin corregida es requerida'
            });
        }
        
        // ACTUALIZAR DESCRIPCIN Y CAMBIAR ESTADO A EN_REVISION
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET descripcion_corregida = $1,
                estado = 'EN_REVISION',
                fecha_actualizacion = NOW()
            WHERE id = $2 AND estado IN ('PENDIENTE', 'EN_REVISION')
            RETURNING *
        `, [descripcion_corregida, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no se puede modificar en su estado actual'
            });
        }
        
        console.log(` Descripcin corregida - Solicitud ${id}`);
        
        res.json({
            success: true,
            message: 'Descripcin corregida guardada exitosamente',
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error(' Error corrigiendo descripcin:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 3. ENDPOINT: Generar factura y notificar (PASO 3 DEL FLUJO)
app.post('/api/admin/generar-factura-chp/:id', async (req, res) = {
    try {
        // VERIFICAR AUTENTICACIN ADMIN
        const isAuthorized = req.session.adminId  
                           req.session.staffId  
                           req.session.user.tipo === 'admin'  
                           req.session.user.tipo === 'staff' 
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { arancel_establecido, descripcion_final } = req.body;
        
        if (!arancel_establecido  arancel_establecido = 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe establecer un arancel vlido mayor a 0'
            });
        }
        
        // GENERAR NMERO DE FACTURA NICO
        const year = new Date().getFullYear();
        const facturaResult = await pool.query(`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_factura FROM 9) AS INTEGER)), 3000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_factura LIKE 'FACT-${year}-%'
        `);
        const numeroFactura = `FACT-${year}-${facturaResult.rows[0].siguiente}`;
        
        // ACTUALIZAR SOLICITUD CON ARANCEL Y FACTURA
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET arancel_establecido = $1,
                numero_factura = $2,
                fecha_factura = NOW(),
                estado = 'ESPERANDO_PAGO',
                descripcion_corregida = COALESCE($3, descripcion_corregida),
                fecha_actualizacion = NOW()
            WHERE id = $4 AND estado IN ('PENDIENTE', 'EN_REVISION')
            RETURNING *
        `, [arancel_establecido, numeroFactura, descripcion_final, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no se puede facturar en su estado actual'
            });
        }
        
        console.log(` Factura generada: ${numeroFactura} - Monto: $${arancel_establecido}`);
        
        res.json({
            success: true,
            message: 'Factura generada y profesional notificado exitosamente',
            numero_factura: numeroFactura,
            arancel: arancel_establecido,
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error(' Error generando factura:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 4. ENDPOINT: Subir comprobante de pago (PASO 4 DEL FLUJO)
app.post('/api/profesional/subir-comprobante-pago/:id', upload.single('comprobante'), async (req, res) = {
    try {
        const profesional_id = req.session.profesionalId  req.session.user.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Debe adjuntar el comprobante de pago'
            });
        }
        
        // VERIFICAR QUE LA SOLICITUD PERTENECE AL PROFESIONAL Y EST EN ESTADO CORRECTO
        const verificar = await pool.query(`
            SELECT * FROM copig.solicitudes_chp 
            WHERE id = $1 AND profesional_id = $2 AND estado = 'ESPERANDO_PAGO'
        `, [id, profesional_id]);
        
        if (verificar.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no est esperando pago'
            });
        }
        
        // GUARDAR COMPROBANTE
        const nombreArchivo = `comprobante_${Date.now()}_${req.file.originalname}`;
        const rutaComprobante = `uploads/comprobantes/${nombreArchivo}`;
        fs.renameSync(req.file.path, rutaComprobante);
        
        // ACTUALIZAR SOLICITUD
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET comprobante_pago_archivo = $1,
                fecha_carga_comprobante = NOW(),
                estado = 'COMPROBANTE_CARGADO',
                fecha_actualizacion = NOW()
            WHERE id = $2
            RETURNING *
        `, [rutaComprobante, id]);
        
        console.log(` Comprobante cargado - Solicitud ${id}`);
        
        res.json({
            success: true,
            message: 'Comprobante subido exitosamente. Personal del COPIG verificar el pago.',
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error(' Error subiendo comprobante:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 5. ENDPOINT: Ver/descargar documentos CHP
app.get('/api/admin/documento-chp/:id', async (req, res) = {
    try {
        // VERIFICAR AUTENTICACIN ADMIN
        const isAuthorized = req.session.adminId  
                           req.session.staffId  
                           req.session.user.tipo === 'admin'  
                           req.session.user.tipo === 'staff' 
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { download } = req.query;
        
        // BUSCAR DOCUMENTO
        const result = await pool.query(`
            SELECT * FROM copig.documentos_chp WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        
        const documento = result.rows[0];
        const rutaArchivo = documento.ruta_archivo;
        
        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado en disco' });
        }
        
        // CONFIGURAR RESPUESTA SEGN SI ES DESCARGA O VISUALIZACIN
        if (download === 'true') {
            res.download(rutaArchivo, documento.nombre_archivo);
        } else {
            res.sendFile(path.resolve(rutaArchivo));
        }
        
    } catch (error) {
        console.error(' Error accediendo documento:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 6. ENDPOINT: Verificar pago y aprobar (PASO 5 DEL FLUJO)
app.post('/api/admin/verificar-pago-chp/:id', async (req, res) = {
    try {
        // VERIFICAR AUTENTICACIN ADMIN
        const isAuthorized = req.session.adminId  
                           req.session.staffId  
                           req.session.user.tipo === 'admin'  
                           req.session.user.tipo === 'staff' 
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { accion } = req.body; // 'verificar' o 'rechazar'
        
        let nuevoEstado;
        if (accion === 'verificar') {
            nuevoEstado = 'LISTA_PARA_EMITIR';
        } else if (accion === 'rechazar') {
            nuevoEstado = 'OBSERVADO';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Accin debe ser "verificar" o "rechazar"'
            });
        }
        
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET estado = $1,
                verificado_por = $2,
                fecha_verificacion_pago = NOW(),
                fecha_actualizacion = NOW()
            WHERE id = $3 AND estado = 'COMPROBANTE_CARGADO'
            RETURNING *
        `, [nuevoEstado, req.session.adminId  req.session.staffId, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no est en estado de verificacin'
            });
        }
        
        console.log(` Pago ${accion === 'verificar'  'verificado' : 'rechazado'} - Solicitud ${id}`);
        
        res.json({
            success: true,
            message: `Pago ${accion === 'verificar'  'verificado' : 'rechazado'} exitosamente`,
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error(' Error verificando pago:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 7. ENDPOINT: Emitir CHP final (PASO 6 DEL FLUJO)
app.post('/api/admin/emitir-chp/:id', async (req, res) = {
    try {
        // VERIFICAR AUTENTICACIN ADMIN
        const isAuthorized = req.session.adminId  
                           req.session.staffId  
                           req.session.user.tipo === 'admin'  
                           req.session.user.tipo === 'staff' 
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        
        // GENERAR NMERO DE CHP
        const year = new Date().getFullYear();
        const chpResult = await pool.query(`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_chp FROM 5) AS INTEGER)), 5000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_chp LIKE 'CHP-${year}%'
        `);
        const numeroCHP = `CHP-${year}${String(chpResult.rows[0].siguiente).padStart(4, '0')}`;
        
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET estado = 'EMITIDO',
                numero_chp = $1,
                fecha_aprobacion = NOW(),
                aprobado_por = $2,
                fecha_actualizacion = NOW()
            WHERE id = $3 AND estado = 'LISTA_PARA_EMITIR'
            RETURNING *
        `, [numeroCHP, req.session.adminId  req.session.staffId, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no est lista para emitir'
            });
        }
        
        console.log(` CHP emitido: ${numeroCHP} - Solicitud ${id}`);
        
        res.json({
            success: true,
            message: 'CHP emitido exitosamente',
            numero_chp: numeroCHP,
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error(' Error emitiendo CHP:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// FIN ENDPOINTS NUEVO FLUJO CHP
// ============================================================================



// ENDPOINT ESENCIAL NUEVO FLUJO CHP - Solicitud sin pago previo
app.post('/api/profesional/solicitud-chp-sin-pago', upload.single('documento'), async (req, res) => {
    try {
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Sesión no válida. Inicie sesión nuevamente.' 
            });
        }
        
        const { cliente, proyecto, descripcion, ubicacion_obra, observaciones } = req.body;
        
        if (!cliente || !proyecto || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Campos obligatorios: cliente, proyecto, descripción'
            });
        }
        
        // GENERAR NÚMERO DE SOLICITUD
        const year = new Date().getFullYear();
        const numeroResult = await pool.query(`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_solicitud FROM 10) AS INTEGER)), 1000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_solicitud LIKE 'CHP-${year}-%'
        `);
        const numeroSolicitud = `CHP-${year}-${numeroResult.rows[0].siguiente}`;
        
        // INSERTAR SOLICITUD SIN PAGO PREVIO
        const solicitudResult = await pool.query(`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
             ubicacion_obra, observaciones, estado, fecha_solicitud, tipo_solicitud)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDIENTE', NOW(), 'CERTIFICADO')
            RETURNING *
        `, [profesional_id, numeroSolicitud, cliente, proyecto, descripcion, 
            ubicacion_obra || '', observaciones || '']);
        
        console.log(`✅ Solicitud CHP sin pago creada: ${numeroSolicitud}`);
        
        res.json({
            success: true,
            message: 'Solicitud enviada para revisión exitosamente',
            numero_solicitud: numeroSolicitud,
            estado: 'PENDIENTE',
            solicitud: solicitudResult.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error creando solicitud CHP:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
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
        const { cliente, proyecto, descripcion, ubicacion_obra, observaciones, monto_honorarios, porcentaje_chp, costo } = req.body;
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado - Sin sesión de profesional' });
        }
        
        // Generar número de solicitud
        const numeroResult = await pool.query(`
            SELECT 'CHP-' || TO_CHAR(NOW(), 'YYYY') || '-' || nextval('copig.chp_numero_seq')::text as numero
        `);
        const numero_solicitud = numeroResult.rows[0].numero;
        
        // Calcular costo usando EL PORCENTAJE QUE INGRESÓ EL USUARIO
        let costoFinal = costo;
        if (!costoFinal && monto_honorarios && porcentaje_chp) {
            // USAR EL PORCENTAJE MANUAL DEL PROFESIONAL
            costoFinal = Math.round((monto_honorarios * porcentaje_chp) / 100);
        } else if (!costoFinal && monto_honorarios) {
            // Fallback: usar cálculo automático solo si no hay porcentaje manual
            const arancelCalculado = await calcularArancelDinamico(monto_honorarios);
            costoFinal = arancelCalculado ? arancelCalculado.arancel : 0;
        }
        
        // Determinar estado inicial: si hay costo, requiere pago
        const estado_inicial = costoFinal && costoFinal > 0 ? 'PENDIENTE_PAGO' : 'PENDIENTE';
        
        // Insertar solicitud
        const result = await pool.query(`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, cliente, proyecto, descripcion, ubicacion_obra, 
             observaciones, tipo_solicitud, monto_honorarios, porcentaje_chp, costo, estado, pagado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'CERTIFICADO', $8, $9, $10, $11, false)
            RETURNING *
        `, [profesional_id, numero_solicitud, cliente, proyecto, descripcion, ubicacion_obra, 
            observaciones, monto_honorarios, porcentaje_chp, costoFinal, estado_inicial]);
        
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
        const { cliente, proyecto, descripcion, ubicacion_obra, observaciones, monto_honorarios } = req.body;
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        // Verificar que la solicitud pertenece al profesional y está en estado modificable
        const checkResult = await pool.query(`
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
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET cliente = $1, proyecto = $2, descripcion = $3, ubicacion_obra = $4, 
                observaciones = $5, monto_honorarios = $6, costo = COALESCE($7, costo),
                estado = $8, fecha_actualizacion = NOW()
            WHERE id = $9 AND profesional_id = $10
            RETURNING *
        `, [cliente, proyecto, descripcion, ubicacion_obra, observaciones, 
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

// Endpoint para actualizar datos de revisión (auto-guardar)
app.put('/api/admin/chp/actualizar-revision/:id', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const { comitente, proyecto, descripcion } = req.body;
        const admin_id = req.session?.adminId || req.session?.user?.id;
        
        if (!admin_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        // Actualizar datos básicos y marcar como en revisión
        const result = await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET cliente = $1, proyecto = $2, descripcion = $3, 
                estado = 'EN_REVISION', 
                revisado_por = $4, 
                fecha_revision = NOW(),
                fecha_actualizacion = NOW()
            WHERE id = $5
            RETURNING *
        `, [comitente, proyecto, descripcion, admin_id, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        
        console.log('✅ Solicitud actualizada en revisión:', id);
        
        res.json({ 
            success: true, 
            message: 'Datos actualizados',
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error actualizando revisión:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar: ' + error.message });
    }
});

// Endpoint para generar factura y notificar
app.post('/api/admin/chp/generar-factura/:id', express.json(), async (req, res) => {
    try {
        const { id } = req.params;
        const { comitente, proyecto, descripcion, arancel_final, documentacion_verificada } = req.body;
        const admin_id = req.session?.adminId || req.session?.user?.id;
        
        if (!admin_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        if (!arancel_final || arancel_final <= 0) {
            return res.status(400).json({ success: false, message: 'Arancel final requerido' });
        }
        
        // Obtener datos de la solicitud
        const solicitudResult = await pool.query(`
            SELECT s.*, p.nombre as profesional_nombre, p.numero_documento
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            WHERE s.id = $1
        `, [id]);
        
        if (solicitudResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        
        const solicitud = solicitudResult.rows[0];
        
        // Generar número de factura único
        const numeroFactura = await pool.query(`
            SELECT 'FACT-CHP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('copig.chp_numero_seq')::text, 4, '0') as numero
        `);
        const numero_factura = numeroFactura.rows[0].numero;
        
        // Crear factura
        const facturaResult = await pool.query(`
            INSERT INTO copig.facturas_chp 
            (solicitud_id, numero_factura, monto, fecha_vencimiento, descripcion, creado_por)
            VALUES ($1, $2, $3, (CURRENT_DATE + INTERVAL '30 days'), $4, $5)
            RETURNING *
        `, [id, numero_factura, arancel_final, 
            `Certificado de Habilitación Profesional - ${proyecto}`, admin_id]);
        
        // Actualizar solicitud
        await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET cliente = $1, proyecto = $2, descripcion = $3, 
                arancel_final = $4, numero_factura = $5, fecha_factura = NOW(),
                estado = 'ESPERANDO_PAGO', 
                revisado_por = $6, 
                fecha_revision = NOW(),
                fecha_actualizacion = NOW()
            WHERE id = $7
        `, [comitente, proyecto, descripcion, arancel_final, numero_factura, admin_id, id]);
        
        // Crear notificación para el profesional
        await pool.query(`
            INSERT INTO copig.notificaciones_chp 
            (solicitud_id, profesional_id, tipo, titulo, mensaje, datos_adicionales)
            VALUES ($1, $2, 'FACTURA_GENERADA', $3, $4, $5)
        `, [
            id, 
            solicitud.profesional_id,
            'Factura CHP Generada',
            `Su solicitud CHP ha sido revisada y aprobada. Se ha generado la factura ${numero_factura} por $${arancel_final.toLocaleString('es-AR')}. Puede verla y pagarla desde su portal.`,
            JSON.stringify({
                numero_factura: numero_factura,
                monto: arancel_final,
                fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
        ]);
        
        console.log('✅ Factura generada:', numero_factura, `- Monto: $${arancel_final}`);
        
        res.json({ 
            success: true, 
            message: 'Factura generada y profesional notificado',
            numero_factura: numero_factura,
            monto: arancel_final,
            factura: facturaResult.rows[0]
        });
        
    } catch (error) {
        console.error('Error generando factura:', error);
        res.status(500).json({ success: false, message: 'Error al generar factura: ' + error.message });
    }
});

// Endpoints para profesionales - facturas y notificaciones

// Obtener notificaciones del profesional
app.get('/api/profesional/notificaciones-chp', async (req, res) => {
    try {
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result = await pool.query(`
            SELECT * FROM copig.notificaciones_chp 
            WHERE profesional_id = $1 
            ORDER BY fecha_envio DESC
        `, [profesional_id]);
        
        res.json({ 
            success: true, 
            notificaciones: result.rows 
        });
        
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        res.status(500).json({ success: false, message: 'Error al obtener notificaciones' });
    }
});

// Obtener facturas del profesional
app.get('/api/profesional/facturas-chp', async (req, res) => {
    try {
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result = await pool.query(`
            SELECT f.*, s.proyecto, s.cliente 
            FROM copig.facturas_chp f
            LEFT JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
            WHERE s.profesional_id = $1 
            ORDER BY f.fecha_emision DESC
        `, [profesional_id]);
        
        res.json({ 
            success: true, 
            facturas: result.rows 
        });
        
    } catch (error) {
        console.error('Error obteniendo facturas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener facturas' });
    }
});

// Marcar notificación como leída
app.put('/api/profesional/notificacion-leida/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        await pool.query(`
            UPDATE copig.notificaciones_chp 
            SET leida = true 
            WHERE id = $1 AND profesional_id = $2
        `, [id, profesional_id]);
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('Error marcando notificación:', error);
        res.status(500).json({ success: false, message: 'Error al marcar notificación' });
    }
});

// Cargar comprobante de pago
app.post('/api/profesional/cargar-comprobante-pago', upload.single('comprobante'), async (req, res) => {
    try {
        const { factura_id } = req.body;
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        const archivo = req.file;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        if (!archivo) {
            return res.status(400).json({ success: false, message: 'Archivo requerido' });
        }
        
        // Verificar que la factura pertenece al profesional
        const facturaResult = await pool.query(`
            SELECT f.*, s.profesional_id 
            FROM copig.facturas_chp f
            LEFT JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
            WHERE f.id = $1 AND s.profesional_id = $2
        `, [factura_id, profesional_id]);
        
        if (facturaResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Factura no encontrada' });
        }
        
        const factura = facturaResult.rows[0];
        
        // Actualizar factura con comprobante
        await pool.query(`
            UPDATE copig.facturas_chp 
            SET archivo_pdf = $1, estado = 'EN_VERIFICACION'
            WHERE id = $2
        `, [archivo.path, factura_id]);
        
        // Actualizar solicitud
        await pool.query(`
            UPDATE copig.solicitudes_chp 
            SET comprobante_pago_path = $1, fecha_pago = NOW(), estado = 'PAGO_VERIFICADO'
            WHERE id = $2
        `, [archivo.path, factura.solicitud_id]);
        
        // Notificar al staff
        await pool.query(`
            INSERT INTO copig.notificaciones_chp 
            (solicitud_id, profesional_id, tipo, titulo, mensaje)
            VALUES ($1, $2, 'COMPROBANTE_CARGADO', $3, $4)
        `, [
            factura.solicitud_id,
            profesional_id,
            'Comprobante de Pago Cargado',
            `El profesional ha cargado el comprobante de pago para la factura ${factura.numero_factura}. Pendiente de verificación.`
        ]);
        
        console.log('✅ Comprobante cargado:', factura.numero_factura);
        
        res.json({ 
            success: true, 
            message: 'Comprobante cargado exitosamente'
        });
        
    } catch (error) {
        console.error('Error cargando comprobante:', error);
        res.status(500).json({ success: false, message: 'Error al cargar comprobante: ' + error.message });
    }
});

// Ver factura PDF
app.get('/api/profesional/factura-pdf/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        // Por ahora, generar PDF simple o mostrar datos
        const result = await pool.query(`
            SELECT f.*, s.proyecto, s.cliente, s.descripcion 
            FROM copig.facturas_chp f
            LEFT JOIN copig.solicitudes_chp s ON f.solicitud_id = s.id
            WHERE f.id = $1 AND s.profesional_id = $2
        `, [id, profesional_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Factura no encontrada' });
        }
        
        const factura = result.rows[0];
        
        // Generar HTML simple de la factura
        const facturaHTML = `
            <html>
            <head>
                <title>Factura ${factura.numero_factura}</title>
                <style>
                    body { font-family: Arial; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .factura-info { border: 1px solid #ccc; padding: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>COPIG - Consejo Profesional de Ingenieros y Geólogos</h1>
                    <h2>Factura ${factura.numero_factura}</h2>
                </div>
                <div class="factura-info">
                    <p><strong>Fecha:</strong> ${new Date(factura.fecha_emision).toLocaleDateString('es-AR')}</p>
                    <p><strong>Vencimiento:</strong> ${new Date(factura.fecha_vencimiento).toLocaleDateString('es-AR')}</p>
                    <p><strong>Cliente:</strong> ${factura.cliente}</p>
                    <p><strong>Proyecto:</strong> ${factura.proyecto}</p>
                    <p><strong>Descripción:</strong> ${factura.descripcion}</p>
                    <h3><strong>Monto Total: $${factura.monto.toLocaleString('es-AR')}</strong></h3>
                    <p><strong>Estado:</strong> ${factura.estado}</p>
                </div>
            </body>
            </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.send(facturaHTML);
        
    } catch (error) {
        console.error('Error generando factura PDF:', error);
        res.status(500).json({ success: false, message: 'Error al generar factura' });
    }
});

// Endpoint para obtener aranceles vigentes
app.get('/api/aranceles-chp', async (req, res) => {
    try {
        const result = await pool.query(`
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
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result = await pool.query(`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   m.numero_matricula,
                   COALESCE(
                       JSON_AGG(
                           CASE 
                               WHEN d.id IS NOT NULL THEN 
                                   JSON_BUILD_OBJECT(
                                       'id', d.id,
                                       'tipo_documento', d.tipo_documento,
                                       'nombre_archivo', d.nombre_archivo,
                                       'ruta_archivo', d.ruta_archivo,
                                       'fecha_carga', d.fecha_carga
                                   )
                               ELSE NULL
                           END
                       ) FILTER (WHERE d.id IS NOT NULL), 
                       '[]'
                   ) as documentos
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.documentos_chp d ON s.id = d.solicitud_id
            GROUP BY s.id, s.profesional_id, s.tipo_solicitud, s.numero_solicitud,
                     s.fecha_solicitud, s.estado, s.motivo_solicitud, s.documentos_adjuntos,
                     s.observaciones, s.fecha_aprobacion, s.fecha_rechazo, s.motivo_rechazo,
                     s.admin_id, s.numero_chp, s.fecha_vencimiento_chp, s.costo, s.pagado,
                     s.fecha_pago, s.metodo_pago, s.created_at, s.updated_at, s.cliente,
                     s.proyecto, s.descripcion, s.ubicacion_obra, s.tipo_obra,
                     s.fecha_actualizacion, s.aprobado_por, s.monto_honorarios,
                     s.numero_factura, s.fecha_factura, s.arancel_final,
                     s.comprobante_pago_path, s.revisado_por, s.fecha_revision,
                     s.requiere_factura_oficial, s.observaciones_arca, s.porcentaje_chp,
                     p.nombre, m.numero_matricula
            ORDER BY s.fecha_solicitud DESC
        `);
        
        res.json({ success: true, solicitudes: result.rows });
    } catch (error) {
        console.error('Error obteniendo solicitudes admin:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// Obtener solicitud CHP individual (admin)
app.get('/api/admin/solicitudes-chp/:id', async (req, res) => {
    try {
        // Verificar autenticación admin más inclusiva
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            console.log('🚫 Admin CHP GET individual - Sesión no autorizada');
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        console.log(`✅ Admin CHP GET individual - Obteniendo solicitud ID: ${id}`);
        
        const result = await pool.query(`
            SELECT s.*, 
                   p.nombre as profesional_nombre,
                   p.numero_documento as profesional_dni,
                   p.email as profesional_email,
                   p.telefono as profesional_telefono,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE s.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud CHP no encontrada' });
        }
        
        res.json({ success: true, solicitud: result.rows[0] });
    } catch (error) {
        console.error('Error obteniendo solicitud CHP individual:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitud CHP' });
    }
});

// Actualizar estado de solicitud (admin)
app.put('/api/admin/solicitud-chp/:id', async (req, res) => {
    try {
        // Verificar autenticación admin más inclusiva
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            console.log('🚫 Admin CHP PUT - Sesión no autorizada:', {
                adminId: req.session.adminId,
                staffId: req.session.staffId,
                user: req.session.user,
                superAdmin: req.session.superAdmin
            });
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { estado, motivo_rechazo } = req.body;
        const aprobado_por = req.session.adminId || req.session.staffId;
        
        let query = `
            UPDATE copig.solicitudes_chp 
            SET estado = $1, 
                fecha_actualizacion = NOW()
        `;
        const params = [estado];
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
        
        query += ` WHERE id = $${paramCount} RETURNING *`;
        params.push(id);
        
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }
        
        res.json({ success: true, solicitud: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando solicitud:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la solicitud' });
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
        const result = await pool.query(
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
        const stats = await pool.query(`
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
        let params = [];
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
        
        const pagos = await pool.query(pagosQuery, params);
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
        const result = await pool.query(`
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
        const result = await pool.query(`
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

module.exports = app;
// ================================
// ENDPOINTS PROFESIONAL - CORREGIDOS
// ================================

// Dashboard profesional
app.get('/api/profesional/dashboard', requireAuth, async (req, res) => {
    try {
        if (req.session.userType !== 'profesional') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const profesionalId = req.session.profesionalId;
        const pool = req.app.locals.pool;
        
        // Obtener datos del profesional
        const profesional = await pool.query('SELECT * FROM copig.profesionales WHERE id = $1', [profesionalId]);
        if (profesional.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
        }
        
        // Obtener matrícula
        const matricula = await pool.query('SELECT numero_matricula FROM copig.matriculas WHERE profesional_id = $1', [profesionalId]);
        
        // Estado financiero básico
        const matriculaNum = matricula.rows[0]?.numero_matricula || profesional.rows[0].numero_documento;
        const pagos = await pool.query(`
            SELECT COUNT(*) as cantidad, SUM(CAST(importe AS DECIMAL)) as total, MAX(fecha_pago) as ultimo_pago
            FROM copig.pagos_historicos 
            WHERE matricula = $1
        `, [matriculaNum]);
        
        // Solicitudes CHP pendientes
        const solicitudesPendientes = await pool.query(`
            SELECT COUNT(*) as cantidad
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1 AND estado = 'PENDIENTE'
        `, [profesionalId]);
        
        const dashboard = {
            profesional: profesional.rows[0],
            matricula: matricula.rows[0]?.numero_matricula,
            estadoFinanciero: 'AL_DIA', // Simplificado por ahora
            totalPagado: pagos.rows[0]?.total || '0.00',
            ultimoPago: pagos.rows[0]?.ultimo_pago,
            solicitudesPendientes: parseInt(solicitudesPendientes.rows[0]?.cantidad || 0),
            cantidadPagos: parseInt(pagos.rows[0]?.cantidad || 0)
        };
        
        res.json({ success: true, dashboard });
        
    } catch (error) {
        console.error('Error en dashboard profesional:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// Estado financiero profesional
app.get('/api/profesional/estado-financiero', requireAuth, async (req, res) => {
    try {
        if (req.session.userType !== 'profesional') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const profesionalId = req.session.profesionalId;
        const pool = req.app.locals.pool;
        
        // Obtener profesional y matrícula
        const profesional = await pool.query('SELECT numero_documento FROM copig.profesionales WHERE id = $1', [profesionalId]);
        const matricula = await pool.query('SELECT numero_matricula FROM copig.matriculas WHERE profesional_id = $1', [profesionalId]);
        
        const matriculaNum = matricula.rows[0]?.numero_matricula || profesional.rows[0]?.numero_documento;
        
        // Historial de pagos
        const pagos = await pool.query(`
            SELECT fecha_pago, concepto, importe, numero_recibo
            FROM copig.pagos_historicos 
            WHERE matricula = $1 
            ORDER BY fecha_pago DESC
            LIMIT 20
        `, [matriculaNum]);
        
        // Restricciones activas
        const restricciones = await pool.query(`
            SELECT tipo_restriccion, descripcion, fecha_inicio
            FROM copig.restricciones_deudas 
            WHERE profesional_id = $1 AND (fecha_fin IS NULL OR fecha_fin > NOW())
        `, [profesionalId]);
        
        const totalPagado = pagos.rows.reduce((sum, pago) => sum + parseFloat(pago.importe || 0), 0);
        
        res.json({
            success: true,
            totalPagado: totalPagado.toFixed(2),
            ultimoPago: pagos.rows[0]?.fecha_pago,
            cantidadPagos: pagos.rows.length,
            historialPagos: pagos.rows,
            restricciones: restricciones.rows,
            tieneRestricciones: restricciones.rows.length > 0
        });
        
    } catch (error) {
        console.error('Error en estado financiero:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// Perfil profesional
app.get('/api/profesional/perfil', requireAuth, async (req, res) => {
    try {
        if (req.session.userType !== 'profesional') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const profesionalId = req.session.profesionalId;
        const pool = req.app.locals.pool;
        
        const profesional = await pool.query(`
            SELECT p.*, m.numero_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        `, [profesionalId]);
        
        if (profesional.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
        }
        
        res.json({ success: true, perfil: profesional.rows[0] });
        
    } catch (error) {
        console.error('Error en perfil profesional:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});

// Actualizar perfil profesional
app.put('/api/profesional/perfil', requireAuth, async (req, res) => {
    try {
        if (req.session.userType !== 'profesional') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const profesionalId = req.session.profesionalId;
        const { email, telefono, domicilio } = req.body;
        const pool = req.app.locals.pool;
        
        const result = await pool.query(`
            UPDATE copig.profesionales 
            SET email = $1, telefono = $2, domicilio = $3
            WHERE id = $4
            RETURNING *
        `, [email, telefono, domicilio, profesionalId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
        }
        
        res.json({ success: true, message: 'Perfil actualizado', profesional: result.rows[0] });
        
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});
