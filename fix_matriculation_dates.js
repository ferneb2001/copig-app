/**
 * CORRECCIÓN FECHAS DE MATRICULACIÓN - METODOLOGÍA CONSERVADORA
 * ===========================================================
 * Siguiendo máximas de Fernando Adrian Nebro:
 * - NO romper lo que ya funciona
 * - Cambios conservadores
 * - Documentar todos los cambios
 */

const fs = require('fs');

function fixMatriculationDates() {
    console.log('🔧 CORRECCIÓN: Fechas de matriculación en server.js\n');
    
    try {
        // Leer server.js
        let serverContent = fs.readFileSync('server.js', 'utf8');
        console.log(`📄 Archivo server.js leído: ${Math.round(serverContent.length/1024)}KB`);
        
        // Verificar que el problema existe
        if (!serverContent.includes('fecha_matriculacion')) {
            console.log('✅ El problema ya fue corregido anteriormente');
            return;
        }
        
        // Aplicar corrección específica
        const oldQuery = `(id_profesional, numero_matricula, categoria, fecha_matriculacion, activo)`;
        const newQuery = `(profesional_id, numero_matricula, categoria, fecha_inscripcion, activo)`;
        
        console.log('🔍 CAMBIOS A REALIZAR:');
        console.log(`   ANTES: ${oldQuery}`);
        console.log(`   DESPUÉS: ${newQuery}`);
        
        // Realizar el reemplazo
        const updatedContent = serverContent.replace(oldQuery, newQuery);
        
        // Verificar que el cambio se aplicó
        if (updatedContent === serverContent) {
            console.log('❌ No se encontró la cadena exacta para reemplazar');
            console.log('🔍 Buscando contexto alrededor de línea 971...');
            
            const lines = serverContent.split('\n');
            for (let i = 965; i < 980; i++) {
                if (lines[i]) {
                    console.log(`   ${i + 1}: ${lines[i]}`);
                }
            }
            return;
        }
        
        // Validar sintaxis (verificar que tenga sentido)
        if (!updatedContent.includes('profesional_id') || !updatedContent.includes('fecha_inscripcion')) {
            console.log('❌ Error: El cambio no se aplicó correctamente');
            return;
        }
        
        // Guardar archivo corregido
        fs.writeFileSync('server.js', updatedContent);
        console.log('✅ server.js actualizado exitosamente');
        
        // Verificar que el archivo se guardó correctamente
        const verification = fs.readFileSync('server.js', 'utf8');
        if (verification.includes('fecha_inscripcion') && !verification.includes('fecha_matriculacion')) {
            console.log('✅ Verificación: Cambio aplicado correctamente');
            console.log('\n📋 RESUMEN DE CORRECCIÓN:');
            console.log('   ✅ Campo incorrecto: fecha_matriculacion → ELIMINADO');
            console.log('   ✅ Campo correcto: fecha_inscripcion → AGREGADO');
            console.log('   ✅ Campo incorrecto: id_profesional → profesional_id (estandarizado)');
            console.log('\n⚠️  REQUIERE: Reiniciar servidor para aplicar cambios');
        } else {
            console.log('❌ Error en verificación: El archivo no se actualizó correctamente');
        }
        
    } catch (error) {
        console.log('❌ Error durante corrección:', error.message);
    }
}

if (require.main === module) {
    fixMatriculationDates();
}

module.exports = fixMatriculationDates;