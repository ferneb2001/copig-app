procedure spaac
*actualizacion del archivo de cursos de postgrado
@04,01 clear to 23,78
@04,30 say 'CURSOS DE POST-GRADOS'
@06,02 say 'Cod.Curso'
wcod=0
wnom=space(30)
wsigue='S'
select 1
use spdescur order curso
do while wsigue='S'
   @23,01 say 'Indique cod.curso, <F1> ayuda o <ESC> para salir'
   @06,12 get wcod pict '999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      if lastkey()=28
         define window pcur from 08,20 to 22,60 title 'CURSOS POST-GRADO'
         activate window pcur
         select 1
         brow in window pcur
         deactivate window pcur
         wcod=curso
         wnom=descrip
         wotor=curotor
         @06,12 say wcod pict '999'
         @06,18 say wnom
         @06,40 say wotor
      endif   
      select 1
      seek(wcod)
      if found()
         wnom=descrip
         @06,18 say descrip
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
@23,01 say 'Indique la descripci¢n del curso'
@06,18 get wnom pict '@!'
read
append blank
replace curso with wcod
replace descrip with wnom
return

procedure modcur
select 1
@23,01 say 'Indique la descripci¢n del curso'
@06,18 get wnom
read
replace descrip with wnom
return
