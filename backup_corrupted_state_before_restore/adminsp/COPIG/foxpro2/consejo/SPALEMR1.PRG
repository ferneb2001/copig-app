 procedure spalemr1
*listado de empresas con sus representantes t‚cnicos
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS CON REPRES.TCOS. '
select 2
use spprofe index spprofe
select 3
set exclusive on
set safety off
use emtempo
zap
set exclusive off
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
   wrtco=1
   @08,40 say 'Representantes'
   @10,40 get wrtco pict '@*RVT \<Todos;\<Los Activos;Los \<Vencidos' color scheme 4
   read
   if wrtco<1 or wrtco>3
   	wrtco=1
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
      use spmatrie
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         if wcatego='EM'
         *   if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
                  do arma
               else
                  if whabi='S' 
                     if habili >=  wanhabi .and. condic < '2'
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
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0  
         sort to emtempos on catego, nombre, dpto
         do imprime
      else   
         if wdpto<>0 
            sort to emtempos on catego, nombre, dpto;
            for dpto=wdpto
            do imprime
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
   use emtempos
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
   ???chr(15)
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego
   do while .not. eof()
      if catego<>wkey
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego      
         if wlin > 85
            do titulos
         endif   
      endif
      WNOMLOCALI=SPACE(15)
      wnomdpto=space(15)
      wprovc=space(15)   
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
      ?numero pict '99999'
      ??catego at 7 
      ??nombre  at 10
*      ??dcnro at 62 pict '99999999'
      ??domici  at 62
      ??alltrim(telef)
      ??' '+rtrim(wnomlocali)+' -'+rtrim(wnomdpto)+' '+rtrim(wprovc)
      wcont=wcont+1
      wlin=wlin+1
      if wlin > 80
         do titulos
      endif
      do buscarep
      select 1
   skip
   enddo
   ?
   ?
   ?
   ? 'Total empresas: ' at 15
   ?? wcont pict '999999'
   ???chr(18)
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
if wlin > 80
   if whoja <> 0
      eject
   endif   
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
? 'MATRIC.CAT.   NOMBRE'
*?? 'DOCUMENTO' AT 62
?? 'DOMICILIO' AT 72
?'----------------------------------------------------------------------------------------------------------------------------------------'
?'T¡tulo' at 18
??'Apellido y Nombre' at 48
??'Matr.Cat.  Relaci¢n' at 78
??'            Hab.   Inicio   Finaliza'
?'========================================================================================================================================'
wlin = 8
return

procedure arma
wokey=0
select 2
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
	@12,1 say b.nombre
	@12,40 say a.numero
   if wdpto=0 or dpto=wdpto
	   do buscrth
   	   if wokey=1
   	   @19,10 say 'graba empresa '
   	   @19,40 say a.numero pict '99999'
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
	      replace domici with b.domici
	      replace provin with b.provin
	      replace dpto   with b.dpto
	      replace locali with b.locali
	      replace telef  with b.telef
	    endif  
   endif
endif
return

