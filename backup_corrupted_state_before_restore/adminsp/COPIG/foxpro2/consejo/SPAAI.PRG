procedure spaai
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION DEL ARCHIVO DE INCUMBENCIAS'
set heading off
set memowidth to 70
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
*wnoment=nombre
wuniv=cod
wkey=wtit+str(went,3)+str(wuniv,3)
@23,01 clear to 23,78
*@23,01 say wkey
SELECT 1
seek(wkey)
if found()
   @23,01 say 'Oprima Ctrl+W para guardar los cambios o Ctrol+Q para salir sin modificar'
   modify memo incumb   
   close memo incumb
else
   @05,01 clear to 22,77
   @23,10 say 'No existe, la ingresa??(SI/NO)'
   @23,41 get wop pict '!!'
   read
   if wop='SI'
      @23,01 say 'Oprima Ctrl+W para guardar los cambios o Ctrl+Q para salir sin modificar'
      append blank
      replace entidad with went
      replace titulo  with wtit
      replace univer  with wuniv
      modify memo incumb   
      close memo incumb
   endif   
endif      
@04,01 clear to 23,78
return