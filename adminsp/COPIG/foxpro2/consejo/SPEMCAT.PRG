procedure spemcat
*actualizacion del archivo de codigos de actividad empresas
@04,01 clear to 23,78
@04,30 say 'CODIGOS ACTIVIDAD EMPRESAS'
@06,02 say 'Cod.Actividad'
wcod=0
wnom=space(30)
wagrupa=0
wpadron=space(3)
wsigue='S'
select 1
use spemcac order emactc
do while wsigue='S'
   @23,01 say 'Indique cod.activ., (F1> ayuda o <ESC> para salir'
   @06,12 get wcod pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      if lastkey()=28
         define window pcur from 08,20 to 22,60 title 'ACTIVIDADES      '
         activate window pcur
         select 1
         brow in window pcur
         deactivate window pcur
         wcod=emactc
         wnom=emactn
         wagrupa=emactg
         wpadron=emactp
         @06,12 say wcod pict '999'
         @06,16 say wnom
         @07,20 say wagrupa pict '999'
         @07,30 say wpadron
      endif   
      select 1
      seek(wcod)
      if found()
         wnom=emactn
         @06,16 say emactn
         wop=1
         @23,30 get wop pict '@*H \<Salir;\<Modificar' size 1,1
         read
         if wop=2
            do modcur
         endif   
      else
         wop=1
         @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
         read
         if wop=2
            do ingrcur
         endif   
      endif  
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure ingrcur
select 1
@23,01 say 'Indique la descripci¢n de la actividad, agrupamiento y padr.'
@06,16 get wnom pict '@!'
@07,20 get wagrupa pict '999'
@07,30 get wpadron 
read
append blank
replace emactc with wcod
replace emactn with wnom
replace emactg with wagrupa
replace emactp with wpadron
return

procedure modcur
select 1
@23,01 say 'Indique la descripci¢n de la actividad, agrupamiento y padr.'
@06,16 get wnom
@07,20 get wagrupa
@07,30 get wpadron
read
replace emactn with wnom
replace emactg with wagrupa
replace emactp with wpadron
return
