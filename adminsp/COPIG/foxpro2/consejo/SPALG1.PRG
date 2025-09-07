procedure spalg1
*listado de profesionales seleciona grupo de titulos
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
use sptempo
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitados;\<No habilitados;\<Todos';
       color scheme 5
read
@23,01 clear to 23,78
*if wop<>1
   if wop=1
      whabi='S'
   else
      if wop=2
         whabi='N'
      else
         whabi=' '
      endif      
   endif      
   wop=1
   @08,25 say 'Categor¡a'
   @10,25 get wop pict '@*RVT \<Una categoria;\<Todas' color scheme 4
   read
   @23,01 clear to 23,78
   wcatego='  '
   if wop<>2
      @23,01 say 'Indique la categoria a listar'
      @23,31 get wcatego pict '!!'
      read
      @23,01 clear to 23,78
   endif
   @08,45 say 'Titulos'
   wop=1
   wtitulo=space(3)
   wnomtit=space(30)
   @10,45 get wop pict '@*RVT \<Un t¡tulo;\<Todos' color scheme 4
   read
   if wop=2
      wtitulo='   '
   else   
      @23,01 say 'Seleccione titulo a listar y oprima <ESC>'   
      define window ptitu from 06,25 to 22,55
      activate window ptitu
      select 5
      use sptitu order titulo
      brow in window ptitu
      deactivate window ptitu
      wtitulo=titulo
      wnomtit=titplur
      @23,01 clear to 23,78
   endif
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @08,60 say 'Departamentos'
   @10,60 get wop pict '@*RVT \<Un departamento;\<Todos' color scheme 4
   read
   if wop=2
      wdpto=0
   else      
      @23,01 say 'Seleccione departamento a listar y oprima <ESC>'
      define window pdpto from 06,30 to 22,50
      activate window pdpto
      select 4
      use spdpto order dpto
      brow in window pdpto
      deactivate window pdpto
      @23,01 clear to 23,78
      wdpto=dpto
      wnomdpto=nombre
   endif
   @20,01 say 'Se listar n todos los profesionales '
   if wcatego<>'  '
      @20,37 say wcatego
      @20,39 say ', '
   endif   
   if wtitulo<>'   '
      @20,40 say rtrim(wnomtit)
   endif
   if whabi='S'
      @21,01 say '   habilitados'
   else
      if whabi='N'
         @21,01 say 'no habilitados'
      endif
   endif
   if wdpto>0
      @21,16 say 'del departamento '
      @21,33 say wnomdpto
   endif
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
         if wcatego='  ' or catego=wcatego
            if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili > 1991 and condic < '2'
                        do arma
                     endif   
                  else
                     if habili < 1992 and condic < '2'
                        do arma
                     endif   
                  endif
               endif          
            endif
         endif
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to sptempos on catego, titulo, nombre, dpto
         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptempos on catego, titulo, nombre, dpto;
            for dpto=wdpto
            do imprime
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptempos on catego, titulo, nombre, dpto;
               for titulo=wtitulo
               do imprime
            else
               sort to sptempos on catego, titulo, nombre, dpto;
               for dpto=wdpto .and. titulo=wtitulo
               do imprime
            endif      
         endif   
     endif
  endif   
*endif
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
      select 5
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
         select 1         
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '99999'
      ??catego at 10 
      ??nombre  at 15
      ??domici  at 47
      ??' '+rtrim(wnomlocali)+' -  '+rtrim(wnomdpto)
      wlin=wlin+1
      if wlin > 85
 *        eject
         do titulos
         do titulosb
      endif
   skip
   enddo
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
? 'CONSEJO PROFESIONAL DE INGENIEROS, AGRIMENSORES Y GEOLOGOS - MENDOZA' 
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
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
?? 'DOMICILIO' AT 47
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

procedure arma
if titulo='801' or titulo='901' or titulo='902' or titulo='903';
   or titulo='904' or titulo='905' or titulo='906' or titulo='907';
   or titulo='908' or titulo='909' or titulo='910' or titulo='911';
   or titulo='912' or titulo='913' or titulo='914' or titulo='916'; 
   or titulo='917' or titulo='918' or titulo='919' or titulo='921';
   or titulo='922' or titulo='923' or titulo='924' or titulo='927';
   or titulo='928' or titulo='929' or titulo='930' or titulo='A01';
   or titulo='A02' or titulo='A03' or titulo='A04' or titulo='A06';
   or titulo='A18' or titulo='A21' or titulo='B01' or titulo='C01';
   or titulo='C02' or titulo='C03' or titulo='G01'
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      if wdpto=0 or dpto=wdpto
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
      endif
   endif
endif   
return