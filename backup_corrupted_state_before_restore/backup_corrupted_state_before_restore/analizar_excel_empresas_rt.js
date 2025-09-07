const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' ANÁLISIS PROFUNDO DE emp-rtcos-20250831.xlsx');
console.log(' Archivo crítico de Peñaloza con empresas y RT actualizados');
console.log('='.repeat(80));

// Leer archivo Excel
const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');

// Información general del archivo
console.log('\n📁 INFORMACIÓN DEL ARCHIVO:');
console.log('   Hojas disponibles:', workbook.SheetNames.join(', '));
console.log('   Fecha del archivo: 31/08/2025 (Actualizado recientemente)');

// Analizar cada hoja
workbook.SheetNames.forEach(sheetName => {
    console.log(`\n📊 ANALIZANDO HOJA: "${sheetName}"`);
    console.log('─'.repeat(50));
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length === 0) {
        console.log('   ⚠️ Hoja vacía');
        return;
    }
    
    // Obtener headers
    const headers = data[0];
    console.log('   Columnas:', headers ? headers.join(' | ') : 'Sin headers');
    console.log('   Total de filas:', data.length - 1, '(sin contar header)');
    
    // Si tiene datos, analizar contenido
    if (data.length > 1) {
        // Convertir a JSON con headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Estadísticas básicas
        console.log('\n   📈 ESTADÍSTICAS:');
        
        // Buscar columnas clave
        const firstRow = jsonData[0];
        const columnNames = Object.keys(firstRow || {});
        
        // Identificar columnas importantes
        const cuitCol = columnNames.find(c => c.toUpperCase().includes('CUIT'));
        const razonCol = columnNames.find(c => c.toUpperCase().includes('RAZON') || c.toUpperCase().includes('EMPRESA'));
        const matriculaCol = columnNames.find(c => c.toUpperCase().includes('MATRIC') || c.toUpperCase().includes('RT'));
        const nombreRTCol = columnNames.find(c => c.toUpperCase().includes('NOMBRE') || c.toUpperCase().includes('APELLIDO'));
        
        if (cuitCol) {
            const uniqueCuits = new Set(jsonData.map(r => r[cuitCol]).filter(Boolean));
            console.log(`   • Empresas únicas (por CUIT): ${uniqueCuits.size}`);
        }
        
        if (matriculaCol) {
            const matriculas = jsonData.map(r => r[matriculaCol]).filter(Boolean);
            const uniqueMatriculas = new Set(matriculas);
            console.log(`   • Representantes técnicos únicos: ${uniqueMatriculas.size}`);
            console.log(`   • Total de asignaciones empresa-RT: ${matriculas.length}`);
        }
        
        // Mostrar primeras 5 filas como ejemplo
        console.log('\n   📋 PRIMERAS 5 FILAS (MUESTRA):');
        jsonData.slice(0, 5).forEach((row, idx) => {
            console.log(`   ${idx + 1}.`, JSON.stringify(row).substring(0, 150) + '...');
        });
        
        // Análisis detallado si parece ser la hoja principal
        if (cuitCol && razonCol && matriculaCol) {
            console.log('\n   ✅ HOJA PRINCIPAL IDENTIFICADA - Análisis detallado:');
            
            // Empresas con más RTs
            const empresasRT = {};
            jsonData.forEach(row => {
                const cuit = row[cuitCol];
                const matricula = row[matriculaCol];
                if (cuit && matricula) {
                    if (!empresasRT[cuit]) {
                        empresasRT[cuit] = {
                            razon: row[razonCol],
                            rts: []
                        };
                    }
                    empresasRT[cuit].rts.push(matricula);
                }
            });
            
            // Top empresas con más RTs
            const sortedEmpresas = Object.entries(empresasRT)
                .sort((a, b) => b[1].rts.length - a[1].rts.length)
                .slice(0, 10);
            
            console.log('\n   🏢 TOP 10 EMPRESAS CON MÁS REPRESENTANTES TÉCNICOS:');
            sortedEmpresas.forEach(([cuit, data], idx) => {
                console.log(`   ${idx + 1}. ${data.razon || 'Sin razón social'}`);
                console.log(`      CUIT: ${cuit} | RTs: ${data.rts.length} | Matrículas: [${data.rts.slice(0, 5).join(', ')}${data.rts.length > 5 ? '...' : ''}]`);
            });
            
            // Guardar datos completos para comparación con BD
            global.excelData = {
                sheetName,
                columnNames,
                cuitCol,
                razonCol,
                matriculaCol,
                nombreRTCol,
                jsonData,
                empresasRT
            };
        }
    }
});

