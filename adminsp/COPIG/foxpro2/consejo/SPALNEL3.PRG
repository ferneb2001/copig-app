procedure spalnel3
*listado de Empresas con carta s/matricula 96
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE EMPRESAS CON CARTA    '
*@06,15 get wope pict '@*H \<Ley 5908;\<Cod.etica;\<Todas' size 1,1
*read
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive off
   select 1
   use spmorat1
   select 2
   use spmatrie index spmatrie
   select 3
   use spprofe index spprofe
   select 4
   use sptmsan
   set safety off 
   zap
   select 1
   go top
   do while not eof()
      wposcu=0
    *  if wope = 1
    *     if santipo = '1' or santipo = '3' or santipo = '4'
    *        wposcu = 1
    *     endif
    *  else
    *     if wope = 2
    *        if santipo =  '2'
    *           wposcu= 1
    *        endif
    *     else
    *        wposcu=1
    *     endif
    *  endif
    *  if wposcu = 1                  
            wkey=str(matri,5)+categ
            select 2
            seek(wkey)
            if found()
               wkey2=str(dctipo,1)+str(dcnro,8)
               wposit=0
                   select 3
                   seek(wkey2)
                   if found()
    *       if dpto = 16 or dpto = 17 or dpto = 18
                        select 4
                        append blank
                        replace numero with a.matri
                        replace catego with a.categ
                *        replace titulo with b.titulo
                *        replace inciso with a.saninci
                *        replace dctipo with b.dctipo
                *        replace dcnro  with b.dcnro
                *        replace habili with b.habili
                *        replace condic with b.condic
                        replace nombre with c.nombre
                *        replace tipo   with a.santipo
                *        replace resoluc with a.sanresol
                *        replace fresol with a.sanferes
                *        replace finic  with a.sanvigde
                *        replace ffinal with a.sanvigha
                        replace canmatr with a.nro
                *        replace codpag  with a.sancpag
                *        replace fpago   with a.sanfpag
                *        replace recibo  with a.sanreci
                *        replace importe with a.sanimpo
                        replace observ  with RTRIM(a.exptes)
                   endif   
              * endif
            endif  
*      endif
      select 1
      skip
   enddo
   select 4
   sort to sptmsans on nombre
   set safety on
   use sptmsans
   go top
*   select 3
*   use sptitu order titulo
   select 4
   @12,01 clear to 12,78
   @12,28 say 'En proceso de impresion'
   set console off
   set printer on
   set device to printer
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   whoja=0
   wlin=0
   do while not eof()
      if whoja=0
         do titulos
      endif
      if wlin>87
         do titulos
      endif      
      ?numero  pict '99999' 
      ??catego pict 'XX' at 6
      ??nombre           at 9
      ?? '1996'          at 45
      ?         
      select 4   
      skip
      wlin=wlin+2
   enddo
   eject
   ???chr(27)+chr(50)
*   ???chr(27)+chr(80)
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
?'LISTADO DE EMPRESAS CON NOTAS  ' at 16
?? 'Al: ' AT 55
?? wfecha
?? 'Hoja: ' at 70
?? whoja pict '999'
?'MATR.CAT.  APELLIDO y NOMBRE'
? 
wlin=5
return