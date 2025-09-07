const fetch = require('node-fetch');

async function checkFechaInscripcion() {
    console.log('🔍 INVESTIGANDO FECHA_INSCRIPCION...\n');
    
    try {
        // Login
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: '20562024', password: 'ansiktet1969' })
        });
        
        const cookies = loginResponse.headers.get('set-cookie');
        
        // Obtener algunos profesionales
        const response = await fetch('http://localhost:3030/api/admin/profesionales?page=1', {
            headers: { 'Cookie': cookies }
        });
        
        const data = await response.json();
        
        console.log('Verificando formato de fecha_inscripcion en los primeros 5:');
        data.profesionales.slice(0, 5).forEach((p, i) => {
            console.log(`${i+1}. ${p.nombre}:`);
            console.log(`   fecha_inscripcion: "${p.fecha_inscripcion}" (tipo: ${typeof p.fecha_inscripcion})`);
            if (p.fecha_inscripcion) {
                const testDate = new Date(p.fecha_inscripcion);
                console.log(`   new Date() result: ${testDate} (válida: ${!isNaN(testDate.getTime())})`);
            }
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkFechaInscripcion();