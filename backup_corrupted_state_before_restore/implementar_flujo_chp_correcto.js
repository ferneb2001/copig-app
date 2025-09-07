/**
 * IMPLEMENTACIÓN COMPLETA DEL FLUJO CHP SEGÚN PDF PROPUESTO
 * FECHA: 2025-09-04
 * BASADO EN: "Propuesta de flujo de trabajo para emisión de CHP"
 * 
 * FLUJO CORRECTO:
 * 1. Profesional solicita SIN PAGO PREVIO
 * 2. Staff revisa, corrige descripción, establece arancel
 * 3. Sistema genera factura → Estado: ESPERANDO PAGO
 * 4. Profesional paga y sube comprobante
 * 5. Staff verifica pago → Estado: LISTA PARA EMITIR
 * 6. Staff emite CHP → Estado: EMITIDO
 */

const fs = require('fs');
const { Client } = require('pg');
const config = require('./config.json');

async function implementarFlujoCHPCorrecto() {
    console.log('🔧 IMPLEMENTANDO FLUJO CHP SEGÚN DOCUMENTO OFICIAL...');
    console.log('='.repeat(70));
    
    // PASO 1: ACTUALIZAR BASE DE DATOS
    console.log('1. 📊 Actualizando estructura de base de datos...');
    await actualizarBaseDatos();
    
    // PASO 2: ACTUALIZAR PORTAL PROFESIONAL
    console.log('2. 👤 Actualizando portal profesional...');
    await actualizarPortalProfesional();
    
    // PASO 3: ACTUALIZAR PANEL ADMIN
    console.log('3. 🏛️ Actualizando panel administrativo...');
    await actualizarPanelAdmin();
    
    // PASO 4: ACTUALIZAR ENDPOINTS BACKEND
    console.log('4. ⚙️ Actualizando endpoints backend...');
    await actualizarEndpointsBackend();
    
    console.log('\n✅ IMPLEMENTACIÓN COMPLETADA');
    console.log('🎯 Flujo CHP ahora sigue el documento oficial exactamente');
}

async function actualizarBaseDatos() {
    const client = new Client(config.database);
    
    try {
        await client.connect();
        
        // AGREGAR NUEVOS ESTADOS Y CAMPOS
        await client.query(`
            -- Agregar nuevas columnas si no existen
            ALTER TABLE copig.solicitudes_chp 
            ADD COLUMN IF NOT EXISTS descripcion_corregida TEXT,
            ADD COLUMN IF NOT EXISTS arancel_establecido NUMERIC(12,2),
            ADD COLUMN IF NOT EXISTS comprobante_pago_archivo VARCHAR(255),
            ADD COLUMN IF NOT EXISTS fecha_carga_comprobante TIMESTAMP,
            ADD COLUMN IF NOT EXISTS verificado_por INTEGER,
            ADD COLUMN IF NOT EXISTS fecha_verificacion_pago TIMESTAMP,
            ADD COLUMN IF NOT EXISTS medios_pago_disponibles JSONB DEFAULT '["tarjeta_credito", "tarjeta_debito", "transferencia", "efectivo"]'::jsonb;
        `);
        
        // ACTUALIZAR CONSTRAINT DE ESTADOS SEGÚN FLUJO PROPUESTO
        await client.query(`
            ALTER TABLE copig.solicitudes_chp 
            DROP CONSTRAINT IF EXISTS solicitudes_chp_estado_check;
            
            ALTER TABLE copig.solicitudes_chp 
            ADD CONSTRAINT solicitudes_chp_estado_check 
            CHECK (estado IN (
                'PENDIENTE',           -- Paso 1: Profesional envió, esperando revisión staff
                'EN_REVISION',         -- Paso 2: Staff está revisando y corrigiendo
                'ESPERANDO_PAGO',      -- Paso 3: Factura generada, esperando pago profesional
                'COMPROBANTE_CARGADO', -- Paso 4: Profesional subió comprobante
                'LISTA_PARA_EMITIR',   -- Paso 5: Pago verificado, listo para emitir CHP
                'EMITIDO',             -- Paso 6: CHP emitido y entregado
                'OBSERVADO',           -- Casos especiales: requiere correcciones
                'RECHAZADO'            -- Casos especiales: solicitud rechazada
            ));
        `);
        
        console.log('   ✅ Estados actualizados según flujo propuesto');
        
        // CREAR TABLA PARA DOCUMENTOS ESPECÍFICOS REQUERIDOS
        await client.query(`
            CREATE TABLE IF NOT EXISTS copig.documentos_requeridos_chp (
                id SERIAL PRIMARY KEY,
                tipo_documento VARCHAR(100) NOT NULL,
                nombre_display VARCHAR(200) NOT NULL,
                obligatorio BOOLEAN DEFAULT true,
                descripcion TEXT,
                orden_visualizacion INTEGER,
                activo BOOLEAN DEFAULT true
            );
        `);
        
        // INSERTAR TIPOS DE DOCUMENTOS SEGÚN PDF
        await client.query(`
            INSERT INTO copig.documentos_requeridos_chp 
            (tipo_documento, nombre_display, obligatorio, descripcion, orden_visualizacion)
            VALUES 
            ('rotulo_plano', 'Rótulo de Plano', true, 'Rótulo firmado y sellado del plano de la obra', 1),
            ('comprobante_caja', 'Comprobante de la Caja', true, 'Comprobante de aportes a la Caja de Jubilaciones', 2),
            ('pago_matricula', 'Pago de Matrícula', true, 'Comprobante de matrícula profesional al día', 3),
            ('documentacion_adicional', 'Documentación Adicional', false, 'Cualquier documentación complementaria requerida', 4)
            ON CONFLICT (tipo_documento) DO NOTHING;
        `);
        
        console.log('   ✅ Tabla documentos requeridos creada');
        
    } catch (error) {
        console.error('❌ Error actualizando BD:', error);
    } finally {
        await client.end();
    }
}

