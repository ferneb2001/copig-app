procedure spalgai
*listado de profesionales
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES ALFABETICO POR CATEGORIA'
select 2
use spprof index spprof
select 3
set exclusive on
set safety off
wfecha=date()
use sptempo2
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
                     if habili < 1992
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
         sort to sptemps2 on catego, nombre
         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptemps2 on catego, nombre, dpto;
            for dpto=wdpto
            do imprime
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptemps2 on catego, nombre, titulo;
               for titulo=wtitulo
               do imprime
            else
               sort to sptemps2 on catego, nombre, dpto, titulo;
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
   use sptemps2
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
   whoja=1
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego
   do while .not. eof()
      wtitulo=titulo
      if catego<>wkey
   *      if titulo<>wtitulo
   *         wtitulo=titulo
   *         select 5
   *         use sptitu order titulo
   *         seek(wtitulo)
   *         if found()
   *            wnomtit=titplur
   *         else
   *            wnomtit=space(30)
   *         endif
   *         select 1      
   *      endif
   *      if catego<>wcatego
   *         wcatego=catego
   *         wcateg=catego
   *         wlin=96
   *      endif
         wkey=wcatego      
 *        do titulosb
         if wlin > 85
            do titulos
   *         do titulosb
   *      else
   *         do titulosb   
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
      titulo=wtitulo
      select 5
      use sptitu order titulo
      seek(wtitulo)
      if found()
         wnomtit=titdesc
      else
         wnomtit=space(30)
      endif
      select 1         
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '99999'
      ??catego at 10 
      ??nombre  at 15
      ?? wnomtit at 47
      ??domici  at 78
   *   ?? telef  at 78
   *   ?? wnomtit at 88
      ??' '+rtrim(wnomlocali)+' -  '+rtrim(wnomdpto)+'  '+rtrim(wprovc)
      wlin=wlin+1
      if wlin > 85
 *        eject
         do titulos
 *        do titulosb
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
??'Fecha: ' at 80
?? wfecha  at 87 
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
?? 'TITULO' AT 48
?? ' DOMICILIO' AT 78
*?? ' TELEFONO ' AT 78
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
*      replace telef  with ltrim(b.telef)
   endif
endif
return