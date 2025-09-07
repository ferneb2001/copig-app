procedure spalgpag
* 20/02/2004
*listado de profesionales
*  provisorio con alternativas
* incluye pagos realizados
* graba archivo pagoprof
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
use sptempo
zap
select 7
use pagoprof
zap
set exclusive off
wfecha=date()
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
      @02,05 say  numero pict '99999'
      @02,10 say catego
      if catego='A '
	      @02,20 say vtohab
*      if numero < 999
         if wcatego='  ' or catego=wcatego
            if wtitulo='   ' or titulo=wtitulo
               if whabi=' '
               	  if condic < '2'
*                 	 do arma
                  endif
               else
                  if whabi='S' 
*                     if habili > 1991 and condic < '2'
						IF HABILI=2006  and CONDIC <  '2'
*							if vtohab >= {30/06/2002}
								@02,50 say numero
                         		do arma
*                        	endif	
                     endif   
                  else
                     if habili < 1992 and condic < '2'
*                        do arma
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
         sort to sptempos on  catego, titulo, nombre, dpto
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
   wacum=0
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
 *           wtotit=wtotit+1   
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
         if wlin > 88
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
      ??catego at 7 
      ??nombre  at 10
      if tipodom = 1
         ?? '*' at 41
*         ?? tipodom
         ?? ' '
         wcandom=wcandom+1
      endif   
*      ?? dcnro  pict '99999999'
*      ?? '  '
*      ?? dctipo  pict '9'
*     ?? ' '
*	  if fecha <> {  /  /  }
*	     ?? fecha at 44
*	  else
*	     if fecha1 <> {  /  /    }
*	        ?? fecha1 at 55
*	        ?? '*'
*	     endif
*	  endif
*	  ?? curso pict '99' at 50         
* 	  ?? domici at 66
*	  wcondic=space(6)
*	  if condic>'1'
*	  	 if condic='2'
*	  	 	wcondic='C.Dep'
*	  	 else
*	  	 	if condic='3'
*	  	 		wcondic='Fallec'
*	  	 	else
*	  	 		wcondic='Otro '
*	  	 	endif
*	  	 endif
*	  endif
      ?? sptmatr pict '9999'  at 44
      ??domici  at 50
*      ?? telef at 109
      ?? telef  at 95
      ??' '+rtrim(wnomlocali)+' - '+rtrim(wnomdpto)+' '+rtrim(wprovc)
      wtcant=wtcant+1
      wtotit=wtotit+1
      wacum=wacum+sptmatr
      wlin=wlin+1
      if wlin > 83
 *        eject
         do titulos
         do titulosb
      endif
   skip
   enddo
   ?
   ?'total prof/titulo    : ' at 20
   ?? wtotit  at 45 pict '99999'
   ?
   ?'total profesionales   : ' at 20
   ?? wtcant at 45 pict '99999'
   ?
   ?'total abonado         : ' at 20
   ?? wacum at 45 pict '999999'
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
*?'LISTADO DE PROFESIONALES CON RECIPROCIDAD' AT 15
?? wcateg at 57
*??'Deben 2003     ' at 61
if whabi='S'
   ??' (habilitados)' at 77
else
   if whabi='N'
      ??' (no habilitados)' at 77
   endif      
