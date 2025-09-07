/**
 * ANÁLISIS ESTADOS ORIGINALES PEÑALOZA
 * ==================================== 
 * Analizar archivos DBF con método correcto para encontrar lógica habilitación
 */

const DBF = require('node-dbf').default;

async function analyzeOriginalStates() {
    console.log('🔍 ANÁLISIS: Estados originales sistema Peñaloza\n');
    console.log('='.repeat(60) + '\n');
    
    try {
        // 1. ANALIZAR SPPROF.DBF (PROFESIONALES)
        console.log('👤 1. ANALIZANDO SPPROF.DBF\n');
        
        const profPath = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPPROF.DBF';
        const profDbf = new DBF(profPath);
        
        console.log(`📁 Archivo: ${profPath}`);
        console.log(`📊 Total registros: ${profDbf.recordCount}`);
        console.log('📋 Campos disponibles:');
        
        profDbf.fields.forEach(field => {
            console.log(`   ${field.name}: ${field.type} (${field.size})`);
        });
        
        // Buscar campos relacionados con estado/habilitación
        console.log('\n🔍 Campos sospechosos de indicar estado:');
        const camposSospechosos = [];
        
        profDbf.fields.forEach(field => {
            const nombre = field.name.toLowerCase();
            if (nombre.includes('estado') || 
                nombre.includes('habil') || 
                nombre.includes('activo') ||
                nombre.includes('suspen') ||
                nombre.includes('inhab') ||
                nombre.includes('vigente') ||
                nombre.includes('baja')) {
                camposSospechosos.push(field);
                console.log(`   ⭐ ${field.name}: ${field.type} (${field.size}) - POSIBLE ESTADO`);
            }
        });
        
        // Leer muestra de registros
        console.log('\\n📄 Muestra de registros (primeros 10):');
        for (let i = 0; i < Math.min(10, profDbf.recordCount); i++) {
            const record = profDbf.readRecord(i);
            console.log(`\\n   Registro ${i + 1}:`);
            console.log(`     MATPROF: ${record.MATPROF}`);
            console.log(`     NOMBRE: ${record.NOMBRE || record.nombre || 'N/A'}`);
            
            // Mostrar solo campos sospechosos
            camposSospechosos.forEach(campo => {
                console.log(`     ${campo.name}: ${record[campo.name]}`);
            });
        }
        
        // 2. ANALIZAR VALORES ÚNICOS EN CAMPOS SOSPECHOSOS
        console.log('\\n📊 VALORES ÚNICOS EN CAMPOS DE ESTADO:\\n');
        
        const valoresUnicos = {};
        camposSospechosos.forEach(campo => {
            valoresUnicos[campo.name] = new Set();
        });
        
        // Leer todos los registros para obtener valores únicos
        for (let i = 0; i < Math.min(1000, profDbf.recordCount); i++) {
            const record = profDbf.readRecord(i);
            camposSospechosos.forEach(campo => {
                if (record[campo.name] !== undefined && record[campo.name] !== null && record[campo.name] !== '') {
                    valoresUnicos[campo.name].add(record[campo.name]);
                }
            });
        }
        
        // Mostrar valores únicos encontrados
        Object.keys(valoresUnicos).forEach(campo => {
            console.log(`   ${campo}:`);
            Array.from(valoresUnicos[campo]).forEach(valor => {
                console.log(`     - "${valor}"`);
            });
            console.log('');
        });
        
        // 3. ANALIZAR SPMATRI.DBF (MATRICULAS)  
        console.log('🎓 2. ANALIZANDO SPMATRI.DBF\\n');
        
        try {
            const matriPath = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPMATRI.DBF';
            const matriDbf = new DBF(matriPath);
            
            console.log(`📁 Archivo: ${matriPath}`);
            console.log(`📊 Total registros: ${matriDbf.recordCount}`);
            
            // Buscar campos de estado en matriculas
            const camposMatricula = [];
            matriDbf.fields.forEach(field => {
                const nombre = field.name.toLowerCase();
                if (nombre.includes('estado') || 
                    nombre.includes('habil') || 
                    nombre.includes('activo') ||
                    nombre.includes('vigente') ||
                    nombre.includes('venci')) {
                    camposMatricula.push(field);
                    console.log(`   ⭐ ${field.name}: ${field.type} (${field.size}) - POSIBLE ESTADO MATRÍCULA`);
                }
            });
            
        } catch (error) {
            console.log(`❌ No se pudo leer SPMATRI.DBF: ${error.message}`);
        }
        
        console.log('\\n' + '='.repeat(60));
        console.log('🎯 RESUMEN DE HALLAZGOS');
        console.log('='.repeat(60));
        
        if (camposSospechosos.length > 0) {
            console.log('\\n✅ CAMPOS ENCONTRADOS QUE PUEDEN INDICAR ESTADO:');
            camposSospechosos.forEach(campo => {
                const valores = Array.from(valoresUnicos[campo.name]).join(', ');
                console.log(`   ${campo.name}: [${valores}]`);
            });
        } else {
            console.log('\\n❌ No se encontraron campos obvios de estado');
        }
        
        console.log('\\n💡 SIGUIENTE PASO:');
        console.log('   Implementar lógica basada en hallazgos del análisis');
        
    } catch (error) {
        console.error('❌ Error en análisis:', error.message);
        console.log('\\nℹ️  Intentando método alternativo...');
        
        // Método alternativo: analizar estructura sin leer contenido
        try {
            const fs = require('fs');
            const files = [
                'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPPROF.DBF',
                'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPMATRI.DBF',
                'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPRESTRI.DBF'
            ];
            
            console.log('📋 ARCHIVOS DISPONIBLES:');
            files.forEach(file => {
                try {
                    const stats = fs.statSync(file);
                    console.log(`   ✅ ${file.split('/').pop()}: ${Math.round(stats.size/1024)}KB`);
                } catch (e) {
                    console.log(`   ❌ ${file.split('/').pop()}: No encontrado`);
                }
            });
            
        } catch (altError) {
            console.log('❌ Error en método alternativo:', altError.message);
        }
    }
}

if (require.main === module) {
    analyzeOriginalStates();
}

module.exports = analyzeOriginalStates;