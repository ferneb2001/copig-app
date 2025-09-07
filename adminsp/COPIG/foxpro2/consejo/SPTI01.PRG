PROCEDURE SPTI01
SET TALK OFF
SET PRINTER TO lpt1
set console off
set printer on
SET DEVICE TO PRINTer 
USE SPTITU ORDER TITULO
fila=1
do cabeza
do while .not. eof()
   if fila = 66
      eject
      do cabeza
      fila = 1
      loop
   endif
   ? titulo at 4
   ?? titdesc at 10
   ?? titplur at 43
   skip
   fila = fila + 1
enddo
eject
set device to screen
set printer to
close all
procedure cabeza
? " CODIGO     DESCRIPCION "
?? "TITULO PLURAL " AT 45
