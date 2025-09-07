const fs = require('fs');

function updateAdminCHPWithPorcentaje() {
    try {
        console.log('🔧 ACTUALIZANDO admin-chp.html para porcentaje configurable...');
        
        // Leer archivo actual
        let content = fs.readFileSync('C:\\copig-app\\admin-chp.html', 'utf8');
        
        // Reemplazar la sección de arancel sugerido con nueva interfaz
        const oldSection = `                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div>
                                <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #2c3e50;">
                                    💵 Honorarios Declarados:
                                </label>
                                <div id="honorariosDeclarados" style="font-size: 1.2em; font-weight: bold; color: #3498db; padding: 10px; background: #ecf0f1; border-radius: 4px;">
                                    -
                                </div>
                            </div>
                            <div>
                                <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #2c3e50;">
                                    🧮 Arancel Sugerido (automático):
                                </label>
                                <div id="arancelSugerido" style="font-size: 1.2em; font-weight: bold; color: #e67e22; padding: 10px; background: #ecf0f1; border-radius: 4px;">
                                    -
                                </div>
                            </div>
                        </div>`;
                        
        const newSection = `                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div>
                                <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #2c3e50;">
                                    📊 Arancel CHP (Base):
                                </label>
                                <div id="arancelBase" style="font-size: 1.2em; font-weight: bold; color: #e67e22; padding: 10px; background: #ecf0f1; border-radius: 4px;">
                                    -
                                </div>
                            </div>
                            <div>
                                <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #2c3e50;">
                                    ⚙️ Configurar Porcentaje:
                                </label>
                                <input type="number" id="porcentajeConfigurable" 
                                       step="0.01" min="0.01" max="100"
                                       style="width: 100%; padding: 8px; border: 2px solid #3498db; border-radius: 4px; 
                                              font-size: 1em; font-weight: bold; text-align: center;"
                                       placeholder="% de honorarios"
                                       oninput="calcularHonorarios()">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="font-weight: 600; margin-bottom: 8px; display: block; color: #2c3e50;">
                                💰 Honorarios Calculados:
                            </label>
                            <div id="honorariosCalculados" style="font-size: 1.4em; font-weight: bold; color: #27ae60; padding: 15px; background: #e8f8f5; border: 2px solid #27ae60; border-radius: 8px; text-align: center;">
                                Ingrese porcentaje para calcular
                            </div>
                        </div>`;
        
        // Reemplazar
        content = content.replace(oldSection, newSection);
        
        // Agregar función JavaScript para calcular honorarios
        const calcFunction = `
        function calcularHonorarios() {
            const arancelBase = parseFloat(document.getElementById('arancelBase').textContent.replace(/[^0-9.]/g, '')) || 0;
            const porcentaje = parseFloat(document.getElementById('porcentajeConfigurable').value) || 0;
            
            if (arancelBase > 0 && porcentaje > 0) {
                const honorarios = arancelBase / (porcentaje / 100);
                document.getElementById('honorariosCalculados').innerHTML = 
                    \`<strong>\$\${Math.round(honorarios).toLocaleString('es-AR')}</strong><br>
                     <small style="color: #7f8c8d;">(\${porcentaje}% de \$\${Math.round(honorarios).toLocaleString('es-AR')} = \$\${arancelBase.toLocaleString('es-AR')})</small>\`;
                
                // Actualizar arancel final con el valor base
                document.getElementById('arancelFinal').value = arancelBase;
            } else {
                document.getElementById('honorariosCalculados').textContent = 'Ingrese porcentaje para calcular';
                document.getElementById('arancelFinal').value = '';
            }
        }`;
        
        // Buscar donde insertar la función (antes del cierre del script)
        const scriptEndIndex = content.lastIndexOf('</script>');
        if (scriptEndIndex !== -1) {
            content = content.slice(0, scriptEndIndex) + calcFunction + '\n        ' + content.slice(scriptEndIndex);
        }
        
        // Modificar la función cargarDetalleSolicitud para usar arancel base
        const oldLoadFunction = `document.getElementById('arancelSugerido').textContent = arancelCalculado 
                    ? \`\$\${arancelCalculado.arancel.toLocaleString('es-AR')}\` : 'No calculado';`;
                    
        const newLoadFunction = `document.getElementById('arancelBase').textContent = arancelCalculado 
                    ? \`\$\${arancelCalculado.arancel.toLocaleString('es-AR')}\` : 'No calculado';
                
                // Configurar porcentaje sugerido si existe
                if (arancelCalculado && arancelCalculado.porcentaje_sugerido) {
                    document.getElementById('porcentajeConfigurable').value = arancelCalculado.porcentaje_sugerido;
                    calcularHonorarios();
                }`;
        
        content = content.replace(oldLoadFunction, newLoadFunction);
        
        // Escribir archivo actualizado
        fs.writeFileSync('C:\\copig-app\\admin-chp.html', content);
        
        console.log('✅ admin-chp.html actualizado exitosamente');
        console.log('✅ Campo porcentaje configurable agregado');
        console.log('✅ Cálculo inverso implementado: porcentaje → honorarios');
        console.log('✅ Fórmula: Honorarios = Arancel ÷ Porcentaje × 100');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error actualizando admin-chp.html:', error.message);
        return false;
    }
}

updateAdminCHPWithPorcentaje();