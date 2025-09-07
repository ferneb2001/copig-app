const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

const pdfs = [
    { file: 'civil_oficial.pdf', categoria: 'Ingeniería Civil' },
    { file: 'especializada_oficial.pdf', categoria: 'Especializada' },
    { file: 'geologia_oficial.pdf', categoria: 'Geología' },
    { file: 'agronomia_oficial.pdf', categoria: 'Agronomía' }
];

async function extraerTextoPDF(pdfPath) {
    try {
        console.log(`🔍 Procesando OCR para: ${path.basename(pdfPath)}`);
        
        // Tesseract.js puede procesar PDFs directamente
        const { data: { text } } = await Tesseract.recognize(
            pdfPath,
            'spa', // Idioma español
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        process.stdout.write(`\r   Progreso OCR: ${Math.round(m.progress * 100)}%`);
                    }
                }
            }
        );
        
        console.log(`\n✅ OCR completado para ${path.basename(pdfPath)}`);
        return text;
        
    } catch (error) {
        console.error(`❌ Error en OCR para ${pdfPath}:`, error.message);
        return null;
    }
}

function parsearDatosProfesionales(texto, categoria) {
    console.log(`📋 Parseando datos de ${categoria}...`);
    
    const profesionales = [];
    const lineas = texto.split('\n');
    
    // Patrones comunes para identificar profesionales
    const patronMatricula = /(\d{3,5})/; // Números de matrícula
    const patronNombre = /([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s,]+)/; // Nombres y apellidos
    
    let profesionalActual = null;
    
    for (const linea of lineas) {
        const lineaLimpia = linea.trim();
        if (lineaLimpia.length < 3) continue;
        
        // Buscar patrones de matrícula y nombre
        const matchMatricula = lineaLimpia.match(patronMatricula);
        const matchNombre = lineaLimpia.match(patronNombre);
        
        if (matchMatricula && matchNombre) {
            profesionalActual = {
                matricula: matchMatricula[1],
                nombre: matchNombre[1].toUpperCase(),
                categoria: categoria,
                linea_original: lineaLimpia
            };
            
            // Buscar título en la misma línea o línea siguiente
            if (lineaLimpia.includes('ING') || lineaLimpia.includes('INGENIERO')) {
                profesionalActual.titulo_probable = extraerTitulo(lineaLimpia);
            }
            
            profesionales.push(profesionalActual);
        }
    }
    
    console.log(`   Encontrados ${profesionales.length} profesionales en ${categoria}`);
    return profesionales;
}

function extraerTitulo(texto) {
    const titulos = [
        'INGENIERO CIVIL',
        'INGENIERO EN CONSTRUCCIONES', 
        'INGENIERO HIDRAULICO',
        'INGENIERO MECANICO',
        'INGENIERO INDUSTRIAL',
        'INGENIERO ELECTRICISTA',
        'INGENIERO AGRONOMO',
        'GEOLOGO',
        'LICENCIADO'
    ];
    
    const textoUpper = texto.toUpperCase();
    for (const titulo of titulos) {
        if (textoUpper.includes(titulo)) {
            return titulo;
        }
    }
    return null;
}

async function compararConBaseDatos(profesionalesOficiales) {
    console.log('\n🔍 Comparando con base de datos...');
    
    const diferencias = [];
    
    for (const profOficial of profesionalesOficiales) {
        try {
            // Buscar en BD por matrícula
            const resultado = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_bd
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [parseInt(profOficial.matricula)]);
            
            if (resultado.rows.length > 0) {
                const profBD = resultado.rows[0];
                
                // Comparar títulos
                if (profOficial.titulo_probable && 
                    profBD.titulo_bd !== profOficial.titulo_probable) {
                    diferencias.push({
                        matricula: profOficial.matricula,
                        nombre: profBD.nombre,
                        titulo_bd: profBD.titulo_bd,
                        titulo_oficial: profOficial.titulo_probable,
                        categoria: profOficial.categoria
                    });
                }
            }
        } catch (error) {
            console.error(`Error comparando matrícula ${profOficial.matricula}:`, error.message);
        }
    }
    
    return diferencias;
}

async function procesarTodosPDFs() {
    try {
        console.log('🚀 Iniciando análisis OCR de PDFs oficiales del COPIG...');
        console.log('⏱️  Este proceso puede tomar varios minutos...\n');
        
        const todosProfesionales = [];
        
        for (const pdf of pdfs) {
            const pdfPath = path.join(__dirname, 'pdfs_oficiales', pdf.file);
            
            if (!fs.existsSync(pdfPath)) {
                console.log(`❌ Archivo no encontrado: ${pdfPath}`);
                continue;
            }
            
            // Extraer texto con OCR
            const texto = await extraerTextoPDF(pdfPath);
            if (!texto) continue;
            
            // Parsear datos profesionales
            const profesionales = parsearDatosProfesionales(texto, pdf.categoria);
            todosProfesionales.push(...profesionales);
            
            // Guardar texto extraído para debug
            const textoPath = pdfPath.replace('.pdf', '_extraido.txt');
            fs.writeFileSync(textoPath, texto, 'utf8');
            console.log(`📄 Texto guardado en: ${path.basename(textoPath)}`);
        }
        
        console.log(`\n📊 Total profesionales encontrados: ${todosProfesionales.length}`);
        
        // Buscar específicamente a Acosta Sergio Daniel
        const acosta = todosProfesionales.find(p => 
            p.nombre.includes('ACOSTA') && p.nombre.includes('SERGIO')
        );
        
        if (acosta) {
            console.log('\n🎯 ENCONTRADO ACOSTA SERGIO DANIEL:');
            console.log(`   Matrícula: ${acosta.matricula}`);
            console.log(`   Nombre: ${acosta.nombre}`);
            console.log(`   Título: ${acosta.titulo_probable}`);
            console.log(`   Categoría: ${acosta.categoria}`);
        } else {
            console.log('\n❌ No se encontró Acosta Sergio Daniel en los PDFs');
        }
        
        // Comparar con base de datos
        const diferencias = await compararConBaseDatos(todosProfesionales);
        
        console.log(`\n📋 Diferencias encontradas: ${diferencias.length}`);
        if (diferencias.length > 0) {
            console.log('\nPrimeras 10 diferencias:');
            diferencias.slice(0, 10).forEach(diff => {
                console.log(`   Mat. ${diff.matricula}: BD="${diff.titulo_bd}" vs Oficial="${diff.titulo_oficial}"`);
            });
        }
        
        // Guardar reporte
        const reporte = {
            fecha_analisis: new Date().toISOString(),
            profesionales_oficiales: todosProfesionales.length,
            diferencias_encontradas: diferencias.length,
            acosta_encontrado: !!acosta,
            acosta_datos: acosta,
            diferencias: diferencias
        };
        
        fs.writeFileSync('reporte_comparacion_pdfs.json', JSON.stringify(reporte, null, 2));
        console.log('\n📊 Reporte guardado en: reporte_comparacion_pdfs.json');
        
        await pool.end();
        console.log('\n🎉 Análisis completado!');
        
    } catch (error) {
        console.error('❌ Error general:', error);
        await pool.end();
    }
}

procesarTodosPDFs();