procedure buscarep
wrtsigue='S'
wrtfecha={  /  /  }
wrtfechf={  /  /  }
wrtcpto=space(1)
wrtmat=0
wrtcat=space(2)
wrtnom=space(30)
wrttit=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
wsetit=0
select 8
use sprtcos order empresa
go top
locate for str(empresa,5)=str(a.numero,5)
do while found()
   if wsetit=0
	    ?
	    wlin=wlin+1
	    wsetit=1
   endif
   wrthab=0
   wrtnomb=space(30)
   wrttit=space(30)
   wkeyrt=str(matprof,5)+categor
   wrtvinc=rtvinculo
   wrtmat=matprof
   wrtcat=categor
   wrtfecha=rtinicio
   wrtfech=rtfinal
   wokey=0
   if wrtco=1
   		wokey=1
   else
   		if wrtco=2
   			if wrtvinc =1 or wrtvinc =06 or wrtvinc=7 or wrtvinc=9 or wrtvinc=10
   				if wrtfech<wfecha
   					wokey=0
   				else
   					wokey=1	
   				endif
   			endif
   		else
   			if wrtvinc =1 or wrtvinc =06 or wrtvinc=7 or wrtvinc=9 or wrtvinc=10
   				if wrtfech<wfecha
   					wokey=1
   				else
   					wokey=0	
   				endif
   			endif
   		endif
   	endif
   if wokey=1
	   select 9
	   use spmatri index spmatri
	   seek(wkeyrt)
	   wsert=0
	   if found()
	      select 3
		  use sptitu order titulo
		  select 9
		  set relation to titulo into sptitu
		  wrttit=c.titdesc
		  wrthab=habili
		  wkeyrt1=str(dctipo,1)+str(dcnro,8)
		  select 6
		  use spprof index spprof
		  seek(wkeyrt1)
		  if found()
		     wrtnomb=nombre
		     wsert=1
		  endif
	   endif
		 if wsert=1
		 	? wrttit at 15
		 	?? ' '
		 	??wrtnomb
		 	?? '   '
		    ??wrtmat pict '9999'
		    ?? '  '
		    ??wrtcat
		    ?? '  '
		    if wrtvinc = 1
		    	?? 'Contrato '
		    else
		    	if wrtvinc=2
		    		?? 'Socio  '
		    	else
		    	   if wrtvinc = 3
		    	      ?? 'Rel. Depend.'
		    	   else
		    	   		if wrtvinc=4
		    	   		   ?? 'Gerente '
		    	   		else
		    	   		   if wrtvinc = 5
		    	   		      ?? 'Apoderado '
		    	   		   else
		    	   		      if wrtvinc = 6
		    	   		         ?? 'Por Obra '
		    	   		      else
		    	   		         if wrtvinc = 7
		    	   		            ?? 'Contrato Ren.aut.'
		    	   		         else
		    	   		            if wrtvinc = 8
		    	   		               ?? 'Propietario '
		    	   		            else
		    	   		               if wrtvinc = 9
		    	   		                  ?? 'Contr.Renov.Aut.'
		    	   		               else
		    	   		               	  if wrtvinc = 10
		    	   		               	     ?? 'Desconocido '
		    	   		               	  else
		    	   		               	     if wrtvinc = 11
		    	   		               	        ?? 'Contr.Sin Vto. '
		    	   		               	     endif
		    	   		               	  endif
		    	   		               endif
		    	   		            endif
		    	   		         endif
		    	   		      endif
		    	   		   endif
		    	   		endif
		    	   	endif
		    	 endif
		    endif
		    ?? wrthab   at 111 pict '9999'
		    ?? wrtfecha at 116
		    ?? wrtfech at 127
		    wlin=wlin+1
	    endif
	 endif   
	    select 8
	    continue
	 enddo
     ?'----------------------------------------------------------------------------------------------------------------------------------------'
	 wlin=wlin+1
	 return   	   		               	                               		
	      
	      
procedure buscrth
wrtsigue='S'
wrtfecha={  /  /  }
wrtfechf={  /  /  }
wrtcpto=space(1)
wrtmat=0
wrtcat=space(2)
wrtnom=space(30)
wrttit=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
wsetit=0
select 8
use sprtcos order empresa
go top
locate for str(empresa,5)=str(a.numero,5)
do while found()
	@13,1 say matprof
	@13,10 say rtfinal
	@13,21 say rtvinculo
   wrthab=0
   wrtnomb=space(30)
   wrttit=space(30)
   wkeyrt=str(matprof,5)+categor
   wrtvinc=rtvinculo
   wrtmat=matprof
   wrtcat=categor
   wrtfecha=rtinicio
   wrtfech=rtfinal
   wsert=0
   if wrtco=1
   	wokey=1
   else
   		if wrtco=2
   			if wrtvinc =1 or wrtvinc =06 or wrtvinc=7 or wrtvinc=9 or wrtvinc=10
   				if wrtfech<wfecha
   					wokey=0
   				else
   					wokey=1	
   				endif
   			endif
   		else
   			if wrtvinc =1 or wrtvinc =6 or wrtvinc=7 or wrtvinc=9 or wrtvinc=10
   				if wrtfech<wfecha
   					wokey=1
   				else
   					wokey=0	
   				endif
   			endif
   		endif
   	endif
   	continue
enddo   
select 2
return	      