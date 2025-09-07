procedure pagosm
*actualizacion del archivo de pagos
@04,01 clear to 23,78
@04,22 say 'ACTUALIZACION DEL ARCHIVO DE PAGOS'
@06,15 say 'Matr¡cula:         Categor¡a:     '
@08,15 say '  FECHA   CONCEPTO        IMPORTE        RECIBO    A¥O HAB.'
select 5
use sppagos index sppagos, sppagin
wsigue='S'
wcod=0
wcat=space(2)
wlin=10
wkey=space(7)
wnom=space(30)
do while wsigue='S'
   @23,01 say 'Indique Matr¡cula o <ESC> para salir'
   @06,26 get wcod pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @23,01 clear to 23,78
      @23,01 say 'Indique Categor¡a o <ESC> para salir'
      @06,45 get wcat pict '!!'
      read
      if lastkey() <> 27
         wkey=str(wcod,5)+wcat
*         seek(wkey)
*         if found()
            locate for wkey=str(matric,5)+catego
            do while  found()
               @wlin,15 say fecha
               @wlin,28 say cpto
               @wlin,39 say importe pict '999999,99'
               @wlin,55 say recibo
               @wlin,65 say anhabil
               wop=1
               @23,01 clear to 23,78
               @23,22 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
               read
               if wop=2
                  do modipag
               else
                  if wop=3
                     do borrpag
                  endif      
               endif
               if wlin < 23
                  wlin = wlin + 1
               else
                  @23,01 say 'Oprima cualquier tecla para seguir '
                  read
                  wlin = 10
                  @23,01 clear to 23,78
               endif      
               continue
            enddo
 *        endif   
         wop = 1
         @23,01 clear to 23,78
         @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
         read
         if wop = 2
            do ingrpag
            wlin = wlin + 1
         endif
      else
         wsigue = 'n'
      endif         
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure modipag
wfecha=fecha
wcpto=cpto
wimporte=importe
wrecibo=recibo
wanhab=anhabil
@23,01 say 'indique fecha o <ESC> para salir'
@wlin,15 get wfecha
read
if lastkey <> 27
   @wlin,28 get wcpto
   @wlin,39 get wimporte pict '999999,99'
   @wlin,55 get wrecibo pict  '99999999'
   @wlin,67 get wanhab  pict  '9999'
   read
   replace fecha   with wfecha
   replace cpto    with wcpto
   replace importe with wimporte
   replace recibo  with wrecibo
   replace anhabil with wanhab
endif
@23,01 clear to 23,78
return

procedure borrpag
delete
return

procedure ingrpag
wconti = 's'
do while wconti = 's'
   wfecha={  /  /  }
   wcpto = 0
   wrecibo=0
   wimporte=0
   wanhab=0
   @23,01 say 'Indique la fecha de pago o <ESC> para seguir'
   @wlin,15 get wfecha
   read
   if lastkey() <> 27
      @wlin,28 get wcpto
      @wlin,39 get wimporte pict '999999,99'
      @wlin,55 get wrecibo  pict '99999999'
      @wlin,67 get wanhab   pict '9999'
      read
      append blank
      replace matric     with val(substr(wkey,1,5))
      replace catego     with substr(wkey,6,2)
      replace fecha      with wfecha
      replace cpto       with wcpto
      replace importe    with wimporte
      replace recibo     with wrecibo
      replace anhabil    with wanhab
*      wlin = wlin+1
   else
      wconti = 'n'
   endif
enddo
return

