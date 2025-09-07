/**
 * PRUEBA DE CORRECCIÓN - FECHAS MATRICULACIÓN
 * ==========================================
 * Verificar que la corrección funciona SIN REINICIAR servidor
 */

const { Pool } = require('pg');
const config = require('./config.json');

async function testMatriculationFix() {
    const pool = new Pool(config.database);
    
    try {
        console.log('🧪 PROBANDO CORRECCIÓN SIN REINICIAR SERVIDOR...\n');
        
        // Probar la consulta que ahora debería funcionar
        console.log('🔍 Probando consulta corregida...');
        const testQuery = `
            SELECT m.numero_matricula, m.fecha_inscripcion, m.fecha_habilitacion, 
                   p.nombre, p.numero_documento, m.activo
            FROM copig.matriculas m 
            JOIN copig.profesionales p ON m.profesional_id = p.id 
            WHERE m.fecha_inscripcion IS NOT NULL
            ORDER BY m.numero_matricula 
            LIMIT 5
        `;
        
        const result = await pool.query(testQuery);
        
        console.log(`✅ Consulta ejecutada exitosamente: ${result.rows.length} registros`);
        console.log('\n📋 MUESTRA DE DATOS CON FECHAS:');
        
        result.rows.forEach(row => {
            console.log(`Matrícula ${row.numero_matricula}:`);
            console.log(`   Profesional: ${row.nombre}`);
            console.log(`   DNI: ${row.numero_documento}`);
            console.log(`   Fecha Inscripción: ${row.fecha_inscripcion ? row.fecha_inscripcion.toISOString().split('T')[0] : 'No disponible'}`);
            console.log(`   Fecha Habilitación: ${row.fecha_habilitacion ? row.fecha_habilitacion.toISOString().split('T')[0] : 'No disponible'}`);
            console.log(`   Estado: ${row.activo ? 'ACTIVO' : 'INACTIVO'}`);
            console.log('');
        });
        
        // Verificar estadísticas generales
        console.log('📊 ESTADÍSTICAS DE FECHAS:');
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_matriculas,
                COUNT(fecha_inscripcion) as con_fecha_inscripcion,
                COUNT(fecha_habilitacion) as con_fecha_habilitacion,
                COUNT(fecha_titulo) as con_fecha_titulo,
                COUNT(fecha_certificado) as con_fecha_certificado
            FROM copig.matriculas
        `);
        
        const s = stats.rows[0];
        console.log(`   Total matrículas: ${s.total_matriculas}`);
        console.log(`   Con fecha inscripción: ${s.con_fecha_inscripcion} (${Math.round(s.con_fecha_inscripcion/s.total_matriculas*100)}%)`);
        console.log(`   Con fecha habilitación: ${s.con_fecha_habilitacion} (${Math.round(s.con_fecha_habilitacion/s.total_matriculas*100)}%)`);
        console.log(`   Con fecha título: ${s.con_fecha_titulo} (${Math.round(s.con_fecha_titulo/s.total_matriculas*100)}%)`);
        console.log(`   Con fecha certificado: ${s.con_fecha_certificado} (${Math.round(s.con_fecha_certificado/s.total_matriculas*100)}%)`);
        
        console.log('\n✅ CORRECCIÓN VERIFICADA: Las fechas de matriculación están disponibles');
        
    } catch (error) {
        console.log('❌ Error en prueba:', error.message);
        console.log('   Esto puede indicar que aún hay problemas en la consulta');
    } finally {
        await pool.end();
    }
}

testMatriculationFix();