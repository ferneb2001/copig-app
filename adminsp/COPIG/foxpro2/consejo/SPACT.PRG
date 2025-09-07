procedure spact
@04,01 clear to 23,78
@04,30 say 'TITULOS PROFESIONALES'
select 1
use sptitu ORDER titulo
define window ptit from 06,20 to 22,60
activate window ptit
brow fields titulo, titdesc :H = 'Descripci¢n' in window ptit
deactivate window ptit
@04,01 clear to 23,78
return