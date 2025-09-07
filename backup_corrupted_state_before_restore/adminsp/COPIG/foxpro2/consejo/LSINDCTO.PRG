procedure lsindcto
*lista profesionales con nro.de documentos < 10000
set talk off
select 1
use spprof index spprofn
select 2
use temp
zap
append from spprof fields dctipo, dcnro, nombre;
       for dcnro < 10000
*set console off
*set printer to 'LPT1'
*set printer on
*set device to printer
*wlin=77
*select 2
*go top
*do while not eof()
*   if wlin>66
*      do titulos
*   endif
*   ?nombre
*   ??dctipo at 33
*   ??dcnro  at 37
*   skip   
*enddo
*set printer off
*set device to screen
*close all
*read
*clear
return

*procedure titulos
*eject
*?'LISTADO DE PROFESIONALES CON NRO.DE DOCUMENTOS ERRONEOS'
*?
*?'NOMBRE DEL PROFESIONAL         TIPO   NUMERO'
*?
*wlin=4
*return