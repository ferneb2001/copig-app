procedure spaae
*actualizacion de entidades educativas
@04,01 clear to 23,78
@04,22 say 'ACTUALIZACION DE ENTIDADES EDUCATIVAS'
@06,12 say 'CODIGO    NOMBRE                       COD.NIVEL'
select 1
use spente order codigo
wsigue='S'
wcod=space(4)
wnom=space(30)
wuniv=0
do while wsigue='S'
   @23,01 say 'Indique el C¢digo, <F1> para ayuda o <ESC> para salir'
   @08,13 get wcod pict 'XXXX'
   read
   @23,01 clear to 23,78
   @08,28 clear to 08,78
   if lastkey()<>27
      if lastkey()=28
         @23,01 say 'Seleccione una entidad y oprima <ESC>'
         define window pent from 10,15 to 20,65 title 'ENTIDADES'
         activate window pent
         select 1
         brow in pent
         deactivate window pent
         @23,01 clear to 23,78
         wcod=codigo
         wnom=nombre
         @08,23 say wcod pict 'XXXX'
      endif
      seek(wcod)
      if found()
         wnom=nombre
         @08,19 say wnom
         @08,53 say univer
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
         @08,29 say 'no existe                    '
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
@08,19 get wnom pict '@!'
read
@23,01 say 'Coloque cod. Nivel 1=Universitario, 2=Tecnico, 3=Municipal/Consejos'
*define window pent from 10,15 to 20,65 title 'UNIVERSIDADES'
*activate window pent
*select 2
*use spuniv order cod
*brow in pent
*deactivate window pent
@08,53 get wuniv pict '999'
read
@23,01 clear to 23,78
*wuniv=cod
*@08,53 say wuniv pict '999'
select 1
replace nombre with wnom
replace univer with wuniv
@23,01 clear to 23,78
return

procedure borrar
delete
return

procedure ingre
@08,19 get wnom pict '@!'
read
@23,01 say 'Coloque cod. Nivel 1=Universitario, 2=Tecnico, 3=Municipal/Consejos'
*@23,01 say 'Seleccione una Universidad y oprima <ESC>'
*define window pent from 10,15 to 20,65 title 'UNIVERSIDADES'
*activate window pent
*select 2
*use spuniv order cod
*brow in pent
*deactivate window pent
@08,53 get wuniv pict '999'
read
*@23,01 clear to 23,78
*wuniv=cod
@08,53 say wuniv pict '999'
select 1
append blank
replace codigo with wcod
replace nombre with wnom
replace univer with wuniv
return

