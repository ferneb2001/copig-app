
/**
 * MÓDULO PASARELA DE PAGOS COPIG
 * =============================
 * Integración segura con pasarelas de pago externas
 * Según especificaciones PDF Fernando Adrian Nebro
 */

class PaymentGateway {
    constructor(config) {
        this.config = config;
        this.supportedGateways = {
            'mercadopago': {
                name: 'Mercado Pago',
                webhook_url: '/api/webhook/mercadopago',
                redirect_url: 'https://www.mercadopago.com.ar/checkout/v1/redirect'
            },
            'macro_click': {
                name: 'Macro Click de Pago',
                webhook_url: '/api/webhook/macro',
                redirect_url: 'https://pagos.macro.com.ar/checkout'
            },
            'todo_pago': {
                name: 'Todo Pago',
                webhook_url: '/api/webhook/todopago',
                redirect_url: 'https://forms.todopago.com.ar/formulario/commands'
            }
        };
    }

    /**
     * PASO 1: PROFESIONAL VE FACTURA (según PDF)
     * Generar link de pago para factura CHP
     */
    async generarLinkPago(facturaData) {
        console.log('💳 Generando link de pago para factura:', facturaData.numero_factura);
        
        const paymentData = {
            // Datos básicos según PDF
            transaction_id: `COPIG-${facturaData.solicitud_id}-${Date.now()}`,
            amount: facturaData.monto_factura,
            currency: 'ARS',
            description: `CHP - ${facturaData.numero_solicitud} - ${facturaData.comitente}`,
            
            // URLs de retorno
            success_url: `${this.config.base_url}/pago/exitoso?solicitud=${facturaData.solicitud_id}`,
            failure_url: `${this.config.base_url}/pago/fallido?solicitud=${facturaData.solicitud_id}`,
            pending_url: `${this.config.base_url}/pago/pendiente?solicitud=${facturaData.solicitud_id}`,
            
            // Webhook para notificaciones automáticas
            notification_url: `${this.config.base_url}/api/webhook/payment-notification`,
            
            // Datos del profesional
            payer: {
                email: facturaData.profesional_email,
                identification: {
                    type: 'DNI',
                    number: facturaData.profesional_dni
                }
            }
        };
        
        // En implementación real, aquí se llamaría a la API de la pasarela
        const mockPaymentUrl = this.generateMockPaymentUrl(paymentData);
        
        return {
            payment_url: mockPaymentUrl,
            transaction_id: paymentData.transaction_id,
            gateway: this.config.default_gateway || 'mercadopago'
        };
    }

    /**
     * PASO 2: REDIRECCIÓN A PASARELA (según PDF)
     * "El profesional ahora está en la página del banco, no en la nuestra"
     */
    generateMockPaymentUrl(paymentData) {
        const gateway = this.supportedGateways[this.config.default_gateway || 'mercadopago'];
        
        // En desarrollo, generar URL simulada
        const params = new URLSearchParams({
            amount: paymentData.amount,
            description: paymentData.description,
            transaction_id: paymentData.transaction_id,
            success_url: paymentData.success_url,
            failure_url: paymentData.failure_url,
            notification_url: paymentData.notification_url
        });
        
        return `${gateway.redirect_url}?${params.toString()}`;
    }

    /**
     * PASO 3: PROCESAR NOTIFICACIÓN DE PAGO (según PDF)
     * "La pasarela nos avisa: La factura 1234 fue pagada con éxito"
     */
    async procesarNotificacionPago(webhookData, gateway) {
        console.log('🔔 Procesando notificación de pago:', webhookData.transaction_id);
        
        try {
            // Validar webhook según la pasarela
            const isValid = this.validarWebhook(webhookData, gateway);
            if (!isValid) {
                throw new Error('Webhook inválido');
            }
            
            // Extraer datos relevantes
            const paymentResult = {
                transaction_id: webhookData.transaction_id,
                status: this.mapearEstadoPago(webhookData.status, gateway),
                amount: webhookData.amount,
                gateway_payment_id: webhookData.payment_id,
                gateway_reference: webhookData.external_reference,
                payment_method: webhookData.payment_method_id,
                processed_at: new Date()
            };
            
            return paymentResult;
            
        } catch (error) {
            console.error('❌ Error procesando notificación:', error);
            throw error;
        }
    }

