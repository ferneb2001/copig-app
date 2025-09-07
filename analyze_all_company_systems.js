/**
 * ANÁLISIS COMPLETO DE TODOS LOS SISTEMAS DE EMPRESAS
 * Buscar empresas faltantes en SP*, SV*, SO* y otros sistemas
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const Parser = require('node-dbf').default;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            resolve(null);
            return;
        }
        
        const parser = new Parser(filePath);
        const records = [];
        
        parser.on('record', (record) => records.push(record));
        parser.on('end', () => resolve(records));
        parser.on('error', (error) => reject(error));
        parser.parse();
    });
}

async function analyzeAllCompanySystems() {
    try {
        console.log('🔍 ANÁLISIS COMPLETO - TODOS LOS SISTEMAS DE EMPRESAS');
        console.log('🎯 Buscar empresas en SP*, SV*, SO* para representantes técnicos');
        console.log('='.repeat(80));

        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos');

        // 1. Obtener empresas actuales en BD
        console.log('\n1️⃣ EMPRESAS ACTUALES EN BD:');
        const currentCompanies = await pool.query('SELECT id FROM copig.empresas ORDER BY id');
        const existingIds = new Set(currentCompanies.rows.map(row => row.id));
        console.log(`   📊 Total: ${existingIds.size} empresas`);

        // 2. Leer SPRTCOS para obtener empresas referenciadas
        console.log('\n2️⃣ EMPRESAS REFERENCIADAS EN SPRTCOS:');
        const representantes = await readDBFFile(path.join(dbfPath, 'SPRTCOS.DBF'));
        const empresasReferenciadas = [...new Set(representantes.map(r => r.EMPRESA).filter(e => e && e > 0))];
        const empresasFaltantes = empresasReferenciadas.filter(id => !existingIds.has(id));
        console.log(`   📊 Empresas referenciadas: ${empresasReferenciadas.length}`);
        console.log(`   ❌ Empresas faltantes: ${empresasFaltantes.length}`);

        // 3. Buscar en todos los sistemas de empresas
        console.log('\n3️⃣ BÚSQUEDA EN TODOS LOS SISTEMAS:');
        
        const sistemasEmpresas = [
            { archivo: 'SPPROFE.DBF', nombre: 'SP* COPIG - Profesionales/Empresas', campo: 'DCNRO' },
            { archivo: 'SVPROFE.DBF', nombre: 'SV* EXTERNOS - Profesionales/Empresas', campo: 'DCNRO' },
            // Verificar si hay otros archivos de empresas
        ];

        const empresasEncontradas = new Map();
        let totalEncontradas = 0;

        for (let sistema of sistemasEmpresas) {
            console.log(`\n   📋 ${sistema.nombre}:`);
            const records = await readDBFFile(path.join(dbfPath, sistema.archivo));
            
            if (!records) {
                console.log(`      ❌ Archivo no encontrado: ${sistema.archivo}`);
                continue;
            }

            console.log(`      📊 Total registros: ${records.length}`);
            
            // Buscar empresas faltantes en este sistema
            const encontradasEnSistema = [];
            records.forEach(record => {
                const id = record[sistema.campo];
                if (id && empresasFaltantes.includes(id)) {
                    encontradasEnSistema.push(id);
                    empresasEncontradas.set(id, {
                        id,
                        nombre: record.NOMBRE || 'Sin nombre',
                        sistema: sistema.nombre,
                        cuit: record.CUIT || null,
                        domicilio: record.DOMICI || null,
                        email: record.EEMAIL || null,
                        telefono: record.TELEF || null
                    });
                }
            });

            console.log(`      ✅ Empresas faltantes encontradas: ${encontradasEnSistema.length}`);
            if (encontradasEnSistema.length > 0) {
                console.log(`      📋 Muestra IDs: ${encontradasEnSistema.slice(0, 10).join(', ')}`);
                totalEncontradas += encontradasEnSistema.length;
            }
        }

        // 4. Verificar en otros archivos que podrían tener empresas
        console.log('\n4️⃣ VERIFICANDO OTROS ARCHIVOS DBF:');
        const otrosArchivos = ['SANCION.DBF', 'SPSANCE.DBF', 'SPSANC.DBF'];
        
        for (let archivo of otrosArchivos) {
            console.log(`\n   📋 ${archivo}:`);
            const records = await readDBFFile(path.join(dbfPath, archivo));
            
            if (!records || records.length === 0) {
                console.log(`      ❌ No disponible o vacío`);
                continue;
            }

            console.log(`      📊 Total registros: ${records.length}`);
            
            // Mostrar campos disponibles para ver si hay empresas
            const sample = records[0];
            const camposEmpresa = Object.keys(sample).filter(key => 
                key.toLowerCase().includes('emp') || 
                key.toLowerCase().includes('matric') ||
                key.toLowerCase().includes('id') ||
                key === 'DCNRO' || key === 'CODIGO'
            );
            
            if (camposEmpresa.length > 0) {
                console.log(`      🔍 Campos relacionados: ${camposEmpresa.join(', ')}`);
            }
        }

        // 5. Análisis de profesionales por categoría en SPRTCOS
        console.log('\n5️⃣ ANÁLISIS POR CATEGORÍA EN SPRTCOS:');
        const categorias = {};
        representantes.forEach(rep => {
            const cat = rep.CATEGOR || 'Sin categoría';
            if (!categorias[cat]) categorias[cat] = 0;
            categorias[cat]++;
        });

        Object.keys(categorias).forEach(cat => {
            console.log(`   📊 Categoría ${cat}: ${categorias[cat]} representantes`);
        });

        // 6. Resumen final
        console.log('\n' + '='.repeat(80));
        console.log('🎯 RESUMEN DEL ANÁLISIS COMPLETO:');
        console.log(`   📊 Empresas actuales en BD: ${existingIds.size}`);
        console.log(`   ❌ Empresas faltantes buscadas: ${empresasFaltantes.length}`);
        console.log(`   ✅ Empresas encontradas en sistemas: ${totalEncontradas}`);
        console.log(`   ⚠️ Empresas aún faltantes: ${empresasFaltantes.length - totalEncontradas}`);

        if (totalEncontradas > 0) {
            console.log('\n💡 EMPRESAS ENCONTRADAS PARA IMPORTAR:');
            let count = 0;
            for (let [id, empresa] of empresasEncontradas) {
                if (count < 20) {
                    console.log(`   ${count + 1}. ID: ${id} - ${empresa.nombre} (${empresa.sistema})`);
                }
                count++;
            }
            if (count > 20) {
                console.log(`   ... y ${count - 20} más`);
            }
        }

        if (empresasFaltantes.length - totalEncontradas > 0) {
            console.log('\n⚠️ IDs HUÉRFANOS (no encontrados en ningún sistema):');
            const huerfanos = empresasFaltantes.filter(id => !empresasEncontradas.has(id));
            console.log(`   📋 Muestra: ${huerfanos.slice(0, 20).join(', ')}`);
        }

        console.log('\n🎯 PRÓXIMO PASO RECOMENDADO:');
        if (totalEncontradas > 0) {
            console.log(`   ✅ Importar las ${totalEncontradas} empresas encontradas`);
            console.log(`   ✅ Esto permitirá activar más representantes técnicos`);
        } else {
            console.log(`   ⚠️ Investigar por qué no se encuentran las empresas referenciadas`);
            console.log(`   💡 Consultar con Peñaloza sobre la consistencia de los DBF`);
        }
        console.log('='.repeat(80));

        return {
            empresasActuales: existingIds.size,
            empresasFaltantes: empresasFaltantes.length,
            empresasEncontradas: totalEncontradas,
            empresasHuerfanas: empresasFaltantes.length - totalEncontradas
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

analyzeAllCompanySystems();