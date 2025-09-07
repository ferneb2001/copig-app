// Función simplificada para el expediente
app.get('/api/admin/profesionales/:id/expediente', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 [ADMIN] Consultando expediente profesional ID: ${id}`);
        
        // Obtener datos del profesional
        const profesional = await pool.query('SELECT * FROM copig.profesionales WHERE id = $1', [id]);
        if (profesional.rows.length === 0) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        
        // Obtener matrícula por separado
        let matricula_profesional = null;
        let matricula_activa = null;
        
        try {
            const matricula = await pool.query('SELECT numero, activo FROM copig.matriculas WHERE profesional_id = $1', [id]);
            if (matricula.rows.length > 0) {
                matricula_profesional = matricula.rows[0].numero;
                matricula_activa = matricula.rows[0].activo;
            }
        } catch (err) {
            console.log('⚠️ Error obteniendo matrícula:', err.message);
        }
        
        // Obtener pagos históricos
        let historialPagos = [];
        let totalPagos = 0;
        let ultimoPago = null;
        
        try {
            const matriculaNum = matricula_profesional || profesional.rows[0].numero_documento;
            const pagos = await pool.query(`
                SELECT fecha_pago as fecha, concepto, importe, numero_recibo
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
            profesional: {
                ...profesional.rows[0],
                matricula_profesional,
                matricula_activa
            },
            historialPagos,
            totalPagos,
            ultimoPago
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error obteniendo expediente:', error);
        res.status(500).json({ error: 'Error obteniendo expediente' });
    }
});