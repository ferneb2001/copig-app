const fs = require('fs');

console.log('🔧 FIX MÍNIMO Y SEGURO PARA CHP...');
console.log('════════════════════════════════════');

try {
    let content = fs.readFileSync('./admin.html', 'utf8');
    
    // Solo verificar que existe la función loadSolicitudesCHP
    if (!content.includes('function loadSolicitudesCHP')) {
        console.log('❌ No existe loadSolicitudesCHP, agregando versión simple');
        
        const simpleFunction = `
        async function loadSolicitudesCHP() {
            console.log('Cargando CHP...');
            try {
                const response = await fetch('/api/admin/solicitudes-chp', { credentials: 'include' });
                const data = await response.json();
                console.log('CHP data:', data);
                
                const tbody = document.getElementById('chp-table-body');
                if (tbody && data.success && data.solicitudes) {
                    tbody.innerHTML = data.solicitudes.map(s => 
                        '<tr><td>' + (s.numero_solicitud || 'N/A') + '</td>' +
                        '<td>' + (s.cliente || 'Sin cliente') + '</td>' +
                        '<td>' + (s.profesional_nombre || 'Sin asignar') + '</td>' +
                        '<td>' + (s.proyecto || 'Sin proyecto') + '</td>' +
                        '<td>' + (s.estado || 'PENDIENTE') + '</td>' +
                        '<td>' + (s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString() : 'Sin fecha') + '</td>' +
                        '<td>' + (s.costo ? '$' + s.costo : 'Sin costo') + '</td>' +
                        '<td>Ver</td></tr>'
                    ).join('');
                    console.log('CHP renderizado:', data.solicitudes.length, 'items');
                } else {
                    console.log('No data or no tbody');
                }
            } catch (error) {
                console.error('Error CHP:', error);
            }
        }`;
        
        // Insertar antes del final del script
        const lastScriptIndex = content.lastIndexOf('</script>');
        if (lastScriptIndex !== -1) {
            content = content.slice(0, lastScriptIndex) + simpleFunction + '\n' + content.slice(lastScriptIndex);
            
            fs.writeFileSync('./admin.html', content);
            console.log('✅ Función CHP simple agregada');
        }
    } else {
        console.log('✅ loadSolicitudesCHP ya existe');
    }
    
    console.log('\n🎯 ESTADO:');
    console.log('Sistema restaurado + función CHP mínima');
    console.log('');
    console.log('📋 ACCIÓN:');
    console.log('🔄 Refrescar admin (Ctrl+F5)');
    console.log('🖱️ Probar "Solicitudes CHP"');
    console.log('👁️ Ver consola F12 para logs');
    
} catch (error) {
    console.error('❌ Error en fix mínimo:', error.message);
}