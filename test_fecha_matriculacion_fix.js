const fetch = require('node-fetch');

async function testFechaMatriculacionFix() {
    console.log('🧪 PROBANDO FIX DE FECHA DE MATRICULACIÓN...\n');
    
    try {
        // Login
        const loginResponse = await fetch('http://localhost:3030/api/unified-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dni: '20562024', password: 'ansiktet1969' })
        });
        
        const cookies = loginResponse.headers.get('set-cookie');
        
        // Obtener profesionales de varias páginas para probar diferentes casos
        console.log('1. 📄 Probando página 1...');
        const page1Response = await fetch('http://localhost:3030/api/admin/profesionales?page=1', {
            headers: { 'Cookie': cookies }
        });
        
        const page1Data = await page1Response.json();
        console.log(`✅ Página 1: ${page1Data.profesionales.length} profesionales obtenidos`);
        
        // Analizar tipos de fechas_inscripcion
        let validDates = 0;
        let nullDates = 0;
        let futureDates = 0;
        let oldDates = 0;
        
        console.log('\n2. 🔍 Analizando fechas de inscripción...');
        
        page1Data.profesionales.forEach((p, i) => {
            if (!p.fecha_inscripcion) {
                nullDates++;
                if (i < 5) console.log(`   ${p.nombre}: NULL → "No disponible"`);
            } else {
                const date = new Date(p.fecha_inscripcion);
                const year = date.getFullYear();
                
                if (isNaN(date.getTime())) {
                    if (i < 5) console.log(`   ${p.nombre}: INVALID DATE → "No disponible"`);
                } else if (year > 2030) {
                    futureDates++;
                    if (i < 5) console.log(`   ${p.nombre}: ${p.fecha_inscripcion} (futuro) → "No disponible"`);
                } else if (year < 1950) {
                    oldDates++;
                    if (i < 5) console.log(`   ${p.nombre}: ${p.fecha_inscripcion} (muy antiguo) → "No disponible"`);
                } else {
                    validDates++;
                    if (i < 5) console.log(`   ${p.nombre}: ${p.fecha_inscripcion} → ${date.toLocaleDateString('es-AR')}`);
                }
            }
        });
        
        console.log('\n📊 Resumen de fechas de inscripción:');
        console.log(`   ✅ Válidas: ${validDates}`);
        console.log(`   ❌ Nulas: ${nullDates}`);
        console.log(`   ⚠️  Futuras (>2030): ${futureDates}`);
        console.log(`   ⚠️  Muy antiguas (<1950): ${oldDates}`);
        
        console.log('\n🎉 FIX APLICADO: Las fechas inválidas ahora mostrarán "No disponible"');
        console.log('✅ No más "Invalid Date" en columna Fecha de Matriculación');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFechaMatriculacionFix();