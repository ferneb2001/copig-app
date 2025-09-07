procedure spaln
* listado de Entidades Educativas
set talk off
@04,01 clear to 23,78
@04,25 say 'LISTADO DE ENTIDADES EDUCATIVAS'
wop=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   use spente order codigo
   fila = 1
   do cabeza
   do while .not. eof()
      if fila = 66 
         eject
         do cabeza
         fila = 1
         loop
      endif
      ? codigo at 5
      ?? nombre at 12
 *    ?? cpost  at 30
 *    ?? prov at 41
      skip
      fila = fila + 1
   enddo
   eject
   set device to screen
   set printer to
endif   
close all

procedure cabeza
? ' LISTADO DE ENTIDADES EDUCATIVAS' AT 12
? ' -------------------------------' AT 12
? ' '
? ' CODIGO    DESCRIPCION' AT 3
?
*?? 'COD.POSTAL PROVINCIA' AT 27
return   
   