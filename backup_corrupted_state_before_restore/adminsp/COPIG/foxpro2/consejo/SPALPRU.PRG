procedure spalpru
* listado de departamentos (Pruebas de impresion)
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE DEPARTAMENTOS'
WOP=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
*   _PDSETUP='IMP-LASER'
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   use spdpto order dpto
*   ???chr(27)+chr(107)+chr(48)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(69)
?' §¦ '
*???chr(27)+chr(71)
   fila = 1
   do cabeza
   do while .not. eof()
      if fila = 64 
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
*   ??? chr(27)+chr(120)+chr(48)
*   ??? chr(27)+chr(50)
   ???chr(27)+chr(70)
   ???chr(27)+chr(72)
   eject
   set device to screen
   set printer to
endif
@04,01 clear to 23,78
close all
procedure cabeza
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MZA.' AT 1
? ' LISTADO DE DEPARTAMENTOS' AT 12
? ' ------------------------' AT 12
? ' '
? ' CODIGO DESCRIPCION' AT 3
?? 'COD.POSTAL PROVINCIA' AT 27
?   
   