# GUÍA DE DESPLIEGUE - WINDOWS SERVER 2022

## 🚨 PROBLEMA CONOCIDO: CACHÉ DE NAVEGADOR

### PROBLEMA
Durante el desarrollo se identificó que los navegadores pueden cachear agresivamente los archivos HTML del panel administrativo, causando que las actualizaciones no se vean inmediatamente.

### SOLUCIÓN IMPLEMENTADA
El servidor Express.js ahora incluye headers anti-caché para todos los archivos HTML del admin:

```javascript
// Headers anti-caché para archivos HTML críticos
app.use((req, res, next) => {
    if (req.path.includes('admin') && req.path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});
```

### VERIFICACIÓN EN PRODUCCIÓN
1. **Después de actualizar archivos del admin, verificar que los cambios se vean inmediatamente**
2. **Si un usuario reporta que no ve cambios recientes:**
   - Solicitar Ctrl+F5 (recarga forzada)
   - Si persiste: borrar caché del navegador
   - Como último recurso: modo incógnito

### ARCHIVOS AFECTADOS
- `admin.html`
- `admin-chp.html` 
- `user-management.html`
- Cualquier archivo HTML que contenga "admin" en la ruta

### MONITOREO
- Los headers se aplican automáticamente
- No requiere configuración adicional
- Funciona en Chrome, Firefox, Edge

## 📋 CHECKLIST POST-DESPLIEGUE

□ Servidor iniciado sin errores
□ Páginas admin cargan sin caché (verificar con F12 → Network)
□ Funcionalidad CHP completa operativa
□ Login unificado funcional
□ Base de datos conectada

## 🔧 COMANDOS DE EMERGENCIA

### Reiniciar servidor
```batch
taskkill /f /im node.exe
cd C:\copig-app
node server.js
```

### Verificar puerto ocupado
```batch
netstat -ano | findstr :3030
```

### Backup rápido
```batch
copy admin-chp.html admin-chp-backup-%date%.html
```

## 📞 CONTACTO TÉCNICO
En caso de problemas críticos, contactar al equipo de desarrollo con:
1. Descripción del problema
2. Screenshot del error
3. Log del servidor (si disponible)
4. Navegador y versión utilizados

---
*Fecha: 6 de Septiembre 2025*
*Autor: Sistema COPIG - Desarrollo*