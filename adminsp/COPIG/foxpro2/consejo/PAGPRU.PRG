procedure pagpru
wkey=space(7)
wcateg=space(2)
wmatric=0
*consulta de pagos de profesionales
@07,01 clear to 23,78
@08,15 say '  FECHA   CONCEPTO DETALLE       IMPORTE    RECIBO   A¥O HAB.'
wsigue='S'
wfecha={  /  /  }
wcpto=space(1)
WDETALLE=SPACE(12)
wimporte=0
wrecibo=0
select 1
use sppagos index sppagos
go top
wlin=10
@10,05 say 'Ingrese matricula y categoria '
@10,40 get wmatric pict '99999'
@10,46 get wcateg  pict '!!'
read
if lastkey() <> 27
   wkey=str(wmatric,5)+wcateg
   seek(wkey)
*locate for str(matric,5)+catego=wkey
   do while found()
      @wlin,15 say fecha
      @wlin,25 say cpto
      @wlin,28 say detalle
      @wlin,43 say importe pict '99999999,99'
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
      skip
*   continue
enddo
*@23,01 say 'fin de la busqueda'
*read
endif
do while wsigue='S'
   wfecha={  /  /  }
   wcpto=space(1)
   wimporte=0
   wdetalle=space(12)
   wrecibo=0
   wanhab=0
   @23,01 say 'Indique fecha del pago o <ESC> para salir'
   @wlin,15 get wfecha
   read
   if lastkey()<>27
      @wlin,25 get wcpto
      @wlin,28 get wdetalle
      @wlin,43 get wimporte pict '99999999,99'
      @wlin,55 get wrecibo  pict '99999999'
      @wlin,67 get wanhab   pict '9999'
      read
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
@07,01 clear to 23,78
return

procedure modipag
wfecha=fecha
wcpto=cpto
wimporte=importe
wdetalle=space(12)
wrecibo=recibo
wanhab=anhabil
@23,01 say 'Ingrese los datos a modificar'
*@wlin,15 get wfecha
*read
*if lastkey()<>27
   @wlin,15 get wfecha
   @wlin,25 get wcpto
   @wlin,28 get wdetalle
   @wlin,39 get wimporte pict '99999999,99'
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