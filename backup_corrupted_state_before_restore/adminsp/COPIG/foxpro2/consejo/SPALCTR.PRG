procedure spalctr
*listado de profesionales errores
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
wfecha=date()
use sptempo
zap
set exclusive off
select 4
use sptitu order titulo
whabi=' '
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 1
      use spmatri
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         do arma
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
         sort to sptempos on catego, titulo, nombre, dpto
         do imprime
  endif   
@04,01 clear to 23,78
close all
return

procedure imprime
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
   wlin=0
   whoja=0
   wcatego='  '
   wtotit=0
   wtcant=0
   wcateg=catego
   wtitu=SPACE(3)
*   do titulos
*   do titulosb
   wkey=wcatego+wtitu
   do while .not. eof()
      if catego+titulo<>wkey
         if titulo<>wtitulo
            if wtotit<>0
               do titulosc
               wtotit=0
            endif
            wtitulo=titulo
               wnomtit=space(30)
            select 1      
         endif
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego+wtitulo      
         if wlin > 85
            do titulos
            do titulosb
         else
            do titulosb   
         endif   
      endif   
         wnomlocali=space(15)
         enomdpto=space(15)
      wprovc=space(15)
            wprovc=space(15)
         select 1         
      ?numero pict '99999'
      ??catego at 10 
      ??nombre  at 15
      wtcant=wtcant+1
      wtotit=wtotit+1
      wlin=wlin+1
      if wlin > 85
         do titulos
         do titulosb
      endif
   skip
   enddo
   ?
   ?'total prof/titulo: ' at 20
   ?? wtotit  at 45 pict '99999'
   ?
   ?'total profesionales: ' at 20
   ?? wtcant at 45 pict '99999'
   ?
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
?? ' DOMICILIO' AT 47
?? ' TELEFONO ' AT 78
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

procedure titulosc
?
?'total prof./t¡tulo: ' at 20
?? wtotit
?
return

procedure arma
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if not  found()
         select 3
         append blank
         replace numero with a.numero
         replace catego with a.catego
         replace titulo with a.titulo
         replace habili with a.habili
         replace condic with a.condic
         replace dctipo with b.dctipo
         replace dcnro  with b.dcnro
         replace nombre with b.nombre
         replace domici with b.domici
         replace provin with b.provin
         replace dpto   with b.dpto
         replace locali with b.locali
         replace telef  with ltrim(b.telef)
   endif
return