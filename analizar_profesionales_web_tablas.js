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

function extraerDatosDeTabla(html) {
    const profesionales = [];
    
    // Buscar patrones de tabla HTML
    const filas = html.match(/<tr[^>]*>(.*?)<\/tr>/gs);
    
    if (!filas) {
        // Si no hay HTML, intentar parsear como texto estructurado
        return extraerDatosDeTexto(html);
    }
    
    let filasProcesadas = 0;
    for (const fila of filas) {
        // Extraer celdas de la fila
        const celdas = fila.match(/<td[^>]*>(.*?)<\/td>/gs);
        
        if (celdas && celdas.length >= 5) {
            // Limpiar contenido HTML de las celdas
            const datosCelda = celdas.map(celda => 
                celda.replace(/<[^>]*>/g, '').trim()
            );
            
            const [ord, matricula, ct, nombreCompleto, titulo] = datosCelda;
            
            // Validar que la matrícula sea número
            const matriculaNum = parseInt(matricula);
            if (matriculaNum > 0 && nombreCompleto && titulo) {
                profesionales.push({
                    ord: parseInt(ord) || filasProcesadas,
                    matricula: matriculaNum,
                    nombre: nombreCompleto.trim(),
                    titulo: titulo.trim(),
                    estado: ct || 'A',
                    filaOriginal: fila
                });
                filasProcesadas++;
            }
        }
    }
    
    return profesionales;
}

function extraerDatosDeTexto(texto) {
    const profesionales = [];
    
    // Buscar patrones de datos profesionales
    // Patrón: números seguidos de texto que incluya apellidos, nombres y títulos
    const lineas = texto.split(/\\n|\\r/).filter(l => l.trim().length > 10);
    
    for (const linea of lineas) {
        // Buscar patrón: numero matrícula letra apellido(s), nombre(s) título
        const match = linea.match(/(\\d+)\\s+(\\d{4,5})\\s+([AI])\\s+(.+?)\\s+(INGENIERO|LICENCIADO|GEOLOGO|DOCTOR|TECNICO.+)/i);
        
        if (match) {
            const [, ord, matricula, estado, nombreParte, tituloParte] = match;
            
            // El título puede continuar hasta el final
            const titulo = linea.substring(linea.indexOf(tituloParte)).trim();
            
            profesionales.push({
                ord: parseInt(ord),
                matricula: parseInt(matricula),
                nombre: nombreParte.trim(),
                titulo: titulo,
                estado: estado,
                filaOriginal: linea
            });
        }
    }
    
    return profesionales;
}

async function analizarProfesionalesWebTablas() {
    try {
        console.log('🔍 ANALIZANDO TABLAS DE PROFESIONALES DE LA WEB OFICIAL DEL COPIG');
        console.log('='.repeat(70));
        
        const todosProfesionales = [];
        let totalArchivos = 0;
        let totalProfesionales = 0;
        
        for (const {archivo, categoria} of archivosWord) {
            console.log(`\\n📂 PROCESANDO: ${categoria}`);
            console.log(`   Archivo: ${archivo}`);
            
            try {
                // Leer archivo Word como HTML para preservar estructura de tabla
                const buffer = fs.readFileSync(archivo);
                const result = await mammoth.convertToHtml({buffer});
                const htmlContent = result.value;
                
                console.log(`   📄 Contenido HTML extraído: ${htmlContent.length} caracteres`);
                
                // También extraer texto plano como backup
                const textResult = await mammoth.extractRawText({buffer});
                const textContent = textResult.value;
                
                // Intentar extraer datos de la tabla
                let profesionalesCategoria = extraerDatosDeTabla(htmlContent);
                
                // Si no funciona con HTML, intentar con texto
                if (profesionalesCategoria.length === 0) {
                    console.log('   ⚠️  Intentando parsear como texto...');
                    profesionalesCategoria = extraerDatosDeTexto(textContent);
                }
                
                // Si aún no funciona, mostrar contenido para debug
                if (profesionalesCategoria.length === 0) {
                    console.log('   📄 DEBUG - Primeros 300 caracteres del HTML:');
                    console.log(`   "${htmlContent.substring(0, 300)}..."`);
                    console.log('   📄 DEBUG - Primeros 300 caracteres del texto:');
                    console.log(`   "${textContent.substring(0, 300)}..."`);
                }
                
                // Agregar categoría a cada profesional
                profesionalesCategoria.forEach(prof => {
                    prof.categoria = categoria;
                    todosProfesionales.push(prof);
                });
                
                console.log(`   ✅ ${profesionalesCategoria.length} profesionales extraídos`);
                
                // Mostrar primeros 3 ejemplos
                profesionalesCategoria.slice(0, 3).forEach(prof => {
                    console.log(`      Mat. ${prof.matricula}: ${prof.nombre} - ${prof.titulo} (${prof.estado})`);
                });
                
                totalProfesionales += profesionalesCategoria.length;
                totalArchivos++;
                
            } catch (error) {
                console.log(`   ❌ Error procesando ${categoria}: ${error.message}`);
            }
        }
        
        console.log('\\n' + '='.repeat(70));
        console.log('📊 RESUMEN TOTAL:');
        console.log(`📂 Archivos procesados: ${totalArchivos}/4`);
        console.log(`👥 Total profesionales extraídos: ${totalProfesionales}`);
        
        if (totalProfesionales > 0) {
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
                console.log(`   ${categoria}: ${stats.total} total, ${stats.activos} activos, ${stats.titulos.size} títulos únicos`);
            });
            
            // Títulos únicos
            const todosLosTitulos = new Set();
            todosProfesionales.forEach(prof => todosLosTitulos.add(prof.titulo));
            
            console.log(`\\n📋 TÍTULOS ÚNICOS ENCONTRADOS: ${todosLosTitulos.size}`);
            Array.from(todosLosTitulos).sort().slice(0, 15).forEach((titulo, index) => {
                console.log(`   ${index + 1}. ${titulo}`);
            });
            
            // Guardar datos
            const datosExtraidos = {
                fecha_extraccion: new Date().toISOString(),
                total_profesionales: totalProfesionales,
                profesionales: todosProfesionales,
                estadisticas_categoria: estadisticasPorCategoria,
                titulos_unicos: Array.from(todosLosTitulos).sort()
            };
            
            fs.writeFileSync(
                'C:\\copig-app\\profesionales_web_extraidos_tablas.json',
                JSON.stringify(datosExtraidos, null, 2)
            );
            
            console.log('\\n💾 Datos guardados en: profesionales_web_extraidos_tablas.json');
            console.log('\\n🎯 ¡DATOS OFICIALES EXTRAÍDOS! Listos para corrección masiva');
            
        } else {
            console.log('\\n⚠️  No se pudieron extraer datos. Los archivos pueden tener formato diferente al esperado.');
            console.log('💡 Considera convertir los archivos Word a texto plano o CSV');
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error general:', error);
        await pool.end();
    }
}

analizarProfesionalesWebTablas();