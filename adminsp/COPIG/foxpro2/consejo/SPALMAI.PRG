procedure spalmai
*listado de profesionales
*  provisorio con alternativas con email
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
set century on
set date to dmy
select 2
use spprof index spprof.idx
select 5
use sptitu order titulo
select 3
set exclusive on
set safety off
wfecha=date()
use sptempo
zap
set exclusive off
whabi=' '
wop=1
wop1=0
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
      @02,05 say  numero pict '99999'
      @02,10 say catego
*      @02,77 get wop1 pict  '9'
*      read
      if catego='A '
*      if numero < 999
         if wcatego='  ' or catego=wcatego
            if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
*               	  if condic < '2'
                 	 do arma
*                  endif
               else
                  if whabi='S' 
                     if habili > 2004 and condic < '2'
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
         endif
*        endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
*         sort to sptempos on catego, titulo, nombre, dpto
		SORT to sptempos on nombre
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
   wcatego='  '
   wtotit=0
   wtcant=0
   wcandom=0
   wcateg=catego
   wtitu=SPACE(3)
*   do titulos
*   do titulosb
   wkey=wcatego+wtitu
   do while .not. eof()
*      if catego+titulo<>wkey
*         if titulo<>wtitulo
*            if wtotit<>0
*               do titulosc
*               wtotit=0
*            endif
 *           wtotit=wtotit+1   
*            wtitulo=titulo
*            select 5
*            use sptitu order titulo
*            seek(wtitulo)
*            if found()
*               wnomtit=titplur
*            else
*               wnomtit=space(30)
*            endif
*            select 1      
*         endif
*         if catego<>wcatego
*            wcatego=catego
*            wcateg=catego
*            wlin=96
*         endif
*         wkey=wcatego+wtitulo      
 *        do titulosb
         if wlin > 88
            do titulos
*            do titulosb
*         else
*            do titulosb   
         endif   
*      endif   
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
      ??catego at 7 
      ??nombre  at 10
      if tipodom = 1
         ?? '*' at 41
         ?? tipodom
         ?? ' '
         wcandom=wcandom+1
      endif   
*      ?? dcnro  pict '99999999'
*      ?? '  '
*      ?? dctipo  pict '9'
*      ?? ' '
*	  if fecha <> {  /  /  }
*	     ?? fecha at 44
*	  else
* 	     if fecha1 <> {  /  /    }
*	        ?? fecha1 at 55
*	        ?? '*'
*	     endif
*	  endif
*	  ?? curso pict '99' at 50         
* 	  ?? domici at 66
      ??domici  at 47
*      ?? telef at 107
      ?? telef  at 92
*      ??' '+rtrim(wnomlocali)+' - '+rtrim(wnomdpto)+' '+rtrim(wprovc)
      wtcant=wtcant+1
      wtotit=wtotit+1
      wlin=wlin+1
      if wlin > 83
 *        eject
         do titulos
*         do titulosb
      endif
   skip
   enddo
   ?
*   ?'total prof/titulo    : ' at 20
*   ?? wtotit  at 45 pict '99999'
   ?
   ?'total profesionales   : ' at 20
   ?? wtcant at 45 pict '99999'
   ?
*   ?'total prof.dom.no act.: ' at 20
*   ?? wcandom at 45 pict '99999'
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
if wlin > 83
   ? '     ** 1 Indica domicilio no actualizado en Consejo.'
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
*?? 'F.Insr.' at 42
?? ' e-mail   ' AT 53
*?? ' TELEFONO ' AT 85
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
wlin=wlin+3
return

procedure arma
wop=1
wfecha1={  /  /    }
select 2
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
	if a.catego='CR' or a.catego='CA'
		wop=1
	else
       wtitulo=a.titulo
       select 5
       use sptitu order titulo
       seek(wtitulo)
       if found()
         if tipadron < '9'
         	 wpadron=val(tipadron)
         else
             wpadron=0
         endif	
       else
         wpadron=0
       endif
       select 2      
 	   wop=0
	endif		
endif
@15,20 say wtitulo
@15,50 say wpadron
@15,10 say wop pict '9'
@16,10 say b.nombre
@16,45 say b.spemail
*@17,77 get wop1 pict '9'
*read
if wop=0       
   	if b.spemail<>'           '
*	  if b.tipo = 0
*      if wdpto=0 or dpto=wdpto
*       if dpto = 13 or dpto = 14 or dpto = 15
*	  if b.provin>1
*	    IF DPTO >= 8 and dpto <=12
	    @18,10 say b.nombre
	    @18,60 say b.nacio
*	    @18,77 get wop1 pict '9'
        wop=0
				*      if nacio={  /  /  }
				*          wop=1
				*      endif
	    if wop=0
				*	      if nacio<{01/01/34}
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
*            replace domici with b.domici
            replace domici with b.spemail
            replace tipodom with b.tipo
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace telef  with ltrim(b.telef)
            replace fecha  with b.nacio
*            wanio=year(b.nacio)
*            wedad=1999-wanio
            replace curso  with wpadron 
*            if a.inscr  <> {  /  /  }
         	replace fecha1  with wfecha1 
*            else
*               if a.fechab <> {  /  /  }
*                  replace fecha1 with a.fechab
*               endif
*            endif      	
*            replace fecha1 with b.fallec
*         endif
      endif
    endif
*  endif 
endif 
******** fin de la primera busqueda
*select 4
*use sptiaux index sptiaux
*go top
*wop=1
*locate for axnume=a.numero and axcate=a.catego
*do while found()
**   if d.axtitu= '079'  
*   if d.axtitu= '001' or d.axtitu='002' or d.axtitu='212'  or d.axtitu='083' or d.axtitu='086' 
* 	    IF b.DPTO >= 13 and b.dpto <=15
*        wop=0
*        endif
*   endif
*   if wop=0   
*      select 2
*      seek(str(a.dctipo,1)+str(a.dcnro,8))
*      if found()
***						*        if b.tipo<>1
*		    if wdpto=0 or dpto=wdpto
***		       if wtitulo='   ' or d.axtitu=wtitulo
*		          select 3
*                  append blank
*                  replace numero with a.numero
*                replace catego with a.catego
*                replace titulo with d.axtitu
*                replace habili with a.habili
*                replace condic with a.condic
*                replace dctipo with b.dctipo
*                replace dcnro  with b.dcnro
*                replace nombre with b.nombre
*                replace domici with b.domici
*                replace tipodom with b.tipo
*                replace provin with b.provin
*                replace dpto   with b.dpto
*                replace locali with b.locali
*                replace telef  with ltrim(b.telef)
*                replace fecha  with b.nacio
***                wanio=year(b.nacio)
***                wedad=1999-wanio
***                replace curso  with wedad 
***                if a.fectit <> {  /  /  }
***         	       replace fecha1  with a.fectit
***                else
***                   if a.fechab <> {  /  /  }
***                      replace fecha1 with a.fechab
***                   endif
***                endif      	
***		       endif
*		    endif
*		 endif   
*      endif
*      WOP=1
*      select 4
*      continue
***  endif 
*enddo
***endif   
return

