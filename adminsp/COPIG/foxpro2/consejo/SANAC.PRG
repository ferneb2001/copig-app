procedure sanac
*actualizacion archivo de sanciones a no profesionales
@04,01 clear to 23,78
@04,12 say 'ACTUALIZACION ARCHIVO DE SANCIONES A NO PROFESIONALES'
@06,02 say 'NUM.ORDEN       CLASE     NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
wkeysa=space(7)
wnombre=space(30)
wdocum=0
wlin=10
select 4
use sancion index sancion
wop22=0
@23,01 get wop22 pict '@*H \<Numerico; \<Alfabetico' size 1,1
read
if wop22=1
  define window psan from 07,01 to 22,75
  activate window psan
  brow fields matric, catego, nombre, sanresol, sanferes in window psan
  deactivate window psan
  @07,01 clear to 22,75
else
   use sancion order nombre 
   define window psan from 07,01 to 22,75
  activate window psan
  brow fields matric, catego, nombre, sanresol, sanferes in window psan
  deactivate window psan
  @07,01 clear to 22,75
endif
select 4
use sancion order matric  
go bottom
   do ponetit
   @06,12 say matric
   @06,25 say catego
   @06,39 say nombre
   @08,19 say santipo
   @09,19 say saninci
   @10,19 say sanresol
   @11,19 say sanferes
   @12,19 say sanvigde
   @13,19 say sanvigha
   @14,19 say sancnmat
   @15,19 say sancpag
   @16,19 say sanfpag
   @17,19 say sanreci
   @18,19 say sanimpo pict '999999999,99'
   @19,19 say sanobs
   @20,19 say sandoc
   do cartel1
   wop=1
   @23,01 clear to 23,78
   @23,22 get wop pict '@*H \<Ultimo registro utilizado   ' size 1,1
   read
   @23,01 clear to 23,78
do while wsigue='S'
   wlin=10
   do limpia
   select 4
   use sancion index sancion
   @23,01 say 'Indique el nro.de orden o <ESC> para salir'
   @06,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 clear to 23,78
      @23,01 say 'Indique la clase: P=Profesional EN=Entidad/Empresa F=Otros'
      @06,25 get wcat pict '!!'
      read
      if lastkey()<>27
    	 @23,01 clear to 23,78
    	 wkey=str(wmatri,5)+wcat
    	 if wcat = 'P ' .or. wcat = 'EN' .or. wcat = 'F '
    	       select 4
    	       locate for wkey=str(matric,5)+catego
    	       do while found()
    	          do ponetit
    	          @06,39 say nombre
    	          @08,19 say santipo
	    	      @09,19 say saninci
	    	      @10,19 say sanresol
	    	      @11,19 say sanferes
	    	      @12,19 say sanvigde
    		      @13,19 say sanvigha
    		      @14,19 say sancnmat
    		      @15,19 say sancpag
    		      @16,19 say sanfpag
    		      @17,19 say sanreci
    		      @18,19 say sanimpo pict '999999999,99'
    		      @19,19 say sanobs
    		      @20,19 say sandoc
    		      do cartel1
    		      wop=1
    		      @23,01 clear to 23,78
    		      @23,22 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
    		      read
    		      @23,01 clear to 23,78
    		      if wop=2
    		         do modisanc
    		      else
    		         if wop=3
    		        	do borrsan
    		         endif
    		      endif
    	          do limpia
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
   do ponetit
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
   wnombre= space(30)
   wobs=space(20)
   wdocum=0
   @23,01 say 'Ingrese nombre o raz¢n social'
   @06,39 get wnombre
   read
   @23,01 clear to 23,78
   @23,01 say 'Ingrese Tipo (1=Ley 3485 2=Etica 3=Art32 4=Art33 0=Otros) ¢ (ESC) para salir'
   @08,19 get wtipo
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @09,19 get winc
      @10,19 get wnresol pict '99999'
      @11,19 get wafecha
      @12,19 get wbfecha
      @13,19 get wcfecha
      @14,19 get wcmat pict '99999'
      @15,19 get wcpag pict '9'
      @16,19 get wdfecha
      @17,19 get wrecib pict '999999'
      @18,19 get wimporte pict '999999999,99'
      @19,19 get wobs
      @20,19 get wdocum pict '99999999'
      read
      append blank
      replace  nombre  with wnombre
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
      replace  sandoc   with wdocum
   else
      wconti = 'n'
   endif
enddo
return

