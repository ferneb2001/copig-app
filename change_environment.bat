@echo off
echo 🔧 COPIG - Selector de Entorno
echo ═══════════════════════════════════

echo 1. Development (Puerto 3030)
echo 2. Staging (Puerto 4040)  
echo 3. Production (Puerto 8080)
echo.

set /p choice="Seleccione entorno (1-3): "

if "%choice%"=="1" (
    echo 🛠️ Configurando DEVELOPMENT...
    copy config.json config.backup.json
    node -e "const dev = require('./config.environments.json').development; require('fs').writeFileSync('./config.json', JSON.stringify(dev, null, 2));"
    echo ✅ Entorno DEVELOPMENT activado
) else if "%choice%"=="2" (
    echo 🧪 Configurando STAGING...
    copy config.json config.backup.json
    node -e "const staging = require('./config.environments.json').staging; require('fs').writeFileSync('./config.json', JSON.stringify(staging, null, 2));"
    echo ✅ Entorno STAGING activado
) else if "%choice%"=="3" (
    echo 🏢 Configurando PRODUCTION...
    copy config.json config.backup.json
    node -e "const prod = require('./config.environments.json').production; require('fs').writeFileSync('./config.json', JSON.stringify(prod, null, 2));"
    echo ✅ Entorno PRODUCTION activado
)

echo.
echo 🚨 IMPORTANTE: Reiniciar el servidor para aplicar cambios
pause
