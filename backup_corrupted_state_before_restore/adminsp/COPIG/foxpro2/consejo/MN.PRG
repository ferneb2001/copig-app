procedure mn
hide menu pant01
@03,02,23,78 box repl(chr(176),9)
@04,29 clear to 04,52
@03,28 say 'ENVIO DE CORRESPONDENCIA' color n/w
@06,04 clear to 06,61
@05,03 say 'Nro.de orden     Fecha       Salio el   Seccion que Remite';
            color n/w
@11,04 clear to 11,16            
@10,03 say 'Destinatario:' color n/w
@13,15 clear to 13,68
@12,14 say 'Somera descripci¢n del Concepto de la Correspondencia';
       color n/w
wsigue='S'
select 1
use cpar
select 2
use mail index maili, mrtte
do while wsigue='S'
   wrtte=space(30)
   wdest=space(30)
   wfecha=date()
   wdiain=date()
   wcpto1=space(75)
   wcpto2=space(75)
   wcpto3=space(75)
   select 1
   @08,06 clear to 08,10
   @07,05 say notas pict '99999' color n/w
   @22,11 clear to 22,67
   @21,10 say 'Indique la fecha de la correspondencia o <ESC> para salir';
          color n/w
   @08,19 clear to 08,26       
   @07,18 get wfecha
   read
   @21,10,23,67 box repl (chr(176),9)
   if lastkey()<>27
      @22,06 clear to 22,71
      @21,05 say 'Indique la fecha de env¡o de la correspondencia o <ESC> para salir';
             color n/w
      @08,33 clear to 08,40       
      @07,32 get wdiain
      read
      @21,02,22,78 box repl (chr(176),9)
      if lastkey()<>27
         @22,19 clear to 22,63
         @21,18 say 'Seleccione un Rtte. y oprima <ESC> para salir';
                color n/w
         define window prtte from 09,20 to 19,60 float title 'Secciones'
         activate window prtte
         select 3
         use psecc
         browse nomodify in window prtte
         deactivate window prtte
         *@22,02 clear to 23,78
         wrtte=nom
         
         @07,44 say rtrim(wrtte) color n/w
         @11,18 clear to 11,47    
         @10,17 get wdest pict '@!'
         read
         @21,02,23,78 box repl (chr(176),9)
         @22,13 clear to 22,68 
         @21,12 say 'Indique el concepto de la nota u oprima <ESC> para salir';
                color n/w
         @15,04 clear to 17,78                
         @14,03 get wcpto1 pict '@X'
         @15,03 GET Wcpto2 pict '@X'
         @16,03 get wcpto3 pict '@X'
         read
         @21,12,22,68 box repl (chr(176),9)
         wop=1
         @21,26 get wop picture '@*H \<Ingresa;\<No ingresa';
                size 1,1 color scheme 4
         read
         if wop=1
            werr='N'
            select 2
            append blank
            replace nro   with a.notas
            replace fecha with wfecha
            replace recep with wdiain
            replace socio with wsocio
            replace rtte  with wrtte
            replace dest  with wdest
            replace cpto  with wcpto1
            replace cpto2 with wcpto2
            replace cpto3 with wcpto3 
            select 1
            wnota=notas+1
            replace notas with wnota
         endif
      else
         wsigue='N'
      endif      
   else
      wsigue='N'
   endif
enddo      
close all
@03,02,23,78 box repl(chr(176),9)
*@03,02 clear to 23,78
SHOW MENU PANT01
RETURN