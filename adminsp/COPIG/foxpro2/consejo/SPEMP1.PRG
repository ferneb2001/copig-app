procedure spemp1
*actualizacion archivo de NOTIFICACIONES EMPRESAS
@04,01 clear to 23,78
@04,20 say 'ACTUALIZACION ARCHIVO DE NOTIF.EMPRESAS'
@07,02 say 'MATRICULA        CATEGORIA    NOMBRE'
wsigue='S'
wmatri=0
wcat=space(2)
wkey=space(7)
wfecha=date()
wkeysa=space(7)
wlin=10
select 1
use spprofe index spprofe
select 2
use spmatrie index spmatrie
select 4
use spempres index spempres 
do while wsigue='S'
   wlin=10
   do limpia
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @07,12 get wmatri pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 clear to 23,78
*      @23,01 say 'Indique la categoria'
*      @07,29 get wcat pict '!!'
*      read
*      if lastkey()<>27
         wencont = 0
         wcat='EM'
         if wcat = 'EM'
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
    	           @8,39 say 'no existe '
    	           wencont= 1
    	        endif
    	     else
    	        @8,39 say 'no existe '
    	        wencont = 1
    	     endif            
    	 endif
    	 if wencont = 0               
            do ponetit
    	    select 4
    	    locate for wkey=str(emmatr,5)+emcate
    	    do while found()
	    	   @wlin,3 say emdeta
	    	   @wlin,31 say emfecha 
	    	   @wlin,40 say emfevto
	    	   @wlin,49 say emnunot
	    	   @wlin,57 say emfecum
    		   wop=1
    		   @23,01 clear to 23,78
    		   @23,22 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
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
    *	 else
    * 	    @08,39 say 'No existe'
    *	 endif
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
   winc=space(25)
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
   @wlin,3 get winc
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @wlin,31 get wafecha
      @wlin,40 get wbfecha
      @wlin,49 get wrecib pict '9999999'
      @wlin,57 get wcfecha
      read
      append blank
      replace  emmatr    with wmatri
      replace  emcate    with wcat
      replace  emdeta    with winc
*      replace  observac  with wobserv
      replace  emfecha   with wafecha
      replace  emfevto   with wbfecha
      replace  emnunot   with wrecib
      replace  emfecum   with wcfecha  
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
   winc=emdeta
   wafecha=emfecha  
   wbfecha=emfevto
   wrecib=emnunot
   wcfecha=emfecum
   @23,01 say 'Ingrese Motivo ¢ (ESC) para salir'
   @wlin,3 get winc
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @wlin,31 get wafecha
      @wlin,40 get wbfecha
      @wlin,49 get wrecib  pict '9999999'
      @wlin,57 get wcfecha
      read
      replace  emdeta    with winc
      replace  emfecha   with wafecha
      replace  emfevto   with wbfecha
      replace  emnunot   with wrecib  
      replace  emfecum   with wcfecha
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
@09,03 say 'Motivo                     F.Origen F.Vencim  N.Nota  F.Cumplido '
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
