procedure buscasan
parameters wmatric, wcateg
select 11
use spsanc index spsanc
@23,01 clear to 23,78
@23,01 say 'Oprima <ESC> para salir'
define window psanc from 09,5 to 22,75 title "Sanciones"
activate window psanc
browse fields santipo:H='Tipo',saninci:H='Inc.',sanresol:H='Resol.',sanferes:H='  Fecha',;
             sancnmat, sancpag;
   for matric=wmatric and catego=wcateg in psanc
   deactivate window psanc
@23,01 clear to 23,78
return