/**
 * ANÁLISIS LÓGICA ORIGINAL PEÑALOZA
 * ================================
 * Analizar archivos DBF originales para entender reglas de habilitación
 */

const DBF = require('node-dbf').default;
const { Pool } = require('pg');
const config = require('./config.json');

async function analyzePenalozaLogic() {
    console.log('🔍 ANÁLISIS: Lógica original sistema Peñaloza\n');
    console.log('='.repeat(70) + '\n');
    
    try {
        // 1. ANALIZAR SPRESTRI.DBF (RESTRICCIONES)
        console.log('🚫 1. ANALIZANDO SPRESTRI.DBF (Restricciones)\n');
        
        const restrictionsPath = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPRESTRI.DBF';
        let restrictionsDbf;
        
        try {
            restrictionsDbf = await DBF.open(restrictionsPath);
            console.log(`✅ SPRESTRI.DBF leído: ${restrictionsDbf.recordCount} registros`);
            
            // Ver estructura
            console.log('📋 Estructura SPRESTRI:');
            restrictionsDbf.fields.forEach(field => {
                console.log(`   ${field.name}: ${field.type} (${field.size})`);
            });
            
            // Leer algunos registros
            console.log('\n📄 Muestra de registros:');
            for (let i = 0; i < Math.min(10, restrictionsDbf.recordCount); i++) {
                const record = await restrictionsDbf.readRecord(i);
                console.log(`   Registro ${i + 1}:`, JSON.stringify(record, null, 2).substring(0, 200) + '...');
            }
            
        } catch (error) {
            console.log(`❌ Error leyendo SPRESTRI.DBF: ${error.message}`);
        }
        
        // 2. ANALIZAR SPPAGOS.DBF PARA ENTENDER ESTADOS
        console.log('\n💰 2. ANALIZANDO SPPAGOS.DBF (Patrones de pago)\n');
        
        const paymentsPath = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPPAGOS.DBF';
        let paymentsDbf;
        
        try {
            paymentsDbf = await DBF.open(paymentsPath);
            console.log(`✅ SPPAGOS.DBF leído: ${paymentsDbf.recordCount} registros`);
            
            // Analizar campos de estado/habilitación
            console.log('📋 Campos relevantes en SPPAGOS:');
            paymentsDbf.fields.forEach(field => {
                if (field.name.toLowerCase().includes('estado') || 
                    field.name.toLowerCase().includes('habil') || 
                    field.name.toLowerCase().includes('activo')) {
                    console.log(`   ⭐ ${field.name}: ${field.type} (${field.size})`);
                }
                console.log(`   ${field.name}: ${field.type}`);
            });
            
        } catch (error) {
            console.log(`❌ Error leyendo SPPAGOS.DBF: ${error.message}`);
        }
        
        // 3. ANALIZAR SPPROF.DBF PARA VER ESTADOS
        console.log('\n👤 3. ANALIZANDO SPPROF.DBF (Estados profesionales)\n');
        
        const profPath = 'COPIG NUEVOS DBF PEÑALOZA Y DOC/dbf-activos/SPPROF.DBF';
        let profDbf;
        
        try {
            profDbf = await DBF.open(profPath);
            console.log(`✅ SPPROF.DBF leído: ${profDbf.recordCount} registros`);
            
            // Ver campos de estado
            console.log('📋 Campos de estado en SPPROF:');
            profDbf.fields.forEach(field => {
                if (field.name.toLowerCase().includes('estado') || 
                    field.name.toLowerCase().includes('habil') || 
                    field.name.toLowerCase().includes('activo') ||
                    field.name.toLowerCase().includes('suspen')) {
                    console.log(`   ⭐ ${field.name}: ${field.type} (${field.size})`);
                }
            });
            
            // Leer algunos registros para ver valores de estado
            console.log('\n📄 Muestra de estados:');
            const estadosEncontrados = new Set();
            
            for (let i = 0; i < Math.min(50, profDbf.recordCount); i++) {
                const record = await profDbf.readRecord(i);
                
                // Buscar campos que puedan indicar estado
                Object.keys(record).forEach(key => {
                    if (key.toLowerCase().includes('estado') || 
                        key.toLowerCase().includes('habil') || 
                        key.toLowerCase().includes('activo') ||
                        key.toLowerCase().includes('suspen')) {
                        estadosEncontrados.add(`${key}: ${record[key]}`);
                    }
                });
            }
            
            console.log('   Estados únicos encontrados:');
            Array.from(estadosEncontrados).slice(0, 10).forEach(estado => {
                console.log(`     ${estado}`);
            });
            
        } catch (error) {
            console.log(`❌ Error leyendo SPPROF.DBF: ${error.message}`);
        }
        
        // 4. COMPARAR CON NUESTROS DATOS IMPORTADOS
        console.log('\n🔄 4. COMPARANDO CON DATOS IMPORTADOS\n');
        
        const pool = new Pool(config.database);
        
        try {
            // Ver si tenemos datos de restricciones
            const restriccionesImportadas = await pool.query(`
                SELECT COUNT(*) as total FROM copig.restricciones_deudas
            `);
            
            console.log(`📊 Restricciones en BD PostgreSQL: ${restriccionesImportadas.rows[0].total}`);
            
            if (restriccionesImportadas.rows[0].total > 0) {
                const muestraRestricciones = await pool.query(`
                    SELECT * FROM copig.restricciones_deudas LIMIT 5
                `);
                
                console.log('📄 Muestra restricciones importadas:');
                muestraRestricciones.rows.forEach((rest, i) => {
                    console.log(`   ${i + 1}. Matrícula ${rest.matricula}: ${rest.motivo || 'Sin motivo'}`);
                    console.log(`      Fecha: ${rest.fecha_restriccion ? rest.fecha_restriccion.toISOString().split('T')[0] : 'Sin fecha'}`);
                });
            }
            
            await pool.end();
        } catch (error) {
            console.log(`❌ Error consultando BD: ${error.message}`);
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🎯 CONCLUSIONES DEL ANÁLISIS');
        console.log('='.repeat(70));
        
        console.log('\n📋 PASOS SIGUIENTES:');
        console.log('   1. Identificar campos exactos de estado en archivos originales');
        console.log('   2. Entender lógica de restricciones por deuda');
        console.log('   3. Implementar misma lógica en sistema moderno');
        console.log('   4. Sincronizar estados con datos de pagos');
        
        console.log('\n❓ INFORMACIÓN NECESARIA:');
        console.log('   - ¿Qué campos del DBF original indican habilitación?');
        console.log('   - ¿Cuáles son los valores posibles de estado?');
        console.log('   - ¿Cómo se calculaba la habilitación en FoxPro?');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

if (require.main === module) {
    analyzePenalozaLogic();
}

module.exports = analyzePenalozaLogic;