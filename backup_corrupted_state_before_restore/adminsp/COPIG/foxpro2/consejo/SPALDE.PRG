procedure spalde
*listado de prof.con carnet depositado, fallecidos, etc. 
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE PROFESIONALES                          '
@06,15 get wope pict '@*H \Carnet Depositado.;\<Fallecido.;\<Todos' size 1,1
read
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive on
   select 1
   use spmatri index spmatri
   select 2
   use spprof index spprof
   select 3
   use sptempo2
   set safety off 
   zap
   select 1
   go top
   do while not eof()
      wposcu=0
*     @20, 1 say numero
*     @20, 7 say catego
      if wope = 1
         if condic = '2'
            wposcu = 1
         endif
      else
         if wope = 2
            if condic = '3'
               wposcu= 1
            endif
         else
            if condic = '2' or condic = '3'
               wposcu=1
            endif   
         endif
      endif
      if wposcu = 1                  
         wkey2=str(dctipo,1)+str(dcnro,8)
         @21, 30 say wkey2
         select 2
         seek(wkey2)
         @21, 30 clear to 21,78
         if found()
            select 3
            append blank
            replace numero with a.numero
            replace catego with a.catego
            replace titulo with a.titulo
            replace dctipo with a.dctipo
            replace dcnro  with a.dcnro
            replace habili with a.habili
            replace condic with a.condic
            replace nombre with b.nombre
            replace domici with b.domici
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace tmfech with b.fallec
         endif   
      endif
      select 1
      skip
   enddo
   select 3
   sort to sptempos on nombre
   set safety on
   use sptempos
   go top
   select 4
   use sptitu order titulo
   select 3
   @12,01 clear to 12,78
   @12,28 say 'En proceso de impresion'
   wtotal=0
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
      if wlin>66
         do titulos
      endif      
      ?numero  pict '99999' 
      ??catego pict 'XX' at 6
      ??nombre           at 9
      select 4
      seek(c.titulo)
      if found()
         ?? d.titdesc at 40 
      endif
      ?? c.tmfech at 71
      if wope = 3
         if c.condic = '2'
            ?? 'C.Dep.' at 79
         else
            if c.condic = '3'
               ?? 'Fall.' at 79 
            endif
         endif
      endif
      wtotal=wtotal+1         
      select 3   
      skip
      wlin=wlin+1
   enddo
   ?
   ?
   ? 'Cantidad de profesionales: ' at 10
   ?? wtotal at 42
    eject
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
?'CONSEJO PROFESIONAL DE INGENIEROS, AGRIMENSORES Y GEOLOGOS'
?'Mitre 617 - 1 piso  - 5500-MENDOZA'
?'LISTADO DE PROFESIONALES               ' at 16
if wope = 1
   ?'  Carnet Depositado        ' AT  26
else
   if wope = 2
      ? '  Fallecidos                    ' AT 26
   endif
endif
? 'Al: ' AT 55
?? wfecha
?? 'Hoja: ' at 70
?? whoja pict '999'
?'MATR.CAT.  APELLIDO y NOMBRE' 
??'TITULO' at 50
??'OBSERVAC.' at 69
?
wlin=6
return