const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

console.log('='.repeat(80));
console.log(' RESTAURACIÓN DE REPRESENTANTES TÉCNICOS DESDE BACKUP');
console.log('='.repeat(80));
console.log('\nTimestamp del backup: 20250903_225414\n');

(async () => {
    try {
        // Primero verificar que existe la tabla de backup
        const checkBackup = await pool.query(`
            SELECT COUNT(*) as total 
            FROM copig.representantes_tecnicos_backup_20250903_225414
        `);
        
        console.log(`✅ Tabla de backup encontrada con ${checkBackup.rows[0].total} registros\n`);
        
        // Restaurar desde backup
        console.log('Restaurando representantes técnicos...\n');
        
        await pool.query('DROP TABLE IF EXISTS copig.representantes_tecnicos');
        
        await pool.query(`
            CREATE TABLE copig.representantes_tecnicos AS 
            SELECT * FROM copig.representantes_tecnicos_backup_20250903_225414
        `);
        
        // Verificar restauración
        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT empresa_id) as empresas_con_rt,
                COUNT(*) as total_rt,
                COUNT(DISTINCT profesional_id) as rt_unicos
            FROM copig.representantes_tecnicos
        `);
        
        console.log('='.repeat(80));
        console.log(' RESTAURACIÓN COMPLETADA EXITOSAMENTE');
        console.log('='.repeat(80));
        console.log('\n📊 ESTADO RESTAURADO:');
        console.log(`  • Empresas con RT: ${stats.rows[0].empresas_con_rt}`);
        console.log(`  • Total asignaciones: ${stats.rows[0].total_rt}`);
        console.log(`  • RT únicos: ${stats.rows[0].rt_unicos}\n`);
        
        // Verificar empresas importantes
        console.log('🏢 VERIFICACIÓN DE EMPRESAS IMPORTANTES:');
        const importantes = ['IMPSA', 'YPF', 'TECHINT', 'CAMILETTI', 'PAMAR'];
        
        for (const nombre of importantes) {
            const result = await pool.query(`
                SELECT e.razon_social, COUNT(rt.id) as num_rt
                FROM copig.empresas e
                LEFT JOIN copig.representantes_tecnicos rt ON e.id = rt.empresa_id
                WHERE UPPER(e.razon_social) LIKE $1
                GROUP BY e.razon_social
                ORDER BY num_rt DESC
                LIMIT 1
            `, [`%${nombre}%`]);
            
            if (result.rows.length > 0 && result.rows[0].num_rt > 0) {
                console.log(`  ✅ ${result.rows[0].razon_social.substring(0, 45)}: ${result.rows[0].num_rt} RTs`);
            }
        }
        
        console.log('\n✅ Los representantes técnicos han sido restaurados correctamente');
        console.log('✅ Las empresas tienen sus RT asignados nuevamente');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error durante la restauración:', error);
        await pool.end();
    }
})();