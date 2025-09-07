#!/usr/bin/env node

/**
 * MÓDULO DE INTEGRACIÓN ARCA (ex-AFIP)
 * Fecha: 2025-09-04
 * Propósito: Integración con APIs ARCA para facturación electrónica oficial
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class ARCAIntegration {
    constructor(config) {
        this.config = {
            // Configuración base - DEBE completarse con datos reales del COPIG
            cuit: config.cuit || '30000000007', // CUIT del COPIG (ejemplo)
            ambiente: config.ambiente || 'testing', // 'testing' o 'production'
            puntoventa: config.puntoventa || 1,
            certificado: config.certificado || null, // Path al certificado digital
            privatekey: config.privatekey || null, // Path a la clave privada
            ...config
        };

        // URLs de APIs ARCA
        this.urls = {
            testing: {
                auth: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
                fe: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx'
            },
            production: {
                auth: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
                fe: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx'
            }
        };

        this.token = null;
        this.sign = null;
        this.tokenExpiry = null;
    }

    /**
     * PASO 1: Autenticación con ARCA
     */
    async autenticar() {
        try {
            console.log('🔐 Iniciando autenticación con ARCA...');

            // Verificar certificados
            if (!this.config.certificado || !fs.existsSync(this.config.certificado)) {
                throw new Error('Certificado digital no encontrado. Configurar config.certificado');
            }

            if (!this.config.privatekey || !fs.existsSync(this.config.privatekey)) {
                throw new Error('Clave privada no encontrada. Configurar config.privatekey');
            }

            // Generar Ticket de Acceso (TA)
            const ticket = await this.generarTicketAcceso();
            
            // Solicitar Token y Sign
            const auth = await this.solicitarToken(ticket);
            
            this.token = auth.token;
            this.sign = auth.sign;
            this.tokenExpiry = new Date(auth.expirationTime);

            console.log('✅ Autenticación exitosa con ARCA');
            console.log(`   Token válido hasta: ${this.tokenExpiry.toLocaleString('es-AR')}`);
            
            return true;

        } catch (error) {
            console.error('❌ Error en autenticación ARCA:', error.message);
            return false;
        }
    }

    /**
     * PASO 2: Generar CAE para factura
     */
    async solicitarCAE(datosFactura) {
        try {
            // Verificar autenticación vigente
            if (!this.token || new Date() > this.tokenExpiry) {
                console.log('🔄 Token expirado, re-autenticando...');
                await this.autenticar();
            }

            console.log('📄 Solicitando CAE para factura...');

            // Preparar datos para ARCA
            const solicitudCAE = {
                Auth: {
                    Token: this.token,
                    Sign: this.sign,
                    Cuit: this.config.cuit
                },
                FeCAEReq: {
                    FeCabReq: {
                        CantReg: 1,
                        PtoVta: this.config.puntoventa,
                        CbteTipo: datosFactura.tipoComprobante || 11 // Factura C por defecto
                    },
                    FeDetReq: {
                        FECAEDetRequest: [{
                            Concepto: datosFactura.concepto || 1, // Productos
                            DocTipo: datosFactura.docTipo || 96, // DNI
                            DocNro: datosFactura.docNumero,
                            CbteDesde: datosFactura.numeroFactura,
                            CbteHasta: datosFactura.numeroFactura,
                            CbteFch: this.formatearFecha(datosFactura.fecha || new Date()),
                            ImpTotal: datosFactura.montoTotal,
                            ImpTotConc: 0,
                            ImpNeto: datosFactura.montoNeto || datosFactura.montoTotal,
                            ImpOpEx: 0,
                            ImpTrib: 0,
                            ImpIVA: datosFactura.montoIVA || 0,
                            MonId: 'PES', // Pesos argentinos
                            MonCotiz: 1
                        }]
                    }
                }
            };

            // Enviar solicitud a ARCA
            const respuesta = await this.enviarSolicitudCAE(solicitudCAE);
            
            if (respuesta.success && respuesta.cae) {
                console.log('✅ CAE obtenido exitosamente');
                console.log(`   CAE: ${respuesta.cae}`);
                console.log(`   Vencimiento: ${respuesta.vencimiento}`);
                
                return {
                    success: true,
                    cae: respuesta.cae,
                    vencimiento: respuesta.vencimiento,
                    numeroComprobante: datosFactura.numeroFactura
                };
            } else {
                throw new Error(`Error ARCA: ${respuesta.error}`);
            }

        } catch (error) {
            console.error('❌ Error solicitando CAE:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * PASO 3: Validar comprobante emitido
     */
    async validarComprobante(cae, numeroComprobante, tipoComprobante = 11) {
        try {
            const solicitud = {
                Auth: {
                    Token: this.token,
                    Sign: this.sign,
                    Cuit: this.config.cuit
                },
                PtoVta: this.config.puntoventa,
                CbteTipo: tipoComprobante,
                CbteNro: numeroComprobante
            };

            const respuesta = await this.consultarComprobante(solicitud);
            
            return {
                success: respuesta.success,
                valido: respuesta.valido,
                estado: respuesta.estado,
                observaciones: respuesta.observaciones
            };

        } catch (error) {
            console.error('❌ Error validando comprobante:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * MÉTODOS AUXILIARES
     */

    async generarTicketAcceso() {
        // Generar TRA (Ticket de Requerimiento de Acceso)
        const tra = `<?xml version="1.0" encoding="UTF-8"?>
        <loginTicketRequest version="1.0">
            <header>
                <uniqueId>${Date.now()}</uniqueId>
                <generationTime>${new Date().toISOString()}</generationTime>
                <expirationTime>${new Date(Date.now() + 24*60*60*1000).toISOString()}</expirationTime>
            </header>
            <service>wsfe</service>
        </loginTicketRequest>`;

        // Aquí iría la firma digital del TRA con el certificado
        // Simulación para el ejemplo
        return Buffer.from(tra).toString('base64');
    }

    async solicitarToken(ticket) {
        // Simulación de respuesta de ARCA para el ejemplo
        return {
            token: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4=',
            sign: 'aHR0cHM6Ly93c2FhaG9tby5hZmlwLmdvdi5hci93cy9zZXJ2aWNl',
            expirationTime: new Date(Date.now() + 12*60*60*1000).toISOString()
        };
    }

    async enviarSolicitudCAE(solicitud) {
        // Simulación de respuesta para el ejemplo
        // En implementación real, hacer HTTPS POST a API ARCA
        return {
            success: true,
            cae: '12345678901234',
            vencimiento: new Date(Date.now() + 10*24*60*60*1000).toISOString().split('T')[0],
            numeroComprobante: solicitud.FeCAEReq.FeDetReq.FECAEDetRequest[0].CbteDesde
        };
    }

    async consultarComprobante(solicitud) {
        // Simulación para el ejemplo
        return {
            success: true,
            valido: true,
            estado: 'A', // Aprobado
            observaciones: []
        };
    }

    formatearFecha(fecha) {
        if (typeof fecha === 'string') {
            fecha = new Date(fecha);
        }
        
        const year = fecha.getFullYear();
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const day = fecha.getDate().toString().padStart(2, '0');
        
        return `${year}${month}${day}`;
    }

    /**
     * CONFIGURACIÓN PARA COPIG
     */
    static configuracionCOPIG() {
        return {
            cuit: '30000000007', // CUIT real del COPIG
            ambiente: 'testing', // Cambiar a 'production' en productivo
            puntoventa: 1,
            certificado: path.join(__dirname, 'certificados', 'copig.crt'),
            privatekey: path.join(__dirname, 'certificados', 'copig.key'),
            // Datos del emisor (COPIG)
            razonSocial: 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS',
            domicilio: 'Dirección del COPIG',
            condicionIVA: 'Exento' // Confirmar situación fiscal real
        };
    }
}

/**
 * FUNCIÓN DE INTEGRACIÓN CON SISTEMA CHP
 */
async function generarFacturaOficialCHP(solicitudCHP, montoFinal) {
    try {
        console.log('💰 Generando factura oficial CHP con ARCA...');

        // Configurar integración ARCA
        const arca = new ARCAIntegration(ARCAIntegration.configuracionCOPIG());

        // Autenticar con ARCA
        const auth = await arca.autenticar();
        if (!auth) {
            throw new Error('No se pudo autenticar con ARCA');
        }

        // Preparar datos de la factura
        const datosFactura = {
            tipoComprobante: 11, // Factura C (confirmar con contador)
            docTipo: 96, // DNI
            docNumero: solicitudCHP.profesional_dni,
            numeroFactura: await obtenerProximoNumeroFactura(),
            fecha: new Date(),
            montoTotal: montoFinal,
            montoNeto: montoFinal,
            montoIVA: 0, // COPIG posiblemente exento
            concepto: 1, // Servicios
            descripcion: `Certificado de Habilitación Profesional - ${solicitudCHP.proyecto}`
        };

        // Solicitar CAE a ARCA
        const resultadoCAE = await arca.solicitarCAE(datosFactura);
        
        if (resultadoCAE.success) {
            return {
                success: true,
                numeroFactura: datosFactura.numeroFactura,
                cae: resultadoCAE.cae,
                vencimientoCAE: resultadoCAE.vencimiento,
                fechaEmision: datosFactura.fecha,
                montoTotal: datosFactura.montoTotal,
                oficial: true // Marca que es factura oficial con ARCA
            };
        } else {
            throw new Error(resultadoCAE.error);
        }

    } catch (error) {
        console.error('❌ Error generando factura oficial:', error.message);
        
        // Fallback: generar factura interna (no oficial)
        return {
            success: true,
            numeroFactura: await obtenerProximoNumeroFactura(),
            cae: null,
            vencimientoCAE: null,
            fechaEmision: new Date(),
            montoTotal: montoFinal,
            oficial: false, // Marca que NO es oficial por error ARCA
            error: error.message
        };
    }
}

/**
 * OBTENER PRÓXIMO NÚMERO DE FACTURA
 */
async function obtenerProximoNumeroFactura() {
    // En implementación real, obtener de base de datos
    return `FACT-CHP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

// Exportar para uso en server.js
module.exports = {
    ARCAIntegration,
    generarFacturaOficialCHP,
    configuracionCOPIG: ARCAIntegration.configuracionCOPIG
};

// Script de prueba si se ejecuta directamente
if (require.main === module) {
    console.log('🧪 PRUEBA DE INTEGRACIÓN ARCA');
    console.log('════════════════════════════════');
    
    const solicitudPrueba = {
        id: 1,
        profesional_dni: '12345678',
        proyecto: 'EDIFICIO RESIDENCIAL - PROYECTO PRUEBA',
        cliente: 'CLIENTE PRUEBA'
    };
    
    generarFacturaOficialCHP(solicitudPrueba, 15000)
        .then(resultado => {
            console.log('✅ Resultado de facturación:');
            console.log(JSON.stringify(resultado, null, 2));
        })
        .catch(error => {
            console.error('❌ Error en prueba:', error.message);
        });
}