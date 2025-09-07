procedure sprstnop
*actualizacion archivo de RESTRICCIONES A NO INSCRIPTOS
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION ARCHIVO DE RESTRICCIONES A NO INSCRIPTOS'
@07,02 say 'NRO.ORDEN        TIPO         NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
wkeysa=space(7)
wlin=10
select 4
use sprstnop order matric
wop22=0
@23,01 get wop22 pict '@*H \<Num‚rico; \<Alfab‚tico' size 1,1
read
if wop22=1
   define window psan from 07,01 to 22,75
   activate window psan
   brow fields matric, catego, nombre, restrtipo, restforig in window psan
   deactivate window psan 
   @07,01 clear to 22,75
else
   select 4
   use sprstnop order nombre
   define window psan from 07,01 to 22,75
   activate window psan    
   brow fields matric, catego, nombre, restrtipo, restforig in window psan
   deactivate window psan 
   @07,01 clear to 22,75
endif
select 4
use sprstnop index sprstnop
go bottom
   do ponetit
       @08,25 say nombre    
  	   @wlin,1 say restrtipo
   	   @wlin,12 say observac
   	   @wlin,38 say restforig
   	   @wlin,48 say restfactu
   	   @wlin,58 say restimpo pict '999999.99'
   	   @wlin,67 say restfpago
   	   @wlin,77 say restrotr
	   wop=1
	   @23,01 clear to 23,78
	   @23,22 get wop pict '@*H \<Ultimo registro utilizado' size 1,1
	   read
	   @23,01 clear to 23,78
   do while wsigue = 'S'	   
      wlin=10
      do limpia
      @23,01 say 'Indique el n£mero de orden o <ESC> para salir' size 1,1
      @06,12 get wmatri pict '99999'
      read
      @23,01 clear to 23,78
      if lastkey()<>27
         @23,01 clear to 23,78
         @23,01 say 'Indique la clase: P=Profesional EN=Entid/Empresa F=Otros'
         @06,25 get wcat pict '!!'
         read
         if lastkey()<>27
            @23,01 clear to 23,78
            wkey=str(wmatri,5)+wcat
            if wcat = 'P ' or wcat = 'EN' or wcat = 'F '
               select 4
               locate for wkey= str(matric,5)+catego
               do while found()
                  do ponetit
                  @08,25 say nombre
           	      @wlin,1 say restrtipo
   	   			  @wlin,12 say observac
   	   			  @wlin,38 say restforig
   	   			  @wlin,48 say restfactu
   	   			  @wlin,58 say restimpo pict '999999.99'
   	   			  @wlin,67 say restfpago
   	   		  	  @wlin,77 say restrotr
*   	   		  	  do cartel1
   	   		  	  wop=1
   	   		  	  @23,01 clear to 23,78
   	   		  	  @23,01 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
   	   		  	  read
   	   		  	  @23,01 clear to 23,78
		          if wop=2
	    		     do modirest
	   			  else
	     			 if wop=3
	        		    do borrest
	     			 endif
	  			  endif
	   			  if wlin < 20
	     		     wlin = wlin + 1
	   			  else
	     			 @23,01 say 'Oprima cualquier tecla para continuar'
	     			 read
	     			 wlin=10
         			 do limpia
         			 @23,01 clear to 23,78
      			  endif
      			  continue
   			   enddo
    		wop=1
   			@23,01 clear to 23,78
    	    @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
   		    read
   		    @23,01 clear to 23,78
    		if wop = 2
       			do ingrest
       			if wlin < 20
        	       wlin = wlin + 1
      			else
        		   @23,01 say 'Oprima cualquier tecla para continuar'
    			   read
    	 		   wlin = 10
    			   do limpia
    	 		   @23,01 clear to 23,78
      			endif
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

procedure ingrest
wconti='s'
do while wconti='s'
   wnombre=space(30)
   winc=space(10)
   wobserv=space(25)
   wnresol=0
   wafecha={  /  /  }
   wbfecha={  /  /  }
   wcfecha={  /  /  }
   wcmat=0
   wcpag=0
   wdfecha={  /  /  }
   wrecib=0
   wimporte=0
   @23,01 say 'Ingrese Motivo  ¢ (ESC) para salir'
   @wlin,1 get winc
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @08,25  get wnombre
      @wlin,12 get wobserv 
      @wlin,38 get wafecha
      @wlin,48 get wbfecha
      @wlin,58 get wimporte pict '999999.99'
      @wlin,67 get wcfecha
      @wlin,77 get wcpag pict '9'
      read
      append blank
      replace  matric    with wmatri
      replace  catego    with wcat
      replace  nombre    with wnombre
      replace  restrtipo with winc
      replace  observac  with wobserv
      replace  restforig with wafecha
      replace  restfactu with wbfecha
      replace  restimpo  with wimporte
      replace  restfpago with wcfecha
      replace  restrotr  with wcpag
   else
      wconti = 'n'
   endif
   if wlin < 20
      wlin=wlin+1
   else
      wlin=10
      @10,01 clear to 20,78
   endif      
enddo
return

procedure modirest
   wnombre=nombre
   winc=restrtipo
   wobserv=observac
   wafecha=restforig
   wbfecha=restfactu
   wcfecha=restfpago
   wimporte=restimpo
   wcpago=restrotr
   @23,01 say 'Ingrese Motivo ¢ (ESC) para salir'
   @wlin,1 get winc
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @08,25   get wnombre
      @wlin,12 get wobserv 
      @wlin,38 get wafecha
      @wlin,48 get wbfecha
      @wlin,58 get wimporte pict '999999.99'
      @wlin,67 get wcfecha
      @wlin,77 get wcpago  pict '9'
      read
      replace  restrtipo with winc
      replace  nombre    with wnombre
      replace  observac  with wobserv
      replace  restforig with wafecha
      replace  restfactu with wbfecha
      replace  restfpago with wcfecha
      replace  restimpo  with wimporte
      replace  restrotr  with wcpago
   endif
@23,01 clear to 23,78
return

procedure borrest
delete
return

procedure ponetit
@08,01 clear to 08,78
@09,01 clear to 09,78
*@08,25 say ' Vigencia '
@09,03 say 'Motivo      Detalle                F.Origen F.Vencim  Importe   '
@09,68 say 'F. Pago Est.'
@21,30 say 'Est= 0-Debe o no cumplido 1-Cumpido o cancelado'
return

procedure limpia
@08,25 clear to 08,78
@10,01 clear to 10,78
@11,01 clear to 11,78
@12,01 clear to 12,78
@13,01 clear to 13,78
@14,01 clear to 14,78
@15,01 clear to 15,78
@16,01 clear to 16,78
@17,01 clear to 17,78
@18,01 clear to 18,78
return
