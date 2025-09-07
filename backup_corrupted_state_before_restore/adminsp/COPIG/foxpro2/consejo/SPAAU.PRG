procedure spaau
*actualizacion de universidades
@04,01 clear to 23,78
@04,25 say 'ACTUALIZACION DE UNIVERSIDADES'
@06,22 say 'CODIGO    NOMBRE'
select 1
use spuniv order cod
wsigue='S'
wcod=0
wnom=space(30)
do while wsigue='S'
   @23,01 say 'Indique el C¢digo, <F1> para ayuda o <ESC> para salir'
   @08,23 get wcod pict '999'
   read
   @23,01 clear to 23,78
   @08,28 clear to 08,78
   if lastkey()<>27
      if lastkey()=28
         @23,01 say 'Seleccione una entidad y oprima <ESC>'
         define window pent from 10,20 to 20,60 title 'ENTIDADES'
         activate window pent
         select 1
         brow in pent
         deactivate window pent
         @23,01 clear to 23,78
         wcod=cod
         wnom=nom
         @08,23 say wcod pict '999'
      endif
      seek(wcod)
      if found()
         wnom=nom
         @08,29 say wnom
         wop=1
         @23,22 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
         read
         if wop=2
            do modifica
         else
            if wop=3
               do borrar
            endif      
         endif          
      else
         @08,29 say 'no existe'
         wop=1
         @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
         read
         if wop=2
            do ingre
         endif          
      endif
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure modifica
@08,29 get wnom pict '@!'
read
replace nom with wnom
@23,01 clear to 23,78
return

procedure borrar
delete
return

procedure ingre
@08,29 get wnom pict '@!'
read
append blank
replace cod with wcod
replace nom with wnom
return

