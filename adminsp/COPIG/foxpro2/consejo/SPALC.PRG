procedure spalc
*listado de prof.con cursos de postgrado
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE PROFESIONALES CON CURSOS DE PROST-GRADO'
@06,15 get wope pict '@*V \Estructuras antis.;\<Seguridad e Hig.en Trabajo;\<Higiene y Seg.Ind.;\<Esp.Explot.Petrol.;\<Ing.Sanitaria;\<Todas' size 1,1
read
@12,15 get whab pict '@*H \Habilitados;\<No Habilitados;\<Todos' size 1,1
read
if whab = 1
   whabili='S'
else
   if whab = 2
      whabili='N'
   else
      whabili=' '
   endif
endif            
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive on
   select 5
   use spdescur ORDER CURSO
   select 1
   use spcursos
   select 2
   use spmatri index spmatri
   select 3
   use spprof index spprof
   select 4
   use sptempo
   set safety off 
   zap
   select 1
   go top
   do while not eof()
      wposcu=0
      if wope = 6
         wposcu = 1
         wnom=space(20)
      else
         if wope = curso
            wposcu = 1
            select 5
            seek(curso)
            if found()
               wnom=descrip
            else
               wnom=space(20)
            endif
            select 1      
         endif
*      else
*         if wope = 2
*            if curso = 2
*               wposcu= 1
*            endif
*         else
*            if wope = 3
*               if curso = 4
*                  wposcu=1
*               endif
*            else     
*               wposcu=1
*            endif
*         endif
      endif
      if wposcu = 1                  
            wkey=str(numero,5)+catego
            select 2
            seek(wkey)
            if found()
               wkey2=str(dctipo,1)+str(dcnro,8)
               wposit=0
               if whab = 1
                  if habili > 2013 and condic < '2'
                     wposit=1
                  endif   
               else
                  if whab = 2
                     if habili < 2014 and condic < '2'
                        wposit=1
                     endif
                  else
                     wposit = 1
                  endif
               endif
               if wposit = 1
              if a.catego='A '              
                   select 3
                   seek(wkey2)
                   if found()
*    		       if dpto = 16 or dpto = 17 or dpto = 18
                        select 4
                        append blank
                        replace numero with a.numero
                        replace catego with a.catego
                        replace titulo with b.titulo
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
                   endif
                   endif   
*               endif
            endif
         endif     
      endif
      select 1
      skip
   enddo
   select 4
   sort to sptempos on nombre
   set safety on
wfin=1
if wfin<>1   
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
   ??CHR(15)
   whoja=0
   wlin=0
   do while not eof()
      if whoja=0
         do titulos
      endif
      if wlin>67
         do titulos
      endif      
      ?numero  pict '99999' 
      ??catego pict 'XX' at 6
      ??nombre           at 9
      select 3
      seek(d.titulo)
      if found()
         ?? c.titdesc at 40 
      endif
      wcurso=space(20)
      if wope = 6
          select 5
          seek(d.curso)
          if found()
             wcurso=descrip
          endif
       endif      
*         if d.curso = 1
      ?? wcurso      at 71
*         else
*            if d.curso = 2
*               ?? 'Hig/S.Trab.' at 71
*            else
*              if d.curso = 3
*                 ?? 'Expl.Petr.' at 71
*              else
*                 if d.curso = 4
*                    ?? 'Hig.Seg.Ind.' at 71
*                 endif
*              endif          
*            endif
*         endif
*      endif         
      select 4   
      skip
      wlin=wlin+1
   enddo
   ??CHR(18)
   eject
   set printer off
   set device to screen
endif
endif
@04,01 clear to 23,78
close all
return

procedure titulos
if whoja>0
   eject
endif   
whoja=whoja+1
?'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
?'Mitre 617 - 1 piso  - 5500-MENDOZA'
?'LISTADO DE PROFESIONALES CON CURSOS DE POST-GRADO' at 16
if wope = 1
   ?'EN ESTRUCTURAS ANTISISMICAS' AT  26
else
   if wope = 2
      ? 'EN HIGIENE Y SEGURIDAD EN EL TRABAJO' AT 26
   ELSE
      if wope = 3
         ? 'EN HIGIENE Y SEG. INDUSTRIAL  ' AT 26
      ELSE   
         IF WOPE = 4
            ? 'ESPEC.DE EXPLOTAC.PETROLERA' AT 26
         ELSE
            IF WOPE = 5
               ? '  Ingenieria Sanitaria '  AT 26
            else
               if wope=6   
                  ? '                        '  AT 26
               endif   
            ENDIF
         ENDIF      
      ENDIF
   endif
endif
if whab = 1
   ? 'Habilitados ' at 30
else
   if whab = 2
      ? ' NO habilitados ' at 30
   else
      ? ' Completo       ' at 30
   endif
endif                  
?? 'Al: ' AT 55
?? wfecha
?? 'Hoja: ' at 70
?? whoja pict '999'
?'MATR.CAT.  APELLIDO y NOMBRE' 
??'TITULO' at 50
??'CURSO' at 73
?
wlin=6
return