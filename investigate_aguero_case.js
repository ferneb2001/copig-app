const DBF = require('node-dbf').default;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function investigateAgueroCase() {
    console.log('🔍 INVESTIGANDO CASO AGÜERO, JORGE EDGAR...\n');
    
    try {
        // 1. Verificar en sistema actual
        console.log('1. 📊 Estado en sistema actual:');
        const currentData = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.numero_documento,
                p.provincia,
                m.numero_matricula,
                calcular_estado_profesional(m.numero_matricula::TEXT) as estado_calculado,
                MAX(ph.fecha_pago) as ultimo_pago_real
            FROM copig.profesionales p
            LEFT JOIN copig.matriculas m ON p.id = m.profesional_id  
            LEFT JOIN copig.pagos_historicos ph ON m.numero_matricula::TEXT = ph.matricula
            WHERE p.nombre LIKE '%AGÜERO, JORGE EDGAR%'
            GROUP BY p.id, p.nombre, p.numero_documento, p.provincia, m.numero_matricula
        `);
        
        if (currentData.rows.length > 0) {
            const aguero = currentData.rows[0];
            console.log(`   Nombre: ${aguero.nombre}`);
            console.log(`   ID: ${aguero.id}`);
            console.log(`   DNI: ${aguero.numero_documento || 'NULL'}`);
            console.log(`   Provincia: ${aguero.provincia}`);
            console.log(`   Matrícula: ${aguero.numero_matricula}`);
            console.log(`   Estado calculado: ${aguero.estado_calculado}`);
            console.log(`   Último pago real: ${aguero.ultimo_pago_real}`);
        }

        // 2. Buscar en SPPROF.DBF (profesionales COPIG)
        console.log('\n2. 🔍 Buscando en SPPROF.DBF (COPIG Mendoza):');
        try {
            const spprof = DBF.open('C:/copig-app/adminsp/COPIG/SPPROF.DBF');
            let foundInSPPROF = false;
            
            for (let record of spprof) {
                if (record && record.NOMBRE && 
                    record.NOMBRE.includes('AGÜERO') && 
                    record.NOMBRE.includes('JORGE') && 
                    record.NOMBRE.includes('EDGAR')) {
                    console.log(`   ✅ ENCONTRADO en SPPROF:`);
                    console.log(`   Nombre: ${record.NOMBRE}`);
                    console.log(`   DNI: ${record.DOCUMENTO}`);
                    console.log(`   Provincia: ${record.PROVINCIA}`);
                    foundInSPPROF = true;
                    break;
                }
            }
            
            if (!foundInSPPROF) {
                console.log('   ❌ NO encontrado en SPPROF.DBF');
            }
        } catch (error) {
            console.log(`   ❌ Error leyendo SPPROF: ${error.message}`);
        }

        // 3. Buscar en SVPROF.DBF (profesionales externos)
        console.log('\n3. 🔍 Buscando en SVPROF.DBF (Externos/Buenos Aires):');
        try {
            const svprof = DBF.open('C:/copig-app/adminsp/COPIG/SVPROF.DBF');
            let foundInSVPROF = false;
            
            for (let record of svprof) {
                if (record && record.NOMBRE && 
                    record.NOMBRE.includes('AGÜERO') && 
                    record.NOMBRE.includes('JORGE') && 
                    record.NOMBRE.includes('EDGAR')) {
                    console.log(`   ✅ ENCONTRADO en SVPROF:`);
                    console.log(`   Nombre: ${record.NOMBRE}`);
                    console.log(`   DNI: ${record.DOCUMENTO || record.DNI || 'No disponible'}`);
                    console.log(`   Provincia: ${record.PROVINCIA || 'No disponible'}`);
                    console.log(`   Domicilio: ${record.DOMICILIO || 'No disponible'}`);
                    foundInSVPROF = true;
                    break;
                }
            }
            
            if (!foundInSVPROF) {
                console.log('   ❌ NO encontrado en SVPROF.DBF');
            }
        } catch (error) {
            console.log(`   ❌ Error leyendo SVPROF: ${error.message}`);
        }

        // 4. Verificar matrículas en SVMATRI.DBF
        console.log('\n4. 🔍 Verificando matrícula 10016 en SVMATRI.DBF:');
        try {
            const svmatri = DBF.open('C:/copig-app/adminsp/COPIG/SVMATRI.DBF');
            let foundMatricula = false;
            
            for (let record of svmatri) {
                if (record && (record.NUMERO == 10016 || record.MATRICULA == 10016)) {
                    console.log(`   ✅ MATRÍCULA ENCONTRADA en SVMATRI:`);
                    console.log(`   Número: ${record.NUMERO || record.MATRICULA}`);
                    console.log(`   Profesional: ${record.PROFESIONAL || 'No disponible'}`);
                    console.log(`   Fecha: ${record.FECHA || record.FECHA_INSCRIPCION || 'No disponible'}`);
                    foundMatricula = true;
                    break;
                }
            }
            
            if (!foundMatricula) {
                console.log('   ❌ Matrícula 10016 NO encontrada en SVMATRI');
            }
        } catch (error) {
            console.log(`   ❌ Error leyendo SVMATRI: ${error.message}`);
        }

        console.log('\n🎯 CONCLUSIÓN:');
        console.log('Si AGÜERO está en SVPROF.DBF, es un profesional EXTERNO (Buenos Aires)');
        console.log('que fue importado por error al sistema COPIG (Mendoza).');
        console.log('Esto explica la inconsistencia geográfica.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

investigateAgueroCase();