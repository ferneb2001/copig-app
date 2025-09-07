procedure spaci
@04,01 clear to 23,78
@04,20 say 'CONSULTAS AL ARCHIVO DE INCUMBENCIAS'
set heading off
set memowidth to 77
select 1
use spincumb index spincumb
select 2
use spente order nombre
select 3
use spuniv order cod
select 4
use sptitu order titdesc
wtit=space(3)
went=0
wtitdesc=space(20)
wop=space(2)
@23,01 say 'Seleccione un titulo y oprima <ESC>'
define window ptit from 06,20 to 21,60 title 'TITULOS'
activate window ptit
brow in ptit
deactivate window ptit
wtit=titulo
wtitdesc=titdesc
@23,01 clear to 23,78
select 3
@23,01 say 'Seleccione una Universidad y oprima <ESC>'
define window pent from 06,20 to 21,60 title 'UNIVERSIDADES'
activate window pent
brow in pent 
deactivate window pent
@23,01 clear to 23,78
went=0
wuniv=cod
wkey=wtit+str(went,3)+str(wuniv,3)
@23,01 clear to 23,78
*@23,01 say wkey
SELECT 1
seek(wkey)
if found()
  * @23,01 say 'Oprima Ctrl+F10 para ampliar la ventana y <ESC> para salir '
   @05,02 say ' '
   *display field incumb off    
   modify memo incumb noedit
   wop=1
   @23,01 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
   read
   if wop=2
      set memowidth to 70
      _ploffset=03
      _pquality=.T.
      list field incumb for titulo=wtit and univer=wuniv off to printer
      _ploffset=0
      _pquality=.F.
   endif   
   close memo incumb
   *read
else
   @05,01 clear to 22,77
   @23,10 say 'No existe'
   read
endif      
@04,01 clear to 23,78
return