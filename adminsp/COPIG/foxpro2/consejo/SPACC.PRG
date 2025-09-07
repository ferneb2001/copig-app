procedure spacc
@04,01 clear to 23,78
@04,31 say 'CURSOS DE POSTGRADO'
select 1
use spdescur
define window pcur from 06,20 to 22,60
activate window pcur
brow fields curso, descrip :H = 'Descripci¢n' in window pcur
deactivate window pcur
@04,01 clear to 23,78
return