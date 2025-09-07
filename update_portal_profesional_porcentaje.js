const fs = require('fs');

function updatePortalProfesionalPorcentaje() {
    try {
        console.log('🔧 ACTUALIZANDO portal-profesional.html con porcentaje manual...');
        
        // Leer archivo actual
        let content = fs.readFileSync('C:\\copig-app\\portal-profesional.html', 'utf8');
        
        // Buscar y reemplazar el campo de monto de honorarios
        const oldHonorariosField = `                            <label for="monto_honorarios">Monto de Honorarios Profesionales ($)</label>
                            <input type="number" id="monto_honorarios" name="monto_honorarios" required 
                                   min="0" step="0.01" placeholder="Ingresa el monto de tus honorarios"
                                   style="width: 100%; padding: 12px; border: 2px solid #3498db; border-radius: 8px; font-size: 1rem;">`;
        
        const newHonorariosFields = `                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <label for="monto_honorarios">💰 Monto de Honorarios ($)</label>
                                    <input type="number" id="monto_honorarios" name="monto_honorarios" required 
                                           min="0" step="0.01" placeholder="Ej: 500000"
                                           style="width: 100%; padding: 12px; border: 2px solid #3498db; border-radius: 8px; font-size: 1rem;"
                                           oninput="calcularArancelManual()">
                                </div>
                                <div>
                                    <label for="porcentaje_chp">📊 Porcentaje CHP (%)</label>
                                    <input type="number" id="porcentaje_chp" name="porcentaje_chp" required 
                                           min="0.01" max="100" step="0.01" placeholder="Ej: 15.50"
                                           style="width: 100%; padding: 12px; border: 2px solid #27ae60; border-radius: 8px; font-size: 1rem;"
                                           oninput="calcularArancelManual()">
                                </div>
                            </div>
                            
                            <div style="margin-top: 15px;">
                                <label style="font-weight: 600; color: #2c3e50;">🧮 Arancel CHP Calculado:</label>
                                <div id="arancelCalculadoManual" style="font-size: 1.4em; font-weight: bold; color: #e74c3c; padding: 15px; background: #fef9e7; border: 2px solid #f1c40f; border-radius: 8px; text-align: center; margin-top: 8px;">
                                    Complete honorarios y porcentaje para calcular
                                </div>
                            </div>`;
        
        // Reemplazar
        content = content.replace(oldHonorariosField, newHonorariosFields);
        
        // Buscar función calcularArancel actual y reemplazarla
        const oldCalcFunction = /\/\/ Calcular arancel según monto de honorarios \(dinámico\)[\s\S]*?(?=function|$)/;
        
        const newCalcFunction = `        // Calcular arancel manual: honorarios × porcentaje
        function calcularArancelManual() {
            const honorarios = parseFloat(document.getElementById('monto_honorarios').value) || 0;
            const porcentaje = parseFloat(document.getElementById('porcentaje_chp').value) || 0;
            const resultado = document.getElementById('arancelCalculadoManual');
            
            if (honorarios > 0 && porcentaje > 0) {
                const arancelCHP = (honorarios * porcentaje) / 100;
                
                resultado.innerHTML = \`
                    <strong style="color: #e74c3c;">$\${Math.round(arancelCHP).toLocaleString('es-AR')}</strong><br>
                    <small style="color: #7f8c8d;">(\$\${honorarios.toLocaleString('es-AR')} × \${porcentaje}% = \$\${Math.round(arancelCHP).toLocaleString('es-AR')})</small>
                \`;
                resultado.style.background = '#e8f8f5';
                resultado.style.borderColor = '#27ae60';
                resultado.style.color = '#27ae60';
            } else {
                resultado.textContent = 'Complete honorarios y porcentaje para calcular';
                resultado.style.background = '#fef9e7';
                resultado.style.borderColor = '#f1c40f';
                resultado.style.color = '#e74c3c';
            }
        }
        
        `;
        
        // Reemplazar función anterior
        content = content.replace(oldCalcFunction, newCalcFunction);
        
        // Actualizar función handleNuevaSolicitud para incluir porcentaje
        const oldSubmitData = `                monto_honorarios: montoHonorarios`;
        const newSubmitData = `                monto_honorarios: montoHonorarios,
                porcentaje_chp: parseFloat(formData.get('porcentaje_chp')) || null`;
        
        content = content.replace(oldSubmitData, newSubmitData);
        
        // Actualizar el campo de edición también
        const oldEditField = `                            💰 Monto de Honorarios (ARS):
                        </label>
                        <input type="number" id="edit_monto_honorarios" name="monto_honorarios" required min="1" step="0.01"`;
        
        const newEditFields = `                            💰 Monto de Honorarios (ARS) y Porcentaje CHP:
                        </label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <input type="number" id="edit_monto_honorarios" name="monto_honorarios" required min="1" step="0.01"`;
        
        content = content.replace(oldEditField, newEditFields);
        
        // Completar el campo de edición de porcentaje
        const oldEditStyle = `                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
                               placeholder="Monto total de honorarios profesionales">`;
        
        const newEditStyle = `                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
                               placeholder="Honorarios" oninput="calcularArancelEditManual()">
                            </div>
                            <div>
                                <input type="number" id="edit_porcentaje_chp" name="porcentaje_chp" required min="0.01" max="100" step="0.01"
                                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
                                       placeholder="% CHP" oninput="calcularArancelEditManual()">
                            </div>
                        </div>
                        <div id="arancelEditCalculado" style="font-weight: bold; color: #27ae60; text-align: center; padding: 10px; background: #f8f9fa; border-radius: 4px; margin-bottom: 15px;">
                            Complete ambos campos para ver el arancel
                        </div>`;
        
        content = content.replace(oldEditStyle, newEditStyle);
        
        // Agregar función para cálculo en edición
        const editCalcFunction = `
        function calcularArancelEditManual() {
            const honorarios = parseFloat(document.getElementById('edit_monto_honorarios').value) || 0;
            const porcentaje = parseFloat(document.getElementById('edit_porcentaje_chp').value) || 0;
            const resultado = document.getElementById('arancelEditCalculado');
            
            if (honorarios > 0 && porcentaje > 0) {
                const arancelCHP = (honorarios * porcentaje) / 100;
                resultado.innerHTML = \`
                    <strong>Arancel CHP: $\${Math.round(arancelCHP).toLocaleString('es-AR')}</strong><br>
                    <small>(\$\${honorarios.toLocaleString('es-AR')} × \${porcentaje}% = \$\${Math.round(arancelCHP).toLocaleString('es-AR')})</small>
                \`;
                resultado.style.color = '#27ae60';
                resultado.style.background = '#e8f8f5';
            } else {
                resultado.textContent = 'Complete ambos campos para ver el arancel';
                resultado.style.color = '#6c757d';
                resultado.style.background = '#f8f9fa';
            }
        }`;
        
        // Insertar función antes del cierre del script
        const scriptEndIndex = content.lastIndexOf('</script>');
        if (scriptEndIndex !== -1) {
            content = content.slice(0, scriptEndIndex) + editCalcFunction + '\n        ' + content.slice(scriptEndIndex);
        }
        
        // Escribir archivo actualizado
        fs.writeFileSync('C:\\copig-app\\portal-profesional.html', content);
        
        console.log('✅ portal-profesional.html actualizado exitosamente');
        console.log('✅ Campo porcentaje CHP manual agregado');
        console.log('✅ Cálculo automático: Honorarios × Porcentaje = Arancel');
        console.log('✅ Funciona tanto en creación como en edición');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error actualizando portal-profesional.html:', error.message);
        return false;
    }
}

updatePortalProfesionalPorcentaje();