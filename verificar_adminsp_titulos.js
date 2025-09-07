const Parser = require('node-dbf').default;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

// Casos problemáticos detectados en el análisis
const casosProblematicos = [
    {matricula: 8763, nombre_oficial: 'ABRAHAM, LAURA IRENE', titulo_oficial: 'INGENIERO AGRONOMO', titulo_bd_actual: 'ING.EN CONSTRUCC. MECANICA'},
    {matricula: 5454, nombre_oficial: 'ACIAR,CARLOS DANTE PEDRO', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES', titulo_bd_actual: 'INGENIERO HIDRAULICO'},
    {matricula: 9106, nombre_oficial: 'ABAD, RAMIRO', titulo_oficial: 'INGENIERO CIVIL', titulo_bd_actual: 'ING.EN VIAS DE COMUNICACION'},
    {matricula: 8765, nombre_oficial: 'AGUILAR, MARIA LUZ', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS', titulo_bd_actual: 'SIN TÍTULO'},
    
    // Casos de matrículas posiblemente duplicadas
    {matricula: 6975, nombre_oficial: 'ALMARÁ, SUSANA ELVIRA', titulo_oficial: 'INGENIERO AGRONOMO', nombre_bd_actual: 'ZARADNIK,HECTOR RAUL'},
    {matricula: 9113, nombre_oficial: 'ALOISIO, SANDRA FABIANA', titulo_oficial: 'LICENCIADO EN ENOLOGIA Y VITICULTURA', nombre_bd_actual: 'CASTRO,LORENA ALEJANDRA'}
];

async function verificarAdminspTitulos() {
    try {
        console.log('🔍 VERIFICANDO DATOS ORIGINALES EN ADMINSP vs BD ACTUAL');
        console.log('='.repeat(70));
        
        // Leer archivo SPPROF.DBF original
        console.log('📂 Leyendo SPPROF.DBF original...');
        const dbfPath = 'C:\\copig-app\\adminsp\\COPIG\\foxpro2\\archpadron21\\SPPROF.DBF';
        const dbf = new Parser(dbfPath);
        
        console.log(`✅ SPPROF.DBF leído: ${dbf.recordCount} registros`);
        console.log('');
        
        let encontradosEnAdminsp = 0;
        let coincidenciasNombre = 0;
        let coincidenciasTitulo = 0;
        
        console.log('🔍 VERIFICANDO CASOS PROBLEMÁTICOS:');
        console.log('');
        
        for (const caso of casosProblematicos) {
            console.log(`📋 Mat. ${caso.matricula}: ${caso.nombre_oficial}`);
            console.log(`   Título oficial: ${caso.titulo_oficial}`);
            console.log(`   BD actual: ${caso.titulo_bd_actual || caso.nombre_bd_actual}`);
            
            // Buscar en SPPROF.DBF por matrícula
            let encontradoAdminsp = null;
            for (let i = 0; i < dbf.recordCount; i++) {
                const record = dbf.readRecord(i);
                if (record && record.MATPROF === caso.matricula) {
                    encontradoAdminsp = record;
                    break;
                }
            }
            
            if (encontradoAdminsp) {
                encontradosEnAdminsp++;
                console.log(`   ✅ ENCONTRADO EN ADMINSP:`);
                console.log(`      Nombre: ${encontradoAdminsp.NOMBRE || 'N/A'}`);
                console.log(`      Título: ${encontradoAdminsp.TITULO || 'N/A'}`);
                console.log(`      Especialidad: ${encontradoAdminsp.ESPEC || 'N/A'}`);
                
                // Verificar coincidencias
                if (encontradoAdminsp.NOMBRE && encontradoAdminsp.NOMBRE.includes(caso.nombre_oficial.split(',')[0])) {
                    console.log(`      🎯 NOMBRE COINCIDE con oficial`);
                    coincidenciasNombre++;
                } else {
                    console.log(`      ⚠️  NOMBRE DIFERENTE de oficial`);
                }
                
                if (encontradoAdminsp.TITULO && 
                   (encontradoAdminsp.TITULO.includes('AGRONOMO') && caso.titulo_oficial.includes('AGRONOMO') ||
                    encontradoAdminsp.TITULO.includes('CIVIL') && caso.titulo_oficial.includes('CIVIL') ||
                    encontradoAdminsp.TITULO.includes('GEOLOGO') && caso.titulo_oficial.includes('GEOLOGICAS'))) {
                    console.log(`      🎯 TÍTULO RELACIONADO con oficial`);
                    coincidenciasTitulo++;
                } else {
                    console.log(`      ⚠️  TÍTULO NO RELACIONADO con oficial`);
                }
                
            } else {
                console.log(`   ❌ NO ENCONTRADO EN ADMINSP`);
            }
            
            console.log('');
        }
        
        // Resumen
        console.log('='.repeat(70));
        console.log('📊 RESUMEN VERIFICACIÓN ADMINSP:');
        console.log(`📂 Total casos verificados: ${casosProblematicos.length}`);
        console.log(`✅ Encontrados en ADMINSP: ${encontradosEnAdminsp}`);
        console.log(`🎯 Coincidencias de nombre: ${coincidenciasNombre}`);
        console.log(`🎯 Títulos relacionados: ${coincidenciasTitulo}`);
        console.log('');
        
        if (encontradosEnAdminsp > 0) {
            console.log('💡 CONCLUSIÓN: ADMINSP contiene datos originales que pueden ayudar a resolver las discrepancias');
            console.log('🔧 RECOMENDACIÓN: Usar ADMINSP como fuente de verdad para correcciones');
        } else {
            console.log('⚠️  CONCLUSIÓN: ADMINSP no contiene estos registros o estructura diferente');
        }
        
        // dbf.close() no es necesario para node-dbf
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
        await pool.end();
    }
}

verificarAdminspTitulos();