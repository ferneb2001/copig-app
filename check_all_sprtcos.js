/**
 * VERIFICAR TODOS LOS ARCHIVOS SPRTCOS.DBF
 * Para encontrar el que tiene los datos reales
 */

const fs = require('fs');
const Parser = require('node-dbf').default;

const archivos = [
    'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPRTCOS.DBF',
    'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\ez-20250710\\SPRTCOS.DBF', 
    'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\consejo\\SPRTCOS.DBF',
    'C:\\copig-app\\adminsp\\COPIG\\SPRTCOS.DBF',
    'C:\\copig-app\\COPIG NUEVOS DBF PEÑALOZA Y DOC\\dbf-activos\\SPRTCOS.DBF'
];

async function analizarArchivo(path) {
    return new Promise((resolve) => {
        if (!fs.existsSync(path)) {
            resolve({ path, existe: false });
            return;
        }
        
        const stats = fs.statSync(path);
        const parser = new Parser(path);
        let total = 0;
        let conDatos = 0;
        let primerRegistro = null;
        
        parser.on('record', (record) => {
            total++;
            
            // Verificar si tiene datos reales
            const matricula = record.MATRICULA ? record.MATRICULA.toString().trim() : '';
            const cuit = record.CUIT ? record.CUIT.toString().trim() : '';
            const nombre = record.NOMBRE ? record.NOMBRE.toString().trim() : '';
            
            if (matricula || cuit || nombre) {
                conDatos++;
                if (!primerRegistro) {
                    primerRegistro = {
                        matricula,
                        cuit,
                        nombre: nombre.substring(0, 30)
                    };
                }
            }
        });
        
        parser.on('end', () => {
            resolve({
                path,
                existe: true,
                tamaño: (stats.size / 1024).toFixed(2) + ' KB',
                fecha: stats.mtime.toLocaleDateString(),
                total,
                conDatos,
                primerRegistro
            });
        });
        
        parser.on('error', (err) => {
            resolve({
                path,
                existe: true,
                error: err.message
            });
        });
        
        parser.parse();
    });
}

async function verificarTodos() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISIS DE TODOS LOS ARCHIVOS SPRTCOS.DBF');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    for (const archivo of archivos) {
        const resultado = await analizarArchivo(archivo);
        
        console.log(`📁 ${archivo.split('\\').slice(-3).join('\\')}`);
        console.log('─'.repeat(60));
        
        if (!resultado.existe) {
            console.log('❌ Archivo no existe\n');
        } else if (resultado.error) {
            console.log(`❌ Error: ${resultado.error}\n`);
        } else {
            console.log(`📊 Tamaño: ${resultado.tamaño} | Fecha: ${resultado.fecha}`);
            console.log(`📈 Total registros: ${resultado.total}`);
            console.log(`✅ Registros con datos: ${resultado.conDatos}`);
            
            if (resultado.primerRegistro) {
                console.log(`📋 Ejemplo: ${resultado.primerRegistro.nombre || 'SIN NOMBRE'}`);
                console.log(`   Mat: ${resultado.primerRegistro.matricula || 'VACIO'} | CUIT: ${resultado.primerRegistro.cuit || 'VACIO'}`);
            }
            
            if (resultado.conDatos > 0) {
                console.log(`\n🎯 ¡ESTE ARCHIVO TIENE DATOS REALES!`);
            }
            console.log();
        }
    }
    
    console.log('✅ Análisis completado');
}

verificarTodos();