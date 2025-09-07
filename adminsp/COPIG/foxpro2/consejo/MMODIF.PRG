procedure mmodif
*modificacion de correspondencia
hide menu pant01
@03,02,23,78 box repl(chr(176),9)
@04,27 clear to 04,55
@03,26 say 'MODIFICACION DE CORRESPONDENCIA' color n/w
@06,04 clear to 06,46
@05,03 say 'Nro.Nota    de fecha   recibida   Remitente' color n/w
wsigue='S'
select 1
use mail index maili
do while wsigue='S'
   wnro=0
   wletra=space(1)
   wfecha={  /  /  }
   wdiain=wfecha
   wano=0
   wrtte=space(30)
   wcpto=space(75)
   select 1
   @22,15 clear to 22,66
   @21,14 say 'Indique el Nro.de Correspondencia o <ESC> para salir';
          color n/w
   @07,02 get wletra pict '!'       
   @07,04 get wnro pict '99999'
   @07,10 get wano pict '9999'
   read
   @21,02,23,78 box repl(chr(176),9)
   *@07,09 clear to 07,78
   wkey=wletra+str(wnro,5)+str(wano,4)
   if lastkey()<>27
      seek(wkey)
      if found()
         @07,15 say fecha color n/w
         @07,26 say recep color n/w
         if socio>0
            @07,37 say socio pict '99999999' color n/w
            @07,46 say rtrim(rtte) color n/w
         else
            @07,37 say rtrim(rtte) color n/w
         endif
         @10,04 clear to 12,78
         @09,03 say cpto  color n/w
         @10,03 say cpto2 color n/w
         @11,03 say cpto3 color n/w
         werr='S'
         do while werr='S'
            wop=space(1)
            @22,20 clear to 22,59
            @22,61 clear to 22,61
            @21,19 say 'Quiere modif. esta correspondencia??(S/N)'color n/w 
            @21,60 get wop picture '!' 
            read
            if wop='N'
               werr='N'
            else
               if wop='S'
                  werr='N'
                  do modifica
               else
                  @23,53 say 'Opci¢n erronea' color w*/n
               endif         
            endif
         enddo      
      else
         wrtte='Nro.de corresp. no existe'
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

procedure modifica
@14,03 clear to 14,52
         @10,04 clear to 12,78
         @09,03 get cpto  color n/w
         @10,03 get cpto2 color n/w
         @11,03 get cpto3 color n/w
         read
use  
return
