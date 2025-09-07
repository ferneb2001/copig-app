const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' ANÁLISIS DETALLADO DE emp-rtcos-20250831.xlsx');
console.log(' Archivo de Peñaloza - Empresas y Representantes Técnicos ACTUALIZADOS');
console.log('='.repeat(80));

// Leer archivo Excel
const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`\n📁 Archivo: emp-rtcos-20250831.xlsx`);
console.log(`📊 Hoja: ${sheetName}`);
console.log(`📝 Total de registros: ${data.length}`);

// Analizar estructura de columnas
if (data.length > 0) {
    const columnas = Object.keys(data[0]);
    console.log('\n📋 COLUMNAS IDENTIFICADAS:');
    columnas.forEach((col, idx) => {
        // Contar valores no nulos
        const nonNull = data.filter(row => row[col] !== null && row[col] !== undefined && row[col] !== '').length;
        console.log(`   ${idx + 1}. "${col}" - ${nonNull}/${data.length} con datos`);
    });
    
    // Analizar datos clave
    console.log('\n🔍 ANÁLISIS DE CONTENIDO:');
    
    // Identificar empresas únicas (parece que mar-emp es el ID de empresa)
    const empresasMap = new Map();
    const matriculasSet = new Set();
    
    data.forEach(row => {
        const empresaId = row['mar-emp'];
        const cuit = row['cuit'];
        const razonSocial = row['Razón social / Apellido y Nombre'];
        const matricula = row['mat-prof'];
        
        if (empresaId && !empresasMap.has(empresaId)) {
            empresasMap.set(empresaId, {
                cuit: cuit,
                razon: razonSocial,
                representantes: []
            });
        }
        
        if (empresaId && matricula) {
            const empresa = empresasMap.get(empresaId);
            if (empresa) {
                empresa.representantes.push({
                    matricula: matricula,
                    categoria: row['cat-prof'],
                    habilitacion: row['habil.'],
                    fechaInicio: row['fecha-ini'],
                    fechaFin: row['fecha-fin']
                });
            }
            matriculasSet.add(matricula);
        }
    });
    
    console.log(`\n📊 ESTADÍSTICAS GENERALES:`);
    console.log(`   • Total de empresas únicas: ${empresasMap.size}`);
    console.log(`   • Total de representantes técnicos únicos: ${matriculasSet.size}`);
    console.log(`   • Total de asignaciones empresa-RT: ${data.filter(r => r['mat-prof']).length}`);
    
    // Top empresas con más representantes
    const empresasArray = Array.from(empresasMap.values())
        .filter(e => e.representantes.length > 0)
        .sort((a, b) => b.representantes.length - a.representantes.length);
    
    console.log('\n🏢 TOP 10 EMPRESAS CON MÁS REPRESENTANTES TÉCNICOS:');
    empresasArray.slice(0, 10).forEach((empresa, idx) => {
        console.log(`\n   ${idx + 1}. ${empresa.razon || 'Sin razón social'}`);
        console.log(`      CUIT: ${empresa.cuit || 'Sin CUIT'}`);
        console.log(`      Representantes: ${empresa.representantes.length}`);
        console.log(`      Matrículas: [${empresa.representantes.slice(0, 3).map(r => r.matricula).join(', ')}${empresa.representantes.length > 3 ? '...' : ''}]`);
    });
    
    // Análisis de años de habilitación
    const years = data.map(r => r['habil.']).filter(Boolean);
    const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
    console.log('\n📅 AÑOS DE HABILITACIÓN:');
    console.log(`   Rango: ${Math.min(...uniqueYears)} - ${Math.max(...uniqueYears)}`);
    console.log(`   Años activos: ${uniqueYears.slice(0, 10).join(', ')}${uniqueYears.length > 10 ? '...' : ''}`);
    
    // Verificar algunas empresas específicas
    console.log('\n🔎 EMPRESAS DESTACADAS (muestra):');
    const empresasDestacadas = ['IMPSA', 'YPF', 'TECHINT', 'ALUAR', 'ARCOR'];
    
    empresasArray.forEach(empresa => {
        const razon = empresa.razon ? empresa.razon.toUpperCase() : '';
        empresasDestacadas.forEach(nombre => {
            if (razon.includes(nombre)) {
                console.log(`\n   ✅ ${empresa.razon}`);
                console.log(`      CUIT: ${empresa.cuit || 'N/A'}`);
                console.log(`      Representantes técnicos: ${empresa.representantes.length}`);
            }
        });
    });
}

