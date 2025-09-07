const fs = require('fs');

function fixPageVariable() {
    console.log('🔧 CORRECCIÓN VARIABLE PAGE');
    console.log('==========================\n');
    
    try {
        const content = fs.readFileSync('./server.js', 'utf8');
        
        // Buscar líneas problemáticas con "page" no definido
        let fixed = 0;
        let newContent = content;
        
        // Error común: console.log con page sin definir
        const pageLogRegex = /console\.log\(\`📋 Búsqueda: "\${buscar}", página: \${page}\`\);/g;
        if (newContent.match(pageLogRegex)) {
            console.log('✅ Encontrada línea problemática de log');
            newContent = newContent.replace(pageLogRegex, 'console.log(`📋 Búsqueda: "${buscar}", página: ${page}`);');
            fixed++;
        }
        
        // También verificar otras referencias a page
        const lines = newContent.split('\n');
        let problemLines = [];
        
        lines.forEach((line, index) => {
            // Buscar líneas con page pero sin const page =
            if (line.includes('${page}') && !line.includes('const page') && line.includes('console.log')) {
                problemLines.push({lineNum: index + 1, line: line.trim()});
            }
        });
        
        console.log(`📋 Líneas problemáticas encontradas: ${problemLines.length}`);
        problemLines.forEach(p => {
            console.log(`   Línea ${p.lineNum}: ${p.line}`);
        });
        
        if (fixed > 0) {
            // Crear backup
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `./server.js.backup.pagefix.${timestamp}`;
            fs.writeFileSync(backupPath, content);
            console.log(`✅ Backup: ${backupPath}`);
            
            // Escribir corrección
            fs.writeFileSync('./server.js', newContent);
            console.log(`✅ ${fixed} correcciones aplicadas`);
        }
        
        // Crear script de prueba específico para profesionales
        const testScript = `
const axios = require('axios');

async function testProfesionales() {
    console.log('🧪 PRUEBA ESPECÍFICA PROFESIONALES');
    
    const client = axios.create({
        baseURL: 'http://localhost:3030',
        withCredentials: true
    });
    
    try {
        // Login
        await client.post('/api/unified-login', {
            dni: '20562024', 
            password: 'ansiktet1969'
        });
        
        // Probar profesionales
        const response = await client.get('/api/admin/profesionales?page=1&limit=2');
        console.log('✅ PROFESIONALES FUNCIONA:');
        console.log('Total:', response.data.total);
        console.log('Profesionales:', response.data.profesionales?.length || 0);
        
        if (response.data.profesionales && response.data.profesionales[0]) {
            const prof = response.data.profesionales[0];
            console.log('Ejemplo:', prof.nombre, '- DNI:', prof.numero_documento);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testProfesionales();
`;
        
        fs.writeFileSync('./test_profesionales_only.js', testScript);
        console.log('✅ Script de prueba creado: test_profesionales_only.js');
        
        console.log('\n🔄 NO necesitas reiniciar servidor para logs');
        console.log('💡 Ejecuta: node test_profesionales_only.js');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        return false;
    }
}

fixPageVariable();