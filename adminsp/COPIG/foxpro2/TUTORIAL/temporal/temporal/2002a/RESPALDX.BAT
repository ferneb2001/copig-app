@echo off
cls
echo.
echo.
echo.
echo.
echo.
echo	    *** Proceso de Respaldo de Archivos de Usuario de GENESYS ***
echo.
echo.
echo	      ( Primera parte - Copia de archivos a directorio Respaldo)
g:
cd \genesys\usuario
if not exist \respaldo\genesys\parametr.dbf md \respaldo\genesys
copy *.* \respaldo\genesys
echo.
echo.
echo.
echo		      ( Segunda parte - Respaldo a diskettes )
echo.
echo.
backup g:*.* a:
cls
