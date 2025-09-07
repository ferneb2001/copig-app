const { Pool } = require('pg');
const config = require('./config.json');

console.log('🔍 SOLUCIONANDO VISIBILIDAD CHP EN ADMIN...');
console.log('═══════════════════════════════════════════════════');

const pool = new Pool(config.database);

async function checkAdminCHPEndpoint() {
    try {
        console.log('\n📊 VERIFICANDO ENDPOINT /api/admin/solicitudes-chp:');
        
        // Simular la consulta exacta del endpoint
        const query = `
            SELECT s.*, 
                   p.nombre || ' ' || COALESCE(p.apellido, '') as profesional_nombre,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY s.fecha_solicitud DESC
        `;
        
        console.log('   🧪 Ejecutando consulta del endpoint...');
        const result = await pool.query(query);
        
        console.log(`   📋 RESULTADO: ${result.rows.length} solicitudes encontradas`);
        
        if (result.rows.length === 0) {
            console.log('   ❌ NO HAY RESULTADOS - Problema en la consulta');
        } else {
            console.log('   ✅ HAY DATOS - Mostrando las primeras 3:');
            result.rows.slice(0, 3).forEach((row, index) => {
                console.log(`      ${index + 1}. ${row.numero_solicitud || 'Sin número'}`);
                console.log(`         Cliente: ${row.cliente || 'Sin cliente'}`);
                console.log(`         Profesional: ${row.profesional_nombre || 'Sin profesional'}`);
                console.log(`         Estado: ${row.estado || 'Sin estado'}`);
                console.log(`         Fecha: ${row.fecha_solicitud || 'Sin fecha'}`);
            });
        }
        
        // Verificar problemas en la consulta
        console.log('\n🔍 ANALIZANDO PROBLEMAS POTENCIALES:');
        
        // 1. Verificar tabla profesionales
        const profCheck = await pool.query(`
            SELECT COUNT(*) as total FROM copig.profesionales
        `);
        console.log(`   📊 Profesionales en BD: ${profCheck.rows[0].total}`);
        
        // 2. Verificar tabla matriculas
        const matriculaCheck = await pool.query(`
            SELECT COUNT(*) as total FROM copig.matriculas
        `);
        console.log(`   📊 Matrículas en BD: ${matriculaCheck.rows[0].total}`);
        
        // 3. Verificar si los JOINs están funcionando
        const joinCheck = await pool.query(`
            SELECT s.id, s.numero_solicitud, s.profesional_id, p.nombre
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LIMIT 3
        `);
        
        console.log('   🔗 Verificación de JOINs:');
        joinCheck.rows.forEach(row => {
            console.log(`      Solicitud ${row.id}: profesional_id=${row.profesional_id} → ${row.nombre || 'NULL'}`);
        });
        
        // 4. Verificar estructura de columnas
        const estructuraCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema='copig' AND table_name='profesionales' 
            AND column_name IN ('nombre', 'apellido')
        `);
        
        console.log('   📋 Columnas en tabla profesionales:');
        estructuraCheck.rows.forEach(col => {
            console.log(`      ✅ ${col.column_name}`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando endpoint:', error.message);
    }
}

async function testDirectFrontendCall() {
    try {
        console.log('\n🌐 SIMULANDO LLAMADA FRONTEND:');
        
        // Crear respuesta como la esperaría el frontend
        const query = `
            SELECT s.*, 
                   p.nombre || CASE 
                       WHEN p.apellido IS NOT NULL AND p.apellido != '' 
                       THEN ' ' || p.apellido 
                       ELSE '' 
                   END as profesional_nombre,
                   m.numero_matricula
            FROM copig.solicitudes_chp s
            LEFT JOIN copig.profesionales p ON s.profesional_id = p.id
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE s.id IS NOT NULL
            ORDER BY s.fecha_solicitud DESC
        `;
        
        const result = await pool.query(query);
        
        // Formato exacto que espera admin-chp.html
        const formattedData = result.rows.map(s => ({
            id: s.id,
            numero: s.numero_solicitud || `#${s.id}`,
            profesional: s.profesional_nombre || 'Sin asignar',
            matricula: s.numero_matricula || 'N/A',
            comitente: s.cliente || s.comitente || 'N/A',
            tipoTrabajo: s.proyecto || 'N/A',
            fecha: s.fecha_solicitud ? s.fecha_solicitud.split('T')[0] : '',
            estado: s.estado || 'PENDIENTE',
            prioridad: s.prioridad || 'normal',
            observaciones: s.observaciones || '',
            descripcion: s.descripcion || ''
        }));
        
        console.log(`   📊 DATOS FORMATEADOS: ${formattedData.length} solicitudes`);
        
        if (formattedData.length > 0) {
            console.log('   📋 EJEMPLO DE DATOS PARA FRONTEND:');
            console.log('   ', JSON.stringify(formattedData[0], null, 6));
        }
        
        // Simular respuesta del servidor
        const serverResponse = {
            success: true,
            solicitudes: formattedData
        };
        
        console.log(`   🎯 RESPUESTA SERVIDOR: success=${serverResponse.success}, solicitudes=${serverResponse.solicitudes.length}`);
        
    } catch (error) {
        console.error('❌ Error simulando frontend:', error.message);
    }
}

async function checkServerEndpointLive() {
    try {
        console.log('\n🔧 VERIFICANDO ENDPOINT EN SERVIDOR VIVO:');
        
        // Crear una consulta simple
        const fs = require('fs');
        const serverContent = fs.readFileSync('./server.js', 'utf8');
        
        // Buscar el endpoint
        const endpointRegex = /app\.get\(['"`]\/api\/admin\/solicitudes-chp['"`]/;
        const hasEndpoint = endpointRegex.test(serverContent);
        
        console.log(`   🔍 Endpoint existe en server.js: ${hasEndpoint ? '✅ SÍ' : '❌ NO'}`);
        
        if (hasEndpoint) {
            // Buscar la línea específica
            const lines = serverContent.split('\n');
            const endpointLine = lines.findIndex(line => 
                line.includes('/api/admin/solicitudes-chp') && line.includes('app.get')
            );
            
            if (endpointLine !== -1) {
                console.log(`   📍 Línea del endpoint: ${endpointLine + 1}`);
                console.log(`   📝 Código: ${lines[endpointLine].trim()}`);
            }
        }
        
        // Verificar si hay logs de debug
        const hasDebugLogs = serverContent.includes('Admin CHP GET - Autorizado');
        console.log(`   🐛 Tiene logs de debug: ${hasDebugLogs ? '✅ SÍ' : '❌ NO'}`);
        
    } catch (error) {
        console.error('❌ Error verificando servidor:', error.message);
    }
}

async function main() {
    await checkAdminCHPEndpoint();
    await testDirectFrontendCall();
    await checkServerEndpointLive();
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETO:');
    console.log('1. Si consulta SQL da resultados: Problema en endpoint o frontend');
    console.log('2. Si consulta SQL falla: Problema en estructura BD');
    console.log('3. Si endpoint no existe: Problema en server.js');
    console.log('4. Si frontend no llama: Problema en admin-chp.html');
    
    console.log('\n🔧 PRÓXIMO PASO SUGERIDO:');
    console.log('• Revisar admin-chp.html línea ~816 función cargarSolicitudes()');
    console.log('• Verificar que esté llamando a /api/admin/solicitudes-chp');
    console.log('• Checkear console del navegador para errores');
    
    await pool.end();
}

main().catch(console.error);