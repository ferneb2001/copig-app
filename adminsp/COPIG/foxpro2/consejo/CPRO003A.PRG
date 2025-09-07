procedure cpro003a
*listado de padrones con padron creado
* nuevo dise¤o alfab‚tico total, sin titulos
set talk off
set delete on
set printer off
set device to screen
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PADRONES     '
close all
select 2
use PADRON
SORT to padrons on   padayn
do imprime
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use padrons
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif
   ???chr(27)+chr(67)+chr(72)
   wlin=0
   whoja=0
   wfecha='28 de Diciembre de 2009.-'
   correl=0
   wpaso=0
   wpadcod=space(1)
   wpadayn=space(35)  
   wtituac=space(35)
   wtitupr=space(35)
   do while .not. eof()
      if wpaso = 0
         wlin = 70   
         do titulos
         wpaso = 1
       endif
       if wlin > 66
            do titulos
       endif
         correl = correl+1
         ? correl pict '9999'  at 1
         ?? padmatri pict '99999'  at 5
         ?? padtitu at 15
	     ?? padayn  at 19
		 ?? paddocu  at 51
         wlin = wlin+3
         ? '....................' AT 59
         ?
*      endif
      skip
   enddo
   ?
   ? wfecha at 50
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 66
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
? 'Decreto Ley 3485/63   -  Ley 5908/92  -  Ley 6936/2001'
?
???CHR(27)+CHR(87)+CHR(1)
wtitupr="PROFESIONALES HABILTADOS-ASAMBLEA 2009"
? wtitupr  at 1
???chr(27)+chr(87)+chr(0)	                       
?'Hoja Nro.:' at 64
?? whoja pict '999'
? ' Ord. Matric.  CT  Apellido y Nombre'
?
wlin = 7
return

