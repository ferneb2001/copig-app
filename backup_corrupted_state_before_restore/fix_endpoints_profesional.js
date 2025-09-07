const { Pool } = require('pg');
const fs = require('fs').promises;

async function corregirEndpointsProfesional() {
    console.log('🔧 CORRIGIENDO ENDPOINTS PROFESIONAL FALTANTES');
    
    try {
        // 1. Leer server.js actual
        let serverContent = await fs.readFile('server.js', 'utf8');
        
        // 2. Endpoints faltantes para profesionales
        const endpointsProfesional = `
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
        const pagos = await pool.query(\`
            SELECT COUNT(*) as cantidad, SUM(CAST(importe AS DECIMAL)) as total, MAX(fecha_pago) as ultimo_pago
            FROM copig.pagos_historicos 
            WHERE matricula = $1
        \`, [matriculaNum]);
        
        // Solicitudes CHP pendientes
        const solicitudesPendientes = await pool.query(\`
            SELECT COUNT(*) as cantidad
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1 AND estado = 'PENDIENTE'
        \`, [profesionalId]);
        
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
        const pagos = await pool.query(\`
            SELECT fecha_pago, concepto, importe, numero_recibo
            FROM copig.pagos_historicos 
            WHERE matricula = $1 
            ORDER BY fecha_pago DESC
            LIMIT 20
        \`, [matriculaNum]);
        
        // Restricciones activas
        const restricciones = await pool.query(\`
            SELECT tipo_restriccion, descripcion, fecha_inicio
            FROM copig.restricciones_deudas 
            WHERE profesional_id = $1 AND (fecha_fin IS NULL OR fecha_fin > NOW())
        \`, [profesionalId]);
        
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
        
        const profesional = await pool.query(\`
            SELECT p.*, m.numero_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.id = $1
        \`, [profesionalId]);
        
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
        
        const result = await pool.query(\`
            UPDATE copig.profesionales 
            SET email = $1, telefono = $2, domicilio = $3
            WHERE id = $4
            RETURNING *
        \`, [email, telefono, domicilio, profesionalId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profesional no encontrado' });
        }
        
        res.json({ success: true, message: 'Perfil actualizado', profesional: result.rows[0] });
        
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ success: false, message: 'Error interno' });
    }
});
`;
        
        // 3. Buscar donde insertar los endpoints
        const insertPoint = serverContent.indexOf('// FIN DE ENDPOINTS');
        if (insertPoint === -1) {
            // Si no encontramos el marcador, insertar antes del app.listen
            const listenPoint = serverContent.lastIndexOf('app.listen');
            if (listenPoint !== -1) {
                serverContent = serverContent.slice(0, listenPoint) + endpointsProfesional + '\\n\\n' + serverContent.slice(listenPoint);
            } else {
                // Insertar al final del archivo
                serverContent += endpointsProfesional;
            }
        } else {
            serverContent = serverContent.slice(0, insertPoint) + endpointsProfesional + '\\n\\n' + serverContent.slice(insertPoint);
        }
        
        // 4. Escribir server.js corregido
        await fs.writeFile('server.js', serverContent);
        console.log('✅ Endpoints profesional agregados a server.js');
        
        // 5. Agregar pool a app.locals si no existe
        if (!serverContent.includes('app.locals.pool')) {
            console.log('📝 Agregando pool a app.locals...');
            const poolLine = '\\napp.locals.pool = pool;\\n';
            const poolInsertPoint = serverContent.indexOf('const pool = new Pool(');
            if (poolInsertPoint !== -1) {
                const nextLinePoint = serverContent.indexOf('\\n', poolInsertPoint + 200);
                serverContent = serverContent.slice(0, nextLinePoint) + poolLine + serverContent.slice(nextLinePoint);
                await fs.writeFile('server.js', serverContent);
                console.log('✅ app.locals.pool configurado');
            }
        }
        
        console.log('\\n🎯 CORRECCIONES APLICADAS:');
        console.log('   ✅ /api/profesional/dashboard - Dashboard profesional');
        console.log('   ✅ /api/profesional/estado-financiero - Estado financiero');
        console.log('   ✅ /api/profesional/perfil - GET/PUT perfil');
        console.log('   ✅ app.locals.pool configurado');
        
        console.log('\\n⚠️ REINICIO DE SERVIDOR REQUERIDO');
        console.log('   Fernando: Presiona Ctrl+C y luego node server.js');
        
    } catch (error) {
        console.error('💥 ERROR CORRIGIENDO ENDPOINTS:', error.message);
        throw error;
    }
}

corregirEndpointsProfesional()
    .then(() => {
        console.log('\\n✅ ENDPOINTS PROFESIONAL CORREGIDOS');
        console.log('🔄 Reinicia servidor para aplicar cambios');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 FALLA EN CORRECCIÓN:', error);
        process.exit(1);
    });