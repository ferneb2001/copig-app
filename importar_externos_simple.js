const { exec } = require('child_process');
const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' IMPORTACIÓN SIMPLIFICADA DE PROFESIONALES EXTERNOS');
console.log('='.repeat(80));

// Primero vamos a usar Python para leer los DBF correctamente
const pythonScript = `
import dbf
import json

def leer_dbf(archivo):
    tabla = dbf.Table(archivo)
    tabla.open()
    datos = []
    for registro in tabla:
        datos.append(dict(registro))
    tabla.close()
    return datos

# Leer SVPROF
svprof = leer_dbf('C:/copig-app/adminsp/COPIG/SVPROF.DBF')
print(f"SVPROF: {len(svprof)} registros")
# Mostrar primeros 3
for i, r in enumerate(svprof[:3]):
    if 'APELLNOM' in r:
        print(f"  {i+1}. {r.get('APELLNOM', '')} - DNI: {r.get('DOCUMENTO', '')}")

# Leer SOPROF  
soprof = leer_dbf('C:/copig-app/adminsp/COPIG/SOPROF.DBF')
print(f"\\nSOPROF: {len(soprof)} registros")
# Mostrar primeros 3
for i, r in enumerate(soprof[:3]):
    nombre = f"{r.get('APELLIDO', '')}, {r.get('NOMBRE', '')}"
    print(f"  {i+1}. {nombre} - DNI: {r.get('DOCUMENTO', '')}")

# Guardar datos para JS
import json
with open('externos_temp.json', 'w') as f:
    json.dump({
        'svprof': svprof[:500],  # Primeros 500 para prueba
        'soprof': soprof[:500]
    }, f)

print("\\nDatos guardados en externos_temp.json")
`;

// Escribir script Python temporal
const fs = require('fs');
fs.writeFileSync('leer_externos.py', pythonScript);

console.log('\n📚 Leyendo archivos DBF con Python...\n');

exec('python leer_externos.py', async (error, stdout, stderr) => {
    if (error) {
        console.log('No se pudo usar Python, intentando con node-dbf...\n');
        
        // Plan B: Usar node-dbf de forma diferente
        const DBF = require('node-dbf').default;
        
        try {
            console.log('Procesando SVPROF.DBF...');
            const svprof = new DBF('C:/copig-app/adminsp/COPIG/SVPROF.DBF', 'latin1');
            
            console.log(`Total registros en SVPROF: ${svprof.records ? svprof.records.length : 0}`);
            
            let importados = 0;
            let errores = 0;
            
            if (svprof.records && svprof.records.length > 0) {
                console.log('\nImportando arquitectos/agrimensores...');
                
                for (let i = 0; i < Math.min(100, svprof.records.length); i++) {
                    const record = svprof.records[i];
                    
                    let nombre = '';
                    if (record['APELLNOM']) {
                        nombre = record['APELLNOM'];
                    } else if (record.APELLIDO && record.NOMBRE) {
                        nombre = `${record.APELLIDO}, ${record.NOMBRE}`;
                    }
                    
                    if (!nombre) continue;
                    
                    const documento = record.DOCUMENTO || record.DNI || null;
                    
                    try {
                        // Verificar si ya existe
                        if (documento) {
                            const existe = await pool.query(
                                'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
                                [documento]
                            );
                            
                            if (existe.rows.length > 0) {
                                continue;
                            }
                        }
                        
                        // Insertar
                        await pool.query(`
                            INSERT INTO copig.profesionales 
                            (nombre, numero_documento, email, telefono, direccion,
                             localidad, provincia, pais, estado, categoria, 
                             observaciones, fecha_creacion)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                            ON CONFLICT (numero_documento) DO NOTHING
                        `, [
                            nombre.toUpperCase(),
                            documento,
                            record.EMAIL || null,
                            record.TELEFONO || null,
                            record.DOMICILIO || null,
                            record.LOCALIDAD || null,
                            'MENDOZA',
                            'ARGENTINA',
                            record.ESTDO === 'A' ? 'activo' : 'inactivo',
                            'A',
                            'Arquitecto/Agrimensor externo'
                        ]);
                        
                        importados++;
                        
                        if (importados % 10 === 0) {
                            console.log(`  Importados: ${importados}`);
                        }
                        
                    } catch (err) {
                        errores++;
                    }
                }
                
                console.log(`\n✅ Arquitectos/Agrimensores importados: ${importados}`);
                console.log(`❌ Errores: ${errores}`);
            }
            
            // Ahora SOPROF
            console.log('\nProcesando SOPROF.DBF...');
            const soprof = new DBF('C:/copig-app/adminsp/COPIG/SOPROF.DBF', 'latin1');
            
            console.log(`Total registros en SOPROF: ${soprof.records ? soprof.records.length : 0}`);
            
            importados = 0;
            errores = 0;
            
            if (soprof.records && soprof.records.length > 0) {
                console.log('\nImportando lic. higiene y seguridad...');
                
                for (let i = 0; i < Math.min(100, soprof.records.length); i++) {
                    const record = soprof.records[i];
                    
                    const apellido = record.APELLIDO || '';
                    const nombre = record.NOMBRE || '';
                    const nombreCompleto = `${apellido}, ${nombre}`.toUpperCase();
                    
                    if (!apellido && !nombre) continue;
                    
                    const documento = record.DOCUMENTO || record.DNI || null;
                    
                    try {
                        // Verificar si ya existe
                        if (documento) {
                            const existe = await pool.query(
                                'SELECT id FROM copig.profesionales WHERE numero_documento = $1',
                                [documento]
                            );
                            
                            if (existe.rows.length > 0) {
                                continue;
                            }
                        }
                        
                        // Insertar
                        await pool.query(`
                            INSERT INTO copig.profesionales 
                            (nombre, numero_documento, email, telefono, direccion,
                             localidad, provincia, pais, estado, categoria, 
                             observaciones, fecha_creacion)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                            ON CONFLICT (numero_documento) DO NOTHING
                        `, [
                            nombreCompleto,
                            documento,
                            record.EMAIL || null,
                            record.TELEFONO || null,
                            record.DOMICILIO || null,
                            record.LOCALIDAD || null,
                            'MENDOZA',
                            'ARGENTINA',
                            record.ESTADO === 'A' ? 'activo' : 'inactivo',
                            'A',
                            'Lic. Higiene y Seguridad'
                        ]);
                        
                        importados++;
                        
                        if (importados % 10 === 0) {
                            console.log(`  Importados: ${importados}`);
                        }
                        
                    } catch (err) {
                        errores++;
                    }
                }
                
                console.log(`\n✅ Lic. Higiene y Seguridad importados: ${importados}`);
                console.log(`❌ Errores: ${errores}`);
            }
            
            // Resumen final
            const total = await pool.query('SELECT COUNT(*) as total FROM copig.profesionales');
            console.log('\n' + '='.repeat(80));
            console.log(' RESUMEN FINAL');
            console.log('='.repeat(80));
            console.log(`\nTotal profesionales en BD: ${total.rows[0].total}`);
            
        } catch (err) {
            console.error('Error:', err.message);
        }
        
        await pool.end();
        
    } else {
        console.log(stdout);
        
        // Si Python funcionó, leer el JSON e importar
        if (fs.existsSync('externos_temp.json')) {
            console.log('\n📥 Importando datos a PostgreSQL...\n');
            
            const datos = JSON.parse(fs.readFileSync('externos_temp.json'));
            
            // Importar datos...
            // [código de importación aquí]
            
            await pool.end();
        }
    }
});