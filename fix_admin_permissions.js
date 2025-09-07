const fs = require('fs');

function fixAdminPermissions() {
    console.log('🔧 CORRECCIÓN DE PERMISOS ADMIN');
    console.log('==============================\n');
    
    try {
        // 1. Backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `./server.js.backup.permissions.${timestamp}`;
        
        const content = fs.readFileSync('./server.js', 'utf8');
        fs.writeFileSync(backupPath, content);
        console.log(`✅ Backup creado: ${backupPath}`);
        
        // 2. Buscar la función requirePermission
        const requirePermissionRegex = /function requirePermission\(resource, action\) \{[\s\S]*?^\}/m;
        const match = content.match(requirePermissionRegex);
        
        if (!match) {
            console.log('❌ No se encontró la función requirePermission');
            return false;
        }
        
        console.log('✅ Función requirePermission encontrada');
        
        // 3. Nueva función que permite acceso total al super admin
        const newRequirePermission = `function requirePermission(resource, action) {
    return async (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        
        try {
            const user = req.session.user;
            
            // SUPER ADMIN tiene acceso total a todo
            if (user.role === 'super_admin') {
                console.log('🔑 Super admin acceso otorgado para:', \`\${resource}:\${action}\`);
                req.userId = user.id;
                req.userType = 'admin';
                req.userRoles = { role_type: 'super_admin', permissions: ['*'] };
                return next();
            }
            
            const userType = user.role === 'profesional' ? 'profesional' : 'admin';
            const userRoles = await getUserRoles(user.id, userType);
            
            // Almacenar información de roles en la request para uso posterior
            req.userRoles = userRoles;
            req.userId = user.id;
            req.userType = userType;
            
            if (hasPermission(userRoles, resource, action)) {
                return next();
            } else {
                return res.status(403).json({ 
                    error: 'Acceso denegado - Permisos insuficientes',
                    required: \`\${resource}:\${action}\`,
                    user_role: userRoles.role_type
                });
            }
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    };
}`;
        
        // 4. Reemplazar la función
        const newContent = content.replace(requirePermissionRegex, newRequirePermission);
        
        // 5. Verificar que se hizo el reemplazo
        if (newContent === content) {
            console.log('❌ No se pudo hacer el reemplazo');
            return false;
        }
        
        console.log('✅ Función requirePermission actualizada');
        
        // 6. También buscar y corregir variables con sufijos incorrectos
        let finalContent = newContent;
        
        // Corregir user_51, user_XX etc.
        const userVarRegex = /const user_\d+ = req\.session\.user;/g;
        finalContent = finalContent.replace(userVarRegex, 'const user = req.session.user;');
        
        // Corregir referencias user_XX por user
        const userRefRegex = /user_\d+\./g;
        finalContent = finalContent.replace(userRefRegex, 'user.');
        
        console.log('✅ Variables de usuario corregidas');
        
        // 7. Escribir archivo
        fs.writeFileSync('./server.js', finalContent);
        console.log('✅ server.js actualizado');
        
        // 8. Validar sintaxis
        try {
            require('./server.js');
            console.log('✅ Sintaxis válida');
        } catch (error) {
            console.error('❌ Error de sintaxis:', error.message);
            // Restaurar backup
            fs.writeFileSync('./server.js', content);
            console.log('🔄 Backup restaurado');
            return false;
        }
        
        console.log('\\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE');
        console.log('🔄 REINICIA EL SERVIDOR para aplicar cambios');
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        return false;
    }
}

fixAdminPermissions();