procedure modisanc
   wnombre=nombre
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
   wdocum=sandoc
   @06,39 get wnombre
   read
   @23,01 say 'Ingrese Tipo (1=art34 2=Etica 3=Art32 4=Art33 0=Otros ¢ (ESC) p/salir'
   @08,19 get wtipo
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @09,19 get winc
      @10,19 get wnresol pict '99999'
      @11,19 get wafecha
      @12,19 get wbfecha
      @13,19 get wcfecha
      @14,19 get wcmat pict '99999'
      @15,19 get wcpag pict '9'
      @16,19 get wdfecha
      @17,19 get wrecib pict '999999'
      @18,19 get wimporte pict '999999999,99'
      @19,19 get wobs
      @20,19 get wdocum pict '99999999'
      read
      replace  nombre  with wnombre
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
      replace  sandoc   with wdocum
   endif
@23,01 clear to 23,78
return

procedure borrsan
delete
return

procedure ponetit
@08,01 clear to 20,78
@08,03 say 'Tipo           :'
@09,03 say 'Inciso         :'
@10,03 say 'Resoluci¢n     :'
@11,03 say 'Fecha Resol/not:'
@12,03 say 'Vigencia desde :'
@13,03 say 'Vigencia hasta :'
@14,03 say 'Cant.Matriculas:'
@15,03 say 'Codigo de pago :'
@16,03 say 'Fecha Pago     :'
@17,03 say 'Recibo         :'
@18,03 say 'Importe        :'
@19,03 say 'Observaciones  :'
@20,03 say 'Documento Id.  :'
return

procedure limpia
@10,19 clear to 10,78
@11,19 clear to 11,78
@12,19 clear to 12,78
@13,19 clear to 13,78
@14,19 clear to 14,78
@15,19 clear to 15,78
@16,19 clear to 16,78
@17,19 clear to 17,78
@18,19 clear to 18,78
@19,19 clear to 19,78
@20,19 clear to 20,78
return

procedure cartel1
if santipo = '1'
   @08,29 say 'Sanci¢n Ley 3485/63 Ley 5908/92'
   if saninci = 'a' or saninci = 'A'
      @09,29 say 'Advertencia'
   else
      if saninci = 'b' or saninci = 'B'
         @09,29 say 'Amonestaci¢n '
      else
         if saninci = 'c' or saninci = 'C'
            @09,29 say 'Multa 2-100 veces matric.'
         else
            if saninci = 'd' or saninci = 'D' 
               @09,29 say 'Multa y censura publica'
            else
               if saninci = 'e' or saninci = 'E'
                  @09,29 say 'Susp. hasta 2 a¤os y censura p£blica'
               else
                  if saninci = 'f' or saninci = 'F'
                     @09,29 say 'Cancelaci¢n definitiva de matr¡cula'
                  else
                     @09,29 say 'No existe inciso o es incorrecto'
                  endif   
               endif
            endif
         endif
      endif
  endif                      
else
   if santipo = '2'
   @08,29 say 'Sanci¢n por falta al C¢digo de Etica'
      if saninci = 'a' or saninci = 'A'
         @09,29 say 'Falta leve - Advertencia o amonestaci¢n privada'
      else
         if saninci = 'b' or saninci = 'B'
            @09,29 say 'Falta seria - Amonestaci¢n y/o difusi¢n p£bl.'
         else
            if saninci = 'c' or saninci = 'C'
               @09,29 say 'Falta grave - Suspensi¢n ejerc.prof.h.1 a¤o'
            else
               if saninci = 'd' or saninci = 'D'
                  @09,29 say 'Falta grav¡sima-Susp.ejerc.prof. de 1 a 2 a¤os'
               else
                  if saninci = 'e' or saninci = 'E'
                     @09,29 say 'Falta grav¡sima reit.-Susp.eje.prof>2 a¤os o def'
                  else
                     @09,29 say 'NO existe inciso o es err¢neo '
                  endif   
               endif   
            endif   
         endif   
      endif   
   else
      if santipo = '3'
         @08,29 say 'Sanci¢n art¡culo 32 ley 3485/63 '
         @09,29 say 'Ejercicio de la Prof.sin estar inscripto'
      else
         if santipo = '4'
            @08,29 say 'Sanci¢n art 33 ley 3485/63'
            if saninci = 'a' or saninci = 'A'
               @09,29 say 'Ejercicio profesi¢n sin poseer t¡tulo hab.'
            else
               if saninci = 'b' or saninci = 'B'
                  @09,29 say 'Persona responsable del ejerc.prof.sin t¡tulo'
               else
                  @09,29 say 'No existe inciso o es err¢neo'
               endif
            endif
         else
            if saninci = 'v' or saninci = 'V'
               @09,29 say 'Falta de emisi¢n de voto '
            else
               @09,29 say 'Otro tipo de sanci¢n'
            endif      
         endif
      endif   
   endif
endif
return