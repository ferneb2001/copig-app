procedure spalnmp
* listado de Estado de notificaciones a Empresas
set talk off
@04,01 clear to 23,78
@04,25 say 'ESTADO DE NOTIFICACIONES A EMPRESAS'
wop=1
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   wfecha={  /  /  }
   wfechb={  /  /  }
   @06,10 say 'Fecha vencimiento inicial: '
   @08,10 say 'Fecha vencimiento final  : '
   @06,40 get wfecha
   @08,40 get wfechb
   read
   set printer to lpt1
   set console off
   set printer on
   set device to printer
   delete file spinfvto.idx
   USE SPEMPRES
   index on emfevto to spinfvto
   use spempres index spinfvto
   fila = 1
   do cabeza
   do while .not. eof()
      if emfevto >= wfecha and emfevto <= wfechb
         if fila = 66 
            eject
            do cabeza
            fila = 1
            loop
         endif
         ? emmatr     at 1
         ?? emcate    at 8
         ?? emdeta    at 11
         ?? emfecha   at 38
         ?? emfevto   at 47
         ?? emnunot   at  58 pict '9999999'
         ?? emfecum   at 67
         fila = fila+1
      endif   
      skip
*      fila = fila + 1
   enddo
   eject
   set device to screen
   set printer to
endif   
close all
@04,01 clear to 23,78

procedure cabeza
? ' ESTADO DE NOTIFICACIONES A EMPRESAS' AT 12
? ' -----------------------------------' AT 12
? ' '
? 'MATRIC.CAT. MOTIVO   ' AT 1
?? 'F.ORIGEN F.VENCIM    N.NOTA   F.CUMPLIDO  ' AT 38
return   
   