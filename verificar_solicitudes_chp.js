const { Pool } = require('pg');
const config = require('./config.json');

async function verificarSolicitudesCHP() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🔍 Verificando estructura y datos de solicitudes CHP...');
        
        // Ver estructura de la tabla
        const estructuraQuery = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'copig' AND table_name = 'solicitudes_chp'
            ORDER BY ordinal_position
        `);
        
        console.log('📊 Estructura de la tabla solicitudes_chp:');
        estructuraQuery.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // Verificar solicitudes existentes
        const solicitudesQuery = await pool.query(`
            SELECT id, numero_solicitud, comitente, proyecto, estado, fecha_solicitud, profesional_id
            FROM copig.solicitudes_chp 
            ORDER BY fecha_solicitud DESC 
            LIMIT 10
        `);
        
        console.log('\n📋 Solicitudes CHP en BD:');
        solicitudesQuery.rows.forEach(sol => {
            console.log(`  - ID: ${sol.id}, Número: ${sol.numero_solicitud}, Comitente: ${sol.comitente}, Profesional ID: ${sol.profesional_id}`);
        });
        
        // Verificar específicamente para el profesional de prueba (ID 10752)
        const solicitudesProfesionalQuery = await pool.query(`
            SELECT id, numero_solicitud, comitente, proyecto, estado, fecha_solicitud
            FROM copig.solicitudes_chp 
            WHERE profesional_id = $1
            ORDER BY fecha_solicitud DESC
        `, [10752]);
        
        console.log('\n👤 Solicitudes del profesional de prueba (ID 10752):');
        if (solicitudesProfesionalQuery.rows.length > 0) {
            solicitudesProfesionalQuery.rows.forEach(sol => {
                console.log(`  - ${sol.numero_solicitud}: ${sol.comitente} - ${sol.estado}`);
            });
        } else {
            console.log('  ❌ No hay solicitudes para el profesional de prueba');
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await pool.end();
    }
}

verificarSolicitudesCHP();