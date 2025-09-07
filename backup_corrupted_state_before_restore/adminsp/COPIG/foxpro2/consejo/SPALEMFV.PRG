procedure spalemfv
*listado de empresas (genera archivo para hacer diskette)
*toma domicilio legal de empresas foraneas para notas
*modificar para cuando se necesiten listados comunes
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS '
select 3
set exclusive on
set safety off
use empsdfv
zap
CLOSE DATABASE
set exclusive off
SELECT 3 
USE EMPSDFv
select 2
use svprofe index svprofe.idx
whabi=' '
wcont=0
wanhabi=0
wfecha={  /  /  }
@06,10 say 'Fecha del listado: '
@06,40 get wfecha
read
wop=1
wnomtit=space(30)
@08,02 say 'Clases'
@10,02 get wop pict '@*RVT \<Habilitadas;\<No habilitadas;\<Todas';
       color scheme 5
read
@23,01 clear to 23,78
   if wop=1
      whabi='S'
      @14,02 say 'Digite a¤o de habilitaci¢n'
      @14,32 get wanhabi pict '9999' 
   else
      if wop=2
         whabi='N'
      @14,02 say 'Digite a¤o de habilitaci¢n'
      @14,32 get wanhabi pict '9999' 
      else
         whabi=' '
      endif      
   endif      
   wop=1
   wcatego='EM'
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
   @20,01 say 'Se listar n todas las empresas '
   if whabi='S'
      @21,01 say '   habilitadas'
   else
      if whabi='N'
         @21,01 say 'no habilitadas'
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
      use svmatrie
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         if wcatego='EM'
         *   if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
               	 if condic <> '5'
                  do arma
                 endif 
               else
                  if whabi='S' 
                     if habili = wanhabi .and. condic < '2'
*				     if habili>=2006 and habili<2008 and condic <'2'
                        do arma
                     endif   
                  else
                     if habili < wanhabi and condic < '2'
                        do arma
                     endif   
                  endif
                endif          
           * endif
         endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
*      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
*      select 3
*      if wdpto=0  
*         sort to emtempos on catego, nombre, dpto
         do imprime
*      else   
*         if wdpto<>0 
*            sort to emtempos on catego, nombre, dpto;
*            for dpto=wdpto
*            do imprime
        * else
        *    if wdpto=0 .and. wtitulo<>'   '
        *       sort to sptempos on catego, titulo, nombre, dpto;
        *       for titulo=wtitulo
        *       do imprime
        *    else
        *       sort to sptempos on catego, titulo, nombre, dpto;
        *       for dpto=wdpto .and. titulo=wtitulo
        *       do imprime
        *    endif      
         endif   
*     endif
*  endif   
*endif
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
   @15,23 say '     En proceso de impresi¢n    '   
   CLOSE DATABASE
   select 1
   use empsdfv
   go top
   wcateg=catego
   wtitu=titulo
   wkey=wcatego
   do while .not. eof()
      WNOMLOCALI=SPACE(15)
      wnomdpto=space(15)
      wprovc=space(15)
      wcpost=tcpost   
      select 5
      use splocal order cod
      seek(a.locali)
      if found()
         wnomlocali=nombre
         if wcpost='    '
        	 WCPOST=CPOST
         endif
      else
         wnomlocali=space(15)
      endif
      select 4
      use spdpto order dpto
      seek(a.dpto)
      if found()
         wnomdpto=nombre
         if wcpost='    '
         	wcpost=cpost
         endif
      else   
         wnomdpto=space(15)
      endif
      wprovc=space(15)
         select 7
         use spprov order prov
         seek(a.provin)
         if found()
            wprovc=nombre
            if wcpost='    '
            	wcpost=cpost
            endif	
         else
            wprovc=space(15)
         endif
         select 1
         replace lprovin with wprovc
         replace ldpto   with wnomdpto
         replace llocali with wnomlocali
         replace tcpost  with wcpost
   skip
   enddo
@04,01 clear to 23,78
return

procedure titulos
if wlin > 85
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE EMPRESAS  ' AT 20
*?? wcateg at 57
if whabi='S'
   ??' (habilitadas) ' at 44
   ?? wanhabi pict '9999'
else
   if whabi='N'
      ??' (no habilitadas)' at 44
   endif      
endif
?? 'Fecha: ' at 65
?? wfecha    at 72   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
*?? 'DOCUMENTO' AT 62
?? 'DOMICILIO' AT 72
wlin = 5
return

*procedure titulosb
*?
*?wnomtit AT 55
*?
*?'MATRIC. CAT.   NOMBRE'
*??'DOMICILIO' at 47
*?
*wlin=wlin+3
*return

procedure arma
select 2
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
*	if b.provin > 1 
	   if wdpto=0 or dpto=wdpto
    	  select 3
	      append blank
    	  replace numero with a.numero
	      replace catego with a.catego
*      replace titulo with a.titulo
	      replace habili with a.habili
    	  replace condic with a.condic
	      replace dctipo with b.dctipo
    	  replace dcnro  with b.dcnro
	      replace nombre with b.nombre
	      if b.provin > 1
	       if b.edomlg<>'          '
    	 	  replace domici with b.edomlg
		      replace provin with b.eprovlg
    		  replace dpto   with b.edptolg
	    	  replace locali with b.elocalg
	    	  replace telef  with b.etellg
		      replace tcpost with str(b.ecposlg,4)
		      replace titu   with 'for'
		    else
    	 	  replace domici with b.domici
		      replace provin with b.provin
    		  replace dpto   with b.dpto
	    	  replace locali with b.locali
	    	  replace telef  with b.telef
		      replace tcpost with str(b.emcpost,4)
		    endif  
	      else
    	 	  replace domici with b.domici
		      replace provin with b.provin
    		  replace dpto   with b.dpto
	    	  replace locali with b.locali
	    	  replace telef  with b.telef
		      replace tcpost with str(b.emcpost,4)
	      endif
	      replace eemail with b.eemail
   		  replace eecelu with b.ecelular
   		  replace tjucirc with b.local
    	  if b.cuit > 20000000000
	      	replace ecuit with b.cuit
    	  endif
       endif	  
*   endif
endif
return