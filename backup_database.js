/**
 * BACKUP DE DATOS CRÍTICOS DE LA BASE DE DATOS
 * Antes de hacer cambios peligrosos
 */

const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function backupDatabase() {
    const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = `backup_copig_${fecha}.json`;
    
    console.log('🔒 INICIANDO BACKUP DE BASE DE DATOS');
    console.log(`📁 Archivo: ${backupFile}`);
    console.log('─'.repeat(60));
    
    try {
        const backup = {};
        
        // Backup de empresas
        console.log('📊 Respaldando empresas...');
        const empresas = await pool.query('SELECT * FROM copig.empresas');
        backup.empresas = empresas.rows;
        console.log(`  ✅ ${empresas.rows.length} empresas respaldadas`);
        
        // Backup de profesionales
        console.log('📊 Respaldando profesionales...');
        const profesionales = await pool.query('SELECT * FROM copig.profesionales');
        backup.profesionales = profesionales.rows;
        console.log(`  ✅ ${profesionales.rows.length} profesionales respaldados`);
        
        // Backup de matrículas
        console.log('📊 Respaldando matrículas...');
        const matriculas = await pool.query('SELECT * FROM copig.matriculas');
        backup.matriculas = matriculas.rows;
        console.log(`  ✅ ${matriculas.rows.length} matrículas respaldadas`);
        
        // Backup de representantes técnicos (aunque esté vacío)
        console.log('📊 Respaldando representantes técnicos...');
        const representantes = await pool.query('SELECT * FROM copig.representantes_tecnicos');
        backup.representantes_tecnicos = representantes.rows;
        console.log(`  ✅ ${representantes.rows.length} representantes técnicos respaldados`);
        
        // Backup de users (en lugar de staff)
        console.log('📊 Respaldando usuarios...');
        try {
            const users = await pool.query('SELECT * FROM copig.users');
            backup.users = users.rows;
            console.log(`  ✅ ${users.rows.length} usuarios respaldados`);
        } catch (e) {
            console.log('  ⚠️  Tabla users no encontrada');
        }
        
        // Guardar backup
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
        
        console.log('─'.repeat(60));
        console.log(`✅ BACKUP COMPLETADO: ${backupFile}`);
        console.log(`📊 Tamaño: ${(fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)} MB`);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error en backup:', error.message);
        await pool.end();
    }
}

backupDatabase();