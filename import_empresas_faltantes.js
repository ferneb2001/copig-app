/**
 * IMPORTACIÓN DE EMPRESAS FALTANTES
 * Importar las 1,432 empresas con IDs > 1189 desde SPPROFE.DBF
 * Esto permitirá vincular los representantes técnicos "inexistentes"
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

console.log('🚀 IMPORTACIÓN DE EMPRESAS FALTANTES');
console.log('📂 Origen: SPPROFE.DBF (empresas con IDs > 1189)');
console.log('🎯 Objetivo: Permitir vinculación de representantes técnicos');
console.log('='.repeat(80));

async function readDBFFile(filePath) {
    return new Promise((resolve, reject) => {
        const parser = new Parser(filePath);
        const records = [];
        
        parser.on('record', (record) => records.push(record));
        parser.on('end', () => resolve(records));
        parser.on('error', (error) => reject(error));
        parser.parse();
    });
}

// Función para convertir fecha YYYYMMDD a formato PostgreSQL
function convertDate(dateStr) {
    if (!dateStr || dateStr.length !== 8) return null;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
}

// Función para limpiar y validar CUIT
function cleanCUIT(cuit) {
    if (!cuit || cuit === 0) return null;
    const cuitStr = cuit.toString().replace(/[^0-9]/g, '');
    return cuitStr.length >= 11 ? cuitStr : null;
}

async function importEmpresasFaltantes() {
    let importadas = 0;
    let errores = 0;
    let duplicadas = 0;

    try {
        console.log('🔗 Conectando a base de datos...');
        await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa');

        console.log('📖 Leyendo SPPROFE.DBF...');
        const dbfPath = path.join(__dirname, 'COPIG NUEVOS DBF PEÑALOZA Y DOC', 'dbf-activos', 'SPPROFE.DBF');
        const records = await readDBFFile(dbfPath);
        console.log(`✅ ${records.length} registros leídos`);

        // Filtrar solo empresas con IDs > 1189 
        const empresasFaltantes = records.filter(emp => emp.DCNRO && emp.DCNRO > 1189);
        console.log(`🎯 Empresas a importar: ${empresasFaltantes.length}`);

        console.log('\n📊 INICIANDO IMPORTACIÓN...');
        
        for (let i = 0; i < empresasFaltantes.length; i++) {
            const empresa = empresasFaltantes[i];
            
            try {
                // Verificar si ya existe
                const existeResult = await pool.query(
                    'SELECT id FROM copig.empresas WHERE id = $1',
                    [empresa.DCNRO]
                );

                if (existeResult.rows.length > 0) {
                    duplicadas++;
                    if (i % 100 === 0) {
                        console.log(`⚠️  Empresa ${empresa.DCNRO} ya existe - saltando`);
                    }
                    continue;
                }

                // Preparar datos para inserción
                const razonSocial = empresa.NOMBRE ? empresa.NOMBRE.substring(0, 255).trim() : 'Sin nombre';
                const cuit = cleanCUIT(empresa.CUIT);
                const domicilio = empresa.DOMICI ? empresa.DOMICI.substring(0, 255).trim() : null;
                const telefono = empresa.TELEF ? empresa.TELEF.substring(0, 50).trim() : null;
                const email = empresa.EEMAIL ? empresa.EEMAIL.substring(0, 100).trim() : null;
                const provincia = empresa.PROVIN || null;
                const departamento = empresa.DPTO || null;
                const localidad = empresa.LOCALI || null;
                const codigoPostal = empresa.EMCPOST || null;

                // Insertar empresa
                await pool.query(`
                    INSERT INTO copig.empresas (
                        id, razon_social, cuit, domicilio, telefono, email,
                        provincia, departamento, localidad, codigo_postal,
                        activo, fecha_creacion, fecha_actualizacion, observaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW(), $11)
                `, [
                    empresa.DCNRO,
                    razonSocial,
                    cuit,
                    domicilio,
                    telefono,
                    email,
                    provincia,
                    departamento,
                    localidad,
                    codigoPostal,
                    'Importado desde SPPROFE.DBF'
                ]);

                importadas++;

                // Mostrar progreso cada 50 registros
                if ((i + 1) % 50 === 0) {
                    console.log(`📈 Progreso: ${i + 1}/${empresasFaltantes.length} - Importadas: ${importadas} - Duplicadas: ${duplicadas}`);
                }

                // Mostrar algunas empresas importantes
                if (empresa.NOMBRE.toUpperCase().includes('IMPSA') || 
                    empresa.NOMBRE.toUpperCase().includes('CARTELLONE') ||
                    empresa.NOMBRE.toUpperCase().includes('PESCARMONA')) {
                    console.log(`⭐ Empresa importante: ${empresa.DCNRO} - ${empresa.NOMBRE}`);
                }

            } catch (error) {
                errores++;
                if (errores <= 10) { // Solo mostrar los primeros 10 errores
                    console.error(`❌ Error importando empresa ${empresa.DCNRO}: ${error.message}`);
                }
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('📊 RESUMEN DE IMPORTACIÓN:');
        console.log(`   ✅ Empresas importadas: ${importadas}`);
        console.log(`   ⚠️  Empresas duplicadas: ${duplicadas}`);
        console.log(`   ❌ Errores: ${errores}`);
        console.log(`   📊 Total procesadas: ${empresasFaltantes.length}`);

        // Verificar algunas empresas importantes
        console.log('\n🔍 VERIFICACIÓN DE EMPRESAS IMPORTANTES:');
        const empresasImportantes = ['IMPSA', 'CARTELLONE', 'PESCARMONA', 'TECNICAGUA'];
        
        for (let nombreEmpresa of empresasImportantes) {
            const result = await pool.query(
                'SELECT id, razon_social FROM copig.empresas WHERE razon_social ILIKE $1 ORDER BY id LIMIT 3',
                [`%${nombreEmpresa}%`]
            );
            
            if (result.rows.length > 0) {
                console.log(`   ✅ ${nombreEmpresa}:`);
                result.rows.forEach(emp => {
                    console.log(`      - ID: ${emp.id} - ${emp.razon_social}`);
                });
            }
        }

        return { importadas, duplicadas, errores };

    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error.message);
        throw error;
    }
}

importEmpresasFaltantes().then(result => {
    console.log('\n🎉 IMPORTACIÓN COMPLETADA!');
    console.log('🚀 PRÓXIMO PASO: Re-ejecutar importación de representantes técnicos');
    console.log('💡 Ahora los representantes "inexistentes" tendrán sus empresas');
    console.log('='.repeat(80));
}).catch(error => {
    console.error('\n💥 IMPORTACIÓN FALLÓ:', error.message);
}).finally(() => {
    pool.end();
});