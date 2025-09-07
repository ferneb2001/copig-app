const fs = require('fs');
const mammoth = require('mammoth');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

// Archivos Word a procesar
const archivosWord = [
    {archivo: 'C:\\copig-app\\profesionales de la web\\Geología.docx', categoria: 'GEOLOGÍA'},
    {archivo: 'C:\\copig-app\\profesionales de la web\\Ingeniería agronomica.docx', categoria: 'AGRONOMÍA'}, 
    {archivo: 'C:\\copig-app\\profesionales de la web\\Ingeniería Civil.docx', categoria: 'CIVIL'},
    {archivo: 'C:\\copig-app\\profesionales de la web\\Ingeniería especializada.docx', categoria: 'ESPECIALIZADA'}
];

function parsearLineaProfesional(linea) {
    // Esperamos formato como: "1 8763 ABRAHAM, LAURA IRENE INGENIERO AGRONOMO A"
    // Donde: ORD MATRICULA APELLIDO, NOMBRE TITULO CT
    
    const partes = linea.trim().split(/\\s+/);
    if (partes.length < 5) return null;
    
    const ord = partes[0];
    const matricula = partes[1];
    const ct = partes[partes.length - 1]; // Último elemento (A/I)
    
    // Todo lo que está entre matrícula y CT es el nombre y título
    const contenidoMedio = partes.slice(2, -1).join(' ');
    
    // Buscar la coma para separar apellido, nombre del título
    const indiceComa = contenidoMedio.indexOf(',');
    if (indiceComa === -1) return null;
    
    // Encontrar donde termina el nombre y empieza el título
    // Buscar patrones típicos de inicio de título
    const patronesTitulo = [
        'INGENIERO', 'ING\\.', 'LICENCIADO', 'GEOLOGO', 'DOCTOR', 'TECNICO'
    ];
    
    let indiceInicioTitulo = -1;
    for (const patron of patronesTitulo) {
        const regex = new RegExp(`\\\\b${patron}`, 'i');
        const match = contenidoMedio.match(regex);
        if (match) {
            indiceInicioTitulo = match.index;
            break;
        }
    }
    
    if (indiceInicioTitulo === -1) return null;
    
    const nombreCompleto = contenidoMedio.substring(0, indiceInicioTitulo).trim();
    const titulo = contenidoMedio.substring(indiceInicioTitulo).trim();
    
    return {
        ord: parseInt(ord) || 0,
        matricula: parseInt(matricula) || 0,
        nombre: nombreCompleto,
        titulo: titulo,
        estado: ct,
        lineaOriginal: linea
    };
}

async function analizarProfesionalesWeb() {
    try {
        console.log('🔍 ANALIZANDO PROFESIONALES DE LA WEB OFICIAL DEL COPIG');
        console.log('='.repeat(70));
        
        const todosProfesionales = [];
        let totalArchivos = 0;
        let totalProfesionales = 0;
        
        for (const {archivo, categoria} of archivosWord) {
            console.log(`\\n📂 PROCESANDO: ${categoria}`);
            console.log(`   Archivo: ${archivo}`);
            
            try {
                // Leer archivo Word
                const buffer = fs.readFileSync(archivo);
                const result = await mammoth.extractRawText({buffer});
                const textoCompleto = result.value;
                
                const lineas = textoCompleto.split('\\n').filter(linea => linea.trim().length > 0);
                console.log(`   📄 ${lineas.length} líneas encontradas`);
                
                let procesadosCategoria = 0;
                let erroresCategoria = 0;
                
                // Procesar cada línea
                for (const linea of lineas) {
                    const profesional = parsearLineaProfesional(linea);
                    
                    if (profesional && profesional.matricula > 0) {
                        profesional.categoria = categoria;
                        todosProfesionales.push(profesional);
                        procesadosCategoria++;
                        
                        // Mostrar primeros 3 ejemplos
                        if (procesadosCategoria <= 3) {
                            console.log(`   ✅ Mat. ${profesional.matricula}: ${profesional.nombre} - ${profesional.titulo} (${profesional.estado})`);
                        }
                    } else {
                        erroresCategoria++;
                        // Mostrar primeros errores para debug
                        if (erroresCategoria <= 2) {
                            console.log(`   ⚠️  No parseado: "${linea.substring(0, 60)}..."`);
                        }
                    }
                }
                
                console.log(`   📊 Procesados: ${procesadosCategoria}, Errores: ${erroresCategoria}`);
                totalProfesionales += procesadosCategoria;
                totalArchivos++;
                
            } catch (error) {
                console.log(`   ❌ Error procesando ${categoria}: ${error.message}`);
            }
        }
        
        console.log('\\n' + '='.repeat(70));
        console.log('📊 RESUMEN TOTAL:');
        console.log(`📂 Archivos procesados: ${totalArchivos}/4`);
        console.log(`👥 Total profesionales extraídos: ${totalProfesionales}`);
        
        // Estadísticas por categoría
        const estadisticasPorCategoria = {};
        todosProfesionales.forEach(prof => {
            if (!estadisticasPorCategoria[prof.categoria]) {
                estadisticasPorCategoria[prof.categoria] = {total: 0, activos: 0, titulos: new Set()};
            }
            estadisticasPorCategoria[prof.categoria].total++;
            if (prof.estado === 'A') estadisticasPorCategoria[prof.categoria].activos++;
            estadisticasPorCategoria[prof.categoria].titulos.add(prof.titulo);
        });
        
        console.log('\\n📋 ESTADÍSTICAS POR CATEGORÍA:');
        Object.entries(estadisticasPorCategoria).forEach(([categoria, stats]) => {
            console.log(`   ${categoria}:`);
            console.log(`      Total: ${stats.total}, Activos: ${stats.activos}, Títulos únicos: ${stats.titulos.size}`);
        });
        
        // Títulos únicos encontrados
        const todosLosTitulos = new Set();
        todosProfesionales.forEach(prof => todosLosTitulos.add(prof.titulo));
        
        console.log(`\\n📋 TÍTULOS ÚNICOS ENCONTRADOS: ${todosLosTitulos.size}`);
        Array.from(todosLosTitulos).sort().slice(0, 20).forEach((titulo, index) => {
            console.log(`   ${index + 1}. ${titulo}`);
        });
        
        if (todosLosTitulos.size > 20) {
            console.log(`   ... y ${todosLosTitulos.size - 20} títulos más`);
        }
        
        // Guardar datos extraídos
        const datosExtraidos = {
            fecha_extraccion: new Date().toISOString(),
            total_profesionales: totalProfesionales,
            profesionales: todosProfesionales,
            estadisticas_categoria: estadisticasPorCategoria,
            titulos_unicos: Array.from(todosLosTitulos).sort()
        };
        
        fs.writeFileSync(
            'C:\\copig-app\\profesionales_web_extraidos.json',
            JSON.stringify(datosExtraidos, null, 2)
        );
        
        console.log('\\n💾 Datos guardados en: profesionales_web_extraidos.json');
        console.log('\\n🎯 PRÓXIMO PASO: Usar estos datos oficiales para corregir BD');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error general:', error);
        await pool.end();
    }
}

// Instalar mammoth si no está disponible
try {
    require('mammoth');
    analizarProfesionalesWeb();
} catch (error) {
    console.log('📦 Instalando mammoth para leer archivos Word...');
    console.log('Ejecuta: npm install mammoth');
    console.log('Luego vuelve a ejecutar este script');
}