    /**
     * PASO 4: ACTUALIZAR SISTEMA COPIG (según PDF)
     * "Nuestro sistema recibe esa confirmación, marca la factura como Pagada"
     */
    async actualizarEstadoFactura(paymentResult, pool) {
        console.log('📋 Actualizando estado en sistema COPIG...');
        
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Buscar solicitud por transaction_id
            const solicitudResult = await client.query(`
                SELECT s.id, s.numero_solicitud, f.id as factura_id
                FROM copig.solicitudes_chp s
                JOIN copig.facturas_chp f ON s.id = f.solicitud_id
                WHERE f.transaction_id = $1
            `, [paymentResult.transaction_id]);
            
            if (solicitudResult.rows.length === 0) {
                throw new Error('Solicitud no encontrada para transaction_id: ' + paymentResult.transaction_id);
            }
            
            const solicitud = solicitudResult.rows[0];
            
            if (paymentResult.status === 'APPROVED') {
                // Pago exitoso - actualizar a COMPROBANTE_CARGADO
                await client.query(`
                    UPDATE copig.solicitudes_chp 
                    SET estado = 'COMPROBANTE_CARGADO',
                        fecha_pago = NOW()
                    WHERE id = $1
                `, [solicitud.id]);
                
                // Actualizar factura
                await client.query(`
                    UPDATE copig.facturas_chp 
                    SET estado_factura = 'PAGADA',
                        gateway_payment_id = $1,
                        payment_method = $2,
                        fecha_pago_gateway = $3
                    WHERE id = $4
                `, [
                    paymentResult.gateway_payment_id,
                    paymentResult.payment_method,
                    paymentResult.processed_at,
                    solicitud.factura_id
                ]);
                
                // Crear notificación
                await client.query(`
                    INSERT INTO copig.notificaciones_chp 
                    (solicitud_id, tipo, mensaje, fecha_envio)
                    VALUES ($1, 'PAGO_CONFIRMADO', 'Su pago ha sido confirmado automáticamente. El comprobante está siendo procesado.', NOW())
                `, [solicitud.id]);
                
                console.log(`✅ Pago confirmado para solicitud ${solicitud.numero_solicitud}`);
                
            } else if (paymentResult.status === 'REJECTED') {
                // Pago rechazado
                await client.query(`
                    UPDATE copig.facturas_chp 
                    SET estado_factura = 'RECHAZADA',
                        motivo_rechazo = $1
                    WHERE id = $2
                `, [paymentResult.rejection_reason || 'Pago rechazado por la pasarela', solicitud.factura_id]);
                
                await client.query(`
                    INSERT INTO copig.notificaciones_chp 
                    (solicitud_id, tipo, mensaje, fecha_envio)
                    VALUES ($1, 'PAGO_RECHAZADO', 'Su pago fue rechazado. Por favor, intente nuevamente o contacte con el COPIG.', NOW())
                `, [solicitud.id]);
                
                console.log(`⚠️ Pago rechazado para solicitud ${solicitud.numero_solicitud}`);
            }
            
            await client.query('COMMIT');
            return true;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Métodos auxiliares
    validarWebhook(webhookData, gateway) {
        // En implementación real, validar firma/hash según cada pasarela
        return webhookData && webhookData.transaction_id;
    }

    mapearEstadoPago(gatewayStatus, gateway) {
        const statusMap = {
            'mercadopago': {
                'approved': 'APPROVED',
                'rejected': 'REJECTED', 
                'pending': 'PENDING',
                'cancelled': 'CANCELLED'
            },
            'macro_click': {
                'success': 'APPROVED',
                'failed': 'REJECTED',
                'pending': 'PENDING'
            }
        };
        
        return statusMap[gateway]?.[gatewayStatus] || 'UNKNOWN';
    }
}

module.exports = PaymentGateway;
