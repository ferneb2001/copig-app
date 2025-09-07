procedure sanlis
*listado de personas o entidades.con sanciones
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE SANCIONES A NO PROFESIONALES DEL CONSEJO'
@06,15 get wope pict '@*H \<Ley 5908;\<Cod.etica;\<Todas' size 1,1
read
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive on
   select 1
   use sancion
   select 4
   use sptmsan
   set safety off 
   zap
   select 1
   go top
   do while not eof()
      wposcu=0
      if wope = 1
         if santipo = '1' or santipo = '3' or santipo = '4'
            wposcu = 1
         endif
      else
         if wope = 2
            if santipo =  '2'
               wposcu= 1
            endif
         else
            wposcu=1
         endif
      endif
      if wposcu = 1                  
*                   select 3
*                   seek(wkey2)
*                   if found()
                        select 4
                        append blank
                        replace numero with a.matric
                        replace catego with a.catego
                        replace inciso with a.saninci
                   *     replace dctipo with b.dctipo
                   *     replace dcnro  with b.dcnro
                   *     replace habili with b.habili
                   *     replace condic with b.condic
                        replace nombre with a.nombre
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
*            endif  
*      endif
      select 1
      skip
   enddo
   select 4
   sort to sptmsans on nombre
   set safety on
   use sptmsans
   go top
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
      if wlin>67
         do titulos
      endif      
      ?numero  pict '99999' 
      ??catego pict 'XX' at 6
      ??nombre           at 9
      ??tipo             at 40
      ??inciso           at 42
         if tipo = '1'
            ?? 'L.3485-Art.34' at 44
         else
            if tipo = '2' 
               ?? 'Cod.Etica   ' at 44 
            else
               if tipo = '3'
                  ?? 'L.3485-Art.32' at 44
               else
                  if tipo = '4'
                     ?? 'L.3485-art.33' at 44
                  else
                     ?? '             ' at 44
                  endif
               endif 
            endif
         endif
 *     endif
      ?? resoluc pict '99999' at 58
      ?? fresol  at 64
      ?? finic   at 73
      ?? ffinal  at 82
      ?? canmatr at 91
      ?? fpago   at 99
      ?? recibo  pict '99999' at 108
      ?? observ  pict 'XXXXXXXXXXXXXXX' at 114         
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
   eject
endif   
whoja=whoja+1
?'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
?'Mitre 617 - 1 piso    -  5500 - MENDOZA'
?'LISTADO DE PERSONAS O ENTIDADES CON SANCIONES ' at 16
if wope = 1 or wope = 3 or wope = 4
   ?'   LEY 3485/63 Y 5908      ' AT  26
else
   if wope = 2
      ? '  C¢digo de Etica - Art. 64.    ' AT 26
   else
      ? '   Todos los tipos de sanci¢n '  at 26   
   endif
endif
?? 'Al: ' AT 55
?? wfecha
?? 'Hoja: ' at 70
?? whoja pict '999'
?'ORDEN CLASE  APELLIDO y NOMBRE' 
??'T.Inciso ' at 39
??'Resol  Fecha   Desde    Final.  C.Matr.  F.Pago  Recibo  Observ. ' at 58
?
wlin=6
return