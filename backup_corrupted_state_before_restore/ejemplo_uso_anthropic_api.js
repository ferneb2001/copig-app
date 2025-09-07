// EJEMPLO DE USO DE ANTHROPIC API EN TU PROYECTO
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Inicializar cliente con tu API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Ejemplo 1: Analizar datos masivos
async function analizarDatosMasivos() {
    const mensaje = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
            role: 'user',
            content: `Analiza estos 1000 registros de profesionales y:
            1. Detecta duplicados
            2. Identifica datos faltantes
            3. Sugiere correcciones
            4. Genera SQL para actualizar
            [aquí irían tus datos]`
        }]
    });
    
    return mensaje.content;
}

// Ejemplo 2: Procesar documentos PDF/imágenes
async function procesarDocumentos() {
    const fs = require('fs');
    const pdfBase64 = fs.readFileSync('pago.pdf', 'base64');
    
    const mensaje = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: 'Extrae los datos de este comprobante de pago'
                },
                {
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: 'application/pdf',
                        data: pdfBase64
                    }
                }
            ]
        }]
    });
    
    return mensaje.content;
}

// Ejemplo 3: Generación automática de código
async function generarCodigoImportacion(estructura) {
    const mensaje = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
            role: 'user',
            content: `Genera un script Node.js completo para importar datos con esta estructura:
            ${JSON.stringify(estructura)}
            
            Debe incluir:
            - Validación de datos
            - Manejo de errores
            - Transacciones SQL
            - Logging
            - Reporte de resultados`
        }]
    });
    
    return mensaje.content;
}

// Ejemplo 4: Trabajo autónomo con decisiones
async function procesarAutonomo(tarea) {
    const mensaje = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
            role: 'user',
            content: `Ejecuta esta tarea de forma autónoma:
            ${tarea}
            
            Si encuentras errores:
            1. Intenta resolverlos
            2. Si no puedes, documenta el problema
            3. Sugiere alternativas
            4. Continúa con lo siguiente`
        }]
    });
    
    return mensaje.content;
}

// Ejemplo 5: Análisis inteligente de base de datos
async function analizarCalidadDatos() {
    const { Pool } = require('pg');
    const config = require('./config.json');
    const pool = new Pool(config.database);
    
    // Obtener muestra de datos
    const empresas = await pool.query('SELECT * FROM copig.empresas LIMIT 100');
    const profesionales = await pool.query('SELECT * FROM copig.profesionales LIMIT 100');
    
    const mensaje = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
            role: 'user',
            content: `Analiza la calidad de estos datos y genera un reporte:
            
            EMPRESAS:
            ${JSON.stringify(empresas.rows, null, 2)}
            
            PROFESIONALES:
            ${JSON.stringify(profesionales.rows, null, 2)}
            
            Identifica:
            - Patrones de datos faltantes
            - Posibles errores
            - Inconsistencias
            - Recomendaciones de mejora
            - Scripts SQL para corregir`
        }]
    });
    
    await pool.end();
    return mensaje.content;
}

// USO PRÁCTICO
async function main() {
    try {
        // Analizar calidad de datos
        const analisis = await analizarCalidadDatos();
        console.log('Análisis:', analisis);
        
        // Generar código automáticamente
        const codigo = await generarCodigoImportacion({
            tabla: 'pagos',
            campos: ['profesional_id', 'monto', 'fecha'],
            validaciones: ['monto > 0', 'fecha válida']
        });
        console.log('Código generado:', codigo);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// main();

module.exports = {
    analizarDatosMasivos,
    procesarDocumentos,
    generarCodigoImportacion,
    procesarAutonomo,
    analizarCalidadDatos
};