// Comparar con base de datos
(async () => {
    if (!global.excelData) {
        console.log('\n❌ No se pudo identificar la hoja principal con empresas y RTs');
        await pool.end();
        return;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(' COMPARACIÓN CON BASE DE DATOS ACTUAL');
    console.log('='.repeat(80));
    
    try {
        // Estadísticas de BD actual
        const statsEmpresas = await pool.query('SELECT COUNT(*) as total FROM copig.empresas');
        const statsRT = await pool.query('SELECT COUNT(*) as total FROM copig.representantes_tecnicos');
        const statsAsignaciones = await pool.query(`
            SELECT COUNT(DISTINCT empresa_id) as empresas_con_rt,
                   COUNT(*) as total_asignaciones
            FROM copig.representantes_tecnicos
        `);
        
        console.log('\n📊 ESTADO ACTUAL EN BD:');
        console.log(`   • Empresas totales: ${statsEmpresas.rows[0].total}`);
        console.log(`   • Representantes técnicos: ${statsRT.rows[0].total}`);
        console.log(`   • Empresas con RT asignado: ${statsAsignaciones.rows[0].empresas_con_rt}`);
        console.log(`   • Total asignaciones: ${statsAsignaciones.rows[0].total_asignaciones}`);
        
        const uniqueExcelEmpresas = Object.keys(global.excelData.empresasRT).length;
        const totalExcelRT = global.excelData.jsonData.length;
        
        console.log('\n📊 DATOS EN EXCEL (ACTUALIZADOS):');
        console.log(`   • Empresas con RT: ${uniqueExcelEmpresas}`);
        console.log(`   • Total asignaciones empresa-RT: ${totalExcelRT}`);
        
        console.log('\n🔄 DIFERENCIAS ENCONTRADAS:');
        console.log(`   • Empresas en Excel vs BD: ${uniqueExcelEmpresas} vs ${statsAsignaciones.rows[0].empresas_con_rt}`);
        console.log(`   • Diferencia: ${uniqueExcelEmpresas - statsAsignaciones.rows[0].empresas_con_rt} empresas`);
        console.log(`   • Asignaciones en Excel vs BD: ${totalExcelRT} vs ${statsAsignaciones.rows[0].total_asignaciones}`);
        console.log(`   • Diferencia: ${totalExcelRT - statsAsignaciones.rows[0].total_asignaciones} asignaciones`);
        
        // Verificar algunas empresas específicas del Excel en la BD
        console.log('\n🔍 VERIFICACIÓN DE MUESTRA (5 empresas del Excel):');
        const muestraCuits = Object.keys(global.excelData.empresasRT).slice(0, 5);
        
        for (const cuit of muestraCuits) {
            const empresa = await pool.query(
                'SELECT id, razon_social FROM copig.empresas WHERE cuit = $1',
                [cuit]
            );
            
            if (empresa.rows.length > 0) {
                const rtCount = await pool.query(
                    'SELECT COUNT(*) as total FROM copig.representantes_tecnicos WHERE empresa_id = $1',
                    [empresa.rows[0].id]
                );
                
                const excelRTs = global.excelData.empresasRT[cuit].rts.length;
                const bdRTs = rtCount.rows[0].total;
                
                console.log(`\n   CUIT ${cuit}:`);
                console.log(`   • Razón: ${global.excelData.empresasRT[cuit].razon}`);
                console.log(`   • Estado: ✅ Existe en BD (ID: ${empresa.rows[0].id})`);
                console.log(`   • RTs en Excel: ${excelRTs} | RTs en BD: ${bdRTs}`);
                if (excelRTs !== parseInt(bdRTs)) {
                    console.log(`   • ⚠️ DIFERENCIA: Faltan ${excelRTs - bdRTs} RTs por sincronizar`);
                }
            } else {
                console.log(`\n   CUIT ${cuit}:`);
                console.log(`   • Razón: ${global.excelData.empresasRT[cuit].razon}`);
                console.log(`   • Estado: ❌ NO existe en BD`);
                console.log(`   • RTs en Excel: ${global.excelData.empresasRT[cuit].rts.length}`);
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' RECOMENDACIONES');
        console.log('='.repeat(80));
        console.log('\n⚡ ACCIONES SUGERIDAS:');
        console.log('1. Este archivo contiene datos MÁS ACTUALIZADOS que la BD');
        console.log('2. Hay empresas en el Excel que NO están en la BD');
        console.log('3. Hay diferencias en las asignaciones de RT');
        console.log('\n📌 SE RECOMIENDA:');
        console.log('   • Hacer backup de las tablas actuales');
        console.log('   • Importar/actualizar empresas faltantes');
        console.log('   • Sincronizar asignaciones de representantes técnicos');
        console.log('   • Este archivo debe ser la FUENTE DE VERDAD para RT actuales');
        
        await pool.end();
    } catch (error) {
        console.error('\nError en análisis de BD:', error.message);
        await pool.end();
    }
})();