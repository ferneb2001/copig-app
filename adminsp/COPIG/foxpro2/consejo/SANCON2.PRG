procedure sancon2
@04,01 clear to 23,78
@04,30 say '  SANCIONES A NO PROFESIONALES'
select 4
use sancion
define window psan from 06,01 to 22,75
activate window psan
brow fields matric, catego, nombre, sanresol, sanferes in window psan
deactivate window psan
@04,01 clear to 23,78
return