console.log('🧪 PROBANDO CÁLCULO DE PORCENTAJE...');
console.log('════════════════════════════════════════════');

// Simular diferentes casos de prueba
const testCases = [
    { honorarios: 100000, porcentaje: 15, esperado: 15000 },
    { honorarios: 500000, porcentaje: 15, esperado: 75000 },
    { honorarios: 300000, porcentaje: 26.33, esperado: 78990 },
    { honorarios: 840000, porcentaje: 9.40, esperado: 78960 },
    { honorarios: 1000000, porcentaje: 5, esperado: 50000 }
];

console.log('📋 CASOS DE PRUEBA - FÓRMULA: Arancel = Honorarios × Porcentaje ÷ 100\n');

testCases.forEach((test, index) => {
    // Cálculo JavaScript exacto del frontend
    const arancelCalculado = (test.honorarios * test.porcentaje) / 100;
    const arancelRedondeado = Math.round(arancelCalculado);
    
    console.log(`💼 CASO ${index + 1}:`);
    console.log(`   💰 Honorarios: $${test.honorarios.toLocaleString('es-AR')}`);
    console.log(`   📊 Porcentaje: ${test.porcentaje}%`);
    console.log(`   🧮 Cálculo: $${test.honorarios.toLocaleString('es-AR')} × ${test.porcentaje}% ÷ 100`);
    console.log(`   📈 Resultado: $${arancelCalculado.toLocaleString('es-AR')} (exacto)`);
    console.log(`   🎯 Redondeado: $${arancelRedondeado.toLocaleString('es-AR')}`);
    console.log(`   ✅ Esperado: $${test.esperado.toLocaleString('es-AR')}`);
    console.log(`   ${Math.abs(arancelRedondeado - test.esperado) <= 1 ? '✅ CORRECTO' : '❌ ERROR'}\n`);
});

// Mostrar fórmula HTML actual
console.log('📄 CÓDIGO HTML ACTUAL:');
console.log('const arancelCHP = (honorarios * porcentaje) / 100;');
console.log('resultado.innerHTML = `$${Math.round(arancelCHP).toLocaleString(\'es-AR\')}`;');

console.log('\n💡 SI EL CÁLCULO ESTÁ MAL, VERIFICA:');
console.log('1. Que los campos se lean correctamente: parseFloat(value)');  
console.log('2. Que la fórmula sea: (honorarios * porcentaje) / 100');
console.log('3. Que no haya errores en los IDs de los elementos HTML');
console.log('4. Que se aplique Math.round() para redondear');