endif
??'Fecha: ' at 95
?? wfecha  at 102 
??'HOJA NRO. ' at 115
??whoja pict '999'
?
? 'MATRIC. CAT.   NOMBRE'
?? 'Pagado ' at 42
?? ' DOMICILIO' AT 53
?? ' TELEFONO ' AT 85
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
wnomtit=space(25)
wimpor=0
wf01={  /  /    }
wf02={  /  /    }
wf03={  /  /    }
wf04={  /  /    }
wf05={  /  /    }
wf06={  /  /    }
wf07={  /  /    }
wf08={  /  /    }
wf09={  /  /    }
wf10={  /  /    }
wf11={  /  /    }
wf12={  /  /    }
wp01=0
wp02=0
wp03=0
wp04=0
wp05=0
wp06=0
wp07=0
wp08=0
wp09=0
wp10=0
wp11=0
wp12=0
wind=0
wfecha1={  /  /    }
@19,60 say a.vtohab
select 2
seek(str(a.dctipo,1)+str(a.dcnro,8))
if found()
	if a.catego<>'A '
		wop=1
	else
      wop=0
	  select 8
	  use caja2309 order matric
	  go top
	  locate for matric=a.numero and a.catego='A '
	  do while found()
	    if anhabil=2006
	  		if cpto='2' or cpto>'6'  
	  		else
	  			wimpor=wimpor+importe
	  			if mont(fecha)=10
	  				wind=1
	  			else	
	  			if mont(fecha)=11
	  				wind=2
	  			else	
	  			if mont(fecha)=12
	  				wind=3
	  			else	
	  			if mont(fecha)=1
	  				wind=4
	  			else	
	  			if mont(fecha)=2
	  				wind=5
	  			else	
	  			if mont(fecha)=3
	  				wind=6
	  			else	
	  			if mont(fecha)=4 
	  				wind=7
	  			else	
	  			if mont(fecha)=5 
	  				wind=8
	  			else	
	  			if mont(fecha)=6 
	  				wind=9
	  			else	
	  			if mont(fecha)=7
	  				wind=10
	  			else	
	  			if mont(fecha)=8
	  				wind=11
	  			else	
	  			if mont(fecha)=9
	  				wind=12
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
	  			endif
	  			do case
	  				case wind = 1
	  					wf01 = fecha
	  					wp01 = wp01+ importe
	  				case wind = 2
	  					wf02 = fecha
	  					wp02 = wp02+ importe
	  				case wind = 3
	  					wf03 = fecha
	  					wp03 = wp03+ importe
	  				case wind = 4
	  					wf04 = fecha
	  					wp04 = wp04+ importe
	  				case wind = 5
	  					wf05 = fecha
	  					wp05 = wp05+ importe
	  				case wind = 6
	  					wf06 = fecha
	  					wp06 = wp06+ importe
	  				case wind = 7
	  					wf07 = fecha
	  					wp07 = wp07+ importe
	  				case wind = 8
	  					wf08 = fecha
	  					wp08 = wp08+ importe
	  				case wind = 9
	  					wf09 = fecha
	  					wp09 = wp09+ importe
	  				case wind = 10
	  					wf10 = fecha
	  					wp10 = wp10+ importe
	  				case wind = 11
	  					wf11 = fecha
	  					wp11 = wp11+ importe
	  				case wind = 12
	  					wf12 = fecha
	  					wp12 = wp12+ importe
	  			endcase	
	  		endif
	  	endif	
	  	continue
	  enddo
	  if wimpor>0
	  	wop=0
	  else
	  	wop=1	
	  endif	
*      if wop=0
*		if a.titulo='001' or a.titulo='005' or a.titulo='039' or a.titulo='042'
*					wop=0
*		else 	
*				wop=1
*		endif		
*      endif
	endif		
*endif
if wop=0 
      if wdpto=0 or b.dpto=wdpto
	    @18,10 say b.nombre
	    @18,60 say b.nacio
        wop=0
	    if wop=0
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
*            replace domici with b.spemail
            replace tipodom with b.tipo
            replace provin with b.provin
            replace dpto   with b.dpto
            replace locali with b.locali
            replace telef  with ltrim(b.telef)
            replace fecha  with b.nacio
            replace titotorga with wnomtit
            replace sptmatr  with wimpor
*			replace fecha with a.vtohab
*            wanio=year(b.nacio)
*            wedad=1999-wanio
*            replace curso  with wedad 
            if a.inscr  <> {  /  /  }
         	replace fecha1  with a.inscr 
            else
               if a.fechab <> {  /  /  }
                  replace fecha1 with a.fechab
               else
               	  replace fecha1 with wfecha1   
               endif
            endif      	
*            replace fecha1 with b.fallec
		  select 7
		  append blank
		  replace pmatr with a.numero
		  replace pcate with a.catego
		  replace pnomb with b.nombre
		  replace pfe01 with wf01
		  replace ppa01 with wp01
		  replace pfe02 with wf02
		  replace ppa02 with wp02
		  replace pfe03 with wf03
		  replace ppa03 with wp03
		  replace pfe04 with wf04
		  replace ppa04 with wp04
		  replace pfe05 with wf05
		  replace ppa05 with wp05
		  replace pfe06 with wf06
		  replace ppa06 with wp06
		  replace pfe07 with wf07
		  replace ppa07 with wp07
		  replace pfe08 with wf08
		  replace ppa08 with wp08
		  replace pfe09 with wf09
		  replace ppa09 with wp09
		  replace pfe10 with wf10
		  replace ppa10 with wp10
		  replace pfe11 with wf11
		  replace ppa11 with wp11
		  replace pfe12 with wf12
		  replace ppa12 with wp12
*         endif
       endif  
*      endif
    endif
  endif 
*endif 
*enddo
endif   
return

