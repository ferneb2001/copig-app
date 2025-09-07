procedure exmm
*movimiento de expedientes    
hide menu pant01
*@03,02,23,78 box repl(chr(176),9)
@04,02 clear to 23,78
@03,28 say 'MOVIMIENTO DE EXPEDIENTES' color n/w
@06,04 clear to 06,46
@05,03 say 'Nro.Expte.  de fecha   recibida   Remitente' color n/w
wsigue='S'
select 1
use exptes index exptesi
do while wsigue='S'
   wnro=0
   wletra=space(1)
   wano=0
   wfecha={  /  /  }
   wdiain=wfecha
   wrtte=space(30)
   wcpto=space(75)
   select 1
   @22,15 clear to 22,66
   @21,14 say 'Indique el Nro.de Expediente o <ESC> para salir';
          color n/w
   @07,02 get wletra pict '!'       
   @07,04 get wnro pict '99999'
   @07,10 get wano pict '9999'
   read
   @07,30 clear to 07,78
*   wano=wano+1900
   @21,02 clear to 21,78
   *@21,02,23,78 box repl(chr(176),9)
   *@07,09 clear to 07,78
   wkey=wletra+str(wnro,5)+str(wano,4)
   if lastkey()<>27
      seek(wkey)
      if found()
         *@07,15 say fecha color n/w
         @07,26 say recep color n/w
         if matri>0
            @07,37 say matri pict '99999999' color n/w
            @07,46 say rtrim(rtte) color n/w
         else
            @07,37 say rtrim(rtte) color n/w
         endif
         *@10,04 clear to 12,78
         @09,03 say cpto  color n/w
         @10,03 say cpto2 color n/w
         @11,03 say cpto3 color n/w
         werr='S'
         do while werr='S'
            wop=space(1)
            *@22,20 clear to 22,59
            *@22,61 clear to 22,61
            @21,19 say 'Quiere mover este Expediente??(S/N)'color n/w 
            @21,55 get wop picture '!' 
            read
            @21,02 clear to 21,78
            if wop='N'
               werr='N'
            else
               if wop='S'
                  werr='N'
                  do mueve
               else
                  @23,53 say 'Opci¢n erronea' color w*/n
               endif         
            endif
         enddo      
      else
         wrtte='Nro.de Expediente no existe'
         @07,37 say wrtte
      endif
   else
      wsigue='N'
   endif
enddo
close all               
@03,02 clear to 23,78
SHOW menu pant01
do pie
return

procedure mueve
@14,03 clear to 14,52
@13,02 say '  Fecha    a secci¢n                 Observaciones';
       color n/w
@16,02 get wfecha
read
define window psec from 05,48 to 22,78 float title 'Secciones'
activate window psec
select 2
use psecc index psecn
brow nomodify in window psec
deactivate window psec
wsec=secc
wobs=space(39)
@16,13 say nom
@16,39 get wobs
read
select 2
use expmov  index expmov  
append blank
replace cod   with wletra
replace nro with wnro
replace ano   with wano
replace fecha with  wfecha
replace hora  with time()
replace secc  with wsec
replace obs   with wobs
use  
return
