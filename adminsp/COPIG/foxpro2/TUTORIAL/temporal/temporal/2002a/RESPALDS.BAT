@echo off
cls
echo.
echo.
echo.
echo.
echo.
echo    *** Proceso de Respaldo de Archivos de Usuario de GENESYS-Sueldos ***
echo.
echo.
echo          ( Primera parte - Copia de archivos a directorio Respaldo )
c:
cd \genesys\sueldos
if exist \respaldo\sueldos\parametx.dbf goto sigue
md \respaldo
md \respaldo\sueldos
:sigue
copy *.* \respaldo\sueldos
echo.
echo.
echo.
echo                  ( Segunda parte - respaldo a diskettes )
echo.
echo.                    
backup c:*.* a:
cls
