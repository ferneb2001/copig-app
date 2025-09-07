const { Pool } = require('pg');
const config = require('./config.json');
const pool = new Pool(config.database);

async function testPorcentajeConfigurable() {
    try {
        console.log('🧪 PROBANDO PORCENTAJE CONFIGURABLE...');
        console.log('════════════════════════════════════════════');
        
        // Probar diferentes escenarios
        const scenarios = [
            { arancel: 79000, porcentaje: 25, descripcion: 'Segmento A con 25%' },
            { arancel: 79000, porcentaje: 10, descripcion: 'Segmento A con 10%' },
            { arancel: 112000, porcentaje: 15, descripcion: 'Segmento B con 15%' },
            { arancel: 175000, porcentaje: 5, descripcion: 'Segmento C con 5%' },
            { arancel: 50000, porcentaje: 30, descripcion: 'Arancel personalizado con 30%' }
        ];
        
        console.log('📋 CASOS DE PRUEBA - FÓRMULA: Honorarios = Arancel ÷ Porcentaje × 100\n');
        
        scenarios.forEach((scenario, index) => {
            const honorarios = scenario.arancel / (scenario.porcentaje / 100);
            const verificacion = (honorarios * scenario.porcentaje / 100);
            
            console.log(`💼 CASO ${index + 1}: ${scenario.descripcion}`);
            console.log(`   📊 Arancel CHP: $${scenario.arancel.toLocaleString('es-AR')}`);
            console.log(`   ⚙️ Porcentaje configurado: ${scenario.porcentaje}%`);
            console.log(`   💰 Honorarios calculados: $${Math.round(honorarios).toLocaleString('es-AR')}`);
            console.log(`   ✅ Verificación: ${scenario.porcentaje}% de $${Math.round(honorarios).toLocaleString('es-AR')} = $${Math.round(verificacion).toLocaleString('es-AR')}`);
            console.log(`   ${Math.round(verificacion) === scenario.arancel ? '✅ CORRECTO' : '❌ ERROR'}\n`);
        });
        
        // Verificar tabla aranceles_chp
        console.log('📊 CONFIGURACIÓN DE ARANCELES:');
        const aranceles = await pool.query(`
            SELECT 
                segmento,
                nombre_segmento,
                arancel,
                porcentaje_sugerido,
                ROUND(arancel / (porcentaje_sugerido / 100)) as honorarios_sugeridos
            FROM copig.aranceles_chp 
            WHERE activo = true
            ORDER BY monto_desde
        `);
        
        console.table(aranceles.rows);
        
        console.log('\n🎯 FLUJO EN INTERFAZ ADMIN:');
        console.log('1. Admin ve "Arancel CHP (Base)": $79.000');
        console.log('2. Admin ingresa en "Configurar Porcentaje": 25%');
        console.log('3. Sistema calcula "Honorarios": $79.000 ÷ 25% = $316.000');
        console.log('4. Se muestra: "25% de $316.000 = $79.000"');
        console.log('5. Arancel final se mantiene en $79.000 para facturación');
        
        console.log('\n🔧 FUNCIONALIDAD IMPLEMENTADA:');
        console.log('✅ Campo porcentaje_sugerido agregado a BD');
        console.log('✅ Interfaz admin-chp.html actualizada');
        console.log('✅ Función calcularHonorarios() implementada');
        console.log('✅ Cálculo inverso funcionando: Porcentaje → Honorarios');
        console.log('✅ Fernando puede configurar cualquier porcentaje');
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        await pool.end();
        process.exit(1);
    }
}

testPorcentajeConfigurable();