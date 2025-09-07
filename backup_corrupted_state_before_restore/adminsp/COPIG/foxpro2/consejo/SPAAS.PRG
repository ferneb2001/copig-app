procedure spaas
*actualizacion archivo de sanciones
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION ARCHIVO DE SANCIONES'
@06,02 say 'MATRICULA        CATEGORIA    NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
wkeysa=space(7)
wlin=8
select 1
use spprof index spprof.idx
select 2
use spmatri index spmatri
select 4
use spsanc index spsanc
do while wsigue='S'
   wlin=10
   do limpia
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @06,13 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 clear to 23,78
      @23,01 say 'Indique la categoria'
      @06,30 get wcat pict '!!'
      read
      if lastkey()<>27
    	 @23,01 clear to 23,78
	     wkey=str(wmatri,5)+wcat
    	 select 2
    	 seek(wkey)
    	 if found()
    	    wkey1=str(dctipo,1)+str(dcnro,8)
    	    select 1
    	    seek(wkey1)
    	    if found()
    	       @06,39 say nombre
    	       do ponetit
    	       wlin=8
    	       select 4
    	       locate for wkey=str(matric,5)+catego
    	       do while found()
    	          @wlin,1 say santipo
	    	      @wlin,3 say saninci
	    	      @wlin,5 say sanresol
	    	      @wlin,11 say sanferes
	    	      @wlin,21 say sanvigde
    		      @wlin,31 say sanvigha
    		      @wlin,42 say sancnmat PICT '999'
    		      @wlin,46 say sancpag
    		      @wlin,48 say sanfpag
    		      @wlin,58 say sanreci
*    		      @wlin,19 say sanimpo pict '999999999,99'
    		      @wlin,64 say sanobs pict 'XXXXXXXXXXXXXXXX'
    		      do cartel1
    		      wop=1
    		      @23,01 clear to 23,78
    		      @23,22 get wop pict '@*H \<Continuar;\<Modificar;\<Eliminar' size 1,1
    		      read
    		      @22,01 clear to 23,78
    		      if wop=2
    		         do modisanc
    		      else
    		         if wop=3
    		        	do borrsan
    		         endif
    		      endif
    		      wlin=wlin+1
    		      if wlin > 19
    	             do limpia
    	             wlin=8
    	          endif   
    	          @23,01 clear to 23,78
    		      continue
    	       enddo
    	       wop=1
    	       @23,01 clear to 23,78
    	       @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
    	       read
    	       @23,01 clear to 23,78
    	       if wop = 2
    		      do ingrsan
    	          do limpia
    		      @23,01 clear to 23,78
    	       endif
    	    else
    	       @08,39 say 'No existe'
    	    endif
    	 else
    	    @08,39 say 'No existe'
    	 endif
      else
	     wsigue='N'
      endif
   else
      wsigue='N'
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure ingrsan
wconti='s'
do while wconti='s'
   wtipo=space(1)
   winc=space(1)
   wnresol=0
   wafecha={  /  /  }
   wbfecha={  /  /  }
   wcfecha={  /  /  }
   wcmat=0
   wcpag=0
   wdfecha={  /  /  }
   wrecib=0
   wimporte=0
   wobs=space(20)
   @22,01 say 'Ingrese Tipo (1=Ley 3485.Art.34 2=Etica 3=Art32 4=Art33 5=Art.46 L.5908 6=Otros)'
   @23,01 say '  ¢ (ESC) para salir'
   @wlin,2 get wtipo
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @wlin,3 get winc
      @wlin,5 get wnresol pict '99999'
      @wlin,11 get wafecha
      @wlin,21 get wbfecha
      @wlin,31 get wcfecha
      @wlin,42 get wcmat pict '999'
      @wlin,46 get wcpag pict '9'
      @wlin,48 get wdfecha
      @wlin,58 get wrecib pict '99999'
*      @wlin,19 get wimporte pict '999999999,99'
      @wlin,64 get wobs pict 'XXXXXXXXXXXXXXXX'
      read
      append blank
      replace  matric  with wmatri
      replace  catego  with wcat
      replace  santipo with wtipo
      replace  saninci with winc
      replace  sanresol with wnresol
      replace  sanferes with wafecha
      replace  sanvigde with wbfecha
      replace  sanvigha with wcfecha
      replace  sancnmat	with wcmat
      replace  sancpag	with wcpag
      replace  sanfpag	with wdfecha
      replace  sanreci	with wrecib
      replace  sanimpo	with wimporte
      replace  sanobs   with wobs
      do cartel1
      wlin=wlin+1
      if wlin > 19
         do limpia
         wlin=08
      endif  
   else
      wconti = 'n'
   endif
enddo
return

