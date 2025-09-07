procedure spalimpr
*listado de profesionales
* provisorio para varios usos
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
use sptempo
zap
set exclusive off
wfecha=date()
@22,50 say wfecha
wcuen=0
wnomtit=space(30)
      whabi='S'
         whabi='N'
         whabi=' '
   wcatego='  '
   wtitulo=space(3)
   wnomtit=space(30)
      wtitulo='   '
      wtitulo=titulo
      wnomtit=titplur
   wdpto=0
   wnomdpto=space(15)
      wdpto=dpto
      wnomdpto=nombre
      
procedure imprime
set date dmy
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use sptempos
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
*   do titulos
   wkey=wcatego+wtitu
   do while .not. eof()
      if catego+titulo<>wkey
         if titulo<>wtitulo
            wtitulo=titulo
            select 5
            use sptitu order titulo
            seek(wtitulo)
            if found()
               wnomtit=titplur
            else
               wnomtit=space(30)
            endif
            select 1      
         endif
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego+wtitulo      
 *        do titulosb
         if wlin > 85
            do titulos
            do titulosb
         else
            do titulosb   
         endif   
      endif   
      select 6
      use splocal order cod
      seek(a.locali)
      if found()
         wnomlocali=nombre
      else
         wnomlocali=space(15)
      endif
      select 4
      use spdpto order dpto
      seek(a.dpto)
      if found()
         wnomdpto=nombre
      else   
         enomdpto=space(15)
      endif
      wprovc=space(15)
      if str(a.provin,3)<>'  1'
         select 7
         use spprov order prov
         seek(a.provin)
         if found()
            wprovc=nombre
         else
            wprovc=space(15)
         endif
      endif         
         select 1         
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '99999'
      ??catego at 10 
      ??nombre  at 15
*	   ?numero pict '99999' at 15
*	   ??catego at 21
*	   ??nombre at 25
*	   ??titotorga at 60
*      ??fecha  at 47
      ??domici  at 56
      ?? telef  at 87
      ??' '+rtrim(wnomlocali)+' -  '+rtrim(wnomdpto)+'  '+rtrim(wprovc)
      wlin=wlin+1
      wcuen=wcuen+1
      if wlin > 85
 *        eject
         do titulos
         do titulosb
      endif
   skip
   enddo
   ?
   ?
   ? 'Total de profesionales listados: '
   ?? wcuen
*   ???chr(27)+chr(18)
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 85
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES CATEGORIA ' AT 20
?? wcateg at 57
if whabi='S'
   ??' (habilitados)' at 61
else
   if whabi='N'
      ??' (no habilitados)' at 61
   endif      
endif
??'Fecha: ' at 80
?? wfecha  at 87 
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
*?? 'F.MATRIC'   AT 46
?? ' DOMICILIO' AT 56
?? ' TELEFONO ' AT 87
wlin = 5
return


procedure titulosb
?
?wnomtit AT 55
?
*?'MATRIC. CAT.   NOMBRE'
*??'DOMICILIO' at 47
*?
wlin=wlin+3
return
