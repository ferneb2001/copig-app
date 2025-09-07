procedure spalem
*listado de empresas
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS '
select 2
use spprofe index spprofe.idx
select 3
set exclusive on
set safety off
use emtempo
zap
set exclusive off
whabi=' '
wcont=0
wanhabi=0
wfecha={  /  /    }
winscr={  /  /    }
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
   @08,30 say 'Departamentos'
   @10,30 get wop pict '@*RVT \<Un departamento;\<Todos' color scheme 4
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
   wlista=1
   @08,60 say 'Opciones de Listado'
   @10,50 get wlista pict '@*RVT \<Matr-Raz.Social-Domic.;\<Idem+Tel‚fono;\<Matr-Razon Social-email' color scheme 4
   read
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
                 if condic = '3' or condic = '5'
                 	else
                	  do arma
                 endif 
               else
                  if whabi='S' 
                    if habili =  wanhabi .and. condic < '2' 
*		    	     IF HABILI >= WANHABI .AND. CONDIC < '2'
                        do arma
                     endif   
                  else
                  	 if (habili > 1995 and habili < 2002) and condic < '2'
*                     if habili < wanhabi and condic < '2'
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
   ???chr(27)+chr(15)
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego
   do while .not. eof()
   if wlista=3
   		if etmail=space(40)
   			exit
   		endif
   	endif		
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
     * if whoja=0
     *    do titulos
     * endif   
      ?numero pict '99999'
      ??catego at 7 
      ??nombre  at 10
      ??habili  at 72 pict '9999'
      ?? cuil at 85
      ?? fecha at 99
*      if wlista<3
      	if tipodom=1
      		  ?'**1' at 27
      	else
      		  ?'   ' at 27	  
      	endif
      	??domici  at 32
      	if wlista=2
      		??alltrim(telef)
      		??' '
*      		??cuil
      	endif
      	??' '+rtrim(wnomlocali)+' -'+rtrim(wnomdpto)+' '+rtrim(wprovc)
*      else
      	? etmail at 32
*      endif		
      wcont=wcont+1
      wlin=wlin+3
      if wlin > 80
 *        eject
         do titulos
     *    do titulosb
      endif
   skip
   enddo
   ?
   ?
   ?
   ? 'Total empresas: ' at 15
   ?? wcont pict '999999'
*   ???chr(27)+chr(18)
    ???chr(27)+chr(50)
    ???chr(27)+chr(80)
    ?
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 80
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE EMPRESAS  ' AT 20
*?? wcateg at 57
if whabi='S'
   ??' (habilitadas) ' at 44
*   ?? wanhabi pict '9999'
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
?? 'C.U.I.T.' at 88
?? 'F.Matriculac.' at 98
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
winscr={  /  /    }
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
  if estado = 'A' or estado=' ' or estado='1'
   if a.inscr<>{  /  /    }
   		winscr=a.inscr
   else	
   		if a.fechab<>{  /  /    }
   			winscr=a.fechab
   		endif
   endif	
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
      replace domici with b.domici
      replace provin with b.provin
      replace dpto   with b.dpto
      replace locali with b.locali
      replace telef  with b.telef
      replace tipodom with b.tipo
      replace etfax   with b.efax
      replace etcelu  with b.ecelular
      replace etmail  with b.eemail
      replace cuil    with b.cuit
      replace fecha   with winscr
   endif
 endif  
endif
return