// Comparar con BD
(async () => {
    console.log('\n' + '='.repeat(80));
    console.log(' COMPARACIÓN CON BASE DE DATOS');
    console.log('='.repeat(80));
    
    try {
        // Estadísticas actuales en BD
        const statsDB = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM copig.empresas) as total_empresas,
                (SELECT COUNT(DISTINCT empresa_id) FROM copig.representantes_tecnicos) as empresas_con_rt,
                (SELECT COUNT(*) FROM copig.representantes_tecnicos) as total_rt_asignados,
                (SELECT COUNT(DISTINCT profesional_id) FROM copig.representantes_tecnicos) as rt_unicos
        `);
        
        const db = statsDB.rows[0];
        
        console.log('\n📊 ESTADO ACTUAL EN BASE DE DATOS:');
        console.log(`   • Empresas totales: ${db.total_empresas}`);
        console.log(`   • Empresas con RT: ${db.empresas_con_rt}`);
        console.log(`   • Asignaciones RT: ${db.total_rt_asignados}`);
        console.log(`   • RT únicos: ${db.rt_unicos}`);
        
        console.log('\n📊 DATOS EN EXCEL (ACTUALIZADOS AL 31/08/2025):');
        console.log(`   • Empresas con RT: ${Array.from(empresasMap.values()).filter(e => e.representantes.length > 0).length}`);
        console.log(`   • Asignaciones RT: ${data.filter(r => r['mat-prof']).length}`);
        console.log(`   • RT únicos: ${matriculasSet.size}`);
        
        console.log('\n⚠️ DIFERENCIAS CRÍTICAS:');
        const empresasConRTExcel = Array.from(empresasMap.values()).filter(e => e.representantes.length > 0).length;
        const asignacionesExcel = data.filter(r => r['mat-prof']).length;
        
        console.log(`   • Empresas con RT: Excel(${empresasConRTExcel}) vs BD(${db.empresas_con_rt})`);
        console.log(`     Diferencia: ${empresasConRTExcel - db.empresas_con_rt} empresas`);
        console.log(`   • Asignaciones: Excel(${asignacionesExcel}) vs BD(${db.total_rt_asignados})`);
        console.log(`     Diferencia: ${asignacionesExcel - db.total_rt_asignados} asignaciones`);
        
        if (empresasConRTExcel > db.empresas_con_rt) {
            console.log('\n   🔴 El Excel tiene MÁS empresas con RT que la BD');
            console.log('      Esto significa que hay empresas nuevas o actualizaciones pendientes');
        }
        
        console.log('\n' + '='.repeat(80));
        console.log(' RECOMENDACIÓN CRÍTICA');
        console.log('='.repeat(80));
        console.log('\n⚡ ESTE ARCHIVO ES LA FUENTE DE VERDAD ACTUALIZADA');
        console.log('   Contiene los representantes técnicos VIGENTES al 31/08/2025');
        console.log('\n📌 ACCIONES NECESARIAS:');
        console.log('   1. BACKUP inmediato de tablas actuales');
        console.log('   2. Importar/actualizar TODAS las empresas del Excel');
        console.log('   3. REEMPLAZAR todos los RT actuales con los del Excel');
        console.log('   4. Validar que todas las matrículas existan en profesionales');
        console.log('\n⚠️ IMPORTANTE: Los datos actuales en BD están DESACTUALIZADOS');
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        await pool.end();
    }
})();