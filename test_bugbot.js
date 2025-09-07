// ARCHIVO DE PRUEBA PARA BUGBOT - CONTIENE ERRORES INTENCIONALES
const express = require('express');
const app = express();

// BUG 1: Variable no declarada
function testFunction() {
    undeclaredVariable = "esto debería causar error";  // ReferenceError
    console.log(undeclaredVariable);
}

// BUG 2: Comparación con == en lugar de ===
function compareValues(a, b) {
    if (a == b) {  // Debería usar ===
        return true;
    }
    return false
}  // BUG 3: Falta punto y coma

// BUG 4: Try-catch sin catch
function riskyFunction() {
    try {
        JSON.parse("invalid json {");
    } // Falta el catch
}

// BUG 5: Función async sin await
async function fetchData() {
    const data = fetch('https://api.example.com/data');  // Falta await
    return data.json();  // Esto va a fallar
}

// BUG 6: Usar var en lugar de let/const
for (var i = 0; i < 10; i++) {  // Debería usar let
    setTimeout(() => {
        console.log(i);  // Siempre imprimirá 10
    }, 100);
}

// BUG 7: División por cero no verificada
function divide(a, b) {
    return a / b;  // No verifica si b es 0
}

// BUG 8: SQL Injection vulnerability
const query = "SELECT * FROM users WHERE id = " + userId;  // Vulnerable

// BUG 9: Callback hell
fs.readFile('file1.txt', (err, data1) => {
    if (err) throw err;
    fs.readFile('file2.txt', (err, data2) => {
        if (err) throw err;
        fs.readFile('file3.txt', (err, data3) => {
            if (err) throw err;
            // Callback hell - debería usar promises o async/await
        });
    });
});

// BUG 10: Memory leak potencial
const cache = {};
function addToCache(key, value) {
    cache[key] = value;  // Cache crece infinitamente
}

// BUG 11: Usar eval (muy peligroso)
function executeCode(code) {
    return eval(code);  // Nunca usar eval!
}

module.exports = {
    testFunction,
    compareValues,
    riskyFunction,
    fetchData,
    divide,
    addToCache,
    executeCode
};