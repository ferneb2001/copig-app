const https = require('https');
const fs = require('fs');
const path = require('path');

const pdfs = [
    {
        url: 'https://www.copigmza.org.ar/wp-content/uploads/2025/08/agronomia-20250731_compressed.pdf',
        name: 'agronomia_oficial.pdf',
        categoria: 'Agronomía'
    },
    {
        url: 'https://www.copigmza.org.ar/wp-content/uploads/2025/08/civil-20250731_compressed.pdf',
        name: 'civil_oficial.pdf', 
        categoria: 'Ingeniería Civil'
    },
    {
        url: 'https://www.copigmza.org.ar/wp-content/uploads/2025/08/geologia-20250731_compressed.pdf',
        name: 'geologia_oficial.pdf',
        categoria: 'Geología'
    },
    {
        url: 'https://www.copigmza.org.ar/wp-content/uploads/2025/08/especializada-20250731_compressed.pdf',
        name: 'especializada_oficial.pdf',
        categoria: 'Especializada'
    }
];

async function descargarPDF(url, filename) {
    return new Promise((resolve, reject) => {
        console.log(`📥 Descargando: ${filename}...`);
        
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Error HTTP: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                const stats = fs.statSync(filename);
                console.log(`✅ ${filename} descargado (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                resolve();
            });
            
        }).on('error', (err) => {
            fs.unlink(filename, () => {});
            reject(err);
        });
    });
}

async function descargarTodosPDFs() {
    try {
        console.log('🚀 Iniciando descarga de PDFs oficiales del COPIG...');
        
        // Crear carpeta para PDFs si no existe
        const pdfDir = path.join(__dirname, 'pdfs_oficiales');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir);
            console.log('📁 Carpeta pdfs_oficiales creada');
        }
        
        for (const pdf of pdfs) {
            const filepath = path.join(pdfDir, pdf.name);
            try {
                await descargarPDF(pdf.url, filepath);
            } catch (error) {
                console.error(`❌ Error descargando ${pdf.name}:`, error.message);
            }
        }
        
        console.log('\n🎉 Descarga completada. Archivos en: ./pdfs_oficiales/');
        console.log('\n📋 SIGUIENTE PASO: Instalar Tesseract OCR');
        console.log('   npm install tesseract.js');
        console.log('   o usar herramienta online para OCR');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

descargarTodosPDFs();