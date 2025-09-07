
/**
 * CONFIGURACIÓN PASARELAS DE PAGO COPIG
 * ====================================
 */

module.exports = {
    // Configuración general
    enabled: false, // Cambiar a true cuando se tengan credenciales reales
    base_url: 'http://localhost:3030', // Cambiar en producción
    default_gateway: 'mercadopago',
    
    // Credenciales Mercado Pago (DEMO - usar reales en producción)
    mercadopago: {
        access_token: 'DEMO-ACCESS-TOKEN', // Reemplazar con token real
        client_id: 'DEMO-CLIENT-ID',
        client_secret: 'DEMO-CLIENT-SECRET',
        webhook_secret: 'DEMO-WEBHOOK-SECRET',
        sandbox: true // false en producción
    },
    
    // Credenciales Macro Click (DEMO)
    macro_click: {
        merchant_id: 'DEMO-MERCHANT-ID',
        api_key: 'DEMO-API-KEY',
        secret_key: 'DEMO-SECRET-KEY',
        sandbox: true
    },
    
    // Credenciales Todo Pago (DEMO)
    todo_pago: {
        merchant_id: 'DEMO-MERCHANT-ID', 
        api_key: 'DEMO-API-KEY',
        security_key: 'DEMO-SECURITY-KEY',
        sandbox: true
    },
    
    // Configuración de webhooks
    webhooks: {
        timeout: 30000, // 30 segundos
        retry_attempts: 3,
        retry_delay: 5000 // 5 segundos
    },
    
    // URLs de retorno
    return_urls: {
        success: '/pago/exitoso',
        failure: '/pago/fallido', 
        pending: '/pago/pendiente'
    }
};
