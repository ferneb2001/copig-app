
/**
 * SCRIPT DE RESTAURACIÓN - BACKUP 2025-09-04T22-26-18-066Z
 * USO: node restaurar_backup_2025-09-04T22-26-18-066Z.js
 */

const fs = require('fs');
const { Client } = require('pg');
const config = require('../config.json');

async function restaurarBackup() {
    console.log('🔄 RESTAURANDO BACKUP 2025-09-04T22-26-18-066Z...');
    
    // RESTAURAR ARCHIVOS
    const archivos = ["server.js","admin.html","portal-profesional.html","admin-chp.html","admin-chp-nuevo.html","solicitudes-chp-mejorado.html","config.json","package.json","CLAUDE.md","maximas.md"];
    for (const archivo of archivos) {
        if (fs.existsSync(`${__dirname}/${archivo}`)) {
            fs.copyFileSync(`${__dirname}/${archivo}`, `../${archivo}`);
            console.log(`✅ ${archivo} restaurado`);
        }
    }
    
    console.log('✅ BACKUP RESTAURADO EXITOSAMENTE');
    console.log('🚀 Ejecutar: node server.js');
}

if (require.main === module) {
    restaurarBackup();
}
