procedure spaaRST
*actualizacion archivo de RESTRICCIONES
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION ARCHIVO DE RESTRICCIONES'
@07,02 say 'MATRICULA        CATEGORIA    NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
wkeysa=space(7)
wlin=10
select 1
use spprof index spprof.idx
select 2
use spmatri index spmatri.idx
select 4
use sprestri index sprestri
select 5
use spprofe index spprofe
select 6
use spmatrie index spmatrie
do while wsigue='S'
   wlin=10
   do limpia
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @07,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 clear to 23,78
      @23,01 say 'Indique la categoria'
      @07,29 get wcat pict '!!'
      read
      if lastkey()<>27
         wencont = 0
         if wcat = 'EM'
          	 @23,01 clear to 23,78
	         wkey=str(wmatri,5)+wcat
           	 select 6
    	     seek(wkey)
    	     if found()
    	        wkey1=str(dctipo,1)+str(dcnro,8)
    	        select 5
    	        seek(wkey1)
    	        if found()
    	           @07,39 say nombre
    	        else
    	           @8,39 say 'no existe '
    	           wencont= 1
    	        endif
    	     else
    	        @8,39 say 'no existe '
    	        wencont = 1
    	     endif            
    	 else         
    	    @23,01 clear to 23,78
	        wkey=str(wmatri,5)+wcat
    	    select 2
    	    seek(wkey)
    	    if found()
    	       wkey1=str(dctipo,1)+str(dcnro,8)
    	       select 1
    	       seek(wkey1)
    	       if found()
    	          @07,39 say nombre
    	       else
    	          @08,39 say 'no exite '
    	          wencont = 1
    	       endif
    	    else
    	       @08,39 say ' no existe '
    	       wencont = 1
    	    endif
    	 endif
    	 if wencont = 0               
            do ponetit
    	   *	do buscasan with wmatri, wcat
    	    select 4
    	    locate for wkey=str(matric,5)+catego
    	    do while found()
	    	   @wlin,1 say restrtipo
	    	   @wlin,11 say observac pict 'XXXXXXXXXXXXXXXXXXXXXXX'
	    	   @wlin,35 say restforig
	    	   @wlin,46 say restfactu
	    	   @wlin,57 say restimpo pict '9999999.99'
	    	   @wlin,68 say restfpago
	    	   @wlin,79 say restrotr
    		   wop=1
    		   @23,01 clear to 23,78
    		   @23,22 get wop pict '@*H \<Seguir;\<Modificar;\<Eliminar' size 1,1
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
    *   else
    *      @08,39 say 'No existe'
    *   endif
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
      @wlin,11 get wobserv 
      @wlin,35 get wafecha
      @wlin,46 get wbfecha
      @wlin,57 get wimporte pict '9999999.99'
      @wlin,68 get wcfecha
      @wlin,79 get wcpag pict '9'
      read
      append blank
      replace  matric    with wmatri
      replace  catego    with wcat
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
      @wlin,11 get wobserv 
      @wlin,35 get wafecha
      @wlin,46 get wbfecha
      @wlin,57 get wimporte pict '9999999.99'
      @wlin,68 get wcfecha
      @wlin,79 get wcpago  pict '9'
      read
      replace  restrtipo with winc
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
@09,03 say 'Motivo      Detalle             F.Origen  F.Vencim  Importe   '
@09,68 say 'F. Pago Est.'
@21,30 say 'Est= 0-Debe o no cumplido 1-Cumpido o cancelado'
return

procedure limpia
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
