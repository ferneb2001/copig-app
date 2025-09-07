procedure spald
* listado de departamentos
set talk off
@04,01 clear to 23,78
@04,28 say 'LISTADO DE DEPARTAMENTOS'
WOP=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   use spdpto order dpto
   fila = 1
   do cabeza
   do while .not. eof()
      if fila = 64 
         eject
         do cabeza
         fila = 1
         loop
      endif
*      IF DPTO > 0 AND DPTO < 19
         ? dpto at 5
         ?? nombre at 12
         ?? cpost  at 30
         ?? prov at 41
         FILA = fila+1
*      ENDIF
      skip
*      fila = fila + 1
   enddo
   eject
   set device to screen
   set printer to
endif
@04,01 clear to 23,78
close all
procedure cabeza
? 'CONSEJO PROFESIONAL DE INGENIEROS y GEOLOGOS DE MZA.' AT 1
? ' LISTADO DE DEPARTAMENTOS' AT 12
? ' ------------------------' AT 12
? ' '
? ' CODIGO DESCRIPCION' AT 3
?? 'COD.POSTAL PROVINCIA' AT 27
?  
RETURN 
   