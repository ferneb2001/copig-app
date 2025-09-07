procedure spald
* listado de departamentos
set talk off
set printer to lpt1
set console off
set printer on
set device to printer
use spdpto order dpto
fila = 1
do cabeza
do while .not. eof()
   if fila = 66 
      eject
      do cabeza
      fila = 1
      loop
   endif
   ? dpto at 5
   ?? nombre at 12
   ?? cpost  at 30
   ?? prov at 41
   skip
   fila = fila + 1
enddo
eject
set device to screen
set printer to
close all
procedure cabeza
? 'CONSEJO PROFESIONAL DE INGENIEROS,AGRIM.Y GEOL. MZA.' AT 1
? ' LISTADO DE DEPARTAMENTOS' AT 12
? ' ------------------------' AT 12
? ' '
? ' CODIGO DESCRIPCION' AT 3
?? 'COD.POSTAL PROVINCIA' AT 27
   
   