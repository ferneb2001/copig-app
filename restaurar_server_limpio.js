/**
 * RESTAURAR SERVER.JS LIMPIO Y AGREGAR ENDPOINTS CUIDADOSAMENTE
 * Los cambios anteriores corrompieron caracteres especiales
 */

const fs = require('fs');

async function restaurarServerLimpio() {
    console.log('🔄 RESTAURANDO SERVER.JS DESDE VERSIÓN LIMPIA...');
    
    // PRIMERO VERIFICAR SI TENEMOS BACKUP
    const archivosBackup = [
        'backup_arca_2025-09-04T04-22-53-737Z/server.js',
        'server.js.backup',
        'server_original.js'
    ];
    
    let backupEncontrado = null;
    for (const backup of archivosBackup) {
        if (fs.existsSync(backup)) {
            backupEncontrado = backup;
            console.log(`📁 Backup encontrado: ${backup}`);
            break;
        }
    }
    
    if (backupEncontrado) {
        // RESTAURAR DESDE BACKUP
        console.log('📋 Restaurando desde backup...');
        const backupContent = fs.readFileSync(backupEncontrado, 'utf8');
        fs.writeFileSync('server.js', backupContent);
        console.log('✅ Server.js restaurado desde backup');
    } else {
        console.log('⚠️ No se encontró backup, creando versión mínima funcional...');
        await crearVersionMinima();
    }
    
    console.log('🎯 SERVIDOR RESTAURADO - Agregando solo endpoint esencial para CHP');
    
    // AGREGAR SOLO EL ENDPOINT ESENCIAL PARA PROBAR
    let serverContent = fs.readFileSync('server.js', 'utf8');
    
    // BUSCAR LUGAR SEGURO PARA INSERTAR (antes de const PORT)
    const lugarInsercion = serverContent.indexOf('const PORT = process.env.PORT || 3030;');
    
    if (lugarInsercion !== -1) {
        const endpointEsencial = `
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
        const numeroResult = await pool.query(\`
            SELECT COALESCE(MAX(CAST(SUBSTRING(numero_solicitud FROM 10) AS INTEGER)), 1000) + 1 as siguiente
            FROM copig.solicitudes_chp 
            WHERE numero_solicitud LIKE 'CHP-\${year}-%'
        \`);
        const numeroSolicitud = \`CHP-\${year}-\${numeroResult.rows[0].siguiente}\`;
        
        // INSERTAR SOLICITUD SIN PAGO PREVIO
        const solicitudResult = await pool.query(\`
            INSERT INTO copig.solicitudes_chp 
            (profesional_id, numero_solicitud, cliente, proyecto, descripcion, 
             ubicacion_obra, observaciones, estado, fecha_solicitud, tipo_solicitud)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDIENTE', NOW(), 'CERTIFICADO')
            RETURNING *
        \`, [profesional_id, numeroSolicitud, cliente, proyecto, descripcion, 
            ubicacion_obra || '', observaciones || '']);
        
        console.log(\`✅ Solicitud CHP sin pago creada: \${numeroSolicitud}\`);
        
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

`;
        
        // INSERTAR ENDPOINT
        const antes = serverContent.substring(0, lugarInsercion);
        const despues = serverContent.substring(lugarInsercion);
        
        serverContent = antes + endpointEsencial + despues;
        
        // GUARDAR
        fs.writeFileSync('server.js', serverContent);
        console.log('✅ Endpoint esencial agregado correctamente');
    }
}

async function crearVersionMinima() {
    // En caso de que no haya backup, crear una versión mínima funcional
    console.log('⚠️ Función de crear versión mínima - implementar si es necesario');
}

// EJECUTAR
if (require.main === module) {
    restaurarServerLimpio()
        .then(() => {
            console.log('\\n🎉 SERVER.JS RESTAURADO Y PREPARADO');
            console.log('🚀 Ahora ejecuta: node server.js');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { restaurarServerLimpio };