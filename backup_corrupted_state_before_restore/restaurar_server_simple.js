/**
 * RESTAURAR SERVER FUNCIONANDO SIMPLE
 * Solo restaurar funcionalidad básica sin los endpoints problemáticos
 */

const fs = require('fs');

async function restaurarServerSimple() {
    console.log('🔄 CREANDO SERVER.JS FUNCIONAL BÁSICO...');
    
    // CREAR BACKUP DEL CORRUPTO
    const serverActual = fs.readFileSync('server.js', 'utf8');
    fs.writeFileSync('server_corrupto_backup.js', serverActual);
    console.log('📁 Backup del server corrupto creado: server_corrupto_backup.js');
    
    // CREAR VERSIÓN SIMPLE FUNCIONAL
    const serverBasico = `const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const path = require('path');
const multer = require('multer');

const app = express();
const config = require('./config.json');

// CONFIGURACIÓN BÁSICA
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'copig-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// CONFIGURACIÓN MULTER PARA UPLOADS
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POOL DE CONEXIONES
const { Pool } = require('pg');
const pool = new Pool(config.database);

// MIDDLEWARE DE AUTENTICACIÓN
function requireAuth(req, res, next) {
    if (req.session.profesionalId || req.session.adminId || req.session.staffId || req.session.superAdmin) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'No autorizado' });
    }
}

// RUTAS BÁSICAS
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-chp-nuevo', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-chp-nuevo.html'));
});

// LOGIN UNIFICADO
app.post('/api/unified-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // SUPER ADMIN HARDCODED
        if (username === '20562024' && password === 'ansiktet1969') {
            req.session.superAdmin = true;
            req.session.user = { tipo: 'superadmin', nombre: 'FERNANDO NEBRO' };
            return res.json({
                success: true,
                userType: 'superadmin',
                redirect: '/admin',
                user: { nombre: 'FERNANDO NEBRO', tipo: 'superadmin' }
            });
        }
        
        // BUSCAR EN ADMIN_USERS
        const adminResult = await pool.query(
            'SELECT * FROM copig.admin_users WHERE username = $1',
            [username]
        );
        
        if (adminResult.rows.length > 0) {
            const admin = adminResult.rows[0];
            const passwordValida = await bcrypt.compare(password, admin.password);
            
            if (passwordValida) {
                req.session.adminId = admin.id;
                req.session.staffId = admin.id;
                req.session.user = { tipo: admin.role, nombre: admin.full_name };
                
                return res.json({
                    success: true,
                    userType: admin.role === 'superadmin' ? 'superadmin' : 'staff',
                    redirect: '/admin',
                    user: { nombre: admin.full_name, tipo: admin.role }
                });
            }
        }
        
        // BUSCAR EN PROFESIONALES
        const profResult = await pool.query(\`
            SELECT p.*, pa.password, m.numero_matricula 
            FROM copig.profesionales p
            LEFT JOIN copig.profesionales_auth pa ON p.numero_documento = pa.username
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.numero_documento = $1
        \`, [username]);
        
        if (profResult.rows.length > 0) {
            const prof = profResult.rows[0];
            
            if (prof.password) {
                const passwordValida = await bcrypt.compare(password, prof.password);
                if (passwordValida) {
                    req.session.profesionalId = prof.id;
                    req.session.user = { tipo: 'profesional', nombre: prof.nombre };
                    
                    return res.json({
                        success: true,
                        userType: 'profesional',
                        redirect: '/portal-profesional.html',
                        user: { nombre: prof.nombre, matricula: prof.numero_matricula }
                    });
                }
            }
        }
        
        res.json({ success: false, message: 'Credenciales incorrectas' });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// ENDPOINTS CHP BÁSICOS EXISTENTES
app.get('/api/profesional/solicitudes-chp', requireAuth, async (req, res) => {
    try {
        const profesional_id = req.session.profesionalId;
        if (!profesional_id) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const result = await pool.query(\`
            SELECT * FROM copig.solicitudes_chp 
            WHERE profesional_id = $1 
            ORDER BY fecha_solicitud DESC
        \`, [profesional_id]);
        
        res.json({ success: true, solicitudes: result.rows });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

app.get('/api/admin/solicitudes-chp', async (req, res) => {
    try {
        const result = await pool.query(\`
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
        \`);
        
        res.json({ success: true, solicitudes: result.rows });
    } catch (error) {
        console.error('Error obteniendo solicitudes admin:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// ENDPOINT NUEVO FLUJO CHP - SIN PAGO PREVIO
app.post('/api/profesional/solicitud-chp-sin-pago', upload.single('documento'), async (req, res) => {
    try {
        const profesional_id = req.session?.profesionalId;
        
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
        const numeroResult = await pool.query(\`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_solicitud FROM 10) AS INTEGER)), 1000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_solicitud LIKE 'CHP-\${year}-%'
        \`);
        const numeroSolicitud = \`CHP-\${year}-\${numeroResult.rows[0].siguiente}\`;
        
        // INSERTAR SOLICITUD SIN PAGO PREVIO (ESTADO PENDIENTE)
        const solicitudResult = await pool.query(\`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
             ubicacion_obra, observaciones, estado, fecha_solicitud, tipo_solicitud)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDIENTE', NOW(), 'CERTIFICADO')
            RETURNING *
        \`, [profesional_id, numeroSolicitud, cliente, proyecto, descripcion, 
            ubicacion_obra || '', observaciones || '']);
        
        console.log(\`✅ Solicitud CHP sin pago creada: \${numeroSolicitud} - Profesional: \${profesional_id}\`);
        
        res.json({
            success: true,
            message: 'Solicitud enviada para revisión exitosamente',
            numero_solicitud: numeroSolicitud,
            estado: 'PENDIENTE',
            solicitud: solicitudResult.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error creando solicitud CHP sin pago:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// LOGOUT
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(\`🚀 Servidor COPIG ejecutándose en puerto \${PORT}\`);
    console.log(\`📍 Acceso: http://localhost:\${PORT}\`);
    console.log('🏛️ Sistema con flujo CHP según PDF oficial');
});
`;
    
    // GUARDAR SERVER BÁSICO
    fs.writeFileSync('server.js', serverBasico);
    console.log('✅ Server.js básico funcional creado');
}

// EJECUTAR
if (require.main === module) {
    restaurarServerSimple()
        .then(() => {
            console.log('\\n🎉 SERVER.JS FUNCIONAL RESTAURADO');
            console.log('🚀 Ejecuta: node server.js');
            console.log('🎯 Incluye endpoint básico para flujo CHP sin pago previo');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { restaurarServerSimple };