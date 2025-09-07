const XLSX = require('xlsx');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' DEBUG IMPORTACIÓN RT');
console.log('='.repeat(80));

const workbook = XLSX.readFile('emp-rtcos-20250831.xlsx');
const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

(async () => {
    try {
        // Ver primeros 10 registros con matrícula
        console.log('\nPRIMEROS REGISTROS CON MATRÍCULA:');
        console.log('='.repeat(50));
        
        let count = 0;
        for (const row of data) {
            if (row['mat-prof'] && count < 10) {
                const matricula = parseInt(row['mat-prof']);
                const nombre = row['Razón social / Apellido y Nombre'];
                const marEmp = row['mar-emp'];
                
                // Verificar si la matrícula existe
                const matResult = await pool.query(`
                    SELECT p.nombre 
                    FROM copig.matriculas m
                    JOIN copig.profesionales p ON m.profesional_id = p.id
                    WHERE m.numero_matricula = $1
                `, [matricula]);
                
                const existe = matResult.rows.length > 0 ? '✅' : '❌';
                console.log(`${existe} Mat ${matricula}: ${nombre} (Empresa: ${marEmp})`);
                count++;
            }
        }
        
        // Verificar mapeo de empresas
        console.log('\n\nEMPRESAS DEL EXCEL:');
        console.log('='.repeat(50));
        
        const empresasExcel = new Map();
        data.forEach(row => {
            const marEmp = row['mar-emp'];
            const razon = row['Razón social / Apellido y Nombre'];
            if (!empresasExcel.has(marEmp)) {
                empresasExcel.set(marEmp, razon);
            }
        });
        
        // Mostrar primeras 5 empresas y verificar si existen en BD
        let empresasCount = 0;
        for (const [marEmp, razon] of empresasExcel) {
            if (empresasCount < 5) {
                // Buscar en BD
                const palabras = razon.split(' ').filter(p => p.length > 2 && !['S.A.', 'S.R.L.'].includes(p));
                const busqueda = palabras.slice(0, 2).join(' ');
                
                const result = await pool.query(`
                    SELECT id, razon_social 
                    FROM copig.empresas 
                    WHERE UPPER(razon_social) LIKE $1
                    LIMIT 1
                `, [`%${busqueda}%`]);
                
                const existe = result.rows.length > 0 ? '✅' : '❌';
                console.log(`${existe} ${marEmp}: ${razon.substring(0, 50)}`);
                if (result.rows.length > 0) {
                    console.log(`    -> En BD: ${result.rows[0].razon_social.substring(0, 50)}`);
                }
                empresasCount++;
            }
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
})();