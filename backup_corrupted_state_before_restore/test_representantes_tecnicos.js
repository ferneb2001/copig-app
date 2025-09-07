/**
 * SCRIPT DE VERIFICACIÓN SEGURA - REPRESENTANTES TÉCNICOS
 * Verifica si los representantes técnicos están cargados en el sistema
 * Usa APIs existentes (método prudente)
 */

const http = require('http');

const BASE_URL = 'http://localhost:3030';

// Función auxiliar para hacer requests HTTP
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3030,
            path: path,
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                } catch (error) {
                    reject(new Error(`Error parsing JSON: ${error.message}`));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => reject(new Error('Request timeout')));
        req.end();
    });
}

async function verificarRepresentantesTecnicos() {
    console.log('🔍 VERIFICANDO REPRESENTANTES TÉCNICOS EN EL SISTEMA...\n');
    
    try {
        // 1. Primero obtenemos algunas empresas para probar
        console.log('📋 Paso 1: Obteniendo lista de empresas...');
        const empresas = await makeRequest('/api/empresas?limit=5');
        console.log(`✅ Obtenidas ${empresas.length} empresas para verificar\n`);
        
        // 2. Verificar representantes técnicos para cada empresa
        let totalRepresentantes = 0;
        let empresasConRepresentantes = 0;
        
        console.log('🔍 Paso 2: Verificando representantes técnicos por empresa...');
        
        for (let i = 0; i < Math.min(10, empresas.length); i++) {
            const empresa = empresas[i];
            console.log(`\n   📊 Empresa ${i+1}: ${empresa.razon_social} (ID: ${empresa.id})`);
            
            try {
                const representantes = await makeRequest(`/api/empresas/${empresa.id}/representantes`);
                console.log(`   ✅ Representantes encontrados: ${representantes.length}`);
                
                if (representantes.length > 0) {
                    empresasConRepresentantes++;
                    totalRepresentantes += representantes.length;
                    
                    // Mostrar primer representante como ejemplo
                    const primer = representantes[0];
                    console.log(`   👤 Ejemplo: ${primer.nombre} - Matrícula: ${primer.matricula_profesional || 'N/A'}`);
                }
            } catch (error) {
                console.log(`   ❌ Error en empresa ${empresa.id}: ${error.message}`);
            }
            
            // Pausa prudente entre consultas
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 3. Resumen de resultados
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE VERIFICACIÓN:');
        console.log(`   • Total empresas verificadas: ${Math.min(10, empresas.length)}`);
        console.log(`   • Empresas con representantes: ${empresasConRepresentantes}`);
        console.log(`   • Total representantes encontrados: ${totalRepresentantes}`);
        console.log('='.repeat(60));
        
        if (totalRepresentantes === 0) {
            console.log('\n❌ RESULTADO: No se encontraron representantes técnicos cargados');
            console.log('💡 RECOMENDACIÓN: Revisar si los datos de SPRTCOS.DBF necesitan ser importados');
        } else {
            console.log('\n✅ RESULTADO: Sistema tiene representantes técnicos cargados');
            console.log(`📈 ESTADÍSTICA: ${(empresasConRepresentantes/Math.min(10, empresas.length)*100).toFixed(1)}% de empresas tienen representantes`);
        }
        
    } catch (error) {
        console.error('❌ ERROR GENERAL:', error.message);
        console.log('\n💡 POSIBLES CAUSAS:');
        console.log('   • Servidor no está corriendo');
        console.log('   • APIs no están disponibles');
        console.log('   • Problemas de permisos');
    }
}

// Ejecutar verificación
verificarRepresentantesTecnicos();