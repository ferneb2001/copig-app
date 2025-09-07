const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

async function corregirTituloAcosta() {
    try {
        console.log('🔧 Corrigiendo título de Acosta Sergio Daniel...');
        
        // Primero mostrar el estado actual
        const actual = await pool.query(`
            SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_actual
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE p.id = 7544
        `);
        
        console.log('Estado actual:');
        console.log(actual.rows[0]);
        
        // Verificar que el título "INGENIERO EN CONSTRUCCIONES" existe
        const tituloConstructor = await pool.query(`
            SELECT id, descripcion 
            FROM copig.titulos 
            WHERE descripcion = 'INGENIERO EN CONSTRUCCIONES'
        `);
        
        if (tituloConstructor.rows.length === 0) {
            console.log('❌ No se encontró el título "INGENIERO EN CONSTRUCCIONES"');
            
            // Mostrar títulos similares
            const similares = await pool.query(`
                SELECT id, descripcion 
                FROM copig.titulos 
                WHERE descripcion ILIKE '%CONSTRUCCION%'
                ORDER BY descripcion
            `);
            
            console.log('Títulos similares disponibles:');
            similares.rows.forEach(t => {
                console.log(`  ID ${t.id}: ${t.descripcion}`);
            });
            
            await pool.end();
            return;
        }
        
        console.log(`✅ Título destino encontrado: ID ${tituloConstructor.rows[0].id}`);
        
        // Realizar la corrección
        const resultado = await pool.query(`
            UPDATE copig.matriculas 
            SET titulo_id = $1 
            WHERE profesional_id = 7544
        `, [tituloConstructor.rows[0].id]);
        
        console.log(`✅ Actualización completada: ${resultado.rowCount} registro(s) modificado(s)`);
        
        // Verificar el resultado
        const verificacion = await pool.query(`
            SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_nuevo
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
            LEFT JOIN copig.titulos t ON m.titulo_id = t.id
            WHERE p.id = 7544
        `);
        
        console.log('Estado después de la corrección:');
        console.log(verificacion.rows[0]);
        
        await pool.end();
        console.log('🎉 Corrección completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

corregirTituloAcosta();