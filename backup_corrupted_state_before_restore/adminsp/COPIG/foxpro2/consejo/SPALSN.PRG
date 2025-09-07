procedure spalsn
*listado de prof.con sanciones
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE PROFESIONALES CON SANCIONES'
@06,15 get wope pict '@*H \<Ley 3485;\<Cod.etica;\<Art 46-L.5908;\<Todas' size 1,1
read
wope1=1
@08,15 get wope1 pict '@*H \<Sin cumplimiento;\<Cumplidos;\<Todos' size 1,1
read
wope2=1
@10,15 get wope2 pict '@*H \<Alfab‚tico;\<Num‚rico' size 1,1
read
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive off
   select 1
   use spsanc order matric
   select 2
   use spmatri index spmatri
   select 3
   use spprof index spprof
   SET EXCLUSIVE ON
   select 4
   use sptmsan
   zap
   SET EXCLUSIVE OFF
   set safety off 
   select 1
   go top
   do while not eof()
      wposcu=0
      if wope = 1
         if santipo = '1' or santipo = '3' or santipo = '4'
            if wope1 = 3
               wposcu = 1
            else
               if wope1 = 1
                  if sancpag = 0
                     wposcu = 1
                  endif
               else
                  if sancpag = 1
                     wposcu = 1
                  endif
               endif
            endif
*            wposcu = 1
         endif
      else
         if wope = 2
            if santipo =  '2'
               if wope1 = 3
                  wposcu = 1
               else
                  if wope1 = 1
                     if sancpag = 0
                        wposcu = 1
                     endif
                  else
                     if sancpag = 1
                        wposcu = 1
                     endif
                  endif
               endif
 *              wposcu= 1
            endif
         else
            if wope = 3
               if santipo = '5'
                   if wope1 = 3
                      wposcu = 1
                   else
                     if wope1 = 1
                        if sancpag = 0
                           wposcu = 1
                        endif
                     else
                        if sancpag = 1
                           wposcu = 1
                        endif
                     endif
                  endif
  *               wposcu = 1
               endif
            else
              if wope1 = 3
                 wposcu = 1
              else
                 if wope1 = 1
                    if sancpag = 0
                       wposcu = 1
                    endif
                 else
                    if sancpag = 1
                       wposcu = 1
                    endif
                 endif
              endif
*             wposcu = 1      
            endif   
         endif
      endif
      if wposcu = 1                  
            wkey=str(matric,5)+catego
            select 2
            seek(wkey)
            if found()
               wkey2=str(dctipo,1)+str(dcnro,8)
               wposit=0
           *    if whab = 1
           *       if habili > 1991 and condic < '2'
           *          wposit=1
           *       endif   
           *    else
           *       if whab = 2
           *          if habili < 1992 and condic < '2'
           *             wposit=1
           *          endif
           *       else
           *          wposit = 1
           *       endif
           *    endif
           *    if wposit = 1              
                   select 3
                   seek(wkey2)
                   if found()
    *       if dpto = 16 or dpto = 17 or dpto = 18
                        select 4
                        append blank
                        replace numero with a.matric
                        replace catego with a.catego
                        replace titulo with b.titulo
                        replace inciso with a.saninci
                        replace dctipo with b.dctipo
                        replace dcnro  with b.dcnro
                        replace habili with b.habili
                        replace condic with b.condic
                        replace nombre with c.nombre
                        replace tipo   with a.santipo
                        replace resoluc with a.sanresol
                        replace fresol with a.sanferes
                        replace finic  with a.sanvigde
                        replace ffinal with a.sanvigha
                        replace canmatr with a.sancnmat
                        replace codpag  with a.sancpag
                        replace fpago   with a.sanfpag
                        replace recibo  with a.sanreci
                        replace importe with a.sanimpo
                        replace observ  with a.sanobs
                   endif   
              * endif
            endif  
      endif
      select 1
      skip
   enddo
   select 4
   if wope2 = 1
      sort to sptmsans on nombre
   else
      sort to sptmsans on catego, numero
   endif
   set safety on
   use sptmsans
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
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   whoja=0
   wlin=0
   do while not eof()
      if whoja=0
         do titulos
      endif
      if wlin>88
         do titulos
      endif      
      ?numero  pict '99999' 
      ??catego pict 'XX' at 6
      ??nombre           at 9
      ??tipo             at 39
      ??inciso           at 41
*      select 3
*      seek(d.titulo)
*      if found()
*         ?? c.titdesc at 40 
*      endif
         if tipo = '1'
            ?? 'L.3485-Art.34' at 43
         else
            if tipo = '2' 
               ?? 'Cod.Etica   ' at 43 
            else
               if tipo = '3'
                  ?? 'L.3485-Art.32' at 43
               else
                  if tipo = '4'
                     ?? 'L.3485-art.33' at 43
                  else
                     if tipo = '5'
                        ?? 'L.5908 Art.46' at 43
                     else   
                        ?? '             ' at 43
                     endif   
                  endif
               endif 
            endif
         endif
 *     endif
      ?? resoluc pict '9999' at 56
      ?? fresol  at 61
      ?? finic   at 72
      ?? ffinal  at 83
      ?? canmatr at 94 PICT '999'
      ?? fpago   at 98
      ?? recibo  pict '99999' at 109
      ?? codpag  at 115
      ?? observ  pict 'XXXXXXXXXXXXXXXXXXXX' at 117         
      select 4   
      skip
      wlin=wlin+1
   enddo
   eject
   ???chr(27)+chr(50)
   ???chr(27)+chr(80)
   set printer off
   set device to screen
endif
@04,01 clear to 23,78
close all
return

procedure titulos
if whoja>0
   ? 'Est.= 1 Indica cumplimiento de la sanci¢n.'
   eject
endif   
whoja=whoja+1
?'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
?'Mitre 617 - 1 piso  - 5500-MENDOZA'
?'LISTADO DE PROFESIONALES CON SANCIONES   ' at 46
wliteral=space(30)
if wope1=1
	wliteral='(No cumplidas a la fecha)     '
else
   if wope1=2
      wliteral='( Levantadas a la fecha )     '
   endif
endif
?? wliteral      	
if wope = 1  or wope = 4
   ?'   LEY 3485/63             ' AT  36
else
   if wope = 2
      ? '  C¢digo de Etica - Art. 64.    ' AT 36
   else
      if wope = 3
         ?'  Ley 5908 - Art.46 (Resol.22/94)' at 36   
      else
         ? '   Todos los tipos de sanci¢n '  at 36   
      endif
   endif   
endif
*if whab = 1
*   ? 'Habilitados ' at 30
*else
*   if whab = 2
*      ? ' NO habilitados ' at 30
*   else
*      ? ' Completo       ' at 30
*   endif
*endif                  
?? 'Al: ' AT 74
?? wfecha
?? 'Hoja: ' at 90
?? whoja pict '999'
?'MATR.CAT.  APELLIDO y NOMBRE' 
??'T.Inciso ' at 39
??'Resol  Fecha    Desde    Final.  C.Matr.  F.Pago Recib Est.Observ. ' at 58
?
wlin=6
return