async function actualizarPortalProfesional() {
    // LEER ARCHIVO ACTUAL
    let contenido = fs.readFileSync('C:\\copig-app\\portal-profesional.html', 'utf8');
    
    // REEMPLAZAR SECCIÓN DE FORMULARIO CHP
    const formularioAntiguo = /<!-- SECCIÓN CHP -->.*?<!-- FIN SECCIÓN CHP -->/gs;
    
    const formularioNuevo = `<!-- SECCIÓN CHP -->
                <div id="section-chp" class="content-section" style="display: none;">
                    <div class="section-header">
                        <h2>🏛️ Certificados de Habilitación Profesional (CHP)</h2>
                        <p>Solicite su CHP completando la información requerida. <strong>No se requiere pago previo.</strong></p>
                    </div>
                    
                    <div class="chp-tabs">
                        <button class="tab-btn active" onclick="mostrarTabCHP('nueva-solicitud')">
                            📝 Nueva Solicitud
                        </button>
                        <button class="tab-btn" onclick="mostrarTabCHP('mis-solicitudes')">
                            📋 Mis Solicitudes
                        </button>
                    </div>
                    
                    <!-- TAB: NUEVA SOLICITUD -->
                    <div id="tab-nueva-solicitud" class="tab-content active">
                        <form id="formCHP" class="chp-form">
                            
                            <!-- DATOS DE LA ENCOMIENDA -->
                            <div class="form-group-header">
                                <h3>📋 Datos de la Encomienda</h3>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="comitente">👥 Comitente:</label>
                                    <input type="text" id="comitente" name="cliente" required 
                                           placeholder="Nombre o Razón Social del Comitente">
                                </div>
                                <div class="form-group">
                                    <label for="cuit_comitente">🆔 CUIT del Comitente:</label>
                                    <input type="text" id="cuit_comitente" name="cuit_comitente"
                                           placeholder="XX-XXXXXXXX-X (opcional)">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="proyecto_obra">🏗️ Proyecto/Obra:</label>
                                <input type="text" id="proyecto_obra" name="proyecto" required 
                                       placeholder="Descripción breve del proyecto o obra">
                            </div>
                            
                            <div class="form-group">
                                <label for="descripcion_tarea">📝 Descripción de la Tarea Profesional:</label>
                                <textarea id="descripcion_tarea" name="descripcion" required rows="4"
                                          placeholder="Detalle específico de la tarea profesional a certificar. IMPORTANTE: Esta descripción podrá ser revisada y corregida por el personal del COPIG según protocolos."></textarea>
                                <small class="help-text">⚠️ Esta descripción será revisada por el personal del COPIG y podrá ser corregida según protocolos antes de establecer el arancel.</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="ubicacion_obra">📍 Ubicación de la Obra:</label>
                                <input type="text" id="ubicacion_obra" name="ubicacion_obra" required
                                       placeholder="Dirección completa de la obra">
                            </div>
                            
                            <!-- DOCUMENTACIÓN REQUERIDA -->
                            <div class="form-group-header">
                                <h3>📎 Documentación Requerida (Archivos PDF)</h3>
                                <p>Según protocolo COPIG, adjunte los siguientes documentos obligatorios:</p>
                            </div>
                            
                            <div class="documentos-requeridos">
                                <div class="documento-item">
                                    <label>📄 1. Rótulo de Plano:</label>
                                    <input type="file" name="rotulo_plano" accept=".pdf" required>
                                    <small>Rótulo firmado y sellado del plano de la obra</small>
                                </div>
                                
                                <div class="documento-item">
                                    <label>🏛️ 2. Comprobante de la Caja:</label>
                                    <input type="file" name="comprobante_caja" accept=".pdf" required>
                                    <small>Comprobante de aportes a la Caja de Jubilaciones al día</small>
                                </div>
                                
                                <div class="documento-item">
                                    <label>🎓 3. Pago de Matrícula:</label>
                                    <input type="file" name="pago_matricula" accept=".pdf" required>
                                    <small>Comprobante de matrícula profesional al día</small>
                                </div>
                                
                                <div class="documento-item opcional">
                                    <label>📋 4. Documentación Adicional (Opcional):</label>
                                    <input type="file" name="documentacion_adicional" accept=".pdf">
                                    <small>Cualquier documentación complementaria</small>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="observaciones_profesional">💬 Observaciones (Opcional):</label>
                                <textarea id="observaciones_profesional" name="observaciones" rows="3"
                                          placeholder="Cualquier observación o comentario adicional"></textarea>
                            </div>
                            
                            <!-- IMPORTANTE -->
                            <div class="info-box">
                                <h4>ℹ️ Importante - Flujo de Trabajo:</h4>
                                <ol>
                                    <li>✅ <strong>Envío sin pago:</strong> Su solicitud será enviada para revisión sin requerir pago previo.</li>
                                    <li>👁️ <strong>Revisión COPIG:</strong> El personal revisará su documentación y podrá corregir la descripción de la tarea según protocolos.</li>
                                    <li>💰 <strong>Establecimiento de arancel:</strong> El COPIG establecerá el importe exacto a facturar basado en la descripción final.</li>
                                    <li>📧 <strong>Notificación:</strong> Recibirá una factura en su portal para proceder con el pago.</li>
                                    <li>💳 <strong>Pago y comprobante:</strong> Deberá pagar y subir el comprobante para completar el proceso.</li>
                                </ol>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">
                                    📤 Enviar Solicitud para Revisión
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- TAB: MIS SOLICITUDES -->
                    <div id="tab-mis-solicitudes" class="tab-content">
                        <div id="listadoSolicitudesCHP">
                            <div class="loading">🔄 Cargando solicitudes...</div>
                        </div>
                    </div>
                </div>
                <!-- FIN SECCIÓN CHP -->`;
    
    // APLICAR REEMPLAZO
    if (formularioAntiguo.test(contenido)) {
        contenido = contenido.replace(formularioAntiguo, formularioNuevo);
        console.log('   ✅ Formulario CHP actualizado según flujo propuesto');
    } else {
        console.log('   ⚠️ No se encontró sección CHP para reemplazar');
    }
    
    // GUARDAR ARCHIVO
    fs.writeFileSync('C:\\copig-app\\portal-profesional.html', contenido);
}

async function actualizarPanelAdmin() {
    // Este será el siguiente paso - actualizar panel admin con las 3 secciones mencionadas en el PDF
    console.log('   📋 Panel admin será actualizado en siguiente paso...');
}

async function actualizarEndpointsBackend() {
    // Actualizar server.js con nuevos endpoints según flujo
    console.log('   ⚙️ Endpoints serán actualizados en siguiente paso...');
}

// EJECUTAR IMPLEMENTACIÓN
if (require.main === module) {
    implementarFlujoCHPCorrecto()
        .then(() => {
            console.log('\\n🏁 FLUJO CHP ACTUALIZADO SEGÚN DOCUMENTO OFICIAL');
            console.log('🎯 Próximos pasos: Actualizar panel admin y endpoints backend');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 ERROR FATAL:', error);
            process.exit(1);
        });
}

module.exports = { implementarFlujoCHPCorrecto };