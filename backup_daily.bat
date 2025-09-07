@echo off
echo 🔄 COPIG - Backup Automático Iniciado...
echo ═══════════════════════════════════════════

set BACKUP_DIR=C:\copig-backups
set DATE=%date:~6,4%%date:~3,2%%date:~0,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%DATE%_%TIME: =0%

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 📊 Creando backup de base de datos...
pg_dump -U postgres -h localhost -d copig_moderno > "%BACKUP_DIR%\copig_backup_%TIMESTAMP%.sql"

echo 📁 Creando backup de archivos...
xcopy /s /e "C:\copig-app\*.js" "%BACKUP_DIR%\files_%TIMESTAMP%\"
xcopy /s /e "C:\copig-app\*.html" "%BACKUP_DIR%\files_%TIMESTAMP%\"
xcopy /s /e "C:\copig-app\*.json" "%BACKUP_DIR%\files_%TIMESTAMP%\"

echo ✅ Backup completado: %BACKUP_DIR%\copig_backup_%TIMESTAMP%.sql
echo 💾 Archivos respaldados en: %BACKUP_DIR%\files_%TIMESTAMP%\
echo.
echo 🎯 Para restaurar usar: psql -U postgres -d copig_moderno < backup_file.sql
pause
