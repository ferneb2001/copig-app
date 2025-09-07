/**
 * IMPLEMENTAR ENDPOINTS CHP PDF - METODOLOGÍA CONSERVADORA
 * =======================================================
 * Agregar endpoints necesarios para el flujo PDF usando scripts externos
 * Siguiendo máximas de Fernando Adrian Nebro
 */

const fs = require('fs');

function implementCHPPDFEndpoints() {
    console.log('🔧 IMPLEMENTANDO ENDPOINTS CHP SEGÚN FLUJO PDF...\n');
    
    try {
        // Leer server.js actual
        let serverContent = fs.readFileSync('server.js', 'utf8');
        console.log(`📄 server.js leído: ${Math.round(serverContent.length/1024)}KB`);
        
        // Endpoints a agregar
        const endpointsToAdd = `

// ========================================================================
// ENDPOINTS CHP SEGÚN FLUJO PDF - AGREGADO VIA SCRIPT EXTERNO
// ========================================================================

// Obtener solicitud específica para revisión (3 secciones PDF)
app.get('/api/admin/solicitud-chp/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 [ADMIN] Consultando solicitud CHP para revisión:', id);
        
        const result = await pool.query(\`
            SELECT s.*, p.nombre as profesional_nombre, p.numero_documento,
                   m.numero_matricula,
                   f.numero_factura, f.monto_factura, f.fecha_factura
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id  
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.facturas_chp f ON s.id = f.solicitud_id
            WHERE s.id = $1
        \`, [id]);
        
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
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Actualizar solicitud
            await client.query(\`
                UPDATE copig.solicitudes_chp 
                SET estado = 'ESPERANDO_PAGO',
                    descripcion_corregida = $1,
                    arancel_establecido = $2,
                    fecha_inicio_revision = NOW(),
                    fecha_fin_revision = NOW(),
                    revisado_por = $3,
                    fecha_revision = NOW()
                WHERE id = $4
            \`, [descripcion_corregida, arancel, req.session.user.id, solicitud_id]);
            
            // Generar número de factura
            const numeroFactura = \`FCCP-\${new Date().getFullYear()}-\${String(Date.now()).slice(-6)}\`;
            
            // Crear factura
            await client.query(\`
                INSERT INTO copig.facturas_chp 
                (solicitud_id, numero_factura, monto_factura, fecha_factura, estado_factura)
                VALUES ($1, $2, $3, NOW(), 'PENDIENTE')
            \`, [solicitud_id, numeroFactura, arancel]);
            
            // Crear notificación para el profesional
            await client.query(\`
                INSERT INTO copig.notificaciones_chp 
                (solicitud_id, tipo, mensaje, fecha_envio)
                VALUES ($1, 'FACTURA_GENERADA', $2, NOW())
            \`, [solicitud_id, \`Su solicitud ha sido revisada. Factura \${numeroFactura} por $\${arancel} generada. Puede proceder con el pago.\`]);
            
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
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Actualizar solicitud a LISTA_PARA_EMITIR
            await client.query(\`
                UPDATE copig.solicitudes_chp 
                SET estado = 'LISTA_PARA_EMITIR',
                    pago_verificado = true,
                    verificado_por = $1,
                    fecha_verificacion_pago = NOW()
                WHERE id = $2
            \`, [req.session.user.id, solicitud_id]);
            
            // Actualizar factura
            await client.query(\`
                UPDATE copig.facturas_chp 
                SET estado_factura = 'PAGADA',
                    fecha_pago_verificado = NOW()
                WHERE solicitud_id = $1
            \`, [solicitud_id]);
            
            // Notificar al profesional
            await client.query(\`
                INSERT INTO copig.notificaciones_chp 
                (solicitud_id, tipo, mensaje, fecha_envio)
                VALUES ($1, 'PAGO_VERIFICADO', 'Su pago ha sido verificado. El CHP está siendo procesado para emisión.', NOW())
            \`, [solicitud_id]);
            
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
            const numeroCHP = \`CHP-\${new Date().getFullYear()}-\${String(Date.now()).slice(-4)}\`;
            
            // Actualizar solicitud a EMITIDO
            await client.query(\`
                UPDATE copig.solicitudes_chp 
                SET estado = 'EMITIDO',
                    numero_chp = $1,
                    fecha_aprobacion = NOW(),
                    aprobado_por = $2
                WHERE id = $3
            \`, [numeroCHP, req.session.user.id, solicitud_id]);
            
            // Crear certificado CHP
            await client.query(\`
                INSERT INTO copig.certificados_chp 
                (solicitud_id, numero_chp, fecha_emision, emitido_por, estado)
                VALUES ($1, $2, NOW(), $3, 'ACTIVO')
            \`, [solicitud_id, numeroCHP, req.session.user.id]);
            
            // Notificar al profesional
            await client.query(\`
                INSERT INTO copig.notificaciones_chp 
                (solicitud_id, tipo, mensaje, fecha_envio)
                VALUES ($1, 'CHP_EMITIDO', $2, NOW())
            \`, [solicitud_id, \`Su CHP \${numeroCHP} ha sido emitido y está disponible para descarga en su portal.\`]);
            
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
        
        await pool.query(\`
            UPDATE copig.solicitudes_chp 
            SET estado = 'RECHAZADO',
                motivo_rechazo = $1,
                fecha_rechazo = NOW(),
                admin_id = $2
            WHERE id = $3
        \`, [motivo_rechazo, req.session.user.id, solicitud_id]);
        
        // Notificar al profesional
        await pool.query(\`
            INSERT INTO copig.notificaciones_chp 
            (solicitud_id, tipo, mensaje, fecha_envio)
            VALUES ($1, 'SOLICITUD_RECHAZADA', $2, NOW())
        \`, [solicitud_id, \`Su solicitud ha sido rechazada. Motivo: \${motivo_rechazo}\`]);
        
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
`;

        // Buscar lugar para insertar (antes del final del archivo)
        const insertPoint = serverContent.lastIndexOf('// Iniciar servidor');
        if (insertPoint === -1) {
            console.log('❌ No se encontró punto de inserción adecuado');
            return;
        }
        
        // Insertar endpoints
        const updatedContent = serverContent.slice(0, insertPoint) + endpointsToAdd + '\n\n' + serverContent.slice(insertPoint);
        
        // Verificar que el contenido tiene sentido
        if (!updatedContent.includes('generar-factura') || !updatedContent.includes('verificar-pago')) {
            console.log('❌ Error: Los endpoints no se insertaron correctamente');
            return;
        }
        
        // Guardar archivo actualizado
        fs.writeFileSync('server.js', updatedContent);
        console.log('✅ server.js actualizado con endpoints CHP PDF');
        
        // Verificar que se guardó correctamente
        const verification = fs.readFileSync('server.js', 'utf8');
        if (verification.includes('ENDPOINTS CHP SEGÚN FLUJO PDF')) {
            console.log('✅ Verificación: Endpoints agregados correctamente');
            console.log('\n📋 ENDPOINTS AGREGADOS:');
            console.log('   ✅ GET  /api/admin/solicitud-chp/:id - Obtener solicitud para revisión');
            console.log('   ✅ POST /api/admin/chp/generar-factura - Generar factura y notificar');
            console.log('   ✅ POST /api/admin/chp/verificar-pago - Verificar pago del profesional');
            console.log('   ✅ POST /api/admin/chp/emitir - Emitir CHP final');
            console.log('   ✅ POST /api/admin/chp/rechazar - Rechazar solicitud');
            console.log('\n⚠️  IMPORTANTE: Reiniciar servidor para aplicar cambios');
        } else {
            console.log('❌ Error en verificación: Los endpoints no se guardaron correctamente');
        }
        
    } catch (error) {
        console.log('❌ Error implementando endpoints:', error.message);
    }
}

if (require.main === module) {
    implementCHPPDFEndpoints();
}

module.exports = implementCHPPDFEndpoints;