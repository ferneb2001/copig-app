procedure spalgp1
*listado de profesionales
* provisorio para varios usos
* digitando matriculas y categorias a listar
SET TALK OFF
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
set date ymd
wfecha=date()
@22,50 say wfecha
whabi=' '
wop=1
wcuen=0
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
   wkey=space(7)
   wcatego=space(2)
   wmatri=0                   
      select 1
      use spmatri index spmatri
      go top
      set clock on
*      store ctod('95/12/01') to estafe
*      @14,21 to 16,57
*      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while wmatri<>99999
	  @23,01 say 'ingrese matricula y catego a listar <esc>p/salir'
	  @14,10 say 'Matricula Categoria '
	  @15,10 get wcatego pict '!!'
	  @15,15 get wmatri  pict '99999'
	  READ
	  if wmatri<> 99999
	  wkey=str(wmatri,5)+wcatego
	  seek(wkey)
	  if found()
        @17,03 say catego
        @17,06 say numero pict '99999'
*         if catego = 'A ' .and. numero > 7281
*            do arma
*         else
*            if catego = 'B1' .and. numero > 5259
*               do arma
*            endif
*         endif         
*         if wcatego='  ' or catego=wcatego
*           if titulo = '033'
               if whabi=' '
*                  if pago > dtoc(estafe)
                     do arma
*                  endif   
               else
                  if whabi='S' 
                     if habili > 1991 and condic < '2'
*                        @20,30 SAY PAGO
*					     if pago > {95/12/01}
                           do arma
*                        endif
                     endif   
                  else
                     if habili < 1992
*                        if pago > {95/12/01}
                           do arma
*                        endif   
                     endif   
                  endif
               endif
            endif
         endif      
      select 1
*      skip
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
         wnomdpto=space(15)
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
      ?? telef  at 92
      ??' '+rtrim(wnomlocali)+'-'+rtrim(wnomdpto)+' '+rtrim(wprovc)
*      ?? locali PICT '99'
*      ?? dpto   PICT '99' 
*      ?? provin PICT '99'
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
   ?
   ?
   ?
   ???chr(27)+chr(69)
   ???chr(27)+chr(71)
   ???chr(18)
*   ? 'Otros t¡tulos tienen incumbencias parciales respecto de lo solicitado; por lo '
*   ? 'tanto, para casos puntuales se consultar  al CONSEJO  PROFESIONAL DE INGENIE- '
*   ? 'ROS Y GEOLOGOS DE MENDOZA'
*   ???chr(27)+chr(18)
    ???chr(27)+chr(72)
    ???chr(27)+chr(70)
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
if whoja = 0
   whoja= whoja+1
else   
  if wlin > 85
     eject
     whoja=whoja+1
  endif
endif  
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
*if whoja = 1
*    ???chr(27)+chr(69)
*    ???chr(27)+chr(71)
*	? 'Los siguientes t¡tulos habilitan a efectuar Proyecto, C lculo, Direcci¢n T‚cnica y Construcci¢n de Obras ' at 15
*	? 'Hidr ulicas y Sanitarias ' at 15
*    ?
*    ???chr(27)+chr(72)
*    ???chr(27)+chr(70)
*endif
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
? 'MATRIC. CAT.   NOMBRE'
*?? 'F.MATRIC'   AT 46
?? ' DOMICILIO' AT 56
?? ' TELEFONO ' AT 87
wlin = 5
return


procedure titulosb
?
???chr(27)+chr(71)
?wnomtit AT 55
???chr(27)+chr(72)
*if wtitulo = '002' or wtitulo = '003'
*   ???chr(27)+chr(69)
*   ???chr(27)+chr(71)
*   ?	
*   ? '(Con exclusi¢n de Proyecto de Presas, obras de riego y portuarias)' AT 40
*   ???chr(27)+chr(72)
*   ???chr(27)+chr(70)
*   ?
*else   
*   ?
*endif   
*?'MATRIC. CAT.   NOMBRE'
*??'DOMICILIO' at 47
*?
wlin=wlin+3
return

procedure arma
@21,30 say pago
*@21,60 get wop
wop=0
*read
*if a.titulo > '602'
*if inscr <> {  /  /  }
*if a.catego = 'A '
*   if a.numero > 7278
*      wop=1
*   endif
*else
*   if a.titulo = '201' or a.titulo = '202' or a.titulo = '203' or a.titulo = '206' or a.titulo = '207' or a.titulo = '209' or a.titulo = '211'
*   if feccert <> {  /  /  }
*   if a.catego = 'B1'
*      if a.numero > 5257 and a.numero < 5299
*        wop=1
*      endif
*   else
*      if a.titulo > '300' and a.titulo < '600'
*      wop=1
*   endif   
*   endif
*endif
wnoment=space(30)
if wop=0        
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
*    if a.titulo = '001' or a.titulo = '002' or a.titulo = '003' or a.titulo = '005' or a.titulo = '039' or a.titulo = '042'
       @18,1 say a.numero
       @18,7 say a.catego
       @18,10 say b.nombre
       @18,60 say b.nacio
*     if dpto = 00 or dpto > 18
 *           if b.nacio > {31/10/49}
 *           @19,60 say b.nacio
         select 7
         use spente order codigo
         seek(a.otorga)
         if found()
         	wnoment=nombre
         else
         	wnoment=space(30)
         endif		
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
         replace titotorga with wnoment
         if a.inscr<>{  /  /  }
            replace fecha  with a.inscr
         else
            if a.fechab<>{  /  /  }
               replace fecha with a.fechab
            else   
               replace fecha with a.feccert
            endif   
         endif   
*     endif 
endif
endif
return