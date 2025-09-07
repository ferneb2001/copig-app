/**
 * ANÁLISIS COMPLETO DE SPRTCOS.DBF
 * Para entender por qué solo se importaron 124 representantes
 */

const fs = require('fs');
const Parser = require('node-dbf').default;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'copig_moderno',
    password: 'ansiktet1969',
    port: 5432,
});

async function analizarSPRTCOS() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 ANÁLISIS COMPLETO DE SPRTCOS.DBF');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const dbfPath = 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPRTCOS.DBF';
    
    try {
        // Obtener empresas existentes
        const empresasResult = await pool.query('SELECT id, cuit FROM copig.empresas');
        const empresasPorCuit = {};
        empresasResult.rows.forEach(e => {
            if (e.cuit) empresasPorCuit[e.cuit.trim()] = e.id;
        });
        
        // Obtener profesionales existentes
        const profResult = await pool.query(`
            SELECT p.id, m.numero_matricula 
            FROM copig.profesionales p
            JOIN copig.matriculas m ON p.id = m.profesional_id
        `);
        const profesionalesPorMatricula = {};
        profResult.rows.forEach(p => {
            if (p.numero_matricula) {
                profesionalesPorMatricula[p.numero_matricula.toString()] = p.id;
            }
        });
        
        const parser = new Parser(dbfPath);
        const registros = [];
        const estadisticas = {
            total: 0,
            conMatricula: 0,
            sinMatricula: 0,
            conCuit: 0,
            sinCuit: 0,
            empresaEncontrada: 0,
            empresaNoEncontrada: 0,
            profesionalEncontrado: 0,
            profesionalNoEncontrado: 0,
            aptoParaImportar: 0,
            registrosUnicos: new Set(),
            matriculasUnicas: new Set(),
            cuitsUnicos: new Set(),
            combinacionesUnicas: new Set()
        };
        
        parser.on('record', (record) => {
            registros.push(record);
            estadisticas.total++;
            
            const matricula = record.MATRICULA ? record.MATRICULA.toString().trim() : '';
            const cuit = record.CUIT ? record.CUIT.toString().trim() : '';
            
            // Análisis de campos
            if (matricula) {
                estadisticas.conMatricula++;
                estadisticas.matriculasUnicas.add(matricula);
            } else {
                estadisticas.sinMatricula++;
            }
            
            if (cuit) {
                estadisticas.conCuit++;
                estadisticas.cuitsUnicos.add(cuit);
            } else {
                estadisticas.sinCuit++;
            }
            
            // Verificar si empresa existe
            if (cuit && empresasPorCuit[cuit]) {
                estadisticas.empresaEncontrada++;
            } else {
                estadisticas.empresaNoEncontrada++;
            }
            
            // Verificar si profesional existe
            if (matricula && profesionalesPorMatricula[matricula]) {
                estadisticas.profesionalEncontrado++;
            } else {
                estadisticas.profesionalNoEncontrado++;
            }
            
            // Verificar si es apto para importar
            if (matricula && cuit && 
                empresasPorCuit[cuit] && 
                profesionalesPorMatricula[matricula]) {
                estadisticas.aptoParaImportar++;
                const combinacion = `${matricula}-${cuit}`;
                estadisticas.combinacionesUnicas.add(combinacion);
            }
        });
        
        parser.on('end', async () => {
            console.log('📈 ESTADÍSTICAS GENERALES:');
            console.log('─────────────────────────────────────────');
            console.log(`Total de registros en DBF: ${estadisticas.total}`);
            console.log(`Registros con matrícula: ${estadisticas.conMatricula}`);
            console.log(`Registros sin matrícula: ${estadisticas.sinMatricula}`);
            console.log(`Registros con CUIT: ${estadisticas.conCuit}`);
            console.log(`Registros sin CUIT: ${estadisticas.sinCuit}`);
            console.log();
            
            console.log('🔍 ANÁLISIS DE COINCIDENCIAS:');
            console.log('─────────────────────────────────────────');
            console.log(`Empresas encontradas en BD: ${estadisticas.empresaEncontrada}`);
            console.log(`Empresas NO encontradas: ${estadisticas.empresaNoEncontrada}`);
            console.log(`Profesionales encontrados en BD: ${estadisticas.profesionalEncontrado}`);
            console.log(`Profesionales NO encontrados: ${estadisticas.profesionalNoEncontrado}`);
            console.log();
            
            console.log('✅ REGISTROS IMPORTABLES:');
            console.log('─────────────────────────────────────────');
            console.log(`Aptos para importar: ${estadisticas.aptoParaImportar}`);
            console.log(`Combinaciones únicas (matrícula-CUIT): ${estadisticas.combinacionesUnicas.size}`);
            console.log(`Matrículas únicas: ${estadisticas.matriculasUnicas.size}`);
            console.log(`CUITs únicos: ${estadisticas.cuitsUnicos.size}`);
            console.log();
            
            // Mostrar algunos ejemplos de registros no importables
            console.log('📋 EJEMPLOS DE REGISTROS NO IMPORTABLES:');
            console.log('─────────────────────────────────────────');
            let ejemplos = 0;
            for (const record of registros) {
                const matricula = record.MATRICULA ? record.MATRICULA.toString().trim() : '';
                const cuit = record.CUIT ? record.CUIT.toString().trim() : '';
                const nombre = record.NOMBRE ? record.NOMBRE.toString().trim() : '';
                
                if ((!matricula || !cuit) && ejemplos < 5) {
                    console.log(`- ${nombre || 'SIN NOMBRE'} | Mat: ${matricula || 'VACIO'} | CUIT: ${cuit || 'VACIO'}`);
                    ejemplos++;
                }
            }
            
            console.log('\n❓ RAZÓN DE POCOS REPRESENTANTES IMPORTADOS:');
            console.log('─────────────────────────────────────────');
            console.log(`El archivo tiene ${estadisticas.total} registros, pero:`);
            console.log(`- Solo ${estadisticas.aptoParaImportar} tienen empresa Y profesional existentes`);
            console.log(`- ${estadisticas.sinMatricula} registros no tienen matrícula`);
            console.log(`- ${estadisticas.sinCuit} registros no tienen CUIT`);
            console.log(`- ${estadisticas.empresaNoEncontrada} CUITs no corresponden a empresas en BD`);
            console.log(`- ${estadisticas.profesionalNoEncontrado} matrículas no corresponden a profesionales en BD`);
            
            await pool.end();
            console.log('\n✅ Análisis completado');
        });
        
        parser.parse();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

analizarSPRTCOS();