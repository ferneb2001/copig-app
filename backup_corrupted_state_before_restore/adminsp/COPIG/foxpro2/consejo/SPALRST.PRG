procedure spalrst
* listado de Restriccione y/o deudas 
set talk off
@04,01 clear to 23,78
@04,25 say 'LISTADO DE RESTRICCIONES Y/O DEUDAS'
wop2=1
@06,05 get wop2 pict '@*H \<Todas;\<Canceladas;\<Sin cancelar' size 1,1
read
wop=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   use sprestri index sprestnu
   fila = 1
   ??? CHR(27)+CHR(15)
   do cabeza
   do while .not. eof()
      if fila = 66 
         eject
         do cabeza
         fila = 1
         loop
      endif
      wsig=0
      if wop2 = 1
      	 wsig=1
      else
         if wop2 = 2
            if restrotr > 0
               wsig=1
            else
               wsig=0
            endif
         else
            if wop2 = 3
               if restrotr = 0
                  wsig = 1
               else
                  wsig = 0
               endif   
            endif   
         endif      
      endif
      if wsig = 1 	 
         ? matric at 5
         ?? catego at 12
         ?? restrtipo at 15
         ?? observac  at 26
         ?? restforig at 53
         ?? restimpo at  63 pict '99999.99'
         ?? restrotr at 73
         ?? restfactu at 75 
         ?? restfpago at 84
         fila = fila + 1
       endif
       skip  
   enddo
   ???CHR(27)+CHR(18)
   eject
   set device to screen
   set printer to
endif   
close all

procedure cabeza
? ' LISTADO DE RESTRICCIONES Y/O DEUDAS' AT 12
? ' -----------------------------------' AT 12
? ' '
? ' MATRIC.CAT. MOTIVO   ' AT 3
?? '   DESCRIPCION           FECHA OR. IMPORTE EST. FECHA VTO. F.PAGO ' AT 27
return   
   