procedure pagos
parameter wkey
*consulta de pagos de profesionales
@08,01 clear to 23,78
@08,15 say '  FECHA   CONCEPTO DETALLE       IMPORTE    RECIBO   A¥O HAB.'
wsigue='S'
wtodo=0
@23,01 clear to 23,70
@23,01 say 'Muestra ultimos pagos, para mostrar todos coloque 1'
@23,77 get wtodo pict '9' 
read
wfecha={  /  /  }
wcpto=space(1)
WDETALLE=SPACE(12)
wimporte=0
wrecibo=0
whabi=wfecbh
select 10
use sppagos index sppagos.idx 
go top
wlin=10
*wkey=str(matric,5)+catego
*locate for str(matric,5)+catego=wkey
seek(wkey)
do while found()
*   IF wkey=str(matric,5)+catego
   do while wkey=str(matric,5)+catego
      if wtodo<> 0
	      @wlin,3  say matric pict '99999'
   		  @wlin,9 say catego pict 'XX'
	      @wlin,12 say fecha
	      @wlin,23 say cpto
	      @wlin,28 say detalle
	      @wlin,43 say importe pict '999999999.99'
	      @wlin,55 say recibo
	      @wlin,67 say anhabil
 	      wop1=1
     	 @23,20 get wop1 pict "@*H \<Continuar;\<Eliminar;\<Modificar" size 1,1
	      read
	      if wop1 = 2
    	     delete
	      else
    	     if wop1 = 3
	            do modipag
    	     endif
	      endif         
	      if wlin<21
    	     wlin=wlin+1
	      else
	        @23,01 clear to 23,78
    	    @23,01 say 'Oprima cualquier tecla para seguir'
	        read
    	    wlin=10
	        @10,01 clear to 23,78
	      endif
	   else
	   	 if anhabil>=whabi-2        
	      @wlin,3  say matric pict '99999'
   		  @wlin,9 say catego pict 'XX'
	      @wlin,12 say fecha
	      @wlin,23 say cpto
	      @wlin,28 say detalle
	      @wlin,43 say importe pict '999999999.99'
	      @wlin,55 say recibo
	      @wlin,67 say anhabil
 	      wop1=1
     	 @23,20 get wop1 pict "@*H \<Continuar;\<Eliminar;\<Modificar" size 1,1
	      read
	      if wop1 = 2
    	     delete
	      else
    	     if wop1 = 3
	            do modipag
    	     endif
	      endif         
	      if wlin<21
    	     wlin=wlin+1
	      else
	        @23,01 clear to 23,78
    	    @23,01 say 'Oprima cualquier tecla para seguir'
	        read
    	    wlin=10
	        @10,01 clear to 23,78
	      endif
	     endif      
	     endif
*  continue   
	      skip
   enddo
*    else
       exit
*    endif      
enddo
*@23,01 say 'fin de la busqueda'
*read
do while wsigue='S'
   wfecha={  /  /  }
   wcpto=space(1)
   wimporte=0
   wdetalle=space(12)
   wrecibo=0
   wanhab=0
   @23,01 say 'Indique fecha del pago o <ESC> para salir'
   @wlin,12 get wfecha
   read
   if lastkey()<>27
      @wlin,23 get wcpto
      @wlin,28 get wdetalle
      @wlin,43 get wimporte pict '99999999.99'
      @wlin,55 get wrecibo  pict '99999999'
      @wlin,67 get wanhab   pict '9999'
      read
      if wdetalle='aa'
      		wdetalle='der.inscr.'
      		@wlin,28 say wdetalle
      endif		
      append blank
      replace matric    with val(substr(wkey, 1,5))
      replace catego    with substr(wkey, 6,2)
      replace fecha     with wfecha
      replace cpto      with wcpto
      replace detalle   with wdetalle
      replace importe   with wimporte
      replace recibo    with wrecibo
      replace anhabil   with wanhab
      if wlin<21
         wlin=wlin+1
      else
         @23,01 say 'Oprima cualquier tecla para seguir'
         read
         wlin=10
         @10,01 clear to 23,78
      endif      
   else
      wsigue='N'
   endif
enddo      
close all
@08,01 clear to 23,78
return

procedure modipag
wfecha=fecha
wcpto=cpto
wimporte=importe
wdetalle=detalle
wrecibo=recibo
wanhab=anhabil
@23,01 say 'Ingrese los datos a modificar'
*@wlin,12 get wfecha
*read
*if lastkey()<>27
   @wlin,12 get wfecha
   @wlin,23 get wcpto
   @wlin,28 get wdetalle
   @wlin,43 get wimporte pict '99999999.99'
   @wlin,55 get wrecibo  pict '99999999'
   @wlin,67 get wanhab   pict '9999'
   read
   replace fecha     with wfecha
   replace cpto      with wcpto
   replace detalle   with wdetalle
   replace importe   with wimporte
   replace recibo    with wrecibo
   replace anhabil   with wanhab
*   if wlin<21
*      wlin=wlin+1
*   else
*      @23,01 say 'Oprima cualquier tecla para seguir'
*      read
*      @10,01 clear to 23,78
*      wlin=10
*      @23,01 clear to 23,78
*   endif      
*else
*   wsigue='N'
*endif
@23,01 clear to 23,78
return