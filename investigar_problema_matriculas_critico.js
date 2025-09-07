const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigarProblemaMatriculas() {
    try {
        console.log('🚨 INVESTIGACIÓN CRÍTICA - PROFESIONALES SIN MATRÍCULA\n');
        
        // 1. Verificar integridad tabla matriculas
        console.log('=== INTEGRIDAD TABLA MATRICULAS ===');
        const statsMatriculas = await pool.query(`
            SELECT 
                COUNT(*) as total_matriculas,
                COUNT(CASE WHEN numero_matricula IS NOT NULL THEN 1 END) as con_numero,
                COUNT(CASE WHEN profesional_id IS NOT NULL THEN 1 END) as con_profesional_id
            FROM copig.matriculas
        `);
        
        const stats = statsMatriculas.rows[0];
        console.log(`Total matrículas: ${stats.total_matriculas}`);
        console.log(`Con numero_matricula: ${stats.con_numero}`);
        console.log(`Con profesional_id: ${stats.con_profesional_id}`);
        
        // 2. Verificar relación profesionales-matriculas
        console.log('\n=== RELACIÓN PROFESIONALES-MATRICULAS ===');
        const relacionStats = await pool.query(`
            SELECT 
                COUNT(p.id) as total_profesionales,
                COUNT(m.id) as profesionales_con_matricula,
                COUNT(p.id) - COUNT(m.id) as profesionales_sin_matricula
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
        `);
        
        const rel = relacionStats.rows[0];
        console.log(`Total profesionales: ${rel.total_profesionales}`);
        console.log(`Profesionales CON matrícula: ${rel.profesionales_con_matricula}`);
        console.log(`Profesionales SIN matrícula: ${rel.profesionales_sin_matricula}`);
        
        // 3. Verificar ABAD, RAMIRO específicamente
        console.log('\n=== VERIFICACIÓN ABAD, RAMIRO ===');
        const abad = await pool.query(`
            SELECT 
                p.id as profesional_id,
                p.nombre,
                p.numero_documento,
                m.id as matricula_id,
                m.numero_matricula,
                m.profesional_id as matricula_profesional_id
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            WHERE p.numero_documento = 28511894
        `);
        
        if (abad.rows.length > 0) {
            const a = abad.rows[0];
            console.log(`Profesional ID: ${a.profesional_id}`);
            console.log(`Nombre: ${a.nombre}`);
            console.log(`DNI: ${a.numero_documento}`);
            console.log(`Matrícula ID: ${a.matricula_id || 'NULL'}`);
            console.log(`Número matrícula: ${a.numero_matricula || 'NULL'}`);
            console.log(`Matricula.profesional_id: ${a.matricula_profesional_id || 'NULL'}`);
        }
        
        // 4. Verificar otros profesionales ejemplo
        console.log('\n=== OTROS PROFESIONALES EJEMPLO ===');
        const otros = await pool.query(`
            SELECT 
                p.nombre,
                p.numero_documento,
                m.numero_matricula,
                CASE WHEN m.numero_matricula IS NULL THEN 'SIN MATRICULA' ELSE 'CON MATRICULA' END as estado
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id
            ORDER BY p.nombre
            LIMIT 10
        `);
        
        otros.rows.forEach(prof => {
            console.log(`${prof.nombre} (DNI: ${prof.numero_documento}) - ${prof.estado} - Mat: ${prof.numero_matricula || 'NULL'}`);
        });
        
        // 5. Verificar endpoint específico que usa el frontend
        console.log('\n=== VERIFICAR VISTA vista_profesionales_estados ===');
        const vistaStats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(numero_matricula) as con_matricula_vista,
                COUNT(*) - COUNT(numero_matricula) as sin_matricula_vista
            FROM copig.vista_profesionales_estados
        `);
        
        const vista = vistaStats.rows[0];
        console.log(`Total en vista: ${vista.total}`);
        console.log(`Con matrícula en vista: ${vista.con_matricula_vista}`);
        console.log(`Sin matrícula en vista: ${vista.sin_matricula_vista}`);
        
        // 6. Verificar ABAD, RAMIRO en la vista
        console.log('\n=== ABAD, RAMIRO EN VISTA ===');
        const abadVista = await pool.query(`
            SELECT id, nombre, numero_documento, numero_matricula, estado_visual
            FROM copig.vista_profesionales_estados
            WHERE numero_documento = 28511894
        `);
        
        if (abadVista.rows.length > 0) {
            const av = abadVista.rows[0];
            console.log(`Vista - ID: ${av.id}, Nombre: ${av.nombre}`);
            console.log(`Vista - DNI: ${av.numero_documento}`);
            console.log(`Vista - Matrícula: ${av.numero_matricula || 'NULL'}`);
            console.log(`Vista - Estado: ${av.estado_visual}`);
        } else {
            console.log('❌ ABAD, RAMIRO NO ENCONTRADO EN VISTA');
        }
        
        // 7. Verificar si la vista está desactualizada
        console.log('\n=== ACTUALIZAR VISTA ===');
        console.log('Intentando refrescar vista...');
        
        try {
            await pool.query('REFRESH MATERIALIZED VIEW IF EXISTS copig.vista_profesionales_estados');
            console.log('✅ Vista materializada refrescada');
        } catch (err) {
            console.log(`⚠️ Error refrescando vista: ${err.message}`);
        }
        
        // 8. Verificar datos en archivos DBF
        console.log('\n=== DATOS EN ARCHIVOS DBF ORIGINALES ===');
        const foxproData = await pool.query(`
            SELECT 
                profesional_dcnro,
                profesional_nombre,
                matricula_numero,
                matricula_categoria
            FROM copig.foxpro_matricula_profesional_map
            WHERE profesional_dcnro IN ('28511894', '17086342', '29057309')
        `);
        
        console.log('Datos originales FoxPro:');
        foxproData.rows.forEach(fp => {
            console.log(`${fp.profesional_nombre} (DNI: ${fp.profesional_dcnro}) - Mat: ${fp.matricula_numero}`);
        });
        
    } catch (error) {
        console.error('❌ Error investigación:', error);
    } finally {
        await pool.end();
    }
}

investigarProblemaMatriculas().catch(console.error);