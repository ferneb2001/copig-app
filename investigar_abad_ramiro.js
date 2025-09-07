const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'Jm2024**',
    port: 5432,
});

async function investigarAbadRamiro() {
    try {
        console.log('🔍 INVESTIGANDO PROFESIONAL ABAD, RAMIRO (DNI: 28511894)');
        
        // 1. Datos básicos del profesional
        console.log('\n=== DATOS BÁSICOS ===');
        const profesional = await pool.query(
            'SELECT * FROM copig.profesionales WHERE numero_documento = $1',
            ['28511894']
        );
        console.log('Profesional encontrado:', profesional.rows[0]);
        
        if (profesional.rows.length === 0) {
            console.log('❌ PROFESIONAL NO ENCONTRADO');
            return;
        }
        
        const profesionalId = profesional.rows[0].id;
        
        // 2. Verificar matrícula
        console.log('\n=== MATRÍCULAS ===');
        const matriculas = await pool.query(
            'SELECT * FROM copig.matriculas WHERE profesional_id = $1',
            [profesionalId]
        );
        console.log('Matrículas encontradas:', matriculas.rows.length);
        matriculas.rows.forEach(m => console.log(m));
        
        // 3. Verificar pagos históricos
        console.log('\n=== PAGOS HISTÓRICOS ===');
        const pagosDocumento = await pool.query(
            'SELECT * FROM copig.pagos_historicos WHERE matricula = $1 ORDER BY fecha_pago DESC LIMIT 10',
            ['28511894']
        );
        console.log('Pagos por DNI:', pagosDocumento.rows.length);
        pagosDocumento.rows.forEach(p => console.log(`${p.fecha_pago} - $${p.importe} - ${p.concepto}`));
        
        // Si tiene matrícula, buscar también por matrícula
        if (matriculas.rows.length > 0) {
            const numeroMatricula = matriculas.rows[0].numero_matricula;
            const pagosMatricula = await pool.query(
                'SELECT * FROM copig.pagos_historicos WHERE matricula = $1 ORDER BY fecha_pago DESC LIMIT 10',
                [numeroMatricula.toString()]
            );
            console.log(`\nPagos por matrícula ${numeroMatricula}:`, pagosMatricula.rows.length);
            pagosMatricula.rows.forEach(p => console.log(`${p.fecha_pago} - $${p.importe} - ${p.concepto}`));
        }
        
        // 4. Verificar fecha de inscripción vs matrícula
        console.log('\n=== ANÁLISIS DE FECHAS ===');
        console.log('Fecha inscripción profesional:', profesional.rows[0].fecha_inscripcion);
        if (matriculas.rows.length > 0) {
            console.log('Fecha habilitación matrícula:', matriculas.rows[0].fecha_habilitacion);
        }
        
        // 5. Verificar vista que usa el admin
        console.log('\n=== VISTA PROFESIONALES_ESTADOS ===');
        const vista = await pool.query(
            'SELECT * FROM copig.vista_profesionales_estados WHERE numero_documento = $1',
            ['28511894']
        );
        if (vista.rows.length > 0) {
            console.log('Datos en vista:', vista.rows[0]);
        } else {
            console.log('❌ NO ENCONTRADO EN VISTA');
        }
        
        // 6. Buscar en todas las tablas de pagos
        console.log('\n=== BÚSQUEDA EXHAUSTIVA PAGOS ===');
        const todasTablasPago = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'copig' 
            AND table_name LIKE '%pago%'
            ORDER BY table_name
        `);
        
        for (const tabla of todasTablasPago.rows) {
            const nombreTabla = tabla.table_name;
            try {
                const resultado = await pool.query(`
                    SELECT COUNT(*) as total 
                    FROM copig.${nombreTabla} 
                    WHERE matricula::text = '28511894' OR matricula::text = $1
                `, [matriculas.rows.length > 0 ? matriculas.rows[0].numero_matricula.toString() : '0']);
                
                if (resultado.rows[0].total > 0) {
                    console.log(`📊 Tabla ${nombreTabla}: ${resultado.rows[0].total} registros`);
                }
            } catch (err) {
                // Tabla puede no tener columna matricula
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

investigarAbadRamiro();