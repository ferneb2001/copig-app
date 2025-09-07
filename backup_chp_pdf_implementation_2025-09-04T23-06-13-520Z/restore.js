
/**
 * SCRIPT DE RESTAURACIÓN - CHP PDF IMPLEMENTATION
 * =============================================
 */

const fs = require('fs');

function restore() {
    console.log('🔄 Restaurando desde backup backup_chp_pdf_implementation_2025-09-04T23-06-13-520Z...');
    
    // Restaurar archivos
    const archivos = ["server.js","admin-chp.html","portal-profesional.html","admin.html","config.json","maximas.md","CLAUDE.md"];
    archivos.forEach(archivo => {
        if (fs.existsSync('backup_chp_pdf_implementation_2025-09-04T23-06-13-520Z/' + archivo)) {
            fs.copyFileSync('backup_chp_pdf_implementation_2025-09-04T23-06-13-520Z/' + archivo, archivo);
            console.log('✅ Restaurado:', archivo);
        }
    });
    
    console.log('⚠️  IMPORTANTE: Reiniciar servidor después de restauración');
    console.log('⚠️  IMPORTANTE: Restaurar BD manualmente si es necesario');
}

if (require.main === module) {
    restore();
}

module.exports = restore;