procedure modisanc
   wtipo=santipo
   winc=saninci
   wnresol=sanresol
   wafecha=sanferes
   wbfecha=sanvigde
   wcfecha=sanvigha 
   wcmat=sancnmat
   wcpag=sancpag
   wdfecha=sanfpag
   wrecib=sanreci
   wimporte=sanimpo
   wobs=sanobs
   @22,01 say ' Ingrese Tipo (1=art34 2=Etica 3=Art32 4=Art33 5=Art.46 L.5908 0=Otros'
   @23,01 say ' ¢ (ESC) p/salir'
   @wlin,2 get wtipo
   read
   @22,01 clear to 23,78
   if lastkey()<>27
      @wlin,3 get winc
      @wlin,5 get wnresol pict '99999'
      @wlin,11 get wafecha
      @wlin,21 get wbfecha
      @wlin,31 get wcfecha
      @wlin,42 get wcmat pict '999'
      @wlin,46 get wcpag pict '9'
      @wlin,48 get wdfecha
      @wlin,58 get wrecib pict '99999'
*      @wlin,19 get wimporte pict '999999999,99'
      @wlin,64 get wobs PICT 'XXXXXXXXXXXXXXXX'
      read
      replace  santipo with wtipo
      replace  saninci with winc
      replace  sanresol with wnresol
      replace  sanferes with wafecha
      replace  sanvigde with wbfecha
      replace  sanvigha with wcfecha
      replace  sancnmat	with wcmat
      replace  sancpag	with wcpag
      replace  sanfpag	with wdfecha
      replace  sanreci	with wrecib
      replace  sanimpo	with wimporte
      replace  sanobs   with wobs
      do cartel1
   endif
@22,01 clear to 23,78
return

procedure borrsan
delete
return

procedure ponetit
@07,01 clear to 20,78
@07,01 say 'T.In.Resol. Fecha     D.  Vigencia  H.'
@07,41 say 'Mat.Cgo.F.Pago   Recibo  Observac.'
@19,01 say '1- Sanc.Ley 3485 Art.34        4 - Sanc.Atr.33 Ley 3485'
@20,01 say '2- Sanc.Faltas Cod. Etica      5 - Art.46 Ley 5908     '
@21,01 say '3- Sanc. Art. 32 Ley 3485      6 - Otros          '
return

procedure limpia
@08,01 clear to 18,78
@22,01 clear to 23,78
return

procedure cartel1
if santipo = '1'
   @22,01 say 'Sanci¢n Ley 3485/63 Art. 34'
   if saninci = 'a' or saninci = 'A'
      @22,29 say 'Advertencia'
   else
      if saninci = 'b' or saninci = 'B'
         @22,29 say 'Amonestaci¢n '
      else
         if saninci = 'c' or saninci = 'C'
            @22,29 say 'Multa 2-100 veces matric.'
         else
            if saninci = 'd' or saninci = 'D' 
               @22,29 say 'Multa y censura publica'
            else
               if saninci = 'e' or saninci = 'E'
                  @22,29 say 'Susp. hasta 2 a¤os y censura p£blica'
               else
                  if saninci = 'f' or saninci = 'F'
                     @22,29 say 'Cancelaci¢n definitiva de matr¡cula'
                  else
                     @22,29 say 'No existe inciso o es incorrecto'
                  endif   
               endif
            endif
         endif
      endif
  endif                      
else
   if santipo = '2'
   @22,01 say 'Sanci¢n por falta al C¢digo de Etica art.64'
      if saninci = 'a' or saninci = 'A'
         @22,29 say 'Falta leve - Advertencia o amonestaci¢n privada'
      else
         if saninci = 'b' or saninci = 'B'
            @22,29 say 'Falta seria - Amonestaci¢n y/o difusi¢n p£bl.'
         else
            if saninci = 'c' or saninci = 'C'
               @22,29 say 'Falta grave - Suspensi¢n ejerc.prof.h.1 a¤o'
            else
               if saninci = 'd' or saninci = 'D'
                  @22,29 say 'Falta grav¡sima-Susp.ejerc.prof. de 1 a 2 a¤os'
               else
                  if saninci = 'e' or saninci = 'E'
                     @22,29 say 'Falta grav¡sima reit.-Susp.eje.prof>2 a¤os o def'
                  else
                     @22,29 say 'NO existe inciso o es err¢neo '
                  endif   
               endif   
            endif   
         endif   
      endif   
   else
      if santipo = '3'
         @22,01 say 'Sanci¢n art¡culo 32 ley 3485/63 '
         @22,29 say 'Ejercicio de la Prof.sin estar inscripto'
      else
         if santipo = '4'
            @22,01 say 'Sanci¢n art 33 ley 3485/63'
            if saninci = 'a' or saninci = 'A'
               @22,29 say 'Ejercicio profesi¢n sin poseer t¡tulo hab.'
            else
               if saninci = 'b' or saninci = 'B'
                  @22,29 say 'Persona responsable del ejerc.prof.sin t¡tulo'
               else
                  @22,29 say 'No existe inciso o es err¢neo'
               endif
            endif
         else
            if santipo = '5'
               @22,01 say 'Suspension art.46 Ley 5908 - Resol 22/94'
            else   
               if saninci = 'v' or saninci = 'V'
                  @22,29 say 'Falta de emisi¢n de voto '
               else
                  @22,29 say 'Otro tipo de sanci¢n'
               endif   
            endif      
         endif
      endif   
   endif
endif
return