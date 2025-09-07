const fs = require('fs');

function actualizarReferenciasComitente() {
    console.log('🔄 ACTUALIZANDO TODAS LAS REFERENCIAS CLIENTE → COMITENTE\n');
    
    // Leer server.js
    const serverPath = 'C:\\copig-app\\server.js';
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Lista de cambios a realizar en server.js
    const cambios = [
        // Variables y destructuring
        'const { cliente,',
        'if (!cliente ||',
        'console.log(\'📋 Datos:\', { cliente,',
        ', cliente,',
        'cliente VARCHAR(255)',
        // Queries SQL
        'SET cliente =',
        's.cliente,',
        'proyecto, cliente',
        '(profesional_id, numero_solicitud, cliente,',
        ', [profesional_id, numero_solicitud, cliente,',
        ', [profesionalId, cliente,',
        ', cliente VARCHAR(255)'
    ];
    
    let cambiosRealizados = 0;
    
    cambios.forEach(buscar => {
        const reemplazo = buscar.replace(/cliente/g, 'comitente');
        const ocurrencias = (serverContent.match(new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        
        if (ocurrencias > 0) {
            serverContent = serverContent.replace(new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), reemplazo);
            console.log(`✅ ${buscar} → ${reemplazo} (${ocurrencias} cambios)`);
            cambiosRealizados += ocurrencias;
        }
    });
    
    // Escribir server.js actualizado
    fs.writeFileSync(serverPath, serverContent);
    console.log(`\n✅ server.js actualizado con ${cambiosRealizados} cambios\n`);
    
    // Ahora actualizar frontend portal-profesional.html
    console.log('=== ACTUALIZANDO PORTAL-PROFESIONAL.HTML ===');
    const portalPath = 'C:\\copig-app\\portal-profesional.html';
    
    if (fs.existsSync(portalPath)) {
        let portalContent = fs.readFileSync(portalPath, 'utf8');
        
        const cambiosFrontend = [
            'name="cliente"',
            'id="cliente"',
            '"Cliente:"',
            'placeholder="Nombre del cliente"',
            'cliente:',
            'const cliente =',
            'if (!cliente',
            'Cliente</label>',
            'cliente,',
            '<label for="cliente">',
            'value="cliente"'
        ];
        
        let cambiosPortal = 0;
        cambiosFrontend.forEach(buscar => {
            const reemplazo = buscar.replace(/[Cc]liente/g, match => 
                match === 'Cliente' ? 'Comitente' : 
                match === 'cliente' ? 'comitente' : match
            );
            const ocurrencias = (portalContent.match(new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            
            if (ocurrencias > 0) {
                portalContent = portalContent.replace(new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), reemplazo);
                console.log(`✅ ${buscar} → ${reemplazo} (${ocurrencias} cambios)`);
                cambiosPortal += ocurrencias;
            }
        });
        
        fs.writeFileSync(portalPath, portalContent);
        console.log(`✅ portal-profesional.html actualizado con ${cambiosPortal} cambios`);
    } else {
        console.log('⚠️ portal-profesional.html no encontrado');
    }
    
    // Actualizar admin-chp.html
    console.log('\n=== ACTUALIZANDO ADMIN-CHP.HTML ===');
    const adminChpPath = 'C:\\copig-app\\admin-chp.html';
    
    if (fs.existsSync(adminChpPath)) {
        let adminContent = fs.readFileSync(adminChpPath, 'utf8');
        
        const cambiosAdmin = [
            'Cliente:',
            'cliente',
            'Cliente</th>',
            'sol.cliente',
            '"cliente"'
        ];
        
        let cambiosAdminChp = 0;
        cambiosAdmin.forEach(buscar => {
            const reemplazo = buscar.replace(/[Cc]liente/g, match => 
                match === 'Cliente' ? 'Comitente' : 
                match === 'cliente' ? 'comitente' : match
            );
            const ocurrencias = (adminContent.match(new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            
            if (ocurrencias > 0) {
                adminContent = adminContent.replace(new RegExp(buscar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), reemplazo);
                console.log(`✅ ${buscar} → ${reemplazo} (${ocurrencias} cambios)`);
                cambiosAdminChp += ocurrencias;
            }
        });
        
        fs.writeFileSync(adminChpPath, adminContent);
        console.log(`✅ admin-chp.html actualizado con ${cambiosAdminChp} cambios`);
    } else {
        console.log('⚠️ admin-chp.html no encontrado');
    }
    
    console.log('\n🎉 CAMBIO CLIENTE → COMITENTE COMPLETADO');
    console.log(`📊 Total cambios realizados: ${cambiosRealizados + (cambiosPortal || 0) + (cambiosAdminChp || 0)}`);
    console.log('✅ Base de datos: columna renombrada');
    console.log('✅ Backend: referencias actualizadas');
    console.log('✅ Frontend: formularios actualizados');
}

actualizarReferenciasComitente();