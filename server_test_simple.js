const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const config = require('./config.json');

const app = express();
const port = 3030;

// Configuración de la base de datos
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections || 20,
    ssl: false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 🧪 ENDPOINTS DE PRUEBA DEL SISTEMA ENRIQUECIDO

// Estadísticas generales
app.get('/api/test/estadisticas', async (req, res) => {
    try {
        console.log('🔍 Consultando estadísticas del sistema...');
        
        // Total de profesionales
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
        const total = parseInt(totalResult.rows[0].total);
        
        // Por especialidad
        const especialidadesResult = await pool.query(`
            SELECT especialidad, COUNT(*) as cantidad 
            FROM copig.profesionales 
            WHERE especialidad IS NOT NULL
            GROUP BY especialidad 
            ORDER BY cantidad DESC 
            LIMIT 10
        `);
        
        // Por área macro
        const macroResult = await pool.query(`
            SELECT 
                CASE 
                    WHEN especialidad LIKE '%CIVIL%' OR especialidad LIKE '%CONSTRUCCIONES%' OR especialidad LIKE '%HIDRÁULICA%' THEN 'INGENIERÍA CIVIL Y AFINES'
                    WHEN especialidad LIKE '%AGRONÓM%' THEN 'INGENIERÍA AGRONÓMICA'
                    WHEN especialidad LIKE '%GEOL%' OR especialidad LIKE '%GEOFÍS%' THEN 'GEOLOGÍA Y GEOFÍSICA'
                    WHEN especialidad LIKE '%HIGIENE%' OR especialidad LIKE '%SEGURIDAD%' THEN 'HIGIENE Y SEGURIDAD'
                    WHEN especialidad LIKE '%ELÉCTRIC%' OR especialidad LIKE '%ELECTRÓNIC%' OR especialidad LIKE '%ELECTROMECÁNIC%' THEN 'INGENIERÍAS ELÉCTRICAS'
                    ELSE 'OTRAS ESPECIALIDADES'
                END as area_macro,
                COUNT(*) as cantidad
            FROM copig.profesionales 
            WHERE especialidad IS NOT NULL
            GROUP BY 
                CASE 
                    WHEN especialidad LIKE '%CIVIL%' OR especialidad LIKE '%CONSTRUCCIONES%' OR especialidad LIKE '%HIDRÁULICA%' THEN 'INGENIERÍA CIVIL Y AFINES'
                    WHEN especialidad LIKE '%AGRONÓM%' THEN 'INGENIERÍA AGRONÓMICA'
                    WHEN especialidad LIKE '%GEOL%' OR especialidad LIKE '%GEOFÍS%' THEN 'GEOLOGÍA Y GEOFÍSICA'
                    WHEN especialidad LIKE '%HIGIENE%' OR especialidad LIKE '%SEGURIDAD%' THEN 'HIGIENE Y SEGURIDAD'
                    WHEN especialidad LIKE '%ELÉCTRIC%' OR especialidad LIKE '%ELECTRÓNIC%' OR especialidad LIKE '%ELECTROMECÁNIC%' THEN 'INGENIERÍAS ELÉCTRICAS'
                    ELSE 'OTRAS ESPECIALIDADES'
                END
            ORDER BY cantidad DESC
        `);
        
        res.json({
            status: 'success',
            timestamp: new Date().toISOString(),
            data: {
                total_profesionales: total,
                top_especialidades: especialidadesResult.rows,
                areas_macro: macroResult.rows
            }
        });
        
        console.log('✅ Estadísticas consultadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error consultando estadísticas:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// Buscar profesionales por matrícula
app.get('/api/test/profesional/:matricula', async (req, res) => {
    try {
        const { matricula } = req.params;
        console.log(`🔍 Buscando profesional con matrícula: ${matricula}`);
        
        const result = await pool.query(`
            SELECT matricula, apellido_y_nombre, titulo, especialidad, 
                   activo, fecha_habilitacion, created_at
            FROM copig.profesionales 
            WHERE matricula = $1
        `, [matricula]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                status: 'not_found', 
                message: 'Profesional no encontrado' 
            });
        }
        
        res.json({
            status: 'success',
            data: result.rows[0]
        });
        
        console.log('✅ Profesional encontrado exitosamente');
        
    } catch (error) {
        console.error('❌ Error buscando profesional:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// Verificar conexión a base de datos
app.get('/api/test/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as timestamp, version() as db_version');
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: result.rows[0].timestamp,
            db_info: result.rows[0].db_version
        });
        console.log('✅ Health check exitoso');
    } catch (error) {
        console.error('❌ Health check falló:', error);
        res.status(500).json({ 
            status: 'unhealthy', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

// Página de pruebas
app.get('/test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🧪 Pruebas Sistema COPIG Enriquecido</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
                .test-button { background: #007bff; color: white; padding: 10px 20px; border: none; margin: 5px; cursor: pointer; border-radius: 4px; }
                .result { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }
                pre { background: #f1f3f4; padding: 10px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🧪 Sistema de Pruebas COPIG Enriquecido</h1>
                <p><strong>Servidor funcionando correctamente!</strong></p>
                
                <h2>🔧 Pruebas Disponibles:</h2>
                <button class="test-button" onclick="testHealth()">Health Check</button>
                <button class="test-button" onclick="testStats()">Estadísticas</button>
                <button class="test-button" onclick="testProfesional()">Buscar Profesional</button>
                
                <div id="results"></div>
                
                <script>
                    async function testHealth() {
                        const response = await fetch('/api/test/health');
                        const data = await response.json();
                        showResult('Health Check', data);
                    }
                    
                    async function testStats() {
                        const response = await fetch('/api/test/estadisticas');
                        const data = await response.json();
                        showResult('Estadísticas del Sistema', data);
                    }
                    
                    async function testProfesional() {
                        const matricula = prompt('Ingrese número de matrícula:', '9106');
                        if (matricula) {
                            const response = await fetch('/api/test/profesional/' + matricula);
                            const data = await response.json();
                            showResult('Búsqueda de Profesional', data);
                        }
                    }
                    
                    function showResult(title, data) {
                        const results = document.getElementById('results');
                        const div = document.createElement('div');
                        div.className = 'result';
                        div.innerHTML = '<h3>' + title + '</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                        results.appendChild(div);
                    }
                </script>
            </div>
        </body>
        </html>
    `);
});

app.get('/', (req, res) => {
    res.redirect('/test');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor de pruebas COPIG ejecutándose en puerto ${port}`);
    console.log(`🧪 Panel de pruebas disponible en: http://localhost:${port}/test`);
    console.log(`📊 API de estadísticas: http://localhost:${port}/api/test/estadisticas`);
    console.log(`🔍 Health check: http://localhost:${port}/api/test/health`);
});

module.exports = app;