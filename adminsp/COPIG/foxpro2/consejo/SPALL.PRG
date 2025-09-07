procedure spall
* listado de localidades

set talk off
set printer to
set console on
set device to screen
@04,01 clear to 23,78
wop=0
@ 4,29 say 'LISTADO DE LOCALIDADES'
@23,25 get wop pict '@*H \<Salir;\<Numerico;\<Alfabetico';
       size 1,1
read       
if wop<>1
   do case
      case wop = 2
         use splocal order cod
      case wop = 3
         use splocal order nombre
   endcase
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   fila = 1
   do cabeza
   do while .not. eof()
      if fila = 62 
         eject
         do cabeza
         fila = 1
         loop
      endif
      ? cod  at 5
      ?? nombre at 12
      ?? cpost  at 30
      ?? dpto at 43
      skip
      fila = fila + 1
   enddo
   eject
   set device to screen
   set printer to
endif   
@04,01 clear to 23,78   
close all
procedure cabeza
? ' CONSEJO PROFESIONAL DE INGENIEROS, AGRIM. Y GEOLOGOS - MZA.' AT 1
? ' LISTADO DE LOCALIDADES' AT 11
? ' ----------------------' AT 11
? ' '
? ' CODIGO DESCRIPCION' AT 3
?? 'COD.POSTAL DEPARTAMENTO' AT 27
?   
   