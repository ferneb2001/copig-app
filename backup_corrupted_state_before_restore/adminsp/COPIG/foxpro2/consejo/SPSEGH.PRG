procedure spsegh
*Genera parte archivo spsegtrab
*  provisorio con alternativas
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES'
select 2
use spprof index spprof
select 5
use sptitu order titulo
select 3
set exclusive on
set safety off
wfecha=date()
use segtrab
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
      @02,05 say  numero
      if catego='A '
*      if numero < 999
		 @02,06 say numero
*		 @02,15 say nombre
		 @02,60 say titulo
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
         endif
*        endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0 .and. wtitulo='   ' 
         sort to sptempos on catego, titulo, nombre, dpto
*         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to sptempos on catego, titulo, nombre, dpto;
            for dpto=wdpto
*            do imprime
         else
            if wdpto=0 .and. wtitulo<>'   '
               sort to sptempos on catego, titulo, nombre, dpto;
               for titulo=wtitulo
*               do imprime
            else
               sort to sptempos on catego, titulo, nombre, dpto;
               for dpto=wdpto .and. titulo=wtitulo
*               do imprime
            endif      
         endif   
     endif
  endif   
*endif
@04,01 clear to 23,78
close all
return




procedure arma
wop=1
if a.titulo = '083' or a.titulo = '086' or a.titulo='212'    
       wop=0
else 
*	if a.titulo = '935' or a.titulo='082'
*    	WOP=0
				*      else   
				*         if a.titulo ='H04' or a.titulo='H05' or a.titulo='H07' or a.titulo = 'N01' or a.titulo = 'N02' or a.titulo = 'N04' or a.titulo = 'P01'
				*            wop=0
				*        else
				*           if a.titulo = 'Q01'
				*              wop=0
				*           else
				*              if a.titulo = 'K01' or a.titulo = 'M01' or a.titulo = 'N03' or a.titulo = 'O01' or a.titulo='O02' or a.titulo='R01'
				*                 wop=0
				*              endif
				*           endif   
				*         endif   
*	endif
endif
if wop=0
	select 5
	seek(a.titulo)
	if found()
   		wnomtit=titdesc
*      wop=0
     endif   
endif
if a.catego='CR' or a.catego='CA'
	wop=1
*else
*	wop=0
endif
if wop=0       
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
*   	if b.nombre ='FERNANDEZ'
*	  if b.tipo = 0
*      if wdpto=0 or dpto=wdpto
*       if dpto = 16 or dpto = 17 or dpto = 18
*				*	    IF DPTO < 8
	    @18,10 say b.nombre
	    @18,60 say b.nacio
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
            replace nomtit with wnomtit
            replace condic with a.condic
            replace dctipo with b.dctipo
            replace dcnro  with b.dcnro
            replace nombre with b.nombre
            replace domici with b.domici
            replace tipodom with b.tipo
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace telef  with ltrim(b.telef)
            replace fecha  with b.nacio
*            wanio=year(b.nacio)
*            wedad=1999-wanio
*            replace curso  with wedad 
            if a.inscr  <> {  /  /  }
         	   replace fecha1  with a.inscr 
            else
               if a.fechab <> {  /  /  }
                  replace fecha1 with a.fechab
               endif
            endif      	
         endif
      endif
*    endif
*  endif 
endif 
******** fin de la primera busqueda
select 4
use sptiaux index sptiaux
go top
wop=1
locate for axnume=a.numero and axcate=a.catego
do while found()
    if d.axtitu= '086' or d.axtitu='083' or d.axtitu='212' 
         wop=0
    endif
    if wop=0
    select 5   
	seek(d.axtitu)
	if found()
	   wnomtit=titdesc 
	endif
    select 2
         seek(str(a.dctipo,1)+str(a.dcnro,8))
         if found()
*						*        if b.tipo<>1
		    if wdpto=0 or dpto=wdpto
*		       if wtitulo='   ' or d.axtitu=wtitulo
		          select 3
*                  append blank
*                  replace numero with a.numero
*                replace catego with a.catego
                replace curso with d.axtitu
                replace nomcur with wnomtit
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
*                wanio=year(b.nacio)
*                wedad=1999-wanio
*                replace curso  with wedad 
*                if a.fectit <> {  /  /  }
*         	       replace fecha1  with a.fectit
*                else
*                   if a.fechab <> {  /  /  }
*                      replace fecha1 with a.fechab
*                   endif
*                endif      	
*		       endif
		    endif
		 endif   
      endif
      select 4
      continue
*  endif 
enddo
*endif   
return