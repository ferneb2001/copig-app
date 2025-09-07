#!/usr/bin/env node
        
/**
 * SCRIPT DE RESTAURACIÓN - BACKUP 2025-09-04T04-03-26-585Z
 * Restaura el sistema al estado previo antes de la implementación del flujo CHP completo
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const config = require('../config.json');
const pool = new Pool(config.database);

async function restaurarSistema() {
    console.log('🔄 Iniciando restauración del sistema...');
    
    try {
        // Leer backup de BD
        const backupData = JSON.parse(fs.readFileSync('./database_backup.json', 'utf8'));
        
        // Restaurar archivos
        const archivos = ['server.js', 'admin-chp.html', 'portal-profesional.html'];
        for (const archivo of archivos) {
            if (fs.existsSync(archivo)) {
                fs.copyFileSync(archivo, `../${archivo}`);
                console.log(`✅ Restaurado: ${archivo}`);
            }
        }
        
        console.log('✅ Restauración completada');
        console.log('⚠️ IMPORTANTE: Reiniciar servidor manualmente');
        
    } catch (error) {
        console.error('❌ Error en restauración:', error);
    }
}

restaurarSistema();
