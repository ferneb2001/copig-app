#!/usr/bin/env node

/**
 * SCRIPT DE RESTAURACIÓN BACKUP ARCA
 * Generado automáticamente el: 4/9/2025, 01:22:53
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const pool = new Pool(config.database);

async function restaurarBackup() {
    try {
        console.log('🔄 RESTAURANDO BACKUP ANTES DE UPGRADE ARCA...');
        
        // Restaurar base de datos
        const backupBD = JSON.parse(fs.readFileSync('database_backup.json', 'utf8'));
        
        for (const [tabla, datos] of Object.entries(backupBD)) {
            if (datos.length > 0) {
                await pool.query(`DELETE FROM copig.${tabla}`);
                
                const columnas = Object.keys(datos[0]);
                const placeholders = datos.map((_, i) => 
                    '(' + columnas.map((_, j) => `$${i * columnas.length + j + 1}`).join(',') + ')'
                ).join(',');
                
                const valores = datos.flatMap(row => columnas.map(col => row[col]));
                
                await pool.query(
                    `INSERT INTO copig.${tabla} (${columnas.join(',')}) VALUES ${placeholders}`,
                    valores
                );
                
                console.log(`✅ ${tabla}: ${datos.length} registros restaurados`);
            }
        }
        
        // Restaurar archivos
        const backupArchivos = JSON.parse(fs.readFileSync('files_backup.json', 'utf8'));
        
        for (const [archivo, contenido] of Object.entries(backupArchivos)) {
            fs.writeFileSync(path.join('..', archivo), contenido);
            console.log(`✅ ${archivo} restaurado`);
        }
        
        console.log('🎉 RESTAURACIÓN COMPLETADA');
        
    } catch (error) {
        console.error('❌ Error en restauración:', error);
    }
}

if (require.main === module) {
    restaurarBackup();
}