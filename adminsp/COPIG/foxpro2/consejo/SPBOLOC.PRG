procedure spboloc
*borra localidades = que departamentos
@04,01 clear to 23,78
@04,28 say 'LIMPIEZA DE LOCALIDADES '
select 2
use spprofe index spprofe
set safety off
wfecha=date()
set exclusive off
whabi=' '
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 2
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         do arma
         select 2
         skip
      enddo
   endif   
@04,01 clear to 23,78
close all
return

procedure arma
@10, 10 say nombre
wlocal=0
if locali = 11 or locali=15 or locali=16 or locali =17
   replace locali with wlocal
else
   if locali = 39 or locali=40 or locali=42 or locali=43 or locali=46
      replace locali with wlocal
   else
      if locali=48 or locali=49 or locali=53 or locali=56 or locali=59
         replace locali with wlocal
      else
         if locali=60 or locali=61 or locali=68 or locali=91
            replace locali with wlocal
         endif   
      endif   
   endif
endif   
return