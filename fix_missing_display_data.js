/**
 * CORREGIR VISUALIZACIÓN DE DATOS FALTANTES
 * ========================================
 * Corregir endpoints para mostrar:
 * 1. Fechas de matriculación
 * 2. Pagos históricos
 */

const fs = require('fs');

function fixMissingDisplayData() {
    console.log('🔧 CORRIGIENDO VISUALIZACIÓN DE DATOS FALTANTES...\n');
    
    try {
        let serverContent = fs.readFileSync('server.js', 'utf8');
        console.log(`📄 server.js leído: ${Math.round(serverContent.length/1024)}KB`);
        
        let cambiosRealizados = [];
        
        // 1. CORREGIR ENDPOINT PROFESIONALES - AGREGAR FECHAS MATRICULACIÓN
        console.log('🔧 1. Corrigiendo endpoint profesionales para incluir fechas...');
        
        // Buscar el endpoint /api/admin/profesionales/:id
        const endpointProfesionalPattern = /\/api\/admin\/profesionales\/:id.*?try\s*\{(.*?)res\.json\(/s;
        const match = serverContent.match(endpointProfesionalPattern);
        
        if (match) {
            // Reemplazar query para incluir datos de matricula
            const oldQuery = `'SELECT * FROM copig.profesionales WHERE id = $1'`;
            const newQuery = `\`
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
            \``;
            
            if (serverContent.includes('SELECT * FROM copig.profesionales WHERE id = $1')) {
                serverContent = serverContent.replace(
                    'SELECT * FROM copig.profesionales WHERE id = $1',
                    newQuery.trim().replace(/\`/g, '')
                );
                cambiosRealizados.push('✅ Endpoint profesionales/:id actualizado con fechas matriculación');
            }
        }
        
        // 2. CORREGIR ENDPOINT LISTADO PROFESIONALES
        console.log('🔧 2. Corrigiendo listado profesionales...');
        
        // Buscar y actualizar el endpoint de listado
        if (serverContent.includes('SELECT p.*, m.numero_matricula FROM copig.profesionales p')) {
            serverContent = serverContent.replace(
                'SELECT p.*, m.numero_matricula FROM copig.profesionales p',
                `SELECT p.*, 
                        m.numero_matricula, 
                        m.fecha_inscripcion, 
                        m.fecha_habilitacion,
                        m.categoria as categoria_matricula,
                        m.activo as matricula_activa
                 FROM copig.profesionales p`
            );
            cambiosRealizados.push('✅ Endpoint profesionales listado actualizado');
        }
        
        // 3. CORREGIR ENDPOINT EXPEDIENTE - INCLUIR PAGOS HISTÓRICOS
        console.log('🔧 3. Corrigiendo expediente profesional para incluir pagos...');
        
        // Buscar el endpoint expediente y corregir nombre de columna de fechas
        if (serverContent.includes('FROM copig.pagos_historicos WHERE matricula')) {
            // Verificar si usa 'fecha' incorrectamente
            if (serverContent.includes('ORDER BY fecha DESC')) {
                serverContent = serverContent.replace(
                    /ORDER BY fecha DESC/g,
                    'ORDER BY fecha_pago DESC'
                );
                cambiosRealizados.push('✅ Campo fecha corregido a fecha_pago en pagos históricos');
            }
            
            // Mejorar query de pagos históricos
            const oldPagosQuery = `SELECT * FROM copig.pagos_historicos WHERE matricula`;
            const newPagosQuery = `SELECT fecha_pago, importe, concepto, estado, referencia, medio_pago
                                   FROM copig.pagos_historicos WHERE matricula`;
            
            if (serverContent.includes(oldPagosQuery)) {
                serverContent = serverContent.replace(oldPagosQuery, newPagosQuery);
                cambiosRealizados.push('✅ Query pagos históricos mejorada');
            }
        }
        
        // 4. AGREGAR ENDPOINT ESPECÍFICO PARA FECHAS MATRICULACIÓN
        console.log('🔧 4. Agregando endpoint específico para fechas matriculación...');
        
        const fechasMatriculacionEndpoint = `

// Endpoint específico para fechas de matriculación
app.get('/api/admin/profesional/:id/matriculacion', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 [ADMIN] Consultando fechas matriculación profesional:', id);
        
        const result = await pool.query(\`
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
        \`, [id]);
        
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
        const matriculaResult = await pool.query(\`
            SELECT m.numero_matricula 
            FROM copig.matriculas m 
            WHERE m.profesional_id = $1
        \`, [id]);
        
        if (matriculaResult.rows.length === 0) {
            return res.json({
                success: true,
                pagos: [],
                message: 'Profesional sin matrícula registrada'
            });
        }
        
        const numeroMatricula = matriculaResult.rows[0].numero_matricula;
        
        // Obtener pagos históricos
        const pagosResult = await pool.query(\`
            SELECT fecha_pago, importe, concepto, estado, referencia, medio_pago,
                   año, mes, tipo_pago
            FROM copig.pagos_historicos 
            WHERE matricula::text = $1::text
            ORDER BY fecha_pago DESC
            LIMIT 50
        \`, [numeroMatricula]);
        
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
`;

        // Insertar antes del final
        const insertPoint = serverContent.lastIndexOf('// Iniciar servidor');
        if (insertPoint !== -1) {
            serverContent = serverContent.slice(0, insertPoint) + fechasMatriculacionEndpoint + '\n' + serverContent.slice(insertPoint);
            cambiosRealizados.push('✅ Endpoints específicos para fechas y pagos agregados');
        }
        
        // 5. GUARDAR ARCHIVO ACTUALIZADO
        console.log('\n💾 Guardando cambios...');
        fs.writeFileSync('server.js', serverContent);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ CORRECCIONES APLICADAS EXITOSAMENTE');
        console.log('='.repeat(60));
        
        if (cambiosRealizados.length > 0) {
            console.log('📋 Cambios realizados:');
            cambiosRealizados.forEach(cambio => console.log(`   ${cambio}`));
        } else {
            console.log('⚠️  No se encontraron patrones para actualizar');
        }
        
        console.log('\n📋 NUEVOS ENDPOINTS DISPONIBLES:');
        console.log('   ✅ GET /api/admin/profesional/:id/matriculacion');
        console.log('   ✅ GET /api/admin/profesional/:id/pagos');
        
        console.log('\n⚠️  IMPORTANTE: Reiniciar servidor para aplicar cambios');
        console.log('\n🎯 PRÓXIMO PASO: Actualizar interfaces para usar nuevos datos');
        
        return cambiosRealizados.length > 0;
        
    } catch (error) {
        console.error('❌ Error aplicando correcciones:', error);
        return false;
    }
}

if (require.main === module) {
    fixMissingDisplayData();
}

module.exports = fixMissingDisplayData;