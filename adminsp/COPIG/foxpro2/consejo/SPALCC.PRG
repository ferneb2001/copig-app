procedure spalcc
*listado de prof.con cursos de postgrado
@04,01 clear to 23,78
@04,15 say 'LISTADO DE PROFESIONALES CON CURSOS DE PROST-GRADO'
@12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
*set exclusive off
select 1
use spcursos
select 2
use spmatri index spmatri
select 3
use spprof index spprof
select 4
use sptempo
set safety off
set exclusive on 
zap
select 1
go top
do while not eof()
   wkey=str(numero,5)+catego
   select 2
   seek(wkey)
   if found()
      wkey2=str(dctipo,1)+str(dcnro,8)
      select 3
      seek(wkey2)
      if found()
*      	 if dpto = 16 or dpto = 17 or dpto = 18
           select 4
           append blank
           replace numero with a.numero
           replace catego with a.catego
           replace titulo with a.titulo
           replace curso  with a.curso
           replace dctipo with b.dctipo
           replace dcnro  with b.dcnro
           replace habili with b.habili
           replace condic with b.condic
           replace nombre with c.nombre
           replace domici with c.domici
           replace provin with c.provin
           replace dpto   with c.dpto
           replace locali with c.locali
*         endif   
      endif
   endif
   select 1
   skip
enddo
select 4
sort to sptempos on nombre
set safety on
use sptempos
go top
select 3
use sptitu order titulo
select 4
@12,01 clear to 12,78
@12,28 say 'En proceso de impresion'
set console off
set printer on
set device to printer
???chr(27)+chr(67)+chr(72)
whoja=0
wlin=0
do while not eof()
   if whoja=0
      do titulos
   endif
   if wlin>60
      do titulos
   endif      
   ?numero  pict '99999' at 3
   ??catego pict 'XX' at 12
   ??nombre           at 18
   select 3
   seek(d.titulo)
   if found()
      ?? c.titdesc at 50 
   endif
   select 4   
   skip
   wlin=wlin+1
enddo
eject
close all
return

procedure titulos
if whoja>0
   eject
endif   
whoja=whoja+1
?'LISTADO DE PROFESIONALES CON CURSOS DE POST-GRADO' at 16
?
?'MATRIC.CATEG. NOMBRE' at 3
??'TITULO' at 50
?
wlin=5
return