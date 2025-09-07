procedure spacnmp
* Consulta de Estado de notificaciones a Empresas
set talk off
@04,01 clear to 23,78
@04,25 say 'ESTADO DE NOTIFICACIONES A EMPRESAS'
wop=1
@23,30 get wop pict '@*H \<Salir;\<Consulta' size 1,1
read
if wop=2
   wfinal="n"
   do while wfinal = "n"
      wfecha={  /  /  }
      wfechb={  /  /  }
      @06,1 say 'Fecha vencimiento inicial: '
      @06,40 say 'Fecha vencimiento final  : '
      @06,28 get wfecha
      @06,68 get wfechb
      read
*   set printer to lpt1
*   set console off
*   set printer on
*   set device to printer
      delete file spinfvto.idx
      USE SPEMPRES
      index on emfevto to spinfvto
      use spempres index spinfvto
      fila = 10
      go top
      do cabeza
      do while .not. eof()
         if emfevto >= wfecha and emfevto <= wfechb
            if fila = 22 
 *              eject
               do cabeza
               fila = 10
               loop
            endif
            @fila,1 say emmatr  
            @fila,8 say emcate 
            @fila,11 say emdeta 
            @fila,38 say emfecha 
            @fila,47 say emfevto 
            @fila,58 say emnunot  pict '9999999'
            @fila,67 say emfecum 
            fila = fila+1
         endif   
         skip
*         fila = fila + 1
      enddo
*   eject
      wop1=1
      @23,01 clear to 23,78
      @23,30 get wop1 pict '@*H \<Salir;\<Otra consulta' size 1,1
      read
      if wop1=1
         wfinal="s"
      endif
      set device to screen
   enddo   
*   set printer to
endif   
close all
@04,01 clear to 23,78

procedure cabeza
@07,12 say ' ESTADO DE NOTIFICACIONES A EMPRESAS' 
@08,12 say ' -----------------------------------' 
@09,01 say 'MATRIC.CAT. MOTIVO                  F.ORIGEN F.VENCIM    N.NOTA   F.CUMPLIDO  '
return   
   