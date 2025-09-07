procedure spalemp
*listado de empresas
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS '
select 2
use  spprofe index spprofe.idx
*use d:\bkconse\bk030700\spprofe index d:\bkconse\bk030700\spprofe
select 3
set exclusive on
set safety off
use emtempo
zap
set exclusive off
set date to dmy
set century on
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
*   do imprime
*   else                  
      select 1
      use spmatrie
*      use d:\bkconse\bk030700\spmatrie
      go top
      set clock on
      woppru=0
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         if wcatego='EM'
         @22,50 say pago
         @22,63 say habili
*         @22,78 get wop pict '9'
*         read
*         if numero > 2193 and numero< 3000
         *   if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
	               if condic = '2' or condic = '5'
    	              do arma
        	       endif   
               else
                  if whabi='S'
                  @21,50 say condic
                  @20,50 say wanhabi
                  @20,62 say habili
*                  @21,78 get wop pict '9'
*                  read 
                    if habili =  wanhabi .and. condic < '2' 
                     @21,55 say pago
*                     @21,78 get wop pict '9'
*                     read
*				   	     IF HABILI = WANHABI .AND. CONDIC < '2'
				*						@17,03 say pago
				*						if pago >= {29/06/2000} 
*							if pago >= {01/10/2001} and pago <= {31/11/2001}
*										    @19,61 get woppru
*										    read
*								@23,60 say 'va arma'		    
                        		do arma
*  		                    endif
			         endif   
                   else
*                  	if habili > 1989 and habili<wanhabi
*                  		if condic<'2'
                     if habili < wanhabi and condic < '2'
                        do arma
*                      endif  
                     endif   
                  endif
                endif          
*            endif
*            endif
         endif      
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto=0  
         sort to emtempos on catego, nombre, dpto
*         sort to emtempos on numero 
         do imprime
      else   
         if wdpto<>0 
*            sort to emtempos on catego, nombre, dpto;
            sort to emtempos on numero ;
            for dpto=wdpto
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
      if catego<>wkey
       *  if titulo<>wtitulo
       *     wtitulo=titulo
       *     select 5
       *     use sptitu order titulo
       *     seek(wtitulo)
       *     if found()
       *        wnomtit=titplur
       *     else
       *        wnomtit=space(30)
       *     endif
       *     select 1      
       *  endif
         if catego<>wcatego
            wcatego=catego
            wcateg=catego
            wlin=96
         endif
         wkey=wcatego      
 *        do titulosb
         if wlin > 85
*         if wlin > 65
            do titulos
       *     do titulosb
       *  else
       *     do titulosb   
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
      ??habili at 68 pict '9999'
      ??cuil   at 82 pict '99999999999'
*      ??dcnro at 62 pict '99999999'
*      ?? habili at 68
      ?? fecha   AT 98
	  if condic>'1'
	  	??' cond= '
	  	?? condic pict 'X'
	  endif
      ?domici  at 32
      ??alltrim(telef)
      ??' '+rtrim(wnomlocali)+' -'+rtrim(wnomdpto)+' '+rtrim(wprovc)
*      ?
*      ?
      wcont=wcont+1
      wlin=wlin+2
      if wlin > 80
*      if wlin > 65
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
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if wlin > 80
*if wlin > 65
   eject
   whoja=whoja+1
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE EMPRESAS  ' AT 20
*?? wcateg at 57
if whabi='S'
   ??' (habilitadas) ' at 40
   ?? wanhabi pict '9999'
else
   if whabi='N'
      ??' (no habilitadas)' at 40
   endif      
endif
?? ' Inactividad o Bajas' at 40
?? 'Fecha: ' at 62
?? wfecha    at 69   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
*?? 'DOCUMENTO' AT 62
?? 'DOMICILIO' AT 72
?? 'CUIT'  at 85
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
*	if fallec >= {01/12/2001}
*  @21,60 say estado
*  @21,78 get wop pict '9'
  read
  if estado = 'A' or estado=' '
   if wdpto=0 or dpto=wdpto
*    if b.dpto=16 or b.dpto=9 or b.dpto=10 or b.dpto=11 or b.dpto=11
*	 if b.dpto=17 
     if b.provin > 1
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
*      replace fecha  with a.pago
      replace fecha with b.fallec
      replace cuil   with b.cuit
   endif
  endif 
 endif  
endif
return