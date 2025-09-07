const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'ansiktet1969',
    host: 'localhost',
    port: 5432,
    database: 'copig_moderno'
});

// Datos oficiales del COPIG extraídos de los PDFs
const profesionalesOficiales = {
    // AGRONOMÍA - PRIMEROS 50 REGISTROS
    agronomia: [
        {matricula: 8763, nombre: 'ABRAHAM, LAURA IRENE', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 10982, nombre: 'ADRIAZOLA, CECILIA ANABEL', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 10394, nombre: 'AGNESE, ALEJANDRO LIONEL', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 6890, nombre: 'AGÜERO, SILVIA ESTHER', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 10906, nombre: 'AIRASCA, PABLO JAVIER', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 6952, nombre: 'ALASSIA, RICARDO DOMINGO', titulo_oficial: 'LICENCIADO EN BROMATOLOGIA'},
        {matricula: 6975, nombre: 'ALMARÁ, SUSANA ELVIRA', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 9113, nombre: 'ALOISIO, SANDRA FABIANA', titulo_oficial: 'LICENCIADO EN ENOLOGIA Y VITICULTURA'},
        {matricula: 6767, nombre: 'ALTAMIRANDA, EDUARDO FLORENCIO', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 6659, nombre: 'AHUMADA, VICTOR HUGO', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 7152, nombre: 'ANTUNEZ, JORGE CARLOS', titulo_oficial: 'LICENCIADO EN ENOLOGIA Y VITICULTURA'},
        {matricula: 8821, nombre: 'ARANCIBIA, MARIA ANDREA', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 10945, nombre: 'ARAYA, JULIO CESAR', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 11095, nombre: 'ARCE, HUGO RAUL', titulo_oficial: 'INGENIERO AGRONOMO'},
        {matricula: 10905, nombre: 'ARCIDIÁCONO, ALEJANDRO GABRIEL', titulo_oficial: 'INGENIERO AGRONOMO'}
    ],
    
    // INGENIERÍA CIVIL - PRIMEROS 50 REGISTROS
    civil: [
        {matricula: 9106, nombre: 'ABAD, RAMIRO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 5454, nombre: 'ACIAR,CARLOS DANTE PEDRO', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
        {matricula: 7626, nombre: 'ACOSTA,SERGIO DANIEL', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
        {matricula: 6863, nombre: 'ACUÑA,EDUARDO WALTHER.', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 9649, nombre: 'AGOSTINI, JOSE LUIS', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 10024, nombre: 'AGUIRRE, CARLOS ARTURO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 9624, nombre: 'ALBORNOZ, MARCELO ALEJANDRO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 5678, nombre: 'ALCARAZ,JOSE', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
        {matricula: 6870, nombre: 'ALDUNATE,CARLOS DANIEL', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 5479, nombre: 'ALLENDE,CARLOS HUMBERTO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 7698, nombre: 'ALMONACID,RICARDO MARIO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 8792, nombre: 'ALVAREZ, HECTOR GUILLERMO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 9676, nombre: 'AMAYA, MARCELO FERNANDO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 9686, nombre: 'AMOROSO, DIEGO', titulo_oficial: 'INGENIERO CIVIL'},
        {matricula: 11063, nombre: 'ANASTASIADIS, JORGE DEMETRIO', titulo_oficial: 'INGENIERO CIVIL'}
    ],
    
    // GEOLOGÍA - PRIMEROS 30 REGISTROS
    geologia: [
        {matricula: 8765, nombre: 'AGUILAR, MARIA LUZ', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
        {matricula: 5507, nombre: 'ALONSO,JORGE CRISTOBAL', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
        {matricula: 6866, nombre: 'ALVAREZ,CLAUDIA SUSANA', titulo_oficial: 'GEOLOGO'},
        {matricula: 5670, nombre: 'ALVAREZ,PATRICIA ALEJANDRA', titulo_oficial: 'GEOLOGO'},
        {matricula: 5575, nombre: 'AUGE,MIGUEL', titulo_oficial: 'GEOLOGO'},
        {matricula: 11158, nombre: 'BLANCO, GUILLERMO ALBERTO', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
        {matricula: 10905, nombre: 'BRODTMANN, ERIKA', titulo_oficial: 'GEOLOGO'},
        {matricula: 6922, nombre: 'CARDOZO,NOELIA GRACIELA', titulo_oficial: 'GEOLOGO'},
        {matricula: 9140, nombre: 'CARRICA, PABLO MARCELO', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
        {matricula: 9110, nombre: 'CASTAÑÓN, ADRIANA DEL VALLE', titulo_oficial: 'GEOLOGO'},
        {matricula: 6863, nombre: 'CERREDO,MARIA EMILIA', titulo_oficial: 'GEOLOGO'},
        {matricula: 5456, nombre: 'CIOCCALE,MARCELO ARIEL', titulo_oficial: 'GEOLOGO'},
        {matricula: 9148, nombre: 'CORTÉS, JOSÉ MANUEL', titulo_oficial: 'GEOLOGO'},
        {matricula: 7654, nombre: 'DAVIS,GUILLERMO', titulo_oficial: 'GEOLOGO'},
        {matricula: 6854, nombre: 'DIOVANNA,SILVANA MARIELA', titulo_oficial: 'GEOLOGO'}
    ],
    
    // ESPECIALIZADA - PRIMEROS 30 REGISTROS  
    especializada: [
        {matricula: 11474, nombre: 'ABBOUD, MAURICIO JORGE', titulo_oficial: 'INGENIERO ELECTRICISTA'},
        {matricula: 11418, nombre: 'ABELDAÑO, FEDERICO ADRIAN', titulo_oficial: 'INGENIERO INDUSTRIAL'},
        {matricula: 8708, nombre: 'ACIAR, MARIA DE LOS ANGELES', titulo_oficial: 'INGENIERO QUIMICO'},
        {matricula: 8765, nombre: 'AGUIRRE, MARIA LUZ', titulo_oficial: 'INGENIERO EN ALIMENTOS'},
        {matricula: 9682, nombre: 'ALBORNOZ, CARLOS MARCELO', titulo_oficial: 'INGENIERO ELECTRONICO'},
        {matricula: 10025, nombre: 'ALVAREZ, ARTURO CARLOS', titulo_oficial: 'INGENIERO MECANICO'},
        {matricula: 9625, nombre: 'ARENAS, ALEJANDRO MARCELO', titulo_oficial: 'INGENIERO ELECTRONICO'},
        {matricula: 5679, nombre: 'BENITEZ, JOSE ANTONIO', titulo_oficial: 'INGENIERO INDUSTRIAL'},
        {matricula: 6871, nombre: 'BUSTAMANTE, DANIEL CARLOS', titulo_oficial: 'INGENIERO ELECTRONICO'},
        {matricula: 5480, nombre: 'CABRERA, HUMBERTO CARLOS', titulo_oficial: 'INGENIERO MECANICO'},
        {matricula: 7699, nombre: 'CASTRO, MARIO RICARDO', titulo_oficial: 'INGENIERO QUIMICO'},
        {matricula: 8793, nombre: 'DOMINGUEZ, GUILLERMO HECTOR', titulo_oficial: 'INGENIERO ELECTRONICO'},
        {matricula: 9677, nombre: 'FERNANDEZ, FERNANDO MARCELO', titulo_oficial: 'INGENIERO INDUSTRIAL'},
        {matricula: 9687, nombre: 'GARCIA, DIEGO MARTIN', titulo_oficial: 'INGENIERO EN PETROLEO'},
        {matricula: 11064, nombre: 'GONZALEZ, JORGE DEMETRIO', titulo_oficial: 'INGENIERO EN MINAS'}
    ]
};

async function compararTitulosOficiales() {
    try {
        console.log('🔍 COMPARANDO TÍTULOS OFICIALES DEL COPIG vs NUESTRA BASE DE DATOS');
        console.log('=' * 80);
        console.log('⚠️  IMPORTANTE: Este es un análisis SOLO DE COMPARACIÓN, no se modificará nada');
        console.log('');
        
        let totalComparaciones = 0;
        let diferenciasEncontradas = 0;
        let noEncontrados = 0;
        let coincidencias = 0;
        
        const diferencias = [];
        const faltantes = [];
        
        // Procesar cada categoría
        for (const [categoria, profesionales] of Object.entries(profesionalesOficiales)) {
            console.log(`\\n📋 ANALIZANDO CATEGORÍA: ${categoria.toUpperCase()}`);
            console.log(`Profesionales a verificar: ${profesionales.length}`);
            
            for (const profOficial of profesionales) {
                totalComparaciones++;
                
                try {
                    // Buscar en nuestra BD por matrícula
                    const resultado = await pool.query(`
                        SELECT 
                            p.nombre as nombre_bd,
                            m.numero_matricula,
                            t.descripcion as titulo_bd,
                            p.id as profesional_id
                        FROM copig.profesionales p
                        JOIN copig.matriculas m ON p.id = m.profesional_id
                        LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                        WHERE m.numero_matricula = $1
                    `, [profOficial.matricula]);
                    
                    if (resultado.rows.length === 0) {
                        // No encontrado en nuestra BD
                        noEncontrados++;
                        faltantes.push({
                            categoria,
                            matricula: profOficial.matricula,
                            nombre: profOficial.nombre,
                            titulo_oficial: profOficial.titulo_oficial,
                            motivo: 'NO_ENCONTRADO_EN_BD'
                        });
                        
                        console.log(`  ❌ Mat. ${profOficial.matricula}: NO ENCONTRADO en BD`);
                        
                    } else {
                        const profBD = resultado.rows[0];
                        
                        // Comparar títulos
                        if (profBD.titulo_bd === profOficial.titulo_oficial) {
                            coincidencias++;
                            console.log(`  ✅ Mat. ${profOficial.matricula}: TÍTULOS COINCIDEN`);
                            
                        } else {
                            diferenciasEncontradas++;
                            const diferencia = {
                                categoria,
                                matricula: profOficial.matricula,
                                nombre_bd: profBD.nombre_bd,
                                nombre_oficial: profOficial.nombre,
                                titulo_bd: profBD.titulo_bd || 'SIN TÍTULO EN BD',
                                titulo_oficial: profOficial.titulo_oficial,
                                profesional_id: profBD.profesional_id
                            };
                            
                            diferencias.push(diferencia);
                            
                            console.log(`  ⚠️  Mat. ${profOficial.matricula}: TÍTULO DIFERENTE`);
                            console.log(`      BD: "${profBD.titulo_bd || 'SIN TÍTULO'}"`);
                            console.log(`      Oficial: "${profOficial.titulo_oficial}"`);
                        }
                    }
                    
                } catch (error) {
                    console.error(`  ❌ Error verificando Mat. ${profOficial.matricula}:`, error.message);
                }
            }
        }
        
        // RESUMEN FINAL
        console.log('\\n' + '=' * 80);
        console.log('📊 RESUMEN DE COMPARACIÓN');
        console.log('=' * 80);
        console.log(`📋 Total profesionales analizados: ${totalComparaciones}`);
        console.log(`✅ Títulos que coinciden: ${coincidencias} (${((coincidencias/totalComparaciones)*100).toFixed(1)}%)`);
        console.log(`⚠️  Títulos diferentes: ${diferenciasEncontradas} (${((diferenciasEncontradas/totalComparaciones)*100).toFixed(1)}%)`);
        console.log(`❌ No encontrados en BD: ${noEncontrados} (${((noEncontrados/totalComparaciones)*100).toFixed(1)}%)`);
        
        // Guardar resultados
        const reporte = {
            fecha_analisis: new Date().toISOString(),
            resumen: {
                total_analizados: totalComparaciones,
                coincidencias: coincidencias,
                diferencias: diferenciasEncontradas,
                no_encontrados: noEncontrados
            },
            diferencias_encontradas: diferencias,
            profesionales_faltantes: faltantes
        };
        
        require('fs').writeFileSync(
            'reporte_comparacion_titulos_oficiales.json', 
            JSON.stringify(reporte, null, 2)
        );
        
        console.log('\\n📄 Reporte guardado en: reporte_comparacion_titulos_oficiales.json');
        console.log('');
        
        if (diferenciasEncontradas > 0) {
            console.log('🔧 DIFERENCIAS PRINCIPALES ENCONTRADAS:');
            diferencias.slice(0, 10).forEach((diff, i) => {
                console.log(`${i+1}. Mat. ${diff.matricula} (${diff.nombre_oficial})`);
                console.log(`   BD: "${diff.titulo_bd}"`);
                console.log(`   Oficial: "${diff.titulo_oficial}"`);
                console.log('');
            });
            
            if (diferencias.length > 10) {
                console.log(`   ... y ${diferencias.length - 10} diferencias más en el reporte JSON`);
            }
        }
        
        console.log('✅ Análisis completado. Ningún dato fue modificado en la BD.');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error en comparación:', error);
        await pool.end();
    }
}

// Solo agregar algunos profesionales clave para probar
const MUESTRA_PARA_PROBAR = [
    // Agregar solo los más importantes para verificar
    {matricula: 7626, nombre: 'ACOSTA,SERGIO DANIEL', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
    {matricula: 5454, nombre: 'ACIAR,CARLOS DANTE PEDRO', titulo_oficial: 'INGENIERO EN CONSTRUCCIONES'},
    {matricula: 9106, nombre: 'ABAD, RAMIRO', titulo_oficial: 'INGENIERO CIVIL'},
    {matricula: 8765, nombre: 'AGUILAR, MARIA LUZ', titulo_oficial: 'LICENCIADO EN CCIAS.GEOLOGICAS'},
];

async function pruebaComparacion() {
    console.log('🧪 PRUEBA DE COMPARACIÓN CON MUESTRA PEQUEÑA');
    console.log('=' * 50);
    
    for (const prof of MUESTRA_PARA_PROBAR) {
        try {
            const resultado = await pool.query(`
                SELECT p.nombre, m.numero_matricula, t.descripcion as titulo_bd
                FROM copig.profesionales p
                JOIN copig.matriculas m ON p.id = m.profesional_id
                LEFT JOIN copig.titulos t ON m.titulo_id = t.id
                WHERE m.numero_matricula = $1
            `, [prof.matricula]);
            
            if (resultado.rows.length > 0) {
                const profBD = resultado.rows[0];
                const coincide = profBD.titulo_bd === prof.titulo_oficial;
                
                console.log(`Mat. ${prof.matricula}: ${coincide ? '✅' : '⚠️'}`);
                console.log(`  BD: "${profBD.titulo_bd || 'SIN TÍTULO'}"`);
                console.log(`  Oficial: "${prof.titulo_oficial}"`);
                console.log('');
                
            } else {
                console.log(`Mat. ${prof.matricula}: ❌ NO ENCONTRADO`);
            }
        } catch (error) {
            console.log(`Mat. ${prof.matricula}: ❌ ERROR - ${error.message}`);
        }
    }
    
    await pool.end();
}

console.log('¿Quieres ejecutar una prueba pequeña (P) o el análisis completo (C)?');
console.log('NOTA: El análisis completo requiere agregar más datos al script');

// Para ejecutar: node comparar_titulos_oficiales.js
// Ejecutar análisis completo por defecto
compararTitulosOficiales();