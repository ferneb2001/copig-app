// 🐛 ARCHIVO DE PRUEBA PARA BUGBOT - ERRORES INTENCIONADOS

// Error 1: Variable no declarada
console.log(variableNoDeclarada);

// Error 2: Función sin return pero esperando valor
function calculateSum(a, b) {
    const sum = a + b;
    // Falta return
}

// Error 3: Comparación incorrecta con null
function checkValue(value) {
    if (value == null) { // Debería ser === 
        return "null value";
    }
    return value;
}

// Error 4: Loop infinito potencial
function infiniteLoop() {
    let i = 10;
    while (i > 0) {
        console.log(i);
        // Falta decremento - loop infinito
    }
}

// Error 5: Manejo incorrecto de async/await
async function badAsyncFunction() {
    try {
        const result = await fetch('/api/data');
        return result.json(); // Falta await
    } catch (error) {
        console.log(error);
        // No retorna nada en catch
    }
}

// Error 6: SQL injection potencial
function unsafeQuery(userInput) {
    const query = `SELECT * FROM users WHERE name = '${userInput}'`; // SQL injection
    return query;
}

// Error 7: Memory leak potencial
function createLeak() {
    const largeArray = new Array(1000000).fill('data');
    setInterval(() => {
        console.log(largeArray.length);
    }, 1000);
    // No limpia el interval
}

// Error 8: Undefined property access
function accessUndefined(obj) {
    return obj.property.nestedProperty.value; // No verifica si existe
}

// Error 9: Inconsistent data types
function mixedTypes(param) {
    if (typeof param === 'string') {
        return param + 10; // String + number
    }
    return param.toString().length;
}

// Error 10: No error handling for database operations
async function unsafeDatabaseOperation() {
    const result = await pool.query('SELECT * FROM table_that_might_not_exist');
    return result.rows[0].data; // No verifica si existe
}

module.exports = {
    calculateSum,
    checkValue,
    infiniteLoop,
    badAsyncFunction,
    unsafeQuery,
    createLeak,
    accessUndefined,
    mixedTypes,
    unsafeDatabaseOperation
};