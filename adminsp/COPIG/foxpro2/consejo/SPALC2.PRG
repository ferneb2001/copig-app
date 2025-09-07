procedure spalc2
*listado de prof.con cursos de postgrado
*  con domicilio 
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE PROFESIONALES CON CURSOS DE PROST-GRADO'
@06,15 get wope pict '@*H \Estructuras antis.;\<Higiene y Seg.Ind.;\<Todas' size 1,1
read
@08,15 get whab pict '@*H \Habilitados;\<No Habilitados;\<Todos' size 1,1
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
   select 1
   use spcursos
   select 2
   use spmatri index spmatri.idx
   select 3
   use spprof index spprof.idx
   select 4
   use sptlmu1
   set safety off 
   zap
   select 1
   go top
   do while not eof()
      wposcu=0
*      if titulo = '801'
         if wope = 1
            if curso = 1
               wposcu = 1
            endif
         else
            if wope = 2
               if curso = 2
                  wposcu= 1
               endif
            else
               wposcu=1
            endif
         endif
*      endif   
      if wposcu = 1                  
            wkey=str(numero,5)+catego
            select 2
            seek(wkey)
            if found()
               wkey2=str(dctipo,1)+str(dcnro,8)
               wposit=0
               if whab = 1
                  if habili > 2009 and condic < '2'
                     wposit=1
                  endif   
               else
                  if whab = 2
                     if habili < 2010 and condic < '2'
                        wposit=1
                     endif
                  else
                     wposit = 1
                  endif
               endif
               if wposit = 1              
                select 3
                seek(wkey2)
                if found()
			      wnomdpto=space(15)
			      wnomlocali=space(15)
			      select 6
			      use splocal order cod
			      seek(c.locali)
			      if found()
			         wnomlocali=nombre
			      else
			         wnomlocali=space(15)
			      endif
			      select 6
			      use spdpto order dpto
			      seek(c.dpto)
			      if found()
			         wnomdpto=nombre
			      else
			         wnomdpto=space(15)
			      endif
			      wprovc=space(15)
*			      if str(d.provin,3)<> '  1'
			         select 7
			         use spprov order prov
			         seek(c.provin)
			         if found()
			            wprovc=nombre
			         endif
*			      endif
                   select 3
*                   seek(wkey2)
*                   if found()
*                      if dpto = 13 or dpto = 14 or dpto = 15
                        select 4
                        append blank
                        replace numero with a.numero
                        replace catego with a.catego
                        replace titulo with b.titulo
                        replace titu   with str(a.curso)
                        replace dctipo with b.dctipo
                        replace dcnro  with b.dcnro
                        replace habili with b.habili
                        replace condic with b.condic
                        replace nombre with c.nombre
                        replace domici with c.domici
                   *     replace provin with c.provin
                   *     replace dpto   with c.dpto
                   *     replace locali with c.locali
                        replace telef  with alltrim(c.telef)
                        replace provin with wprovc
                        replace dpto   with wnomdpto
                        replace locali with wnomlocali
*                     endif   
                   endif   
               endif
            endif  
      endif
      select 1
      skip
   enddo
*   select 4
*   sort to sptempos on nombre
*   set safety on
*   use sptempos
*   go top
*   select 3
*   use sptitu order titulo
*   select 4
*   @12,01 clear to 12,78
*   @12,28 say 'En proceso de impresion'
*   set console off
*   set printer on
*   set device to printer
*   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
*   whoja=0
*   wlin=0
*   do while not eof()
*      if whoja=0
*         do titulos
*      endif
*      if wlin>80
*         do titulos
*      endif
*      wnomdpto=space(15)
*      wnomlocali=space(15)
*      select 6
*      use splocal order cod
*      seek(d.locali)
*      if found()
*         wnomlocali=nombre
*      else
*         wnomlocali=space(15)
*      endif
*      select 6
*      use spdpto order dpto
*      seek(d.dpto)
*      if found()
*         wnomdpto=nombre
*      else
*         wnomdpto=space(15)
*      endif
*      wprovc=space(15)
*      if str(d.provin,3)<> '  1'
*         select 7
*         use spprov order prov
*         seek(d.provin)
*         if found()
*            wprovc=nombre
*         endif
*      endif
*      select 4
*      ?numero  pict '99999' 
*      ??catego pict 'XX' at 6
*      ??nombre           at 9
*      select 3
*      seek(d.titulo)
*      if found()
*         ?? c.titdesc at 40 
*      endif
*      if wope = 3
*         if d.titu  = 1
*            ?? 'Est.Ant. ' at 65
*         else
*            if d.titu  = 2
*               ?? 'Hig/S.Trab.' at 65 
*            endif
*         endif
*      endif
*      ?? ' '+d.domici
*      ?? ' '+d.telef
*      ?? ' '+rtrim(wnomlocali)+'-'+rtrim(wnomdpto)+' '+rtrim(wprovc)         
*      select 4   
*      skip
*      wlin=wlin+1
*   enddo
*   ??? chr(27)+chr(18)
*   ??? chr(27)+chr(50)
*   ??? chr(27)+chr(80)
*   eject
   set printer off
   set device to screen
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
?'Mitre 617 - P.Baja  - 5500-MENDOZA'
?'LISTADO DE PROFESIONALES CON CURSOS DE POST-GRADO' at 16
if wope = 1
   ?'EN ESTRUCTURAS ANTISISMICAS' AT  50
else
   if wope = 2
      ? 'EN HIGIENE Y SEGURIDAD EN EL TRABAJO' AT 50
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
?? 'Hoja: ' at 80
?? whoja pict '999'
?'MATR.CAT.  APELLIDO y NOMBRE' 
??'TITULO' at 50
if wope = 3
  ??'CURSO' at 73
endif
??'DOMICILIO ' AT 90
?
wlin=6
return