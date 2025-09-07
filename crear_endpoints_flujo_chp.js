/**
 * CREAR ENDPOINTS PARA NUEVO FLUJO CHP SEGÚN PDF
 * ENDPOINTS NECESARIOS:
 * 1. POST /api/profesional/solicitud-chp-sin-pago
 * 2. POST /api/admin/corregir-descripcion-chp/:id  
 * 3. POST /api/admin/generar-factura-chp/:id
 * 4. POST /api/profesional/subir-comprobante-pago/:id
 * 5. GET /api/admin/documento-chp/:id
 */

const fs = require('fs');

async function crearEndpointsFlujoCHP() {
    console.log('⚙️ CREANDO ENDPOINTS PARA NUEVO FLUJO CHP...');
    console.log('='.repeat(60));
    
    // LEER ARCHIVO SERVER.JS
    let serverContent = fs.readFileSync('C:\\copig-app\\server.js', 'utf8');
    
    // CREAR CÓDIGO DE NUEVOS ENDPOINTS
    const nuevosEndpoints = `

// ============================================================================
// ENDPOINTS NUEVO FLUJO CHP SEGÚN PDF OFICIAL
// ============================================================================

// 1. ENDPOINT: Solicitud CHP SIN PAGO PREVIO (PASO 1 DEL FLUJO)
app.post('/api/profesional/solicitud-chp-sin-pago', upload.fields([
    { name: 'rotulo_plano', maxCount: 1 },
    { name: 'comprobante_caja', maxCount: 1 },
    { name: 'pago_matricula', maxCount: 1 },
    { name: 'documentacion_adicional', maxCount: 1 }
]), async (req, res) => {
    try {
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
        if (!profesional_id) {
            return res.status(401).json({ 
                success: false, 
                message: 'Sesión no válida. Inicie sesión nuevamente.' 
            });
        }
        
        const { cliente, proyecto, descripcion, ubicacion_obra, observaciones } = req.body;
        
        // VALIDAR CAMPOS OBLIGATORIOS
        if (!cliente || !proyecto || !descripcion || !ubicacion_obra) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios: cliente, proyecto, descripción y ubicación'
            });
        }
        
        // VALIDAR DOCUMENTOS OBLIGATORIOS
        const documentosObligatorios = ['rotulo_plano', 'comprobante_caja', 'pago_matricula'];
        for (const doc of documentosObligatorios) {
            if (!req.files[doc] || req.files[doc].length === 0) {
                return res.status(400).json({
                    success: false,
                    message: \`Documento obligatorio faltante: \${doc.replace('_', ' ').toUpperCase()}\`
                });
            }
        }
        
        // GENERAR NÚMERO DE SOLICITUD
        const year = new Date().getFullYear();
        const numeroResult = await pool.query(\`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_solicitud FROM 10) AS INTEGER)), 1000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_solicitud LIKE 'CHP-\${year}-%'
        \`);
        const numeroSolicitud = \`CHP-\${year}-\${numeroResult.rows[0].siguiente}\`;
        
        // INSERTAR SOLICITUD CON ESTADO PENDIENTE (SIN PAGO PREVIO)
        const solicitudResult = await pool.query(\`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
             ubicacion_obra, observaciones, estado, fecha_solicitud, tipo_solicitud)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDIENTE', NOW(), 'CERTIFICADO')
            RETURNING *
        \`, [profesional_id, numeroSolicitud, cliente, proyecto, descripcion, 
            ubicacion_obra, observaciones]);
        
        const solicitudId = solicitudResult.rows[0].id;
        
        // GUARDAR DOCUMENTOS ADJUNTOS
        const documentosGuardados = [];
        for (const [tipoDoc, archivos] of Object.entries(req.files)) {
            if (archivos && archivos.length > 0) {
                const archivo = archivos[0];
                const nombreArchivo = \`\${Date.now()}_\${archivo.originalname}\`;
                const rutaArchivo = \`uploads/chp/\${nombreArchivo}\`;
                
                // MOVER ARCHIVO A DIRECTORIO DEFINITIVO
                fs.renameSync(archivo.path, rutaArchivo);
                
                // GUARDAR EN BASE DE DATOS
                await pool.query(\`
                    INSERT INTO copig.documentos_chp 
                    (solicitud_id, tipo_documento, nombre_archivo, ruta_archivo, fecha_carga)
                    VALUES ($1, $2, $3, $4, NOW())
                \`, [solicitudId, tipoDoc, archivo.originalname, rutaArchivo]);
                
                documentosGuardados.push({
                    tipo: tipoDoc,
                    nombre: archivo.originalname,
                    ruta: rutaArchivo
                });
            }
        }
        
        console.log(\`✅ Solicitud CHP sin pago creada: \${numeroSolicitud} - Profesional: \${profesional_id}\`);
        
        res.json({
            success: true,
            message: 'Solicitud enviada para revisión exitosamente',
            numero_solicitud: numeroSolicitud,
            estado: 'PENDIENTE',
            documentos_guardados: documentosGuardados,
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

// 2. ENDPOINT: Corregir descripción de tarea (PASO 2 DEL FLUJO)
app.post('/api/admin/corregir-descripcion-chp/:id', async (req, res) => {
    try {
        // VERIFICAR AUTENTICACIÓN ADMIN
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { descripcion_corregida } = req.body;
        
        if (!descripcion_corregida) {
            return res.status(400).json({
                success: false,
                message: 'Descripción corregida es requerida'
            });
        }
        
        // ACTUALIZAR DESCRIPCIÓN Y CAMBIAR ESTADO A EN_REVISION
        const result = await pool.query(\`
            UPDATE copig.solicitudes_chp 
            SET descripcion_corregida = $1,
                estado = 'EN_REVISION',
                fecha_actualizacion = NOW()
            WHERE id = $2 AND estado IN ('PENDIENTE', 'EN_REVISION')
            RETURNING *
        \`, [descripcion_corregida, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no se puede modificar en su estado actual'
            });
        }
        
        console.log(\`✅ Descripción corregida - Solicitud \${id}\`);
        
        res.json({
            success: true,
            message: 'Descripción corregida guardada exitosamente',
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error corrigiendo descripción:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 3. ENDPOINT: Generar factura y notificar (PASO 3 DEL FLUJO)
app.post('/api/admin/generar-factura-chp/:id', async (req, res) => {
    try {
        // VERIFICAR AUTENTICACIÓN ADMIN
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { arancel_establecido, descripcion_final } = req.body;
        
        if (!arancel_establecido || arancel_establecido <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe establecer un arancel válido mayor a 0'
            });
        }
        
        // GENERAR NÚMERO DE FACTURA ÚNICO
        const year = new Date().getFullYear();
        const facturaResult = await pool.query(\`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_factura FROM 9) AS INTEGER)), 3000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_factura LIKE 'FACT-\${year}-%'
        \`);
        const numeroFactura = \`FACT-\${year}-\${facturaResult.rows[0].siguiente}\`;
        
        // ACTUALIZAR SOLICITUD CON ARANCEL Y FACTURA
        const result = await pool.query(\`
            UPDATE copig.solicitudes_chp 
            SET arancel_establecido = $1,
                numero_factura = $2,
                fecha_factura = NOW(),
                estado = 'ESPERANDO_PAGO',
                descripcion_corregida = COALESCE($3, descripcion_corregida),
                fecha_actualizacion = NOW()
            WHERE id = $4 AND estado IN ('PENDIENTE', 'EN_REVISION')
            RETURNING *
        \`, [arancel_establecido, numeroFactura, descripcion_final, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no se puede facturar en su estado actual'
            });
        }
        
        console.log(\`✅ Factura generada: \${numeroFactura} - Monto: $\${arancel_establecido}\`);
        
        res.json({
            success: true,
            message: 'Factura generada y profesional notificado exitosamente',
            numero_factura: numeroFactura,
            arancel: arancel_establecido,
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error generando factura:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 4. ENDPOINT: Subir comprobante de pago (PASO 4 DEL FLUJO)
app.post('/api/profesional/subir-comprobante-pago/:id', upload.single('comprobante'), async (req, res) => {
    try {
        const profesional_id = req.session?.profesionalId || req.session?.user?.id;
        
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
        
        // VERIFICAR QUE LA SOLICITUD PERTENECE AL PROFESIONAL Y ESTÁ EN ESTADO CORRECTO
        const verificar = await pool.query(\`
            SELECT * FROM copig.solicitudes_chp 
            WHERE id = $1 AND profesional_id = $2 AND estado = 'ESPERANDO_PAGO'
        \`, [id, profesional_id]);
        
        if (verificar.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no está esperando pago'
            });
        }
        
        // GUARDAR COMPROBANTE
        const nombreArchivo = \`comprobante_\${Date.now()}_\${req.file.originalname}\`;
        const rutaComprobante = \`uploads/comprobantes/\${nombreArchivo}\`;
        fs.renameSync(req.file.path, rutaComprobante);
        
        // ACTUALIZAR SOLICITUD
        const result = await pool.query(\`
            UPDATE copig.solicitudes_chp 
            SET comprobante_pago_archivo = $1,
                fecha_carga_comprobante = NOW(),
                estado = 'COMPROBANTE_CARGADO',
                fecha_actualizacion = NOW()
            WHERE id = $2
            RETURNING *
        \`, [rutaComprobante, id]);
        
        console.log(\`✅ Comprobante cargado - Solicitud \${id}\`);
        
        res.json({
            success: true,
            message: 'Comprobante subido exitosamente. Personal del COPIG verificará el pago.',
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error subiendo comprobante:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 5. ENDPOINT: Ver/descargar documentos CHP
app.get('/api/admin/documento-chp/:id', async (req, res) => {
    try {
        // VERIFICAR AUTENTICACIÓN ADMIN
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        const { download } = req.query;
        
        // BUSCAR DOCUMENTO
        const result = await pool.query(\`
            SELECT * FROM copig.documentos_chp WHERE id = $1
        \`, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Documento no encontrado' });
        }
        
        const documento = result.rows[0];
        const rutaArchivo = documento.ruta_archivo;
        
        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado en disco' });
        }
        
        // CONFIGURAR RESPUESTA SEGÚN SI ES DESCARGA O VISUALIZACIÓN
        if (download === 'true') {
            res.download(rutaArchivo, documento.nombre_archivo);
        } else {
            res.sendFile(path.resolve(rutaArchivo));
        }
        
    } catch (error) {
        console.error('❌ Error accediendo documento:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 6. ENDPOINT: Verificar pago y aprobar (PASO 5 DEL FLUJO)
app.post('/api/admin/verificar-pago-chp/:id', async (req, res) => {
    try {
        // VERIFICAR AUTENTICACIÓN ADMIN
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
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
                message: 'Acción debe ser "verificar" o "rechazar"'
            });
        }
        
        const result = await pool.query(\`
            UPDATE copig.solicitudes_chp 
            SET estado = $1,
                verificado_por = $2,
                fecha_verificacion_pago = NOW(),
                fecha_actualizacion = NOW()
            WHERE id = $3 AND estado = 'COMPROBANTE_CARGADO'
            RETURNING *
        \`, [nuevoEstado, req.session.adminId || req.session.staffId, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no está en estado de verificación'
            });
        }
        
        console.log(\`✅ Pago \${accion === 'verificar' ? 'verificado' : 'rechazado'} - Solicitud \${id}\`);
        
        res.json({
            success: true,
            message: \`Pago \${accion === 'verificar' ? 'verificado' : 'rechazado'} exitosamente\`,
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error verificando pago:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// 7. ENDPOINT: Emitir CHP final (PASO 6 DEL FLUJO)
app.post('/api/admin/emitir-chp/:id', async (req, res) => {
    try {
        // VERIFICAR AUTENTICACIÓN ADMIN
        const isAuthorized = req.session.adminId || 
                           req.session.staffId || 
                           req.session.user?.tipo === 'admin' || 
                           req.session.user?.tipo === 'staff' ||
                           req.session.superAdmin;
                           
        if (!isAuthorized) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }
        
        const { id } = req.params;
        
        // GENERAR NÚMERO DE CHP
        const year = new Date().getFullYear();
        const chpResult = await pool.query(\`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_chp FROM 5) AS INTEGER)), 5000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_chp LIKE 'CHP-\${year}%'
        \`);
        const numeroCHP = \`CHP-\${year}\${String(chpResult.rows[0].siguiente).padStart(4, '0')}\`;
        
        const result = await pool.query(\`
            UPDATE copig.solicitudes_chp 
            SET estado = 'EMITIDO',
                numero_chp = $1,
                fecha_aprobacion = NOW(),
                aprobado_por = $2,
                fecha_actualizacion = NOW()
            WHERE id = $3 AND estado = 'LISTA_PARA_EMITIR'
            RETURNING *
        \`, [numeroCHP, req.session.adminId || req.session.staffId, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o no está lista para emitir'
            });
        }
        
        console.log(\`✅ CHP emitido: \${numeroCHP} - Solicitud \${id}\`);
        
        res.json({
            success: true,
            message: 'CHP emitido exitosamente',
            numero_chp: numeroCHP,
            solicitud: result.rows[0]
        });
        
    } catch (error) {
        console.error('❌ Error emitiendo CHP:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// FIN ENDPOINTS NUEVO FLUJO CHP
// ============================================================================
`;

    // BUSCAR LUGAR PARA INSERTAR (después de los endpoints CHP existentes)
    const lugarInsercion = serverContent.lastIndexOf('// Endpoint alternativo para crear solicitud CHP');
    
    if (lugarInsercion !== -1) {
        // INSERTAR DESPUÉS DE LOS ENDPOINTS EXISTENTES
        const antesInsercion = serverContent.substring(0, lugarInsercion);
        const despuesInsercion = serverContent.substring(lugarInsercion);
        
        serverContent = antesInsercion + nuevosEndpoints + '\\n\\n' + despuesInsercion;
        console.log('   ✅ Endpoints insertados después de endpoints CHP existentes');
    } else {
        // INSERTAR AL FINAL ANTES DEL PUERTO
        const lugarPuerto = serverContent.lastIndexOf('const PORT = process.env.PORT || 3030;');
        
        if (lugarPuerto !== -1) {
            const antesInsercion = serverContent.substring(0, lugarPuerto);
            const despuesInsercion = serverContent.substring(lugarPuerto);
            
            serverContent = antesInsercion + nuevosEndpoints + '\\n\\n' + despuesInsercion;
            console.log('   ✅ Endpoints insertados antes de configuración del puerto');
        } else {
            // INSERTAR AL FINAL
            serverContent += nuevosEndpoints;
            console.log('   ✅ Endpoints insertados al final del archivo');
        }
    }
    
    // AGREGAR IMPORTS NECESARIOS SI NO EXISTEN
    if (!serverContent.includes('const path = require')) {
        const lugarImports = serverContent.indexOf('const { Client } = require');
        if (lugarImports !== -1) {
            const antesImports = serverContent.substring(0, lugarImports);
            const despuesImports = serverContent.substring(lugarImports);
            serverContent = antesImports + "const path = require('path');\\n" + despuesImports;
            console.log('   ✅ Import de path agregado');
        }
    }
    
    // CREAR DIRECTORIOS NECESARIOS
    console.log('📁 Creando directorios para archivos...');
    try {
        if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
        if (!fs.existsSync('uploads/chp')) fs.mkdirSync('uploads/chp');
        if (!fs.existsSync('uploads/comprobantes')) fs.mkdirSync('uploads/comprobantes');
        console.log('   ✅ Directorios creados: uploads/chp, uploads/comprobantes');
    } catch (error) {
        console.log('   ⚠️ Error creando directorios:', error.message);
    }
    
    // GUARDAR ARCHIVO MODIFICADO
    fs.writeFileSync('C:\\copig-app\\server.js', serverContent);
    console.log('📄 server.js actualizado con nuevos endpoints');
    
    console.log('\\n✅ ENDPOINTS CREADOS EXITOSAMENTE');
    console.log('📋 7 nuevos endpoints según flujo PDF:');
    console.log('   1. POST /api/profesional/solicitud-chp-sin-pago');
    console.log('   2. POST /api/admin/corregir-descripcion-chp/:id');
    console.log('   3. POST /api/admin/generar-factura-chp/:id');
    console.log('   4. POST /api/profesional/subir-comprobante-pago/:id');
    console.log('   5. GET /api/admin/documento-chp/:id');
    console.log('   6. POST /api/admin/verificar-pago-chp/:id');
    console.log('   7. POST /api/admin/emitir-chp/:id');
}

// EJECUTAR
if (require.main === module) {
    crearEndpointsFlujoCHP()
        .then(() => {
            console.log('\\n🎉 TODOS LOS ENDPOINTS DEL FLUJO CHP CREADOS');
            console.log('⚠️  REINICIAR SERVIDOR PARA APLICAR CAMBIOS');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR:', error);
            process.exit(1);
        });
}

module.exports = { crearEndpointsFlujoCHP };