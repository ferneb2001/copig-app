const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function createArancelesConfig() {
    try {
        console.log('🏗️  Creando tabla de configuración de aranceles...');
        
        // Crear tabla de configuración de aranceles
        await pool.query(`
            CREATE TABLE IF NOT EXISTS copig.aranceles_chp (
                id SERIAL PRIMARY KEY,
                segmento VARCHAR(5) NOT NULL,
                nombre_segmento VARCHAR(100) NOT NULL,
                monto_desde DECIMAL(15,2) NOT NULL,
                monto_hasta DECIMAL(15,2),
                arancel DECIMAL(15,2) NOT NULL,
                fecha_vigencia_desde DATE NOT NULL,
                fecha_vigencia_hasta DATE,
                activo BOOLEAN DEFAULT true,
                observaciones TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        console.log('✅ Tabla aranceles_chp creada');
        
        // Insertar aranceles actuales (2025)
        await pool.query(`
            INSERT INTO copig.aranceles_chp 
            (segmento, nombre_segmento, monto_desde, monto_hasta, arancel, fecha_vigencia_desde, fecha_vigencia_hasta, observaciones)
            VALUES 
            ('A', 'Segmento A - Básico', 0, 860000, 79000, '2025-07-15', '2025-09-30', 'Tarifario oficial COPIG 2025'),
            ('B', 'Segmento B - Intermedio', 860000.01, 5200000, 112000, '2025-07-15', '2025-09-30', 'Tarifario oficial COPIG 2025'),
            ('C', 'Segmento C - Superior', 5200000.01, NULL, 175000, '2025-07-15', '2025-09-30', 'Tarifario oficial COPIG 2025')
            ON CONFLICT DO NOTHING
        `);
        
        console.log('✅ Aranceles iniciales insertados');
        
        // Verificar datos
        const result = await pool.query(`
            SELECT segmento, nombre_segmento, monto_desde, monto_hasta, arancel, 
                   fecha_vigencia_desde, fecha_vigencia_hasta, activo
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.log('📊 ARANCELES CONFIGURADOS:');
        console.table(result.rows);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

createArancelesConfig();