// ========================================
// ENDPOINTS CHP COMPLETOS
// ========================================

// Crear nueva solicitud CHP
app.post('/api/chp/create', async (req, res) => {
  try {
    console.log('🆕 Creando solicitud CHP...');
    console.log('📋 Datos recibidos:', req.body);
    console.log('👤 Sesión:', req.session);
    
    const { cliente, proyecto, descripcion, ubicacion_obra } = req.body;
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
    
    // Insertar solicitud
    const result = await pool.query(`
      INSERT INTO copig.solicitudes_chp 
      (profesional_id, numero_solicitud, cliente, proyecto, descripcion, ubicacion_obra, estado)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE')
      RETURNING *
    `, [profesional_id, numero_solicitud, cliente, proyecto, descripcion, ubicacion_obra]);
    
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
      ORDER BY s.fecha_solicitud DESC
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

// Actualizar estado de solicitud (admin)
app.put('/api/admin/solicitud-chp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones, motivo_rechazo } = req.body;
    const aprobado_por = req.session?.userId; // ID del admin
    
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

console.log('🔗 Endpoints CHP cargados');