const xlsx = require('xlsx');
const fs = require('fs');

console.log('📄 ANÁLISIS SIMPLE DEL EXCEL emp-rtcos-20250831.xlsx');
console.log('══════════════════════════════════════════════════════════════════════════════\n');

const excelPath = 'C:/copig-app/emp-rtcos-20250831.xlsx';

if (!fs.existsSync(excelPath)) {
    console.log(`❌ No se encontró el archivo Excel: ${excelPath}`);
    process.exit(1);
}

try {
    const workbook = xlsx.readFile(excelPath);
    console.log(`📋 Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Total filas: ${data.length}`);
    
    if (data.length > 0) {
        console.log('\n🔍 COLUMNAS DISPONIBLES:');
        const columns = Object.keys(data[0]);
        columns.forEach((col, index) => {
            console.log(`${index + 1}. ${col}`);
        });
        
        console.log('\n📄 PRIMERAS 5 FILAS:');
        for (let i = 0; i < Math.min(5, data.length); i++) {
            console.log(`\n--- FILA ${i + 1} ---`);
            Object.entries(data[i]).forEach(([key, value]) => {
                console.log(`${key}: ${value}`);
            });
        }
        
        // Buscar campos que contengan "MATRICULA" o "MATRIC"
        console.log('\n🔍 ANÁLISIS DE MATRÍCULAS:');
        const matriculaFields = columns.filter(col => 
            col.toUpperCase().includes('MATRIC') || 
            col.toUpperCase().includes('MAT')
        );
        
        if (matriculaFields.length > 0) {
            console.log(`Campos relacionados con matrículas: ${matriculaFields.join(', ')}`);
            
            matriculaFields.forEach(field => {
                const valores = data.slice(0, 20).map(row => row[field]).filter(v => v);
                console.log(`\nEjemplos en ${field}:`);
                valores.slice(0, 10).forEach((val, index) => {
                    console.log(`  ${index + 1}. ${val} (tipo: ${typeof val})`);
                });
            });
        } else {
            console.log('❌ No se encontraron campos de matrícula');
        }
        
        // Buscar campos que contengan "PROFESIONAL" o "NOMBRE"
        console.log('\n👤 ANÁLISIS DE PROFESIONALES:');
        const profFields = columns.filter(col => 
            col.toUpperCase().includes('PROFESIONAL') || 
            col.toUpperCase().includes('NOMBRE')
        );
        
        if (profFields.length > 0) {
            console.log(`Campos de profesionales: ${profFields.join(', ')}`);
        }
        
        // Buscar campos que contengan "EMPRESA"
        console.log('\n🏢 ANÁLISIS DE EMPRESAS:');
        const empFields = columns.filter(col => 
            col.toUpperCase().includes('EMPRESA') || 
            col.toUpperCase().includes('EMP')
        );
        
        if (empFields.length > 0) {
            console.log(`Campos de empresas: ${empFields.join(', ')}`);
        }
    } else {
        console.log('❌ El Excel está vacío');
    }
    
} catch (error) {
    console.error('❌ Error procesando Excel:', error);
}