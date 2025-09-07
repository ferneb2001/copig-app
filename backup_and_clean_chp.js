const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);
const fs = require('fs');

async function backupAndCleanCHP() {
  try {
    console.log('🔄 LIMPIEZA COMPLETA DEL SISTEMA CHP...\n');
    
    // 1. BACKUP de solicitudes existentes
    console.log('💾 1. CREANDO BACKUP DE SOLICITUDES EXISTENTES...');
    const backupData = await pool.query('SELECT * FROM copig.solicitudes_chp');
    
    if (backupData.rows.length > 0) {
      const backupFile = `backup_chp_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      fs.writeFileSync(backupFile, JSON.stringify(backupData.rows, null, 2));
      console.log(`✅ Backup creado: ${backupFile} (${backupData.rows.length} solicitudes)`);
    } else {
      console.log('ℹ️ No hay solicitudes para respaldar');
    }
    
    // 2. Eliminar documentos CHP
    console.log('\n🗑️ 2. ELIMINANDO DOCUMENTOS CHP...');
    const docsDeleted = await pool.query('DELETE FROM copig.documentos_chp RETURNING id');
    console.log(`✅ ${docsDeleted.rows.length} documentos eliminados`);
    
    // 3. Eliminar solicitudes CHP
    console.log('\n🗑️ 3. ELIMINANDO TODAS LAS SOLICITUDES CHP...');
    const solicitudesDeleted = await pool.query('DELETE FROM copig.solicitudes_chp RETURNING id');
    console.log(`✅ ${solicitudesDeleted.rows.length} solicitudes eliminadas`);
    
    // 4. Reiniciar secuencia
    console.log('\n🔢 4. REINICIANDO SECUENCIA DE NUMERACIÓN...');
    await pool.query('ALTER SEQUENCE copig.chp_numero_seq RESTART WITH 1001');
    console.log('✅ Secuencia reiniciada a 1001');
    
    // 5. Verificación final
    console.log('\n✅ 5. VERIFICACIÓN FINAL...');
    const finalCount = await pool.query('SELECT COUNT(*) FROM copig.solicitudes_chp');
    const finalSeq = await pool.query('SELECT last_value FROM copig.chp_numero_seq');
    
    console.log(`📊 Solicitudes restantes: ${finalCount.rows[0].count}`);
    console.log(`📊 Secuencia actual: ${finalSeq.rows[0].last_value}`);
    
    if (finalCount.rows[0].count === '0') {
      console.log('\n🎉 SISTEMA CHP COMPLETAMENTE LIMPIO');
      console.log('✅ Listo para empezar desde cero');
    } else {
      console.log('\n❌ Algo salió mal en la limpieza');
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
    pool.end();
  }
}

backupAndCleanCHP();