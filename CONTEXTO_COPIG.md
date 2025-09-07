# CONTEXTO COPIG PARA CURSOR + CLAUDE

## SISTEMA ACTUAL
- **5,764 profesionales** activos importados
- **1,504 empresas** registradas  
- **2,343 representantes técnicos** funcionando
- **124,180 pagos históricos** en sistema financiero
- **Sistema CHP** completo con PostgreSQL
- **Login unificado** profesionales/staff/admin

## BASE DE DATOS
- **PostgreSQL**: copig_moderno
- **Host**: localhost:5432
- **Usuario**: postgres
- **Password**: ansiktet1969

## SERVIDOR
- **Puerto**: 3030
- **Comando**: node server.js
- **URLs principales**:
  - Panel admin: http://localhost:3030/admin
  - Login: http://localhost:3030/
  - Empresas: http://localhost:3030/empresas

## CREDENCIALES ADMIN
- **Super Admin**: 20562024 / ansiktet1969

## TABLAS PRINCIPALES
- copig.profesionales (5,764 registros)
- copig.empresas (1,504 registros)  
- copig.matriculas
- copig.representantes_tecnicos (2,343 registros)
- copig.pagos_historicos (124,180 registros)
- copig.admin_users
- copig.solicitudes_chp

## ESTADO ACTUAL DEL DESARROLLO
✅ Login unificado funcionando
✅ Panel admin con profesionales/empresas
✅ Sistema financiero bidireccional
✅ Sistema CHP implementado
✅ Representantes técnicos activos
✅ Importaciones masivas completadas

## FUNCIONALIDADES PENDIENTES
- Reportes y estadísticas
- Gestión de documentos profesional
- Sistema de notificaciones
- Certificados automáticos
- Integración con sistemas externos

## COMANDOS ÚTILES
```bash
# Iniciar servidor
node server.js

# Conectar a BD
psql -U postgres -d copig_moderno

# Backup
node backup_script.js
```

## ARQUITECTURA
- **Backend**: Node.js + Express
- **Frontend**: HTML + JavaScript vanilla
- **Base de datos**: PostgreSQL
- **Sesiones**: express-session
- **Autenticación**: bcryptjs

## POLÍTICAS DE DESARROLLO
1. Backup antes de cambios críticos
2. Verificar sintaxis antes de aplicar
3. Probar funcionalidad después de cambios
4. Mantener compatibilidad con datos existentes
5. Documentar cambios importantes

---
*Generado para migración de Claude Code (VSCode) a Cursor Business*
*Fecha: ${new Date().toLocaleDateString()}*