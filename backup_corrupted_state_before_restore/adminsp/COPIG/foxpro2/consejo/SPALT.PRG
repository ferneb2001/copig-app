PROCEDURE SPalt
*  Listado de Titulos
SET TALK OFF
@04,01 clear to 23,78
@04,31 say 'LISTADO DE TITULOS'
wop=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
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
      IF TITULO = '301' OR TITULO = '701' OR TITULO = '702'
          WOP=2
      ELSE	
         ? titulo at 2
         ?? TIPADRON AT 7
         ?? titdesc at 10
         ?? titplur at 42
      ENDIF
         skip
         fila = fila + 1
   enddo
   eject
   set device to screen
   set printer to
endif
close all
procedure cabeza
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS DE MENDOZA'
? 'MITRE 617 - 1.Piso  -  5500 - MENDOZA'
? " CODIGO P. DESCRIPCION "
?? "TITULO PLURAL " AT 45
?
return