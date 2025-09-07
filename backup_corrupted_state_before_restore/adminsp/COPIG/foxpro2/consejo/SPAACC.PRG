procedure spaacc
*actualizacion archivo de cursos
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION DE CURSOS DE POSTGRADO'
@08,02 say 'MATRICULA        CATEGORIA    NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
select 1 
use spprof index spprof
select 2
use spmatri index spmatri
select 3
use spdescur order curso
select 4
use spcursos index spcursos
do while wsigue='S'
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @08,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 say 'Indique la categoria'
      @08,29 get wcat pict '!!'
      read
      @23,01 clear to 23,78
      wkey=str(wmatri,5)+wcat
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         seek(wkey1)
         if found()
            @08,39 say nombre
            @23,01 say 'Seleccione un curso y oprima <ESC> para salir'
            select 3
            define window pcur from 10,20 to 20,58
            activate window pcur
            brow in window pcur
            deactivate window pcur
            @23,01 clear to 23,78
            @12,02 say 'CURSO'
            @12,08 say curso
            @12,12 say descrip
            @12,44 say 'FECHA '
            @23,01 say 'Indique la fecha del curso'
            @12,50 get wfecha
            read
            wop=1
            @23,01 clear to 23,78
            @23,30 get wop pict '@*H \<Ingresar;\<Salir';
                   size 1,1
            read
            @23,01 clear to 23,78
            if wop=1
               do ingresar
            endif           
         else
            @08,39 say 'No existe'
         endif      
      else
         @08,39 say 'No existe'
      endif
   else
      wsigue='N'
   endif       
enddo
@04,01 clear to 23,78
close all
return

procedure ingresar
select 4
append blank
replace numero with wmatri
replace catego with wcat
replace titulo with b.titulo
replace curso  with c.curso 
replace fechegr with wfecha
return
