procedure lsindct1
*lista profesionales con nro.de documentos < 10000
set talk off
select 1
use spmatri index spmatdo
select 2
use temp
set console off
set printer to 'LPT1'
set printer on
set device to printer
wlin=77
wkey=space(9)
select 2
go top
do while not eof()
   if wlin>66
      do titulos
   endif
   wkey = str(dctipo,1)+str(dcnro,8)
   select 1
   seek(wkey)
   if found()
      ? b.nombre
      ??dctipo at 33
      ??dcnro  at 37
      ??numero at 47
      ??catego at 56
      wlin=wlin+1
    endif  
      select 2
      skip
*   endif      
enddo
set printer off
set device to screen
close all
read
clear
return

procedure titulos
eject
?'LISTADO DE PROFESIONALES CON NRO.DE DOCUMENTOS ERRONEOS'
?
?'NOMBRE DEL PROFESIONAL         TIPO   NUMERO    MATR. CAT.'
?
wlin=4
return