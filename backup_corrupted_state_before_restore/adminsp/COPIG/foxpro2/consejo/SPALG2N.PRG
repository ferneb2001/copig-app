procedure spalg2n
*listado de profesionales
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PROFESIONALES ALFABETICO'
set talk off
select 2
use spprof index spprof.idx
select 3
set exclusive on
set safety off
set century on
set date to dmy
use sptempo
*zap
set exclusive off
whabi=' '
WFECHA={30/04/2002}
wop=1
wnomtit=space(30)
   wop=1
   wcatego='  '
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      use sptempo
*      if wdpto=0 .and. wtitulo='   ' 
         sort to sptempos on  nombre
         do imprime
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
*   ???chr(27)+chr(15)
   wlin=0
   whoja=1
   wcateg=catego
   wtitu=titulo
   do titulos
   wkey=wcatego+wtitu
   do while .not. eof()
      wtitulo=titulo
         if wlin > 85
            do titulos
         endif   
      select 5
      use sptitu order titulo
      seek(wtitulo)
      if found()
         wnomtit=titdesc
      else
         wnomtit=space(30)
      endif
      select 1         
      ?numero pict '99999'
*      ??catego at 6
    *  ??titulo at 13 
      ??nombre  at 9
      ?? wnomtit at 40
      wlin=wlin+1
      if wlin > 85
 *        eject
         do titulos
*         do titulosb
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
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE PROFESIONALES           ' AT 20
*?? wcateg at 57
if whabi='S'
   ??' (habilitados)' at 61
else
   if whabi='N'
      ??' (no habilitados)' at 61
   endif      
endif
?? 'Fecha: ' at 80
?? wfecha at 87   
??'HOJA NRO. ' at 110
??whoja pict '999'
?
? 'MATRIC.        NOMBRE'
?? 'TITULO   ' AT 47
?? '         ' AT 79
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
if wcatego <> '  ' and catego = 'CR'
   wop = 1
else   
   select 2
   seek(str(a.dctipo,1)+str(a.dcnro,8))
   if found()
      if wdpto=0 or dpto=wdpto
         if b.nombre > wnomdes and b.nombre <= wnomhas
*           if b.nacio={  /  /  } 
			wpase=0
			if wopdom=1
				wpase =1
			else
				if wopdom=2
				   if b.tipo<>0
				     	wpase=1
				   endif
				else
				   if wopdom=3
				      if b.tipo=0
				         wpase=1
				      endif   
				   endif
				endif
			endif
			if wpase = 1
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
*       	 	 if b.provin > 1 
*       	 	 	replace dpto with 19
*       	 	 else
       	 	    replace dpto   with b.dpto
*       	 	 endif   
       	 	 replace locali with b.locali
       		  replace telef  with ltrim(b.telef)
       		  replace tipodom with b.tipo
       		  replace fecha   with b.nacio
       		endif  
*       	  endif	  
       	 endif
      endif
   endif
endif   
return