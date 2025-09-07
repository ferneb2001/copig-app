procedure spacl
@04,01 clear to 23,78
@04,29 say 'CONSULTA DE LOCALIDADES'
select 1
use splocal order nombre
select 2
use spdpto order dpto 
select 1
set relation to dpto into spdpto
define window pdpto from 06,15 to 22,65
activate window pdpto
brow fields cod, nombre, cpost, b.nombre :H='Dpto' nomodify  in window pdpto
deactivate window pdpto
@04,01 clear to 23,78
return